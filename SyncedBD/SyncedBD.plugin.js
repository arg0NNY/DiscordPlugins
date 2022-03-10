/**
 * @name SyncedBD
 * @author arg0NNY
 * @authorId 224538553944637440
 * @invite M8DBtcZjXD
 * @version 1.0.1
 * @description Syncs your BetterDiscord settings, official themes and plugins with their configs between BD installations linked to your Discord account. Allows you to automatically import all your BD configs after a clean installation. Plug-n-play it is!
 * @website https://github.com/arg0NNY/DiscordPlugins/tree/master/SyncedBD
 * @source https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/SyncedBD/SyncedBD.plugin.js
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
            "version": "1.0.1",
            "description": "Syncs your BetterDiscord settings, official themes and plugins with their configs between BD installations linked to your Discord account. Allows you to automatically import all your BD configs after a clean installation. Plug-n-play it is!",
            github: "https://github.com/arg0NNY/DiscordPlugins/tree/master/SyncedBD",
            github_raw: "https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/SyncedBD/SyncedBD.plugin.js"
        },
        "changelog": [{
            "type": "fixed",
            "title": "Fixed",
            "items": [
                "Fixed random crashes."
            ]
        }]
    };

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
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
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
                Toasts
            } = Api;

            const {
                UserNoteActions,
                UserInfoStore,
                React,
                ModalActions,
                DiscordConstants
            } = DiscordModules;

            const {
                Endpoints
            } = DiscordConstants;

            const Markdown = WebpackModules.getModule(m => m.displayName === "Markdown" && m.rules);
            const DiscordApi = WebpackModules.getByProps('get', 'getAPIBaseURL');
            const UserPopoutBody = WebpackModules.getModule(m => m.default?.displayName === 'UserPopoutBody');
            const Button = WebpackModules.getByProps('ButtonLink');

            const PLUGIN_NAME = config.info.name;


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
                        request.post({
                            url: `${DPASTE_API_BASE_URL}/api/v2/`,
                            headers: { "Content-Type": "application/x-www-form-urlencoded" },
                            body: "expiry_days=365&content=" + encodeURIComponent(content)
                        }, (error, response, body) => {
                            if (error) return res(Logger.err('Failed to save config to the cloud.'));

                            res(body.split('/').pop().trim());
                        });
                    });
                }

                get(token) {
                    return new Promise(res => request.get(`${DPASTE_API_BASE_URL}/${token}.txt`, (error, response, body) => {
                        const fail = () => res(Logger.err('Failed to get config from the cloud.'));

                        try {
                            if (error) return fail();
                            res(body);
                        }
                        catch (e) {
                            return fail();
                        }
                    }));
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
                    Logger.info('Synchronizing addons...');

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

                encode(data) {
                    const salt = makeSalt(20);
                    return {
                        salt,
                        data: crypt(salt, LZString.compressToEncodedURIComponent(JSON.stringify(data)))
                    };
                }

                decode(salt, data) {
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

                    data = this.decode(salt, data);
                    if (!data) return Logger.err('Failed to decode cloud data.');

                    return data;
                }

            }();

            return class SyncedBD extends Plugin {
                async onStart() {
                    this.patchUserPopoutBody();

                    this.modalId = null;
                    this.previousConfig = null;

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

                patchUserPopoutBody() {
                    Patcher.after(UserPopoutBody, "default", (self, [{user}], value) => {
                        if (!this.settings.hideUserNote || user.id !== UserInfoStore.getId()) return;
                        value.props.children = value.props.children.filter(i => !i.props?.children?.some(j => j.key === 'note'));
                    });
                }

                async sync() {
                    this.syncedAt = Date.now();

                    if (this.performingAction) return Logger.warn('Synchronization has been cancelled because another action is currently running.');
                    this.performingAction = true;

                    try {
                        Logger.info('Initializing synchronization...');
                        if (await this._sync() === true) Logger.info('No changes detected. Synchronization finished.');

                        this.performingAction = false;
                    }
                    catch (e) {
                        this.performingAction = false;
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
                            confirmText: 'Save local',
                            cancelText: 'Load remote',
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
                    if (this.performingAction) return Toasts.warning('Another task is currently running. Wait for it to finish.');

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
                    }
                }

                onStop() {
                    Patcher.unpatchAll();
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
                                                marginRight: '10px'
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

                    return Settings.SettingPanel.build(
                        () => {
                            this.saveSettings.bind(this);
                        },

                        new Settings.SettingField("Force actions", null, () => {}, Buttons(
                            {
                                children: 'Save local config',
                                color: Button.ButtonColors.BRAND,
                                size: Button.ButtonSizes.SMALL,
                                onClick: () => this.forceAction("save")
                            },
                            {
                                children: 'Load remote config',
                                color: Button.ButtonColors.BRAND,
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

                            new Settings.Switch('Hide self user note', 'Hides user note from current user\'s popup in which plugin stores access credentials to your config that are better not to share with anyone.', this.settings.hideUserNote, e => {
                                this.settings.hideUserNote = e;
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
                        actionPriority: "manual"
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
