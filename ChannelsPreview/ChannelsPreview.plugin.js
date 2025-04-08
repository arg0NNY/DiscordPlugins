/**
 * @name ChannelsPreview
 * @author arg0NNY
 * @authorLink https://github.com/arg0NNY/DiscordPlugins
 * @invite M8DBtcZjXD
 * @donate https://donationalerts.com/r/arg0nny
 * @version 2.1.3
 * @description Allows you to view recent messages in channels without switching to it.
 * @website https://github.com/arg0NNY/DiscordPlugins/tree/master/ChannelsPreview
 * @source https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/ChannelsPreview/ChannelsPreview.plugin.js
 * @updateUrl https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/ChannelsPreview/ChannelsPreview.plugin.js
 */

/* ### CONFIG START ### */
const config = {
  info: {
    name: 'ChannelsPreview',
    version: '2.1.3',
    description: 'Allows you to view recent messages in channels without switching to it.'
  },
  changelog: [
    {
      type: 'fixed',
      title: 'Fixes',
      items: [
        'Fixed the preview positioning incorrectly when the plugin is used in pair with BetterChannelList\'s redesign feature.',
        'Updated to work in the latest release of Discord.'
      ]
    }
  ]
}
/* ### CONFIG END ### */

const {
  DOM,
  Webpack,
  Patcher,
  React,
  Utils,
  Data,
  UI
} = new BdApi(config.info.name)
const { Filters } = Webpack

const MessageActions = Webpack.getByKeys('jumpToMessage', '_sendMessage')
const MessageStore = Webpack.getStore('MessageStore')
const Flux = Webpack.getByKeys('Store', 'connectStores')
const Dispatcher = Webpack.getByKeys('dispatch', 'subscribe')
const ChannelTypes = Webpack.getModule(Filters.byKeys('GUILD_TEXT'), { searchExports: true })

const findInReactTree = (tree, searchFilter) => Utils.findInTree(tree, searchFilter, { walkable: ['props', 'children', 'child', 'sibling'] })

const Selectors = {
  Messages: Webpack.getByKeys('message', 'cozyMessage'),
  MessageDividers: Webpack.getByKeys('divider', 'unreadPill'),
  EmptyMessage: Webpack.getByKeys('emptyChannelIcon', 'locked'),
  Popout: Webpack.getByKeys('messagesPopoutWrap'),
  ChannelItem: {
    ...Webpack.getByKeys('containerDefault', 'channelInfo'),
    ...Webpack.getByKeys('link', 'notInteractive')
  },
  Channel: Webpack.getByKeys('channel', 'interactive'),
  Typing: Webpack.getByKeys('typing', 'ellipsis'),
  ChatLayout: Webpack.getByKeys('sidebar', 'guilds'),
  AppView: Webpack.getByKeys('base', 'content'),
  Chat: Webpack.getByKeys('messagesWrapper', 'scrollerContent'),
  Margins: Webpack.getByKeys('marginBottom40', 'marginTop40')
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

const [PinToBottomScrollerAuto] = Object.values(Webpack.getBySource('disableScrollAnchor', 'ResizeObserver'))
const Popout = Webpack.getModule(m => Filters.byKeys('Animation')(m) && Filters.byStrings('renderPopout')(m?.prototype?.render), { searchExports: true })
const FormTitle = Webpack.getModule(Filters.byStrings('defaultMargin', 'errorMessage'), { searchExports: true })
const FormTitleTags = Webpack.getModule(Filters.byKeys('H1', 'LABEL', 'LEGEND'), { searchExports: true })
const FormText = Webpack.getModule(m => Filters.byKeys('DESCRIPTION', 'ERROR')(m?.Types), { searchExports: true })
const FormSection = Webpack.getModule(m => Filters.byStrings('titleId', 'sectionTitle')(m?.render), { searchExports: true })
const RadioGroup = Webpack.getModule(m => Filters.byKeys('NOT_SET', 'NONE')(m?.Sizes), { searchExports: true })
const Slider = Webpack.getModule(m => Filters.byKeys('stickToMarkers', 'initialValue')(m?.defaultProps), { searchExports: true })
const FormSwitch = Webpack.getModule(Filters.byStrings('labelRow', 'checked'), { searchExports: true })
const FormItem = Webpack.getModule(m => Filters.byStrings('titleId', 'errorId', 'setIsFocused')(m?.render), { searchExports: true })

const ChannelItem = [...Webpack.getWithKey(Filters.byStrings('shouldIndicateNewChannel', 'MANAGE_CHANNELS'))]
const DMChannelItem = [...Webpack.getWithKey(Filters.byStrings('PrivateChannel', 'getTypingUsers'))]
const VoiceChannelItem = [...Webpack.getWithKey(Filters.byStrings('PLAYING', 'MANAGE_CHANNELS'))]
const StageVoiceChannelItem = [...Webpack.getWithKey(Filters.byStrings('getStageInstanceByChannel', 'MANAGE_CHANNELS'))]
const ChannelLink = [...Webpack.getWithKey(Filters.byStrings('hasActiveThreads', 'linkBottom'))]
const ThreadChannelItem = Webpack.getModule(m => Filters.byStrings('thread', 'getVoiceStatesForChannel')(m?.type))
const AppearanceSettingsStore = Webpack.getByKeys('fontSize', 'fontScale')
const MessageComponent = Webpack.getModule(m => Filters.byStrings('must not be a thread starter message')(m?.type), { searchExports: true })
const ThreadStarterMessage = Webpack.getModule(Filters.byStrings('must be a thread starter message'), { searchExports: true })
const EmptyMessage = Webpack.getByStrings('parseTopic', 'buttonContainer')
const FluxTypingUsers = Webpack.getByStrings('getTypingUsers', 'isThreadCreation')
const useStateFromStores = Webpack.getModule(Filters.byStrings('useStateFromStores'), { searchExports: true })
const AppView = [...Webpack.getWithKey(Filters.byStrings('sidebarTheme', 'GUILD_DISCOVERY'))]
const generateChannelStream = Webpack.getByStrings('oldestUnreadMessageId', 'MESSAGE_GROUP_BLOCKED')
const ReadStateStore = Webpack.getStore('ReadStateStore')
const ChannelStreamItemTypes = Webpack.getModule(Filters.byKeys('MESSAGE', 'DIVIDER'), { searchExports: true })
const MessageDivider = Webpack.getModule(m => Filters.byStrings('divider', 'isBeforeGroup')(m?.type?.render))
const Attachment = [...Webpack.getWithKey(Filters.byStrings('getObscureReason', 'mosaicItemContent'))]
const Embed = Webpack.getByPrototypeKeys('renderAuthor', 'renderMedia')
const FocusRing = Webpack.getModule(m => Filters.byStrings('focusProps', '"li"')(m?.render), { searchExports: true })

function forceAppUpdate () {
  Dispatcher.dispatch({ type: 'DOMAIN_MIGRATION_START' })
  setTimeout(() => Dispatcher.dispatch({ type: 'DOMAIN_MIGRATION_SKIP' }))
}

function FormDivider ({ className, style }) {
  return React.createElement('div', {
    className: Utils.className('divider__46c3b', className),
    style
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
      children: React.createElement(PinToBottomScrollerAuto, {
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

  return React.createElement(Popout, {
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
    style: { opacity: settings.appearance.darkenLevel }
  }) : null
}

module.exports = class ChannelsPreview {
  start () {
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

      Patcher.after(value.type.DecoratedComponent.prototype, 'render', (self, args, value) => {
        const { channel, messages, selected, CP__shouldShowPopout: shouldShow } = self.props

        if (!SUPPORTED_CHANNEL_TYPES.includes(channel.type)) return

        const popout = findInReactTree(value, m => m?.props?.renderPopout)
        if (!popout) return

        if (!self.channelItemRef && !self.__channelItemRef) {
          self.__channelItemRef = React.createRef(null)
        }
        if (self.__channelItemRef && typeof popout.props.children === 'function') {
          const ref = self.__channelItemRef
          Patcher.after(popout.props, 'children', (self, args, value) => {
            Patcher.after(value.props, 'children', (self, args, value) => {
              value.ref = ref
            })
          })
        }

        popout.type = ChannelPopout
        popout.props = {
          targetElementRef: self.channelItemRef ?? self.__channelItemRef,
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
      const link = findInReactTree(value, m => m?.props?.role && m?.props?.target)
      if (!link) return

      this.patchLink({ link, channel, selected })
    })
  }

  patchThreadChannelItem () {
    Patcher.after(ThreadChannelItem, 'type', (self, [{ thread, isSelectedChannel }], value) => {
      useUpdater()
      const messages = useStateFromStores([MessageStore], () => MessageStore.getMessages(thread.id))
      const shouldShow = useStateFromStores([ShownPreviewsStore], () => ShownPreviewsStore.shouldShow(thread.id))

      const linkWrapper = findInReactTree(value, m => m?.children?.props?.className?.includes('iconVisibility'))
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

      const page = findInReactTree(value, m => m?.className?.includes(Selectors.AppView.page))
      if (!page) return

      page.children = [
        page.children,
        React.createElement(ChannelPopoutBackdrop)
      ]
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
    DOM.addStyle(`${config.info.name}-style`, `
        .CP__popout {
            pointer-events: none;
            background-color: var(--bg-overlay-chat, var(--background-base-lower)) !important;
            border-radius: 10px;
            height: 30vh;
            min-height: 150px;
            width: 50vw;
            min-width: 350px;
            overflow: hidden;
            margin-top: calc(var(--custom-app-top-bar-height) + 8px);
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
            0% {
                opacity: 0
            }
            100% {
                opacity: 1
            }
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
    DOM.removeStyle(`${config.info.name}-style`)
  }

  stop () {
    this.clearCSS()
    Patcher.unpatchAll()
    this.clearKeyboardEvents()
    delete Embed.contextType

    forceAppUpdate()
  }

  getSettingsPanelId () {
    return `${config.info.name}-settings`
  }

  constructor () {
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

    this.showChangelogIfNeeded()
  }

  loadSettings (defaults = {}) {
    return Utils.extend({}, defaults, Data.load('settings'))
  }
  saveSettings (settings = this.settings) {
    return Data.save('settings', settings)
  }

  showChangelogIfNeeded () {
    const currentVersionInfo = Utils.extend(
      { version: config.info.version, hasShownChangelog: false },
      Data.load('currentVersionInfo')
    )
    if (currentVersionInfo.version === config.info.version && currentVersionInfo.hasShownChangelog) return

    this.showChangelog()
    Data.save('currentVersionInfo', { version: config.info.version, hasShownChangelog: true })
  }
  showChangelog () {
    return UI.showChangelogModal({
      title: config.info.name,
      subtitle: 'Version ' + config.info.version,
      changes: config.changelog
    })
  }

  getSettingsPanel () {
    const plugin = this

    function SettingsPanel () {
      const [_, forceUpdate] = React.useReducer(x => x + 1, 0)
      const onUpdate = React.useCallback(() => {
        plugin.saveSettings()
        settings = plugin.settings
        Dispatcher.dispatch({ type: 'CP__FORCE_UPDATE' })
        forceUpdate()
      }, [])

      return React.createElement('div', {
        id: plugin.getSettingsPanelId(),
        children: [
          React.createElement(FormDivider, {
            className: `${Selectors.Margins.marginBottom20}`
          }),
          React.createElement(FormTitle, {
            tag: FormTitleTags.H1,
            className: Selectors.Margins.marginBottom20,
            children: 'Trigger'
          }),
          React.createElement(FormSection, {
            children: [
              React.createElement(RadioGroup, {
                className: Selectors.Margins.marginBottom20,
                options: [
                  { name: 'Hover', value: 'hover' },
                  { name: 'Shift + Hover', value: 'shift-hover' },
                  { name: 'Mouse Wheel Click', value: 'mwheel' }
                ],
                value: plugin.settings.trigger.displayOn,
                onChange: ({ value }) => {
                  plugin.settings.trigger.displayOn = value
                  onUpdate()
                }
              }),
              ['hover', 'shift-hover'].includes(plugin.settings.trigger.displayOn)
              && React.createElement(FormSection, {
                children: [
                  React.createElement(FormTitle, {
                    className: Selectors.Margins.marginBottom4,
                    children: 'Hover Delay'
                  }),
                  React.createElement(FormText, {
                    className: Selectors.Margins.marginBottom20,
                    type: FormText.Types.DESCRIPTION,
                    children: 'The amount of time to hover before triggering the preview.'
                  }),
                  React.createElement(Slider, {
                    initialValue: plugin.settings.trigger.hoverDelay,
                    onValueChange: value => {
                      plugin.settings.trigger.hoverDelay = value
                      onUpdate()
                    },
                    defaultValue: plugin.defaultSettings.trigger.hoverDelay,
                    minValue: .1,
                    maxValue: 2,
                    markers: [...Array(20).keys()].map(n => (n + 1) / 10),
                    stickToMarkers: true,
                    onMarkerRender: m => m % .5 === 0 || m === .1 || m === plugin.defaultSettings.trigger.hoverDelay
                      ? m.toFixed(1) + 's' : ''
                  })
                ]
              })
            ]
          }),
          React.createElement(FormDivider, {
            className: `${Selectors.Margins.marginBottom40} ${Selectors.Margins.marginTop40}`
          }),
          React.createElement(FormTitle, {
            tag: FormTitleTags.H1,
            className: Selectors.Margins.marginBottom20,
            children: 'Behavior'
          }),
          React.createElement(FormItem, {
            className: Selectors.Margins.marginBottom20,
            children: [
              React.createElement(FormTitle, {
                className: Selectors.Margins.marginBottom4,
                children: 'Message Count Limit'
              }),
              React.createElement(FormText, {
                className: Selectors.Margins.marginBottom20,
                type: FormText.Types.DESCRIPTION,
                children: 'Sets the maximum amount of messages to fetch and display in the preview.'
              }),
              React.createElement(Slider, {
                initialValue: plugin.settings.appearance.messagesCount,
                onValueChange: value => {
                  plugin.settings.appearance.messagesCount = value
                  onUpdate()
                },
                defaultValue: plugin.defaultSettings.appearance.messagesCount,
                minValue: 10,
                maxValue: 100,
                markers: [...Array(10).keys()].map(n => (n + 1) * 10),
                stickToMarkers: true
              }),
              plugin.settings.appearance.messagesCount > 40 && React.createElement(FormText, {
                className: Selectors.Margins.marginTop8,
                type: FormText.Types.ERROR,
                children: [
                  React.createElement('b', { children: 'WARNING' }),
                  ': Rendering a lot of messages at once can cause performance issues and freezing.'
                ]
              }),
              React.createElement(FormDivider, {
                className: Selectors.Margins.marginTop20
              }),
            ]
          }),
          React.createElement(FormSwitch, {
            className: Selectors.Margins.marginBottom20,
            value: plugin.settings.appearance.typingUsers,
            onChange: value => {
              plugin.settings.appearance.typingUsers = value
              onUpdate()
            },
            children: 'Show typing users',
            note: 'Shows who\'s typing in the previewed channel.'
          }),
          React.createElement(FormItem, {
            className: Selectors.Margins.marginBottom20,
            children: [
              React.createElement(FormTitle, {
                className: Selectors.Margins.marginBottom8,
                children: 'Scrolling'
              }),
              React.createElement(RadioGroup, {
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
                value: plugin.settings.behaviour.scroll,
                onChange: ({ value }) => {
                  plugin.settings.behaviour.scroll = value
                  onUpdate()
                }
              }),
              React.createElement(FormDivider, {
                className: Selectors.Margins.marginTop20
              }),
            ]
          }),
          React.createElement(FormItem, {
            className: Selectors.Margins.marginBottom20,
            children: [
              React.createElement(FormTitle, {
                className: Selectors.Margins.marginBottom8,
                children: 'NSFW'
              }),
              React.createElement(RadioGroup, {
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
                value: plugin.settings.behaviour.nsfw,
                onChange: ({ value }) => {
                  plugin.settings.behaviour.nsfw = value
                  onUpdate()
                }
              })
            ]
          }),
          React.createElement(FormDivider, {
            className: `${Selectors.Margins.marginBottom40} ${Selectors.Margins.marginTop40}`
          }),
          React.createElement(FormTitle, {
            tag: FormTitleTags.H1,
            className: Selectors.Margins.marginBottom20,
            children: 'Appearance'
          }),
          React.createElement(FormItem, {
            className: Selectors.Margins.marginBottom20,
            children: [
              React.createElement(FormTitle, {
                className: Selectors.Margins.marginBottom4,
                children: 'Preview Height'
              }),
              React.createElement(FormText, {
                className: Selectors.Margins.marginBottom20,
                type: FormText.Types.DESCRIPTION,
                children: 'Sets the height of the preview window relative to the Discord window.'
              }),
              React.createElement(Slider, {
                initialValue: plugin.settings.appearance.popoutHeight,
                onValueChange: value => {
                  plugin.settings.appearance.popoutHeight = value
                  onUpdate()
                },
                defaultValue: plugin.defaultSettings.appearance.popoutHeight,
                minValue: 10,
                maxValue: 90,
                markers: [...Array(18).keys()].map(n => (n + 1) * 5).slice(1),
                stickToMarkers: true,
                onMarkerRender: m => m % 10 === 0 ? m + '%' : ''
              }),
              React.createElement(FormDivider, {
                className: Selectors.Margins.marginTop20
              }),
            ]
          }),
          React.createElement(FormItem, {
            className: Selectors.Margins.marginBottom20,
            children: [
              React.createElement(FormTitle, {
                className: Selectors.Margins.marginBottom8,
                children: 'Backdrop'
              }),
              React.createElement(FormText, {
                className: Selectors.Margins.marginBottom20,
                type: FormText.Types.DESCRIPTION,
                children: 'Darken the chat behind the preview for better contrast.'
              }),
              React.createElement(FormSwitch, {
                children: 'Enable backdrop',
                value: plugin.settings.appearance.darkenChat,
                onChange: value => {
                  plugin.settings.appearance.darkenChat = value
                  onUpdate()
                },
                hideBorder: true
              }),
              plugin.settings.appearance.darkenChat && React.createElement(FormItem, {
                children: [
                  React.createElement(FormTitle, {
                    className: Selectors.Margins.marginBottom20,
                    children: 'Dimming Level'
                  }),
                  React.createElement(Slider, {
                    initialValue: plugin.settings.appearance.darkenLevel,
                    onValueChange: value => {
                      plugin.settings.appearance.darkenLevel = value
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
              React.createElement(FormDivider, {
                className: Selectors.Margins.marginTop20
              })
            ]
          }),
          React.createElement(FormItem, {
            className: Selectors.Margins.marginBottom20,
            children: [
              React.createElement(FormTitle, {
                className: Selectors.Margins.marginBottom8,
                children: 'Message Display'
              }),
              React.createElement(RadioGroup, {
                options: [
                  { name: 'Cozy', value: 'cozy' },
                  { name: 'Compact', value: 'compact' }
                ],
                value: plugin.settings.appearance.displayMode,
                onChange: ({ value }) => {
                  plugin.settings.appearance.displayMode = value
                  onUpdate()
                }
              }),
              React.createElement(FormDivider, {
                className: Selectors.Margins.marginTop20
              })
            ]
          }),
          React.createElement(FormItem, {
            className: Selectors.Margins.marginBottom20,
            children: [
              React.createElement(FormTitle, {
                className: Selectors.Margins.marginBottom20,
                children: 'Space between Message Groups'
              }),
              React.createElement(FormSwitch, {
                children: 'Sync with app settings',
                value: plugin.settings.appearance.groupSpacingSync,
                onChange: value => {
                  plugin.settings.appearance.groupSpacingSync = value
                  onUpdate()
                },
                hideBorder: true
              }),
              !plugin.settings.appearance.groupSpacingSync && React.createElement(Slider, {
                initialValue: plugin.settings.appearance.groupSpacing,
                onValueChange: value => {
                  plugin.settings.appearance.groupSpacing = value
                  onUpdate()
                },
                defaultValue: plugin.defaultSettings.appearance.groupSpacing,
                minValue: 0,
                maxValue: 24,
                markers: [0, 4, 8, 16, 24],
                stickToMarkers: true,
                onMarkerRender: m => m + 'px'
              }),
              React.createElement(FormDivider, {
                className: Selectors.Margins.marginTop20
              })
            ]
          })
        ]
      })
    }

    return React.createElement(SettingsPanel)
  }
}
