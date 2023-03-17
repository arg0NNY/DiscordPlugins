/**
 * @name FreeThemes
 * @author arg0NNY
 * @authorLink https://github.com/arg0NNY/DiscordPlugins
 * @invite M8DBtcZjXD
 * @version 1.0.0
 * @description Use Discord's Colour Themes without Nitro!
 * @website https://github.com/arg0NNY/DiscordPlugins/tree/master/FreeThemes
 * @source https://github.com/arg0NNY/DiscordPlugins/blob/master/FreeThemes/FreeThemes.plugin.js
 * @updateUrl https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/FreeThemes/FreeThemes.plugin.js
 */

module.exports = (() => {
    const config = {
        "info": {
            "name": "FreeThemes",
            "authors": [
                {
                    "name": "arg0NNY",
                    "discord_id": '224538553944637440',
                    "github_username": 'arg0NNY'
                }
            ],
            "version": "1.0.0",
            "description": "Use Discord's Colour Themes without Nitro! Configured in the *Appearance* tab.",
            github: "https://github.com/arg0NNY/DiscordPlugins/tree/master/FreeThemes",
            github_raw: "https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/FreeThemes/FreeThemes.plugin.js"
        }
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
            BdApi.UI.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
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
                WebpackModules,
                DiscordModules,
                Utilities
            } = Api;

            const {
                UserStore,
                React
            } = DiscordModules;

            const Data = new Proxy({}, {
                get (_, k) {
                    return BdApi.Data.load(config.info.name, k);
                },
                set (_, k, v) {
                    BdApi.Data.save(config.info.name, k, v);
                    return true;
                }
            });

            const Anchor = WebpackModules.getModule(m => m?.toString?.().includes('noreferrer noopener') && m?.toString?.().includes('focusProps'), {searchExports: true})
            const ThemeStore = WebpackModules.getByProps('isSystemThemeAvailable')
            const Presets = WebpackModules.getModule(m => Array.isArray(m) && m.some(i => i.colors), {searchExports: true})
            const NitroActions = WebpackModules.getByProps('canUseClientThemes')
            const ThemeControls = WebpackModules.getByProps('Basic', 'Gradient')

            const ThemeActions = {
                updateTheme: WebpackModules.getModule(m => m.toString?.().includes('UPDATE_BACKGROUND_GRADIENT_PRESET'), {searchExports: true})
            }

            return class FreeThemes extends Plugin {
                onStart() {
                    this.patchThemeControls()
                    UserStore.emitChange()

                    if (Number.isInteger(Data.selectedPresetId)) this.setTheme(Presets.find(p => p.id === Data.selectedPresetId))
                }

                setTheme(preset) {
                    if (!preset) return

                    if (ThemeStore.theme !== preset.theme) this.BasicThemeHandlers?.[preset.theme]?.()
                    ThemeActions.updateTheme(preset.id)

                    Data.selectedPresetId = preset.id
                }

                patchThemeControls() {
                    Patcher.after(NitroActions, 'canUseClientThemes', (self, props, value) => props[0].id === UserStore.getCurrentUser().id ? true : value)

                    this.BasicThemeHandlers = { light: null, dark: null }
                    Patcher.after(ThemeControls, 'Basic', (self, props, value) => {
                        const selections = Utilities.findInReactTree(value, i => Array.isArray(i) && i.some(j => j?.props?.theme))
                        if (!selections) return

                        this.BasicThemeHandlers.light = selections.find(s => s.props.theme === 'light')?.props?.onSelect ?? this.BasicThemeHandlers.light
                        this.BasicThemeHandlers.dark = selections.find(s => s.props.theme === 'dark')?.props?.onSelect ?? this.BasicThemeHandlers.dark

                        selections.forEach(s => {
                            if (!s.props?.theme) return

                            Patcher.after(s.props, 'onSelect', () => { Data.selectedPresetId = null })
                        })
                    })

                    Patcher.after(ThemeControls, 'Gradient', (self, props, value) => {
                        const selections = Utilities.findInReactTree(value, i => Array.isArray(i) && i.some(j => j?.props?.preset))
                        if (!selections) return

                        selections.forEach(s => {
                            if (!s.props?.preset) return

                            s.props.disabled = false
                            Patcher.instead(s.props, 'onSelect', () => this.setTheme(s.props.preset))
                        })

                        const header = Utilities.findInReactTree(value, i => i?.type?.toString?.().includes('EDITOR_GRADIENT_DESCRIPTION'))
                        if (header) Patcher.after(header, 'type', (self, props, value) => {
                            value.props.children = [
                                ...value.props.children,
                                ' Unlocked by ',
                                React.createElement(Anchor, {
                                    children: this.getName(),
                                    href: `https://betterdiscord.app/plugin/${this.getName()}`
                                }),
                                '.'
                            ]
                        })
                    })
                }

                onStop() {
                    Patcher.unpatchAll()
                    UserStore.emitChange()
                    ThemeActions.updateTheme(null)
                }
            }
        }

        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
