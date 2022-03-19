/**
 * @name SyncedBD
 * @author arg0NNY
 * @authorLink https://github.com/arg0NNY/DiscordPlugins
 * @invite M8DBtcZjXD
 * @version 1.3.0
 * @description Syncs your BetterDiscord settings, official themes and plugins with their configs between BD installations linked to your Discord account. Allows you to automatically import all your BD configs after a clean installation. Plug-n-play it is!
 * @website https://github.com/arg0NNY/DiscordPlugins/tree/master/SyncedBD
 * @source https://github.com/arg0NNY/DiscordPlugins/blob/master/SyncedBD/SyncedBD.plugin.js
 * @updateUrl https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/SyncedBD/SyncedBD.plugin.js
 */

module.exports = (() => {
    const config = {
        "info": {
            "name": "SyncedBD",
            "authors": [
                {
                    "name": "arg0NNY",
                    "discord_id": '224538553944637440',
                    "github_username": 'arg0NNY'
                }
            ],
            "version": "1.3.0",
            "description": "Syncs your BetterDiscord settings, official themes and plugins with their configs between BD installations linked to your Discord account. Allows you to automatically import all your BD configs after a clean installation. Plug-n-play it is!",
            github: "https://github.com/arg0NNY/DiscordPlugins/tree/master/SyncedBD",
            github_raw: "https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/SyncedBD/SyncedBD.plugin.js"
        },
        "changelog": [
            {
                "type": "improved",
                "title": "Improvements",
                "items": [
                    "Added icons to buttons in plugin settings.",
                    "Redesigned the configuration preview. Now you can view the exported config in a much more understandable form."
                ]
            },
            {
                "type": "fixed",
                "title": "Fixed",
                "items": [
                    "Fixed inconsistent requests to cloud service api.",
                    "Fixed config conflicts after import."
                ]
            }
        ]
    };

    const electron = require("electron");
    const request = require("request");
    const fs = require("fs");
    const path = require("path");

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
                WebpackModules,
                DiscordModules,
                Patcher,
                Logger,
                Modals,
                Settings,
                Toasts,
                Utilities
            } = Api;

            const {
                UserNoteActions,
                UserInfoStore,
                React,
                ReactDOM,
                ModalActions,
                DiscordConstants,
                ConfirmationModal
            } = DiscordModules;

            const {
                Endpoints
            } = DiscordConstants;

            const Selectors = {
                Modals: WebpackModules.getByProps('root', 'small'),
                Forms: WebpackModules.getByProps('formText', 'modeDisabled'),
                FormInput: WebpackModules.getByProps('disabled', 'note')
            };

            const Markdown = WebpackModules.getModule(m => m.displayName === "Markdown" && m.rules);
            const DiscordApi = WebpackModules.getByProps('get', 'getAPIBaseURL');
            const UserPopoutBody = WebpackModules.getModule(m => m.default?.displayName === 'UserPopoutBody');
            const Button = WebpackModules.getByProps('ButtonLink');

            const PLUGIN_NAME = config.info.name;
            const PLUGIN_ICON = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAACUlBMVEUAAAAAAAAA//////9/f39VVVVVqqoAv78/f38AmZlVf38AttpIbW0An79UcY1MZn9idYlbbX9bf5FVd3dmd4hPb39heZFcf4tVan9VdH9ScHhee4pceIZcf4ZSbnxgfIlXa3hUb3xefI5ceYtTbnlhfI1Ra3pdeolUbHpge4xffYpTbHkAvtUAu9IAo7lee4pTbHpTbnhUb3hTbXpTbHlgfopefItUbHhTbHhefolgfIpUbXtUbXhgfYpffIlffItgfYpUbHpUbHkAvNRVbHlefIsApbpUbHkAu9QApbkAu9MApLkApLhgfItUbXlgfYpUbXpgfItffIpgfItgfYtUbHgAvdQAu9NTbHkAo7lffYpffYthfYtgfIpgfYpUbHlffYpTbXlTbXhUbHlUbXlTbXlUbXgAu9QApboAu9MBvdVLz+FM0OEApLgTwNY6ytxgfIsApLgBpLoQqL0zscFBtMRDtcRUbXlgfIpUbHlgfItgfYpUbXlUbXhgfYpUbHlTbHhTbXhTbXlffYpUbXlgfIpTbXlUbXlgfIpffIpTbXlUbXlgfYsAu9RTbXkApLlUbHhUbHlgfItgfIpTbXhffItTbHlgfYpTbXhgfItTbXlffIpUbHhgfIpgfYpTbHhffItUbHhUbXhUbXkApLkAvNQCpbkCvdQEpboFvdUSqbwUwdcXqr0bq74bw9gfxNkgrL4hrb8irb8jrb8kxdomxtonxtsorsApx9sssMEuyNwxscEyyd05y94/tMNBtcRDtcRIz+BLz+FN0OFUbXlgfYvK916PAAAApHRSTlMAAQEBAgMDBAQFBgcHCAkKDQ4ODw8QFRYYGCIjJCQlJSYnKywuLzI0Njo7PUNERkZJTE5PUlVWV1lZWltdcnNzdHV2d3h5enx9gIGEhYeKio6Pk5SUlpeYmZqbm5ucnJ2dnp+goKGjp6qqqqqqq6urrK6urq6urrO2ub6/wcLMzs/Pz9LU19nZ6err6+zu7u/v7+/x8/X29vf5+vr7/Pz9/f7+/sTYbeAAAAHkSURBVHjafdMDfx1BFAXwE9t2bdu2krqxk9ptbNu2atvKvd+rmXm/WRT5P+7uGc9A57cluaRlbKC+MGajt7i2Ot46G7qZqd0ksNAREwKrE8xroXhE9dNowc7Fgc72/gu35g5zz9FTbAiEl9NQ8gxoQmIHmA2BeXVUtQBGVteNgfBayvGCkWhfD3iUU44rTPayMRBFlV4w2zHMQtssOb7+oQWYTholw8Jt2b7oK5lndy91gYFf94hlfE4Hm8anTExpOOAAyXe5DbZQPqQj49KEdAjSSV6HFNoJ6ZYxcBXSdo5BKS2GdOfVAxV4+O4SpEVciBYKhHT3x/fPr58+efb8w9dfk5chBXA9xshZBaRJQQUceUAP3DYGrqnAIJopCNLNl99U4Ofbi3oTxaqTN8bvPXrx/uOXT28e35+4oHcymXapgD5MFdjO8dhApyEd/sdE5fEm2K7ww/+mOmy4yxeSvljnM8/sXqIWK54TMJ35g30R4ndOOwlje2DmWcGRENaTxX6YOGdzmTuENSSdszaXz+aaEEirSciyMbdfwdVzYbGKBNPBCY0b5LIQdbWSiNKP9dJIvjh6jgGLtuUNc1+kO5QVRBl2CE/s1A9vV1IEdMGNaXbi12dzYlHz2GB9Yfwmw/z9Bg1OEhGXRQFTAAAAAElFTkSuQmCC`;


            const rawGithubURL = url => url.replace('https://github.com', 'https://raw.githubusercontent.com').replace('blob/', '');

            const crypt = (salt, text) => {
                const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
                const byteHex = (n) => ("0" + Number(n).toString(16)).slice(-2);
                const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);
                return text
                    .split("")
                    .map(textToChars)
                    .map(applySaltToChar)
                    .map(byteHex)
                    .join("");
            };

            const decrypt = (salt, encoded) => {
                const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
                const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);
                return encoded
                    .match(/.{1,2}/g)
                    .map((hex) => parseInt(hex, 16))
                    .map(applySaltToChar)
                    .map((charCode) => String.fromCharCode(charCode))
                    .join("");
            };

            const makeSalt = (length) => {
                let result = '';
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                const charactersLength = characters.length;
                for ( let i = 0; i < length; i++ ) {
                    result += characters.charAt(Math.floor(Math.random() * charactersLength));
                }
                return result;
            }


            const SITE_API_BASE_URL = "https://api.betterdiscord.app/v1";
            const DPASTE_API_BASE_URL = "https://dpaste.com";

            const UserNote = new class {

                async get(id = UserInfoStore.getId()) {
                    try {
                        return (await DiscordApi.get({ url: Endpoints.NOTE(id) })).body.note;
                    }
                    catch (e) {
                        return "";
                    }
                }

                set(note, id = UserInfoStore.getId()) {
                    UserNoteActions.updateNote(id, note);
                }

            }();

            const Storage = new class {

                save(content) {
                    return new Promise(res => {
                        fetch(`${DPASTE_API_BASE_URL}/api/v2/`, {
                            method: 'POST',
                            headers: { "Content-Type": "application/x-www-form-urlencoded" },
                            body: "expiry_days=365&content=" + encodeURIComponent(content)
                        })
                            .then(response => response.text())
                            .then(body => {
                                res(body.split('/').pop().trim());
                            })
                            .catch(error => {
                                res(Logger.err('Failed to save config to the cloud.'));
                            });
                    });
                }

                get(token) {
                    return new Promise(res => {
                        fetch(`${DPASTE_API_BASE_URL}/${token}.txt`)
                            .then(response => response.text())
                            .then(body => res(body))
                            .catch(error => res(Logger.err('Failed to get config from the cloud.')));
                    });
                }

            }();

            const SiteApi = new class {

                constructor() {
                    this._cached = new class {

                        constructor() {
                            this.addons = [];
                        }

                        get plugins() {
                            return this.addons.filter(a => a.type === 'plugin');
                        }

                        get themes() {
                            return this.addons.filter(a => a.type === 'theme');
                        }

                    }();
                    this._fetchedAt = null;
                }

                async fetchAddons() {
                    return new Promise(res => request.get(`${SITE_API_BASE_URL}/store/addons`, (error, response, body) => {
                        const fail = () => res(Logger.err('Failed to get official addons.'));

                        try {
                            if (error) return fail();
                            res(this._cached.addons = JSON.parse(body));
                            this._fetchedAt = Date.now();
                        }
                        catch (e) {
                            return fail();
                        }
                    }));
                }

                async fetchAll() {
                    await this.fetchAddons();
                    return this._cached;
                }

                async get() {
                    if (Math.abs(Date.now() - this._fetchedAt) > 30 * 60 * 1000) await this.fetchAll();

                    return this._cached;
                }

            }();

            const Config = new class {

                async get() {
                    return {
                        ...this.getSettings(),
                        ...(await this.getAddons())
                    }
                }

                getPlugin(name) {
                    return new Promise(res => {
                        const plugin = BdApi.Plugins.get(name);
                        if (!plugin) return res(null);

                        fs.readFile(
                            path.join(BdApi.Plugins.folder, `${plugin.name}.config.json`),
                            (error, data) => {
                                if (error) return res(null);

                                const config = JSON.parse(data);
                                Object.keys(config).forEach(key => {
                                    if (['currentVersionInfo', 'changeLogs'].includes(key) || !BdApi.getData(plugin.name, key)) delete config[key];
                                });

                                res(config);
                            }
                        );
                    });
                }

                getSettings() {
                    const output = {};

                    const map = (e, ...stack) => {
                        const obj = {};
                        e.forEach(s => {
                            if (s.settings) return obj[s.id] = map(s.settings, ...stack, s.id);
                            if (typeof s.value !== 'boolean') return;

                            obj[s.id] = BdApi.isSettingEnabled(...stack, s.id);
                        });
                        return obj;
                    };

                    BdApi.settings.forEach(s => {
                        output[s.id] = map(s.settings, s.id);
                    });

                    return output;
                }

                async getAddons() {
                    const officialList = await SiteApi.get();
                    return {
                        plugins: await this.getPlugins(officialList.plugins),
                        themes: this.getThemes(officialList.themes),
                    };
                }

                async getPlugins(officialList) {
                    const output = {};
                    const officialNames = officialList.map(p => p.name);

                    for(let p of BdApi.Plugins.getAll()) {
                        if (p.name === PLUGIN_NAME || !officialNames.includes(p.id)) continue;

                        const config = await this.getPlugin(p.id);
                        output[p.id] = {
                            enabled: BdApi.Plugins.isEnabled(p.id),
                            ...(config ? {config} : {})
                        };
                    }

                    return output;
                }

                getThemes(officialList) {
                    const output = {};
                    const officialNames = officialList.map(p => p.name);

                    BdApi.Themes.getAll().forEach(t => {
                        if (!officialNames.includes(t.id)) return;

                        output[t.id] = BdApi.Themes.isEnabled(t.id);
                    });

                    return output;
                }


                async apply(config) {
                    this.applySettings(config);
                    await this.applyAddons(config);
                    await this.applyPluginsConfigs(config);
                    this.applyThemesConfigs(config);
                }

                applySettings(config) {
                    Logger.info('Applying BD settings...');

                    ['settings', 'emotes'].forEach(s => {
                        Object.keys(config[s]).forEach(c => {
                            Object.keys(config[s][c]).forEach(k => {
                                const value = config[s][c][k];
                                if (value === BdApi.isSettingEnabled(s, c, k)) return;

                                (value ? BdApi.enableSetting : BdApi.disableSetting)(s, c, k);
                            });
                        });
                    });
                }

                async applyAddons(config) {
                    Logger.info('Applying addons...');

                    const official = await SiteApi.get();
                    const installed = {
                        plugins: BdApi.Plugins.getAll(),
                        themes: BdApi.Themes.getAll()
                    };

                    for(let type of ['plugins', 'themes']) {
                        const Addons = BdApi[type.charAt(0).toUpperCase() + type.slice(1)];

                        // Installing official
                        for(let name of Object.keys(config[type])) {
                            const officialAddon = official[type].find(i => i.name === name);
                            const localAddon = installed[type].find(i => i.id === name);

                            if (!officialAddon) { Logger.warn(`Cannot find "${name}" ${type.slice(0, -1)} in official ${type} list. Skipping...`); continue; }
                            if (localAddon) continue;

                            Logger.info(`Downloading "${name}" ${type.slice(0, -1)}...`);

                            const result = await new Promise(res => {
                                const url = rawGithubURL(officialAddon.latest_source_url);
                                request.get(url, async (error, response, body) => {
                                    try {
                                        if (error) return res();

                                        await new Promise(res => fs.writeFile(path.join(Addons.folder, url.split('/').pop().trim()), body, res));
                                        res(true);
                                    }
                                    catch (e) {
                                        return res();
                                    }
                                });
                            });
                            if (!result) { Logger.err(`Failed to download "${name}" ${type.slice(0, -1)}.`); continue; }

                            // Waiting for BD to init downloaded plugin
                            await new Promise(res => {
                                const int = setInterval(() => {
                                    if (!Addons.get(name)) return;

                                    clearInterval(int);
                                    res();
                                }, 100);
                            });

                            Logger.info(`Successfully downloaded "${name}" ${type.slice(0, -1)}!`);
                        }

                        // Deleting official
                        for(let item of installed[type]) {
                            if (official[type].find(i => i.name === item.id) && !Object.keys(config[type]).includes(item.id)) {
                                Logger.info(`Deleting "${item.id}" ${type.slice(0, -1)}...`);

                                await new Promise(res => fs.unlink(path.join(Addons.folder, item.filename), res));

                                Logger.info(`Successfully deleted "${item.id}" ${type.slice(0, -1)}!`);
                            }
                        }
                    }
                }

                async applyPluginsConfigs(config) {
                    Logger.info('Applying plugins configs...');

                    for(let name of Object.keys(config.plugins)) {
                        if (name === PLUGIN_NAME) return;

                        const installed = BdApi.Plugins.get(name);
                        if (!installed) { Logger.warn(`Failed to find installed "${name}" plugin. Skipping...`); continue; }

                        const plugin = config.plugins[name];
                        let isEnabled = BdApi.Plugins.isEnabled(name);

                        if (plugin.config && !objectsAreEqual(plugin.config, await this.getPlugin(name))) {
                            Object.keys(plugin.config).forEach(key => BdApi.saveData(installed.name, key, plugin.config[key]));
                            Logger.info(`Applied config for "${name}" plugin.`);

                            if (plugin.enabled && isEnabled) BdApi.Plugins.disable(name) || (isEnabled = false);
                        }

                        if (plugin.enabled && !isEnabled) BdApi.Plugins.enable(name);
                        if (!plugin.enabled && isEnabled) BdApi.Plugins.disable(name);
                    }
                }

                applyThemesConfigs(config) {
                    Logger.info('Applying themes configs...');

                    Object.keys(config.themes).forEach(name => {
                        const installed = BdApi.Themes.get(name);
                        if (!installed) return Logger.warn(`Failed to find installed "${name}" theme. Skipping...`);

                        const value = config.themes[name];
                        if (value === BdApi.Themes.isEnabled(name)) return;
                        (value ? BdApi.Themes.enable : BdApi.Themes.disable)(name);
                    });
                }

            }();

            const Data = new class {

                encode(data, salt = null) {
                    salt = salt ?? makeSalt(20);
                    return {
                        salt,
                        data: crypt(salt, LZString.compressToEncodedURIComponent(JSON.stringify(data)))
                    };
                }

                decode(data, salt) {
                    try {
                        return JSON.parse(LZString.decompressFromEncodedURIComponent(decrypt(salt, data)));
                    }
                    catch (e) {
                        return null;
                    }
                }

                async push(data) {
                    const encoded = this.encode(data);
                    const token = await Storage.save(encoded.data);
                    if (!token) return;

                    UserNote.set(`<SBD:${token}:${encoded.salt}>`);
                    return {
                        token,
                        salt: encoded.salt
                    };
                }

                async pull() {
                    const credentials = (await UserNote.get()).match(/<SBD:([a-zA-Z0-9]+):([a-zA-Z0-9]+)>/u);
                    if (!credentials) return;

                    const token = credentials[1];
                    const salt = credentials[2];
                    let data = await Storage.get(token);
                    if (!data) return;

                    data = this.decode(data, salt);
                    if (!data) return Logger.err('Failed to decode cloud data.');

                    return data;
                }

            }();

            const Loader = new class {

                constructor() {
                    this.style = document.createElement('style');
                    this.style.textContent = `/* BEGIN V2 LOADER */\n/* =============== */\n\n#bd-loading-icon {\n  background-image: url(${PLUGIN_ICON});\n}\n#bd-loading-icon {\n  position: fixed;\n  bottom:5px;\n  right:5px;\n  z-index: 2147483647;\n  display: block;\n  width: 20px;\n  height: 20px;\n  background-size: 100% 100%;\n  animation: bd-loading-animation 1.5s ease-in-out infinite;\n}\n\n@keyframes bd-loading-animation {\n  0% { opacity: 0.05; }\n  50% { opacity: 0.6; }\n  100% { opacity: 0.05; }\n}\n/* =============== */\n/*  END V2 LOADER  */`;

                    this.loader = document.createElement("div");
                    this.loader.id = "bd-loading-icon";
                    this.loader.className = "bd-loaderv2";
                    this.loader.title = "SyncedBD is performing action...";
                }

                show() {
                    Loader.hide();

                    document.body.appendChild(this.style);
                    document.body.appendChild(this.loader);
                }

                hide() {
                    this.style?.remove();
                    this.loader?.remove();
                }

            }();

            return class SyncedBD extends Plugin {
                async onStart() {
                    this.patchUserNote();

                    this.modalId = null;
                    this.previousConfig = null;
                    this._performingAction = null;

                    this.startup();
                }

                startup() {
                    this.syncedAt = Date.now();
                    this.syncInterval = setInterval(() => {
                        if (Math.abs(Date.now() - this.syncedAt) < this.settings.syncInterval * 60 * 1000) return;
                        this.sync();
                    }, 1000);

                    this.performingAction = true;
                    this.startupTimeout = setTimeout(() => {
                        this.performingAction = false;
                        this.sync();
                    }, 20000);
                }

                get performingAction() { return this._performingAction; }
                set performingAction(value) {
                    this._performingAction = value;

                    if (!this.settings.loader) return;
                    if (value) Loader.show();
                    else Loader.hide();
                }

                patchUserNote() {
                    Patcher.after(UserPopoutBody, "default", (self, [{user}], value) => {
                        if (!this.settings.hideUserNote || user.id !== UserInfoStore.getId()) return;
                        value.props.children = value.props.children.filter(i => !i.props?.children?.some(j => j.key === 'note'));
                    });

                    const patchUserModal = UserInfoBase => {
                        Patcher.after(UserInfoBase, "default", (self, [{user}], value) => {
                            if (!this.settings.hideUserNote || user.id !== UserInfoStore.getId()) return;

                            const ModalBody = Utilities.findInTree(value, e => Array.isArray(e?.props?.children) && e.props.children.find(c => c?.type?.displayName === 'ConnectedNote'));
                            if (!ModalBody) return;

                            ModalBody.props.children = ModalBody.props.children.filter(i => i?.type?.displayName !== 'ConnectedNote' && i?.props?.children !== 'Note');
                        });
                    };

                    this.webpackListener = module => {
                        if (module.default?.displayName === 'UserInfoBase') patchUserModal(module);
                    }
                    let module;
                    if ((module = WebpackModules.getModule(m => m.default?.displayName === 'UserInfoBase'))) patchUserModal(module);
                    else WebpackModules.addListener(this.webpackListener);
                }

                async sync() {
                    this.syncedAt = Date.now();

                    if (this.performingAction) return Logger.warn('Synchronization has been cancelled because another action is currently running.');
                    this.performingAction = true;

                    try {
                        Logger.info('Initializing synchronization...');
                        const result = await this._sync();
                        if (result  === true) Logger.info('No changes detected. Synchronization finished.');

                        this.performingAction = false;
                        return result;
                    }
                    catch (e) {
                        this.performingAction = false;
                        return "error";
                    }
                }

                async _sync() {
                    const config = await Config.get();
                    const remoteConfig = await Data.pull();

                    if (!remoteConfig) return await this.push(config); // push config if no remote config

                    if (objectsAreEqual(config, remoteConfig)) return this.appliedConfig(config); // cancel the sync if current config equals remote

                    if (this.previousConfig === null) { // first execution
                        if (!objectsAreEqual(config, remoteConfig)) return this.apply(remoteConfig); // if remote config not equals local config apply remote config
                        // otherwise do nothing
                    }
                    else {
                        const localChanged = !objectsAreEqual(this.previousConfig, config);
                        const remoteChanged = !objectsAreEqual(this.previousConfig, remoteConfig);

                        if (localChanged && remoteChanged) return this.confirm(config, remoteConfig); // if both local and remote configs changed let user choose to push local or apply remote
                        if (localChanged) return await this.push(config); // if only local config changed push current
                        if (remoteChanged) return this.apply(remoteConfig); // if only remote config changed apply remote
                        // otherwise do nothing
                    }

                    return this.appliedConfig(config);
                }

                appliedConfig(config) {
                    this.previousConfig = config;
                    return true;
                }

                confirm(config, remoteConfig) {
                    Logger.warn('Detected both local and remote config changed.');

                    this.closeModal();

                    ({
                        manual: () => {},
                        save: () => this.push(config),
                        load: () => this.apply(remoteConfig)
                    })[this.settings.actionPriority]();
                    if (this.settings.actionPriority !== 'manual') return;

                    this.modalId = Modals.showModal(
                        this.getName(),
                        [
                            React.createElement(
                                Markdown,
                                null,
                                `### Detected both local and remote config changed  
  
Choose either to **save local config** (override remote)  
or to **load remote config** (override local)`
                            )
                        ],
                        {
                            confirmText: 'Save Local',
                            cancelText: 'Load Remote',
                            onConfirm: () => this.push(config),
                            onCancel: () => this.apply(remoteConfig)
                        }
                    );
                }

                closeModal() {
                    ModalActions.closeModal(this.modalId);
                }

                async push(config) {
                    try {
                        this.closeModal();

                        Logger.info('Pushing config to the cloud...');
                        const { token, salt } = await Data.push(config);
                        Logger.info(`Config successfully saved [${token}], encrypted by salt: "${salt}"!`);

                        this.appliedConfig(config);
                    }
                    catch (e) {
                        return "error";
                    }
                }

                async apply(remoteConfig) {
                    try {
                        this.closeModal();
                        if (Object.keys(remoteConfig.plugins).length === 0) return UserNote.set("!");

                        Logger.info('Applying config from the cloud...');
                        await Config.apply(remoteConfig);
                        Logger.info('Config successfully applied!');

                        this.appliedConfig(remoteConfig);
                    }
                    catch (e) {
                        return "error";
                    }
                }

                async forceAction(action) {
                    if (this.performingAction) return this.taskConflictToast();

                    switch (action) {
                        case "save":
                            Toasts.default("Saving config...");
                            this.performingAction = true;
                            (await this.push(await Config.get()) !== "error" ? Toasts.success("Config successfully saved!") : Toasts.error("Failed to save config."));
                            this.performingAction = false;
                            break;
                        case "load":
                            Toasts.default("Loading config...");
                            this.performingAction = true;
                            const remoteConfig = await Data.pull();
                            if (!remoteConfig) { Toasts.error("Failed to get remote config."); this.performingAction = false; break; }

                            (await this.apply(remoteConfig) !== "error" ? Toasts.success("Config successfully loaded!") : Toasts.error("Failed to load config."));
                            this.performingAction = false;
                            this.appliedConfig(remoteConfig);
                            break;
                        case "sync":
                            Toasts.default("Syncing...");
                            (await this.sync() !== "error" ? Toasts.success("Synced!") : Toasts.error("Sync failed."));
                            break;
                    }
                }

                async export() {
                    if (this.performingAction) return this.taskConflictToast();

                    try {
                        this.performingAction = true;
                        Toasts.default('Exporting...');

                        const { data } = Data.encode(await Config.get(), "default");
                        const { canceled, filePath } = await BdApi.openDialog({
                            mode: "save",
                            title: `${this.getName()} - Export config`,
                            defaultPath: "config",
                            filters: [
                                {
                                    name: "SyncedBD configuration",
                                    extensions: ["sbd"]
                                }
                            ]
                        });

                        if (canceled) return this.performingAction = false;
                        await new Promise(res => fs.writeFile(filePath, data, res));

                        Toasts.success('File successfully saved!');
                        this.performingAction = false;
                    }
                    catch (e) {
                        Toasts.error('Failed to export config.');
                        this.performingAction = false;
                    }
                }

                async import(config) {
                    if (this.performingAction) return this.taskConflictToast();

                    try {
                        this.performingAction = true;

                        Toasts.default('Applying...');
                        await Config.apply(config);

                        Logger.info('Config successfully applied!');
                        Toasts.success('Config successfully applied!');
                        this.appliedConfig(config);
                        this.performingAction = false;
                    }
                    catch (e) {
                        Toasts.error('Failed to apply config.');
                        this.performingAction = false;
                    }
                }

                async openConfig(withImport = false) {
                    if (withImport && this.performingAction) return this.taskConflictToast();

                    try {
                        const { canceled, filePaths } = await BdApi.openDialog({
                            mode: "open",
                            title: `${this.getName()} - Select config`,
                            filters: [
                                {
                                    name: "SyncedBD configuration",
                                    extensions: ["sbd"]
                                }
                            ],
                            multiSelections: false
                        });
                        if (canceled) return;

                        const data = await new Promise(res => fs.readFile(filePaths[0], 'utf8', (error, data) => {
                            if (error) return res();
                            res(data);
                        }));
                        if (!data) throw new Error();

                        const config = Data.decode(data, "default");
                        if (!config) throw new Error();

                        this.viewConfig(config, withImport);
                    }
                    catch (e) {
                        Toasts.error('Failed to load config.');
                    }
                }

                viewConfig(config, withImport = false) {
                    const that = this;
                    class Modal extends React.Component {
                        componentDidMount() {
                            const node = ReactDOM.findDOMNode(this).querySelector(`.${Selectors.Modals.content}`);
                            const rawNode = node.children[0];
                            rawNode.remove();

                            const style = document.createElement('style');
                            style.textContent = `.${that.getName()}--configPreview .${Selectors.Forms.modeDisabled}, .${that.getName()}--configPreview .${Selectors.FormInput.disabled} { opacity: 1 !important; cursor: unset !important; }`;

                            const element = new Settings.SettingPanel(
                                () => {},

                                ...BdApi.settings.map(collection => {
                                    return new Settings.SettingGroup(collection.name).append(
                                        ...collection.settings.map(category => {
                                            return new Settings.SettingGroup(category.name).append(
                                                ...category.settings.filter(s => s.type === 'switch' && config[collection.id][category.id][s.id] !== undefined).map(setting => {
                                                    return new Settings.Switch(setting.name, setting.note, config[collection.id][category.id][setting.id], () => {}, { disabled: true });
                                                })
                                            )
                                        })
                                    )
                                }),

                                new Settings.SettingGroup('Plugins').append(
                                    ...Object.keys(config.plugins).map(name => {
                                        const plugin = config.plugins[name];

                                        return new Settings.Switch(
                                            name,
                                            plugin.config && Object.keys(plugin.config).length > 0 ? React.createElement(
                                                Markdown,
                                                null,
                                                `\`\`\`json
${JSON.stringify(plugin.config, null, '\t')}
\`\`\``
                                            ) : null,
                                            plugin.enabled,
                                            () => {},
                                            { disabled: true })
                                    })
                                ),

                                new Settings.SettingGroup('Themes').append(
                                    ...Object.keys(config.themes).map(name => {
                                        const theme = config.themes[name];

                                        return new Settings.Switch(
                                            name,
                                            null,
                                            theme,
                                            () => {},
                                            { disabled: true })
                                    })
                                ),

                                new Settings.SettingGroup('Raw Config').append(rawNode)

                            )
                                .getElement();

                            element.className = `${that.getName()}--configPreview`;
                            node.prepend(
                                style,
                                element
                            );
                        }

                        render() {
                            return React.createElement(ConfirmationModal, Object.assign({
                                    header: `${that.getName()} Config Preview`,
                                    confirmButtonColor: Button.ButtonColors.BRAND,
                                    className: Selectors.Modals.large,
                                    ...(withImport ? ({
                                        confirmText: 'Apply Config',
                                        cancelText: 'Cancel',
                                        onConfirm: () => that.import(config)
                                    }) : ({
                                        confirmText: 'Done',
                                        cancelText: null
                                    }))
                                }, this.props),
                                [
                                    React.createElement(
                                        Markdown,
                                        null,
                                        `\`\`\`json
${JSON.stringify(config, null, '\t')}
\`\`\``
                                    )
                                ]
                            );
                        }
                    }

                    ModalActions.openModal(props => {
                        return React.createElement(Modal, props)
                    });
                }

                taskConflictToast() {
                    return Toasts.warning('Another task is currently running. Wait for it to finish.');
                }

                onStop() {
                    Patcher.unpatchAll();
                    Loader.hide();
                    WebpackModules.removeListener(this.webpackListener);

                    clearTimeout(this.startupTimeout);
                    clearInterval(this.syncInterval);
                }

                getSettingsPanel() {
                    const Buttons = (...props) => {
                        class Panel extends React.Component {
                            render() {
                                let buttons = [];
                                props.forEach(p => {
                                    buttons.push(
                                        React.createElement(Button.default, {
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
                            sync: `M12 4V2.21c0-.45-.54-.67-.85-.35l-2.8 2.79c-.2.2-.2.51 0 .71l2.79 2.79c.32.31.86.09.86-.36V6c3.31 0 6 2.69 6 6 0 .79-.15 1.56-.44 2.25-.15.36-.04.77.23 1.04.51.51 1.37.33 1.64-.34.37-.91.57-1.91.57-2.95 0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-.79.15-1.56.44-2.25.15-.36.04-.77-.23-1.04-.51-.51-1.37-.33-1.64.34C4.2 9.96 4 10.96 4 12c0 4.42 3.58 8 8 8v1.79c0 .45.54.67.85.35l2.79-2.79c.2-.2.2-.51 0-.71l-2.79-2.79c-.31-.31-.85-.09-.85.36V18z`,
                            save: `M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l4.65-4.65c.2-.2.51-.2.71 0L17 13h-3z`,
                            load: `M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-4.65 4.65c-.2.2-.51.2-.71 0L7 13h3V9h4v4h3z`,
                            import: `M16.59,9H15V4c0-0.55-0.45-1-1-1h-4C9.45,3,9,3.45,9,4v5H7.41c-0.89,0-1.34,1.08-0.71,1.71l4.59,4.59 c0.39,0.39,1.02,0.39,1.41,0l4.59-4.59C17.92,10.08,17.48,9,16.59,9z M5,19c0,0.55,0.45,1,1,1h12c0.55,0,1-0.45,1-1s-0.45-1-1-1H6 C5.45,18,5,18.45,5,19z`,
                            export: `M7.4,10h1.59v5c0,0.55,0.45,1,1,1h4c0.55,0,1-0.45,1-1v-5h1.59c0.89,0,1.34-1.08,0.71-1.71L12.7,3.7 c-0.39-0.39-1.02-0.39-1.41,0L6.7,8.29C6.07,8.92,6.51,10,7.4,10z M5,19c0,0.55,0.45,1,1,1h12c0.55,0,1-0.45,1-1s-0.45-1-1-1H6 C5.45,18,5,18.45,5,19z`,
                            preview: `M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z`
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

                    return Settings.SettingPanel.build(
                        () => {
                            this.saveSettings.bind(this);
                        },

                        new Settings.SettingField("Share config", null, () => {}, Buttons(
                            {
                                children: ButtonIcon('import', 'Import'),
                                icon: true,
                                color: Button.ButtonColors.BRAND,
                                size: Button.ButtonSizes.SMALL,
                                onClick: () => this.openConfig(true)
                            },
                            {
                                children: ButtonIcon('export', 'Export'),
                                icon: true,
                                color: Button.ButtonColors.BRAND,
                                size: Button.ButtonSizes.SMALL,
                                onClick: () => this.export()
                            },
                            {
                                children: ButtonIcon('preview', 'Preview'),
                                icon: true,
                                color: Button.ButtonColors.GREY,
                                size: Button.ButtonSizes.SMALL,
                                onClick: () => this.openConfig()
                            }
                        )),

                        new Settings.SettingField("Force actions", null, () => {}, Buttons(
                            {
                                children: ButtonIcon('sync', 'Sync'),
                                icon: true,
                                color: Button.ButtonColors.BRAND,
                                size: Button.ButtonSizes.SMALL,
                                onClick: () => this.forceAction("sync")
                            },
                            {
                                children: ButtonIcon('save', 'Save Local Config'),
                                icon: true,
                                color: Button.ButtonColors.GREY,
                                size: Button.ButtonSizes.SMALL,
                                onClick: () => this.forceAction("save")
                            },
                            {
                                children: ButtonIcon('load', 'Load Remote Config'),
                                icon: true,
                                color: Button.ButtonColors.GREY,
                                size: Button.ButtonSizes.SMALL,
                                onClick: () => this.forceAction("load")
                            }
                        )),

                        new Settings.SettingGroup('General', { shown: true }).append(

                            new Settings.Slider('Sync interval (minutes)', 'Sets the configuration synchronization frequency.', 1, 60, this.settings.syncInterval, e => {
                                this.settings.syncInterval = e;
                                this.saveSettings();
                            }, {
                                markers: [1, 5, 10, 20, 30, 40, 50, 60],
                                stickToMarkers: true,
                                defaultValue: 5
                            }),

                            new Settings.RadioGroup('Action priority', 'Sets the default action to perform if detected both local and remote config changed.', this.settings.actionPriority, [
                                {
                                    name: 'Manual',
                                    value: 'manual',
                                    desc: 'Lets you choose action every time the conflict happens.'
                                },
                                {
                                    name: 'Save local',
                                    value: 'save'
                                },
                                {
                                    name: 'Load remote',
                                    value: 'load'
                                },
                            ], e => {
                                this.settings.actionPriority = e;
                                this.saveSettings();
                            }),

                        ),

                        new Settings.SettingGroup('Appearance').append(

                            new Settings.Switch('Hide self user note', 'Hides user note from current user\'s popup and modal in which plugin stores access credentials to your config that are better not to share with anyone.', this.settings.hideUserNote, e => {
                                this.settings.hideUserNote = e;
                                this.saveSettings();
                            }),

                            new Settings.Switch('Enable loader', 'Shows loader in the right bottom of the screen if plugin is performing action right now.', this.settings.loader, e => {
                                if (!e) Loader.hide();
                                else if (this.performingAction) Loader.show();

                                this.settings.loader = e;
                                this.saveSettings();
                            }),

                        ),

                    );
                }

                constructor() {
                    super();

                    this.defaultSettings = {
                        hideUserNote: true,
                        syncInterval: 5,
                        actionPriority: "manual",
                        loader: true
                    }

                    this.settings = this.loadSettings(this.defaultSettings);
                }
            }
        }

        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();

var LZString = function () { function o(o, r) { if (!t[o]) { t[o] = {}; for (var n = 0; n < o.length; n++)t[o][o.charAt(n)] = n } return t[o][r] } var r = String.fromCharCode, n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$", t = {}, i = { compressToBase64: function (o) { if (null == o) return ""; var r = i._compress(o, 6, function (o) { return n.charAt(o) }); switch (r.length % 4) { default: case 0: return r; case 1: return r + "==="; case 2: return r + "=="; case 3: return r + "=" } }, decompressFromBase64: function (r) { return null == r ? "" : "" == r ? null : i._decompress(r.length, 32, function (e) { return o(n, r.charAt(e)) }) }, compressToUTF16: function (o) { return null == o ? "" : i._compress(o, 15, function (o) { return r(o + 32) }) + " " }, decompressFromUTF16: function (o) { return null == o ? "" : "" == o ? null : i._decompress(o.length, 16384, function (r) { return o.charCodeAt(r) - 32 }) }, compressToUint8Array: function (o) { for (var r = i.compress(o), n = new Uint8Array(2 * r.length), e = 0, t = r.length; t > e; e++) { var s = r.charCodeAt(e); n[2 * e] = s >>> 8, n[2 * e + 1] = s % 256 } return n }, decompressFromUint8Array: function (o) { if (null === o || void 0 === o) return i.decompress(o); for (var n = new Array(o.length / 2), e = 0, t = n.length; t > e; e++)n[e] = 256 * o[2 * e] + o[2 * e + 1]; var s = []; return n.forEach(function (o) { s.push(r(o)) }), i.decompress(s.join("")) }, compressToEncodedURIComponent: function (o) { return null == o ? "" : i._compress(o, 6, function (o) { return e.charAt(o) }) }, decompressFromEncodedURIComponent: function (r) { return null == r ? "" : "" == r ? null : (r = r.replace(/ /g, "+"), i._decompress(r.length, 32, function (n) { return o(e, r.charAt(n)) })) }, compress: function (o) { return i._compress(o, 16, function (o) { return r(o) }) }, _compress: function (o, r, n) { if (null == o) return ""; var e, t, i, s = {}, p = {}, u = "", c = "", a = "", l = 2, f = 3, h = 2, d = [], m = 0, v = 0; for (i = 0; i < o.length; i += 1)if (u = o.charAt(i), Object.prototype.hasOwnProperty.call(s, u) || (s[u] = f++, p[u] = !0), c = a + u, Object.prototype.hasOwnProperty.call(s, c)) a = c; else { if (Object.prototype.hasOwnProperty.call(p, a)) { if (a.charCodeAt(0) < 256) { for (e = 0; h > e; e++)m <<= 1, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++; for (t = a.charCodeAt(0), e = 0; 8 > e; e++)m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t >>= 1 } else { for (t = 1, e = 0; h > e; e++)m = m << 1 | t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t = 0; for (t = a.charCodeAt(0), e = 0; 16 > e; e++)m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t >>= 1 } l--, 0 == l && (l = Math.pow(2, h), h++), delete p[a] } else for (t = s[a], e = 0; h > e; e++)m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t >>= 1; l--, 0 == l && (l = Math.pow(2, h), h++), s[c] = f++, a = String(u) } if ("" !== a) { if (Object.prototype.hasOwnProperty.call(p, a)) { if (a.charCodeAt(0) < 256) { for (e = 0; h > e; e++)m <<= 1, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++; for (t = a.charCodeAt(0), e = 0; 8 > e; e++)m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t >>= 1 } else { for (t = 1, e = 0; h > e; e++)m = m << 1 | t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t = 0; for (t = a.charCodeAt(0), e = 0; 16 > e; e++)m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t >>= 1 } l--, 0 == l && (l = Math.pow(2, h), h++), delete p[a] } else for (t = s[a], e = 0; h > e; e++)m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t >>= 1; l--, 0 == l && (l = Math.pow(2, h), h++) } for (t = 2, e = 0; h > e; e++)m = m << 1 | 1 & t, v == r - 1 ? (v = 0, d.push(n(m)), m = 0) : v++, t >>= 1; for (; ;) { if (m <<= 1, v == r - 1) { d.push(n(m)); break } v++ } return d.join("") }, decompress: function (o) { return null == o ? "" : "" == o ? null : i._decompress(o.length, 32768, function (r) { return o.charCodeAt(r) }) }, _decompress: function (o, n, e) { var t, i, s, p, u, c, a, l, f = [], h = 4, d = 4, m = 3, v = "", w = [], A = { val: e(0), position: n, index: 1 }; for (i = 0; 3 > i; i += 1)f[i] = i; for (p = 0, c = Math.pow(2, 2), a = 1; a != c;)u = A.val & A.position, A.position >>= 1, 0 == A.position && (A.position = n, A.val = e(A.index++)), p |= (u > 0 ? 1 : 0) * a, a <<= 1; switch (t = p) { case 0: for (p = 0, c = Math.pow(2, 8), a = 1; a != c;)u = A.val & A.position, A.position >>= 1, 0 == A.position && (A.position = n, A.val = e(A.index++)), p |= (u > 0 ? 1 : 0) * a, a <<= 1; l = r(p); break; case 1: for (p = 0, c = Math.pow(2, 16), a = 1; a != c;)u = A.val & A.position, A.position >>= 1, 0 == A.position && (A.position = n, A.val = e(A.index++)), p |= (u > 0 ? 1 : 0) * a, a <<= 1; l = r(p); break; case 2: return "" }for (f[3] = l, s = l, w.push(l); ;) { if (A.index > o) return ""; for (p = 0, c = Math.pow(2, m), a = 1; a != c;)u = A.val & A.position, A.position >>= 1, 0 == A.position && (A.position = n, A.val = e(A.index++)), p |= (u > 0 ? 1 : 0) * a, a <<= 1; switch (l = p) { case 0: for (p = 0, c = Math.pow(2, 8), a = 1; a != c;)u = A.val & A.position, A.position >>= 1, 0 == A.position && (A.position = n, A.val = e(A.index++)), p |= (u > 0 ? 1 : 0) * a, a <<= 1; f[d++] = r(p), l = d - 1, h--; break; case 1: for (p = 0, c = Math.pow(2, 16), a = 1; a != c;)u = A.val & A.position, A.position >>= 1, 0 == A.position && (A.position = n, A.val = e(A.index++)), p |= (u > 0 ? 1 : 0) * a, a <<= 1; f[d++] = r(p), l = d - 1, h--; break; case 2: return w.join("") }if (0 == h && (h = Math.pow(2, m), m++), f[l]) v = f[l]; else { if (l !== d) return null; v = s + s.charAt(0) } w.push(v), f[d++] = s + v.charAt(0), h--, s = v, 0 == h && (h = Math.pow(2, m), m++) } } }; return i }();
var objectsAreEqual = function () {var t,e,r,n;function o(t,e){var f;if(isNaN(t)&&isNaN(e)&&"number"==typeof t&&"number"==typeof e)return!0;if(t===e)return!0;if("function"==typeof t&&"function"==typeof e||t instanceof Date&&e instanceof Date||t instanceof RegExp&&e instanceof RegExp||t instanceof String&&e instanceof String||t instanceof Number&&e instanceof Number)return t.toString()===e.toString();if(!(t instanceof Object&&e instanceof Object))return!1;if(t.isPrototypeOf(e)||e.isPrototypeOf(t))return!1;if(t.constructor!==e.constructor)return!1;if(t.prototype!==e.prototype)return!1;if(r.indexOf(t)>-1||n.indexOf(e)>-1)return!1;for(f in e){if(e.hasOwnProperty(f)!==t.hasOwnProperty(f))return!1;if(typeof e[f]!=typeof t[f])return!1}for(f in t){if(e.hasOwnProperty(f)!==t.hasOwnProperty(f))return!1;if(typeof e[f]!=typeof t[f])return!1;switch(typeof t[f]){case"object":case"function":if(r.push(t),n.push(e),!o(t[f],e[f]))return!1;r.pop(),n.pop();break;default:if(t[f]!==e[f])return!1}}return!0}if(arguments.length<1)return!0;for(t=1,e=arguments.length;t<e;t++)if(r=[],n=[],!o(arguments[0],arguments[t]))return!1;return!0}
