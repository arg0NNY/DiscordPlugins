/**
 * @name BetterAnimations
 * @author arg0NNY
 * @authorLink https://github.com/arg0NNY/DiscordPlugins
 * @invite M8DBtcZjXD
 * @donate https://donationalerts.com/r/arg0nny
 * @version 1.2.5
 * @description Improves your whole Discord experience. Adds highly customizable switching animations between guilds, channels, etc. Introduces smooth new message reveal animations, along with popout animations, and more.
 * @website https://github.com/arg0NNY/DiscordPlugins/tree/master/BetterAnimations
 * @source https://github.com/arg0NNY/DiscordPlugins/blob/master/BetterAnimations/BetterAnimations.plugin.js
 * @updateUrl https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/BetterAnimations/BetterAnimations.plugin.js
 */

/* ### CONFIG START ### */
const config = {
  info: {
    name: 'BetterAnimations',
    version: '1.2.5',
    description: 'Improves your whole Discord experience. Adds highly customizable switching animations between guilds, channels, etc. Introduces smooth new message reveal animations, along with popout animations, and more.'
  },
  changelog: [
    {
      type: 'progress',
      title: 'Big changes are here',
      items: [
        '**BetterAnimations V2 enters Beta!** See Settings to learn more.'
      ]
    }
  ]
}
/* ### CONFIG END ### */

const {
  DOM,
  Webpack,
  UI,
  React,
  Patcher,
  Logger,
  Utils,
  Data
} = new BdApi(config.info.name)
const { Filters } = Webpack

const handleClick = Webpack.getModule(Filters.byStrings('sanitizeUrl', 'shouldConfirm'), { searchExports: true })
const Button = Webpack.getModule(Filters.byKeys('Link', 'Sizes'), { searchExports: true })
const Text = Webpack.getModule(m => Filters.byStrings('WebkitLineClamp', 'data-text-variant')(m?.render), { searchExports: true })

const Dispatcher = Webpack.getByKeys('_subscriptions', '_waitQueue')
const SelectedGuildStore = Webpack.getStore('SelectedGuildStore')
const ChannelActions = Webpack.getByKeys('selectChannel')
const UserSettingsWindow = Webpack.getByKeys('open', 'updateAccount')
const GuildSettingsWindow = Webpack.getByKeys('open', 'updateGuild')
const ChannelSettingsWindow = Webpack.getByKeys('open', 'updateChannel')
const UserStore = Webpack.getStore('UserStore')

const MessageStates = {
  SENDING: 'SENDING',
}

const ActionTypes = {
  MESSAGE_CREATE: 'MESSAGE_CREATE',
  CHANNEL_SELECT: 'CHANNEL_SELECT',
}

const Slider = Webpack.getModule(m => Filters.byKeys('stickToMarkers', 'initialValue')(m?.defaultProps), { searchExports: true })
const ReferencePositionLayer = Webpack.getModule(Filters.byPrototypeKeys('nudgeTopAlignment', 'getVerticalAlignmentStyle'), { searchExports: true })
const ChannelIntegrationsSettingsWindow = Webpack.getByKeys('setSection', 'saveWebhook')
// const {PreloadedUserSettingsActionCreators} = Webpack.getByKeys('PreloadedUserSettingsActionCreators');
const RouteWithImpression = Webpack.getModule(m => Filters.byStrings('location', 'computedMatch', 'render')(m?.prototype?.render), { searchExports: true })
const UserPopout = [...Webpack.getWithKey(Filters.byStrings('UserProfilePopoutWrapper: user cannot be undefined'))]

function buildSelectors (selectors) {
  const result = {}
  Object.entries(selectors).forEach(([key, selector]) => {
    let getter, defaultValue
    if (Array.isArray(selector)) [getter, defaultValue] = selector
    else getter = selector

    let memoized = null
    Object.defineProperty(result, key, {
      get: () => {
        if (memoized === null) {
          memoized = getter()
          if (!memoized || !Object.keys(memoized).length) setTimeout(() => memoized = null, 5000)
        }
        return Object.assign(defaultValue ?? {}, memoized)
      }
    })
  })
  return result
}

const Selectors = buildSelectors({
  Chat: () => Webpack.getByKeys('chat', 'chatContent'),
  Layout: () => Webpack.getByKeys('base', 'content'),
  Layers: () => Webpack.getByKeys('layer', 'baseLayer'),
  ChannelsList: () => Webpack.getByKeys('scroller', 'unreadTop'),
  PeopleTab: () => Webpack.getByKeys('container', 'peopleColumn'),
  ApplicationStore: () => Webpack.getByKeys('applicationStore', 'marketingHeader'),
  PeopleList: () => Webpack.getByKeys('peopleList', 'searchBar'),
  FriendsActivity: () => Webpack.getByKeys('scroller', 'header', 'container'),
  PageContainer: () => Webpack.getByKeys('scroller', 'settingsContainer'),
  Pages: () => Webpack.getByKeys('pageWrapper', 'searchPage'),
  Content: () => {
    const module = Webpack.getByKeys('content', 'fade', 'disableScrollAnchor')
    if (!module) return

    const scrollerBase = Object.values(module).find(s => s?.includes?.('scrollerBase'))
      ?.split(' ').find(s => s?.includes?.('scrollerBase'))

    return { scrollerBase, ...module }
  },
  Sidebar: [
    () => Webpack.getByKeys('contentRegion', 'sidebar'),
    {
      contentRegion: 'contentRegion_c25c6d',
      contentRegionScroller: 'contentRegionScroller_c25c6d',
      standardSidebarView: 'standardSidebarView_c25c6d'
    }
  ],
  Settings: [
    () => ({
      ...Webpack.getByKeys('contentContainer', 'optionContainer'),
      ...Webpack.getByKeys('messageContainer', 'scroller')
    }),
    { scroller: 'scroller_ddb5b4', contentContainer: 'contentContainer__50662' }
  ],
  SettingsSidebar: [
    () => Webpack.getByKeys('standardSidebarView', 'sidebar'),
    { sidebar: 'sidebar_c25c6d' }
  ],
  Animations: () => Webpack.getByKeys('translate', 'fade'),
  Members: () => Webpack.getByKeys('members', 'hiddenMembers'),
  EmojiPicker: () => Webpack.getByKeys('emojiPickerHasTabWrapper', 'emojiPicker'),
  StickerPicker: () => Webpack.getAllByKeys('listWrapper', 'loadingIndicator')?.filter(m => !m?.gridNoticeWrapper)[0],
  GifPicker: () => Webpack.getByKeys('searchBar', 'backButton'),
  Popout: () => Webpack.getByKeys('disabledPointerEvents', 'layer'),
  ThreadSidebar: () => Webpack.getByKeys('container', 'resizeHandle'),
  Stickers: [
    () => Webpack.getByKeys('grid', 'placeholderCard'),
    { grid: 'grid_f8c5e7' }
  ],
  Sticker: [
    () => Webpack.getByKeys('stickerName', 'sticker'),
    {
      sticker: 'sticker_d864ab',
      wrapper: 'wrapper_d864ab',
      content: 'content_d864ab',
      stickerName: 'stickerName_d864ab'
    }
  ],
  Sizes: () => Webpack.getByKeys('size10', 'size12'),
  Colors: () => Webpack.getByKeys('colorHeaderPrimary', 'colorWhite'),
  VideoOptions: [
    () => Webpack.getByKeys('backgroundOptionRing'),
    { backgroundOptionRing: 'backgroundOptionRing_ad7d79' }
  ],
  StudentHubs: () => Webpack.getByKeys('footerDescription', 'scroller'),
  MessageRequests: () => Webpack.getByKeys('messageRequestCoachmark', 'container'),
  Shop: () => Webpack.getByKeys('shop', 'shopScroll'),
  MemberList: () => Webpack.getByKeys('members', 'membersWrap')
})

const PARENT_NODE_CLASSNAME = 'BetterAnimations-parentNode'
const CLONED_NODE_CLASSNAME = 'BetterAnimations-clonedNode'
const SETTINGS_CLASSNAME = 'BetterAnimations-settings'

class History {
  constructor (current = null) {
    this.current = current
    this.previous = null
  }

  push (current) {
    this.previous = this.current
    this.current = current
  }
}

const GuildIdHistory = new History(SelectedGuildStore.getGuildId() ?? '@me')
const RoutePathHistory = new History()
const RouteLocationHistory = new History()
const GuildSettingsRoleIdHistory = new History()
const SettingsSectionHistory = new History()
const ChannelIntegrationsSectionHistory = new History()
const ExpressionPickerViewHistory = new History()
const ThreadsPopoutSectionHistory = new History()
const GuildDiscoveryCategoryHistory = new History()

class Route {
  constructor (name, path, { element, scrollers, getter, forceGuildChange, noGuilds }) {
    this.name = name
    this.path = typeof path === 'object' ? path : [path]
    this._element = element
    this._scrollers = scrollers
    this._getter = getter
    this.forceGuildChange = !!forceGuildChange
    this.noGuilds = !!noGuilds
  }

  get _guildSwitched () {
    return !this.noGuilds && (this.forceGuildChange || GuildIdHistory.previous !== GuildIdHistory.current)
  }

  get element () {
    return !this._guildSwitched ? (this._getter ? this._getter().element : this._element) : `.${Selectors.Layout.base}`
  }

  get scrollers () {
    return [...(this._getter ? this._getter().scrollers : this._scrollers), ...(this._guildSwitched ? [Selectors.ChannelsList.scroller] : [])]
  }
}

const Routes = [
  new Route('Chat', [
    '/channels/:guildId(@me|@favorites|@guilds-empty-nux|\\d+)/:channelId(role-subscriptions|shop|member-applications|@home|channel-browser|onboarding|customize-community|member-safety|boosts|report-to-mod|\\d+)/threads/:threadId/:messageId?',
    '/channels/@me/:channelId(role-subscriptions|shop|member-applications|@home|channel-browser|onboarding|customize-community|member-safety|boosts|report-to-mod|\\d+)',
    '/channels/:guildId(@me|@favorites|@guilds-empty-nux|\\d+)/:channelId(role-subscriptions|shop|member-applications|@home|channel-browser|onboarding|customize-community|member-safety|boosts|report-to-mod|\\d+)?/:messageId?'
  ], {
    element: `.${Selectors.Chat.chat}:not(.${Selectors.MessageRequests.container})`,
    scrollers: [Selectors.MemberList.members, Selectors.Content.scrollerBase]
  }),
  new Route('Friends', '/channels/@me', {
    element: `.${Selectors.PeopleTab.container}`,
    scrollers: [Selectors.PeopleList.peopleList, Selectors.FriendsActivity.scroller]
  }),
  new Route('Store', '/store', {
    element: `.${Selectors.ApplicationStore.applicationStore}`,
    scrollers: [Selectors.PageContainer.scroller]
  }),
  new Route('GuildDiscovery', '/guild-discovery', {
    element: `.${Selectors.Layout.base}`,
    scrollers: [Selectors.Pages.scroller, Selectors.Content.scrollerBase],
    forceGuildChange: true
  }),
  new Route('MessageRequests', '/message-requests', {
    element: `.${Selectors.MessageRequests.container}`,
    scrollers: [Selectors.Content.scrollerBase]
  }),
  new Route('Shop', '/shop', {
    element: `.${Selectors.Shop.shop}`,
    scrollers: [Selectors.Content.scrollerBase]
  })
]

const Easing = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  easeInSine: 'cubic-bezier(0.12, 0, 0.39, 0)',
  easeOutSine: 'cubic-bezier(0.61, 1, 0.88, 1)',
  easeInOutSine: 'cubic-bezier(0.37, 0, 0.63, 1)',
  easeInQuad: 'cubic-bezier(0.11, 0, 0.5, 0)',
  easeOutQuad: 'cubic-bezier(0.5, 1, 0.89, 1)',
  easeInOutQuad: 'cubic-bezier(0.45, 0, 0.55, 1)',
  easeInCubic: 'cubic-bezier(0.32, 0, 0.67, 0)',
  easeOutCubic: 'cubic-bezier(0.33, 1, 0.68, 1)',
  easeInOutCubic: 'cubic-bezier(0.65, 0, 0.35, 1)',
  easeInQuart: 'cubic-bezier(0.5, 0, 0.75, 0)',
  easeOutQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',
  easeInOutQuart: 'cubic-bezier(0.76, 0, 0.24, 1)',
  easeInQuint: 'cubic-bezier(0.64, 0, 0.78, 0)',
  easeOutQuint: 'cubic-bezier(0.22, 1, 0.36, 1)',
  easeInOutQuint: 'cubic-bezier(0.83, 0, 0.17, 1)',
  easeInExpo: 'cubic-bezier(0.7, 0, 0.84, 0)',
  easeOutExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
  easeInOutExpo: 'cubic-bezier(0.87, 0, 0.13, 1)',
  easeInCirc: 'cubic-bezier(0.55, 0, 1, 0.45)',
  easeOutCirc: 'cubic-bezier(0, 0.55, 0.45, 1)',
  easeInOutCirc: 'cubic-bezier(0.85, 0, 0.15, 1)',
  easeInBack: 'cubic-bezier(0.36, 0, 0.66, -0.56)',
  easeOutBack: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  easeInOutBack: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)'
}

let channelChanged = false
let mainAnimator = null

class ContainerAnimator {
  static TYPES = {
    fade: (node, clonedNode, { duration, easing }) => {
      return new Promise(res => {

        clonedNode.animate(
          {
            opacity: [1, 0],
          },
          {
            duration,
            easing
          }
        ).finished.then(() => {res()})

      })
    },

    slipUp: (node, clonedNode, {
      duration,
      easing,
      offset
    }) => ContainerAnimator.TYPES.slipVertical(node, clonedNode, { duration, easing, offset, upwards: true }),
    slipDown: (node, clonedNode, {
      duration,
      easing,
      offset
    }) => ContainerAnimator.TYPES.slipVertical(node, clonedNode, { duration, easing, offset, upwards: false }),
    slipVertical: (node, clonedNode, { duration, easing, offset, upwards }) => {
      return new Promise(res => {

        node.animate(
          { transform: [`translateY(${!upwards ? '-' : ''}${offset ?? 50}px)`, `translateY(0)`], opacity: [0, 1] },
          { duration, easing }
        )

        clonedNode.animate(
          [
            { transform: 'translateY(0)', opacity: 1 },
            { transform: `translateY(${upwards ? '-' : ''}${offset ?? 50}px)`, opacity: 0 },
          ],
          { duration, easing }
        ).finished.then(() => {res()})

      })
    },

    slipLeft: (node, clonedNode, {
      duration,
      easing,
      offset
    }) => ContainerAnimator.TYPES.slipHorizontal(node, clonedNode, { duration, easing, offset, upwards: true }),
    slipRight: (node, clonedNode, {
      duration,
      easing,
      offset
    }) => ContainerAnimator.TYPES.slipHorizontal(node, clonedNode, { duration, easing, offset, upwards: false }),
    slipHorizontal: (node, clonedNode, { duration, easing, offset, upwards }) => {
      return new Promise(res => {

        node.animate(
          { transform: [`translateX(${!upwards ? '-' : ''}${offset ?? 50}px)`, 'translateX(0)'], opacity: [0, 1] },
          { duration, easing }
        )

        clonedNode.animate(
          [
            { transform: 'translateX(0)', opacity: 1 },
            { transform: `translateX(${upwards ? '-' : ''}${offset ?? 50}px)`, opacity: 0 },
          ],
          { duration, easing }
        ).finished.then(() => {res()})

      })
    },

    scaleForwards: (node, clonedNode, {
      duration,
      easing,
      scale,
      zIndex
    }) => ContainerAnimator.TYPES.scale(node, clonedNode, { duration, easing, scale, zIndex, forwards: true }),
    scaleBackwards: (node, clonedNode, {
      duration,
      easing,
      scale,
      zIndex
    }) => ContainerAnimator.TYPES.scale(node, clonedNode, { duration, easing, scale, zIndex, forwards: false }),
    scale: (node, clonedNode, { duration, easing, scale, forwards, zIndex }) => {
      return new Promise(res => {

        scale = scale ?? .05

        if (forwards) node.style.zIndex = zIndex + 1
        node.animate(
          [
            { transform: `scale(${forwards ? 1 + scale : 1 - scale})`, opacity: forwards ? 0 : 1 },
            { transform: 'scale(1)', opacity: 1 },
          ],
          { duration, easing }
        ).finished.then(() => {node.style.zIndex = ''})

        clonedNode.animate(
          [
            { transform: 'scale(1)', opacity: 1 },
            { transform: `scale(${!forwards ? 1 + scale : 1 - scale})`, opacity: forwards ? 1 : 0 },
          ],
          { duration, easing }
        ).finished.then(() => {res()})

      })
    },

    scaleUp: (node, clonedNode, {
      duration,
      easing,
      scale,
      zIndex
    }) => ContainerAnimator.TYPES.scaleVertical(node, clonedNode, { duration, easing, scale, zIndex, upwards: true }),
    scaleDown: (node, clonedNode, {
      duration,
      easing,
      scale,
      zIndex
    }) => ContainerAnimator.TYPES.scaleVertical(node, clonedNode, { duration, easing, scale, zIndex, upwards: false }),
    scaleVertical: (node, clonedNode, { duration, easing, scale, upwards, zIndex }) => {
      return new Promise(res => {

        scale = scale ?? .05

        node.style.zIndex = zIndex + 1
        node.animate(
          [
            { transform: `translateY(${upwards ? '' : '-'}100%)`, opacity: 0 },
            { transform: `translateY(0)`, opacity: 1 },
          ],
          { duration, easing }
        ).finished.then(() => {node.style.zIndex = ''})

        clonedNode.animate(
          [
            { transform: 'scale(1)', opacity: 1 },
            { transform: `scale(${1 - scale})`, opacity: 0 },
          ],
          { duration, easing }
        ).finished.then(() => {res()})

      })
    },

    scaleLeft: (node, clonedNode, {
      duration,
      easing,
      scale,
      zIndex
    }) => ContainerAnimator.TYPES.scaleHorizontal(node, clonedNode, { duration, easing, scale, zIndex, upwards: true }),
    scaleRight: (node, clonedNode, {
      duration,
      easing,
      scale,
      zIndex
    }) => ContainerAnimator.TYPES.scaleHorizontal(node, clonedNode, {
      duration,
      easing,
      scale,
      zIndex,
      upwards: false
    }),
    scaleHorizontal: (node, clonedNode, { duration, easing, scale, upwards, zIndex }) => {
      return new Promise(res => {

        scale = scale ?? .05

        node.style.zIndex = zIndex + 1
        node.animate(
          [
            { transform: `translateX(${upwards ? '' : '-'}100%)`, opacity: 0 },
            { transform: `translateX(0)`, opacity: 1 },
          ],
          { duration, easing }
        ).finished.then(() => {node.style.zIndex = ''})

        clonedNode.animate(
          [
            { transform: 'scale(1)', opacity: 1 },
            { transform: `scale(${1 - scale})`, opacity: 0 },
          ],
          { duration, easing }
        ).finished.then(() => {res()})

      })
    },

    scaleChange: (node, clonedNode, { duration, easing, scale }) => {
      return new Promise(res => {

        scale = scale ?? .05

        node.animate(
          [
            { transform: `scale(${1 - scale})`, opacity: 0 },
            { transform: `scale(${1 - scale})`, opacity: 0 },
            { transform: 'scale(1)', opacity: 1 },
          ],
          { duration, easing }
        )

        clonedNode.animate(
          [
            { transform: 'scale(1)', opacity: 1 },
            { transform: `scale(${1 - scale})`, opacity: 0 },
            { transform: `scale(${1 - scale})`, opacity: 0 },
          ],
          { duration, easing }
        ).finished.then(() => {res()})

      })
    },

    slideUp: (node, clonedNode, {
      duration,
      easing
    }) => ContainerAnimator.TYPES.slideVertical(node, clonedNode, { duration, easing, upwards: true }),
    slideDown: (node, clonedNode, {
      duration,
      easing
    }) => ContainerAnimator.TYPES.slideVertical(node, clonedNode, { duration, easing, upwards: false }),
    slideVertical: (node, clonedNode, { duration, easing, upwards }) => {
      return new Promise(res => {

        node.animate(
          { transform: [`translateY(${!upwards ? '-' : ''}100%)`, 'translateY(0)'], opacity: [0, 1] },
          { duration, easing }
        )

        clonedNode.animate(
          [
            { transform: 'translateY(0)', opacity: 1 },
            { transform: `translateY(${upwards ? '-' : ''}100%)`, opacity: 0 },
          ],
          { duration, easing }
        ).finished.then(() => {res()})

      })
    },

    slideLeft: (node, clonedNode, {
      duration,
      easing
    }) => ContainerAnimator.TYPES.slideHorizontal(node, clonedNode, { duration, easing, upwards: true }),
    slideRight: (node, clonedNode, {
      duration,
      easing
    }) => ContainerAnimator.TYPES.slideHorizontal(node, clonedNode, { duration, easing, upwards: false }),
    slideHorizontal: (node, clonedNode, { duration, easing, upwards }) => {
      return new Promise(res => {

        node.animate(
          { transform: [`translateX(${!upwards ? '-' : ''}100%)`, 'translateX(0)'], opacity: [0, 1] },
          { duration, easing }
        )

        clonedNode.animate(
          [
            { transform: 'translateX(0)', opacity: 1 },
            { transform: `translateX(${upwards ? '-' : ''}100%)`, opacity: 0 },
          ],
          { duration, easing }
        ).finished.then(() => {res()})

      })
    },

    flipRight: (node, clonedNode, {
      duration,
      easing
    }) => ContainerAnimator.TYPES.flipVertical(node, clonedNode, { duration, easing, forwards: true }),
    flipLeft: (node, clonedNode, {
      duration,
      easing
    }) => ContainerAnimator.TYPES.flipVertical(node, clonedNode, { duration, easing, forwards: false }),
    flipVertical: (node, clonedNode, { duration, easing, forwards }) => {
      return new Promise(res => {
        const rect = {
          top: node.offsetTop,
          left: node.offsetLeft,
          width: node.clientWidth,
          height: node.clientHeight
        }

        node.parentNode.style.perspective = '1750px'
        node.parentNode.style.perspectiveOrigin = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`
        node.animate(
          { transform: [`rotateY(${forwards ? '-' : ''}90deg)`, `rotateY(${forwards ? '-' : ''}90deg)`, `rotateY(0)`] },
          { duration, easing }
        )

        clonedNode.animate(
          { transform: [`rotateY(0)`, `rotateY(${!forwards ? '-' : ''}90deg)`, `rotateY(${!forwards ? '-' : ''}90deg)`] },
          { duration, easing }
        ).finished.then(() => {res()})

      })
    },

    flipForwards: (node, clonedNode, {
      duration,
      easing
    }) => ContainerAnimator.TYPES.flipHorizontal(node, clonedNode, { duration, easing, forwards: true }),
    flipBackwards: (node, clonedNode, {
      duration,
      easing
    }) => ContainerAnimator.TYPES.flipHorizontal(node, clonedNode, { duration, easing, forwards: false }),
    flipHorizontal: (node, clonedNode, { duration, easing, forwards }) => {
      return new Promise(res => {
        const rect = {
          top: node.offsetTop,
          left: node.offsetLeft,
          width: node.clientWidth,
          height: node.clientHeight
        }

        node.parentNode.style.perspective = '1750px'
        node.parentNode.style.perspectiveOrigin = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`
        node.animate(
          { transform: [`rotateX(${forwards ? '-' : ''}90deg)`, `rotateX(${forwards ? '-' : ''}90deg)`, `rotateX(0)`] },
          { duration, easing }
        )

        clonedNode.animate(
          { transform: [`rotateX(0)`, `rotateX(${!forwards ? '-' : ''}90deg)`, `rotateX(${!forwards ? '-' : ''}90deg)`] },
          { duration, easing }
        ).finished.then(() => {res()})

      })
    },
  }

  constructor (type, element, scrollSelectors = [], { elementToAppear, zIndex } = {}) {
    if (!ContainerAnimator.TYPES.hasOwnProperty(type)) return Logger.err('Invalid animation type.')

    this.animation = ContainerAnimator.TYPES[type]
    this.node = typeof element === 'string' ? document.querySelector(element) : element
    this.parentNode = this.node?.parentNode
    this.scrollSelectors = scrollSelectors
    if (elementToAppear) this.elementToAppear = elementToAppear
    this.zIndex = zIndex ?? 10

    this.animated = false

    this.init()
  }

  init () {
    if (!this.node) return Logger.warn('Unable to find node to animate.')
    const rect = {
      top: this.node.offsetTop,
      left: this.node.offsetLeft,
      width: this.node.clientWidth,
      height: this.node.clientHeight
    }

    if (getComputedStyle(this.parentNode).position === 'static') this.parentNode.classList.add(PARENT_NODE_CLASSNAME)

    this.clonedNode = this.node.cloneNode(true)
    this.node.after(this.clonedNode)
    this.node.style.opacity = 0
    if (document.querySelector(this.elementToAppear) === null) {
      this.tempStyle = document.createElement('style')
      this.tempStyle.innerHTML = `${this.elementToAppear} { opacity: 0 !important; }`
      this.node.after(this.tempStyle)
    }

    this.clonedNode.querySelectorAll('video').forEach(v => v.volume = 0)
    this.clonedNode.style.position = getComputedStyle(this.node).position === 'fixed' ? 'fixed' : 'absolute'
    this.clonedNode.style.zIndex = this.zIndex
    this.clonedNode.style.pointerEvents = 'none'
    this.clonedNode.classList.add(CLONED_NODE_CLASSNAME);
    ['top', 'left', 'width', 'height'].forEach(p => this.clonedNode.style[p] = rect[p] + 'px')

    const query = this.scrollSelectors.map(s => '.' + s).join(', ')
    const scrollers = Array.from(this.node.querySelectorAll(query))
    if (scrollers.length) {
      const clonedScrollers = Array.from(this.clonedNode.querySelectorAll(query))
      clonedScrollers.forEach((e, i) => e.scrollTop = scrollers[i].scrollTop)
    }
    // this.scrollSelectors.forEach(s => this.node.querySelector(`.${s}`) ? Array.from(this.clonedNode.querySelectorAll(`.${s}`)).forEach((e, i) => e.scrollTop = this.node.querySelectorAll(`.${s}`)[i].scrollTop) : null);
  }

  animate (params = {}) {
    if (this.animated || !this.clonedNode) return false
    this.animated = true

    const getNode = e => typeof e === 'string' ? document.querySelector(e) : e

    const exec = () => {
      this.node.removeAttribute('style')
      this.tempStyle?.remove()
      params.duration = params.duration ?? 500
      params.easing = params.easing ?? Easing.easeInOut
      params.zIndex = this.zIndex

      this.animation(this.elementToAppear ?? this.node, this.clonedNode, params).then(() => {
        this.end()
      })
    }

    if (this.elementToAppear)
      setTimeout(() => {
        this.elementToAppear = getNode(this.elementToAppear)
        exec()
      }, 1)
    else exec()

    return true
  }

  forceEnd () {
    clearTimeout(this.animateTimeout)
    this.end()
  }

  end () {
    this.tempStyle?.remove()
    this.parentNode.classList.remove(PARENT_NODE_CLASSNAME)

    if (!this.clonedNode) return
    this.clonedNode.remove()
    this.clonedNode = null
  }
}

class RevealAnimator {
  static TYPES = {
    fade: (node, { duration, easing, reverse }) => {
      return new Promise(res => {

        node.animate(
          {
            opacity: [0, 1],
          },
          {
            duration,
            easing,
            direction: reverse ? 'reverse' : 'normal'
          }
        ).finished.then(() => {res()})

      })
    },

    slip: (node, { duration, easing, reverse, offset, position }) => {
      return new Promise(res => {

        node.animate(
          [
            {
              opacity: 0,
              transform: `translate${['top', 'bottom'].includes(position) ? 'Y' : 'X'}(${['right', 'bottom'].includes(position) ? '' : '-'}${offset ?? 10}px)`
            },
            { opacity: 1, transform: `translate${['top', 'bottom'].includes(position) ? 'Y' : 'X'}(0)` },
          ],
          { duration, easing, direction: reverse ? 'reverse' : 'normal' }
        ).finished.then(() => {res()})

      })
    },

    scaleForwards: (node, { duration, easing, reverse, scale }) => {
      return new Promise(res => {

        scale = scale ?? .1

        node.animate(
          [
            { opacity: 0, transform: `scale(${1 + scale})` },
            { opacity: 1, transform: `` },
          ],
          { duration, easing, direction: reverse ? 'reverse' : 'normal' }
        ).finished.then(() => {res()})

      })
    },
    scaleBackwards: (node, { duration, easing, reverse, scale }) => {
      return new Promise(res => {

        scale = scale ?? .1

        node.animate(
          [
            { opacity: 0, transform: `scale(${1 - scale})` },
            { opacity: 1, transform: `` },
          ],
          { duration, easing, direction: reverse ? 'reverse' : 'normal' }
        ).finished.then(() => {res()})

      })
    },

    scaleForwardsSide: (node, { duration, easing, reverse, scale, position }) => {
      return new Promise(res => {

        scale = scale ?? .1

        const opposite = {
          top: 'bottom',
          bottom: 'top',
          left: 'right',
          right: 'left',
        }

        node.style.transformOrigin = `${opposite[position]} center`
        node.animate(
          [
            { opacity: 0, transform: `scale(${1 + scale})` },
            { opacity: 1, transform: `` },
          ],
          { duration, easing, direction: reverse ? 'reverse' : 'normal' }
        ).finished.then(() => {res()})

      })
    },
    scaleBackwardsSide: (node, { duration, easing, reverse, scale, position }) => {
      return new Promise(res => {

        scale = scale ?? .1

        const opposite = {
          top: 'bottom',
          bottom: 'top',
          left: 'right',
          right: 'left',
        }

        node.style.transformOrigin = `${opposite[position]} center`
        node.animate(
          [
            { opacity: 0, transform: `scale(${1 - scale})` },
            { opacity: 1, transform: `` },
          ],
          { duration, easing, direction: reverse ? 'reverse' : 'normal' }
        ).finished.then(() => {res()})

      })
    },

    rotateForwardsLeft: (node, { duration, easing, reverse, scale }) => RevealAnimator.TYPES.rotate(node, {
      duration,
      easing,
      reverse,
      scale,
      left: true,
      forwards: true
    }),
    rotateForwardsRight: (node, { duration, easing, reverse, scale }) => RevealAnimator.TYPES.rotate(node, {
      duration,
      easing,
      reverse,
      scale,
      left: false,
      forwards: true
    }),
    rotateBackwardsLeft: (node, { duration, easing, reverse, scale }) => RevealAnimator.TYPES.rotate(node, {
      duration,
      easing,
      reverse,
      scale,
      left: true,
      forwards: false
    }),
    rotateBackwardsRight: (node, { duration, easing, reverse, scale }) => RevealAnimator.TYPES.rotate(node, {
      duration,
      easing,
      reverse,
      scale,
      left: false,
      forwards: false
    }),
    rotate: (node, { duration, easing, reverse, scale, left, forwards }) => {
      return new Promise(res => {

        scale = scale ?? .1
        node.animate(
          [
            { opacity: 0, transform: `scale(${forwards ? 1 + scale : 1 - scale}) rotate(${left ? '' : '-'}10deg)` },
            { opacity: 1, transform: `` },
          ],
          { duration, easing, direction: reverse ? 'reverse' : 'normal' }
        ).finished.then(() => {res()})

      })
    },

    flip: (node, { duration, easing, reverse, position }) => {
      return new Promise(res => {
        const opposite = {
          top: 'bottom',
          bottom: 'top',
          left: 'right',
          right: 'left',
        }

        node.style.transformOrigin = `${opposite[position]} center`
        node.animate(
          [
            {
              opacity: 0,
              transform: `rotate${['top', 'bottom'].includes(position) ? 'X' : 'Y'}(${['right', 'bottom'].includes(position) ? '' : '-'}90deg)`
            },
            { opacity: 1, transform: `rotate${['top', 'bottom'].includes(position) ? 'X' : 'Y'}(0)` },
          ],
          { duration, easing, direction: reverse ? 'reverse' : 'normal' }
        ).finished.then(() => {
          node.style.transformOrigin = ''
          res()
        })

      })
    },

    slipScale: (node, { duration, easing, reverse, offset, position, scale }) => {
      return new Promise(res => {

        scale = scale ?? .1

        node.animate(
          [
            {
              opacity: 0,
              transform: `translate${['top', 'bottom'].includes(position) ? 'Y' : 'X'}(${['right', 'bottom'].includes(position) ? '-' : ''}${offset ?? 10}px) scale(${1 - scale})`
            },
            { opacity: 1, transform: `translate${['top', 'bottom'].includes(position) ? 'Y' : 'X'}(0) scale(1)` },
          ],
          { duration, easing, direction: reverse ? 'reverse' : 'normal' }
        ).finished.then(() => {res()})

      })
    },
  }

  static getDiscordAnimationsSelector () {
    let selector = ''

    Object.keys(Selectors.Animations).forEach(k => {
      selector += `.${Selectors.Animations[k]}, `
    })

    return selector.slice(0, -2)
  }

  constructor (type, element, { needsCopy, scrollSelectors, copyTo } = {}) {
    if (!RevealAnimator.TYPES.hasOwnProperty(type)) return Logger.err('Invalid animation type.')

    this.animation = RevealAnimator.TYPES[type]
    this.node = typeof element === 'string' ? document.querySelector(element) : element
    this.needsCopy = needsCopy
    this.scrollSelectors = scrollSelectors ?? []
    this.copyTo = copyTo

    this.animated = false

    if (needsCopy) this.copyNode()
  }

  copyNode () {
    const rect = {
      top: this.node.offsetTop,
      left: this.node.offsetLeft,
      width: this.node.clientWidth,
      height: this.node.clientHeight
    }

    this.node.parentNode.style.position = getComputedStyle(this.node.parentNode).position === 'static' ? 'relative' : ''

    const clonedNode = this.node.cloneNode(true)
    if (this.copyTo) this.copyTo.append(clonedNode)
    else this.node.after(clonedNode)

    clonedNode.style.position = getComputedStyle(this.node).position === 'fixed' ? 'fixed' : 'absolute'
    clonedNode.style.pointerEvents = 'none'
    clonedNode.classList.add(CLONED_NODE_CLASSNAME);
    ['top', 'left', 'width', 'height'].forEach(p => clonedNode.style[p] = rect[p] + 'px')
    this.scrollSelectors.forEach(s => this.node.querySelector(`.${s}`) ? Array.from(clonedNode.querySelectorAll(`.${s}`)).forEach((e, i) => e.scrollTop = this.node.querySelectorAll(`.${s}`)[i].scrollTop) : null)

    this.node = clonedNode
  }

  animate (params = {}) {
    if (this.animated || !this.node) return false
    this.animated = true

    params.duration = params.duration ?? 500
    params.easing = params.easing ?? Easing.easeOutQuart
    params.position = params.position ?? 'bottom'

    const promise = this.animation(this.node, params)
    promise.then(() => {this.end()})

    return promise
  }

  end () {
    if (!this.needsCopy || !this.node) return

    this.node.remove()
    this.node = null
  }
}

module.exports = class BetterAnimations {
  start () {
    this.patches()
    this.injectCss()
  }

  patches () {
    this.patchChannelActions()
    this.patchPages()
    this.patchSettingsView()
    this.patchMessages()
    this.patchPopouts()
    this.patchExpressionPicker()
  }

  patchChannelActions () {
    Patcher.before(ChannelActions, 'selectChannel', (self, params, value) => {
      GuildIdHistory.push(params[0].guildId)
    })
  }

  patchPages () {
    let guildSwitched = null

    Patcher.before(RouteWithImpression.prototype, 'render', (self, _) => {
      if (self.props.path === undefined || (typeof self.props.path === 'object' && self.props.path.length > 5)) return

      RoutePathHistory.push(typeof self.props.path === 'object' ? self.props.path[0] : self.props.path)
      RouteLocationHistory.push(self.props.location.pathname)

      if (RouteLocationHistory.current === RouteLocationHistory.previous) return

      const current = Routes.find(r => r.path.includes(RoutePathHistory.current))
      const previous = Routes.find(r => r.path.includes(RoutePathHistory.previous ?? '/channels/@me'))
      if (!current || !previous) return

      guildSwitched = current._guildSwitched || previous._guildSwitched

      if (guildSwitched && !this.settings.guild.enabled) return
      if (!guildSwitched && !this.settings.channel.enabled) return

      this.setMainAnimator(new ContainerAnimator(
        guildSwitched ? this.settings.guild.type : this.settings.channel.type,
        guildSwitched ? `.${Selectors.Layout.base}` : previous.element,
        [...previous.scrollers, Selectors.Content.scrollerBase],
        { elementToAppear: guildSwitched ? `.${Selectors.Layout.base}` : current.element }
      ))
    })
    Patcher.after(RouteWithImpression.prototype, 'render', (self, _, value) => {
      if (self.props.path === undefined || (typeof self.props.path === 'object' && self.props.path.length > 5)) return

      const { duration, easing } = guildSwitched ? this.settings.guild : this.settings.channel

      this.animateMainAnimator({
        duration,
        easing: Easing[easing],
        offset: 75,
        scale: .1
      })
    })
  }

  setMainAnimator (animator) {
    if (mainAnimator?.clonedNode) mainAnimator.forceEnd()
    mainAnimator = animator
  }

  animateMainAnimator (params) {
    if (mainAnimator) mainAnimator.animate(params)
  }

  patchSettingsView () {
    let animator = null

    const before = (animatorOverride) => {
      if (!this.settings.settings.enabled) return

      if (animator?.clonedNode) animator.forceEnd()
      animator = animatorOverride ?? new ContainerAnimator(this.settings.settings.type, `.${Selectors.Sidebar.contentRegion}`, [Selectors.Sidebar.contentRegionScroller, Selectors.Settings.scroller, Selectors.Content.scrollerBase], { zIndex: 110 })
    }

    const after = () => {
      if (animator) animator.animate({
        duration: this.settings.settings.duration,
        easing: Easing[this.settings.settings.easing],
        offset: 75,
        scale: .1
      })
    }

    const toggle = () => {
      SettingsSectionHistory.push(null)
    }

    // All settings
    [UserSettingsWindow, GuildSettingsWindow, ChannelSettingsWindow].forEach(w => {
      Patcher.before(w, 'setSection', (self, _) => {
        SettingsSectionHistory.push(_[0])
        GuildSettingsRoleIdHistory.push(null)

        if (SettingsSectionHistory.current === SettingsSectionHistory.previous) return

        before()
      })
      Patcher.after(w, 'setSection', () => {
        if (SettingsSectionHistory.current === SettingsSectionHistory.previous) return

        after()
      })

      Patcher.after(w, 'open', toggle)
      Patcher.after(w, 'close', toggle)
    })

    // Guild Roles Settings
    Patcher.before(GuildSettingsWindow, 'selectRole', (self, _) => {
      GuildSettingsRoleIdHistory.push(_[0])

      if (GuildSettingsRoleIdHistory.current === GuildSettingsRoleIdHistory.previous) return
      before()
    })
    Patcher.after(GuildSettingsWindow, 'selectRole', () => {
      if (GuildSettingsRoleIdHistory.current === GuildSettingsRoleIdHistory.previous) return
      after()
    })

    // Channel Integrations Settings
    Patcher.before(ChannelIntegrationsSettingsWindow, 'setSection', (self, _) => {
      ChannelIntegrationsSectionHistory.push(_[0])

      if (ChannelIntegrationsSectionHistory.current === ChannelIntegrationsSectionHistory.previous) return
      before()
    })
    Patcher.after(ChannelIntegrationsSettingsWindow, 'setSection', (self, _, value) => {
      if (ChannelIntegrationsSectionHistory.current === ChannelIntegrationsSectionHistory.previous) return
      after()
    })
  }

  patchMessages () {
    const animateStack = new Set()
    this.messageMutationObserver = new MutationObserver(records => {
      records.forEach(r => r.addedNodes.forEach(n => {
        const node = n.id?.startsWith('chat-message') ? n : (n.querySelector ? n.querySelector('*[id^="chat-message"]') : null)
        if (!node) return

        const idSplit = node.id.split('-')
        const id = idSplit[idSplit.length - 1]
        if (!animateStack.has(id)) return
        animateStack.delete(id)

        const messageNode = document.getElementById(node.id)
        if (!messageNode) return

        messageNode.style.overflow = 'hidden'
        messageNode.animate([
          { height: 0, opacity: 0 },
          { height: messageNode.clientHeight + 'px', opacity: 0 }
        ], {
          duration: 250,
          easing: Easing.easeInOut
        }).finished.then(() => {
          messageNode.style.overflow = ''

          const animator = new RevealAnimator(this.settings.messages.type, messageNode)
          animator.animate({
            duration: this.settings.messages.duration,
            easing: Easing[this.settings.messages.easing],
            offset: 10,
            scale: .1,
            position: this.settings.messages.position
          })
        })
      }))
    })
    this.messageMutationObserver.observe(document, { childList: true, subtree: true })

    this.messageCreateHandler = (e) => {
      if (!this.settings.messages.enabled) return

      if (!e.message.id) return

      if (e.message.author.id === UserStore.getCurrentUser().id && e.message.state !== MessageStates.SENDING) return

      animateStack.add(e.message.id)
      setTimeout(() => {
        animateStack.delete(e.message.id)
      }, 100)
    }

    Dispatcher.subscribe(ActionTypes.MESSAGE_CREATE, this.messageCreateHandler)
  }

  patchPopouts () {
    const animate = (node, position) => {
      const animator = new RevealAnimator(this.settings.popouts.type, node)
      animator.animate({
        duration: this.settings.popouts.duration,
        easing: Easing[this.settings.popouts.easing],
        offset: 10,
        scale: .1,
        position
      })
    }
    let popoutNode = null

    Patcher.before(ReferencePositionLayer.prototype, 'componentDidMount', (self, _) => {
      if (!this.settings.popouts.enabled) return

      const node = self.ref?.current ?? self.elementRef?.current ?? document.getElementById(self.props.id) ?? document.querySelector(`.${self.props.className}`)
      if (!node) return

      popoutNode = node
      animate(node.children[0], self.props.position)
    })
    Patcher.before(ReferencePositionLayer.prototype, 'componentWillUnmount', (self, _) => {
      if (!this.settings.popouts.enabled) return

      const node = self.ref?.current ?? self.elementRef?.current ?? document.getElementById(self.props.id) ?? document.querySelector(`.${self.props.className}`)
      if (!node) return

      const animator = new RevealAnimator(this.settings.popouts.type, node, {
        needsCopy: true,
        copyTo: node.closest(`.${Selectors.Popout.layerContainer}`),
        scrollSelectors: [Selectors.Content.scrollerBase]
      })
      animator.animate({
        reverse: true,
        duration: this.settings.popouts.duration,
        easing: Easing[this.settings.popouts.easing],
        offset: 10,
        scale: .1,
        position: self.props.position
      })
    })

    Patcher.before(...UserPopout, (self, props) => {
      if (!popoutNode || popoutNode.children[0]?.className.includes('loadingPopout')) return
      animate(popoutNode.children[0], props[0].position)

      popoutNode = null
    })
  }

  patchExpressionPicker () {
    const ExpressionPickerRoutes = [
      new Route('Emoji', 'emoji', {
        element: `.${Selectors.EmojiPicker.emojiPickerHasTabWrapper}`,
        scrollers: [Selectors.Content.scrollerBase],
        noGuilds: true
      }),
      new Route('Stickers', 'sticker', {
        element: `.${Selectors.StickerPicker.wrapper}`,
        scrollers: [Selectors.Content.scrollerBase],
        noGuilds: true
      }),
      new Route('GIFs', 'gif', {
        element: `.${Selectors.GifPicker.container}`,
        scrollers: [Selectors.Content.scrollerBase],
        noGuilds: true
      }),
    ]

    let pickerAnimator = null

    const before = (view) => {
      ExpressionPickerViewHistory.push(view)

      if (ExpressionPickerViewHistory.current === ExpressionPickerViewHistory.previous) return

      const current = ExpressionPickerRoutes.find(r => r.path.includes(ExpressionPickerViewHistory.current))
      const previous = ExpressionPickerRoutes.find(r => r.path.includes(ExpressionPickerViewHistory.previous))
      if (!current || !previous) return

      if (!this.settings.expressionPicker.enabled) return

      if (pickerAnimator?.clonedNode) pickerAnimator.forceEnd()
      pickerAnimator = new ContainerAnimator(this.settings.expressionPicker.type, previous.element, previous.scrollers, { elementToAppear: current.element })
    }

    const after = () => {
      if (pickerAnimator) pickerAnimator.animate({
        duration: this.settings.expressionPicker.duration,
        easing: Easing[this.settings.expressionPicker.easing],
        offset: 20,
        scale: .1
      })
    }

    const setExpressionPickerView = [...Webpack.getWithKey(m => m?.toString?.().match(/\w+\.setState\({activeView:\w+,lastActiveView:\w+\.getState\(\)\.activeView}\)/))]
    const toggleExpressionPicker = [...Webpack.getWithKey(m => m?.toString?.().match(/\w+\.getState\(\)\.activeView===\w+\?\w+\(\):\w+\(\w+,\w+\)/))]

    Patcher.before(...setExpressionPickerView, (self, _) => before(_[0]))
    Patcher.before(...toggleExpressionPicker, (self, _) => before(_[0]))

    Patcher.after(...setExpressionPickerView, after)
    Patcher.after(...toggleExpressionPicker, after)
  }

  injectCss () {
    this.PLUGIN_STYLE_ID = `${config.info.name}-style`
    DOM.addStyle(this.PLUGIN_STYLE_ID, `
        .${PARENT_NODE_CLASSNAME} {
            position: relative !important;
        }
        
        .${Selectors.Layout.page} {
            overflow: visible !important;
            min-width: 0;
            min-height: 0;
            z-index: 10;
        }
        .${Selectors.Layers.layer} {
            overflow: clip !important;
        }

        /* Disable Default Discord Animations */
        ${RevealAnimator.getDiscordAnimationsSelector()} {
            transition: none !important;
        }


        /* Expression Picker Fix */
        .${Selectors.EmojiPicker.emojiPickerHasTabWrapper}, .${Selectors.StickerPicker.wrapper}, .${Selectors.GifPicker.container} {
            background-color: inherit;
        }
        
        
        .${Selectors.Popout.layerContainer} {
            position: fixed;
        }


        /* Settings */
        .${SETTINGS_CLASSNAME} .plugin-inputs {
            padding: 0 10px;
        }
        .${SETTINGS_CLASSNAME} :has(> .bd-switch) {
            color: var(--header-primary);
        }
        .${SETTINGS_CLASSNAME} .${Selectors.Stickers.grid} {
            display: grid;
            grid-gap: 10px;
            grid-template-columns: repeat(4, 1fr);
            grid-template-rows: 120px;
            grid-auto-rows: 120px;
        }
        .${SETTINGS_CLASSNAME} .${Selectors.Sticker.wrapper} {
            background-color: var(--background-secondary);
            border-radius: 8px;
            display: flex;
            padding: 12px;
            position: relative;
            transition: background-color .125s;
            align-items: center;
            flex-direction: column;
            justify-content: center;
            margin-bottom: 0;
            cursor: pointer;
        }
        .${SETTINGS_CLASSNAME} .${Selectors.Sticker.wrapper}:hover {
            background-color: var(--background-secondary-alt);
        }
        .${SETTINGS_CLASSNAME} .${Selectors.Sticker.content} {
            display: flex;
            flex-direction: column;
            align-items: center;
            max-width: 108px;
            transition: opacity .1s;
        }
        .${SETTINGS_CLASSNAME} .${Selectors.Sticker.sticker} {
            display: flex;
            justify-content: center;
            width: 90px;
            height: 60px;
            margin-bottom: 15px;
            position: relative;
            border-radius: 5px;
            margin-right: 0;
            overflow: hidden;
        }
        .${SETTINGS_CLASSNAME} .${Selectors.Sticker.stickerName} {
            text-align: center;
            white-space: wrap;
        }
        
        .BA__createUpsellBanner {
            align-items: center;
            background: linear-gradient(187deg, #5865F2, #2F379F);
            background-size: cover;
            border-radius: var(--radius-sm);
            flex-direction: row;
            padding-right: 24px;
            margin: 32px 12px;
        }
        
        .BA__createUpsellBanner, .BA__mainColumn {
            display: flex;
            justify-content: center;
        }
        
        .BA__mainColumn {
            color: var(--white-100);
            flex: 1;
            flex-direction: column;
            margin: auto 0;
            min-height: 96px;
            padding: 16px 16px 16px 4px;
        }
        
        .BA__createUpsellBanner h3 {
            margin-bottom: 4px;
        }
        
        .BA__createUpsellButton {
            padding: 11px 20px;
            margin-top: 12px;
            width: min-content;
        }
        
        .BA__createUpsellButton:hover {
            opacity: .9;
        }
        
        .BA__createUpsellArtContainer {
            align-items: center;
            align-self: stretch;
            display: flex;
            flex-basis: 124px;
            height: 100px;
            position: relative;
        }
        
        .BA__createUpsellArt {
            width: 129px;
            bottom: -51px;
            left: -15px;
            object-fit: contain;
            pointer-events: none;
            position: absolute;
        }
    `)
  }

  clearCss () {
    DOM.removeStyle(this.PLUGIN_STYLE_ID)
  }

  stop () {
    Dispatcher.unsubscribe(ActionTypes.MESSAGE_CREATE, this.messageCreateHandler)
    this.messageMutationObserver?.disconnect()

    Patcher.unpatchAll()
    this.clearCss()
  }

  getSettingsPanel () {
    const that = this

    const containerTypes = [
      {
        key: 'slipUp',
        name: 'Slip Up'
      },
      {
        key: 'slipDown',
        name: 'Slip Down'
      },
      {
        key: 'slipLeft',
        name: 'Slip Left'
      },
      {
        key: 'slipRight',
        name: 'Slip Right'
      },
      {
        key: 'slideUp',
        name: 'Slide Up'
      },
      {
        key: 'slideDown',
        name: 'Slide Down'
      },
      {
        key: 'slideLeft',
        name: 'Slide Left'
      },
      {
        key: 'slideRight',
        name: 'Slide Right'
      },
      {
        key: 'flipForwards',
        name: 'Flip Forwards'
      },
      {
        key: 'flipBackwards',
        name: 'Flip Backwards'
      },
      {
        key: 'flipLeft',
        name: 'Flip Left'
      },
      {
        key: 'flipRight',
        name: 'Flip Right'
      },
      {
        key: 'scaleUp',
        name: 'Scale Up'
      },
      {
        key: 'scaleDown',
        name: 'Scale Down'
      },
      {
        key: 'scaleLeft',
        name: 'Scale Left'
      },
      {
        key: 'scaleRight',
        name: 'Scale Right'
      },
      {
        key: 'fade',
        name: 'Fade'
      },
      {
        key: 'scaleForwards',
        name: 'Scale Forwards'
      },
      {
        key: 'scaleBackwards',
        name: 'Scale Backwards'
      },
      {
        key: 'scaleChange',
        name: 'Scale Change'
      },
    ]

    const revealTypes = [
      {
        key: 'fade',
        name: 'Fade'
      },
      {
        key: 'slip',
        name: 'Slip'
      },
      {
        key: 'slipScale',
        name: 'Slip Scale'
      },
      {
        key: 'flip',
        name: 'Flip'
      },
      {
        key: 'scaleForwards',
        name: 'Scale Forwards'
      },
      {
        key: 'scaleBackwards',
        name: 'Scale Backwards'
      },
      {
        key: 'scaleForwardsSide',
        name: 'Scale Forwards Side-dependent'
      },
      {
        key: 'scaleBackwardsSide',
        name: 'Scale Backwards Side-dependent'
      },
      {
        key: 'rotateForwardsLeft',
        name: 'Rotate Forwards Left'
      },
      {
        key: 'rotateForwardsRight',
        name: 'Rotate Forwards Right'
      },
      {
        key: 'rotateBackwardsLeft',
        name: 'Rotate Backwards Left'
      },
      {
        key: 'rotateBackwardsRight',
        name: 'Rotate Backwards Right'
      },
    ]

    const page = (num, title = null) => React.createElement(
      'div',
      {
        style: {
          position: 'absolute',
          top: '0',
          left: '0',
          height: '100%',
          width: '100%',
          background: `var(--background-${num === 2 ? 'tertiary' : 'accent'})`,
          borderRadius: '5px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          color: 'var(--text-normal)',
          fontSize: '12px',
          opacity: 0
        },
        'data-page': num
      },
      title ?? `${num === 1 ? 'First' : 'Second'} page`
    )

    // Reveal Animation Example Component
    class RevealAnimationExample extends React.Component {
      constructor (props) {
        super(props)

        this.ref = React.createRef()
      }

      componentDidMount () {
        const animate = () => {
          if (!this.ref.current) return

          const node = this.ref.current.querySelector('[data-page="1"]')

          const params = {
            duration: this.props.getOption().duration,
            easing: Easing[this.props.getOption().easing],
            offset: 10,
            scale: .15,
            position: this.props.getOption().position ?? ['top', 'left', 'right', 'bottom'][Math.round(Math.random() * 3)]
          }

          node.style.opacity = 1
          this.props.animation(node, params).then(() => {
            setTimeout(() => {
              if (!this.ref.current) return

              node.style.opacity = 0
              this.props.animation(node, Object.assign(params, { reverse: true }))
                .then(() => {
                  setTimeout(() => animate(), 1000)
                })
            }, 1000)
          })
        }

        animate()
      }

      render () {
        return React.createElement(
          'div',
          {
            className: Selectors.Sticker.sticker,
            ref: this.ref
          },
          [
            page(1, '')
          ]
        )
      }
    }

    // Container Animation Example Component
    class ContainerAnimationExample extends React.Component {
      constructor (props) {
        super(props)

        this.ref = React.createRef()

        this.state = {
          page: 0
        }
      }

      componentDidMount () {
        const animate = () => {
          if (!this.ref.current) return

          this.setState({
            page: Math.abs(this.state.page - 1)
          })

          const node = this.ref.current
          const pages = [node.querySelector('[data-page="1"]'), node.querySelector('[data-page="2"]')]

          const page = Math.abs(this.state.page - 1)

          pages.forEach(p => p.style.opacity = 1)
          pages[page].style.zIndex = 5

          this.props.animation(pages[this.state.page], pages[page], {
            duration: this.props.getOption().duration,
            easing: Easing[this.props.getOption().easing],
            offset: 10,
            scale: .3,
            zIndex: 5
          }).then(() => {
            pages[page].style.zIndex = 1
            pages[page].style.opacity = 0

            setTimeout(() => animate(), 1000)
          })
        }

        this.ref.current.querySelector(`[data-page="${this.state.page + 1}"]`).style.opacity = 1
        setTimeout(() => animate(), 1000)
      }

      render () {
        return React.createElement(
          'div',
          {
            className: Selectors.Sticker.sticker,
            ref: this.ref
          },
          [
            page(2),
            page(1)
          ]
        )
      }
    }

    const AnimationTypes = (types, animations, component, getOption) => {
      // Item Component
      class Item extends React.Component {
        constructor (props) {
          super(props)
        }

        render () {
          return React.createElement(
            'div',
            {
              className: Selectors.Sticker.wrapper,
              onClick: () => this.props.onClick(this.props.type.key)
            },
            [
              React.createElement(
                'div',
                {
                  className: Selectors.Sticker.content
                },
                [
                  React.createElement(
                    component,
                    {
                      animation: this.props.animations[this.props.type.key],
                      getOption
                    }
                  ),
                  React.createElement(
                    'div',
                    {
                      className: `${Selectors.Colors.colorHeaderPrimary} ${Selectors.Sizes.size10} ${Selectors.Sticker.stickerName}`
                    },
                    this.props.type.name
                  )
                ]
              ),
              React.createElement(
                'div',
                {
                  className: Selectors.VideoOptions.backgroundOptionRing,
                  style: {
                    display: this.props.type.selected ? 'block' : 'none',
                    borderRadius: '10px'
                  }
                }
              )
            ]
          )
        }
      }

      // Panel Component
      class Panel extends React.Component {
        constructor (props) {
          super(props)

          this.state = {
            types: types.map(t => Object.assign(t, { selected: t.key === getOption().type }))
          }
        }

        render () {
          let buttons = []
          this.state.types.forEach(t => {
            buttons.push(
              React.createElement(Item, {
                type: t,
                animations: animations,
                onClick: key => {
                  getOption().type = key

                  const types = this.state.types
                  types.forEach(t => t.selected = false)
                  types.find(t => t.key === key).selected = true
                  this.setState({ types })

                  that.saveSettings()
                }
              })
            )
          })

          return React.createElement(
            'div',
            {
              className: Selectors.Stickers.grid
            },
            buttons
          )
        }
      }

      return React.createElement(Panel)
    }

    const markers = (start, stop, step = 1) =>
      Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)

    const easings = Object.keys(Easing).map(e => {
      return {
        label: e.charAt(0).toUpperCase() + e.slice(1),
        value: e
      }
    })

    const positions = [
      { label: 'Top', value: 'bottom' },
      { label: 'Bottom', value: 'top' },
      { label: 'Left', value: 'right' },
      { label: 'Right', value: 'left' }
    ]

    const buildSection = (id, name, { enableText, reveal = false, explicitPosition = false }) => {
      return {
        type: 'category',
        id,
        name,
        collapsible: true,
        shown: false,
        settings: [
          {
            type: 'switch',
            id: 'enabled',
            name: enableText,
            value: this.settings[id].enabled,
            onChange: e => {
              this.settings[id].enabled = e
              this.saveSettings()
            }
          },
          {
            type: 'custom',
            id: 'type',
            name: 'Animation type',
            inline: false,
            children: AnimationTypes(
              reveal ? revealTypes : containerTypes,
              reveal ? RevealAnimator.TYPES : ContainerAnimator.TYPES,
              reveal ? RevealAnimationExample : ContainerAnimationExample,
              () => this.settings[id]
            )
          },
          ...(explicitPosition ? [
            {
              type: 'dropdown',
              id: 'position',
              name: 'Side',
              note: 'Sets the side for side-dependent animations.',
              value: this.settings[id].position,
              options: positions,
              onChange: e => {
                this.settings[id].position = e
                this.saveSettings()
              }
            }
          ] : []),
          {
            type: 'dropdown',
            id: 'easing',
            name: 'Easing',
            note: 'Easing functions can be viewed at www.easings.net',
            value: this.settings[id].easing,
            options: easings,
            onChange: e => {
              this.settings[id].easing = e
              this.saveSettings()
            }
          },
          {
            type: 'custom',
            id: 'duration',
            name: 'Duration',
            inline: false,
            children: React.createElement(Slider, {
              minValue: 100,
              maxValue: 5000,
              markers: markers(100, 5001, 100),
              stickToMarkers: true,
              onMarkerRender: v => v % 500 === 0 || v === 100 ? (v / 1000).toFixed(1) + 's' : '',
              initialValue: this.settings[id].duration,
              onValueChange: e => {
                this.settings[id].duration = e
                this.saveSettings()
              }
            })
          }
        ]
      }
    }

    const element = UI.buildSettingsPanel({
      onChange: () => {
        this.saveSettings.bind(this)
      },
      settings: [
        buildSection(
          'guild',
          'Server Animations',
          { enableText: 'Enable server switching animation' }
        ),
        buildSection(
          'channel',
          'Channel Animations',
          { enableText: 'Enable channel switching animation' }
        ),
        buildSection(
          'settings',
          'Settings Animations',
          { enableText: 'Enable settings sections switching animation' }
        ),
        buildSection(
          'messages',
          'Messages Animations',
          { enableText: 'Enable new message reveal animation', reveal: true, explicitPosition: true }
        ),
        buildSection(
          'popouts',
          'Popouts, Context Menus and Tooltips Animations',
          { enableText: 'Enable popouts, context menus and tooltips animations', reveal: true }
        ),
        buildSection(
          'expressionPicker',
          'Expression Picker Animations',
          { enableText: 'Enable expression picker sections switching animation' }
        )
      ]
    })

    return React.createElement(
      'div',
      { className: SETTINGS_CLASSNAME },
      this.renderV2Banner(),
      element
    )
  }

  constructor () {
    this.defaultSettings = {
      guild: {
        enabled: true,
        type: 'flipForwards',
        easing: 'easeInOutCubic',
        duration: 700
      },
      channel: {
        enabled: true,
        type: 'slipUp',
        easing: 'easeInOutCubic',
        duration: 500
      },
      settings: {
        enabled: true,
        type: 'slipUp',
        easing: 'easeInOutCubic',
        duration: 500
      },
      messages: {
        enabled: true,
        type: 'slip',
        easing: 'easeOutQuart',
        position: 'bottom',
        duration: 200
      },
      popouts: {
        enabled: true,
        type: 'rotateBackwardsLeft',
        easing: 'easeInOutBack',
        duration: 300
      },
      expressionPicker: {
        enabled: true,
        type: 'scaleChange',
        easing: 'easeInOutBack',
        duration: 500
      },
    }

    this.settings = this.loadSettings(this.defaultSettings)

    this.showChangelogIfNeeded()
    this.showV2ModalIfNeeded()
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

  showV2ModalIfNeeded () {
    if (Data.load('hasShownV2Modal')) return

    this.showV2Modal()
    Data.save('hasShownV2Modal', true)
  }
  showV2Modal () {
    const invite = 'https://discord.gg/jgfy25t47r'

    return UI.showChangelogModal({
      banner: 'https://i.imgur.com/Kkv8zKB.png',
      title: 'BetterAnimations V2 enters Beta!',
      subtitle: 'Big changes are finally here.',
      blurb: 'The newest version of one of the most downloaded BetterDiscord plugins almost 2 years in development takes the success of its predecessor to a whole new level.' +
        `\n\n[**Join the Support Server**](${invite}) to be one of the first ones to experience the largest BetterDiscord plugin ever made ` +
        'and take part in establishing it as the ultimate solution for bringing your Discord app to life with fluid animations.',
      changes: [
        {
          type: 'progress',
          title: 'Main keynotes of the newest release',
          items: [
            '**10 new animation modules** — BetterAnimations V2 supports 14 modules in total: Servers, Channels, Settings, Layers, Tooltips, Popouts, Context Menu, Messages, Channel List, Modals, Modals Backdrop, Members Sidebar, Thread Sidebar, Thread Sidebar Switch.',
            '**Native integration** — animations are tightly integrated into Discord making them much more reliable and rigid.',
            '**Ultimate customizability** — tweak every part of the plugin and animations in a fully revamped Settings Panel.',
            '**Client Mod & Framework** — build your own animations and publish them to the official Catalog for everyone to download and use.'
          ]
        }
      ],
      footer: React.createElement(
        Button,
        {
          style: {
            marginLeft: 'auto'
          },
          children: 'Try it out',
          onClick: () => handleClick({ href: invite })
        }
      )
    })
  }

  renderV2Banner () {
    function PackPicture(props) {
      return /* @__PURE__ */ BdApi.React.createElement("svg", { ...props, width: "160", height: "192", viewBox: "0 0 160 192", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, /* @__PURE__ */ BdApi.React.createElement("g", { "clip-path": "url(#clip0_364_497)" }, /* @__PURE__ */ BdApi.React.createElement("path", { d: "M0.12699 43.8989C-0.863275 37.1255 4.04575 30.863 11.0915 29.911L113.152 16.1221C120.197 15.1702 126.712 19.8893 127.702 26.6627L147.873 164.635C148.863 171.409 143.954 177.671 136.908 178.623L39.1006 191.837C29.7063 193.107 21.0203 186.814 19.7001 177.784L0.12699 43.8989Z", fill: "url(#paint0_linear_364_497)" }), /* @__PURE__ */ BdApi.React.createElement("path", { d: "M10.1376 30.5728C9.06483 22.8787 14.3827 15.7647 22.0152 14.6834L124.678 0.138664C132.31 -0.942678 139.367 4.41806 140.44 12.1122L159.862 151.427C160.935 159.121 155.617 166.235 147.985 167.317L45.3224 181.861C37.6899 182.943 30.6329 177.582 29.5602 169.888L10.1376 30.5728Z", fill: "url(#paint1_linear_364_497)" }), /* @__PURE__ */ BdApi.React.createElement("path", { d: "M19.0979 33.7417C18.3346 28.2753 22.1183 23.221 27.5489 22.4527L121.946 9.09852C127.376 8.33025 132.397 12.1389 133.161 17.6054L151.402 148.258C152.165 153.725 148.382 158.779 142.951 159.547L48.5544 172.901C43.1238 173.67 38.1027 169.861 37.3394 164.395L19.0979 33.7417Z", fill: "white" }), /* @__PURE__ */ BdApi.React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M91.6298 136.767C104.339 149.771 112.123 129.724 110.522 118.561C108.63 105.362 94.2015 99.8837 86.5377 100.972C74.237 102.719 63.9659 114.548 65.9411 128.458C68.1366 143.918 82.7808 150.575 93.3682 149.072C90.9234 149.067 82.6965 148.49 79.9777 130.116C78.1393 117.689 81.5632 112.133 88.286 113.408C88.4372 113.441 95.755 115.191 97.0231 124.121C98.2858 133.013 91.6298 136.767 91.6298 136.767Z", fill: "url(#paint2_linear_364_497)" }), /* @__PURE__ */ BdApi.React.createElement("path", { "fill-rule": "evenodd", "clip-rule": "evenodd", d: "M88.2981 113.397C80.9178 111.971 73.1222 118.994 74.7716 130.609C77.4648 149.574 91.7633 149.3 93.4668 149.058C105.768 147.311 116.039 135.481 114.063 121.572C111.868 106.111 97.2237 99.4545 86.6364 100.958C89.5111 100.135 102.892 101.887 105.39 119.481C107.02 130.954 98.2947 138.565 91.6643 136.784C91.5131 136.751 84.1953 135.001 82.9272 126.071C81.6645 117.179 88.2981 113.397 88.2981 113.397Z", fill: "url(#paint3_linear_364_497)" }), /* @__PURE__ */ BdApi.React.createElement("path", { d: "M47.8507 42.0276C47.8349 41.9761 47.8165 41.9254 47.7955 41.8757C47.775 41.8263 47.752 41.778 47.7266 41.731C47.7016 41.6837 47.6741 41.6378 47.644 41.5935C47.6135 41.5495 47.5812 41.5068 47.5471 41.4665C47.5126 41.4252 47.4757 41.3858 47.4368 41.3487C47.399 41.312 47.3583 41.2768 47.3168 41.2438C47.2747 41.2126 47.231 41.1838 47.1858 41.1573C47.1407 41.129 47.0938 41.1021 47.0463 41.0783C46.9982 41.0547 46.9489 41.0336 46.8986 41.0152C46.5918 40.9079 46.262 40.8844 45.943 40.9471C45.4691 41.1322 45.0954 41.3724 44.8774 41.8574C44.8551 41.9067 44.8356 41.9571 44.819 42.0086C44.8031 42.0592 44.7885 42.1117 44.7771 42.1649C44.7655 42.2175 44.7565 42.2707 44.7504 42.3242C44.7443 42.3776 44.7413 42.4306 44.7396 42.4855C44.738 42.5404 44.7409 42.5904 44.7459 42.6475C44.7503 42.7011 44.7579 42.7544 44.7685 42.8072C44.7762 42.8608 44.7904 42.9092 44.8057 42.9648C44.8209 43.0204 44.8388 43.0652 44.8598 43.1169C44.9176 43.2604 44.9965 43.3944 45.094 43.5145C45.1259 43.5541 45.1607 43.5922 45.1964 43.6292C45.2322 43.6662 45.2707 43.7006 45.31 43.7329C45.3494 43.7662 45.3906 43.7971 45.4335 43.8257C45.4754 43.8544 45.5201 43.8806 45.5647 43.9058C45.6093 43.931 45.6564 43.9517 45.7045 43.9722C46.0531 44.1181 46.3754 44.1154 46.7427 44.0601C47.2113 43.8663 47.5776 43.6261 47.7889 43.1389C47.8103 43.0892 47.829 43.0385 47.8451 42.9869C47.8621 42.9358 47.8758 42.8837 47.886 42.8308C47.9183 42.6723 47.9271 42.51 47.9121 42.3489C47.9045 42.2954 47.8975 42.2459 47.8894 42.1892C47.8814 42.1326 47.8664 42.079 47.8507 42.0276Z", fill: "url(#paint4_linear_364_497)" }), /* @__PURE__ */ BdApi.React.createElement("path", { d: "M60.4791 52.2765C60.5 52.3274 60.5239 52.377 60.5507 52.425C60.576 52.4723 60.6039 52.5182 60.6343 52.5624C60.6638 52.6066 60.6958 52.649 60.7301 52.6896C60.7647 52.7305 60.8015 52.7694 60.8403 52.8064C60.8783 52.8435 60.9184 52.8785 60.9603 52.9112C61.0025 52.9445 61.0466 52.9754 61.0922 53.0039C61.1372 53.0322 61.184 53.0581 61.2315 53.0818C61.2792 53.1057 61.3281 53.1268 61.3782 53.1451C61.4281 53.164 61.4792 53.18 61.531 53.1927C61.8483 53.2683 62.1804 53.2539 62.4899 53.151C62.9429 52.929 63.2885 52.6466 63.4547 52.1521C63.4714 52.1012 63.4854 52.0493 63.4967 51.9969C63.5081 51.9438 63.5171 51.8889 63.5235 51.8376C63.5298 51.784 63.5334 51.7302 63.5342 51.6763C63.535 51.6226 63.5329 51.5714 63.5281 51.5153C63.5233 51.4592 63.5135 51.4123 63.5054 51.3556C63.4974 51.299 63.4826 51.2538 63.4674 51.1992C63.4523 51.1446 63.4343 51.0988 63.4133 51.0471C63.3936 50.9971 63.3709 50.9484 63.3452 50.9012C63.3207 50.8543 63.2932 50.8088 63.2637 50.7636C63.2341 50.7184 63.2019 50.6767 63.1678 50.6364C63.1337 50.596 63.0975 50.556 63.0596 50.5183C63.0217 50.4806 62.9831 50.4461 62.9394 50.4124C62.8985 50.3787 62.8555 50.3476 62.8106 50.3193C62.7663 50.2899 62.7204 50.2631 62.6731 50.239C62.6254 50.2142 62.5772 50.1927 62.527 50.1725C62.4776 50.153 62.4272 50.1363 62.3759 50.1225C62.0311 50.0254 61.7375 50.0671 61.3936 50.1402C60.942 50.3641 60.595 50.6436 60.429 51.1401C60.4127 51.1929 60.3983 51.2464 60.3857 51.3008C60.3742 51.3548 60.3654 51.4093 60.3595 51.4642C60.3529 51.5191 60.3495 51.5743 60.3494 51.6296C60.3489 51.6854 60.3513 51.7397 60.3562 51.7958C60.3608 51.8508 60.3686 51.9055 60.3794 51.9596C60.3872 52.0142 60.4042 52.0675 60.4202 52.1209C60.437 52.1738 60.4566 52.2257 60.4791 52.2765Z", fill: "url(#paint5_linear_364_497)" }), /* @__PURE__ */ BdApi.React.createElement("path", { d: "M58.6152 47.0068C58.6285 46.9597 58.6387 46.9131 58.6477 46.8656C58.6567 46.818 58.6614 46.7701 58.665 46.7212C58.6689 46.6732 58.6701 46.6249 58.6686 46.5767C58.6672 46.5284 58.6631 46.4802 58.6565 46.4323C58.6523 46.3843 58.6455 46.3365 58.6362 46.2891C58.6241 46.2415 58.6112 46.1949 58.5954 46.1499C58.5797 46.1042 58.5614 46.0594 58.5406 46.0158C58.5207 45.9718 58.4981 45.929 58.473 45.8877C58.374 45.7258 58.2418 45.5866 58.0851 45.4795C57.9284 45.3724 57.7507 45.2998 57.5639 45.2665C56.9696 45.1523 53.7461 45.6766 52.9821 45.8398C52.5752 46.0532 52.2879 46.3021 52.1465 46.7563C52.1318 46.8014 52.1205 46.8472 52.1103 46.8938C52.1001 46.9405 52.0933 46.9887 52.0884 47.0357C52.0835 47.0826 52.0808 47.1303 52.0804 47.1787C52.0799 47.2271 52.0823 47.274 52.087 47.3217C52.0917 47.3694 52.1003 47.4155 52.1071 47.4629C52.1161 47.5098 52.1276 47.5562 52.1416 47.602C52.1545 47.648 52.1704 47.6931 52.1891 47.7371C52.2069 47.7812 52.227 47.8243 52.2495 47.8662C52.333 48.0206 52.4466 48.1567 52.5837 48.2663C52.7208 48.3759 52.8785 48.4568 53.0475 48.5042C53.2375 48.5572 53.4351 48.5771 53.6318 48.5631C54.2106 48.5313 54.797 48.3975 55.3708 48.316C56.1712 48.2022 56.9789 48.1169 57.7717 47.9643C58.1838 47.7355 58.4792 47.477 58.6152 47.0068Z", fill: "url(#paint6_linear_364_497)" }), /* @__PURE__ */ BdApi.React.createElement("path", { d: "M104.452 55.4932C105.883 53.1573 106.79 49.8482 106.973 47.1232C107.196 43.8283 106.508 40.383 104.27 37.8487C102.357 35.6822 99.4849 34.4981 96.6252 34.3432C93.987 34.201 91.124 34.7918 88.4959 35.1579L58.7608 39.3191L53.0144 40.1357C52.1903 40.2528 51.3438 40.3237 50.5284 40.4805C50.2035 40.5312 49.8999 40.6739 49.6536 40.8918C49.5264 41.0127 49.4245 41.1578 49.3539 41.3185C49.2832 41.4792 49.2453 41.6523 49.2422 41.8278C49.2417 41.8762 49.2423 41.9245 49.2459 41.9723C49.2501 42.02 49.2568 42.0675 49.2661 42.1145C49.2744 42.1618 49.2853 42.2087 49.2987 42.2549C49.3114 42.3012 49.3266 42.3467 49.3443 42.3913C49.3808 42.4807 49.4254 42.5665 49.4775 42.6478C49.5041 42.6871 49.5317 42.7262 49.5623 42.7639C49.5929 42.8016 49.6252 42.837 49.6584 42.8711C49.8982 43.1132 50.2142 43.265 50.553 43.3011C51.1149 43.3358 53.1592 42.9517 53.8165 42.8583L65.9119 41.1396C66.4384 41.0648 66.9972 40.9296 67.5311 40.9442C67.9321 40.9555 68.2853 41.0745 68.5554 41.3851C68.8108 41.6772 68.9431 42.057 68.9246 42.4446C68.9072 42.676 68.8294 42.8989 68.6991 43.091C68.5687 43.2831 68.3902 43.4376 68.1815 43.5391C67.6328 43.8273 66.8942 43.8513 66.2851 43.9358L62.5608 44.4492C61.9427 44.5371 61.2569 44.5704 60.6629 44.7463C60.4156 44.814 60.1863 44.9356 59.9915 45.1023C59.8598 45.2137 59.7531 45.3517 59.6785 45.5072C59.6039 45.6627 59.563 45.8322 59.5585 46.0046C59.5489 46.3886 59.6756 46.8288 59.9573 47.0957C60.178 47.3167 60.4678 47.4554 60.7783 47.4887C61.4675 47.561 62.3016 47.3437 62.989 47.2408L67.594 46.5864C68.2811 46.4888 69.0334 46.302 69.7235 46.2922C70.1326 46.2866 70.5103 46.378 70.8075 46.6721C70.9503 46.809 71.0626 46.9743 71.1374 47.1575C71.2121 47.3406 71.2475 47.5374 71.2413 47.735C71.2365 47.9687 71.1708 48.197 71.0508 48.3975C70.9307 48.598 70.7603 48.7636 70.5566 48.8781C69.399 49.5334 65.8126 49.2201 64.9229 50.1253C64.7998 50.2588 64.7051 50.4159 64.6445 50.5871C64.584 50.7583 64.5587 50.94 64.5704 51.1213C64.5713 51.3152 64.6127 51.5069 64.6922 51.6839C64.7716 51.8609 64.8873 52.0192 65.0317 52.1487C65.3096 52.3878 65.6694 52.5096 66.0354 52.4885C66.6586 52.4735 67.3324 52.3189 67.9525 52.2308L89.9636 49.103C90.8104 48.9827 91.6754 48.8199 92.5301 48.7699C93.0358 48.8746 93.4749 49.0434 93.7811 49.4897C94.062 49.8985 94.096 50.3519 94.0766 50.8297C94.012 51.2682 93.8591 51.689 93.6272 52.0666C93.3952 52.4442 93.0891 52.7709 92.7272 53.0268C92.4863 53.2013 92.22 53.3377 91.9376 53.4311C91.1221 53.609 90.2717 53.6973 89.4414 53.8153C87.7653 54.0535 86.0811 54.2644 84.4099 54.5303C84.0268 58.1875 83.536 61.8411 83.1965 65.5016L88.2114 64.789C89.0449 64.6706 89.9378 64.468 90.7761 64.4582C91.2511 64.5389 91.6963 64.7205 91.9944 65.1175C92.3213 65.5545 92.3882 66.143 92.2967 66.6678C92.2122 67.0968 92.0433 67.5046 91.7997 67.8677C91.5561 68.2307 91.2427 68.5416 90.8777 68.7823C90.5982 68.9642 90.2879 69.0938 89.962 69.1646C89.4074 69.2928 88.8223 69.3392 88.2583 69.4162L85.6488 69.787C83.1548 70.1414 80.6574 70.5467 78.1573 70.8515C78.1439 70.3132 78.2548 69.7331 78.316 69.1947L78.6867 65.9312L79.8911 55.1766L66.03 57.1399C65.42 62.3513 64.9158 67.5896 64.269 72.8083C63.9473 76.2392 63.5118 79.6685 63.1293 83.0934L62.8127 85.9466C62.7831 86.2336 62.7083 86.5206 62.6908 86.8047C62.6761 86.9189 62.6926 87.035 62.7386 87.1406C62.8264 87.1711 62.922 87.1705 63.0095 87.1389C64.8136 86.9582 66.6278 86.6342 68.4234 86.379L86.4549 83.8167C89.2024 83.4263 91.9513 83.0683 94.6113 82.2468C97.119 81.47 99.5452 80.3202 101.512 78.5546C105.213 75.232 106.367 70.6266 106.612 65.8581C106.784 62.5029 106.357 58.8904 104.02 56.2998L104.016 56.2771C104.174 56.0193 104.316 55.7585 104.452 55.4932Z", fill: "url(#paint7_linear_364_497)" })), /* @__PURE__ */ BdApi.React.createElement("defs", null, /* @__PURE__ */ BdApi.React.createElement("linearGradient", { id: "paint0_linear_364_497", x1: "0.447603", y1: "16.413", x2: "148.448", y2: "191.541", gradientUnits: "userSpaceOnUse" }, /* @__PURE__ */ BdApi.React.createElement("stop", { "stop-color": "#508AB7" }), /* @__PURE__ */ BdApi.React.createElement("stop", { offset: "1", "stop-color": "#1F2569" })), /* @__PURE__ */ BdApi.React.createElement("linearGradient", { id: "paint1_linear_364_497", x1: "11.1858", y1: "19.1536", x2: "158.875", y2: "162.67", gradientUnits: "userSpaceOnUse" }, /* @__PURE__ */ BdApi.React.createElement("stop", { "stop-color": "#41D1FF" }), /* @__PURE__ */ BdApi.React.createElement("stop", { offset: "1", "stop-color": "#5865F2" })), /* @__PURE__ */ BdApi.React.createElement("linearGradient", { id: "paint2_linear_364_497", x1: "73.3725", y1: "107.902", x2: "107.5", y2: "144.392", gradientUnits: "userSpaceOnUse" }, /* @__PURE__ */ BdApi.React.createElement("stop", { "stop-color": "#5865F2" }), /* @__PURE__ */ BdApi.React.createElement("stop", { offset: "1", "stop-color": "#41D1FF" })), /* @__PURE__ */ BdApi.React.createElement("linearGradient", { id: "paint3_linear_364_497", x1: "109.369", y1: "139.553", x2: "70.6513", y2: "110.457", gradientUnits: "userSpaceOnUse" }, /* @__PURE__ */ BdApi.React.createElement("stop", { "stop-color": "#5865F2" }), /* @__PURE__ */ BdApi.React.createElement("stop", { offset: "1", "stop-color": "#41D1FF" })), /* @__PURE__ */ BdApi.React.createElement("linearGradient", { id: "paint4_linear_364_497", x1: "44.7007", y1: "44.5189", x2: "111.604", y2: "78.0676", gradientUnits: "userSpaceOnUse" }, /* @__PURE__ */ BdApi.React.createElement("stop", { "stop-color": "#41D1FF" }), /* @__PURE__ */ BdApi.React.createElement("stop", { offset: "1", "stop-color": "#5865F2" })), /* @__PURE__ */ BdApi.React.createElement("linearGradient", { id: "paint5_linear_364_497", x1: "44.7007", y1: "44.5189", x2: "111.604", y2: "78.0676", gradientUnits: "userSpaceOnUse" }, /* @__PURE__ */ BdApi.React.createElement("stop", { "stop-color": "#41D1FF" }), /* @__PURE__ */ BdApi.React.createElement("stop", { offset: "1", "stop-color": "#5865F2" })), /* @__PURE__ */ BdApi.React.createElement("linearGradient", { id: "paint6_linear_364_497", x1: "44.7007", y1: "44.5189", x2: "111.604", y2: "78.0676", gradientUnits: "userSpaceOnUse" }, /* @__PURE__ */ BdApi.React.createElement("stop", { "stop-color": "#41D1FF" }), /* @__PURE__ */ BdApi.React.createElement("stop", { offset: "1", "stop-color": "#5865F2" })), /* @__PURE__ */ BdApi.React.createElement("linearGradient", { id: "paint7_linear_364_497", x1: "44.7007", y1: "44.5189", x2: "111.604", y2: "78.0676", gradientUnits: "userSpaceOnUse" }, /* @__PURE__ */ BdApi.React.createElement("stop", { "stop-color": "#41D1FF" }), /* @__PURE__ */ BdApi.React.createElement("stop", { offset: "1", "stop-color": "#5865F2" })), /* @__PURE__ */ BdApi.React.createElement("clipPath", { id: "clip0_364_497" }, /* @__PURE__ */ BdApi.React.createElement("rect", { width: "160", height: "192", fill: "white" }))));
    }

    return BdApi.React.createElement("div", { className: "BA__createUpsellBanner" },
      /* @__PURE__ */ BdApi.React.createElement("div", { class: "BA__createUpsellArtContainer" },
        /* @__PURE__ */ BdApi.React.createElement(PackPicture, { className: "BA__createUpsellArt" })),
      /* @__PURE__ */ BdApi.React.createElement("div", { class: "BA__mainColumn" },
        /* @__PURE__ */ BdApi.React.createElement(
      Text,
      {
        tag: "h3",
        variant: "heading-lg/extrabold",
        color: "currentColor"
      },
      "BetterAnimations V2 enters Beta!"
    ), /* @__PURE__ */ BdApi.React.createElement(
      Text,
      {
        variant: "text-sm/normal",
        color: "currentColor"
      },
      "Be one of the first ones to experience the largest BetterDiscord plugin ever made "
      + "and take part in establishing it as the ultimate solution for bringing your Discord app to life with fluid animations."
    ), /* @__PURE__ */ BdApi.React.createElement(
      Button,
      {
        className: "BA__createUpsellButton",
        innerClassName: "BA__buttonContents",
        color: Button.Colors.BRAND_INVERTED,
        onClick: () => this.showV2Modal()
      },
      "Learn more"
    )))
  }
}
