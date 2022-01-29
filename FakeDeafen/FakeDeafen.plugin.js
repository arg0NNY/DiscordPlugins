/**
 * @name FakeDeafen
 * @author arg0NNY
 * @authorId 224538553944637440
 * @version 1.0.0
 * @description Listen or even talk in a voice chat while being self-deafened.
 * @website https://github.com/arg0NNY/DiscordPlugins/tree/master/FakeDeafen
 * @source https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/FakeDeafen/FakeDeafen.plugin.js
 * @updateUrl https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/FakeDeafen/FakeDeafen.plugin.js
*/

module.exports = (() => {
    const config = {
        "info": {
            "name": "FakeDeafen",
            "authors": [
                {
                    "name": "arg0NNY",
                    "discord_id": '224538553944637440',
  					"github_username": 'arg0NNY'
                }
            ],
            "version": "1.0.0",
            "description": "Listen or even talk in a voice chat while being self-deafened.",
            github: "https://github.com/arg0NNY/DiscordPlugins/tree/master/FakeDeafen",
  			github_raw: "https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/FakeDeafen/FakeDeafen.plugin.js"
        },
        "defaultConfig": [
            {
                type: 'switch',
                id: 'accountButton',
                name: 'Enable toggle button',
                note: 'Shows button near to Mute and Deaf buttons to toggle Fake Mute/Deafen.',
                value: true
            },
            {
                type: 'switch',
                id: 'sounds',
                name: 'Enable toggle sounds',
                note: 'Plays sound when Fake Mute/Deafen is toggled.',
                value: true
            },
        ]
    };

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
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
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
                WebpackModules,
                ReactComponents,
                Utilities,
                ContextMenu,
                Toasts,
                DiscordModules,
                DiscordSelectors
            } = Api;

            const {
                React,
                VoiceInfo,
                SoundModule
            } = DiscordModules;

            let toggleButton;

            const Sounds = {
                ENABLE: 'ptt_start',
                DISABLE: 'ptt_stop'
            };

            const ChannelManager = WebpackModules.getModule(m => m.default?.disconnect && m.default?.selectChannel).default;
            const AudioDeviceMenu = WebpackModules.getModule(m => m.default?.displayName === 'AudioDeviceMenu');
            const PanelButton = WebpackModules.getByDisplayName('PanelButton');

            class PanelButtonComponent extends React.Component {
                constructor(props) {
                    super(props);
                    this.state = {fixated: props.fixated};
                }

                componentDidMount() {
                    toggleButton = this;
                }

                render() {
                    return React.createElement(PanelButton, {
                        icon: (i) => {
                            return React.createElement(
                                'svg',
                                {
                                    height: i.height,
                                    width: i.width,
                                    viewBox: '0 0 20 20'
                                },
                                React.createElement('path', {
                                    fill: 'currentColor',
                                    d: this.state.fixated
                                        ? 'M5.312 4.566C4.19 5.685-.715 12.681 3.523 16.918c4.236 4.238 11.23-.668 12.354-1.789c1.121-1.119-.335-4.395-3.252-7.312c-2.919-2.919-6.191-4.376-7.313-3.251zm9.264 9.59c-.332.328-2.895-.457-5.364-2.928c-2.467-2.469-3.256-5.033-2.924-5.363c.328-.332 2.894.457 5.36 2.926c2.471 2.467 3.258 5.033 2.928 5.365zm.858-8.174l1.904-1.906a.999.999 0 1 0-1.414-1.414L14.02 4.568a.999.999 0 1 0 1.414 1.414zM11.124 3.8a1 1 0 0 0 1.36-.388l1.087-1.926a1 1 0 0 0-1.748-.972L10.736 2.44a1 1 0 0 0 .388 1.36zm8.748 3.016a.999.999 0 0 0-1.36-.388l-1.94 1.061a1 1 0 1 0 .972 1.748l1.94-1.061a1 1 0 0 0 .388-1.36z'
                                        : 'M14.201 9.194c1.389 1.883 1.818 3.517 1.559 3.777c-.26.258-1.893-.17-3.778-1.559l-5.526 5.527c4.186 1.838 9.627-2.018 10.605-2.996c.925-.922.097-3.309-1.856-5.754l-1.004 1.005zM8.667 7.941c-1.099-1.658-1.431-3.023-1.194-3.26c.233-.234 1.6.096 3.257 1.197l1.023-1.025C9.489 3.179 7.358 2.519 6.496 3.384c-.928.926-4.448 5.877-3.231 9.957l5.402-5.4zm9.854-6.463a.999.999 0 0 0-1.414 0L1.478 17.108a.999.999 0 1 0 1.414 1.414l15.629-15.63a.999.999 0 0 0 0-1.414z'
                                })
                            );
                        },
                        tooltipText: `${this.state.fixated ? 'Disable' : 'Enable'} Fake Mute/Deafen`,
                        onClick: this.props.onClick
                    });
                }
            }

            return class FakeDeafen extends Plugin {
                onStart() {
                    this.fixated = false;
                    this.patches();
                    this.panelButton();
                }

                allowed() {
                    return VoiceInfo.isMute() || VoiceInfo.isDeaf();
                }

                async panelButton() {
                    const Account = await ZLibrary.ReactComponents.getComponentByName('Account', DiscordSelectors.AccountDetails.container.value);

                    Patcher.after(Account.component.prototype, 'render', (self, _, value) => {
                        if (!this.settings.accountButton) return;

                        Utilities.getNestedProp(value, 'props.children.2.props.children').unshift(this.buildPanelButton())
                    });
                }

                buildPanelButton() {
                    return React.createElement(PanelButtonComponent, {
                        fixated: this.fixated,
                        onClick: (e) => {this.toggleFixate()}
                    });
                }

                patches() {
                    this.patchAudioDeviceMenu();
                    this.patchVoiceChannelActions();
                }

                patchVoiceChannelActions() {
                    const preventStop = () => {
                        if (!this.fixated) return;

                        this.toggleFixate(false);
                        BdApi.showToast('Fake Mute/Deafen has been automatically disabled', {type: 'warn'});
                    }

                    Patcher.before(ChannelManager, 'disconnect', (self, _) => {preventStop()});
                    Patcher.before(ChannelManager, 'selectVoiceChannel', (self, _) => {preventStop()});
                }

                patchAudioDeviceMenu() {
                    Patcher.after(AudioDeviceMenu, 'default', (self, _, value) => {
                        value.props.children.props.children.push(this.buildContextMenuOptions());
                    });
                }

                buildContextMenuOptions() {
                    return ContextMenu.buildMenuChildren([{
                         type: "group",
                         items: [
                             {
                                 type: "toggle",
                                 label: "Fake Mute/Deafen",
                                 active: this.fixated,
                                 disabled: !this.fixated && !this.allowed(),
                                 action: () => {this.toggleFixate()}
                             },
                        ]
                    }]);;
                }

                toggleFixate(status = null) {
                    if ((!this.fixated || status === true) && !this.allowed()) return BdApi.showToast('Mute or Deaf yourself first', {type: 'danger'});

                    this.fixated = status === null ? !this.fixated : status;
                    if (this.settings.sounds) SoundModule.playSound(this.fixated ? Sounds.ENABLE : Sounds.DISABLE, .4);
                    if (toggleButton) toggleButton.setState({fixated: this.fixated});

                    if (this.fixated) {

                        // Thx to abbe for finding this exploit
                        // Code taken from https://github.com/abbe/discord-fake-deafen/blob/master/code.js
                        let text = new TextDecoder("utf-8");

                        WebSocket.prototype.original = WebSocket.prototype.send;
                        WebSocket.prototype.send = function(data) {
                            if (Object.prototype.toString.call(data) === "[object ArrayBuffer]") {
                                if (text.decode(data).includes("self_deaf")) {
                                    data = data.replace('"self_mute":false', 'NiceOneDiscord');
                                }
                            }
                            WebSocket.prototype.original.apply(this, [data]);
                        }
                    }
                    else WebSocket.prototype.send = WebSocket.prototype.original;
                }

                onStop() {
                    WebSocket.prototype.send = WebSocket.prototype.original;
                    Patcher.unpatchAll();
                }

                getSettingsPanel() {
                    return this.buildSettingsPanel().getElement();
                }
            }
        }

        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
