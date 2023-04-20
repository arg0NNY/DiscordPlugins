/**
 * @name BetterGuildTooltip
 * @author arg0NNY
 * @authorId 633223783204782090
 * @invite M8DBtcZjXD
 * @version 1.0.2
 * @description Displays an online and total member count in the guild tooltip.
 * @website https://github.com/arg0NNY/DiscordPlugins/tree/master/BetterGuildTooltip
 * @source https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/BetterGuildTooltip/BetterGuildTooltip.plugin.js
 * @updateUrl https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/BetterGuildTooltip/BetterGuildTooltip.plugin.js
 */

module.exports = (() => {
    const config = {
        "info": {
            "name": "BetterGuildTooltip",
            "authors": [
                {
                    "name": "arg0NNY",
                    "discord_id": '224538553944637440',
                    "github_username": 'arg0NNY'
                }
            ],
            "version": "1.0.2",
            "description": "Displays an online and total member count in the guild tooltip.",
            github: "https://github.com/arg0NNY/DiscordPlugins/tree/master/BetterGuildTooltip",
            github_raw: "https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/BetterGuildTooltip/BetterGuildTooltip.plugin.js"
        },
        "defaultConfig": [
            {
                type: 'switch',
                id: 'displayOnline',
                name: 'Display online count',
                note: 'Displays an online member count in the guild tooltip.',
                value: true
            },
            {
                type: 'switch',
                id: 'displayTotal',
                name: 'Display total count',
                note: 'Displays a total member count in the guild tooltip.',
                value: true
            }
        ],
        "changelog": [
            {
                "type": "fixed",
                "title": "Fixed",
                "items": [
                    "Fixed plugin not working."
                ]
            }
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
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
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
                WebpackModules,
                Patcher,
                DiscordModules
            } = Api;

            const {
                React,
                MemberCountStore,
                Flux,
                GuildChannelsStore
            } = DiscordModules;

            function getMangled(filter) {
                const target = WebpackModules.getModule(m => Object.values(m).some(filter), {searchGetters: false});
                return target ? [
                    target,
                    Object.keys(target).find(k => filter(target[k]))
                ] : [];
            }

            const Dispatcher = WebpackModules.getByProps('_subscriptions', '_waitQueue');

            const ActionTypes = {
                CONNECTION_OPEN: 'CONNECTION_OPEN',
                GUILD_CREATE: 'GUILD_CREATE',
                GUILD_DELETE: 'GUILD_DELETE',
                GUILD_MEMBER_LIST_UPDATE: 'GUILD_MEMBER_LIST_UPDATE',
                ONLINE_GUILD_MEMBER_COUNT_UPDATE: 'ONLINE_GUILD_MEMBER_COUNT_UPDATE'
            };

            const useStateFromStores = WebpackModules.getModule(m => m?.toString?.().includes('useStateFromStores'), {searchExports: true});

            const Selectors = {
                Guild: WebpackModules.getByProps('statusOffline', 'guildDetail')
            };

            const GuildInfoStore = WebpackModules.getByProps('getGuild', 'hasFetchFailed');
            const GuildActions = WebpackModules.getByProps('preload', 'closePrivateChannel');
            const GuildTooltip = getMangled(m => ['includeActivity', 'onBlur'].every(s => m?.toString?.().includes(s)));

            const memberCounts = new Map();
            const onlineMemberCounts = new Map();

            function handleConnectionOpen({ guilds }) {
                for (const guild of guilds) {
                    memberCounts.set(guild.id, guild.member_count);
                }
            }

            function handleGuildCreate({ guild }) {
                memberCounts.set(guild.id, guild.member_count);
            }

            function handleGuildDelete({ guild }) {
                memberCounts.delete(guild.id);
                onlineMemberCounts.delete(guild.id);
            }

            function handleGuildMemberListUpdate({ guildId, memberCount, groups }) {
                if (memberCount !== 0) {
                    memberCounts.set(guildId, memberCount);
                }

                onlineMemberCounts.set(
                    guildId,
                    groups.reduce((total, group) => {
                        return group.id !== 'offline' ? total + group.count : total;
                    }, 0)
                );
            }

            function handleOnlineGuildMemberCountUpdate({ guildId, count }) {
                onlineMemberCounts.set(guildId, count);
            }

            const MemberCountsStore = new class extends Flux.Store {
                initialize() {
                    const nativeMemberCounts = MemberCountStore.getMemberCounts();
                    for (const guildId in nativeMemberCounts) {
                        memberCounts.set(guildId, nativeMemberCounts[guildId]);
                    }
                };

                getMemberCounts(guildId) {
                    return {
                        members: memberCounts.get(guildId),
                        membersOnline: onlineMemberCounts.get(guildId)
                    };
                };
            }(Dispatcher, {
                [ActionTypes.CONNECTION_OPEN]: handleConnectionOpen,
                [ActionTypes.GUILD_CREATE]: handleGuildCreate,
                [ActionTypes.GUILD_DELETE]: handleGuildDelete,
                [ActionTypes.GUILD_MEMBER_LIST_UPDATE]: handleGuildMemberListUpdate,
                [ActionTypes.ONLINE_GUILD_MEMBER_COUNT_UPDATE]: handleOnlineGuildMemberCountUpdate
            });


            function GuildTooltipCounters(props) {
                MemberCountsStore.initialize();

                const { presenceCount, memberCount } = useStateFromStores([GuildInfoStore], () =>
                    GuildInfoStore.getGuild(props.guild.id) ?? {}
                )
                const { members, membersOnline } = useStateFromStores([MemberCountsStore], () =>
                    MemberCountsStore.getMemberCounts(props.guild.id)
                );

                const onlineDisplayed = props.settings.displayOnline && (membersOnline || presenceCount);
                const totalDisplayed = props.settings.displayTotal && (memberCount || members);

                return onlineDisplayed || totalDisplayed ? React.createElement(
                    'div',
                    {
                        className: Selectors.Guild.guildDetail,
                        style: {
                            marginTop: '5px',
                            marginBottom: '5px'
                        }
                    },
                    React.createElement(
                        'div',
                        {
                            className: Selectors.Guild.statusCounts,
                            style: {
                                columnGap: 0,
                                '-webkit-column-gap': 0
                            }
                        },
                        [
                            ...(onlineDisplayed ? [React.createElement(
                                'i',
                                {
                                    className: Selectors.Guild.statusOnline
                                }
                            ),
                                React.createElement(
                                    'span',
                                    {
                                        className: Selectors.Guild.count
                                    },
                                    membersOnline ?? presenceCount
                                )] : []),
                            ...(totalDisplayed ? [React.createElement(
                                'i',
                                {
                                    className: Selectors.Guild.statusOffline
                                }
                            ),
                                React.createElement(
                                    'span',
                                    {
                                        className: Selectors.Guild.count
                                    },
                                    memberCount ?? members
                                )] : [])
                        ]
                    )
                ) : React.createElement('div');
            }

            const PRELOAD_DELAY = 200;
            return class BetterGuildTooltip extends Plugin {
                onStart() {
                    this.patchGuildTooltip();

                    this.preloadInProccess = false;
                    this.preloadNext = null;
                }

                preloadGuild(guild) {
                    if (!guild || this.preloadInProccess) return this.preloadNext = guild;

                    this._preloadGuild(guild);
                    this.preloadInProccess = true;
                    setTimeout(() => {
                        this.preloadInProccess = false;
                        this.preloadGuild(this.preloadNext);
                        this.preloadNext = null;
                    }, PRELOAD_DELAY);
                }

                _preloadGuild(guild) {
                    GuildActions.preload(
                        guild.id,
                        GuildChannelsStore.getDefaultChannel(guild.id).id
                    );
                }

                patchGuildTooltip() {
                    Patcher.after(...GuildTooltip, (self, _, value) => {
                        if (!this.settings.displayOnline && !this.settings.displayTotal) return;

                        Patcher.after(value.props.text, 'type', (self, _, value) => {
                            const guild = _[0].guild;

                            if (this.settings.displayOnline && !onlineMemberCounts.has(guild.id)) this.preloadGuild(guild);

                            value.props.children.splice(1, 0, React.createElement(GuildTooltipCounters, { guild, settings: this.settings }));
                        });

                    });
                }

                onStop() {
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
