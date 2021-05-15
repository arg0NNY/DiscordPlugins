/**
 * @name ChannelsPreview
 * @displayName ChannelsPreview
 * @author arg0NNY
 * @authorId 224538553944637440
 * @website https://github.com/arg0NNY/DiscordPlugins/tree/master/ChannelsPreview
 * @source https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/ChannelsPreview/ChannelsPreview.plugin.js
 */

var ChannelsPreview = (() => {
	const config = {
		info: {
			name: "ChannelsPreview",
			authors: [
          {
            name: "arg0NNY",
  					discord_id: '224538553944637440',
  					github_username: 'arg0NNY'
          }
        ],
			description: "Shows recent messages when hovering over a channel in the guild's channels list.",
			version: "1.0.0",
			github: "https://github.com/arg0NNY/DiscordPlugins/tree/master/ChannelsPreview",
			github_raw: "https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/ChannelsPreview/ChannelsPreview.plugin.js"
		},
		defaultConfig: [
			{
				type: 'switch',
				id: 'show_images',
				name: 'Show Images',
				note: 'Show attached images in preview popout (takes up a lot of space).',
				value: false
			}
		]
	};

	return !global.ZeresPluginLibrary ? class {
		constructor(){this._config = config;}
		getName(){return config.info.name;}
		getAuthor(){return config.info.authors.map(a => a.name).join(", ");}
		getDescription(){return config.info.description;}
		getVersion(){return config.info.version;}
		load(){
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
		start(){}
		stop(){}
	} : (([Plugin, Api]) => {

		const getParent = (elem, parentSelector) => {
		  var parents = document.querySelectorAll(parentSelector);

		  for (var i = 0; i < parents.length; i++) {
		    var parent = parents[i];

		    if (parent.contains(elem)) {
		      return parent;
		    }
		  }

		  return null;
		}

		const plugin = (Plugin, Api) => {
			const { WebpackModules, DiscordSelectors, DiscordModules, Patcher, ReactComponents, PluginUtilities, Utilities, Logger, ColorConverter } = Api;
			const { React, ReactDOM, ChannelStore, UserStore, UserTypingStore, RelationshipStore, SelectedGuildStore, SelectedChannelStore, DiscordConstants, WindowInfo, MessageActions, MessageStore, GuildMemberStore, EmojiUtils } = DiscordModules;
			const Flux = WebpackModules.getByProps("connectStores");
			const MutedStore = WebpackModules.getByProps("isMuted", "isChannelMuted");
			const Spinner = WebpackModules.getByDisplayName("Spinner");
			const Tooltip = WebpackModules.getByDisplayName("Tooltip");
			const Colors = DiscordConstants.Colors;
			const Parser = WebpackModules.getByProps('parse', 'astParserFor');

			const toPx = px => px+'px';

			return class ChannelsPreview extends Plugin {
				onStart() {
					this.css();
					this.eventListeners();
        }

        onStop() {
					Patcher.unpatchAll();
					this.clearEventListeners();
					this.clearCss();
        }

				onMouseOver(e) {
					if (e.target?.classList.contains('da-mainContent') || getParent(e.target, '.da-mainContent')) {
						if ((e.target.classList.contains('da-mainContent') ? e.target : getParent(e.target, '.da-mainContent')).getAttribute('role') !== 'link') return;
						if (getParent(e.target, '.da-containerDefault').className.includes('da-selected')) return;

						try {
							this.channelId = (e.target.classList.contains('da-mainContent') ? e.target : getParent(e.target, '.da-mainContent')).getAttribute('data-list-item-id').split('channels___')[1];
						} catch (e) {
							Logger.info('Unable to get hovered channelId');
						}

						this.timeout = setTimeout(async () => {
							this.deny_popout = false;
							await MessageActions.fetchMessages({channelId: this.channelId, limit: 50});
							if (this.deny_popout) return;

							let messages = MessageStore.getMessages(this.channelId).toArray();
							if (messages.length !== 0) this.showPreviewPopout(this.channelId, messages);
						}, 250);
					}
				}

				onMouseOut() {
					clearTimeout(this.timeout);
					this.hidePreviewPopout();
					this.deny_popout = true;
				}

				eventListeners() {
					this.mouseoverEvent = this.onMouseOver.bind(this);
					this.mouseoutEvent = this.onMouseOut.bind(this);

					window.addEventListener('mouseover', this.mouseoverEvent);
					window.addEventListener('mouseout', this.mouseoutEvent);

					const ChannelItem = WebpackModules.getModule(m => Object(m.default).displayName==="ChannelItem");
					this.selectedChannel = SelectedChannelStore.getChannelId() ? SelectedChannelStore.getChannelId() : null;
					Patcher.after(ChannelItem, "default", (_, [props], returnValue) => {
						if(props.selected === true && props.channel.id !== this.selectedChannel) {
							this.onMouseOut();
							this.selectedChannel = props.channel.id;
						}
					});
				}

				clearEventListeners() {
					window.removeEventListener('mouseover', this.mouseoverEvent);
					window.removeEventListener('mouseout', this.mouseoutEvent);
				}

				processMessageContent(content, channel_id = null, is_reply = false) {
					let elem = document.createElement('div');
					let parsed = !is_reply ? Parser.parse(content, true, channel_id ? {channelId: channel_id} : {}) : Parser.parseInlineReply(content, true, channel_id ? {channelId: channel_id} : {});
					ReactDOM.render(React.createElement('div', { className: '' }, parsed), elem);
					return elem.firstChild.innerHTML;
				}

				processAttachments(attachments) {
					if (attachments?.length === 0) return '';

					for (let key in attachments) {
						let e = attachments[key];

						const MAX_HEIGHT = Math.min(200, e.height);
						const MAX_WIDTH = Math.min(400, e.width);

						if ((!(e.filename?.includes('png') || e.filename?.includes('jpg') || e.filename?.includes('jpeg') || e.filename?.includes('gif')) && !e.content_type?.includes('image'))) continue;

						return `<div class="messageAttachment-1aDidq da-messageAttachment">
							<a class="anchor-3Z-8Bb da-anchor anchorUnderlineOnHover-2ESHQB da-anchorUnderlineOnHover imageWrapper-2p5ogY da-imageWrapper imageZoom-1n-ADA da-imageZoom embedWrapper-lXpS3L da-embedWrapper" tabindex="0" href="${e.url}" rel="noreferrer noopener" target="_blank" role="button" style="height: ${toPx(MAX_HEIGHT * (e.width / e.height) > MAX_WIDTH ? MAX_WIDTH * (e.height / e.width) : MAX_HEIGHT)}; width: ${toPx(MAX_HEIGHT * (e.width / e.height) > MAX_WIDTH ? MAX_WIDTH : MAX_HEIGHT * (e.width / e.height))};">
								<img alt="" src="${e.proxy_url}" style="height: ${toPx(MAX_HEIGHT * (e.width / e.height) > MAX_WIDTH ? MAX_WIDTH * (e.height / e.width) : MAX_HEIGHT)}; width: ${toPx(MAX_HEIGHT * (e.width / e.height) > MAX_WIDTH ? MAX_WIDTH : MAX_HEIGHT * (e.width / e.height))};">
							</a>
						</div>`;
					}

					return '';
				}

				showPreviewPopout(channelId, messages) {
					this.hidePreviewPopout();

					let channelElem = document.querySelector(`.da-mainContent[data-list-item-id="channels___${channelId}"]`);
					if(!channelElem) return Logger.err('Couldn\'t locate channel link');
					let parentChannelElem = getParent(channelElem, '.da-containerDefault');
					if(!parentChannelElem) return Logger.err('Couldn\'t locate channel link');

					let popout = document.createElement('div');
					popout.id = 'BI--ChannelPreview';
					popout.className = 'group-spacing-16 themedPopout-1TrfdI';

					let popoutContainer = document.createElement('div');
					popoutContainer.id = 'BI--ChannelPreview-container';
					popout.appendChild(popoutContainer);

					let lastMessage = null;
					messages.forEach(message => {
						const isStart = lastMessage === null || lastMessage.author.id !== message.author.id || message.content === '' || message.messageReference !== null || new Date(message.timestamp.toDate()).getTime() - new Date(lastMessage.timestamp.toDate()).getTime() >= 5*60*1000;
						const author = UserStore.getUser(message.author.id);
						if (!author) return Logger.err('Unable to get author of message');
						const author_member = GuildMemberStore.getMember(SelectedGuildStore.getGuildId(), author.id);

						let reply, reply_author_member;
						if (message.messageReference !== null) {
							reply = MessageStore.getMessage(message.messageReference.channel_id, message.messageReference.message_id);
							if (!reply) reply = 404;
							else {
								reply_author_member = GuildMemberStore.getMember(SelectedGuildStore.getGuildId(), reply.author.id);
							}
						}

						let messageElem = document.createElement('div');
						messageElem.className = `message-2qnXI6 da-message cozyMessage-3V1Y8y da-cozyMessage ${message.mentioned ? 'mentioned-xhSam7 da-mentioned' : ''} wrapper-2a6GCs da-wrapper cozy-3raOZG da-cozy zalgo-jN1Ica da-zalgo ${isStart ? 'groupStart-23k01U da-groupStart' : ''} ${reply ? 'hasReply-34In-r da-hasReply' : ''}`;
						messageElem.innerHTML = `${reply ? `<div class="repliedMessage-VokQwo da-repliedMessage" aria-hidden="true">
							${reply !== 404 ? `<img alt="" src="${reply.author.getAvatarURL()}" class="replyAvatar-1K9Wmr da-replyAvatar">
							${reply.author.bot ? `<span class="botTagCompact-29bCci botTag-1un5a6 da-botTagCompact da-botTag botTagRegular-2HEhHi botTag-2WPJ74 da-botTagRegular rem-2m9HGf da-rem"><span class="botText-1526X_ da-botText">Bot</span></span>` : ''}
							<span class="username-1A8OIy da-username" aria-controls="popout_8691" aria-expanded="false" role="button" tabindex="0" style="color: rgb(${ColorConverter.getRGB(!reply_author_member || !reply_author_member.colorString ? '#ffffff' : reply_author_member.colorString).join(', ')});">${message.mentions.length > 0 ? '@' : ''}${!reply_author_member || !reply_author_member.nick ? reply.author.username : reply_author_member.nick}</span>
							<div class="repliedTextPreview-2NBljf da-repliedTextPreview" role="button" tabindex="0"><div class="repliedTextContent-1R3vnK da-repliedTextContent markup-2BOw-j da-markup messageContent-2qWWxC da-messageContent">${this.processMessageContent(reply.content, message.channel_id, true)}</div></div>` : '<span class="repliedTextPlaceholder-dmN7D1 da-repliedTextPlaceholder">Unable to get message</span>'}
							${reply?.attachments?.length > 0 || reply?.embeds?.length > 0 ? `<svg class="repliedTextContentIcon-1ivTae da-repliedTextContentIcon" aria-hidden="false" width="64" height="64" viewBox="0 0 64 64"><path fill="currentColor" d="M56 50.6667V13.3333C56 10.4 53.6 8 50.6667 8H13.3333C10.4 8 8 10.4 8 13.3333V50.6667C8 53.6 10.4 56 13.3333 56H50.6667C53.6 56 56 53.6 56 50.6667ZM22.6667 36L29.3333 44.0267L38.6667 32L50.6667 48H13.3333L22.6667 36Z"></path></svg>` : ''}
						</div>` : ''}

						<div class="contents-2mQqc9 da-contents" role="document">
							${isStart ? `<img src="${author.getAvatarURL()}" aria-hidden="true" class="avatar-1BDn8e da-avatar clickable-1bVtEA da-clickable" alt=" " data-user-id="${author.id}">
							<h2 class="header-23xsNx da-header">
								<span class="headerText-3Uvj1Y da-headerText">
									<span class="username-1A8OIy da-username" aria-expanded="false" role="button" tabindex="0" style="color: rgb(${ColorConverter.getRGB(!author_member || !author_member.colorString ? '#ffffff' : author_member.colorString).join(', ')});">${!author_member || !author_member.nick ? author.username : author_member.nick}</span>
									${message.author.bot ? `<span class="botTagCompact-29bCci botTag-1un5a6 da-botTagCompact da-botTag botTagRegular-2HEhHi botTag-2WPJ74 da-botTagRegular rem-2m9HGf da-rem"><span class="botText-1526X_ da-botText">Bot</span></span>` : ''}
								</span>
								<span class="timestamp-3ZCmNB da-timestamp timestampInline-yHQ6fX da-timestampInline">
									<time aria-label="${message.timestamp.calendar()}" datetime="${message.timestamp.get()}"><i class="separator-2nZzUB da-separator" aria-hidden="true"> — </i>${message.timestamp.calendar()}</time>
								</span>
							</h2>` : ''}
							<div class="markup-2BOw-j da-markup messageContent-2qWWxC da-messageContent">${this.processMessageContent(message.content, message.channel_id)}${(message.attachments.length > 0 && (!this.settings.show_images || message.attachments.some(e => (!e.content_type?.includes('image'))))) || message.embeds.length > 0 ? `<svg class="repliedTextContentIcon-1ivTae da-repliedTextContentIcon" aria-hidden="false" width="64" height="64" viewBox="0 0 64 64" style="display: block;"><path fill="currentColor" d="M56 50.6667V13.3333C56 10.4 53.6 8 50.6667 8H13.3333C10.4 8 8 10.4 8 13.3333V50.6667C8 53.6 10.4 56 13.3333 56H50.6667C53.6 56 56 53.6 56 50.6667ZM22.6667 36L29.3333 44.0267L38.6667 32L50.6667 48H13.3333L22.6667 36Z"></path></svg>` : ''}</div>
						</div>
						<div class="container-1ov-mD da-container">${this.settings.show_images ? this.processAttachments(message.attachments) : ''}</div>`;

						popoutContainer.appendChild(messageElem);

						lastMessage = message;
					});

					document.body.appendChild(popout);
					document.querySelector('.da-chat').classList.add('BI--channel-preview');

					popout.style.left = toPx(parentChannelElem.getBoundingClientRect().x + parentChannelElem.clientWidth + 30);
					popout.style.top = toPx(parentChannelElem.getBoundingClientRect().y + parentChannelElem.clientHeight/2 - popout.clientHeight/2);
					if(parseInt(popout.style.top) < 30) popout.style.top = toPx(30); else if (parseInt(popout.style.top) + popout.clientHeight > window.innerHeight - 30) popout.style.top = toPx(window.innerHeight - popout.clientHeight - 30);

					popout.classList.add('show');
				}

				hidePreviewPopout() {
					document.querySelectorAll('#BI--ChannelPreview').forEach(popout => {
						popout.classList.remove('show');
						setTimeout(() => popout.remove(), 400);
					});
					document.querySelector('.da-chat').classList.remove('BI--channel-preview');
				}

				css() {
					PluginUtilities.addStyle('BetterInterface--ChannelPreview', `
#BI--ChannelPreview {
	position: absolute;
	pointer-events: none;
	background: ${Colors.PRIMARY_DARK_600};
	border-radius: 10px;
	height: 30vh;
	min-height: 150px;
	width: 50vw;
	min-width: 350px;
	overflow: hidden;
	z-index: 2004;
	opacity: 0;
	transform: translateX(10px);
	transition: .4s opacity, .4s transform;
}
#BI--ChannelPreview.show {
	opacity: 1;
	transform: translateX(0);
}
#BI--ChannelPreview::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 50px;
	background: linear-gradient(to bottom, ${Colors.PRIMARY_DARK_600}, transparent);
	z-index: 20;
}
#BI--ChannelPreview-container > .da-message {
	width: 100%;
	box-sizing: border-box;
}
#BI--ChannelPreview-container .da-header, #BI--ChannelPreview-container .da-repliedMessage {
	white-space: inherit;
}
#BI--ChannelPreview-container .da-repliedTextPreview .inline {
	white-space: nowrap !important;
}
#BI--ChannelPreview-container {
	position: absolute;
	bottom: 15px;
	left: 0;
	width: 100%;
	display: flex;
	align-items: flex-end;
	justify-content: stretch;
	flex-wrap: wrap;
}
.da-chat::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	width: 100%;
	background: #000;
	pointer-events: none;
	opacity: 0;
	transition: .4s opacity;
	z-index: 2000;
}
.da-chat.BI--channel-preview::before {
	opacity: .4;
}
.da-mainContent > * {
	pointer-events: none;
}
					`);
				}

				clearCss() {
					PluginUtilities.removeStyle('BetterInterface--ChannelPreview');
				}

				getSettingsPanel() {
					return this.buildSettingsPanel().getElement();
				}
			};
		};
		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
