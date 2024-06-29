/**
 * @name ChannelsPreview
 * @author arg0NNY
 * @authorLink https://github.com/arg0NNY/DiscordPlugins
 * @invite M8DBtcZjXD
 * @donate https://donationalerts.com/r/arg0nny
 * @version 2.0.0
 * @description Allows you to view recent messages in channels without switching to it.
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
                    "name": "arg0NNY",
                    "discord_id": '224538553944637440',
                    "github_username": 'arg0NNY'
                }
            ],
            "version": "2.0.0",
            "description": "Allows you to view recent messages in channels without switching to it.",
            github: "https://github.com/arg0NNY/DiscordPlugins/tree/master/ChannelsPreview",
            github_raw: "https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/ChannelsPreview/ChannelsPreview.plugin.js"
        },
        "changelog": [
            {
                "type": "added",
                "title": "What's new",
                "items": [
                    "Added the new trigger option: Shift + Hover.",
                    "Added ability to scroll the previewed channel.",
                    "Added ability to change how the NSFW channels should be handled: Show, Obscure media, Don't show.",
                    "Added unread messages indicator in the preview."
                ]
            },
            {
                "type": "improved",
                "title": "Improvements",
                "items": [
                    "Improved overall stability and performance.",
                    "Switched to the Discord's native popout handling, which is a lot more reliable than ZeresPluginLibrary's.",
                    "Preview now opens a lot faster than before in most cases.",
                    "Switched to the Discord's native message stream builder, which means that the preview will display the chat a lot more accurately than before.",
                    "Settings panel has been revamped and is now based on the native Discord components, which is a lot more reliable.",
                    "Settings are now have a more pleasant structure.",
                    "Switching servers is no more required to apply the changed settings."
                ]
            },
            {
                "type": "fixed",
                "title": "Fixed",
                "items": [
                    "Fixed an often occurring issue where the chat would darken but the preview wouldn't show up.",
                    "The messages are now fetched only if necessary instead of each time the preview is opened.",
                    "Updated to work in the latest release of Discord."
                ]
            }
        ]
    };

    return !global.ZeresPluginLibrary ? class {
        constructor() {
            this._config = config
        }

        getName() {
            return config.info.name
        }

        getAuthor() {
            return config.info.authors.map(a => a.name).join(", ")
        }

        getDescription() {
            return config.info.description
        }

        getVersion() {
            return config.info.version
        }

        load() {
            BdApi.UI.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9")
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r))
                    })
                }
            })
        }

        start() {
        }

        stop() {
        }
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Api) => {
            const {
                DOM,
                Webpack
            } = BdApi
            const { Filters } = Webpack
            const {
                Patcher,
                WebpackModules,
                DiscordModules,
                Utilities,
                DiscordClasses
            } = Api
            const {
                React,
                MessageActions,
                MessageStore,
                Flux,
                Dispatcher,
            } = DiscordModules

            const ChannelTypes = WebpackModules.getModule(Filters.byKeys('GUILD_TEXT'), { searchExports: true })

            const Selectors = {
                Messages: WebpackModules.getByProps('message', 'cozyMessage'),
                MessageDividers: WebpackModules.getByProps('divider', 'unreadPill'),
                EmptyMessage: WebpackModules.getByProps('emptyChannelIcon', 'locked'),
                Popout: WebpackModules.getByProps('messagesPopoutWrap'),
                ChannelItem: {
                    ...WebpackModules.getByProps('containerDefault', 'channelInfo'),
                    ...WebpackModules.getByProps('link', 'notInteractive')
                },
                Channel: WebpackModules.getByProps('channel', 'interactive'),
                Typing: WebpackModules.getByProps('typing', 'ellipsis'),
                ChatLayout: WebpackModules.getByProps('sidebar', 'guilds'),
                AppView: WebpackModules.getByProps('base', 'content'),
                Chat: WebpackModules.getByProps('messagesWrapper', 'scrollerContent')
            }

            let settings = {}
            const SUPPORTED_CHANNEL_TYPES = [
                ChannelTypes.GUILD_TEXT,
                ChannelTypes.GUILD_ANNOUNCEMENT,
                ChannelTypes.DM,
                ChannelTypes.GROUP_DM,
                ChannelTypes.PUBLIC_THREAD,
                ChannelTypes.PRIVATE_THREAD,
                ChannelTypes.GUILD_VOICE,
                ChannelTypes.GUILD_STAGE_VOICE
            ]

            const Common = WebpackModules.getByProps('Shakeable', 'List')
            const ChannelItem = [...Webpack.getWithKey(Filters.byStrings('shouldIndicateNewChannel', 'MANAGE_CHANNELS'))]
            const DMChannelItem = [...Webpack.getWithKey(Filters.byStrings('isMultiUserDM', 'getTypingUsers'))]
            const VoiceChannelItem = [...Webpack.getWithKey(Filters.byStrings('VoiceChannel', 'MANAGE_CHANNELS'))]
            const StageVoiceChannelItem = [...Webpack.getWithKey(Filters.byStrings('getStageInstanceByChannel', 'MANAGE_CHANNELS'))]
            const ChannelLink = [...Webpack.getWithKey(Filters.byStrings('hasActiveThreads', 'linkBottom'))]
            const ThreadChannelItem = Webpack.getModule(m => Filters.byStrings('thread', 'getVoiceStatesForChannel')(m?.type))
            const AppearanceSettingsStore = WebpackModules.getByProps('fontSize', 'fontScale')
            const MessageComponent = Webpack.getModule(m => Filters.byStrings('must not be a thread starter message')(m?.type), { searchExports: true })
            const ThreadStarterMessage = Webpack.getModule(Filters.byStrings('must be a thread starter message'), { searchExports: true })
            const EmptyMessage = WebpackModules.getByString('SYSTEM_DM_EMPTY_MESSAGE', 'BEGINNING_CHANNEL_WELCOME')
            const FluxTypingUsers = WebpackModules.getByString('getTypingUsers', 'isBypassSlowmode')
            const useStateFromStores = Webpack.getModule(Filters.byStrings('useStateFromStores'), { searchExports: true })
            const AppView = [...Webpack.getWithKey(Filters.byStrings('sidebarTheme', 'GUILD_DISCOVERY'))]
            const LocaleStore = Webpack.getModule(m => m.Messages?.IMAGE)
            const ThemeStore = Webpack.getStore('ThemeStore')
            const { updateTheme } = Webpack.getByKeys('updateTheme')
            const generateChannelStream = Webpack.getByStrings('oldestUnreadMessageId', 'MESSAGE_GROUP_BLOCKED')
            const ReadStateStore = Webpack.getStore('ReadStateStore')
            const ChannelStreamItemTypes = Webpack.getModule(Filters.byKeys('MESSAGE', 'DIVIDER'), { searchExports: true })
            const MessageDivider = Webpack.getModule(m => Filters.byStrings('divider', 'isBeforeGroup')(m?.type?.render))
            const Attachment = [...Webpack.getWithKey(Filters.byStrings('getObscureReason', 'mosaicItemContent'))]
            const Embed = Webpack.getByPrototypeKeys('renderAuthor', 'renderMedia')
            const FocusRing = Webpack.getModule(m => Filters.byStrings('FocusRing', 'focusProps', '"li"')(m?.render), { searchExports: true })

            function forceAppUpdate () {
                const locale = LocaleStore.getLocale()
                Dispatcher.dispatch({ type: 'I18N_LOAD_START', locale })
                setTimeout(() => {
                    Dispatcher.dispatch({ type: 'I18N_LOAD_SUCCESS', locale })
                    updateTheme(ThemeStore.theme)
                })
            }

            const ReducerStore = (() => {
                let n = 0

                function handleForceUpdate () {
                    n += 1
                }

                return new class ReducerStore extends Flux.Store {
                    getValue () {
                        return n
                    }
                }(Dispatcher, {
                    CP__FORCE_UPDATE: handleForceUpdate
                })
            })()
            function useUpdater () {
                return useStateFromStores([ReducerStore], () => ReducerStore.getValue())
            }

            const ShownPreviewsStore = (() => {
                const shouldShow = new Set()
                const shown = new Set()
                const scrollerRefs = new Map()

                function handlePreviewShouldShow ({ channelId }) {
                    shouldShow.add(channelId)
                }
                function handlePreviewShouldHide ({ channelId }) {
                    shouldShow.delete(channelId)
                }
                function handlePreviewOpened ({ channelId, scrollerRef }) {
                    shown.add(channelId)
                    if (scrollerRef) scrollerRefs.set(channelId, scrollerRef)
                }
                function handlePreviewClosed ({ channelId }) {
                    shown.delete(channelId)
                    scrollerRefs.delete(channelId)
                }

                return new class OpenedPreviewsStore extends Flux.Store {
                    shouldShow (channelId) {
                        return shouldShow.has(channelId)
                    }
                    isShown (channelId) {
                        return shown.has(channelId)
                    }
                    hasAnyShown () {
                        return shown.size > 0
                    }
                    getScrollerRef (channelId) {
                        return scrollerRefs.get(channelId)
                    }
                }(Dispatcher, {
                    CP__PREVIEW_SHOULD_SHOW: handlePreviewShouldShow,
                    CP__PREVIEW_SHOULD_HIDE: handlePreviewShouldHide,
                    CP__PREVIEW_SHOWN: handlePreviewOpened,
                    CP__PREVIEW_HIDDEN: handlePreviewClosed
                })
            })()

            const KeyboardStore = (() => {
                let isShiftKeyPressed = false

                function handleKeyDown ({ event }) {
                    if (event.code === 'ShiftLeft') isShiftKeyPressed = true
                }
                function handleKeyUp ({ event }) {
                    if (event.code === 'ShiftLeft') isShiftKeyPressed = false
                }

                return new class KeyboardStore extends Flux.Store {
                    isShiftKeyPressed () {
                        return isShiftKeyPressed
                    }
                }(Dispatcher, {
                    CP__KEY_DOWN: handleKeyDown,
                    CP__KEY_UP: handleKeyUp
                })
            })()
            function useIsShiftKeyPressed () {
                return useStateFromStores([KeyboardStore], () => KeyboardStore.isShiftKeyPressed())
            }

            function isGroupStarter (channelStreamItem) {
                return channelStreamItem?.type === ChannelStreamItemTypes.MESSAGE
                    && channelStreamItem.content.id === channelStreamItem.groupId
            }

            const DMChannelContext = React.createContext({ channel: null, selected: false })
            const PreviewContext = React.createContext({ channel: null })

            function PreviewDialog ({ channel, messages }) {
                const scrollerRef = React.useRef(null)

                React.useEffect(() => {
                    Dispatcher.dispatch({ type: 'CP__PREVIEW_SHOWN', channelId: channel.id, scrollerRef })
                    return () => Dispatcher.dispatch({ type: 'CP__PREVIEW_HIDDEN', channelId: channel.id })
                }, [])

                const messageCountLimit = settings.appearance.messagesCount
                const messageGroupSpacing = settings.appearance.groupSpacingSync
                  ? (AppearanceSettingsStore.messageGroupSpacing ?? 16)
                  : settings.appearance.groupSpacing

                const oldestUnreadMessageId = useStateFromStores([ReadStateStore], () => ReadStateStore.getOldestUnreadMessageId(channel.id))
                const channelStream = [
                  !messages.hasMoreBefore && messages.length <= messageCountLimit
                    ? { type: 'EMPTY_MESSAGE' }
                    : { type: ChannelStreamItemTypes.DIVIDER, content: `Displaying last ${messageCountLimit} messages`, cut: true }
                ].concat(generateChannelStream({
                    channel,
                    messages: messages.toArray().slice(-messageCountLimit),
                    oldestUnreadMessageId
                }))

                const channelStreamMarkup = channelStream
                    .map((item, index) => {
                        switch (item.type) {
                            case 'EMPTY_MESSAGE':
                                return React.createElement(EmptyMessage, { channel })
                            case ChannelStreamItemTypes.DIVIDER:
                                return React.createElement(MessageDivider, {
                                    className: item.cut ? 'CP__divider-cut' : '',
                                    isUnread: !!item.unreadId,
                                    isBeforeGroup: !item.content && isGroupStarter(channelStream[index + 1]),
                                    children: item.content
                                })
                            case ChannelStreamItemTypes.MESSAGE:
                            case ChannelStreamItemTypes.THREAD_STARTER_MESSAGE:
                                return React.createElement(
                                    item.type === ChannelStreamItemTypes.THREAD_STARTER_MESSAGE ? ThreadStarterMessage : MessageComponent,
                                    {
                                        channel,
                                        message: item.content,
                                        groupId: item.groupId,
                                        id: `chat-messages-${item.content.id}`,
                                        compact: settings.appearance.displayMode === 'compact'
                                    }
                                )
                        }
                    })

                return React.createElement(
                    'div',
                    {
                        className: `CP__popout group-spacing-${messageGroupSpacing} ${Selectors.Popout.messagesPopoutWrap}`,
                        style: {
                            height: (settings.appearance.popoutHeight ?? 30) + 'vh'
                        }
                    },
                    React.createElement(PreviewContext.Provider, {
                        value: { channel },
                        children: React.createElement(Common.PinToBottomScrollerAuto, {
                            ref: scrollerRef,
                            className: 'CP__scroller',
                            contentClassName: Selectors.Chat.scrollerContent,
                            onResize: () => {}, // Causes error if not provided
                            onScroll: () => {}, // And this one is just to be safe :)
                            children: React.createElement('div', {
                                className: 'CP__container',
                                children: [
                                    ...channelStreamMarkup,
                                    settings.appearance.typingUsers !== false && React.createElement(FluxTypingUsers, { channel })
                                ]
                            })
                        })
                    })
                )
            }

            function ChannelPopout ({ channel, selected, messages, children, shouldShow: _shouldShow = false, ...props }) {
                const isShiftKeyPressed = useIsShiftKeyPressed()

                const shouldShow = _shouldShow && !selected
                  && (settings.trigger.displayOn !== 'shift-hover' || isShiftKeyPressed)
                  && (settings.behaviour.nsfw !== 'hide' || !channel.nsfw)
                const isFetchable = messages.length < settings.appearance.messagesCount && (messages.hasMoreBefore || messages.hasMoreAfter)

                React.useEffect(() => {
                    if (shouldShow && isFetchable)
                        MessageActions.fetchMessages({ channelId: channel.id, limit: settings.appearance.messagesCount })
                }, [shouldShow, isFetchable])
                React.useEffect(
                  () => () => Dispatcher.dispatch({ type: 'CP__PREVIEW_SHOULD_HIDE', channelId: channel.id }),
                  [channel.id]
                )

                return React.createElement(Common.Popout, {
                    position: 'right',
                    align: 'center',
                    renderPopout: () => React.createElement(PreviewDialog, { channel, messages }),
                    children,
                    shouldShow: shouldShow && !isFetchable,
                    spacing: 16,
                    disablePointerEvents: true,
                    ...props
                })
            }

            function ChannelPopoutBackdrop () {
                const shouldShow = useStateFromStores([ShownPreviewsStore], () => ShownPreviewsStore.hasAnyShown())

                return shouldShow ? React.createElement('div', {
                    className: 'CP__backdrop',
                    style: {
                        left: (document.querySelector(`.${Selectors.ChatLayout.sidebar}`)?.clientWidth ?? 240) + 'px',
                        opacity: settings.appearance.darkenLevel
                    }
                }) : null
            }

            return class ChannelsPreview extends Plugin {
                onStart () {
                    this.injectCSS()

                    this.patchChannelItem()
                    this.patchChannelLink()
                    this.patchThreadChannelItem()
                    this.patchDMChannelItem()
                    this.patchAppView()
                    this.patchMedia()
                    this.attachKeyboardEvents()

                    forceAppUpdate()
                }

                showPopout (channel) {
                    if (!SUPPORTED_CHANNEL_TYPES.includes(channel.type)) return

                    Dispatcher.dispatch({ type: 'CP__PREVIEW_SHOULD_SHOW', channelId: channel.id })
                }
                closePopout (channelId) {
                    Dispatcher.dispatch({ type: 'CP__PREVIEW_SHOULD_HIDE', channelId })
                }

                makeChannelItemCallback () {
                    let isPatched = false
                    return (self, [{ channel }], value) => {
                        value.props.CP__state = useUpdater()
                        value.props.messages = useStateFromStores([MessageStore], () => MessageStore.getMessages(channel.id))
                        value.props.CP__shouldShowPopout = useStateFromStores([ShownPreviewsStore], () => ShownPreviewsStore.shouldShow(channel.id))

                        if (isPatched || !value?.type?.DecoratedComponent?.prototype?.render) return
                        isPatched = true

                        Patcher.after(value.type.DecoratedComponent.prototype, 'render', ({ props }, args, value) => {
                            const { channel, messages, selected, CP__shouldShowPopout: shouldShow } = props

                            if (!SUPPORTED_CHANNEL_TYPES.includes(channel.type)) return

                            const popout = Utilities.findInReactTree(value, m => m?.props?.renderPopout)
                            if (!popout) return

                            popout.type = ChannelPopout
                            popout.props = {
                                channel,
                                selected,
                                messages,
                                children: popout.props.children,
                                shouldShow,
                                onRequestClose: () => this.closePopout(channel.id)
                            }
                        })
                    }
                }

                patchLink ({ link, channel, timeoutRef = React.useRef(null), selected }) {
                    const openPopout = () => !selected && this.showPopout(channel)

                    if (settings.trigger.displayOn === 'mwheel') {
                        const preventDefault = (_, [e]) => e.button === 1 && e.preventDefault()
                        Patcher.before(link.props, 'onMouseDown', preventDefault)
                        Patcher.before(link.props, 'onAuxClick', preventDefault)
                        Patcher.before(link.props, 'onMouseUp', (_, [e]) => e.button === 1 && openPopout())
                    }

                    if (['hover', 'shift-hover'].includes(settings.trigger.displayOn))
                        Patcher.before(link.props, 'onMouseEnter',
                          () => timeoutRef.current = setTimeout(openPopout, settings.trigger.hoverDelay * 1000))

                    Patcher.before(link.props, 'onMouseLeave', () => {
                        clearTimeout(timeoutRef.current)
                        this.closePopout(channel.id)
                    })

                    const ref = React.useRef(null)
                    if (!link.ref) link.ref = ref

                    React.useEffect(() => {
                        const onWheel = e => {
                            if (settings.behaviour.scroll === 'shift' && !e.shiftKey) return

                            const scroller = ShownPreviewsStore.getScrollerRef(channel.id)?.current?.getScrollerNode()
                            if (!scroller) return

                            scroller.scrollTop += e.deltaY
                            e.preventDefault()
                        }
                        link.ref?.current?.addEventListener('wheel', onWheel, { passive: false })
                        return () => link.ref?.current?.removeEventListener('wheel', onWheel, { passive: false })
                    }, [])
                }

                patchChannelItem () {
                    Patcher.after(...ChannelItem, this.makeChannelItemCallback())
                    Patcher.after(...VoiceChannelItem, this.makeChannelItemCallback())
                    Patcher.after(...StageVoiceChannelItem, this.makeChannelItemCallback())
                }

                patchChannelLink () {
                    Patcher.after(...ChannelLink, (self, [{ channel, selected }], value) => {
                        const link = Utilities.findInReactTree(value, m => m?.props?.role && m?.props?.target)
                        if (!link) return

                        this.patchLink({ link, channel, selected })
                    })
                }

                patchThreadChannelItem () {
                    Patcher.after(ThreadChannelItem, 'type', (self, [{ thread, isSelectedChannel }], value) => {
                        useUpdater()
                        const messages = useStateFromStores([MessageStore], () => MessageStore.getMessages(thread.id))
                        const shouldShow = useStateFromStores([ShownPreviewsStore], () => ShownPreviewsStore.shouldShow(thread.id))

                        const linkWrapper = Utilities.findInReactTree(value, m => m?.children?.props?.className?.includes('iconVisibility'))
                        if (!linkWrapper) return

                        this.patchLink({
                            link: linkWrapper.children,
                            channel: thread,
                            selected: isSelectedChannel
                        })

                        const { children } = linkWrapper
                        linkWrapper.children = React.createElement(ChannelPopout, {
                            channel: thread,
                            selected: isSelectedChannel,
                            messages,
                            children: () => children,
                            shouldShow,
                            onRequestClose: () => this.closePopout(thread.id)
                        })
                        linkWrapper.children.children = children // Allow other plugins to modify the children
                    })
                }

                patchDMChannelItem () {
                    Patcher.after(...DMChannelItem, (self, [{ channel, selected }], value) => {
                        useUpdater()
                        const messages = useStateFromStores([MessageStore], () => MessageStore.getMessages(channel.id))
                        const shouldShow = useStateFromStores([ShownPreviewsStore], () => ShownPreviewsStore.shouldShow(channel.id))

                        const popout = React.createElement(ChannelPopout, {
                            channel,
                            selected,
                            messages,
                            shouldShow,
                            onRequestClose: () => this.closePopout(channel.id),
                            children: () => React.createElement(DMChannelContext.Provider, {
                                value: { channel },
                                children: value
                            })
                        })
                        popout.children = value // Allow other plugins to modify the children

                        return popout
                    })
                    Patcher.after(FocusRing, 'render', (self, [{ className }], value) => {
                        if (!className?.includes(Selectors.Channel.channel)) return

                        const { channel, selected } = React.useContext(DMChannelContext)
                        if (!channel) return

                        this.patchLink({
                            link: value.props.children,
                            channel,
                            selected
                        })
                    })
                }

                patchAppView () {
                    Patcher.after(...AppView, (self, args, value) => {
                        useUpdater()
                        if (!settings.appearance.darkenChat) return

                        const content = Utilities.findInReactTree(value, m => m?.className?.includes(Selectors.AppView.content))
                        if (!content) return

                        content.children.push(
                          React.createElement(ChannelPopoutBackdrop)
                        )
                    })
                }

                patchMedia () {
                    const OBSCURE_REASON = 'explicit_content'

                    Patcher.before(...Attachment, (self, [props]) => {
                        const { channel } = React.useContext(PreviewContext)
                        if (settings.behaviour.nsfw === 'obscure' && channel?.nsfw)
                            props.getObscureReason = () => OBSCURE_REASON
                    })

                    Embed.contextType = PreviewContext
                    Patcher.before(Embed.prototype, 'render', ({ props, context }) => {
                        if (settings.behaviour.nsfw === 'obscure' && context.channel?.nsfw && props.embed.image)
                            props.obscureReason = OBSCURE_REASON
                    })
                }

                attachKeyboardEvents () {
                    this.keyboardEvents = {
                        onKeyDown: e => Dispatcher.dispatch({ type: 'CP__KEY_DOWN', event: e }),
                        onKeyUp: e => Dispatcher.dispatch({ type: 'CP__KEY_UP', event: e })
                    }
                    addEventListener('keydown', this.keyboardEvents.onKeyDown)
                    addEventListener('keyup', this.keyboardEvents.onKeyUp)
                }
                clearKeyboardEvents () {
                    removeEventListener('keydown', this.keyboardEvents.onKeyDown)
                    removeEventListener('keyup', this.keyboardEvents.onKeyUp)
                }

                injectCSS () {
                    //language=CSS
                    DOM.addStyle('ChannelsPreview-style', `
.CP__popout {
  pointer-events: none;
  background: var(--background-primary);
  border-radius: 10px;
  height: 30vh;
  min-height: 150px;
  width: 50vw;
  min-width: 350px;
  overflow: hidden;
  margin-top: 30px; /* TODO: Accomodate for different platforms */
}
.CP__popout * {
  pointer-events: none !important;
}
.CP__container {
  padding-bottom: 25px;
}
.CP__container > * {
    list-style: none;
}
.CP__scroller {
    display: flex;
    flex-direction: column-reverse;
    overflow-anchor: auto;
}
.CP__backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000;
  pointer-events: none;
  opacity: 0;
  transition: .3s opacity;
  z-index: 1000;
}

.CP__divider-cut {
  margin-top: 40px !important;
  border-style: dashed;
}
.CP__divider-cut > span {
  font-weight: 400;
}

.CP__scroll-hint {
    position: absolute;
    inset: 0;
    z-index: 100;
    background: rgba(0, 0, 0, .6);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    animation: CP__fadeIn .3s ease;
}
@keyframes CP__fadeIn {
    0% { opacity: 0 }
    100% { opacity: 1 }
}

#${this.getSettingsPanelId()} {
    color: var(--header-primary);
    line-height: 1;
}
#${this.getSettingsPanelId()} .plugin-inputs {
    box-sizing: border-box;
    padding: 0 10px;
}
        `)
                }

                clearCSS () {
                    DOM.removeStyle('ChannelsPreview-style')
                }

                onStop () {
                    this.clearCSS()
                    Patcher.unpatchAll()
                    this.clearKeyboardEvents()
                    delete Embed.contextType

                    forceAppUpdate()
                }

                getSettingsPanelId () {
                    return `${this.getName()}-settings`
                }

                constructor () {
                    super()

                    this.defaultSettings = {
                        trigger: {
                            displayOn: 'hover',
                            hoverDelay: .4
                        },
                        behaviour: {
                            scroll: 'default',
                            nsfw: 'obscure'
                        },
                        appearance: {
                            popoutHeight: 40,
                            darkenChat: true,
                            darkenLevel: .3,
                            displayMode: 'cozy',
                            groupSpacingSync: true,
                            groupSpacing: 16,

                            // Belongs to Behaviour (located here for backwards compatibility)
                            messagesCount: 20,
                            typingUsers: true
                        }
                    }

                    this.settings = this.loadSettings(this.defaultSettings)
                    settings = this.settings
                }

                getSettingsPanel () {
                    const plugin = this
                    function SettingsPanel () {
                        const [_, forceUpdate] = React.useReducer(x => x + 1, 0)
                        const onUpdate = React.useCallback(() => {
                            Dispatcher.dispatch({ type: 'CP__FORCE_UPDATE' })
                            forceUpdate()
                        }, [])

                        return React.createElement('div', {
                            id: plugin.getSettingsPanelId(),
                            children: [
                                React.createElement(Common.FormDivider, {
                                    className: `${DiscordClasses.Margins.marginBottom20}`
                                }),
                                React.createElement(Common.FormTitle, {
                                    tag: Common.FormTitleTags.H1,
                                    className: DiscordClasses.Margins.marginBottom20,
                                    children: 'Trigger'
                                }),
                                React.createElement(Common.FormSection, {
                                    children: [
                                        React.createElement(Common.RadioGroup, {
                                            className: DiscordClasses.Margins.marginBottom20,
                                            options: [
                                                { name: 'Hover', value: 'hover' },
                                                { name: 'Shift + Hover', value: 'shift-hover' },
                                                { name: 'Mouse Wheel Click', value: 'mwheel' }
                                            ],
                                            value: settings.trigger.displayOn,
                                            onChange: ({ value }) => {
                                                settings.trigger.displayOn = value
                                                onUpdate()
                                            }
                                        }),
                                        ['hover', 'shift-hover'].includes(settings.trigger.displayOn)
                                        && React.createElement(Common.FormSection, {
                                            children: [
                                                React.createElement(Common.FormTitle, {
                                                    className: DiscordClasses.Margins.marginBottom4,
                                                    children: 'Hover Delay'
                                                }),
                                                React.createElement(Common.FormText, {
                                                    className: DiscordClasses.Margins.marginBottom20,
                                                    type: Common.FormText.Types.DESCRIPTION,
                                                    children: 'The amount of time to hover before triggering the preview.'
                                                }),
                                                React.createElement(Common.Slider, {
                                                    initialValue: settings.trigger.hoverDelay,
                                                    onValueChange: value => {
                                                        settings.trigger.hoverDelay = value
                                                        onUpdate()
                                                    },
                                                    defaultValue: plugin.defaultSettings.trigger.hoverDelay,
                                                    minValue: .1,
                                                    maxValue: 2,
                                                    markers: [...Array(20).keys()].map(n => (n + 1) / 10),
                                                    stickToMarkers: true,
                                                    onMarkerRender: m => m%.5 === 0 || m === .1 || m === plugin.defaultSettings.trigger.hoverDelay
                                                      ? m.toFixed(1) + 's' : ''
                                                })
                                            ]
                                        })
                                    ]
                                }),
                                React.createElement(Common.FormDivider, {
                                    className: `${DiscordClasses.Margins.marginBottom40} ${DiscordClasses.Margins.marginTop40}`
                                }),
                                React.createElement(Common.FormTitle, {
                                    tag: Common.FormTitleTags.H1,
                                    className: DiscordClasses.Margins.marginBottom20,
                                    children: 'Behavior'
                                }),
                                React.createElement(Common.FormItem, {
                                    className: DiscordClasses.Margins.marginBottom20,
                                    children: [
                                        React.createElement(Common.FormTitle, {
                                            className: DiscordClasses.Margins.marginBottom4,
                                            children: 'Message Count Limit'
                                        }),
                                        React.createElement(Common.FormText, {
                                            className: DiscordClasses.Margins.marginBottom20,
                                            type: Common.FormText.Types.DESCRIPTION,
                                            children: 'Sets the maximum amount of messages to fetch and display in the preview.'
                                        }),
                                        React.createElement(Common.Slider, {
                                            initialValue: settings.appearance.messagesCount,
                                            onValueChange: value => {
                                                settings.appearance.messagesCount = value
                                                onUpdate()
                                            },
                                            defaultValue: plugin.defaultSettings.appearance.messagesCount,
                                            minValue: 10,
                                            maxValue: 100,
                                            markers: [...Array(10).keys()].map(n => (n + 1) * 10),
                                            stickToMarkers: true
                                        }),
                                        settings.appearance.messagesCount > 40 && React.createElement(Common.FormText, {
                                            className: DiscordClasses.Margins.marginTop8,
                                            type: Common.FormText.Types.ERROR,
                                            children: [
                                                React.createElement('b', { children: 'WARNING' }),
                                                ': Rendering a lot of messages at once can cause performance issues and freezing.'
                                            ]
                                        }),
                                        React.createElement(Common.FormDivider, {
                                            className: DiscordClasses.Margins.marginTop20
                                        }),
                                    ]
                                }),
                                React.createElement(Common.FormSwitch, {
                                    className: DiscordClasses.Margins.marginBottom20,
                                    value: settings.appearance.typingUsers,
                                    onChange: value => {
                                        settings.appearance.typingUsers = value
                                        onUpdate()
                                    },
                                    children: 'Show typing users',
                                    note: 'Shows who\'s typing in the previewed channel.'
                                }),
                                React.createElement(Common.FormItem, {
                                    className: DiscordClasses.Margins.marginBottom20,
                                    children: [
                                        React.createElement(Common.FormTitle, {
                                            className: DiscordClasses.Margins.marginBottom8,
                                            children: 'Scrolling'
                                        }),
                                        React.createElement(Common.RadioGroup, {
                                            options: [
                                                {
                                                    name: 'Scroll',
                                                    value: 'default',
                                                    desc: 'Redirect scroll to the preview while it is open.'
                                                },
                                                {
                                                    name: 'Shift + Scroll',
                                                    value: 'shift',
                                                    desc: 'Redirect scroll to the preview only while holding Shift.'
                                                }
                                            ],
                                            value: settings.behaviour.scroll,
                                            onChange: ({ value }) => {
                                                settings.behaviour.scroll = value
                                                onUpdate()
                                            }
                                        }),
                                        React.createElement(Common.FormDivider, {
                                            className: DiscordClasses.Margins.marginTop20
                                        }),
                                    ]
                                }),
                                React.createElement(Common.FormItem, {
                                    className: DiscordClasses.Margins.marginBottom20,
                                    children: [
                                        React.createElement(Common.FormTitle, {
                                            className: DiscordClasses.Margins.marginBottom8,
                                            children: 'NSFW'
                                        }),
                                        React.createElement(Common.RadioGroup, {
                                            options: [
                                                {
                                                    name: 'Show',
                                                    value: 'show',
                                                    desc: 'Enable the preview for NSFW channels.'
                                                },
                                                {
                                                    name: 'Obscure media',
                                                    value: 'obscure',
                                                    desc: 'Blur all images and videos in the preview of NSFW channels.'
                                                },
                                                {
                                                    name: 'Don\'t show',
                                                    value: 'hide',
                                                    desc: 'Disable the preview for NSFW channels.'
                                                }
                                            ],
                                            value: settings.behaviour.nsfw,
                                            onChange: ({ value }) => {
                                                settings.behaviour.nsfw = value
                                                onUpdate()
                                            }
                                        })
                                    ]
                                }),
                                React.createElement(Common.FormDivider, {
                                    className: `${DiscordClasses.Margins.marginBottom40} ${DiscordClasses.Margins.marginTop40}`
                                }),
                                React.createElement(Common.FormTitle, {
                                    tag: Common.FormTitleTags.H1,
                                    className: DiscordClasses.Margins.marginBottom20,
                                    children: 'Appearance'
                                }),
                                React.createElement(Common.FormItem, {
                                    className: DiscordClasses.Margins.marginBottom20,
                                    children: [
                                        React.createElement(Common.FormTitle, {
                                            className: DiscordClasses.Margins.marginBottom4,
                                            children: 'Preview Height'
                                        }),
                                        React.createElement(Common.FormText, {
                                            className: DiscordClasses.Margins.marginBottom20,
                                            type: Common.FormText.Types.DESCRIPTION,
                                            children: 'Sets the height of the preview window relative to the Discord window.'
                                        }),
                                        React.createElement(Common.Slider, {
                                            initialValue: settings.appearance.popoutHeight,
                                            onValueChange: value => {
                                                settings.appearance.popoutHeight = value
                                                onUpdate()
                                            },
                                            defaultValue: plugin.defaultSettings.appearance.popoutHeight,
                                            minValue: 10,
                                            maxValue: 90,
                                            markers: [...Array(18).keys()].map(n => (n + 1) * 5).slice(1),
                                            stickToMarkers: true,
                                            onMarkerRender: m => m % 10 === 0 ? m + '%' : ''
                                        }),
                                        React.createElement(Common.FormDivider, {
                                            className: DiscordClasses.Margins.marginTop20
                                        }),
                                    ]
                                }),
                                React.createElement(Common.FormItem, {
                                    className: DiscordClasses.Margins.marginBottom20,
                                    children: [
                                        React.createElement(Common.FormTitle, {
                                            className: DiscordClasses.Margins.marginBottom8,
                                            children: 'Backdrop'
                                        }),
                                        React.createElement(Common.FormText, {
                                            className: DiscordClasses.Margins.marginBottom20,
                                            type: Common.FormText.Types.DESCRIPTION,
                                            children: 'Darken the chat behind the preview for better contrast.'
                                        }),
                                        React.createElement(Common.FormSwitch, {
                                            children: 'Enable backdrop',
                                            value: settings.appearance.darkenChat,
                                            onChange: value => {
                                                settings.appearance.darkenChat = value
                                                onUpdate()
                                            },
                                            hideBorder: true
                                        }),
                                        settings.appearance.darkenChat && React.createElement(Common.FormItem, {
                                            children: [
                                                React.createElement(Common.FormTitle, {
                                                    className: DiscordClasses.Margins.marginBottom20,
                                                    children: 'Dimming Level'
                                                }),
                                                React.createElement(Common.Slider, {
                                                    initialValue: settings.appearance.darkenLevel,
                                                    onValueChange: value => {
                                                        settings.appearance.darkenLevel = value
                                                        onUpdate()
                                                    },
                                                    defaultValue: plugin.defaultSettings.appearance.darkenLevel,
                                                    minValue: .1,
                                                    maxValue: 1,
                                                    markers: [...Array(10).keys()].map(n => (n + 1) / 10),
                                                    stickToMarkers: true,
                                                    onMarkerRender: m => (m * 100) + '%'
                                                }),
                                            ]
                                        }),
                                        React.createElement(Common.FormDivider, {
                                            className: DiscordClasses.Margins.marginTop20
                                        })
                                    ]
                                }),
                                React.createElement(Common.FormItem, {
                                    className: DiscordClasses.Margins.marginBottom20,
                                    children: [
                                        React.createElement(Common.FormTitle, {
                                            className: DiscordClasses.Margins.marginBottom8,
                                            children: 'Message Display'
                                        }),
                                        React.createElement(Common.RadioGroup, {
                                            options: [
                                                { name: 'Cozy', value: 'cozy' },
                                                { name: 'Compact', value: 'compact' }
                                            ],
                                            value: settings.appearance.displayMode,
                                            onChange: ({ value }) => {
                                                settings.appearance.displayMode = value
                                                onUpdate()
                                            }
                                        }),
                                        React.createElement(Common.FormDivider, {
                                            className: DiscordClasses.Margins.marginTop20
                                        })
                                    ]
                                }),
                                React.createElement(Common.FormItem, {
                                    className: DiscordClasses.Margins.marginBottom20,
                                    children: [
                                        React.createElement(Common.FormTitle, {
                                            className: DiscordClasses.Margins.marginBottom20,
                                            children: 'Space between Message Groups'
                                        }),
                                        React.createElement(Common.FormSwitch, {
                                            children: 'Sync with app settings',
                                            value: settings.appearance.groupSpacingSync,
                                            onChange: value => {
                                                settings.appearance.groupSpacingSync = value
                                                onUpdate()
                                            },
                                            hideBorder: true
                                        }),
                                        !settings.appearance.groupSpacingSync && React.createElement(Common.Slider, {
                                            initialValue: settings.appearance.groupSpacing,
                                            onValueChange: value => {
                                                settings.appearance.groupSpacing = value
                                                onUpdate()
                                            },
                                            defaultValue: plugin.defaultSettings.appearance.groupSpacing,
                                            minValue: 0,
                                            maxValue: 24,
                                            markers: [0, 4, 8, 16, 24],
                                            stickToMarkers: true,
                                            onMarkerRender: m => m + 'px'
                                        }),
                                        React.createElement(Common.FormDivider, {
                                            className: DiscordClasses.Margins.marginTop20
                                        })
                                    ]
                                })
                            ]
                        })
                    }

                    return React.createElement(SettingsPanel)
                }
            }
        }

        return plugin(Plugin, Api)
    })(global.ZeresPluginLibrary.buildPlugin(config))
})()
