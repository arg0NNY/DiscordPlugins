/**
 * @name PasscodeLock
 * @author arg0NNY
 * @authorLink https://github.com/arg0NNY/DiscordPlugins
 * @invite M8DBtcZjXD
 * @version 1.2.2
 * @description Protect your Discord with a passcode.
 * @website https://github.com/arg0NNY/DiscordPlugins/tree/master/PasscodeLock
 * @source https://github.com/arg0NNY/DiscordPlugins/blob/master/PasscodeLock/PasscodeLock.plugin.js
 * @updateUrl https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/PasscodeLock/PasscodeLock.plugin.js
 */

module.exports = (() => {
    const config = {
        "info": {
            "name": "PasscodeLock",
            "authors": [
                {
                    "name": "arg0NNY",
                    "discord_id": '224538553944637440',
                    "github_username": 'arg0NNY'
                }
            ],
            "version": "1.2.2",
            "description": "Protect your Discord with a passcode.",
            github: "https://github.com/arg0NNY/DiscordPlugins/tree/master/PasscodeLock",
            github_raw: "https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/PasscodeLock/PasscodeLock.plugin.js"
        },
        "changelog": [
            {
                "type": "fixed",
                "title": "Fixed",
                "items": [
                    "Fixed unnecessary 'Lock Discord' button under 'X' button in the sidebar chat.",
                ]
            },
            {
                "type": "improved",
                "title": "Improvements",
                "items": [
                    "Lock shortcut now works with any non-latin layout.",
                ]
            }
        ]
    };

    const electron = require("electron");
    const request = require("request");
    const fs = require("fs");
    const path = require("path");
    const crypto = require("crypto")

    return !global.ZeresPluginLibrary ? class {
        constructor() {
            this._config = config;
        }

        getName() { return config.info.name; }
        getAuthor() { return config.info.authors.map(a => a.name).join(", "); }
        getDescription() { return config.info.description; }
        getVersion() { return config.info.version; }

        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    request.get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return electron.shell.openExternal("https://betterdiscord.app/Download?id=9");
                        await new Promise(r => fs.writeFile(path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() { }
        stop() { }
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Api) => {
            const {
                Patcher,
                DiscordModules,
                WebpackModules,
                PluginUtilities,
                Settings,
                DOMTools,
                Toasts,
                ReactComponents
            } = Api;

            const {
                React,
                ReactDOM,
                ModalActions,
                ConfirmationModal
            } = DiscordModules;

            const Selectors = {
                Chat: WebpackModules.getByProps("title", "chat"),
                HeaderBar: WebpackModules.getByProps("iconWrapper", "clickable"),
                App: WebpackModules.getByProps('mobileApp'),
                Modals: WebpackModules.getByProps('root', 'small')
            };

            const Gifs = {
                LOCKED_INTRO: 'https://i.imgur.com/8cw428V.gif',
                LOCKED_SHAKE: 'https://i.imgur.com/PCJ1EoO.gif',
                SETTINGS_INTRO: 'https://i.imgur.com/4N8QZ2o.gif',
                SETTINGS_ROTATE: 'https://i.imgur.com/v74rA2L.gif',
                EDIT_INTRO: 'https://i.imgur.com/NrhmZym.gif',
                EDIT_ACTION: 'https://i.imgur.com/VL5UV1X.gif'
            };
            Object.keys(Gifs).forEach(k => fetch(Gifs[k])); // Preload gifs

            const buildAnimatedIcon = (src, width = 24, height = width) => {
                const icon = document.createElement('img');
                icon.alt = 'PCLIcon';
                icon.width = width;
                icon.height = height;
                icon.src = src;
                icon.style.opacity = '0';

                setTimeout(() => {
                    icon.style.opacity = '1';
                    icon.src = src;
                }, 0);

                return icon;
            };

            const hashCode = string => {
                let salt = crypto.randomBytes(128).toString('base64');
                let iterations = 10000;
                let hash = crypto.pbkdf2Sync(string, salt, iterations, 512, 'sha512').toString('hex');

                return { hash, salt, iterations };
            };

            const hashCheck = ({ string, salt, iterations }, hashed) => crypto.pbkdf2Sync(string, salt, iterations, 512, 'sha512').toString('hex') === hashed;

            const HeaderBar = WebpackModules.getModule(m => m.default?.displayName === 'HeaderBar');
            const Button = WebpackModules.getByProps("BorderColors", "Colors");
            const ButtonColors = WebpackModules.getByProps('ButtonLink').ButtonColors;
            const Tooltip = WebpackModules.getModule(m => m.default?.displayName === 'Tooltip');
            const Keybinds = WebpackModules.getByProps('combokeys', 'disable');
            const Markdown = WebpackModules.getModule(m => m.displayName === "Markdown" && m.rules);

            const { getVoiceChannelId } = WebpackModules.getByProps("getVoiceChannelId");

            const BG_TRANSITION = 350;
            const MAX_CODE_LENGTH = 15;
            var CODE_LENGTH = 4;

            const getContainer = () => document.querySelector(`.${Selectors.App.app}`);
            const getContainerAsync = async () => {
                return getContainer() ?? await new Promise(res => {
                    let container;
                    const intId = setInterval(() => {
                        if (!(container = getContainer())) return;
                        clearInterval(intId);
                        res(container);
                    });
                })
            };

            class PasscodeBtn extends React.Component {
                render() {
                    return React.createElement(
                        'div',
                        {
                            className: 'PCL--btn PCL--animate',
                            onClick: this.props.click ? () => this.props.click(this.props.number) : () => {},
                            id: `PCLBtn-${this.props.code ?? this.props.number}`
                        },
                        (!this.props.children ? [
                            React.createElement(
                                'div',
                                { className: 'PCL--btn-number' },
                                this.props.number
                            ),
                            React.createElement(
                                'div',
                                { className: 'PCL--btn-dec' },
                                this.props.dec
                            )
                        ] : this.props.children)
                    );
                }
            }

            class PasscodeLocker extends React.Component {
                static Types = {
                    DEFAULT: 'default',
                    SETTINGS: 'settings',
                    EDITOR: 'editor'
                }

                get e() { return document.getElementById(this.props.plugin.getName()); }
                get bg() { return this.e.querySelector('.PCL--layout-bg'); }
                get button() { return this.props.button ?? document.getElementById('PCLButton'); }
                get buttonPos() { return this.button && document.body.contains(this.button) ? this.button.getBoundingClientRect() : { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }; }
                get containerPos() { return getContainer().getBoundingClientRect() }

                backspaceButton() {
                    return React.createElement(PasscodeBtn, {
                        click: this.codeBackspace,
                        code: 'Backspace',
                        children: React.createElement(
                            'svg',
                            {
                                xmlns: 'http://www.w3.org/2000/svg',
                                viewBox: '0 0 24 24',
                                height: '22',
                                width: '22'
                            },
                            React.createElement('path', { fill: 'currentColor', d: 'M22 3H7c-.69 0-1.23.35-1.59.88L.37 11.45c-.22.34-.22.77 0 1.11l5.04 7.56c.36.52.9.88 1.59.88h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3.7 13.3c-.39.39-1.02.39-1.41 0L14 13.41l-2.89 2.89c-.39.39-1.02.39-1.41 0-.39-.39-.39-1.02 0-1.41L12.59 12 9.7 9.11c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0L14 10.59l2.89-2.89c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41L15.41 12l2.89 2.89c.38.38.38 1.02 0 1.41z' })
                        )
                    })
                }

                buildCancelButton() {
                    if([PasscodeLocker.Types.SETTINGS, PasscodeLocker.Types.EDITOR].includes(this.props.type)) {
                        return React.createElement(PasscodeBtn, {
                            click: () => this.unlock(false),
                            code: 'Escape',
                            children: React.createElement(
                                'svg',
                                {
                                    xmlns: 'http://www.w3.org/2000/svg',
                                    viewBox: '0 0 24 24',
                                    height: '30',
                                    width: '30'
                                },
                                React.createElement('path', { fill: 'currentColor', d: 'M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42-.39-.39-1.02-.39-1.41 0l-6.59 6.59c-.39.39-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z' })
                            )
                        });
                    } else if (CODE_LENGTH === -1) {
                        return this.backspaceButton();
                    } else {
                        return React.createElement('div')
                    }
                }

                buildBackspaceButton() {
                    if([PasscodeLocker.Types.SETTINGS, PasscodeLocker.Types.EDITOR].includes(this.props.type) || CODE_LENGTH !== -1) {
                        return this.backspaceButton();
                    } else {
                        return this.buildEnterButton();
                    }
                }

                buildEnterButton() {
                    return React.createElement(PasscodeBtn, {
                        click: () => this.codeAccept(),
                        code: 'Enter',
                        children: React.createElement(
                            'svg',
                            {
                                xmlns: 'http://www.w3.org/2000/svg',
                                viewBox: '0 0 48 48',
                                height: '34',
                                width: '34'
                            },
                            React.createElement('path', { fill: 'none', d: 'M0 0h24v24H0V0z' }),
                            React.createElement('path', { fill: 'currentColor', d: 'M21.05 28.55 16.15 23.65Q15.7 23.2 15.05 23.2Q14.4 23.2 13.9 23.7Q13.4 24.2 13.4 24.85Q13.4 25.5 13.9 25.95L20 32.05Q20.45 32.5 21.05 32.5Q21.65 32.5 22.1 32.05L34.1 20.05Q34.55 19.6 34.525 18.95Q34.5 18.3 34.05 17.85Q33.6 17.35 32.925 17.35Q32.25 17.35 31.75 17.85ZM24 44Q19.75 44 16.1 42.475Q12.45 40.95 9.75 38.25Q7.05 35.55 5.525 31.9Q4 28.25 4 24Q4 19.8 5.525 16.15Q7.05 12.5 9.75 9.8Q12.45 7.1 16.1 5.55Q19.75 4 24 4Q28.2 4 31.85 5.55Q35.5 7.1 38.2 9.8Q40.9 12.5 42.45 16.15Q44 19.8 44 24Q44 28.25 42.45 31.9Q40.9 35.55 38.2 38.25Q35.5 40.95 31.85 42.475Q28.2 44 24 44ZM24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24ZM24 41Q31.25 41 36.125 36.125Q41 31.25 41 24Q41 16.75 36.125 11.875Q31.25 7 24 7Q16.75 7 11.875 11.875Q7 16.75 7 24Q7 31.25 11.875 36.125Q16.75 41 24 41Z' })
                        )
                    })
                }

                calculatePosition() {
                    const buttonPos = this.buttonPos;
                    return {
                        top: buttonPos.top + buttonPos.height/2 - this.containerPos.top,
                        left: buttonPos.left + buttonPos.width/2 - this.containerPos.left
                    };
                }

                calculateRadius(pos) {
                    pos = pos ?? this.calculatePosition();

                    return Math.hypot(Math.max(pos.top, this.containerPos.height - pos.top), Math.max(pos.left, this.containerPos.width - pos.left));
                }

                constructor(props) {
                    super(props);

                    this.state = {
                        code: '',
                        confirm: false
                    };

                    this.codeAppend = (num) => {
                        if(this.state.code.length >= MAX_CODE_LENGTH) {
                            const dots = document.querySelector(".PCL--dots");
                            if(!dots.classList.contains("PCL--dots--limit")) {
                                dots.classList.add("PCL--dots--limit");
                                setTimeout(() => {
                                    dots?.classList.remove("PCL--dots--limit");
                                }, 250);
                            }
                            return;
                        }
                        this.setState({
                            code: this.state.code + num.toString()
                        });

                        setTimeout(() => {
                            if(CODE_LENGTH === this.state.code.length)
                                this.codeAccept();
                        });
                    }

                    this.codeAccept = () => {
                        if (this.props.type === PasscodeLocker.Types.EDITOR) {
                            if (!this.state.confirm) {
                                this.newCode = this.state.code;
                                this.setState({
                                    code: '',
                                    confirm: true
                                });
                                if (this.icon) this.icon.src = Gifs.EDIT_ACTION;
                            }
                            else {
                                if (this.state.code !== this.newCode) this.fail();
                                else this.unlock(true);
                            }
                        }
                        else this.codeSubmit();
                    }

                    this.codeBackspace = () => {
                        this.setState({
                            code: this.state.code.slice(0, -1)
                        });
                    }
                }

                codeSubmit() {
                    if (hashCheck({
                        string: this.state.code,
                        salt: this.props.plugin.settings.salt,
                        iterations: this.props.plugin.settings.iterations
                    }, this.props.plugin.settings.hash))
                        this.unlock();
                    else
                        this.fail();
                }

                fail() {
                    this.setState({
                        code: '',
                    });

                    if (this.icon) this.icon.src = {
                        [PasscodeLocker.Types.DEFAULT]: Gifs.LOCKED_SHAKE,
                        [PasscodeLocker.Types.SETTINGS]: Gifs.SETTINGS_ROTATE,
                        [PasscodeLocker.Types.EDITOR]: Gifs.EDIT_ACTION
                    }[this.props.type];
                }

                unlock(success = true) {
                    this.e.querySelector('.PCL--controls').style.opacity = 0;
                    this.bgCircle(false);

                    setTimeout(() => this.bg.style.transition = null, 50);
                    setTimeout(() => {
                        this.bg.style.transform = null;

                        const listener = () => {
                            this.bg.removeEventListener('webkitTransitionEnd', listener);

                            setTimeout(() => {
                                this.props.plugin.unlock(true);
                                if (success && this.props.onSuccess) return this.props.onSuccess(this);
                                if (success && this.props.type === PasscodeLocker.Types.EDITOR) return this.props.plugin.updateCode(this.newCode);
                            }, 50);
                        };
                        this.bg.addEventListener('webkitTransitionEnd', listener);
                    }, 100);
                }

                bgCircle(smooth = true) {
                    const bg = this.bg;
                    const pos = this.calculatePosition();
                    const d = this.calculateRadius(pos) * 2;

                    if (smooth) bg.style.transition = null;
                    bg.style.top = pos.top + 'px';
                    bg.style.left = pos.left + 'px';
                    bg.style.width = d + 'px';
                    bg.style.height = d + 'px';
                    bg.style.transform = 'translate(-50%, -50%) scale(1)';
                    bg.style.borderRadius = '50%';
                }

                bgFill() {
                    const bg = this.bg;
                    bg.style.transition = 'none';
                    bg.style.top = 0;
                    bg.style.left = 0;
                    bg.style.width = '100%';
                    bg.style.height = '100%';
                    bg.style.borderRadius = 0;
                    bg.style.transform = 'scale(1)';
                }

                componentWillUnmount() {
                    window.removeEventListener('keyup', this.keyUpListener);
                    window.removeEventListener('keydown', this.disableKeys, true);
                    if (this.props.type === PasscodeLocker.Types.DEFAULT) this.enableNotifications();
                }

                componentDidMount() {
                    document.onkeydown = e => {
                        if (this.props.plugin.settings.highlightButtons) document.getElementById(`PCLBtn-${e.key}`)?.classList.add('PCL--btn-active');

                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    };

                    this.keyUpListener = e => {
                        if (this.props.plugin.settings.highlightButtons) document.getElementById(`PCLBtn-${e.key}`)?.classList.remove('PCL--btn-active');

                        if (!isNaN(+e.key) && e.key !== ' ') this.codeAppend(+e.key);
                        if (e.key === 'Backspace') this.codeBackspace();
                        if (e.key === 'Escape' && this.props.type !== PasscodeLocker.Types.DEFAULT) this.unlock(false);
                    };
                    window.addEventListener('keyup', this.keyUpListener);

                    // Manage notifications
                    if (this.props.type === PasscodeLocker.Types.DEFAULT) this.enableNotifications = this.props.plugin.settings.hideNotifications
                        ? Patcher.instead(DiscordModules.NotificationModule, 'showNotification', () => false)
                        : Patcher.before(DiscordModules.NotificationModule, 'showNotification', (self, params) => {
                            params[0] = Gifs.LOCKED_SHAKE;
                            params[1] = 'New notification';
                            params[2] = 'You have 1 new notification!';
                            if (params[4].onClick) params[4].onClick = () => {};
                        });

                    // Props to https://github.com/253ping
                    this.disableKeys = e => {
                        // Didn't know that there is more than one shortcut.
                        if(e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "C" )) {e.preventDefault(); e.stopPropagation();}
                        else if(e.ctrlKey) {e.preventDefault(); e.stopPropagation(); return false;} // Prevent all sorts of shortcuts like bold, italic, underline, strikethrough, ...
                        else if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            if (this.props.plugin.settings.highlightButtons) document.getElementById('PCLBtn-Enter')?.classList.add('PCL--btn-active');
                            this.codeAccept();
                            return false;
                        }
                    }
                    window.addEventListener('keydown', this.disableKeys, true);

                    setTimeout(() => {
                        this.bgCircle();

                        const i = setInterval(() => {
                            const bgPos = this.bg.getBoundingClientRect();
                            const top = bgPos.top + bgPos.height/2;
                            const left = bgPos.left + bgPos.width/2;
                            const radius = bgPos.width/2;

                            Array.from(document.querySelectorAll('.PCL--animate:not(.PCL--animated)')).forEach(e => {
                                const pos = e.getBoundingClientRect();
                                const centerTop = pos.top + pos.height/2;
                                const centerLeft = pos.left + pos.width/2;

                                if (Math.hypot(Math.abs(centerTop - top), Math.abs(centerLeft - left)) <= radius) {
                                    if (e.className.includes('PCL--icon')) {
                                        e.appendChild(
                                            this.icon = buildAnimatedIcon({
                                                [PasscodeLocker.Types.DEFAULT]: Gifs.LOCKED_INTRO,
                                                [PasscodeLocker.Types.SETTINGS]: Gifs.SETTINGS_INTRO,
                                                [PasscodeLocker.Types.EDITOR]: Gifs.EDIT_INTRO
                                            }[this.props.type], 64)
                                        );

                                        e.classList.remove('PCL--animate');
                                    }
                                    else e.classList.add('PCL--animated');
                                }
                            });
                        }, 10);

                        const listener = () => {
                            this.bg.removeEventListener('webkitTransitionEnd', listener);

                            clearInterval(i);
                            Array.from(document.querySelectorAll('.PCL--animate')).forEach(e => e.classList.remove('PCL--animate', 'PCL--animated'));
                            this.bgFill();
                        };
                        this.bg.addEventListener('webkitTransitionEnd', listener);
                    }, 100);
                }

                render() {
                    const btns = ['', 'ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ'].map(
                        (dec, i) => React.createElement(
                            PasscodeBtn,
                            {
                                number: i + 1,
                                dec,
                                click: this.codeAppend
                            }
                        )
                    );

                    const titleText = () => {
                        if (this.props.type === PasscodeLocker.Types.EDITOR) return !this.state.confirm ? 'Enter your new passcode' : 'Re-enter your passcode';
                        return 'Enter your Discord passcode';
                    };

                    return React.createElement(
                        'div',
                        {
                            id: this.props.plugin.getName(),
                            className: 'PCL--layout'
                        },
                        [
                            React.createElement(
                                'div',
                                { className: 'PCL--layout-bg' }
                            ),
                            React.createElement(
                                'div',
                                { className: 'PCL--controls' },
                                [
                                    React.createElement(
                                        'div',
                                        { className: 'PCL--header' },
                                        [
                                            React.createElement(
                                                'div',
                                                { className: 'PCL--icon PCL--animate' }
                                            ),
                                            React.createElement(
                                                'div',
                                                { className: 'PCL--title PCL--animate' },
                                                titleText()
                                            ),
                                            React.createElement(
                                                'div',
                                                { className: 'PCL--dots PCL--animate' },
                                                Array(MAX_CODE_LENGTH).fill(null).map((_, i) => {
                                                    return React.createElement(
                                                        'div',
                                                        { className: `PCL--dot ${i < this.state.code.length ? 'PCL--dot-active' : ''}` }
                                                    );
                                                })
                                            )
                                        ]
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'PCL--buttons' },
                                        [
                                            React.createElement('div', { className: 'PCL--divider PCL--animate' }),
                                            ...btns,
                                            this.buildCancelButton(),
                                            React.createElement(PasscodeBtn, { number: 0, dec: '+', click: this.codeAppend }),
                                            this.buildBackspaceButton(),
                                            ...([PasscodeLocker.Types.SETTINGS, PasscodeLocker.Types.EDITOR].includes(this.props.type) && CODE_LENGTH === -1 ?
                                                [React.createElement('div'), this.buildEnterButton()]
                                                : [])
                                        ]
                                    ),
                                ]
                            )
                        ]
                    )
                }
            }

            const KeybindListener = new class {

                constructor() {
                    this.pressedKeys = [];
                    this.listening = false;
                    this.listeners = [];
                }

                start() {
                    this.pressedKeys = [];

                    this.keyDownListener = e => {
                        if (e.repeat) return;

                        const key = e.code.slice(0, -1) === 'Key' ? e.code.slice(-1).toLowerCase() : e.key;
                        if (!this.pressedKeys.includes(key)) this.pressedKeys.push(key);
                        this.processPressedKeys();
                    }
                    this.keyUpListener = e => this.pressedKeys = this.pressedKeys.filter(key => key !== e.key)
                    window.addEventListener('keydown', this.keyDownListener);
                    window.addEventListener('keyup', this.keyUpListener);

                    this.listening = true;
                }

                stop(clearListeners = false) {
                    if (clearListeners) this.unlistenAll();

                    window.removeEventListener('keydown', this.keyDownListener);
                    window.removeEventListener('keyup', this.keyUpListener);

                    this.listening = false;
                }

                processPressedKeys() {
                    this.listeners.forEach(({ keybind, handler }) => {
                        if (keybind.sort().join('|').toLowerCase() === this.pressedKeys.sort().join('|').toLowerCase()) handler(keybind);
                    });
                }

                listen(keybind, handler) {
                    this.listeners.push({ keybind, handler });
                }

                unlisten(keybind, handler = null) {
                    this.listeners.splice(this.listeners.findIndex(l => l.keybind.join('|').toLowerCase() === keybind.join('|').toLowerCase() && (handler === null || l.handler === handler)), 1);
                }

                unlistenAll() {
                    this.listeners = [];
                }

                updateKeybinds(currentKeybind, newKeybind) {
                    this.listeners.forEach(l => { if (l.keybind.join('|').toLowerCase() === currentKeybind.join('|').toLowerCase()) l.keybind = newKeybind; });
                }

            }();

            return class PasscodeLock extends Plugin {
                static Types = {
                    FOUR_DIGIT: '4-digit',
                    SIX_DIGIT: '6-digit',
                    CUSTOM_NUMERIC: 'custom-numeric',
                    CUSTON_ALPHANUMERIC: 'custom-alphanumeric'
                }

                getIconPath() {
                    return 'M19,10h-1V7.69c0-3.16-2.57-5.72-5.72-5.72H11.8C8.66,1.97,6,4.62,6,7.77V10H5c-0.55,0-1,0.45-1,1v8c0,1.65,1.35,3,3,3h10c1.65,0,3-1.35,3-3v-8C20,10.45,19.55,10,19,10z M8,7.77c0-2.06,1.74-3.8,3.8-3.8h0.48c2.05,0,3.72,1.67,3.72,3.72V10H8V7.77z M13.06,16.06c-0.02,0.02-0.04,0.04-0.06,0.05V18c0,0.55-0.45,1-1,1s-1-0.45-1-1v-1.89c-0.02-0.01-0.04-0.03-0.06-0.05C10.66,15.78,10.5,15.4,10.5,15c0-0.1,0.01-0.2,0.03-0.29c0.02-0.1,0.05-0.19,0.08-0.28c0.04-0.09,0.09-0.18,0.14-0.26c0.06-0.09,0.12-0.16,0.19-0.23c0.35-0.35,0.86-0.51,1.35-0.41c0.1,0.02,0.19,0.05,0.28,0.08c0.09,0.04,0.18,0.09,0.26,0.14c0.08,0.06,0.16,0.12,0.23,0.19s0.13,0.14,0.19,0.23c0.05,0.08,0.1,0.17,0.13,0.26c0.04,0.09,0.07,0.18,0.09,0.28C13.49,14.8,13.5,14.9,13.5,15C13.5,15.4,13.34,15.77,13.06,16.06z';
                }

                buildStaticIcon() {
                    return React.createElement(
                        'svg',
                        {
                            xmlns: 'http://www.w3.org/2000/svg',
                            viewBox: '0 0 24 24',
                            height: '24',
                            width: '24',
                            className: Selectors.HeaderBar.icon
                        },
                        React.createElement('path', { fill: 'currentColor', d: this.getIconPath() })
                    );
                }

                async lock({ button, type, onSuccess } = {}) {
                    type = type ?? PasscodeLocker.Types.DEFAULT;

                    if (this.locked) return;
                    if (this.settings.hash === -1 && type !== PasscodeLocker.Types.EDITOR) return Toasts.error('Please first set up the passcode in the plugin settings.');

                    this.unlock();

                    this.element = document.createElement('div');
                    (await getContainerAsync()).appendChild(this.element);
                    ReactDOM.render(React.createElement(PasscodeLocker, { plugin: this, button, type, onSuccess }), this.element);
                    this.disableInteractions();

                    this.locked = true;
                    if (type === PasscodeLocker.Types.DEFAULT) BdApi.setData(this.getName(), 'locked', true);
                }

                unlock(safeUnlock = false) {
                    this.enableInteractions();
                    this.locked = false;
                    if (safeUnlock) BdApi.setData(this.getName(), 'locked', false);

                    if (!this.element) return;

                    ReactDOM.unmountComponentAtNode(this.element);
                    this.element.remove();
                }

                disableInteractions() {
                    Keybinds.disable();
                }

                enableInteractions() {
                    Keybinds.enable();
                    document.onkeydown = null;
                }

                onLockKeybind() {
                    this.lock({ button: document.body });
                }

                onStart() {
                    this.injectCSS();
                    this.patchHeaderBar();
                    this.patchSettingsButton();
                    this.enableAutolock();

                    KeybindListener.start();
                    this.keybindSetting = this.checkKeybindLoad(this.settings.keybind);
                    this.keybind = this.keybindSetting.split('+');
                    KeybindListener.listen(this.keybind, () => this.onLockKeybind());

                    if (this.settings.lockOnStartup || BdApi.getData(this.getName(), 'locked')) this.lock();
                }

                async patchHeaderBar() {
                    Patcher.after(HeaderBar, "default", (self, _, value) => {
                        const children = value.props?.children?.props?.children;
                        const toolbar = children ? children[children.length - 1].props?.children?.props?.children : null;
                        if (!Array.isArray(toolbar) || toolbar.length < 2 || toolbar.some((e => e?.key === this.getName()))) return;

                        toolbar.splice(-2, 0, React.createElement(
                            Tooltip.default,
                            {
                                text: "Lock Discord",
                                key: this.getName(),
                                position: "bottom"
                            },
                            props => React.createElement(
                                Button,
                                Object.assign({}, props, {
                                    id: 'PCLButton',
                                    size: Button.Sizes.NONE,
                                    look: Button.Looks.BLANK,
                                    innerClassName: `${Selectors.HeaderBar.iconWrapper} ${Selectors.HeaderBar.clickable}`,
                                    onClick: () => this.lock()
                                }),
                                this.buildStaticIcon()
                            )
                        ));
                    });

                    (await ReactComponents.getComponentByName('HeaderBarContainer', `.${Selectors.Chat.title}`)).forceUpdateAll();
                }

                injectCSS() {
                    PluginUtilities.addStyle(this.getName()+'-style', `
.PCL--layout {
    --main-color: #dcddde;

    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 9999999;
    overflow: hidden;
    color: var(--main-color);
}

.PCL--layout-bg {
    position: absolute;
    top: 50%;
    left: 50%;
    height: 0;
    width: 0;
    transform: translate(-50%, -50%) scale(0);
    background-color: rgba(0, 0, 0, .5);  
    backdrop-filter: blur(30px);
    transition: ${BG_TRANSITION / 1000}s transform linear;
    border-radius: 50%;
}

.PCL--controls {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: stretch;
    user-select: none;
    transition: .3s opacity;
}

.PCL--header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 22px;
}

.PCL--icon {
    height: 64px;
    width: 64px;
}

.PCL--title {
    margin: 25px 0 25px;
}

.PCL--dots {
    display: flex;
    height: 8px;
    width: 100%;
    justify-content: center;
}

@keyframes PCL--limit {
    0% {transform: translateX(10px);}
    25% {transform: translateX(0px);}
    50% {transform: translateX(-10px);}
    100% {transform: translateX(0px);}
}

.PCL--dots.PCL--dots--limit {
    animation-name: PCL--limit;
    animation-duration: 250ms;
}

.PCL--dot {
    position: relative;
    height: 8px;
    width: 0;
    /*animation-name: PCL--dot--anim;
    animation-duration: 250ms;*/
    transition: .25s opacity, .25s transform, .25s width, .25s margin;
    opacity: 0;
    transform: scale(.5);
}
.PCL--dot::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    height: 8px;
    width: 8px;
    border-radius: 50%;
    background: var(--main-color);
}
.PCL--dot-active {
    opacity: 1;
    transform: scale(1);
    width: 8px;
    margin: 0 5px;
}

.PCL--buttons {
    display: grid;
    grid-template-columns: repeat(3, 60px);
    grid-auto-rows: 60px;
    gap: 30px;
    padding: 40px 20px;
    position: relative;
}

.PCL--divider {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background: rgba(255, 255, 255, .1);
}

.PCL--btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 50%;
    box-sizing: border-box;
    background-clip: padding-box;
    border: 1px solid transparent;
    transition: 1s border-color, .3s background-color;
}

.PCL--btn:active, .PCL--btn-active {
    transition: none;
    border-color: rgba(255, 255, 255, .15);
    background-color: rgba(255, 255, 255, .15);
}

.PCL--btn-number {
    font-size: 32px;
    font-weight: 500;
    line-height: 36px;
}

.PCL--btn-dec {
    height: 11px;
    font-size: 10px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, .3);
}

.PCL--animate {
    transition: .3s transform, .3s opacity;
    transition-timing-function: cubic-bezier(0.33, 1, 0.68, 1);
    transform: scale(.7);
    opacity: 0;
}

.PCL--animated {
    transform: scale(1);
    opacity: 1;
}
`);
                }

                clearCSS() {
                    PluginUtilities.removeStyle(this.getName()+'-style');
                }

                onStop() {
                    this.unlock();
                    this.clearCSS();
                    this.disconnectObserver();
                    this.unpatchSettingsButton();
                    this.disableAutolock();
                    KeybindListener.stop(true);
                    Patcher.unpatchAll();
                }

                patchSettingsButton() {
                    const selector = `#${this.getName()}-card`;
                    const callback = e => {
                        let node;
                        if ((node = e?.querySelector(`#${this.getName()}-card .bd-controls > .bd-button:first-child`))) {
                            const patchedNode = node.cloneNode(true);
                            patchedNode.onclick = () => {
                                if (!BdApi.Plugins.isEnabled(this.getName())) return;

                                if (this.settings.hash === -1) return node.click();

                                this.lock({
                                    button: patchedNode,
                                    type: PasscodeLocker.Types.SETTINGS,
                                    onSuccess: () => node.click()
                                });
                            };

                            patchedNode.classList.remove('bd-button-disabled');
                            node.before(patchedNode);
                            node.style.display = 'none';

                            this.settingsButton = { node, patchedNode };
                        }
                    };
                    callback(document.querySelector(selector));

                    this.observer = new DOMTools.DOMObserver();
                    this.observer.subscribeToQuerySelector(e => callback(e.addedNodes[0]), selector, this, false);
                }

                unpatchSettingsButton() {
                    if (this.settingsButton?.node) this.settingsButton.node.style.display = null;
                    if (this.settingsButton?.patchedNode) this.settingsButton.patchedNode.remove();
                }

                disconnectObserver() {
                    this.observer.unsubscribeAll();
                }

                updateCode(code) {
                    const hashed = hashCode(code)
                    this.settings.hash = hashed.hash;
                    this.settings.salt = hashed.salt;
                    this.settings.iterations = hashed.iterations;
                    this.saveSettings();

                    Toasts.success('Passcode has been updated!');
                }

                enableAutolock() {
                    this.autolockBlurListener = e => {
                        if (this.settings.autolock === false || getVoiceChannelId() !== null) return;

                        this.autolockTimeout = setTimeout(() => {
                            this.onLockKeybind();
                        }, this.settings.autolock * 1000);
                    };
                    this.autolockFocusListener = e => {
                        clearTimeout(this.autolockTimeout);
                    };

                    window.addEventListener('blur', this.autolockBlurListener);
                    window.addEventListener('focus', this.autolockFocusListener);
                }

                disableAutolock() {
                    clearTimeout(this.autolockTimeout);
                    window.removeEventListener('blur', this.autolockBlurListener);
                    window.removeEventListener('focus', this.autolockFocusListener);
                }

                getSettingsPanel() {
                    if (!this.KeybindRecorder) {
                        this.KeybindRecorder = BdApi.findModuleByDisplayName("KeybindRecorder");
                        this.KeybindStore = BdApi.findModuleByProps("toCombo");
                    }

                    const Buttons = (...props) => {
                        class Panel extends React.Component {
                            render() {
                                let buttons = [];
                                props.forEach(p => {
                                    buttons.push(
                                        React.createElement(Button, {
                                            style: {
                                                display: 'inline-flex',
                                                marginRight: '10px',
                                                ...(p.icon ? {
                                                    paddingLeft: '10px',
                                                    paddingRight: '12px',
                                                } : {})
                                            },
                                            ...p
                                        })
                                    );
                                });

                                return React.createElement(
                                    'div',
                                    {},
                                    buttons
                                );
                            }
                        }

                        return Panel;
                    }

                    const ButtonIcon = (name, text) => {
                        const icon = {
                            edit: `M3 17.46v3.04c0 .28.22.5.5.5h3.04c.13 0 .26-.05.35-.15L17.81 9.94l-3.75-3.75L3.15 17.1c-.1.1-.15.22-.15.36zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z`,
                            lock: this.getIconPath()
                        }[name];

                        return React.createElement(
                            'div',
                            {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center'
                                }
                            },
                            [
                                React.createElement(
                                    'svg',
                                    {
                                        xmlns: 'http://www.w3.org/2000/svg',
                                        height: '20',
                                        viewBox: '0 0 24 24',
                                        width: '20'
                                    },
                                    React.createElement('path', { d: icon, fill: 'white' })
                                ),
                                React.createElement('span', { style: { marginLeft: '5px' } }, text)
                            ]
                        );
                    };

                    const settingsNode = Settings.SettingPanel.build(
                        () => {
                            this.saveSettings.bind(this);
                        },

                        new Settings.SettingField(null, null, () => {}, Buttons(
                            {
                                children: ButtonIcon('edit', 'Edit Passcode'),
                                icon: true,
                                color: Button.Colors.BRAND,
                                size: Button.Sizes.SMALL,
                                id: `PCLSettingsEditButton`,
                                onClick: () => this.lock({
                                    button: document.getElementById('PCLSettingsEditButton'),
                                    type: PasscodeLocker.Types.EDITOR
                                })
                            },
                            {
                                children: ButtonIcon('lock', 'Lock Discord'),
                                icon: true,
                                color: Button.Colors.TRANSPARENT,
                                size: Button.Sizes.SMALL,
                                id: `PCLSettingsLockButton`,
                                onClick: () => this.lock({
                                    button: document.getElementById('PCLSettingsLockButton')
                                })
                            },
                        )),

                        // Inspired by iOS code options
                        new Settings.RadioGroup('Code type', null, this.settings.codeType, [
                            {
                                name: '4-Digit Numeric Code',
                                value: PasscodeLock.Types.FOUR_DIGIT
                            },
                            {
                                name: '6-Digit Numeric Code',
                                value: PasscodeLock.Types.SIX_DIGIT
                            },
                            {
                                name: 'Custom Numeric Code',
                                value: PasscodeLock.Types.CUSTOM_NUMERIC
                            },
                            // TODO: implement
                            // {
                            //     name: 'Custom Alphanumeric Code',
                            //     value: PasscodeLock.Types.CUSTON_ALPHANUMERIC
                            // },
                        ], e => {
                            this.settings.codeType = e;
                            this.saveSettings();

                            this.settings.hash = -1;
                            Toasts.warning('Your passcode has been reset. Set it up again.');

                            CODE_LENGTH = (this.settings.codeType === PasscodeLock.Types.FOUR_DIGIT ? 4 :
                                this.settings.codeType === PasscodeLock.Types.SIX_DIGIT ? 6 : -1);
                        }),

                        new Settings.RadioGroup('Auto-lock', 'Require passcode if away for a time.', this.settings.autolock, [
                            {
                                name: 'Disabled',
                                value: false
                            },
                            {
                                name: 'in 1 minute',
                                value: 60
                            },
                            {
                                name: 'in 5 minutes',
                                value: 60 * 5
                            },
                            {
                                name: 'in 1 hour',
                                value: 60 * 60
                            },
                            {
                                name: 'in 5 hours',
                                value: 60 * 60 * 5
                            },
                        ], e => {
                            this.settings.autolock = e;
                            this.saveSettings();
                        }),

                        new Settings.SettingField('Lock Keybind', null, () => {}, props => {
                            return React.createElement(this.KeybindRecorder, {
                                defaultValue: this.KeybindStore.toCombo(this.keybindSetting.replace("control", "ctrl")),
                                onChange: (e) => {
                                    const keybindString = this.KeybindStore.toString(e).toLowerCase().replace("ctrl", "control");

                                    KeybindListener.unlisten(this.keybind);
                                    this.keybindSetting = keybindString;
                                    this.keybind = keybindString.split('+');
                                    KeybindListener.listen(this.keybind, () => this.onLockKeybind());

                                    this.settings.keybind = this.keybindSetting;
                                    this.saveSettings();
                                }
                            })
                        }),

                        new Settings.Switch('Always lock on startup', 'Locks Discord at startup, even if it wasn\'t locked before Discord shut down', this.settings.lockOnStartup, e => {
                            this.settings.lockOnStartup = e;
                            this.saveSettings();
                        }),

                        new Settings.Switch('Highlight keyboard typing', 'Highlights buttons on screen when typing passcode from the keyboard', this.settings.highlightButtons, e => {
                            this.settings.highlightButtons = e;
                            this.saveSettings();
                        }),

                        new Settings.RadioGroup('Notifications when locked', null, this.settings.hideNotifications, [
                            {
                                name: 'Disable notifications',
                                value: true
                            },
                            {
                                name: 'Censor notifications',
                                value: false
                            },
                        ], e => {
                            this.settings.hideNotifications = e;
                            this.saveSettings();
                        }),

                    );

                    DOMTools.onMountChange(settingsNode, () => KeybindListener.stop(), true);
                    DOMTools.onMountChange(settingsNode, () => KeybindListener.start(), false);

                    return settingsNode;
                }

                // Props to https://github.com/Farcrada (https://github.com/Farcrada/DiscordPlugins/blob/ed87e32c0e25960b3c76428b8929a9c6f5a1c20d/Hide-Channels/HideChannels.plugin.js)
                checkKeybindLoad(keybindToLoad, defaultKeybind = "control+l") {
                    defaultKeybind = defaultKeybind.toLowerCase().replace("ctrl", "control");

                    //If no keybind
                    if (!keybindToLoad)
                        return defaultKeybind;

                    //Error sensitive, so just plump it into a try-catch
                    try {
                        //If it's already a string, double check it
                        if (typeof (keybindToLoad) === typeof (defaultKeybind)) {
                            keybindToLoad = keybindToLoad.toLowerCase().replace("control", "ctrl");
                            //Does it go into a combo? (i.e.: is it the correct format?)
                            if (this.KeybindStore.toCombo(keybindToLoad))
                                return keybindToLoad.replace("ctrl", "control");
                            else
                                return defaultKeybind;
                        }
                        else
                            //If it's not a string, check if it's a combo.
                        if (this.KeybindStore.toString(keybindToLoad))
                            return this.KeybindStore.toString(keybindToLoad).toLowerCase().replace("ctrl", "control");
                    }
                    catch (e) { return defaultKeybind; }
                }

                constructor() {
                    super();

                    this.defaultSettings = {
                        codeType: PasscodeLock.Types.FOUR_DIGIT,
                        hash: -1,
                        salt: null,
                        iterations: null,
                        autolock: false,
                        keybind: "control+l",
                        highlightButtons: false,
                        lockOnStartup: true,
                        hideNotifications: false
                    };

                    this.settings = this.loadSettings(this.defaultSettings);

                    if (this.settings.code) {
                        delete this.settings.code;
                        ['hash', 'salt', 'iterations'].forEach(k => this.settings[k] = this.defaultSettings[k]);
                        this.saveSettings();

                        Toasts.warning('Your passcode has been reset due to security update. Set it up again in the settings.');
                    }
                    if (typeof this.settings.keybind !== 'string') {
                        this.settings.keybind = this.defaultSettings.keybind;
                        this.saveSettings();
                    }

                    CODE_LENGTH = (this.settings.codeType === PasscodeLock.Types.FOUR_DIGIT ? 4 :
                        this.settings.codeType === PasscodeLock.Types.SIX_DIGIT ? 6 : -1);

                    if (!BdApi.getData(this.getName(), 'hasShownAttention')) this.showAttentionModal();
                }

                showAttentionModal() {
                    const that = this;
                    class Modal extends React.Component {
                        render() {
                            return React.createElement(ConfirmationModal, Object.assign({
                                    header: `${that.getName()}`,
                                    confirmButtonColor: ButtonColors.BRAND,
                                    className: Selectors.Modals.small,
                                    confirmText: 'Got it',
                                    cancelText: null,
                                    style: {
                                        lineHeight: '1.4em',
                                    }
                                }, this.props),
                                [
                                    React.createElement(
                                        'div',
                                        {
                                            style: {
                                                lineHeight: '1.4em',
                                            }
                                        },
                                        React.createElement(
                                            Markdown,
                                            null,
                                            `### ATTENTION PLEASE!  
  
This plugin **DOES** prevent people who are casually snooping, **BUT** if anyone has access to the computer with Discord logged in and is actually determined to get access to it, **there's nothing PasscodeLock can do** within the scope of a BD plugin to prevent them.
\nThe real solution from a security perspective is just... lock or log out of your computer when you're not at it. *(c) Qwerasd*`
                                        )
                                    )
                                ]
                            );
                        }
                    }

                    ModalActions.openModal(props => {
                        return React.createElement(Modal, props)
                    });

                    BdApi.setData(this.getName(), 'hasShownAttention', true);
                }
            }
        }

        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();