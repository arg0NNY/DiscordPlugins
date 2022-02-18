/**
 * @name ChannelsPreview
 * @author arg0NNY
 * @authorId 224538553944637440
 * @version 1.0.1
 * @description Allows you to view recent messages in guild's channel without switching to it.
 * @website https://github.com/arg0NNY/DiscordPlugins/tree/master/ChannelsPreview
 * @source https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/ChannelsPreview/ChannelsPreview.plugin.js
 * @updateUrl https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/ChannelsPreview/ChannelsPreview.plugin.js
*/

module.exports = (() => {
    const config = {
        "info": {
            "name": "ChannelsPreview",
            "authors": [
                {
                    "name":"arg0NNY",
                    "discord_id": '224538553944637440',
          					"github_username": 'arg0NNY'
                }
            ],
            "version": "1.0.1",
            "description": "Allows you to view recent messages in guild's channel without switching to it.",
            github: "https://github.com/arg0NNY/DiscordPlugins/tree/master/ChannelsPreview",
      			github_raw: "https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/ChannelsPreview/ChannelsPreview.plugin.js"
        },
        "changelog": [{
    		"type": "improved",
    		"title": "Improvements",
    		"items": [
    			"Switched to more reliable popout manager. Thx to Pu, Strencher and Stern for pointing out this flaw."
    		]
    	}],
        "defaultConfig": [
            {
              type: 'category',
              id: 'trigger',
              name: 'Trigger',
              collapsible: true,
              shown: true,
              settings: [
                  {
                      type: "radio",
                      id: "displayOn",
                      name: "Display Preview On",
                      value: "hover",
                      options: [
                          {name: "Hover", value: "hover"},
                          {name: "Mouse Wheel Click", value: "mwheel"}
                      ]
                  },
                  {
                      type: 'slider',
                      id: 'hoverDelay',
                      name: 'Hover Delay',
                      note: 'NOTE: Messages fetching time is unsteady and not included in this option.',
                      value: .2,
                      initialValue: .2,
                      defaultValue: .2,
                      markers: [.1, .2, .3, .4, .5, .6, .7, .8, .9, 1],
                      stickToMarkers: true,
                      onMarkerRender: m => m+'s'
                  },
              ]
            },
            {
              type: 'category',
              id: 'appearance',
              name: 'Appearance',
              collapsible: true,
              settings: [
                  {
                      type: "radio",
                      id: "displayMode",
                      name: "Message Display",
                      value: "cozy",
                      options: [
                          {name: "Cozy", value: "cozy"},
                          {name: "Compact", value: "compact"}
                      ]
                  },
                  {
              				type: 'switch',
              				id: 'groupSpacingSync',
              				name: 'Sync Space Between Message Groups with app settings',
                      note: 'Sets Space Between Message Groups option equal to global Discord settings (Appearance tab). Option below will be ignored.',
              				value: true
            			},
                  {
                      type: 'slider',
                      id: 'groupSpacing',
                      name: 'Space Between Message Groups',
                      value: 16,
                      initialValue: 16,
                      defaultValue: 16,
                      markers: [0, 4, 8, 16, 24],
                      stickToMarkers: true,
                      onMarkerRender: m => m+'px'
                  },
                  {
              				type: 'switch',
              				id: 'darkenChat',
              				name: 'Darken chat behind popout',
                      note: 'Darkens chat when popout appears for better contrast.',
              				value: true
            			},
                  {
                      type: 'slider',
                      id: 'darkenLevel',
                      name: 'Darken level',
                      note: 'Sets the opacity level of darkening layer.',
                      value: .3,
                      initialValue: .3,
                      defaultValue: .3,
                      markers: [.1, .2, .3, .4, .5, .6, .7, .8, .9, 1],
                      stickToMarkers: true
                  },
                  {
              				type: 'switch',
              				id: 'dateDividers',
              				name: 'Show date dividers',
                      note: 'Shows date dividers between messages in preview popout.',
              				value: true
            			},
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
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() { }
        stop() { }
    } : (([Plugin, Api]) => {
        const {
            Patcher,
            WebpackModules,
            Logger,
            DiscordModules,
            PluginUtilities,
            DiscordSelectors,
            Popouts
        } = Api;
        const {
            React,
            ReactDOM,
            MessageActions,
            MessageStore,
            ChannelStore,
            DiscordConstants,
            Moment
        } = DiscordModules;

        const Selectors = {
            Messages: WebpackModules.getByProps('message', 'cozyMessage'),
            MessageDividers: WebpackModules.getByProps('divider', 'unreadPill'),
            Chat: WebpackModules.getByProps('chat', 'channelName'),
            Popout: WebpackModules.getByProps('messagesPopoutWrap'),
            Channel: WebpackModules.getByProps('userLimit', 'containerDefault')
        };

        let settings = {};
        const MESSAGES_FETCHING_LIMIT = 20;

        const ChannelItem = WebpackModules.getModule(m => m.default?.displayName == "ChannelItem");
        const EmptyMessage = WebpackModules.getModule(m => m.default?.displayName == "EmptyMessages");
        const MessageComponent = WebpackModules.getModule(m => m.default && m.ThreadStarterChatMessage && m.getElementFromMessageId);

        class ChannelsPreviewPopout extends React.Component {
            render() {
                const {
                    channel,
                    messages
                } = this.props;

                let currentGroupId = null;

                function getPreviousMessage(message) {
                  const index = messages.indexOf(message);
                  if (index === 0) return null;

                  return messages[index - 1];
                }

                function getGroupId(message) {
                    const INTERVAL = DiscordConstants.MESSAGE_GROUP_INTERVAL / 1000;
                    const Types = DiscordConstants.MessageTypes;
                    const previousMessage = getPreviousMessage(message);
                    if (!previousMessage) return currentGroupId = message.id;

                    return message.author.id !== previousMessage.author.id
                        || message.type !== Types.DEFAULT
                        || ![Types.DEFAULT, Types.REPLY].includes(previousMessage.type)
                        || Math.abs(previousMessage.timestamp.unix() - message.timestamp.unix()) > INTERVAL
                        || !message.timestamp.isSame(previousMessage.timestamp, 'day')
                        ? currentGroupId = message.id : currentGroupId;
                }

                function buildDateDivider(timestamp) {
                    const formatted = timestamp.format('LL');

                    return React.createElement(
                        'div',
                        {
                            className: `${Selectors.Messages.divider} ${Selectors.Messages.hasContent} ${Selectors.MessageDividers.divider} ${Selectors.MessageDividers.hasContent}`,
                            role: 'separator',
                            'aria-label': formatted
                        },
                        React.createElement('span', {className: Selectors.MessageDividers.content}, formatted)
                    );
                }

                const messagesElements = [];
                messages.forEach(message => {
                    if (settings.appearance.dateDividers) {
                      const previousMessage = getPreviousMessage(message);
                      if (!previousMessage || !message.timestamp.isSame(previousMessage.timestamp, 'day'))
                          messagesElements.push(buildDateDivider(message.timestamp));
                    }

                    messagesElements.push(React.createElement(MessageComponent.default, {
                        channel: channel,
                        message: message,
                        groupId: getGroupId(message),
                        id: `chat-messages-${message.id}`,
                        compact: settings.appearance.displayMode === 'compact'
                    }));
                });

                if (messagesElements.filter(m => !!m.props?.message).length < MESSAGES_FETCHING_LIMIT)
                    messagesElements.unshift(React.createElement(EmptyMessage.default, {
                        channel
                    }));

                const globalState = WebpackModules.getByProps('get', 'set', 'stringify').get('AccessibilityStore')._state;
                const messageGroupSpacing = settings.appearance.groupSpacingSync ? (globalState.messageGroupSpacing ?? 16) : settings.appearance.groupSpacing;

                return React.createElement(
                    'div',
                    {
                        id: 'ChannelsPreview',
                        className: `group-spacing-${messageGroupSpacing} ${Selectors.Popout.messagesPopoutWrap} show`
                    },
                    React.createElement(
                        'div',
                        {
                            id: 'ChannelsPreview-container'
                        },
                        messagesElements
                    )
                );
            }
        }

        const PopoutManager = new class {
            constructor() {
                this.ELEMENT_ID = 'ChannelsPreview';
                this.hoverTimeout = null;
                this.current = null;
                this.popouts = [];
            }

            darken() {
                if (!settings.appearance.darkenChat) return;

                document.querySelector(`.${Selectors.Chat.chat}`).style.setProperty('--preview-darken-opacity', settings.appearance.darkenLevel);
            }
            undarken() {
                document.querySelector(`.${Selectors.Chat.chat}`).style.setProperty('--preview-darken-opacity', 0);
            }

            open(event, channel) {
                if (this.current && this.current.channel.id === channel.id) return;

                this.close();
                this.current = {event, channel};
                this.display();
            }

            close(all = false) {
                if (!this.current) return;
                this.current = null;

                this.popouts.forEach(id => Popouts.closePopout(id));
                this.popouts = [];
                this.undarken();
            }

            forceClose() {
                this.close();
            }

            async display() {
                const {channel, event} = this.current;

                await MessageActions.fetchMessages({channelId: channel.id, limit: MESSAGES_FETCHING_LIMIT});
                if (this.current.channel !== channel) return;

                const messages = MessageStore.getMessages(channel.id).toArray().slice(0, MESSAGES_FETCHING_LIMIT);
                const storedChannel = ChannelStore.getChannel(channel.id);

                const parentChannelElem = event.target.closest(`.${Selectors.Channel.containerDefault}`);

                const popoutId = Popouts.openPopout(parentChannelElem, {
                    position: "left",
                    align: "center",
                    spacing: 20,
                    animation: Popouts.AnimationTypes.TRANSLATE,
                    autoInvert: true,
                    nudgeAlignIntoViewport: true,
                    render: () => {
                        return React.createElement(ChannelsPreviewPopout, {
                            messages,
                            channel: storedChannel
                        });
                    }
                });
                this.popouts.push(popoutId);

                this.darken();
            }

            hover(...params) {
                clearTimeout(this.hoverTimeout);
                this.hoverTimeout = setTimeout(() => {
                    this.open(...params);
                }, settings.trigger.hoverDelay * 1000);
            }

            leave() {
                clearTimeout(this.hoverTimeout);
                this.close(true);
            }
        }();

        const plugin = (Plugin, Api) => {
            return class ChannelsPreview extends Plugin {
                onStart() {
                  this.css();
                  settings = this.settings;

                  Patcher.after(ChannelItem, "default", (that, [props], value) => {
                      if (props.selected) return;

                      const channel = this.getChannel(value);
                      const types = DiscordConstants.ChannelTypes;
                      if (channel && [types.GUILD_TEXT, types.GUILD_ANNOUNCEMENT].includes(channel.type)) {
                          const clickable = this.getClickable(value);
                          if (clickable) {
                              const clickHandler = clickable.onClick;

                              clickable.onClick = () => {
                                  if (BdApi.Plugins.isEnabled('ChannelsPreview')) PopoutManager.forceClose();
                                  clickHandler();
                              }

                              switch (settings.trigger.displayOn) {
                                  case 'hover':
                                      clickable.onMouseEnter = async (e) => {
                                          if (!BdApi.Plugins.isEnabled('ChannelsPreview')) return;

                                          PopoutManager.hover(e, channel);
                                      };
                                      break;
                                  case 'mwheel':
                                      clickable.onMouseEnter = async (e) => {
                                          if (!BdApi.Plugins.isEnabled('ChannelsPreview')) return;

                                          e.target.onauxclick = ce => {
                                              if (!BdApi.Plugins.isEnabled('ChannelsPreview')) return;

                                              ce.preventDefault();
                                              if (ce.button !== 1) return;

                                              PopoutManager.open(ce, channel);
                                          }
                                      };
                                      break;
                              }

                              clickable.onMouseLeave = (e) => {
                                  if (!BdApi.Plugins.isEnabled('ChannelsPreview')) return;

                                  e.target.onauxclick = null;
                                  PopoutManager.leave();
                              };
                          }
                      }

                      return value;
                  });
                }

                getChannel(obj) {
                  let result = null;
                  for (const key in obj)
                    if (obj[key] && typeof obj[key] === 'object')
                      if (key === 'channel') result = obj[key] ?? result;
                      else if (this.shouldDescend(key)) result = this.getChannel(obj[key]) ?? result;

                  return result;
                }

                getClickable(obj) {
                    let result = null;
                    for (const key in obj)
                      if (obj[key] && typeof obj[key] === 'object')
                        if (obj[key].onClick && obj[key].role === 'link') result = obj[key] ?? result;
                        else if (this.shouldDescend(key)) result = this.getClickable(obj[key]) ?? result;

                    return result;
                }

                shouldDescend(key) {
                    return key === 'props' || key === 'children' || !isNaN(key);
                }

                css() {
                  PluginUtilities.addStyle('ChannelsPreviewStyles', `
#ChannelsPreview {
  pointer-events: none;
  background: var(--background-primary);
  border-radius: 10px;
  height: 30vh;
  min-height: 150px;
  width: 50vw;
  min-width: 350px;
  overflow: hidden;
}
#ChannelsPreview * {
  pointer-events: none !important;
}
#ChannelsPreview::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50px;
  background: linear-gradient(to bottom, var(--background-primary), transparent);
  z-index: 20;
}
#ChannelsPreview-container {
  position: absolute;
  bottom: 15px;
  left: 0;
  width: 100%;
}
#ChannelsPreview-container > * {
  list-style: none;
}
.${Selectors.Chat.chat} {
    --preview-darken-opacity: 0;
}
.${Selectors.Chat.chat}::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: #000;
  pointer-events: none;
  opacity: var(--preview-darken-opacity);
  transition: .3s opacity;
  z-index: 1000;
}
        `);
                }

                clearCss() {
                    PluginUtilities.removeStyle('ChannelsPreviewStyles');
                }

                onStop() {
                    this.clearCss();
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
