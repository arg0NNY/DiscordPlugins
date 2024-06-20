/**
 * @name BetterChannelList
 * @author arg0NNY
 * @authorLink https://github.com/arg0NNY/DiscordPlugins
 * @invite M8DBtcZjXD
 * @donate https://donationalerts.com/r/arg0nny
 * @version 1.0.6
 * @description 3 in 1: Shows the most recent message for each channel, brings channel list redesign from the new mobile UI and allows you to alter the sidebar width.
 * @website https://github.com/arg0NNY/DiscordPlugins/tree/master/BetterChannelList
 * @source https://github.com/arg0NNY/DiscordPlugins/blob/master/BetterChannelList/BetterChannelList.plugin.js
 * @updateUrl https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/BetterChannelList/BetterChannelList.plugin.js
 */

module.exports = (() => {
  const config = {
    "info": {
      "name": "BetterChannelList",
      "authors": [
        {
          "name": "arg0NNY",
          "discord_id": '224538553944637440',
          "github_username": 'arg0NNY'
        }
      ],
      "version": "1.0.6",
      "description": "3 in 1: Shows the most recent message for each channel, brings channel list redesign from the new mobile UI and allows you to alter the sidebar width.",
      github: "https://github.com/arg0NNY/DiscordPlugins/tree/master/BetterChannelList",
      github_raw: "https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/BetterChannelList/BetterChannelList.plugin.js"
    },
    "changelog": [
      {
        "type": "fixed",
        "title": "Fixed",
        "items": [
          "Updated to work in the latest release of Discord."
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
      BdApi.UI.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
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
        Webpack,
        DOM
      } = new BdApi(config.info.name)
      const { Filters } = Webpack

      const {
        Patcher,
        WebpackModules,
        DiscordModules,
        Logger,
        Utilities,
        DOMTools,
        DiscordClasses
      } = Api

      const {
        Dispatcher,
        ChannelStore,
        GuildChannelsStore,
        UserStore,
        SelectedGuildStore,
        React,
        ReactDOM,
        RelationshipStore,
        MessageStore
      } = DiscordModules

      const Data = new Proxy({}, {
        get (_, k) {
          return BdApi.Data.load(config.info.name, k)
        },
        set (_, k, v) {
          BdApi.Data.save(config.info.name, k, v)
          return true
        }
      })

      const SIDEBAR_DEFAULT_WIDTH = 240
      const SIDEBAR_REDESIGNED_DEFAULT_WIDTH = 300
      const SIDEBAR_MIN_WIDTH = 190
      const SIDEBAR_MAX_WIDTH = 640

      const { getSocket } = WebpackModules.getByProps('getSocket')
      const Common = WebpackModules.getByProps('Shakeable', 'List')
      const ChannelItem = Webpack.getWithKey(Filters.byStrings('hasActiveThreads', 'linkBottom'))
      const ChannelItemIcon = Webpack.getModule(Filters.byStrings('channel', 'iconContainerWithGuildIcon'), { searchExports: true })
      const ChannelTypes = WebpackModules.getModule(Filters.byKeys('GUILD_TEXT'), { searchExports: true })
      const MessageTypes = WebpackModules.getModule(Filters.byKeys('REPLY', 'USER_JOIN'), { searchExports: true })
      const LocaleStore = WebpackModules.getModule(m => m.Messages?.IMAGE)
      const useStateFromStores = Webpack.getModule(Filters.byStrings('useStateFromStores'), { searchExports: true })
      const ForumPostAuthor = WebpackModules.getByString('FORUM_POST_AUTHOR')
      const buildMessageReplyContent = WebpackModules.getModule(Filters.byStrings('REPLY_QUOTE_MESSAGE_BLOCKED'), { searchExports: true })
      const buildMessageContent = WebpackModules.getByString('parseInlineReply')
      const ListNavigatorProvider = Webpack.getWithKey(Filters.byStrings('containerProps', 'tabIndex', 'Provider', 'orientation'))
      const astToString = Webpack.getByRegex(/"string"==typeof \w+\.content\?\w+\.push\(\w+\.content\):null/, { searchExports: true })
      const JoinMessages = WebpackModules.getByProps('getSystemMessageUserJoin')
      const useNullableMessageAuthor = Webpack.getModule(Filters.byStrings('getNickname', 'author.bot'), { searchExports: true })
      const getRoleSubscriptionPurchaseSystemMessageAstFormattedContent = Webpack.getModule(m => Filters.byStrings('roleSubscriptionData', 'astFormat')(m) && !Filters.byStrings('SUBSCRIPTION_RENEW_WITH_DURATION_MOBILE')(m), { searchExports: true })
      const getApplicationSubscriptionSystemMessageASTContent = Webpack.getModule(Filters.byStrings('SYSTEM_MESSAGE_APPLICATION_SUBSCRIPTION_PURCHASE_MOBILE'), { searchExports: true })
      const getPrivateChannelIntegrationAddedSystemMessageASTContent = Webpack.getModule(Filters.byStrings('PRIVATE_CHANNEL_INTEGRATION_ADDED_MOBILE'), { searchExports: true })
      const getPrivateChannelIntegrationRemovedSystemMessageASTContent = Webpack.getModule(Filters.byStrings('PRIVATE_CHANNEL_INTEGRATION_REMOVED_MOBILE'), { searchExports: true })
      const Emoji = Webpack.getModule(Filters.byStrings('allowAnimatedEmoji', 'isFocused'), { searchExports: true })
      const ThemeStore = Webpack.getStore('ThemeStore')
      const ColorUtils = {
        hexWithOpacity (color, opacity) {
          const _opacity = Math.round(Math.min(Math.max(opacity ?? 1, 0), 1) * 255);
          return color + _opacity.toString(16).toUpperCase();
        }
      }
      const SortedVoiceStateStore = Webpack.getStore('SortedVoiceStateStore')
      const isLimited = WebpackModules.getByString('permissionOverwrites', 'VIEW_CHANNEL', 'CONNECT')
      const GuildBanner = WebpackModules.getModule(m => Filters.byStrings('guildBanner')(m?.type))
      const ActiveThreadsStore = Webpack.getStore('ActiveThreadsStore')
      const AppView = Webpack.getWithKey(Filters.byStrings('sidebarTheme', 'GUILD_DISCOVERY'))
      const DevToolsDesignTogglesStore = Webpack.getStore('DevToolsDesignTogglesStore')

      const Selectors = {
        ChannelItem: WebpackModules.getByProps('unread', 'link'),
        ForumPost: WebpackModules.getByProps('message', 'typing'),
        Message: WebpackModules.getByProps('repliedTextPreview', 'repliedTextContent'),
        ForumPostMessage: {
          ...WebpackModules.getByProps('inlineFormat', 'markup'),
          ...WebpackModules.getByProps('author', 'hasUnreads')
        },
        App: WebpackModules.getByProps('app', 'layers'),
        Base: WebpackModules.getByProps('base', 'sidebar'),
        DirectMessages: WebpackModules.getByProps('activity', 'channel'),
        GuildHeader: WebpackModules.getByProps('bannerImage', 'bannerImg'),
        Margins: DiscordClasses.Margins,
        SidebarFooter: WebpackModules.getByProps('nameTag', 'avatarWrapper')
      }

      function deepEqual (x, y) {
        const ok = Object.keys, tx = typeof x, ty = typeof y
        return x && y && tx === 'object' && tx === ty ? (
          ok(x).length === ok(y).length &&
          ok(x).every(key => deepEqual(x[key], y[key]))
        ) : (x === y)
      }

      function forceAppUpdate (reason = null) {
        const locale = LocaleStore.getLocale()
        Dispatcher.dispatch({ type: 'I18N_LOAD_START', locale })
        setTimeout(() => Dispatcher.dispatch({ type: 'I18N_LOAD_SUCCESS', locale }))

        Logger.log(`Forced app update.` + (reason ? ` Reason: ${reason}` : ''))
      }

      function requestLastMessages (guildId, channelIds = null) {
        if (guildId === null) return

        channelIds = channelIds ?? GuildChannelsStore.getSelectableChannelIds(guildId)

        getSocket().requestLastMessages(
          guildId,
          channelIds ?? GuildChannelsStore.getSelectableChannelIds(guildId)
        )
        Logger.log(`Requested last messages for guild ${guildId} channels:`, channelIds)
      }

      let selectedGuildId = null
      function handleChannelSelect ({ guildId }) {
        if (selectedGuildId !== guildId)
          requestLastMessages(
            guildId,
            GuildChannelsStore.getSelectableChannelIds(guildId)
          )

        selectedGuildId = guildId
      }

      function handleChannelUpdates ({ channels }) {
        if (channels.some(c => c.guild_id === selectedGuildId))
          requestLastMessages(selectedGuildId)
      }

      function handleGuildMemberUpdate ({ guildId, user }) {
        if (user.id === UserStore.getCurrentUser().id && guildId === selectedGuildId)
          requestLastMessages(guildId)
      }

      function updateGuildIfCurrent ({ guildId }) {
        if (guildId === selectedGuildId)
          requestLastMessages(guildId)
      }

      function updateChannel ({ channelId }) {
        const guildId = ChannelStore.getChannel(channelId)?.guild_id
        if (guildId === selectedGuildId)
          requestLastMessages(
            guildId,
            [channelId]
          )
      }

      function handleMessagePreviewsLoaded ({ messages }) {
        for (const message of messages) {
          Dispatcher.dispatch({
            type: 'LOAD_MESSAGES_SUCCESS',
            channelId: message.channel_id,
            hasMoreAfter: false,
            hasMoreBefore: true,
            isAfter: true,
            isBefore: false,
            isStale: true,
            limit: 1,
            messages: [message]
          })
        }
      }

      const DispatcherSubscriptions = {
        CHANNEL_SELECT: handleChannelSelect,
        MESSAGE_DELETE: updateChannel,
        CHANNEL_UPDATES: handleChannelUpdates,
        GUILD_MEMBER_UPDATE: handleGuildMemberUpdate,
        GUILD_ROLE_CREATE: updateGuildIfCurrent,
        GUILD_ROLE_UPDATE: updateGuildIfCurrent,
        GUILD_ROLE_DELETE: updateGuildIfCurrent,
        IMPERSONATE_UPDATE: updateGuildIfCurrent,
        IMPERSONATE_STOP: updateGuildIfCurrent,
        TRUNCATE_MESSAGES: updateChannel,
        MESSAGE_PREVIEWS_LOADED: handleMessagePreviewsLoaded
      }

      function buildLastMessageContent (channel, message) {
        const format = astToString
        const author = useNullableMessageAuthor(message)

        if (!message) return null

        switch (message.type) {
          case MessageTypes.USER_JOIN:
            return format(
              JoinMessages.getSystemMessageUserJoin(message.id)
                .astFormat({
                  username: author?.nick ?? message.author.username,
                  usernameHook: e => e
                })
            )

          case MessageTypes.ROLE_SUBSCRIPTION_PURCHASE:
            return format(
              getRoleSubscriptionPurchaseSystemMessageAstFormattedContent({
                username: author?.nick ?? message.author.username,
                guildId: channel.guild_id,
                roleSubscriptionData: message.roleSubscriptionData
              })
            )

          case MessageTypes.GUILD_APPLICATION_PREMIUM_SUBSCRIPTION:
            return format(
              getApplicationSubscriptionSystemMessageASTContent({
                application: message.application,
                username: author?.nick
              })
            )

          case MessageTypes.PRIVATE_CHANNEL_INTEGRATION_ADDED:
            return format(
              getPrivateChannelIntegrationAddedSystemMessageASTContent({
                application: message.application,
                username: author?.nick
              })
            )

          case MessageTypes.PRIVATE_CHANNEL_INTEGRATION_REMOVED:
            return format(
              getPrivateChannelIntegrationRemovedSystemMessageASTContent({
                application: message.application,
                username: author?.nick
              })
            )

          case MessageTypes.GUILD_DEADCHAT_REVIVE_PROMPT:
            return message?.content ?? LocaleStore.Messages.DEADCHAT_PROMPT_1
        }

        if (message.content)
          return buildMessageContent(
            message,
            {
              formatInline: true,
              noStyleAndInteraction: true,
              allowHeading: false,
              allowList: false,
              allowLinks: true,
              disableAnimatedEmoji: true
            }
          ).content

        return null
      }

      function ChannelLastMessage ({ channel, unread, muted, noColor }) {
        const message = useStateFromStores([MessageStore], () => MessageStore.getMessages(channel.id)?.last())
        const author = useStateFromStores([UserStore], () => message?.author && UserStore.getUser(message.author.id))

        const isAuthorBlocked = useStateFromStores([RelationshipStore], () => author && RelationshipStore.isBlocked(author.id))

        const messageContent = buildLastMessageContent(channel, message)

        if (!message) return null

        const { contentPlaceholder, icon, renderedContent } = buildMessageReplyContent(
          message,
          messageContent,
          isAuthorBlocked,
          `${Selectors.ForumPost.messageContent} ${Selectors.ForumPostMessage.inlineFormat}`,
          {
            iconClass: Selectors.ForumPost.messageContentIcon,
            iconSize: 16
          }
        )

        const color = unread ? 'header-secondary' : 'text-muted'

        let content
        if (isAuthorBlocked) {
          content = React.createElement(
            Common.Text,
            {
              className: Selectors.ForumPost.blockedMessage,
              variant: 'text-sm/medium',
              color: 'text-muted',
              children: LocaleStore.Messages.BLOCKED_MESSAGES.format({ count: 1 })
            }
          )
        }
        else {
          content = renderedContent
            ? React.createElement(
              Common.Text,
              {
                variant: 'text-sm/semibold',
                color,
                className: Selectors.ForumPost.messageFocusBlock,
                children: renderedContent
              }
            )
            : React.createElement(
              Common.Text,
              {
                tag: 'span',
                variant: 'text-sm/medium',
                color,
                className: `${Selectors.ForumPost.messageContent} ${Selectors.Message.repliedTextPlaceholder} ${Selectors.ForumPostMessage.inlineFormat}`,
                children: contentPlaceholder
              }
            )
        }

        return React.createElement(
          Common.Text,
          {
            className: `${Selectors.ForumPost.message} BCL--last-message ${muted ? 'BCL--last-message--muted' : ''} ${noColor ? 'BCL--last-message--no-color' : ''}`,
            variant: 'text-sm/semibold',
            color
          },
          [
            !isAuthorBlocked
            && !['USER_JOIN', 'ROLE_SUBSCRIPTION_PURCHASE', 'GUILD_APPLICATION_PREMIUM_SUBSCRIPTION', 'GUILD_DEADCHAT_REVIVE_PROMPT', 'GUILD_GAMING_STATS_PROMPT']
              .some(t => message.type === MessageTypes[t])
            && React.createElement(
              ForumPostAuthor,
              {
                message,
                channel: Object.assign(channel, { ownerId: message.author.id }),
                hasUnreads: unread && !muted,
                renderColon: true
              }
            ),
            [content, icon]
          ]
        )
      }

      function useChannelEmoji (channel) {
        const name = channel.iconEmoji?.name ?? '🌐'
        const theme = useStateFromStores([ThemeStore], () => ThemeStore.theme)

        return {
          color: ColorUtils.hexWithOpacity(
            BCL__emojiColors[name] ?? '#607D8B',
            theme === 'dark' ? .2 : .16
          ),
          emojiName: name,
          emojiId: channel.iconEmoji?.id
        }
      }
      function ChannelEmojiIcon ({ channel }) {
        const { color, emojiName, emojiId } = useChannelEmoji(channel)

        return React.createElement(
          'div',
          { className: 'BCL--channel-icon', style: { '--bcl-channel-icon-bg': color } },
          React.createElement(
            Emoji,
            { emojiId, emojiName, animated: false }
          )
        )
      }

      function ChannelVoiceIcon () {
        return React.createElement(
          'svg',
          { xmlns: 'http://www.w3.org/2000/svg', width: '14px', height: '14px', viewBox: '0 0 24 24', className: 'BCL--channel-name-icon' },
          React.createElement(
            'path',
            { fill: 'currentColor', d: 'M11.383 3.07904C11.009 2.92504 10.579 3.01004 10.293 3.29604L6 8.00204H3C2.45 8.00204 2 8.45304 2 9.00204V15.002C2 15.552 2.45 16.002 3 16.002H6L10.293 20.71C10.579 20.996 11.009 21.082 11.383 20.927C11.757 20.772 12 20.407 12 20.002V4.00204C12 3.59904 11.757 3.23204 11.383 3.07904ZM14 5.00195V7.00195C16.757 7.00195 19 9.24595 19 12.002C19 14.759 16.757 17.002 14 17.002V19.002C17.86 19.002 21 15.863 21 12.002C21 8.14295 17.86 5.00195 14 5.00195ZM14 9.00195C15.654 9.00195 17 10.349 17 12.002C17 13.657 15.654 15.002 14 15.002V13.002C14.551 13.002 15 12.553 15 12.002C15 11.451 14.551 11.002 14 11.002V9.00195Z' }
          )
        )
      }

      function ChannelStageIcon () {
        return React.createElement(
          'svg',
          { xmlns: 'http://www.w3.org/2000/svg', width: '14px', height: '14px', viewBox: '0 0 24 24', className: 'BCL--channel-name-icon' },
          React.createElement(
            'path',
            { fill: 'currentColor', d: 'M14 13C14 14.1 13.1 15 12 15C10.9 15 10 14.1 10 13C10 11.9 10.9 11 12 11C13.1 11 14 11.9 14 13ZM8.5 20V19.5C8.5 17.8 9.94 16.5 12 16.5C14.06 16.5 15.5 17.8 15.5 19.5V20H8.5ZM7 13C7 10.24 9.24 8 12 8C14.76 8 17 10.24 17 13C17 13.91 16.74 14.75 16.31 15.49L17.62 16.25C18.17 15.29 18.5 14.19 18.5 13C18.5 9.42 15.58 6.5 12 6.5C8.42 6.5 5.5 9.42 5.5 13C5.5 14.18 5.82 15.29 6.38 16.25L7.69 15.49C7.26 14.75 7 13.91 7 13ZM2.5 13C2.5 7.75 6.75 3.5 12 3.5C17.25 3.5 21.5 7.75 21.5 13C21.5 14.73 21.03 16.35 20.22 17.75L21.51 18.5C22.45 16.88 23 15 23 13C23 6.93 18.07 2 12 2C5.93 2 1 6.93 1 13C1 15 1.55 16.88 2.48 18.49L3.77 17.74C2.97 16.35 2.5 14.73 2.5 13Z' }
          )
        )
      }

      function ChannelLockedIcon () {
        return React.createElement(
          'svg',
          { xmlns: 'http://www.w3.org/2000/svg', width: '14px', height: '14px', viewBox: '0 0 24 24', className: 'BCL--channel-name-icon' },
          React.createElement(
            'path',
            { fill: 'currentColor', d: 'M17 11V7C17 4.243 14.756 2 12 2C9.242 2 7 4.243 7 7V11C5.897 11 5 11.896 5 13V20C5 21.103 5.897 22 7 22H17C18.103 22 19 21.103 19 20V13C19 11.896 18.103 11 17 11ZM12 18C11.172 18 10.5 17.328 10.5 16.5C10.5 15.672 11.172 15 12 15C12.828 15 13.5 15.672 13.5 16.5C13.5 17.328 12.828 18 12 18ZM15 11H9V7C9 5.346 10.346 4 12 4C13.654 4 15 5.346 15 7V11Z' }
          )
        )
      }

      function ChannelIcon ({ channel, locked }) {
        if (locked) return React.createElement(ChannelLockedIcon)
        if (channel.isGuildStageVoice()) return React.createElement(ChannelStageIcon)
        if (channel.isGuildVoice()) return React.createElement(ChannelVoiceIcon)
        return React.createElement(ChannelItemIcon, { channel, locked })
      }

      function ChannelVoiceBadge ({ channel, locked, connected, selected }) {
        const getLockedLabel = () => LocaleStore.Messages.CHANNEL_TOOLTIP_VOICE_LOCKED.match(/\((.+)\)/)?.[1] ?? LocaleStore.Messages.JOIN

        const voiceStates = useStateFromStores([SortedVoiceStateStore], () => SortedVoiceStateStore.getVoiceStatesForChannel(channel))
        const formatCount = n => n.toString().padStart(2, '0')

        const hasUserLimit = channel.userLimit > 0 && channel.userLimit !== 10000

        if (connected && selected) return null
        return React.createElement(
          'div',
          { className: 'BCL--voice-badge' + (locked ? ' BCL--voice-badge--locked' : '') },
          [
            React.createElement(ChannelIcon, { channel, locked }),
            hasUserLimit && !locked && React.createElement('span', { children: `${formatCount(voiceStates.length)}/${formatCount(channel.userLimit)}` })
          ]
        )
      }

      function ChannelLimitedIcon () {
        return React.createElement(
          'svg',
          { xmlns: 'http://www.w3.org/2000/svg', width: '14px', height: '14px', viewBox: '0 0 256 256', className: 'BCL--channel-name-icon' },
          React.createElement(
            'path',
            { fill: 'currentColor', d: 'M208 80h-32V56a48 48 0 0 0-96 0v24H48a16 16 0 0 0-16 16v112a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V96a16 16 0 0 0-16-16Zm-72 78.63V184a8 8 0 0 1-16 0v-25.37a24 24 0 1 1 16 0ZM160 80H96V56a32 32 0 0 1 64 0Z' }
          )
        )
      }

      function ChannelNsfwIcon () {
        return React.createElement(
          'svg',
          { xmlns: 'http://www.w3.org/2000/svg', width: '14px', height: '14px', viewBox: '0 0 256 256', className: 'BCL--channel-name-icon' },
          React.createElement(
            'path',
            { fill: 'currentColor', d: 'M236.8 188.09L149.35 36.22a24.76 24.76 0 0 0-42.7 0L19.2 188.09a23.51 23.51 0 0 0 0 23.72A24.35 24.35 0 0 0 40.55 224h174.9a24.35 24.35 0 0 0 21.33-12.19a23.51 23.51 0 0 0 .02-23.72ZM120 104a8 8 0 0 1 16 0v40a8 8 0 0 1-16 0Zm8 88a12 12 0 1 1 12-12a12 12 0 0 1-12 12Z' }
          )
        )
      }

      function ChannelNameIcons ({ channel, locked }) {
        return React.createElement(
          React.Fragment, {},
          [
            !locked && isLimited(channel) && React.createElement(ChannelLimitedIcon),
            channel.isNSFW() && React.createElement(ChannelNsfwIcon)
          ]
        )
      }

      function ResizeHandler ({ onResize, onClick }) {
        const [dragging, setDragging] = React.useState(false)

        React.useEffect(() => {
          const onMouseUp = () => setDragging(false)
          const onMouseMove = e => dragging && onResize?.(e)

          window.addEventListener('mouseup', onMouseUp)
          window.addEventListener('mousemove', onMouseMove)
          return () => {
            window.removeEventListener('mouseup', onMouseUp)
            window.removeEventListener('mousemove', onMouseMove)
          }
        }, [dragging])

        return React.createElement(
          'div',
          {
            className: 'BCL--resize-handler-container',
            style: { '--just-a-style-attr-for-bd-toasts-to-position-correctly': '\':)\'' }
          },
          React.createElement('div', {
            className: 'BCL--resize-handler' + (dragging ? ' BCL--resize-handler--dragging' : ''),
            onMouseDown: () => setDragging(true),
            onClick
          })
        )
      }

      function ForumActivePostsCount ({ channel, unread }) {
        const count = useStateFromStores([ActiveThreadsStore], () => Object.keys(
          ActiveThreadsStore.getThreadsForParent(channel.guild_id, channel.id)
        ).length)

        return count ? React.createElement(
          Common.Text,
          {
            className: `${Selectors.ForumPost.message} BCL--last-message`,
            variant: 'text-sm/medium',
            color: unread ? 'header-secondary' : 'text-muted'
          },
          LocaleStore.Messages.ACTIVE_FORUM_POST_COUNT.format({ count })
        ) : null
      }

      const byClassName = c => m => m?.props?.className?.includes(c)

      return class BetterChannelList extends Plugin {
        willRenderLastMessage (channelId) {
          return this.settings.lastMessage.enabled && !!MessageStore.getMessages(channelId)?.last()
        }

        onStart () {
          this.injectStyle()

          selectedGuildId = SelectedGuildStore.getGuildId()
          requestLastMessages(selectedGuildId)

          Object.entries(DispatcherSubscriptions)
            .forEach(s => Dispatcher.subscribe(...s))

          this.enableDiscordInternalEmojiIconModules()
          this.patchChannelItem()
          this.patchScrollerProvider()
          this.injectResizer()

          forceAppUpdate('Plugin enabled')
        }

        enableDiscordInternalEmojiIconModules () {
          Patcher.after(DevToolsDesignTogglesStore, 'get', (self, [type]) => {
            if (type === 'enable_channel_emojis') return true
          })
        }

        get styleName () {
          return this.getName() + '-style'
        }

        injectStyle () {
          DOM.addStyle(this.styleName, `
            .BCL--last-message {
              pointer-events: none;
              padding-top: 2px;
            }
            .BCL--last-message.BCL--last-message--no-color .${Selectors.ForumPostMessage.author} * {
              color: var(--text-muted) !important;
            }
            .BCL--last-message.BCL--last-message--no-color .${Selectors.ForumPostMessage.author}.${Selectors.ForumPostMessage.hasUnreads} * {
              color: var(--header-primary) !important;
            }
            .BCL--last-message * {
              font-weight: 500 !important;
            }
            .${Selectors.ChannelItem.wrapper}.${Selectors.ChannelItem.modeMuted}:not(:hover) .BCL--last-message * {
              color: var(--interactive-muted) !important;
            }
            
            .BCL--last-message .${Selectors.ForumPost.messageFocusBlock}:first-child > * {
              margin-left: 0 !important;
            }
            
            .BCL--channel-wrapper {
              display: flex;
              flex-direction: row;
              align-items: center;
              gap: 8px;
            }
            .BCL--channel-info {
              display: flex;
              flex-direction: column;
              flex: 1;
              min-width: 0;
            }
            
            .BCL--channel-icon {
              flex-shrink: 0;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background-color: var(--bcl-channel-icon-bg, var(--background-tertiary));
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .BCL--channel-icon .emoji {
              width: 20px;
              height: 20px;
            }
            .${Selectors.ChannelItem.wrapper}.${Selectors.ChannelItem.modeMuted}:not(:hover) .BCL--channel-icon {
              opacity: .3;
            }
            
            .BCL--channel-info .${Selectors.ChannelItem.linkTop} > .${Selectors.ChannelItem.iconContainer} {
              display: none;
            }
            .BCL--channel-info .${Selectors.ChannelItem.linkBottom} {
              margin-left: 0;
            }
            
            .BCL--voice-badge {
              background: var(--background-secondary-alt);
              color: var(--text-normal);
              padding: 5px 8px;
              border-radius: 100px;
              display: flex;
              align-items: center;
              gap: 5px;
              font-size: 12px;
              font-weight: 500;
              margin: -5px 0 -5px 4px;
            }
            .BCL--voice-badge .${Selectors.ChannelItem.iconContainer} {
              margin-right: 0 !important;
            }
            .BCL--voice-badge svg {
              width: 14px;
              height: 14px;
              color: inherit !important;
            }
            .${Selectors.ChannelItem.wrapper}:is(:hover, :focus, :focus-within) .BCL--voice-badge:not(.BCL--voice-badge--locked) {
              display: none;
            }
            
            .BCL--channel-info .${Selectors.ChannelItem.name} {
              display: flex;
              align-items: center;
              gap: 3px;
            }
            .BCL--channel-info .${Selectors.ChannelItem.name} > span {
              overflow: hidden;
              text-overflow: ellipsis;
              min-width: 0;
            }
            .BCL--channel-name-icon {
              flex-shrink: 0;
              color: var(--channels-default);
            }
            .${Selectors.ChannelItem.wrapper}.${Selectors.ChannelItem.modeMuted}:not(:hover) .BCL--channel-name-icon {
              color: var(--interactive-muted);
            }
            
            .BCL--resize-handler-container {
              position: relative;
              height: 100%;
            }
            .BCL--resize-handler {
              position: absolute;
              top: 0;
              left: 0;
              height: 100%;
              width: 5px;
              z-index: 150;
              cursor: ew-resize;
            }
            .BCL--resize-handler::before {
              content: '';
              position: absolute;
              inset: 0;
              background: var(--green-360);
              transform-origin: left center;
              transform: scaleX(0);
              transition: .2s transform;
            }
            .BCL--resize-handler:is(:hover, .BCL--resize-handler--dragging)::before {
              transform: scaleX(50%);
              transition-delay: .1s;
            }
            
            /* Discord's style fixes */
            /* ===================== */
            
            .${Selectors.DirectMessages.channel} {
              max-width: unset !important;
            }
            .${Selectors.GuildHeader.bannerImage}, .${Selectors.GuildHeader.bannerImg} {
              width: 100%;
            }
            .${Selectors.SidebarFooter.avatarWrapper} {
              flex: 1;
              min-width: 0;
            }
          `)
        }

        patchChannelItem () {
          Patcher.after(...ChannelItem, (self, [{ channel, guild, muted, selected, unread, locked, connected }], value) => {
            const link = Utilities.findInReactTree(value, byClassName(Selectors.ChannelItem.link))
            if (!link) return

            const { children } = link.props

            // Inject last message
            if (this.settings.lastMessage.enabled && [ChannelTypes.GUILD_TEXT, ChannelTypes.GUILD_ANNOUNCEMENT].includes(channel.type))
              children.push(
                React.createElement(ChannelLastMessage, { channel, guild, muted, selected, unread, locked, noColor: !this.settings.lastMessage.roleColors })
              )

            /**
             * Channel item redesign
             */
            // TODO: Add support for threads/posts
            if (!this.settings.redesign.enabled) return

            if (channel.type === ChannelTypes.GUILD_FORUM)
              children.push(
                React.createElement(ForumActivePostsCount, { channel, unread })
              )

            // Emoji icon
            link.props.className += ' BCL--channel-wrapper' + (muted ? ' BCL--channel-wrapper--muted' : '')
            link.props.children = [
              React.createElement(ChannelEmojiIcon, { channel }),
              React.createElement('div', { className: 'BCL--channel-info', children })
            ]

            // Voice channel badge
            if ([ChannelTypes.GUILD_VOICE, ChannelTypes.GUILD_STAGE_VOICE].includes(channel.type)) {
              const actions = Utilities.findInReactTree(link, byClassName(Selectors.ChannelItem.children))
              if (actions)
                actions.props.children = actions.props.children
                .filter(c => !Utilities.findInReactTree(c, m => m?.props?.hasOwnProperty('userCount')))
                .concat([React.createElement(ChannelVoiceBadge, { channel, locked, connected, selected })])
            }

            // Channel name icons
            const name = Utilities.findInReactTree(link, byClassName(Selectors.ChannelItem.name))
            if (name) {
              const { children } = name.props
              name.props.children = [
                React.createElement('span', { children }),
                React.createElement(ChannelNameIcons, { channel, locked })
              ]
            }
          })
        }

        patchScrollerProvider () {
          let guildChannels
          Patcher.after(...ListNavigatorProvider, (self, props, value) => {
            if (value.props?.value?.id !== 'channels') return

            const scroller = Utilities.findInReactTree(value, m => m.props?.guildChannels)
            guildChannels = scroller.props.guildChannels

            Patcher.before(scroller.type.prototype, 'render', (self, props) => {
              if (self.getRowHeight.__originalFunction) return

              Patcher.instead(self, 'getRowHeight', (self, props, original) => {
                let result = original(...props)
                if (result === 0) return result

                const [section, row] = props
                if (section !== 0) {
                  const { channel } = guildChannels.getChannelFromSectionRow(section, row) ?? {}
                  if (channel && (this.settings.redesign.enabled || this.willRenderLastMessage(channel.id))) result += 20
                }

                return result
              })
            })
          })
        }

        injectResizer () {
          Patcher.after(...AppView, (self, props, value) => {
            if (!this.settings.resizer.enabled) return

            const base = Utilities.findInReactTree(value, byClassName(Selectors.Base.base))
            const content = base && Utilities.findInReactTree(base, byClassName(Selectors.Base.content))
            const sidebarIndex = content && content.props.children.findIndex(c => c?.props?.hasOwnProperty('hideSidebar'))
            if (typeof sidebarIndex !== 'number') return

            const getCurrentWidth = () => Data.sidebarWidth ?? (this.settings.redesign.enabled ? SIDEBAR_REDESIGNED_DEFAULT_WIDTH : SIDEBAR_DEFAULT_WIDTH)

            const getSidebarNode = () => document.querySelector(`.${Selectors.Base.sidebar}`)
            const update = () => {
              const node = getSidebarNode()
              if (node) node.style.width = getCurrentWidth() + 'px'
            }
            const onResize = e => {
              const rect = getSidebarNode()?.getBoundingClientRect()
              if (rect) Data.sidebarWidth = Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, e.clientX - rect.x))
              update()
            }
            const onClick = e => {
              if (e.detail !== 2) return
              Data.sidebarWidth = null
              update()
            }

            content.props.children.splice(
              sidebarIndex + 1, 0,
              React.createElement(ResizeHandler, { onResize, onClick })
            )
            Patcher.after(content.props.children[sidebarIndex], 'type', (self, props, value) => {
              value.props.style = { width: getCurrentWidth() + 'px' }
            })
          })

          // Server banner quality fix
          Patcher.after(GuildBanner, 'type', (self, props, value) => {
            const banner = Utilities.findInReactTree(value, m => m?.props?.guildBanner)
            if (!banner) return

            Patcher.after(banner, 'type', (self, props, value) => {
              const img = Utilities.findInReactTree(value, m => m?.type === 'img')
              if (img) img.props.src = img.props.src.replace(/\?size=[0-9]+/, '?size=640')
            })
          })
        }

        onStop() {
          Patcher.unpatchAll()
          this.clearStyle()

          Object.entries(DispatcherSubscriptions)
            .forEach(s => Dispatcher.unsubscribe(...s))

          forceAppUpdate('Plugin disabled')
        }

        clearStyle () {
          DOM.removeStyle(this.styleName)
        }

        constructor () {
          super()

          this.defaultSettings = {
            lastMessage: {
              enabled: true,
              roleColors: false
            },
            redesign: {
              enabled: true
            },
            resizer: {
              enabled: true
            }
          }

          this.settings = this.loadSettings(this.defaultSettings)
        }

        getSettingsPanel () {
          // TODO: Add channel preview

          const settingsSnapshot = JSON.parse(JSON.stringify(this.settings))

          const settings = this.settings
          const saveSettings = this.saveSettings.bind(this)

          function Switch (props) {
            const [value, setValue] = React.useState(props.value)

            return React.createElement(Common.FormSwitch, {
              ...props,
              value,
              onChange: e => {
                props.onChange(e)
                setValue(e)
                saveSettings()
              }
            })
          }

          function Settings () {
            return React.createElement(
              React.Fragment, {},
              [
                React.createElement(Common.FormSection, {
                  title: 'Last message',
                  className: `${Selectors.Margins.marginBottom20} ${Selectors.Margins.marginTop8}`,
                  children: [
                    React.createElement(Switch, {
                      children: 'Enable Last message',
                      note: 'Shows the most recent message for each channel in the channel list.',
                      value: settings.lastMessage.enabled,
                      onChange: e => settings.lastMessage.enabled = e
                    }),
                    React.createElement(Switch, {
                      children: 'Enable role color',
                      note: 'Paints author\'s username according to color of their role.',
                      value: settings.lastMessage.roleColors,
                      onChange: e => settings.lastMessage.roleColors = e
                    })
                  ]
                }),
                React.createElement(Common.FormSection, {
                  title: 'Redesign',
                  className: Selectors.Margins.marginBottom20,
                  children: React.createElement(Switch, {
                    children: 'Enable Redesign',
                    note: 'Brings channel list redesign from the new mobile UI.',
                    value: settings.redesign.enabled,
                    onChange: e => settings.redesign.enabled = e
                  })
                }),
                React.createElement(Common.FormSection, {
                  title: 'Resizer',
                  children: React.createElement(Switch, {
                    children: 'Enable Resizer',
                    note: 'Allows you to alter the sidebar width by dragging its right edge.',
                    value: settings.resizer.enabled,
                    onChange: e => settings.resizer.enabled = e
                  })
                })
              ]
            )
          }

          const node = document.createElement('div')

          DOMTools.onAdded(node, () =>
            ReactDOM.render(React.createElement(Settings), node)
          )
          DOMTools.onRemoved(node, () => {
            ReactDOM.unmountComponentAtNode(node)

            if (!deepEqual(settingsSnapshot, this.settings))
              setTimeout(() => forceAppUpdate('Settings changed'))
          })

          return node
        }
      }
    }

    return plugin(Plugin, Api);
  })(global.ZeresPluginLibrary.buildPlugin(config));
})();

const BCL__emojiColors = Object.freeze({"😀":"#E67E22","😃":"#E67E22","😄":"#E67E22","😁":"#E67E22","😆":"#E67E22","😅":"#E67E22","🤣":"#F1C40F","😂":"#E67E22","🙂":"#F1C40F","🙃":"#F1C40F","🫠":"#F1C40F","😉":"#F1C40F","😊":"#F1C40F","😇":"#3498DB","🥰":"#F1C40F",
  "😍":"#E67E22","🤩":"#E67E22","😘":"#F1C40F","😗":"#F1C40F","☺️":"#607D8B","😚":"#F1C40F","😙":"#F1C40F","🥲":"#F1C40F","😋":"#F1C40F","😛":"#F1C40F","😜":"#F1C40F","🤪":"#E67E22","😝":"#F1C40F","🤑":"#F1C40F","🤗":"#E67E22","🤭":"#F1C40F","🫢":"#F1C40F","🫣":"#F1C40F","🤫":"#F1C40F","🤔":"#F1C40F","🫡":"#F1C40F","🤐":"#F1C40F","🤨":"#F1C40F","😐":"#F1C40F","😑":"#F1C40F","😶":"#F1C40F","🫥":"#F1C40F","😶‍🌫️":"#9B59B6","😏":"#F1C40F","😒":"#F1C40F","🙄":"#E67E22","😬":"#9B59B6","😮‍💨":"#F1C40F","🤥":"#F1C40F","😌":"#F1C40F","😔":"#F1C40F","😪":"#F1C40F","🤤":"#F1C40F","😴":"#F1C40F","😷":"#9B59B6","🤒":"#E67E22","🤕":"#9B59B6","🤢":"#E67E22","🤮":"#11806A","🤧":"#9B59B6","🥵":"#E67E22","🥶":"#3498DB","🥴":"#F1C40F","😵":"#F1C40F","😵‍💫":"#F1C40F","🤯":"#E67E22","🤠":"#E67E22","🥳":"#F1C40F","🥸":"#E67E22","😎":"#11806A","🤓":"#E67E22","🧐":"#F1C40F","😕":"#F1C40F","🫤":"#F1C40F","😟":"#F1C40F","🙁":"#F1C40F","☹️":"#F1C40F","😮":"#F1C40F","😯":"#F1C40F","😲":"#F1C40F","😳":"#E67E22",
  "🥺":"#F1C40F","🥹":"#F1C40F","😦":"#F1C40F","😧":"#F1C40F","😨":"#5865F2","😰":"#E67E22","😥":"#F1C40F","😢":"#F1C40F","😭":"#F1C40F","😱":"#9B59B6","😖":"#F1C40F","😣":"#F1C40F","😞":"#F1C40F","😓":"#F1C40F","😩":"#F1C40F","😫":"#F1C40F","🥱":"#F1C40F","😤":"#F1C40F","😡":"#E67E22","😠":"#F1C40F","🤬":"#992D22","😈":"#9B59B6","👿":"#9B59B6","💀":"#9B59B6","☠️":"#9B59B6","💩":"#992D22","🤡":"#9B59B6","👹":"#E74C3C","👺":"#E74C3C","👻":"#9B59B6","👽":"#9B59B6","👾":"#9B59B6","🤖":"#607D8B","😺":"#E67E22","😸":"#E67E22","😹":"#E67E22","😻":"#E67E22","😼":"#E67E22","😽":"#E67E22","🙀":"#E67E22","😿":"#E67E22","😾":"#E67E22","🙈":"#E67E22","🙉":"#E67E22","🙊":"#E67E22","💋":"#992D22","💌":"#9B59B6","💘":"#3498DB","💝":"#E91E63","💖":"#E91E63","💗":"#E91E63","💓":"#E91E63","💞":"#E91E63","💕":"#E91E63","💟":"#9B59B6","❣️":"#E74C3C","💔":"#E74C3C","❤️‍🔥":"#E74C3C","❤️‍🩹":"#9B59B6","❤️":"#E74C3C","🧡":"#E67E22","💛":"#F1C40F","💚":"#11806A","💙":"#3498DB","💜":"#9B59B6","🤎":"#992D22",
  "🖤":"#607D8B","🤍":"#9B59B6","💯":"#992D22","💢":"#E74C3C","💥":"#E74C3C","💫":"#F1C40F","💦":"#9B59B6","💨":"#9B59B6","🕳️":"#9B59B6","💣":"#11806A","💬":"#9B59B6","👁️‍🗨️":"#11806A","🗨️":"#206694","🗯️":"#9B59B6","💭":"#9B59B6","💤":"#206694","👋":"#F1C40F","🤚":"#F1C40F","🖐️":"#F1C40F","✋":"#F1C40F","🖖":"#F1C40F","🫱":"#F1C40F","🫲":"#F1C40F","🫳":"#F1C40F","🫴":"#F1C40F","👌":"#F1C40F","🤌":"#F1C40F","🤏":"#E67E22","✌️":"#F1C40F","🤞":"#F1C40F","🫰":"#F1C40F","🤟":"#F1C40F","🤘":"#F1C40F","🤙":"#F1C40F","👈":"#F1C40F","👉":"#F1C40F","👆":"#F1C40F","🖕":"#F1C40F","👇":"#E67E22","☝️":"#F1C40F","🫵":"#F1C40F","👍":"#F1C40F","👎":"#F1C40F","✊":"#F1C40F","👊":"#E67E22","🤛":"#F1C40F","🤜":"#E67E22","👏":"#F1C40F","🙌":"#F1C40F","🫶":"#E67E22","👐":"#F1C40F","🤲":"#F1C40F","🤝":"#F1C40F","🙏":"#F1C40F","✍️":"#607D8B","💅":"#F1C40F","🤳":"#9B59B6","💪":"#F1C40F","🦾":"#11806A","🦿":"#9B59B6","🦵":"#E67E22","🦶":"#F1C40F","👂":"#F1C40F","🦻":"#F1C40F","👃":"#F1C40F","🧠":"#9B59B6",
  "🫀":"#E74C3C","🫁":"#E74C3C","🦷":"#9B59B6","🦴":"#9B59B6","👀":"#9B59B6","👁️":"#9B59B6","👅":"#9B59B6","👄":"#E74C3C","🫦":"#E74C3C","👶":"#F1C40F","🧒":"#F1C40F","👦":"#F1C40F","👧":"#F1C40F","🧑":"#F1C40F","👱":"#F1C40F","👨":"#F1C40F","🧔":"#F1C40F","🧔‍♂️":"#F1C40F","🧔‍♀️":"#E67E22","👨‍🦰":"#F1C40F","👨‍🦱":"#F1C40F","👨‍🦳":"#F1C40F","👨‍🦲":"#F1C40F","👩":"#F1C40F","👩‍🦰":"#E67E22","🧑‍🦰":"#F1C40F","👩‍🦱":"#F1C40F","🧑‍🦱":"#F1C40F","👩‍🦳":"#F1C40F","🧑‍🦳":"#F1C40F","👩‍🦲":"#F1C40F","🧑‍🦲":"#F1C40F","👱‍♀️":"#F1C40F","👱‍♂️":"#F1C40F","🧓":"#F1C40F","👴":"#F1C40F","👵":"#F1C40F","🙍":"#F1C40F","🙍‍♂️":"#206694","🙍‍♀️":"#F1C40F","🙎":"#F1C40F","🙎‍♂️":"#F1C40F","🙎‍♀️":"#E67E22","🙅":"#9B59B6","🙅‍♂️":"#3498DB","🙅‍♀️":"#992D22","🙆":"#9B59B6","🙆‍♂️":"#206694","🙆‍♀️":"#992D22","💁":"#F1C40F","💁‍♂️":"#F1C40F","💁‍♀️":"#F1C40F","🙋":"#F1C40F","🙋‍♂️":"#F1C40F","🙋‍♀️":"#9B59B6","🧏":"#F1C40F","🧏‍♂️":"#206694","🧏‍♀️":"#E67E22","🙇":"#F1C40F","🙇‍♂️":"#206694",
  "🙇‍♀️":"#992D22","🤦":"#9B59B6","🤦‍♂️":"#206694","🤦‍♀️":"#992D22","🤷":"#E67E22","🤷‍♂️":"#F1C40F","🤷‍♀️":"#992D22","🧑‍⚕️":"#9B59B6","👨‍⚕️":"#F1C40F","👩‍⚕️":"#9B59B6","🧑‍🎓":"#F1C40F","👨‍🎓":"#F1C40F","👩‍🎓":"#E67E22","🧑‍🏫":"#E67E22","👨‍🏫":"#E67E22","👩‍🏫":"#E67E22","🧑‍⚖️":"#F1C40F","👨‍⚖️":"#F1C40F","👩‍⚖️":"#E67E22","🧑‍🌾":"#992D22","👨‍🌾":"#E67E22","👩‍🌾":"#992D22","🧑‍🍳":"#E67E22","👨‍🍳":"#E67E22","👩‍🍳":"#E67E22","🧑‍🔧":"#5865F2","👨‍🔧":"#206694","👩‍🔧":"#5865F2","🧑‍🏭":"#F1C40F","👨‍🏭":"#F1C40F","👩‍🏭":"#F1C40F","🧑‍💼":"#F1C40F","👨‍💼":"#F1C40F","👩‍💼":"#F1C40F","🧑‍🔬":"#9B59B6","👨‍🔬":"#9B59B6","👩‍🔬":"#9B59B6","🧑‍💻":"#9B59B6","👨‍💻":"#9B59B6","👩‍💻":"#9B59B6","🧑‍🎤":"#1ABC9C","👨‍🎤":"#206694","👩‍🎤":"#9B59B6","🧑‍🎨":"#E67E22","👨‍🎨":"#E67E22","👩‍🎨":"#E67E22","🧑‍✈️":"#992D22","👨‍✈️":"#F1C40F","👩‍✈️":"#992D22","🧑‍🚀":"#9B59B6","👨‍🚀":"#9B59B6","👩‍🚀":"#9B59B6","🧑‍🚒":"#992D22","👨‍🚒":"#992D22","👩‍🚒":"#992D22","👮":"#F1C40F",
  "👮‍♂️":"#F1C40F","👮‍♀️":"#F1C40F","🕵️":"#992D22","🕵️‍♂️":"#992D22","🕵️‍♀️":"#992D22","💂":"#E67E22","💂‍♂️":"#E67E22","💂‍♀️":"#E67E22","🥷":"#11806A","👷":"#F1C40F","👷‍♂️":"#F1C40F","👷‍♀️":"#F1C40F","🫅":"#E67E22","🤴":"#F1C40F","👸":"#F1C40F","👳":"#F1C40F","👳‍♂️":"#9B59B6","👳‍♀️":"#F1C40F","👲":"#992D22","🧕":"#206694","🤵":"#F1C40F","🤵‍♂️":"#992D22","🤵‍♀️":"#E67E22","👰":"#F1C40F","👰‍♂️":"#F1C40F","👰‍♀️":"#F1C40F","🤰":"#9B59B6","🫃":"#E67E22","🫄":"#9B59B6","🤱":"#992D22","👩‍🍼":"#992D22","👨‍🍼":"#E67E22","🧑‍🍼":"#E67E22","👼":"#F1C40F","🎅":"#9B59B6","🤶":"#9B59B6","🧑‍🎄":"#E67E22","🦸":"#E67E22","🦸‍♂️":"#E67E22","🦸‍♀️":"#E67E22","🦹":"#F1C40F","🦹‍♂️":"#F1C40F","🦹‍♀️":"#E67E22","🧙":"#992D22","🧙‍♂️":"#992D22","🧙‍♀️":"#992D22","🧚":"#E67E22","🧚‍♂️":"#E67E22","🧚‍♀️":"#3498DB","🧛":"#F1C40F","🧛‍♂️":"#607D8B","🧛‍♀️":"#E67E22","🧜":"#206694","🧜‍♂️":"#E67E22","🧜‍♀️":"#9B59B6","🧝":"#11806A","🧝‍♂️":"#F1C40F","🧝‍♀️":"#9B59B6","🧞":"#206694",
  "🧞‍♂️":"#3498DB","🧞‍♀️":"#9B59B6","🧟":"#11806A","🧟‍♂️":"#11806A","🧟‍♀️":"#11806A","🧌":"#992D22","💆":"#F1C40F","💆‍♂️":"#F1C40F","💆‍♀️":"#F1C40F","💇":"#F1C40F","💇‍♂️":"#F1C40F","💇‍♀️":"#F1C40F","🚶":"#206694","🚶‍♂️":"#206694","🚶‍♀️":"#206694","🧍":"#9B59B6","🧍‍♂️":"#992D22","🧍‍♀️":"#F1C40F","🧎":"#E67E22","🧎‍♂️":"#F1C40F","🧎‍♀️":"#E67E22","🧑‍🦯":"#206694","👨‍🦯":"#206694","👩‍🦯":"#206694","🧑‍🦼":"#11806A","👨‍🦼":"#992D22","👩‍🦼":"#992D22","🧑‍🦽":"#11806A","👨‍🦽":"#11806A","👩‍🦽":"#206694","🏃":"#F1C40F","🏃‍♂️":"#206694","🏃‍♀️":"#3498DB","💃":"#F1C40F","🕺":"#992D22","🕴️":"#607D8B","👯":"#E67E22","👯‍♂️":"#992D22","👯‍♀️":"#E67E22","🧖":"#9B59B6","🧖‍♂️":"#9B59B6","🧖‍♀️":"#F1C40F","🧗":"#9B59B6","🧗‍♂️":"#9B59B6","🧗‍♀️":"#9B59B6","🤺":"#9B59B6","🏇":"#992D22","⛷️":"#992D22","🏂":"#206694","🏌️":"#9B59B6","🏌️‍♂️":"#607D8B","🏌️‍♀️":"#E67E22","🏄":"#E67E22","🏄‍♂️":"#F1C40F","🏄‍♀️":"#9B59B6","🚣":"#E74C3C","🚣‍♂️":"#E74C3C","🚣‍♀️":"#E74C3C","🏊":"#9B59B6",
  "🏊‍♂️":"#9B59B6","🏊‍♀️":"#9B59B6","⛹️":"#E67E22","⛹️‍♂️":"#206694","⛹️‍♀️":"#E67E22","🏋️":"#E67E22","🏋️‍♂️":"#E67E22","🏋️‍♀️":"#992D22","🚴":"#11806A","🚴‍♂️":"#11806A","🚴‍♀️":"#992D22","🚵":"#9B59B6","🚵‍♂️":"#9B59B6","🚵‍♀️":"#992D22","🤸":"#F1C40F","🤸‍♂️":"#206694","🤸‍♀️":"#F1C40F","🤼":"#E67E22","🤼‍♂️":"#E67E22","🤼‍♀️":"#E67E22","🤽":"#E67E22","🤽‍♂️":"#E67E22","🤽‍♀️":"#E67E22","🤾":"#9B59B6","🤾‍♂️":"#E67E22","🤾‍♀️":"#E67E22","🤹":"#E67E22","🤹‍♂️":"#F1C40F","🤹‍♀️":"#E67E22","🧘":"#F1C40F","🧘‍♂️":"#E67E22","🧘‍♀️":"#F1C40F","🛀":"#9B59B6","🛌":"#9B59B6","🧑‍🤝‍🧑":"#9B59B6","👭":"#F1C40F","👫":"#F1C40F","👬":"#E67E22","💏":"#9B59B6","👩‍❤️‍💋‍👨":"#9B59B6","👨‍❤️‍💋‍👨":"#9B59B6","👩‍❤️‍💋‍👩":"#9B59B6","💑":"#9B59B6","👩‍❤️‍👨":"#9B59B6","👨‍❤️‍👨":"#9B59B6","👩‍❤️‍👩":"#9B59B6","👪":"#F1C40F","👨‍👩‍👦":"#206694","👨‍👩‍👧":"#F1C40F","👨‍👩‍👧‍👦":"#F1C40F","👨‍👩‍👦‍👦":"#F1C40F","👨‍👩‍👧‍👧":"#F1C40F","👨‍👨‍👦":"#206694","👨‍👨‍👧":"#F1C40F",
  "👨‍👨‍👧‍👦":"#206694","👨‍👨‍👦‍👦":"#206694","👨‍👨‍👧‍👧":"#F1C40F","👩‍👩‍👦":"#E67E22","👩‍👩‍👧":"#E67E22","👩‍👩‍👧‍👦":"#E67E22","👩‍👩‍👦‍👦":"#F1C40F","👩‍👩‍👧‍👧":"#E67E22","👨‍👦":"#F1C40F","👨‍👦‍👦":"#206694","👨‍👧":"#206694","👨‍👧‍👦":"#F1C40F","👨‍👧‍👧":"#F1C40F","👩‍👦":"#F1C40F","👩‍👦‍👦":"#F1C40F","👩‍👧":"#F1C40F","👩‍👧‍👦":"#F1C40F","👩‍👧‍👧":"#F1C40F","🗣️":"#607D8B","👤":"#607D8B","👥":"#607D8B","🫂":"#607D8B","👣":"#11806A","🐵":"#E67E22","🐒":"#E67E22","🦍":"#206694","🦧":"#992D22","🐶":"#9B59B6","🐕":"#E67E22","🦮":"#E67E22","🐕‍🦺":"#992D22","🐩":"#9B59B6","🐺":"#9B59B6","🦊":"#E67E22","🦝":"#992D22","🐱":"#F1C40F","🐈":"#9B59B6","🐈‍⬛":"#11806A","🦁":"#E67E22","🐯":"#F1C40F","🐅":"#992D22","🐆":"#E67E22","🐴":"#992D22","🐎":"#992D22","🦄":"#9B59B6","🦓":"#206694","🦌":"#E67E22","🦬":"#992D22","🐮":"#9B59B6","🐂":"#E74C3C","🐃":"#992D22","🐄":"#9B59B6","🐷":"#9B59B6","🐖":"#9B59B6","🐗":"#992D22","🐽":"#9B59B6","🐏":"#9B59B6","🐑":"#9B59B6",
  "🐐":"#9B59B6","🐪":"#E67E22","🐫":"#E67E22","🦙":"#9B59B6","🦒":"#E67E22","🐘":"#9B59B6","🦣":"#992D22","🦏":"#9B59B6","🦛":"#9B59B6","🐭":"#9B59B6","🐁":"#9B59B6","🐀":"#9B59B6","🐹":"#9B59B6","🐰":"#9B59B6","🐇":"#9B59B6","🐿️":"#992D22","🦫":"#992D22","🦔":"#992D22","🦇":"#992D22","🐻":"#992D22","🐻‍❄️":"#9B59B6","🐨":"#9B59B6","🐼":"#11806A","🦥":"#992D22","🦦":"#992D22","🦨":"#9B59B6","🦘":"#E67E22","🦡":"#9B59B6","🐾":"#11806A","🦃":"#992D22","🐔":"#E74C3C","🐓":"#9B59B6","🐣":"#F1C40F","🐤":"#F1C40F","🐥":"#F1C40F","🐦":"#9B59B6","🐧":"#E67E22","🕊️":"#9B59B6","🦅":"#992D22","🦆":"#9B59B6","🦢":"#9B59B6","🦉":"#992D22","🦤":"#E67E22","🪶":"#992D22","🦩":"#E74C3C","🦚":"#11806A","🦜":"#11806A","🐸":"#11806A","🐊":"#11806A","🐢":"#11806A","🦎":"#11806A","🐍":"#992D22","🐲":"#F1C40F","🐉":"#992D22","🦕":"#206694","🦖":"#11806A","🐳":"#3498DB","🐋":"#9B59B6","🐬":"#3498DB","🦭":"#9B59B6","🐟":"#3498DB","🐠":"#F1C40F","🐡":"#E67E22","🦈":"#9B59B6","🐙":"#992D22","🐚":"#9B59B6",
  "🪸":"#E74C3C","🐌":"#E67E22","🦋":"#11806A","🐛":"#992D22","🐜":"#992D22","🐝":"#607D8B","🪲":"#11806A","🐞":"#992D22","🦗":"#992D22","🪳":"#992D22","🕷️":"#11806A","🕸️":"#9B59B6","🦂":"#992D22","🦟":"#992D22","🪰":"#E67E22","🪱":"#E74C3C","🦠":"#11806A","💐":"#F1C40F","🌸":"#9B59B6","💮":"#9B59B6","🪷":"#9B59B6","🏵️":"#E67E22","🌹":"#992D22","🥀":"#9B59B6","🌺":"#E91E63","🌻":"#F1C40F","🌼":"#F1C40F","🌷":"#E74C3C","🌱":"#11806A","🪴":"#11806A","🌲":"#11806A","🌳":"#11806A","🌴":"#11806A","🌵":"#11806A","🌾":"#E67E22","🌿":"#11806A","☘️":"#11806A","🍀":"#11806A","🍁":"#992D22","🍂":"#992D22","🍃":"#11806A","🪹":"#992D22","🪺":"#3498DB","🍇":"#992D22","🍈":"#9B59B6","🍉":"#E74C3C","🍊":"#E67E22","🍋":"#F1C40F","🍌":"#9B59B6","🍍":"#992D22","🥭":"#E67E22","🍎":"#E74C3C","🍏":"#11806A","🍐":"#E67E22","🍑":"#E74C3C","🍒":"#E74C3C","🍓":"#992D22","🫐":"#206694","🥝":"#F1C40F","🍅":"#E74C3C","🫒":"#992D22","🥥":"#9B59B6","🥑":"#F1C40F","🍆":"#992D22","🥔":"#992D22","🥕":"#E67E22",
  "🌽":"#992D22","🌶️":"#E74C3C","🫑":"#11806A","🥒":"#F1C40F","🥬":"#11806A","🥦":"#11806A","🧄":"#9B59B6","🧅":"#E67E22","🍄":"#E74C3C","🥜":"#E67E22","🫘":"#992D22","🌰":"#992D22","🍞":"#E67E22","🥐":"#E67E22","🥖":"#F1C40F","🫓":"#9B59B6","🥨":"#E74C3C","🥯":"#E67E22","🥞":"#F1C40F","🧇":"#E67E22","🧀":"#F1C40F","🍖":"#992D22","🍗":"#992D22","🥩":"#992D22","🥓":"#E74C3C","🍔":"#E67E22","🍟":"#F1C40F","🍕":"#E67E22","🌭":"#E67E22","🥪":"#F1C40F","🌮":"#F1C40F","🌯":"#9B59B6","🫔":"#E67E22","🥙":"#E67E22","🧆":"#992D22","🥚":"#9B59B6","🍳":"#11806A","🥘":"#E67E22","🍲":"#9B59B6","🫕":"#992D22","🥣":"#3498DB","🥗":"#11806A","🍿":"#E74C3C","🧈":"#F1C40F","🧂":"#9B59B6","🥫":"#E74C3C","🍱":"#992D22","🍘":"#992D22","🍙":"#9B59B6","🍚":"#9B59B6","🍛":"#9B59B6","🍜":"#9B59B6","🍝":"#F1C40F","🍠":"#E74C3C","🍢":"#E67E22","🍣":"#E74C3C","🍤":"#E67E22","🍥":"#9B59B6","🥮":"#992D22","🍡":"#9B59B6","🥟":"#F1C40F","🥠":"#E67E22","🥡":"#9B59B6","🦀":"#E74C3C","🦞":"#992D22","🦐":"#E74C3C",
  "🦑":"#E74C3C","🦪":"#9B59B6","🍦":"#E67E22","🍧":"#9B59B6","🍨":"#9B59B6","🍩":"#992D22","🍪":"#E67E22","🎂":"#9B59B6","🍰":"#9B59B6","🧁":"#E67E22","🥧":"#E67E22","🍫":"#E74C3C","🍬":"#9B59B6","🍭":"#9B59B6","🍮":"#9B59B6","🍯":"#F1C40F","🍼":"#9B59B6","🥛":"#9B59B6","☕":"#9B59B6","🫖":"#9B59B6","🍵":"#9B59B6","🍶":"#9B59B6","🍾":"#992D22","🍷":"#9B59B6","🍸":"#9B59B6","🍹":"#F1C40F","🍺":"#E67E22","🍻":"#E67E22","🥂":"#9B59B6","🥃":"#9B59B6","🫗":"#9B59B6","🥤":"#E74C3C","🧋":"#E67E22","🧃":"#9B59B6","🧉":"#992D22","🧊":"#3498DB","🥢":"#992D22","🍽️":"#9B59B6","🍴":"#9B59B6","🥄":"#607D8B","🔪":"#9B59B6","🫙":"#9B59B6","🏺":"#992D22","🌍":"#F1C40F","🌎":"#206694","🌏":"#F1C40F","🌐":"#3498DB","🗺️":"#3498DB","🗾":"#3498DB","🧭":"#9B59B6","🏔️":"#11806A","⛰️":"#11806A","🌋":"#11806A","🗻":"#9B59B6","🏕️":"#992D22","🏖️":"#E67E22","🏜️":"#992D22","🏝️":"#3498DB","🏞️":"#3498DB","🏟️":"#9B59B6","🏛️":"#9B59B6","🏗️":"#F1C40F","🧱":"#992D22","🪨":"#11806A","🪵":"#992D22","🛖":"#992D22",
  "🏘️":"#9B59B6","🏚️":"#9B59B6","🏠":"#9B59B6","🏡":"#11806A","🏢":"#9B59B6","🏣":"#9B59B6","🏤":"#9B59B6","🏥":"#9B59B6","🏦":"#9B59B6","🏨":"#9B59B6","🏩":"#9B59B6","🏪":"#607D8B","🏫":"#9B59B6","🏬":"#607D8B","🏭":"#9B59B6","🏯":"#206694","🏰":"#9B59B6","💒":"#9B59B6","🗼":"#992D22","🗽":"#607D8B","⛪":"#9B59B6","🕌":"#E67E22","🛕":"#E67E22","🕍":"#E67E22","⛩️":"#992D22","🕋":"#992D22","⛲":"#9B59B6","⛺":"#E74C3C","🌁":"#9B59B6","🌃":"#206694","🏙️":"#206694","🌄":"#9B59B6","🌅":"#E67E22","🌆":"#E67E22","🌇":"#E67E22","🌉":"#206694","♨️":"#992D22","🎠":"#9B59B6","🛝":"#206694","🎡":"#992D22","🎢":"#E67E22","💈":"#9B59B6","🎪":"#9B59B6","🚂":"#992D22","🚃":"#607D8B","🚄":"#9B59B6","🚅":"#206694","🚆":"#607D8B","🚇":"#11806A","🚈":"#206694","🚉":"#206694","🚊":"#11806A","🚝":"#206694","🚞":"#9B59B6","🚋":"#11806A","🚌":"#3498DB","🚍":"#607D8B","🚎":"#206694","🚐":"#9B59B6","🚑":"#11806A","🚒":"#11806A","🚓":"#11806A","🚔":"#11806A","🚕":"#E67E22","🚖":"#992D22","🚗":"#9B59B6",
  "🚘":"#E74C3C","🚙":"#3498DB","🛻":"#206694","🚚":"#E67E22","🚛":"#11806A","🚜":"#F1C40F","🏎️":"#E74C3C","🏍️":"#11806A","🛵":"#E67E22","🦽":"#11806A","🦼":"#992D22","🛺":"#F1C40F","🚲":"#11806A","🛴":"#607D8B","🛹":"#11806A","🛼":"#3498DB","🚏":"#9B59B6","🛣️":"#11806A","🛤️":"#992D22","🛢️":"#992D22","⛽":"#E74C3C","🛞":"#11806A","🚨":"#E74C3C","🚥":"#9B59B6","🚦":"#11806A","🛑":"#9B59B6","🚧":"#607D8B","⚓":"#206694","🛟":"#9B59B6","⛵":"#992D22","🛶":"#992D22","🚤":"#9B59B6","🛳️":"#9B59B6","⛴️":"#206694","🛥️":"#9B59B6","🚢":"#9B59B6","✈️":"#3498DB","🛩️":"#9B59B6","🛫":"#206694","🛬":"#206694","🪂":"#992D22","💺":"#607D8B","🚁":"#E74C3C","🚟":"#9B59B6","🚠":"#992D22","🚡":"#F1C40F","🛰️":"#206694","🚀":"#9B59B6","🛸":"#206694","🛎️":"#992D22","🧳":"#992D22","⌛":"#9B59B6","⏳":"#9B59B6","⌚":"#992D22","⏰":"#9B59B6","⏱️":"#9B59B6","⏲️":"#9B59B6","🕰️":"#9B59B6","🕛":"#9B59B6","🕧":"#9B59B6","🕐":"#9B59B6","🕜":"#9B59B6","🕑":"#9B59B6","🕝":"#9B59B6","🕒":"#9B59B6","🕞":"#9B59B6",
  "🕓":"#9B59B6","🕟":"#9B59B6","🕔":"#9B59B6","🕠":"#9B59B6","🕕":"#9B59B6","🕡":"#9B59B6","🕖":"#9B59B6","🕢":"#9B59B6","🕗":"#9B59B6","🕣":"#9B59B6","🕘":"#9B59B6","🕤":"#9B59B6","🕙":"#9B59B6","🕥":"#9B59B6","🕚":"#9B59B6","🕦":"#9B59B6","🌑":"#11806A","🌒":"#11806A","🌓":"#11806A","🌔":"#11806A","🌕":"#F1C40F","🌖":"#11806A","🌗":"#11806A","🌘":"#11806A","🌙":"#F1C40F","🌚":"#206694","🌛":"#F1C40F","🌜":"#F1C40F","🌡️":"#9B59B6","☀️":"#F1C40F","🌝":"#F1C40F","🌞":"#F1C40F","🪐":"#E67E22","⭐":"#9B59B6","🌟":"#9B59B6","🌠":"#206694","🌌":"#9B59B6","☁️":"#9B59B6","⛅":"#9B59B6","⛈️":"#9B59B6","🌤️":"#9B59B6","🌥️":"#9B59B6","🌦️":"#F1C40F","🌧️":"#9B59B6","🌨️":"#9B59B6","🌩️":"#9B59B6","🌪️":"#607D8B","🌫️":"#9B59B6","🌬️":"#9B59B6","🌀":"#206694","🌈":"#1ABC9C","🌂":"#206694","☂️":"#9B59B6","☔":"#5865F2","⛱️":"#F1C40F","⚡":"#F1C40F","❄️":"#3498DB","☃️":"#9B59B6","⛄":"#9B59B6","☄️":"#E67E22","🔥":"#E67E22","💧":"#3498DB","🌊":"#9B59B6","🎃":"#E67E22","🎄":"#11806A","🎆":"#9B59B6",
  "🎇":"#992D22","🧨":"#992D22","✨":"#F1C40F","🎈":"#E74C3C","🎉":"#E67E22","🎊":"#E67E22","🎋":"#E67E22","🎍":"#E67E22","🎎":"#206694","🎏":"#E67E22","🎐":"#9B59B6","🎑":"#11806A","🧧":"#E74C3C","🎀":"#9B59B6","🎁":"#E67E22","🎗️":"#F1C40F","🎟️":"#E74C3C","🎫":"#F1C40F","🎖️":"#F1C40F","🏆":"#E67E22","🏅":"#F1C40F","🥇":"#F1C40F","🥈":"#9B59B6","🥉":"#992D22","⚽":"#9B59B6","⚾":"#9B59B6","🥎":"#F1C40F","🏀":"#E67E22","🏐":"#9B59B6","🏈":"#E74C3C","🏉":"#E67E22","🎾":"#F1C40F","🥏":"#3498DB","🎳":"#9B59B6","🏏":"#F1C40F","🏑":"#9B59B6","🏒":"#E67E22","🥍":"#206694","🏓":"#E74C3C","🏸":"#E67E22","🥊":"#E74C3C","🥋":"#9B59B6","🥅":"#992D22","⛳":"#11806A","⛸️":"#9B59B6","🎣":"#607D8B","🤿":"#11806A","🎽":"#3498DB","🎿":"#3498DB","🛷":"#992D22","🥌":"#11806A","🎯":"#9B59B6","🪀":"#11806A","🪁":"#206694","🎱":"#11806A","🔮":"#9B59B6","🪄":"#9B59B6","🧿":"#206694","🪬":"#206694","🎮":"#11806A","🕹️":"#11806A","🎰":"#9B59B6","🎲":"#9B59B6","🧩":"#1ABC9C","🧸":"#E67E22","🪅":"#9B59B6",
  "🪩":"#9B59B6","🪆":"#E67E22","♠️":"#607D8B","♥️":"#607D8B","♦️":"#607D8B","♣️":"#607D8B","♟️":"#607D8B","🃏":"#9B59B6","🀄":"#9B59B6","🎴":"#992D22","🎭":"#992D22","🖼️":"#F1C40F","🎨":"#E67E22","🧵":"#E67E22","🪡":"#206694","🧶":"#E67E22","🪢":"#206694","👓":"#9B59B6","🕶️":"#607D8B","🥽":"#9B59B6","🥼":"#9B59B6","🦺":"#E74C3C","👔":"#3498DB","👕":"#3498DB","👖":"#206694","🧣":"#992D22","🧤":"#1ABC9C","🧥":"#E67E22","🧦":"#9B59B6","👗":"#1ABC9C","👘":"#E67E22","🥻":"#E67E22","🩱":"#11806A","🩲":"#11806A","🩳":"#E67E22","👙":"#9B59B6","👚":"#9B59B6","👛":"#9B59B6","👜":"#E74C3C","👝":"#992D22","🛍️":"#9B59B6","🎒":"#E74C3C","🩴":"#3498DB","👞":"#992D22","👟":"#9B59B6","🥾":"#992D22","🥿":"#206694","👠":"#E74C3C","👡":"#9B59B6","🩰":"#9B59B6","👢":"#E67E22","👑":"#E67E22","👒":"#E67E22","🎩":"#11806A","🎓":"#992D22","🧢":"#3498DB","🪖":"#11806A","⛑️":"#992D22","📿":"#992D22","💄":"#E74C3C","💍":"#9B59B6","💎":"#3498DB","🔇":"#11806A","🔈":"#11806A","🔉":"#607D8B","🔊":"#11806A",
  "📢":"#9B59B6","📣":"#992D22","📯":"#E74C3C","🔔":"#992D22","🔕":"#992D22","🎼":"#9B59B6","🎵":"#11806A","🎶":"#11806A","🎙️":"#11806A","🎚️":"#9B59B6","🎛️":"#9B59B6","🎤":"#9B59B6","🎧":"#9B59B6","📻":"#E67E22","🎷":"#E67E22","🪗":"#992D22","🎸":"#E74C3C","🎹":"#607D8B","🎺":"#E67E22","🎻":"#992D22","🪕":"#9B59B6","🥁":"#E74C3C","🪘":"#992D22","📱":"#607D8B","📲":"#607D8B","☎️":"#E74C3C","📞":"#11806A","📟":"#11806A","📠":"#9B59B6","🔋":"#11806A","🪫":"#9B59B6","🔌":"#11806A","💻":"#607D8B","🖥️":"#11806A","🖨️":"#607D8B","⌨️":"#9B59B6","🖱️":"#9B59B6","🖲️":"#11806A","💽":"#9B59B6","💾":"#11806A","💿":"#9B59B6","📀":"#9B59B6","🧮":"#992D22","🎥":"#11806A","🎞️":"#9B59B6","📽️":"#206694","🎬":"#11806A","📺":"#992D22","📷":"#11806A","📸":"#11806A","📹":"#607D8B","📼":"#11806A","🔍":"#11806A","🔎":"#11806A","🕯️":"#9B59B6","💡":"#9B59B6","🔦":"#607D8B","🏮":"#E74C3C","🪔":"#992D22","📔":"#F1C40F","📕":"#992D22","📖":"#206694","📗":"#E67E22","📘":"#206694","📙":"#E67E22","📚":"#11806A",
  "📓":"#9B59B6","📒":"#F1C40F","📃":"#9B59B6","📜":"#9B59B6","📄":"#9B59B6","📰":"#9B59B6","🗞️":"#9B59B6","📑":"#9B59B6","🔖":"#9B59B6","🏷️":"#F1C40F","💰":"#E67E22","🪙":"#206694","💴":"#9B59B6","💵":"#9B59B6","💶":"#9B59B6","💷":"#9B59B6","💸":"#9B59B6","💳":"#9B59B6","🧾":"#9B59B6","💹":"#9B59B6","✉️":"#9B59B6","📧":"#9B59B6","📨":"#9B59B6","📩":"#9B59B6","📤":"#3498DB","📥":"#3498DB","📦":"#E67E22","📫":"#206694","📪":"#3498DB","📬":"#607D8B","📭":"#11806A","📮":"#E74C3C","🗳️":"#3498DB","✏️":"#E67E22","✒️":"#11806A","🖋️":"#11806A","🖊️":"#11806A","🖌️":"#206694","🖍️":"#E74C3C","📝":"#9B59B6","💼":"#992D22","📁":"#9B59B6","📂":"#9B59B6","🗂️":"#E67E22","📅":"#E74C3C","📆":"#9B59B6","🗒️":"#9B59B6","🗓️":"#9B59B6","📇":"#9B59B6","📈":"#9B59B6","📉":"#9B59B6","📊":"#9B59B6","📋":"#9B59B6","📌":"#E74C3C","📍":"#E74C3C","📎":"#9B59B6","🖇️":"#9B59B6","📏":"#9B59B6","📐":"#9B59B6","✂️":"#9B59B6","🗃️":"#11806A","🗄️":"#206694","🗑️":"#9B59B6","🔒":"#E67E22","🔓":"#E67E22",
  "🔏":"#9B59B6","🔐":"#E67E22","🔑":"#F1C40F","🗝️":"#11806A","🔨":"#9B59B6","🪓":"#992D22","⛏️":"#9B59B6","⚒️":"#11806A","🛠️":"#11806A","🗡️":"#9B59B6","⚔️":"#11806A","🔫":"#1ABC9C","🪃":"#E74C3C","🏹":"#9B59B6","🛡️":"#9B59B6","🪚":"#9B59B6","🔧":"#206694","🪛":"#1ABC9C","🔩":"#9B59B6","⚙️":"#9B59B6","🗜️":"#607D8B","⚖️":"#607D8B","🦯":"#9B59B6","🔗":"#206694","⛓️":"#9B59B6","🪝":"#E67E22","🧰":"#E74C3C","🧲":"#E74C3C","🪜":"#992D22","⚗️":"#9B59B6","🧪":"#11806A","🧫":"#9B59B6","🧬":"#3498DB","🔬":"#9B59B6","🔭":"#9B59B6","📡":"#9B59B6","💉":"#9B59B6","🩸":"#E74C3C","💊":"#F1C40F","🩹":"#9B59B6","🩼":"#9B59B6","🩺":"#11806A","🩻":"#3498DB","🚪":"#992D22","🛗":"#3498DB","🪞":"#E67E22","🪟":"#992D22","🛏️":"#992D22","🛋️":"#3498DB","🪑":"#E74C3C","🚽":"#9B59B6","🪠":"#E74C3C","🚿":"#9B59B6","🛁":"#9B59B6","🪤":"#F1C40F","🪒":"#9B59B6","🧴":"#9B59B6","🧷":"#9B59B6","🧹":"#992D22","🧺":"#992D22","🧻":"#9B59B6","🪣":"#206694","🧼":"#1ABC9C","🫧":"#9B59B6","🪥":"#9B59B6","🧽":"#F1C40F",
  "🧯":"#E74C3C","🛒":"#9B59B6","🚬":"#9B59B6","⚰️":"#992D22","🪦":"#9B59B6","⚱️":"#E67E22","🗿":"#206694","🪧":"#9B59B6","🪪":"#9B59B6","🏧":"#3498DB","🚮":"#9B59B6","🚰":"#9B59B6","♿":"#9B59B6","🚹":"#3498DB","🚺":"#9B59B6","🚻":"#607D8B","🚼":"#E67E22","🚾":"#9B59B6","🛂":"#9B59B6","🛃":"#9B59B6","🛄":"#9B59B6","🛅":"#9B59B6","⚠️":"#F1C40F","🚸":"#F1C40F","⛔":"#9B59B6","🚫":"#E74C3C","🚳":"#11806A","🚭":"#E74C3C","🚯":"#E74C3C","🚱":"#E74C3C","🚷":"#E74C3C","📵":"#E74C3C","🔞":"#607D8B","☢️":"#E67E22","☣️":"#E67E22","⬆️":"#607D8B","↗️":"#607D8B","➡️":"#607D8B","↘️":"#607D8B","⬇️":"#607D8B","↙️":"#607D8B","⬅️":"#607D8B","↖️":"#607D8B","↕️":"#607D8B","↔️":"#607D8B","↩️":"#607D8B","↪️":"#607D8B","⤴️":"#607D8B","⤵️":"#607D8B","🔃":"#607D8B","🔄":"#607D8B","🔙":"#11806A","🔚":"#11806A","🔛":"#11806A","🔜":"#206694","🔝":"#11806A","🛐":"#9B59B6","⚛️":"#9B59B6","🕉️":"#9B59B6","✡️":"#9B59B6","☸️":"#9B59B6","☯️":"#9B59B6","✝️":"#9B59B6","☦️":"#9B59B6","☪️":"#9B59B6","☮️":"#9B59B6",
  "🕎":"#9B59B6","🔯":"#9B59B6","♈":"#9B59B6","♉":"#9B59B6","♊":"#9B59B6","♋":"#9B59B6","♌":"#9B59B6","♍":"#9B59B6","♎":"#9B59B6","♏":"#9B59B6","♐":"#9B59B6","♑":"#9B59B6","♒":"#9B59B6","♓":"#9B59B6","⛎":"#9B59B6","🔀":"#607D8B","🔁":"#607D8B","🔂":"#607D8B","▶️":"#607D8B","⏩":"#607D8B","⏭️":"#607D8B","⏯️":"#607D8B","◀️":"#607D8B","⏪":"#607D8B","⏮️":"#607D8B","🔼":"#607D8B","⏫":"#607D8B","🔽":"#607D8B","⏬":"#607D8B","⏸️":"#607D8B","⏹️":"#607D8B","⏺️":"#607D8B","⏏️":"#607D8B","🎦":"#607D8B","🔅":"#F1C40F","🔆":"#F1C40F","📶":"#9B59B6","📳":"#F1C40F","📴":"#9B59B6","♀️":"#607D8B","♂️":"#607D8B","⚧️":"#607D8B","✖️":"#11806A","➕":"#11806A","➖":"#11806A","➗":"#11806A","🟰":"#9B59B6","♾️":"#607D8B","‼️":"#607D8B","⁉️":"#E74C3C","❓":"#992D22","❔":"#9B59B6","❕":"#9B59B6","❗":"#992D22","〰️":"#11806A","💱":"#206694","💲":"#206694","⚕️":"#607D8B","♻️":"#11806A","⚜️":"#992D22","🔱":"#E67E22","📛":"#9B59B6","🔰":"#F1C40F","⭕":"#992D22","✅":"#11806A","☑️":"#206694","✔️":"#11806A","❌":"#E74C3C",
  "❎":"#11806A","➰":"#11806A","➿":"#206694","〽️":"#F1C40F","✳️":"#11806A","✴️":"#9B59B6","❇️":"#11806A","©️":"#607D8B","®️":"#607D8B","™️":"#607D8B","#️⃣":"#607D8B","*️⃣":"#607D8B","0️⃣":"#607D8B","1️⃣":"#607D8B","2️⃣":"#607D8B","3️⃣":"#607D8B","4️⃣":"#607D8B","5️⃣":"#607D8B","6️⃣":"#607D8B","7️⃣":"#607D8B","8️⃣":"#607D8B","9️⃣":"#607D8B","🔟":"#607D8B","🔠":"#607D8B","🔡":"#607D8B","🔢":"#607D8B","🔣":"#607D8B","🔤":"#607D8B","🅰️":"#E74C3C","🆎":"#E74C3C","🅱️":"#9B59B6","🆑":"#E74C3C","🆒":"#607D8B","🆓":"#607D8B",ℹ️:"#9B59B6","🆔":"#9B59B6","Ⓜ️":"#9B59B6","🆕":"#607D8B","🆖":"#607D8B","🅾️":"#E74C3C","🆗":"#607D8B","🅿️":"#3498DB","🆘":"#9B59B6","🆙":"#607D8B","🆚":"#9B59B6","🈁":"#607D8B","🈂️":"#3498DB","🈷️":"#9B59B6","🈶":"#9B59B6","🈯":"#9B59B6","🉐":"#9B59B6","🈹":"#9B59B6","🈚":"#9B59B6","🈲":"#9B59B6","🉑":"#9B59B6","🈸":"#9B59B6","🈴":"#E74C3C","🈳":"#9B59B6","㊗️":"#9B59B6","㊙️":"#9B59B6","🈺":"#9B59B6","🈵":"#9B59B6","🔴":"#992D22","🟠":"#F1C40F","🟡":"#F1C40F",
  "🟢":"#11806A","🔵":"#206694","🟣":"#9B59B6","🟤":"#992D22","⚫":"#607D8B","⚪":"#9B59B6","🟥":"#E74C3C","🟧":"#E67E22","🟨":"#F1C40F","🟩":"#11806A","🟦":"#3498DB","🟪":"#9B59B6","🟫":"#9B59B6","⬛":"#11806A","⬜":"#9B59B6","◼️":"#607D8B","◻️":"#9B59B6","◾":"#607D8B","◽":"#9B59B6","▪️":"#607D8B","▫️":"#607D8B","🔶":"#F1C40F","🔷":"#206694","🔸":"#E67E22","🔹":"#206694","🔺":"#E74C3C","🔻":"#E74C3C","💠":"#3498DB","🔘":"#206694","🔳":"#9B59B6","🔲":"#607D8B","🏁":"#9B59B6","🚩":"#992D22","🎌":"#9B59B6","🏴":"#11806A","🏳️":"#9B59B6","🏳️‍🌈":"#E67E22","🏳️‍⚧️":"#9B59B6","🏴‍☠️":"#11806A","🇦🇨":"#206694","🇦🇩":"#206694","🇦🇪":"#E74C3C","🇦🇫":"#E74C3C","🇦🇬":"#992D22","🇦🇮":"#206694","🇦🇱":"#992D22","🇦🇲":"#E74C3C","🇦🇴":"#607D8B","🇦🇶":"#206694","🇦🇷":"#3498DB","🇦🇸":"#9B59B6","🇦🇹":"#9B59B6","🇦🇺":"#206694","🇦🇼":"#3498DB","🇦🇽":"#206694","🇦🇿":"#E91E63","🇧🇦":"#F1C40F","🇧🇧":"#206694","🇧🇩":"#E74C3C","🇧🇪":"#F1C40F","🇧🇫":"#11806A","🇧🇬":"#992D22","🇧🇭":"#9B59B6",
  "🇧🇮":"#11806A","🇧🇯":"#E74C3C","🇧🇱":"#9B59B6","🇧🇲":"#992D22","🇧🇳":"#F1C40F","🇧🇴":"#11806A","🇧🇶":"#206694","🇧🇷":"#F1C40F","🇧🇸":"#3498DB","🇧🇹":"#E67E22","🇧🇻":"#E74C3C","🇧🇼":"#3498DB","🇧🇾":"#11806A","🇧🇿":"#206694","🇨🇦":"#992D22","🇨🇨":"#11806A","🇨🇩":"#E74C3C","🇨🇫":"#11806A","🇨🇬":"#F1C40F","🇨🇭":"#9B59B6","🇨🇮":"#E67E22","🇨🇰":"#206694","🇨🇱":"#E74C3C","🇨🇲":"#E74C3C","🇨🇳":"#992D22","🇨🇴":"#206694","🇨🇵":"#206694","🇨🇷":"#206694","🇨🇺":"#206694","🇨🇻":"#206694","🇨🇼":"#206694","🇨🇽":"#11806A","🇨🇾":"#9B59B6","🇨🇿":"#992D22","🇩🇪":"#E74C3C","🇩🇬":"#9B59B6","🇩🇯":"#11806A","🇩🇰":"#992D22","🇩🇲":"#E67E22","🇩🇴":"#206694","🇩🇿":"#11806A","🇪🇦":"#F1C40F","🇪🇨":"#F1C40F","🇪🇪":"#9B59B6","🇪🇬":"#9B59B6","🇪🇭":"#9B59B6","🇪🇷":"#11806A","🇪🇸":"#F1C40F","🇪🇹":"#11806A","🇪🇺":"#206694","🇫🇮":"#206694","🇫🇯":"#3498DB","🇫🇰":"#206694","🇫🇲":"#3498DB","🇫🇴":"#3498DB","🇫🇷":"#206694","🇬🇦":"#11806A","🇬🇧":"#206694",
  "🇬🇩":"#11806A","🇬🇪":"#E74C3C","🇬🇫":"#11806A","🇬🇬":"#9B59B6","🇬🇭":"#11806A","🇬🇮":"#9B59B6","🇬🇱":"#992D22","🇬🇲":"#11806A","🇬🇳":"#F1C40F","🇬🇵":"#F1C40F","🇬🇶":"#11806A","🇬🇷":"#9B59B6","🇬🇸":"#206694","🇬🇹":"#3498DB","🇬🇺":"#206694","🇬🇼":"#F1C40F","🇬🇾":"#E67E22","🇭🇰":"#992D22","🇭🇲":"#206694","🇭🇳":"#9B59B6","🇭🇷":"#206694","🇭🇹":"#E91E63","🇭🇺":"#11806A","🇮🇨":"#206694","🇮🇩":"#992D22","🇮🇪":"#11806A","🇮🇱":"#206694","🇮🇲":"#992D22","🇮🇳":"#9B59B6","🇮🇴":"#9B59B6","🇮🇶":"#607D8B","🇮🇷":"#992D22","🇮🇸":"#9B59B6","🇮🇹":"#992D22","🇯🇪":"#9B59B6","🇯🇲":"#11806A","🇯🇴":"#E74C3C","🇯🇵":"#9B59B6","🇰🇪":"#E74C3C","🇰🇬":"#E74C3C","🇰🇭":"#992D22","🇰🇮":"#E74C3C","🇰🇲":"#11806A","🇰🇳":"#E74C3C","🇰🇵":"#206694","🇰🇷":"#9B59B6","🇰🇼":"#1ABC9C","🇰🇾":"#206694","🇰🇿":"#1ABC9C","🇱🇦":"#E74C3C","🇱🇧":"#9B59B6","🇱🇨":"#3498DB","🇱🇮":"#206694","🇱🇰":"#E74C3C","🇱🇷":"#E74C3C","🇱🇸":"#9B59B6","🇱🇹":"#11806A","🇱🇺":"#E74C3C",
  "🇱🇻":"#992D22","🇱🇾":"#E74C3C","🇲🇦":"#992D22","🇲🇨":"#9B59B6","🇲🇩":"#206694","🇲🇪":"#992D22","🇲🇫":"#206694","🇲🇬":"#E74C3C","🇲🇭":"#206694","🇲🇰":"#992D22","🇲🇱":"#F1C40F","🇲🇲":"#F1C40F","🇲🇳":"#206694","🇲🇴":"#11806A","🇲🇵":"#9B59B6","🇲🇶":"#206694","🇲🇷":"#E74C3C","🇲🇸":"#206694","🇲🇹":"#9B59B6","🇲🇺":"#E74C3C","🇲🇻":"#11806A","🇲🇼":"#992D22","🇲🇽":"#9B59B6","🇲🇾":"#9B59B6","🇲🇿":"#E67E22","🇳🇦":"#E74C3C","🇳🇨":"#E67E22","🇳🇪":"#11806A","🇳🇫":"#9B59B6","🇳🇬":"#9B59B6","🇳🇮":"#5865F2","🇳🇱":"#206694","🇳🇴":"#E74C3C","🇳🇵":"#992D22","🇳🇷":"#206694","🇳🇺":"#F1C40F","🇳🇿":"#206694","🇴🇲":"#11806A","🇵🇦":"#206694","🇵🇪":"#9B59B6","🇵🇫":"#992D22","🇵🇬":"#E74C3C","🇵🇭":"#992D22","🇵🇰":"#11806A","🇵🇱":"#E74C3C","🇵🇲":"#206694","🇵🇳":"#206694","🇵🇷":"#992D22","🇵🇸":"#9B59B6","🇵🇹":"#E74C3C","🇵🇼":"#F1C40F","🇵🇾":"#9B59B6","🇶🇦":"#9B59B6","🇷🇪":"#E74C3C","🇷🇴":"#F1C40F","🇷🇸":"#206694","🇷🇺":"#992D22","🇷🇼":"#F1C40F",
  "🇸🇦":"#11806A","🇸🇧":"#11806A","🇸🇨":"#11806A","🇸🇩":"#9B59B6","🇸🇪":"#F1C40F","🇸🇬":"#E74C3C","🇸🇭":"#206694","🇸🇮":"#E74C3C","🇸🇯":"#E74C3C","🇸🇰":"#992D22","🇸🇱":"#9B59B6","🇸🇲":"#9B59B6","🇸🇳":"#F1C40F","🇸🇴":"#3498DB","🇸🇷":"#11806A","🇸🇸":"#E74C3C","🇸🇹":"#E67E22","🇸🇻":"#9B59B6","🇸🇽":"#E74C3C","🇸🇾":"#992D22","🇸🇿":"#992D22","🇹🇦":"#206694","🇹🇨":"#206694","🇹🇩":"#F1C40F","🇹🇫":"#206694","🇹🇬":"#11806A","🇹🇭":"#992D22","🇹🇯":"#E91E63","🇹🇰":"#F1C40F","🇹🇱":"#E74C3C","🇹🇲":"#11806A","🇹🇳":"#992D22","🇹🇴":"#992D22","🇹🇷":"#E74C3C","🇹🇹":"#992D22","🇹🇻":"#607D8B","🇹🇼":"#3498DB","🇹🇿":"#11806A","🇺🇦":"#F1C40F","🇺🇬":"#607D8B","🇺🇲":"#E74C3C","🇺🇳":"#3498DB","🇺🇸":"#E74C3C","🇺🇾":"#9B59B6","🇺🇿":"#1ABC9C","🇻🇦":"#9B59B6","🇻🇨":"#F1C40F","🇻🇪":"#206694","🇻🇬":"#206694","🇻🇮":"#9B59B6","🇻🇳":"#992D22","🇻🇺":"#11806A","🇼🇫":"#E74C3C","🇼🇸":"#E74C3C","🇽🇰":"#206694","🇾🇪":"#E74C3C","🇾🇹":"#9B59B6","🇿🇦":"#E67E22",
  "🇿🇲":"#11806A","🇿🇼":"#11806A","🏴󠁧󠁢󠁥󠁮󠁧󠁿":"#992D22","🏴󠁧󠁢󠁳󠁣󠁴󠁿":"#206694","🏴󠁧󠁢󠁷󠁬󠁳󠁿":"#11806A"})
