/**
 * @name BetterGuildTooltip
 * @author arg0NNY
 * @authorId 633223783204782090
 * @invite M8DBtcZjXD
 * @version 1.2.0
 * @description Displays an online and total member count in the guild tooltip.
 * @website https://github.com/arg0NNY/DiscordPlugins/tree/master/BetterGuildTooltip
 * @source https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/BetterGuildTooltip/BetterGuildTooltip.plugin.js
 * @updateUrl https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/BetterGuildTooltip/BetterGuildTooltip.plugin.js
 */

/* ### CONFIG START ### */
const config = {
  info: {
    name: 'BetterGuildTooltip',
    version: '1.2.0',
    description: 'Displays an online and total member count in the guild tooltip.'
  },
  changelog: [
    {
      type: 'improved',
      title: 'Improvements',
      items: [
        'Completely removed dependency on ZeresPluginLibrary.'
      ]
    }
  ]
}
/* ### CONFIG END ### */

const {
  Webpack,
  UI,
  Patcher,
  React,
  Utils,
  Data
} = new BdApi(config.info.name)
const { Filters } = Webpack

const Dispatcher = Webpack.getByKeys('_subscriptions', '_waitQueue')
const GuildMemberCountStore = Webpack.getStore('GuildMemberCountStore')
const GuildChannelStore = Webpack.getStore('GuildChannelStore')
const Flux = Webpack.getByKeys('Store', 'connectStores')

const ActionTypes = {
  CONNECTION_OPEN: 'CONNECTION_OPEN',
  GUILD_CREATE: 'GUILD_CREATE',
  GUILD_DELETE: 'GUILD_DELETE',
  GUILD_MEMBER_LIST_UPDATE: 'GUILD_MEMBER_LIST_UPDATE',
  ONLINE_GUILD_MEMBER_COUNT_UPDATE: 'ONLINE_GUILD_MEMBER_COUNT_UPDATE'
}

const useStateFromStores = Webpack.getModule(Filters.byStrings('useStateFromStores'), { searchExports: true })

const Selectors = {
  Guild: Webpack.getByKeys('statusOffline', 'guildDetail')
}

const GuildInfoStore = Webpack.getByKeys('getGuild', 'hasFetchFailed')
const GuildActions = Webpack.getByKeys('preload', 'closePrivateChannel')
const GuildTooltip = [...Webpack.getWithKey(Filters.byStrings('listItemTooltip', 'guild'))]

const memberCounts = new Map()
const onlineMemberCounts = new Map()

function handleConnectionOpen ({ guilds }) {
  for (const guild of guilds) {
    memberCounts.set(guild.id, guild.member_count)
  }
}

function handleGuildCreate ({ guild }) {
  memberCounts.set(guild.id, guild.member_count)
}

function handleGuildDelete ({ guild }) {
  memberCounts.delete(guild.id)
  onlineMemberCounts.delete(guild.id)
}

function handleGuildMemberListUpdate ({ guildId, memberCount, groups }) {
  if (memberCount !== 0) {
    memberCounts.set(guildId, memberCount)
  }

  onlineMemberCounts.set(
    guildId,
    groups.reduce((total, group) => {
      return group.id !== 'offline' ? total + group.count : total
    }, 0)
  )
}

function handleOnlineGuildMemberCountUpdate ({ guildId, count }) {
  onlineMemberCounts.set(guildId, count)
}

const MemberCountsStore = new class extends Flux.Store {
  initialize () {
    const nativeMemberCounts = GuildMemberCountStore.getMemberCounts()
    for (const guildId in nativeMemberCounts) {
      memberCounts.set(guildId, nativeMemberCounts[guildId])
    }
  };

  getMemberCounts (guildId) {
    return {
      members: memberCounts.get(guildId),
      membersOnline: onlineMemberCounts.get(guildId)
    }
  };
}(Dispatcher, {
  [ActionTypes.CONNECTION_OPEN]: handleConnectionOpen,
  [ActionTypes.GUILD_CREATE]: handleGuildCreate,
  [ActionTypes.GUILD_DELETE]: handleGuildDelete,
  [ActionTypes.GUILD_MEMBER_LIST_UPDATE]: handleGuildMemberListUpdate,
  [ActionTypes.ONLINE_GUILD_MEMBER_COUNT_UPDATE]: handleOnlineGuildMemberCountUpdate
})

function formatNumber (number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function GuildTooltipCounters (props) {
  MemberCountsStore.initialize()

  const { presenceCount, memberCount } = useStateFromStores([GuildInfoStore], () =>
    GuildInfoStore.getGuild(props.guild.id) ?? {}
  )
  const { members, membersOnline } = useStateFromStores([MemberCountsStore], () =>
    MemberCountsStore.getMemberCounts(props.guild.id)
  )

  const onlineDisplayed = props.settings.displayOnline && (membersOnline || presenceCount)
  const totalDisplayed = props.settings.displayTotal && (memberCount || members)

  return onlineDisplayed || totalDisplayed ? React.createElement(
    'div',
    {
      className: Selectors.Guild.guildDetail,
      style: props.isPopout ? {
        fontWeight: '600'
      } : {
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
            formatNumber(membersOnline ?? presenceCount)
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
            formatNumber(memberCount ?? members)
          )] : [])
      ]
    )
  ) : React.createElement('div')
}

const PRELOAD_DELAY = 200

module.exports = class BetterGuildTooltip {
  start () {
    this.patchGuildTooltip()

    this.preloadInProccess = false
    this.preloadNext = null
  }

  preloadGuild (guild) {
    if (!guild || this.preloadInProccess) return this.preloadNext = guild

    this._preloadGuild(guild)
    this.preloadInProccess = true
    setTimeout(() => {
      this.preloadInProccess = false
      this.preloadGuild(this.preloadNext)
      this.preloadNext = null
    }, PRELOAD_DELAY)
  }

  _preloadGuild (guild) {
    GuildActions.preload(
      guild.id,
      GuildChannelStore.getDefaultChannel(guild.id).id
    )
  }

  patchGuildTooltip () {
    const callback = (index, props = {}) => (self, [{ guild }], value) => {
      if (!this.settings.displayOnline && !this.settings.displayTotal) return
      if (this.settings.displayOnline && !onlineMemberCounts.has(guild.id)) this.preloadGuild(guild)
      value.props.children.splice(index, 0, React.createElement(GuildTooltipCounters, {
        guild,
        settings: this.settings, ...props
      }))
    }

    Patcher.after(...GuildTooltip, (self, _, value) => {
      if (!this.settings.displayOnline && !this.settings.displayTotal) return
      if (!value?.props?.text?.type) return

      Patcher.after(value.props.text, 'type', callback(1))
    })
  }

  stop () {
    Patcher.unpatchAll()
  }

  constructor () {
    this.defaultSettings = {
      displayOnline: true,
      displayTotal: true
    }

    this.settings = this.loadSettings(this.defaultSettings)

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
    return UI.buildSettingsPanel({
      onChange: () => this.saveSettings(),
      settings: [
        {
          type: 'switch',
          id: 'displayOnline',
          name: 'Display online count',
          note: 'Displays an online member count in the guild tooltip.',
          value: this.settings.displayOnline,
          onChange: e => this.settings.displayOnline = e
        },
        {
          type: 'switch',
          id: 'displayTotal',
          name: 'Display total count',
          note: 'Displays a total member count in the guild tooltip.',
          value: this.settings.displayTotal,
          onChange: e => this.settings.displayTotal = e
        }
      ]
    })
  }
}