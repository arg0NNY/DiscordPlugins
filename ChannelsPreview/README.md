# [ChannelsPreview](https://github.com/arg0NNY/DiscordPlugins/tree/master/ChannelsPreview) ![Status][status-official-badge] ![Version][channelspreview-version-badge] ![Downloads][channelspreview-downloads-badge] ![Likes][channelspreview-likes-badge]
Allows you to view recent messages in channels without switching to them.

![ChannelsPreview](https://user-images.githubusercontent.com/52377180/151410251-d8625b33-e011-4acf-a200-e050c9a6dd55.gif)

[![Download][download-badge]][channelspreview-download-link] [![View][view-badge]][channelspreview-view-link] [![Support][support-badge]][support-link]

[support-badge]: https://img.shields.io/badge/Support-%2343b581.svg?style=flat&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAC4UlEQVRYR8WXS4jNcRTHP195bEgWkoVsCAspNcVoLGblsaAoFCalBqU8BhuPPDZeQ5LBRmHBYsok7KYor5TyKDI2UiQLZWwojs6d351+85977+93J7q/uqt7Hp/fOed3zvmLzGNm44BWYAUwB5gafm7hc/i9AXqAXkk/c0wrJWRmU4BDwHpgQko+/N8PXAcOS/pSS6cqgJmNBfYBe4HxmY6LYj+AE8BxSb8q2agIEG7dDSwaoeOi2kNgVaVoDAMws7nAHWDaP3JeNvMRWC7pVWx3CEC4+bMM533AE+B5MDYfWADMTEA7RFMciUGAkPPeRNi9svcDnZL+xM7MbBSwCzgG+IupdjwdreWaiAEOAEdqKLrzZknlW1cUNTOPxqMExEFJR91ACSCE/n2i2vdIOpVTF2bWAZysIeuvY4anogxwAdhaQ8FzPjsOu5lNAjYFnSuSvpX1QzreJmqiS9I2hQ73NdFkrknaGDlw5x8iHW880wsQV4ENNS7lOpMdYClwNxHanZLORgBebKcLOrsldUYyO4AzCbvLHOAi0J4QbJd0OTJ+D1iSANgOnEvYveQA94HFCcHvgDv1M7GC80op6AK2JOw+cIB3GQ2kmh1/Oe6oWISjgdfArARAnwM4fb3D5jew0lu2JCs6MbOc8Lvaj5EC9EhygGHHzFqA2yFVqbZRAhhJCtok+TMbPGY2BmgDzie6YKxWSkFOERZvsk7SjehVbA4zwJeXek6pCHOeYdHoWkk3IwCHWVOP5yBbeoY5jahoO6cv5PCUGpGPzlQrLhpL9YUc5wOt2CXNLDWMKhn0ifYSWFieqjleI5mBYRQAvHhS4zi2/wJokdRvZk3A0zohho7jAJFaSGKADkmDw8jMfMtpriMCQxeSAOBreGolK/volrQ66Pm3wqc6umnllSxKRc5S6q34FvA4zPx5mbevvpRGb7pxa3kE4UXZmA+TCKJxn2ZxPhv2cVosqv/1ef4XvUY7+DQzteEAAAAASUVORK5CYII=
[support-link]: https://discord.gg/M8DBtcZjXD

[unavailable-badge]: https://img.shields.io/badge/Unavailable-gray?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAwUlEQVQ4y+WSMQ6CUBBEp7KlMzQmHEIuQOMl6K0JV6DjDF6CE9hwCxNJ6CggoYMQngX480O04Jc63c7M5s/+XenngE9KwZOBgScFKf5385EbI1uM3Dh+sl9oV8vMnZycO/PKtFy29phpFR+cDXvmsbITsW2PTJSGk4TPlSu+xInGRIvedo/aJE4kQjoAOkKJxGg13tKQWSMGEqWpSonAUrOlobKog0Rvql7iYKmV4wt7Z9j9Sw57cNi0wy05XOv/4AVxaK3CvM03egAAAABJRU5ErkJggg==
[view-badge]: https://img.shields.io/badge/View-blueviolet?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAwUlEQVQ4y+WSMQ6CUBBEp7KlMzQmHEIuQOMl6K0JV6DjDF6CE9hwCxNJ6CggoYMQngX480O04Jc63c7M5s/+XenngE9KwZOBgScFKf5385EbI1uM3Dh+sl9oV8vMnZycO/PKtFy29phpFR+cDXvmsbITsW2PTJSGk4TPlSu+xInGRIvedo/aJE4kQjoAOkKJxGg13tKQWSMGEqWpSonAUrOlobKog0Rvql7iYKmV4wt7Z9j9Sw57cNi0wy05XOv/4AVxaK3CvM03egAAAABJRU5ErkJggg==
[download-badge]: https://img.shields.io/badge/Download-%233a71c1.svg?style=flat&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAgCAYAAAAIXrg4AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAd5gAAHeYBMKt3fAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAE9SURBVEiJ7ZQ7TsNAFEWv06IAShOkEDD5UNCwB8RCWEYWAqkIYiEgZQERoqLgFz4hUIaC+tCM4cmyk4mxCyRfaSRL8+49781YI3kKOASmwBtw4OvzFnDJry58fZUlGGvme70IQCaVgBLwXwBADegDp0AjaxjQAAbACVCzG+fmGRgDYYJ5ZGpGCfuh80Ya/EwgqWpqQ0lDoLVE5y1JQ+eNVLUFXfdSWr0A7UUTAG1XazUFuvEudoFJrPAd2EsDuMZeY56PyJM0aqohDljU0Lzz7KSMbMMmJB9px/fStoFH/PWMuS9fyBbw4Bnu/cclQe7nhD8BO5nCDaQJ3CWEj/8cbiAbwI0JvwU2cwk3kDpw7FY91/BShSoAmpKOJK3knP0l6SwAriXt5xwe6SoAPiWtFgSYVST1JM2KCJfU+wadgFl0/0HGbQAAAABJRU5ErkJggg==

[status-unofficial-badge]: https://img.shields.io/badge/status-unofficial-red
[status-review-badge]: https://img.shields.io/badge/status-review-yellow
[status-official-badge]: https://img.shields.io/badge/status-official-brightgreen

[channelspreview-download-link]: https://arg0nny.github.io/bd/download/?id=ChannelsPreview
[channelspreview-view-link]: https://betterdiscord.app/plugin/ChannelsPreview
[channelspreview-version-badge]: https://img.shields.io/badge/version-1.4.2-blue
[channelspreview-downloads-badge]: https://img.shields.io/badge/dynamic/json?color=brightgreen&label=downloads&query=%24%5B%3F%28%40.name%3D%3D%27ChannelsPreview%27%29%5D.downloads&url=https%3A%2F%2Fapi.betterdiscord.app%2Fv1%2Fstore%2Fplugins
[channelspreview-likes-badge]: https://img.shields.io/badge/dynamic/json?color=green&label=likes&query=%24%5B%3F%28%40.name%3D%3D%27ChannelsPreview%27%29%5D.likes&url=https%3A%2F%2Fapi.betterdiscord.app%2Fv1%2Fstore%2Fplugins
