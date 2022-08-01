/**
 * @name PasscodeLock
 * @author arg0NNY
 * @authorLink https://github.com/arg0NNY/DiscordPlugins
 * @invite M8DBtcZjXD
 * @version 1.3.0
 * @description Protect your Discord with a passcode.
 * @website https://github.com/arg0NNY/DiscordPlugins/tree/master/PasscodeLock
 * @source https://github.com/arg0NNY/DiscordPlugins/blob/master/PasscodeLock/PasscodeLock.plugin.js
 * @updateUrl https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/PasscodeLock/PasscodeLock.plugin.js
 */

module.exports = (() => {
    const config = {
        "info": {
            "name": "PasscodeLock",
            "authors": [
                {
                    "name": "arg0NNY",
                    "discord_id": '224538553944637440',
                    "github_username": 'arg0NNY'
                }
            ],
            "version": "1.3.0",
            "description": "Protect your Discord with a passcode.",
            github: "https://github.com/arg0NNY/DiscordPlugins/tree/master/PasscodeLock",
            github_raw: "https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/PasscodeLock/PasscodeLock.plugin.js"
        },
        "changelog": [
            {
                "type": "added",
                "title": "What's new",
                "items": [
                    "The plugin now has the following localizations: English, Russian, Ukrainian, Dutch, French, German, Spanish. You can help translate the plugin into your language on the Crowdin page, which can be found at the bottom of the plugin settings.",
                ]
            }
        ]
    };

    const electron = require("electron");
    const request = require("request");
    const fs = require("fs");
    const path = require("path");
    const crypto = require("crypto")

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
                DiscordModules,
                WebpackModules,
                PluginUtilities,
                Settings,
                DOMTools,
                Toasts,
                ReactComponents
            } = Api;

            const {
                React,
                ReactDOM,
                ModalActions,
                ConfirmationModal
            } = DiscordModules;

            const Selectors = {
                Chat: WebpackModules.getByProps("title", "chat"),
                HeaderBar: WebpackModules.getByProps("iconWrapper", "clickable"),
                App: WebpackModules.getByProps('mobileApp'),
                Modals: WebpackModules.getByProps('root', 'small')
            };

            const Gifs = {
                LOCKED_INTRO: 'https://i.imgur.com/8cw428V.gif',
                LOCKED_SHAKE: 'https://i.imgur.com/PCJ1EoO.gif',
                SETTINGS_INTRO: 'https://i.imgur.com/4N8QZ2o.gif',
                SETTINGS_ROTATE: 'https://i.imgur.com/v74rA2L.gif',
                EDIT_INTRO: 'https://i.imgur.com/NrhmZym.gif',
                EDIT_ACTION: 'https://i.imgur.com/VL5UV1X.gif'
            };
            Object.keys(Gifs).forEach(k => fetch(Gifs[k])); // Preload gifs

            const buildAnimatedIcon = (src, width = 24, height = width) => {
                const icon = document.createElement('img');
                icon.alt = 'PCLIcon';
                icon.width = width;
                icon.height = height;
                icon.src = src;
                icon.style.opacity = '0';

                setTimeout(() => {
                    icon.style.opacity = '1';
                    icon.src = src;
                }, 0);

                return icon;
            };

            const hashCode = string => {
                let salt = crypto.randomBytes(128).toString('base64');
                let iterations = 10000;
                let hash = crypto.pbkdf2Sync(string, salt, iterations, 512, 'sha512').toString('hex');

                return { hash, salt, iterations };
            };

            const hashCheck = ({ string, salt, iterations }, hashed) => crypto.pbkdf2Sync(string, salt, iterations, 512, 'sha512').toString('hex') === hashed;

            const HeaderBar = WebpackModules.getModule(m => m.default?.displayName === 'HeaderBar');
            const Button = WebpackModules.getByProps("BorderColors", "Colors");
            const ButtonColors = WebpackModules.getByProps('ButtonLink').ButtonColors;
            const Tooltip = WebpackModules.getModule(m => m.default?.displayName === 'Tooltip');
            const Keybinds = WebpackModules.getByProps('combokeys', 'disable');
            const Markdown = WebpackModules.getModule(m => m.displayName === "Markdown" && m.rules);
            const LanguageStore = WebpackModules.getModule(m => m.Messages && m.Messages.IMAGE && m);

            const { getVoiceChannelId } = WebpackModules.getByProps("getVoiceChannelId");

            // Help translate the plugin on the Crowdin page: https://crwd.in/betterdiscord-passcodelock
            const Locale = new class {

                constructor() {
                    this._names = ['ENTER_PASSCODE', 'ENTER_NEW_PASSCODE', 'RE_ENTER_PASSCODE', 'EDIT_PASSCODE', 'LOCK_DISCORD', 'CODE_TYPE_SETTING', '4DIGIT_NCODE', '6DIGIT_NCODE', 'CUSTOM_NCODE', 'AUTOLOCK_SETTING', 'AUTOLOCK_DESC', 'AUTOLOCK_DISABLED', 'AUTOLOCK_1M', 'AUTOLOCK_5M', 'AUTOLOCK_1H', 'AUTOLOCK_5H', 'LOCK_KEYBIND_SETTING', 'ALWAYS_LOCK_SETTING', 'ALWAYS_LOCK_DESC', 'HIGHLIGHT_TYPING_SETTING', 'HIGHLIGHT_TYPING_DESC', 'NOTIFICATIONS_SETTING', 'NOTIFICATIONS_SETTING_DISABLE', 'NOTIFICATIONS_SETTING_CENSOR', 'NEW_NOTIFICATION', 'NEW_NOTIFICATION_DESC', 'FIRST_SETUP_MESSAGE', 'PASSCODE_UPDATED_MESSAGE', 'PASSCODE_RESET_DEFAULT_MESSAGE', 'PASSCODE_RESET_SECURITY_UPDATE_MESSAGE', 'ATTENTION_MESSAGE'];
                    this.raw = {
                        'en': ["Enter your Discord passcode", "Enter your new passcode", "Re-enter your passcode", "Edit Passcode", "Lock Discord", "Code type", "4-Digit Numeric Code", "6-Digit Numeric Code", "Custom Numeric Code", "Auto-lock", "Require passcode if away for a time.", "Disabled", "in 1 minute", "in 5 minutes", "in 1 hour", "in 5 hours", "Lock keybind", "Always lock on startup", "Locks Discord at startup, even if it wasn't locked before Discord shut down", "Highlight keyboard typing", "Highlights buttons on screen when typing passcode from the keyboard", "Notifications when locked", "Disable notifications", "Censor notifications", "New notification", "You have 1 new notification!", "Please first set up the passcode in the plugin settings.", "Passcode has been updated!", "Your passcode has been reset. Set it up again.", "Your passcode has been reset due to security update. Set it up again in the settings.", "### ATTENTION PLEASE!\n\nThis plugin **DOES** prevent people who are casually snooping, **BUT** if anyone has access to the computer with Discord logged in and is actually determined to get access to it, there's nothing PasscodeLock can do within the scope of a BD plugin to prevent them.\n\nThe real solution from a security perspective is just... lock or log out of your computer when you're not at it. *(c) Qwerasd*"],
                        'ru': ["Введите ваш код Discord", "Введите ваш новый код", "Повторно введите ваш код", "Изменить код", "Заблокировать Discord", "Тип кода", "4-значный код", "6-значный код", "Код произвольной длины", "Автоблокировка", "Запросить ввод кода после периода неактивности.", "Отключено", "через 1 минуту", "через 5 минут", "через 1 час", "через 5 часов", "Горячая клавиша блокировки", "Всегда блокировать при запуске", "Заблокировать Discord при запуске, даже если он не был заблокирован до отключения Discord", "Подсвечивать кнопки клавиатуры", "Подсвечивать кнопки на экране при вводе кода с клавиатуры", "Уведомления при блокировке", "Отключить уведомления", "Скрыть содержимое уведомления", "Новое уведомление", "У вас 1 новое уведомление!", "Для начала установите свой код в настройках плагина.", "Код был изменён!", "Ваш код был сброшен. Установите его снова.", "Ваш код был сброшен из-за обновления безопасности. Установите его снова в настройках плагина.", "### ВНИМАНИЕ!\n\nЭтот плагин **ДЕЙСТВИТЕЛЬНО** предотвратит доступ для людей, которые небрежно отслеживали ваши сообщения, **НО** если кто-то имеет доступ к вашей учетной записи пользователя компьютера с авторизованой учетной записью Discord, и действительно настроен получить доступ к аккаунту, то PasscodeLock ничего не сможет сделать, в рамках плагина для BD, чтобы предотвратить доступ к аккаунту.\n\nРеальное решение с точки зрения безопасности — это просто... выйти из учетной записи или заблокировать компьютер, когда вы им не пользуетесь. *(c) Qwerasd*"],
                        'nl': ["Voer je Discord toegangscode in", "Voer je nieuwe toegangscode in", "Voer je toegangscode opnieuw in", "Toegangscode bewerken", "Discord vergrendelen", "Soort code", "4-cijferige code", "6-cijferige code", "Bepaal eigen lengte", "Automatisch vergrendelen", "Vereis toegangscode als je een tijdje weg bent.", "Uitgeschakeld", "na 1 minuut", "na 5 minuten", "na 1 uur", "na 5 uur", "Toetsencombinatie om te vergrendelen", "Altijd vergrendelen bij het opstarten", "Vergrendelt Discord bij het opstarten, zelfs als het niet vergrendeld was voordat Discord afsluit", "Toetsaanslagen weergeven", "Toont de toetsaanslagen bij het invoeren van de code", "Meldingen wanneer vergrendeld", "Meldingen uitschakelen", "Meldingen censureren", "Nieuwe melding", "Je hebt 1 nieuwe melding!", "Stel eerst de toegangscode in de plug-in-instellingen in.", "Toegangscode is bijgewerkt!", "Je toegangscode is gereset. Stel het opnieuw in.", "Je toegangscode is gerest vanwege een beveiligingsupdate. Stel het opnieuw in in de instellingen.", "### LET OP!\n\n**JA**, deze plugin houd mensen tegen die gewoon even rondsnuffelen op je pc. **MAAR**, als iemand met een beetje technische ervaring toegang heeft tot de pc waarmee je bent ingelogd op Discord, dan kan een BD-plugin als PasscodeLock niets doen om diegene tegen te houden.\n\nDe echte oplossing voor je veiligheid is het vergrendelen/uitloggen van je computer als je die niet aan het gebruiken bent. *(c) Qwerasd*"],
                        'fr': ["Entrez votre code d'accès Discord", "Entrez votre nouveau code", "Resaisissez votre code", "Modifier le code d'accès", "Verrouiller Discord", "Type de code", "Code de numéro à 4 chiffres", "Code de numéro à 6 chiffres", "Code numérique personnalisé", "Verrouillage automatique", "Code d'accès requis en cas d'absence après un certain temps.", "Désactivé", "dans 1 minute", "dans 5 minutes", "dans 1 heure", "dans 5 heures", "Verrouillage des touches", "Toujours verrouiller au démarrage", "Verrouille Discord au démarrage, même si ce n'est pas verrouillé avant l'arrêt de Discord", "Mettre en surbrillance la saisie clavier", "Surligne les boutons sur l'écran lors de la saisie du code d'accès avec le clavier", "Notifications lorsque verrouillé", "Désactiver les notifications", "Notifications censurées", "Nouvelle notification", "Vous avez 1 nouvelle notification!", "Veuillez d'abord configurer le mot de passe dans les paramètres du plugin.", "Le code d'accès a été mis à jour !", "Votre code d'accès a été réinitialisé. Veuillez le configurer à nouveau.", "Votre code d'accès a été réinitialisé en raison de la mise à jour de sécurité. Configurez-le à nouveau dans les paramètres.", "### ATTENTION SVP!\n\nCe plugin empêche les personnes qui fouinent par hasard, **MAIS** si quelqu'un a accès à l'ordinateur sur lequel Discord est connecté et est déterminé à y accéder, PasscodeLock ne peut rien faire dans le cadre d'un plugin BD pour l'en empêcher.\n\nLa vraie solution du point de vue de la sécurité est simplement... de verrouiller ou de déconnecter votre ordinateur lorsque vous n'y êtes pas. *(c) Qwerasd*"],
                        'de': ["Gib deinen Discord Zugangscode ein", "Gib deinen neuen Discord Zugangscode ein", "Gib deinen Discord Zugangscode erneut ein", "Zugangscode bearbeiten", "Discord sperren", "Code Typ", "4 Zahlen Code", "6 Zahlen Code", "Zugangscode beliebiger Länge", "Automatisch sperren", "Sperrt Discord, falls du für angegeben Zeit inaktiv bist.", "Deaktiviert", "Nach 1 Minute", "Nach 5 Minuten", "Nach 1 Stunde", "Nach 5 Stunden", "Tastenkombination zum Sperren", "Beim Start immer sperren", "Sperrt Discord beim Start, auch wenn Discord beim Schließen nicht gesperrt war", "Tastatureingabe anzeigen", "Zeigt die Tastatureingabe beim Eingeben des Codes an", "Benachrichtigungen während Discord gesperrt ist", "Benachrichtigungen deaktivieren", "Benachrichtigungen zensieren", "Neue Benachrichtigung", "Du hast eine Benachrichtigung!", "Bitte richte zuerst den Zugangscode in den Plugin-Einstellungen ein.", "Zugangscode wurde aktualisiert!", "Dein Zugangscode wurde zurückgesetzt. Richte ihn erneut ein.", "Dein Zugangscode wurde aufgrund eines Sicherheitsupdates zurückgesetzt. Richte ihn in den Plugin-Einstellungen erneut ein.", "### Achtung!\n\nDiese Plugin schützt nur Oberflächlich. Wenn jemand Zugriff auf den PC, auf dem du mit Discord angemeldet bist hat, sowie technische Erfahrung hat, gibt es nichts was ein BD-Plugin tun kann um den Zugriff zu verhindern.\n\nDie richtige Lösung für echte Sicherheit ist den PC zu sperren oder dich abzumelden. *(c) Qwerasd*"],
                        'es-ES': ["Introduce tu código de acceso de Discord", "Introduzca su nuevo código de acceso", "Vuelva a introducir su código de acceso", "Editar código de acceso", "Cerradura Discord", "Tipo de código", "Código de 4 dígitos", "Código de 6 dígitos", "Código numérico personalizado", "Cierre automático", "Requiere código de acceso si se ausenta por un tiempo.", "Desactivado", "en 1 minuto", "en 5 minutos", "en 1 hora", "en 5 horas", "Cerrar la tecla", "Bloqueo siempre al arrancar", "Bloquea Discord al iniciar, incluso si no estaba bloqueado antes de que Discord se apagara", "Resaltar la escritura al introducir el código", "Resalta los botones en la pantalla al escribir el código de acceso desde el teclado", "Notificaciones cuando se bloquea", "Desactivar las notificaciones", "Censurar las notificaciones", "Nueva notificación", "¡Tienes 1 nueva notificación!", "Por favor, primero configure el código de acceso en la configuración del plugin.", "El código de acceso ha sido actualizado!", "Tu código de acceso ha sido restablecido. Configúrala de nuevo.", "Tu código de acceso se ha restablecido debido a una actualización de seguridad. Vuelve a configurarlo en los ajustes.", "### ¡ATENCIÓN POR FAVOR!\n\nEste plugin **SÍ** evita que la gente husmee casualmente, **PERO** si alguien tiene acceso al ordenador con Discord conectado y está realmente decidido a acceder a él, no hay nada que PasscodeLock pueda hacer dentro del ámbito de un plugin de BD para evitarlo.\n\nLa verdadera solución, desde el punto de vista de la seguridad, es simplemente... bloquear o cerrar la sesión de tu ordenador cuando no estés en él. *(c) Qwerasd*"],
                        'uk': ["Введіть свій пароль Discord", "Введіть новий пароль", "Повторно введіть пароль", "Редагувати пароль", "Заблокувати Discord", "Тип коду", "4-значний цифровий код", "6-значний цифровий код", "Користувальницький цифровий код", "Автоблокування", "Запитувати код доступу при відсутності вас протягом певного часу.", "Вимкнено", "через 1 хвилину", "через 5 хвилин", "через 1 годину", "через 5 годин", "Клавіша блокування", "Завжди блокувати при запуску", "Замки Discord під час запуску, навіть якщо вони не були заблоковані до закриття Discord", "Підсвічувати клавіатуру введення", "Підсвічує кнопки на екрані під час введення паролю з клавіатури", "Сповіщення при заблокованому екрані", "Вимкнути сповіщення", "Цензорні сповіщення", "Нове сповіщення", "У вас є 1 нове сповіщення!", "Спочатку налаштуйте пароль в налаштуваннях плагіна.", "Пароль оновлений!", "Ваш пароль був скинутий. Налаштуйте його знову.", "Ваш пароль було скинуто через оновлення безпеки. Налаштуйте його знову в налаштуваннях.", "### УВАГА!\n\nЦей плагін не дозволяє стороннім людям, які поступово сопіють, **Якщо** будь-хто має доступ до комп'ютера з компанією Discord увійти в систему, і він насправді налаштований отримати доступ до нього, немає жодного PasscodeLock для запобігання їх формату.\n\nСправжнє рішення з точки зору безпеки є справедливим... блокування чи вихід з вашого комп'ютера, коли ви не на нього. *(c) Qwerasd*"],
                        'ja': ["パスコードを入力してください", "新しいパスコードを入力してください", "もう一度入力してください", "パスコードの編集", "Discordのロック", "ロックタイプ", "4桁の数字", "6桁の数字", "任意の数字", "自動ロック", "離席時にパスコードを要求", "無効", "1分間", "5分間", "1時間", "5時間", "キーバインド", "起動時にロックする", "Discord終了時にロックされていなくても、起動時にロックする", "キーボード入力を強調する", "キーボードからパスコードを入力する時、画面上のボタンを強調する", "ロック中の通知", "通知を無効化", "通知内容を非表示にする", "PasscodeLock", "新しい通知があります", "プラグインの設定画面からパスコードの初期設定を行ってください。", "パスコードは正常に変更されました", "パスコードがリセットされました。再設定をしてください。", "セキュリティアップデートのため、パスコードがリセットされました。再設定してください。", "### 注意!\n\nこのプラグインは**ちょっとした**覗き見を防ぐためのものです。 **従って**、BDプラグインの範囲では、Discordにログインしている端末に物理的に触れる人間からは防ぎようがありません。\n\nセキュリティ上の観点から、他人にDisocrdを見られたくないときは、PCをロックするか、ログアウトすることが望ましいです。 *(c) Qwerasd*"]
                    }

                    this.lang = this.generateDict(this._names, this.raw);
                }

                generateDict(names, raw) {
                    const dict = {};

                    for (const key in raw) {
                        dict[key] = {};
                        raw[key].forEach((value, i) => {
                            dict[key][names[i]] = value;
                        });
                    }

                    return dict;
                }

                getCurrentLocale() {
                    return (LanguageStore.getLocale() || LanguageStore.chosenLocale || LanguageStore._chosenLocale || "en").replace("en-US", "en").replace("en-GB", "en");
                }

                get current() {
                    return this.lang[this.getCurrentLocale()] ?? this.lang["en"];
                }

            }();

            const BG_TRANSITION = 350;
            const MAX_CODE_LENGTH = 15;
            var CODE_LENGTH = 4;

            const getContainer = () => document.querySelector(`.${Selectors.App.app}`);
            const getContainerAsync = async () => {
                return getContainer() ?? await new Promise(res => {
                    let container;
                    const intId = setInterval(() => {
                        if (!(container = getContainer())) return;
                        clearInterval(intId);
                        res(container);
                    });
                })
            };

            class PasscodeBtn extends React.Component {
                render() {
                    return React.createElement(
                        'div',
                        {
                            className: 'PCL--btn PCL--animate',
                            onClick: this.props.click ? () => this.props.click(this.props.number) : () => {},
                            id: `PCLBtn-${this.props.code ?? this.props.number}`
                        },
                        (!this.props.children ? [
                            React.createElement(
                                'div',
                                { className: 'PCL--btn-number' },
                                this.props.number
                            ),
                            React.createElement(
                                'div',
                                { className: 'PCL--btn-dec' },
                                this.props.dec
                            )
                        ] : this.props.children)
                    );
                }
            }

            class PasscodeLocker extends React.Component {
                static Types = {
                    DEFAULT: 'default',
                    SETTINGS: 'settings',
                    EDITOR: 'editor'
                }

                get e() { return document.getElementById(this.props.plugin.getName()); }
                get bg() { return this.e.querySelector('.PCL--layout-bg'); }
                get button() { return this.props.button ?? document.getElementById('PCLButton'); }
                get buttonPos() { return this.button && document.body.contains(this.button) ? this.button.getBoundingClientRect() : { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }; }
                get containerPos() { return getContainer().getBoundingClientRect() }

                backspaceButton() {
                    return React.createElement(PasscodeBtn, {
                        click: this.codeBackspace,
                        code: 'Backspace',
                        children: React.createElement(
                            'svg',
                            {
                                xmlns: 'http://www.w3.org/2000/svg',
                                viewBox: '0 0 24 24',
                                height: '22',
                                width: '22'
                            },
                            React.createElement('path', { fill: 'currentColor', d: 'M22 3H7c-.69 0-1.23.35-1.59.88L.37 11.45c-.22.34-.22.77 0 1.11l5.04 7.56c.36.52.9.88 1.59.88h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3.7 13.3c-.39.39-1.02.39-1.41 0L14 13.41l-2.89 2.89c-.39.39-1.02.39-1.41 0-.39-.39-.39-1.02 0-1.41L12.59 12 9.7 9.11c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0L14 10.59l2.89-2.89c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41L15.41 12l2.89 2.89c.38.38.38 1.02 0 1.41z' })
                        )
                    })
                }

                buildCancelButton() {
                    if([PasscodeLocker.Types.SETTINGS, PasscodeLocker.Types.EDITOR].includes(this.props.type)) {
                        return React.createElement(PasscodeBtn, {
                            click: () => this.unlock(false),
                            code: 'Escape',
                            children: React.createElement(
                                'svg',
                                {
                                    xmlns: 'http://www.w3.org/2000/svg',
                                    viewBox: '0 0 24 24',
                                    height: '30',
                                    width: '30'
                                },
                                React.createElement('path', { fill: 'currentColor', d: 'M19 11H7.83l4.88-4.88c.39-.39.39-1.03 0-1.42-.39-.39-1.02-.39-1.41 0l-6.59 6.59c-.39.39-.39 1.02 0 1.41l6.59 6.59c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L7.83 13H19c.55 0 1-.45 1-1s-.45-1-1-1z' })
                            )
                        });
                    } else if (CODE_LENGTH === -1) {
                        return this.backspaceButton();
                    } else {
                        return React.createElement('div')
                    }
                }

                buildBackspaceButton() {
                    if([PasscodeLocker.Types.SETTINGS, PasscodeLocker.Types.EDITOR].includes(this.props.type) || CODE_LENGTH !== -1) {
                        return this.backspaceButton();
                    } else {
                        return this.buildEnterButton();
                    }
                }

                buildEnterButton() {
                    return React.createElement(PasscodeBtn, {
                        click: () => this.codeAccept(),
                        code: 'Enter',
                        children: React.createElement(
                            'svg',
                            {
                                xmlns: 'http://www.w3.org/2000/svg',
                                viewBox: '0 0 48 48',
                                height: '34',
                                width: '34'
                            },
                            React.createElement('path', { fill: 'none', d: 'M0 0h24v24H0V0z' }),
                            React.createElement('path', { fill: 'currentColor', d: 'M21.05 28.55 16.15 23.65Q15.7 23.2 15.05 23.2Q14.4 23.2 13.9 23.7Q13.4 24.2 13.4 24.85Q13.4 25.5 13.9 25.95L20 32.05Q20.45 32.5 21.05 32.5Q21.65 32.5 22.1 32.05L34.1 20.05Q34.55 19.6 34.525 18.95Q34.5 18.3 34.05 17.85Q33.6 17.35 32.925 17.35Q32.25 17.35 31.75 17.85ZM24 44Q19.75 44 16.1 42.475Q12.45 40.95 9.75 38.25Q7.05 35.55 5.525 31.9Q4 28.25 4 24Q4 19.8 5.525 16.15Q7.05 12.5 9.75 9.8Q12.45 7.1 16.1 5.55Q19.75 4 24 4Q28.2 4 31.85 5.55Q35.5 7.1 38.2 9.8Q40.9 12.5 42.45 16.15Q44 19.8 44 24Q44 28.25 42.45 31.9Q40.9 35.55 38.2 38.25Q35.5 40.95 31.85 42.475Q28.2 44 24 44ZM24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24Q24 24 24 24ZM24 41Q31.25 41 36.125 36.125Q41 31.25 41 24Q41 16.75 36.125 11.875Q31.25 7 24 7Q16.75 7 11.875 11.875Q7 16.75 7 24Q7 31.25 11.875 36.125Q16.75 41 24 41Z' })
                        )
                    })
                }

                calculatePosition() {
                    const buttonPos = this.buttonPos;
                    return {
                        top: buttonPos.top + buttonPos.height/2 - this.containerPos.top,
                        left: buttonPos.left + buttonPos.width/2 - this.containerPos.left
                    };
                }

                calculateRadius(pos) {
                    pos = pos ?? this.calculatePosition();

                    return Math.hypot(Math.max(pos.top, this.containerPos.height - pos.top), Math.max(pos.left, this.containerPos.width - pos.left));
                }

                constructor(props) {
                    super(props);

                    this.state = {
                        code: '',
                        confirm: false
                    };

                    this.codeAppend = (num) => {
                        if(this.state.code.length >= MAX_CODE_LENGTH) {
                            const dots = document.querySelector(".PCL--dots");
                            if(!dots.classList.contains("PCL--dots--limit")) {
                                dots.classList.add("PCL--dots--limit");
                                setTimeout(() => {
                                    dots?.classList.remove("PCL--dots--limit");
                                }, 250);
                            }
                            return;
                        }
                        this.setState({
                            code: this.state.code + num.toString()
                        });

                        setTimeout(() => {
                            if(CODE_LENGTH === this.state.code.length)
                                this.codeAccept();
                        });
                    }

                    this.codeAccept = () => {
                        if (this.props.type === PasscodeLocker.Types.EDITOR) {
                            if (!this.state.confirm) {
                                this.newCode = this.state.code;
                                this.setState({
                                    code: '',
                                    confirm: true
                                });
                                if (this.icon) this.icon.src = Gifs.EDIT_ACTION;
                            }
                            else {
                                if (this.state.code !== this.newCode) this.fail();
                                else this.unlock(true);
                            }
                        }
                        else this.codeSubmit();
                    }

                    this.codeBackspace = () => {
                        this.setState({
                            code: this.state.code.slice(0, -1)
                        });
                    }
                }

                codeSubmit() {
                    if (hashCheck({
                        string: this.state.code,
                        salt: this.props.plugin.settings.salt,
                        iterations: this.props.plugin.settings.iterations
                    }, this.props.plugin.settings.hash))
                        this.unlock();
                    else
                        this.fail();
                }

                fail() {
                    this.setState({
                        code: '',
                    });

                    if (this.icon) this.icon.src = {
                        [PasscodeLocker.Types.DEFAULT]: Gifs.LOCKED_SHAKE,
                        [PasscodeLocker.Types.SETTINGS]: Gifs.SETTINGS_ROTATE,
                        [PasscodeLocker.Types.EDITOR]: Gifs.EDIT_ACTION
                    }[this.props.type];
                }

                unlock(success = true) {
                    this.e.querySelector('.PCL--controls').style.opacity = 0;
                    this.bgCircle(false);

                    setTimeout(() => this.bg.style.transition = null, 50);
                    setTimeout(() => {
                        this.bg.style.transform = null;

                        const listener = () => {
                            this.bg.removeEventListener('webkitTransitionEnd', listener);

                            setTimeout(() => {
                                this.props.plugin.unlock(true);
                                if (success && this.props.onSuccess) return this.props.onSuccess(this);
                                if (success && this.props.type === PasscodeLocker.Types.EDITOR) return this.props.plugin.updateCode(this.newCode);
                            }, 50);
                        };
                        this.bg.addEventListener('webkitTransitionEnd', listener);
                    }, 100);
                }

                bgCircle(smooth = true) {
                    const bg = this.bg;
                    const pos = this.calculatePosition();
                    const d = this.calculateRadius(pos) * 2;

                    if (smooth) bg.style.transition = null;
                    bg.style.top = pos.top + 'px';
                    bg.style.left = pos.left + 'px';
                    bg.style.width = d + 'px';
                    bg.style.height = d + 'px';
                    bg.style.transform = 'translate(-50%, -50%) scale(1)';
                    bg.style.borderRadius = '50%';
                }

                bgFill() {
                    const bg = this.bg;
                    bg.style.transition = 'none';
                    bg.style.top = 0;
                    bg.style.left = 0;
                    bg.style.width = '100%';
                    bg.style.height = '100%';
                    bg.style.borderRadius = 0;
                    bg.style.transform = 'scale(1)';
                }

                componentWillUnmount() {
                    window.removeEventListener('keyup', this.keyUpListener);
                    window.removeEventListener('keydown', this.disableKeys, true);
                    if (this.props.type === PasscodeLocker.Types.DEFAULT) this.enableNotifications();
                }

                componentDidMount() {
                    document.onkeydown = e => {
                        if (this.props.plugin.settings.highlightButtons) document.getElementById(`PCLBtn-${e.key}`)?.classList.add('PCL--btn-active');

                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    };

                    this.keyUpListener = e => {
                        if (this.props.plugin.settings.highlightButtons) document.getElementById(`PCLBtn-${e.key}`)?.classList.remove('PCL--btn-active');

                        if (!isNaN(+e.key) && e.key !== ' ') this.codeAppend(+e.key);
                        if (e.key === 'Backspace') this.codeBackspace();
                        if (e.key === 'Escape' && this.props.type !== PasscodeLocker.Types.DEFAULT) this.unlock(false);
                    };
                    window.addEventListener('keyup', this.keyUpListener);

                    // Manage notifications
                    if (this.props.type === PasscodeLocker.Types.DEFAULT) this.enableNotifications = this.props.plugin.settings.hideNotifications
                        ? Patcher.instead(DiscordModules.NotificationModule, 'showNotification', () => false)
                        : Patcher.before(DiscordModules.NotificationModule, 'showNotification', (self, params) => {
                            params[0] = Gifs.LOCKED_SHAKE;
                            params[1] = Locale.current.NEW_NOTIFICATION;
                            params[2] = Locale.current.NEW_NOTIFICATION_DESC;
                            if (params[4].onClick) params[4].onClick = () => {};
                        });

                    // Props to https://github.com/253ping
                    this.disableKeys = e => {
                        // Didn't know that there is more than one shortcut.
                        if(e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "C" )) {e.preventDefault(); e.stopPropagation();}
                        else if(e.ctrlKey) {e.preventDefault(); e.stopPropagation(); return false;} // Prevent all sorts of shortcuts like bold, italic, underline, strikethrough, ...
                        else if (e.key === "Enter") {
                            e.preventDefault();
                            e.stopPropagation();
                            if (this.props.plugin.settings.highlightButtons) document.getElementById('PCLBtn-Enter')?.classList.add('PCL--btn-active');
                            this.codeAccept();
                            return false;
                        }
                    }
                    window.addEventListener('keydown', this.disableKeys, true);

                    setTimeout(() => {
                        this.bgCircle();

                        const i = setInterval(() => {
                            const bgPos = this.bg.getBoundingClientRect();
                            const top = bgPos.top + bgPos.height/2;
                            const left = bgPos.left + bgPos.width/2;
                            const radius = bgPos.width/2;

                            Array.from(document.querySelectorAll('.PCL--animate:not(.PCL--animated)')).forEach(e => {
                                const pos = e.getBoundingClientRect();
                                const centerTop = pos.top + pos.height/2;
                                const centerLeft = pos.left + pos.width/2;

                                if (Math.hypot(Math.abs(centerTop - top), Math.abs(centerLeft - left)) <= radius) {
                                    if (e.className.includes('PCL--icon')) {
                                        e.appendChild(
                                            this.icon = buildAnimatedIcon({
                                                [PasscodeLocker.Types.DEFAULT]: Gifs.LOCKED_INTRO,
                                                [PasscodeLocker.Types.SETTINGS]: Gifs.SETTINGS_INTRO,
                                                [PasscodeLocker.Types.EDITOR]: Gifs.EDIT_INTRO
                                            }[this.props.type], 64)
                                        );

                                        e.classList.remove('PCL--animate');
                                    }
                                    else e.classList.add('PCL--animated');
                                }
                            });
                        }, 10);

                        const listener = () => {
                            this.bg.removeEventListener('webkitTransitionEnd', listener);

                            clearInterval(i);
                            Array.from(document.querySelectorAll('.PCL--animate')).forEach(e => e.classList.remove('PCL--animate', 'PCL--animated'));
                            this.bgFill();
                        };
                        this.bg.addEventListener('webkitTransitionEnd', listener);
                    }, 100);
                }

                render() {
                    const btns = ['', 'ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ'].map(
                        (dec, i) => React.createElement(
                            PasscodeBtn,
                            {
                                number: i + 1,
                                dec,
                                click: this.codeAppend
                            }
                        )
                    );

                    const titleText = () => {
                        if (this.props.type === PasscodeLocker.Types.EDITOR) return !this.state.confirm ? Locale.current.ENTER_NEW_PASSCODE : Locale.current.RE_ENTER_PASSCODE;
                        return Locale.current.ENTER_PASSCODE;
                    };

                    return React.createElement(
                        'div',
                        {
                            id: this.props.plugin.getName(),
                            className: 'PCL--layout'
                        },
                        [
                            React.createElement(
                                'div',
                                { className: 'PCL--layout-bg' }
                            ),
                            React.createElement(
                                'div',
                                { className: 'PCL--controls' },
                                [
                                    React.createElement(
                                        'div',
                                        { className: 'PCL--header' },
                                        [
                                            React.createElement(
                                                'div',
                                                { className: 'PCL--icon PCL--animate' }
                                            ),
                                            React.createElement(
                                                'div',
                                                { className: 'PCL--title PCL--animate' },
                                                titleText()
                                            ),
                                            React.createElement(
                                                'div',
                                                { className: 'PCL--dots PCL--animate' },
                                                Array(MAX_CODE_LENGTH).fill(null).map((_, i) => {
                                                    return React.createElement(
                                                        'div',
                                                        { className: `PCL--dot ${i < this.state.code.length ? 'PCL--dot-active' : ''}` }
                                                    );
                                                })
                                            )
                                        ]
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: 'PCL--buttons' },
                                        [
                                            React.createElement('div', { className: 'PCL--divider PCL--animate' }),
                                            ...btns,
                                            this.buildCancelButton(),
                                            React.createElement(PasscodeBtn, { number: 0, dec: '+', click: this.codeAppend }),
                                            this.buildBackspaceButton(),
                                            ...([PasscodeLocker.Types.SETTINGS, PasscodeLocker.Types.EDITOR].includes(this.props.type) && CODE_LENGTH === -1 ?
                                                [React.createElement('div'), this.buildEnterButton()]
                                                : [])
                                        ]
                                    ),
                                ]
                            )
                        ]
                    )
                }
            }

            const KeybindListener = new class {

                constructor() {
                    this.pressedKeys = [];
                    this.listening = false;
                    this.listeners = [];
                }

                start() {
                    this.pressedKeys = [];

                    this.keyDownListener = e => {
                        if (e.repeat) return;

                        const key = e.code.slice(0, -1) === 'Key' ? e.code.slice(-1).toLowerCase() : e.key;
                        if (!this.pressedKeys.includes(key)) this.pressedKeys.push(key);
                        this.processPressedKeys();
                    }
                    this.keyUpListener = e => this.pressedKeys = this.pressedKeys.filter(key => key !== e.key)
                    window.addEventListener('keydown', this.keyDownListener);
                    window.addEventListener('keyup', this.keyUpListener);

                    this.listening = true;
                }

                stop(clearListeners = false) {
                    if (clearListeners) this.unlistenAll();

                    window.removeEventListener('keydown', this.keyDownListener);
                    window.removeEventListener('keyup', this.keyUpListener);

                    this.listening = false;
                }

                processPressedKeys() {
                    this.listeners.forEach(({ keybind, handler }) => {
                        if (keybind.sort().join('|').toLowerCase() === this.pressedKeys.sort().join('|').toLowerCase()) handler(keybind);
                    });
                }

                listen(keybind, handler) {
                    this.listeners.push({ keybind, handler });
                }

                unlisten(keybind, handler = null) {
                    this.listeners.splice(this.listeners.findIndex(l => l.keybind.join('|').toLowerCase() === keybind.join('|').toLowerCase() && (handler === null || l.handler === handler)), 1);
                }

                unlistenAll() {
                    this.listeners = [];
                }

                updateKeybinds(currentKeybind, newKeybind) {
                    this.listeners.forEach(l => { if (l.keybind.join('|').toLowerCase() === currentKeybind.join('|').toLowerCase()) l.keybind = newKeybind; });
                }

            }();

            return class PasscodeLock extends Plugin {
                static Types = {
                    FOUR_DIGIT: '4-digit',
                    SIX_DIGIT: '6-digit',
                    CUSTOM_NUMERIC: 'custom-numeric',
                    CUSTON_ALPHANUMERIC: 'custom-alphanumeric'
                }

                getIconPath() {
                    return 'M19,10h-1V7.69c0-3.16-2.57-5.72-5.72-5.72H11.8C8.66,1.97,6,4.62,6,7.77V10H5c-0.55,0-1,0.45-1,1v8c0,1.65,1.35,3,3,3h10c1.65,0,3-1.35,3-3v-8C20,10.45,19.55,10,19,10z M8,7.77c0-2.06,1.74-3.8,3.8-3.8h0.48c2.05,0,3.72,1.67,3.72,3.72V10H8V7.77z M13.06,16.06c-0.02,0.02-0.04,0.04-0.06,0.05V18c0,0.55-0.45,1-1,1s-1-0.45-1-1v-1.89c-0.02-0.01-0.04-0.03-0.06-0.05C10.66,15.78,10.5,15.4,10.5,15c0-0.1,0.01-0.2,0.03-0.29c0.02-0.1,0.05-0.19,0.08-0.28c0.04-0.09,0.09-0.18,0.14-0.26c0.06-0.09,0.12-0.16,0.19-0.23c0.35-0.35,0.86-0.51,1.35-0.41c0.1,0.02,0.19,0.05,0.28,0.08c0.09,0.04,0.18,0.09,0.26,0.14c0.08,0.06,0.16,0.12,0.23,0.19s0.13,0.14,0.19,0.23c0.05,0.08,0.1,0.17,0.13,0.26c0.04,0.09,0.07,0.18,0.09,0.28C13.49,14.8,13.5,14.9,13.5,15C13.5,15.4,13.34,15.77,13.06,16.06z';
                }

                buildStaticIcon() {
                    return React.createElement(
                        'svg',
                        {
                            xmlns: 'http://www.w3.org/2000/svg',
                            viewBox: '0 0 24 24',
                            height: '24',
                            width: '24',
                            className: Selectors.HeaderBar.icon
                        },
                        React.createElement('path', { fill: 'currentColor', d: this.getIconPath() })
                    );
                }

                async lock({ button, type, onSuccess } = {}) {
                    type = type ?? PasscodeLocker.Types.DEFAULT;

                    if (this.locked) return;
                    if (this.settings.hash === -1 && type !== PasscodeLocker.Types.EDITOR) return Toasts.error(Locale.current.FIRST_SETUP_MESSAGE);

                    this.unlock();

                    this.element = document.createElement('div');
                    (await getContainerAsync()).appendChild(this.element);
                    ReactDOM.render(React.createElement(PasscodeLocker, { plugin: this, button, type, onSuccess }), this.element);
                    this.disableInteractions();

                    this.locked = true;
                    if (type === PasscodeLocker.Types.DEFAULT) BdApi.setData(this.getName(), 'locked', true);
                }

                unlock(safeUnlock = false) {
                    this.enableInteractions();
                    this.locked = false;
                    if (safeUnlock) BdApi.setData(this.getName(), 'locked', false);

                    if (!this.element) return;

                    ReactDOM.unmountComponentAtNode(this.element);
                    this.element.remove();
                }

                disableInteractions() {
                    Keybinds.disable();
                }

                enableInteractions() {
                    Keybinds.enable();
                    document.onkeydown = null;
                }

                onLockKeybind() {
                    this.lock({ button: document.body });
                }

                onStart() {
                    this.injectCSS();
                    this.patchHeaderBar();
                    this.patchSettingsButton();
                    this.enableAutolock();

                    KeybindListener.start();
                    this.keybindSetting = this.checkKeybindLoad(this.settings.keybind);
                    this.keybind = this.keybindSetting.split('+');
                    KeybindListener.listen(this.keybind, () => this.onLockKeybind());

                    if (this.settings.lockOnStartup || BdApi.getData(this.getName(), 'locked')) this.lock();
                }

                async patchHeaderBar() {
                    Patcher.after(HeaderBar, "default", (self, _, value) => {
                        const children = value.props?.children?.props?.children;
                        const toolbar = children ? children[children.length - 1].props?.children?.props?.children : null;
                        if (!Array.isArray(toolbar) || toolbar.length < 2 || toolbar.some((e => e?.key === this.getName()))) return;

                        toolbar.splice(-2, 0, React.createElement(
                            Tooltip.default,
                            {
                                text: Locale.current.LOCK_DISCORD,
                                key: this.getName(),
                                position: "bottom"
                            },
                            props => React.createElement(
                                Button,
                                Object.assign({}, props, {
                                    id: 'PCLButton',
                                    size: Button.Sizes.NONE,
                                    look: Button.Looks.BLANK,
                                    innerClassName: `${Selectors.HeaderBar.iconWrapper} ${Selectors.HeaderBar.clickable}`,
                                    onClick: () => this.lock()
                                }),
                                this.buildStaticIcon()
                            )
                        ));
                    });

                    (await ReactComponents.getComponentByName('HeaderBarContainer', `.${Selectors.Chat.title}`)).forceUpdateAll();
                }

                injectCSS() {
                    PluginUtilities.addStyle(this.getName()+'-style', `
.PCL--layout {
    --main-color: #dcddde;

    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 9999999;
    overflow: hidden;
    color: var(--main-color);
}

.PCL--layout-bg {
    position: absolute;
    top: 50%;
    left: 50%;
    height: 0;
    width: 0;
    transform: translate(-50%, -50%) scale(0);
    background-color: rgba(0, 0, 0, .5);  
    backdrop-filter: blur(30px);
    transition: ${BG_TRANSITION / 1000}s transform linear;
    border-radius: 50%;
}

.PCL--controls {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: stretch;
    user-select: none;
    transition: .3s opacity;
}

.PCL--header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 22px;
}

.PCL--icon {
    height: 64px;
    width: 64px;
}

.PCL--title {
    margin: 25px 0 25px;
}

.PCL--dots {
    display: flex;
    height: 8px;
    width: 100%;
    justify-content: center;
}

@keyframes PCL--limit {
    0% {transform: translateX(10px);}
    25% {transform: translateX(0px);}
    50% {transform: translateX(-10px);}
    100% {transform: translateX(0px);}
}

.PCL--dots.PCL--dots--limit {
    animation-name: PCL--limit;
    animation-duration: 250ms;
}

.PCL--dot {
    position: relative;
    height: 8px;
    width: 0;
    /*animation-name: PCL--dot--anim;
    animation-duration: 250ms;*/
    transition: .25s opacity, .25s transform, .25s width, .25s margin;
    opacity: 0;
    transform: scale(.5);
}
.PCL--dot::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    height: 8px;
    width: 8px;
    border-radius: 50%;
    background: var(--main-color);
}
.PCL--dot-active {
    opacity: 1;
    transform: scale(1);
    width: 8px;
    margin: 0 5px;
}

.PCL--buttons {
    display: grid;
    grid-template-columns: repeat(3, 60px);
    grid-auto-rows: 60px;
    gap: 30px;
    padding: 40px 20px;
    position: relative;
}

.PCL--divider {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 1px;
    background: rgba(255, 255, 255, .1);
}

.PCL--btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 50%;
    box-sizing: border-box;
    background-clip: padding-box;
    border: 1px solid transparent;
    transition: 1s border-color, .3s background-color;
}

.PCL--btn:active, .PCL--btn-active {
    transition: none;
    border-color: rgba(255, 255, 255, .15);
    background-color: rgba(255, 255, 255, .15);
}

.PCL--btn-number {
    font-size: 32px;
    font-weight: 500;
    line-height: 36px;
}

.PCL--btn-dec {
    height: 11px;
    font-size: 10px;
    text-transform: uppercase;
    color: rgba(255, 255, 255, .3);
}

.PCL--animate {
    transition: .3s transform, .3s opacity;
    transition-timing-function: cubic-bezier(0.33, 1, 0.68, 1);
    transform: scale(.7);
    opacity: 0;
}

.PCL--animated {
    transform: scale(1);
    opacity: 1;
}
`);
                }

                clearCSS() {
                    PluginUtilities.removeStyle(this.getName()+'-style');
                }

                onStop() {
                    this.unlock();
                    this.clearCSS();
                    this.disconnectObserver();
                    this.unpatchSettingsButton();
                    this.disableAutolock();
                    KeybindListener.stop(true);
                    Patcher.unpatchAll();
                }

                patchSettingsButton() {
                    const selector = `#${this.getName()}-card`;
                    const callback = e => {
                        let node;
                        if ((node = e?.querySelector(`#${this.getName()}-card .bd-controls > .bd-button:first-child`))) {
                            const patchedNode = node.cloneNode(true);
                            patchedNode.onclick = () => {
                                if (!BdApi.Plugins.isEnabled(this.getName())) return;

                                if (this.settings.hash === -1) return node.click();

                                this.lock({
                                    button: patchedNode,
                                    type: PasscodeLocker.Types.SETTINGS,
                                    onSuccess: () => node.click()
                                });
                            };

                            patchedNode.classList.remove('bd-button-disabled');
                            node.before(patchedNode);
                            node.style.display = 'none';

                            this.settingsButton = { node, patchedNode };
                        }
                    };
                    callback(document.querySelector(selector));

                    this.observer = new DOMTools.DOMObserver();
                    this.observer.subscribeToQuerySelector(e => callback(e.addedNodes[0]), selector, this, false);
                }

                unpatchSettingsButton() {
                    if (this.settingsButton?.node) this.settingsButton.node.style.display = null;
                    if (this.settingsButton?.patchedNode) this.settingsButton.patchedNode.remove();
                }

                disconnectObserver() {
                    this.observer.unsubscribeAll();
                }

                updateCode(code) {
                    const hashed = hashCode(code)
                    this.settings.hash = hashed.hash;
                    this.settings.salt = hashed.salt;
                    this.settings.iterations = hashed.iterations;
                    this.saveSettings();

                    Toasts.success(Locale.current.PASSCODE_UPDATED_MESSAGE);
                }

                enableAutolock() {
                    this.autolockBlurListener = e => {
                        if (this.settings.autolock === false || getVoiceChannelId() !== null) return;

                        this.autolockTimeout = setTimeout(() => {
                            this.onLockKeybind();
                        }, this.settings.autolock * 1000);
                    };
                    this.autolockFocusListener = e => {
                        clearTimeout(this.autolockTimeout);
                    };

                    window.addEventListener('blur', this.autolockBlurListener);
                    window.addEventListener('focus', this.autolockFocusListener);
                }

                disableAutolock() {
                    clearTimeout(this.autolockTimeout);
                    window.removeEventListener('blur', this.autolockBlurListener);
                    window.removeEventListener('focus', this.autolockFocusListener);
                }

                getSettingsPanel() {
                    if (!this.KeybindRecorder) {
                        this.KeybindRecorder = BdApi.findModuleByDisplayName("KeybindRecorder");
                        this.KeybindStore = BdApi.findModuleByProps("toCombo");
                    }

                    const Buttons = (...props) => {
                        class Panel extends React.Component {
                            render() {
                                let buttons = [];
                                props.forEach(p => {
                                    buttons.push(
                                        React.createElement(Button, {
                                            style: {
                                                display: 'inline-flex',
                                                marginRight: '10px',
                                                ...(p.icon ? {
                                                    paddingLeft: '10px',
                                                    paddingRight: '12px',
                                                } : {})
                                            },
                                            ...p
                                        })
                                    );
                                });

                                return React.createElement(
                                    'div',
                                    {},
                                    buttons
                                );
                            }
                        }

                        return Panel;
                    }

                    const ButtonIcon = (name, text) => {
                        const icon = {
                            edit: `M3 17.46v3.04c0 .28.22.5.5.5h3.04c.13 0 .26-.05.35-.15L17.81 9.94l-3.75-3.75L3.15 17.1c-.1.1-.15.22-.15.36zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z`,
                            lock: this.getIconPath()
                        }[name];

                        return React.createElement(
                            'div',
                            {
                                style: {
                                    display: 'flex',
                                    alignItems: 'center'
                                }
                            },
                            [
                                React.createElement(
                                    'svg',
                                    {
                                        xmlns: 'http://www.w3.org/2000/svg',
                                        height: '20',
                                        viewBox: '0 0 24 24',
                                        width: '20'
                                    },
                                    React.createElement('path', { d: icon, fill: 'white' })
                                ),
                                React.createElement('span', { style: { marginLeft: '5px' } }, text)
                            ]
                        );
                    };

                    const settingsNode = Settings.SettingPanel.build(
                        () => {
                            this.saveSettings.bind(this);
                        },

                        new Settings.SettingField(null, null, () => {}, Buttons(
                            {
                                children: ButtonIcon('edit', Locale.current.EDIT_PASSCODE),
                                icon: true,
                                color: Button.Colors.BRAND,
                                size: Button.Sizes.SMALL,
                                id: `PCLSettingsEditButton`,
                                onClick: () => this.lock({
                                    button: document.getElementById('PCLSettingsEditButton'),
                                    type: PasscodeLocker.Types.EDITOR
                                })
                            },
                            {
                                children: ButtonIcon('lock', Locale.current.LOCK_DISCORD),
                                icon: true,
                                color: Button.Colors.TRANSPARENT,
                                size: Button.Sizes.SMALL,
                                id: `PCLSettingsLockButton`,
                                onClick: () => this.lock({
                                    button: document.getElementById('PCLSettingsLockButton')
                                })
                            },
                        )),

                        // Inspired by iOS code options
                        new Settings.RadioGroup(Locale.current.CODE_TYPE_SETTING, null, this.settings.codeType, [
                            {
                                name: Locale.current['4DIGIT_NCODE'],
                                value: PasscodeLock.Types.FOUR_DIGIT
                            },
                            {
                                name: Locale.current['6DIGIT_NCODE'],
                                value: PasscodeLock.Types.SIX_DIGIT
                            },
                            {
                                name: Locale.current.CUSTOM_NCODE,
                                value: PasscodeLock.Types.CUSTOM_NUMERIC
                            },
                            // TODO: implement
                            // {
                            //     name: 'Custom Alphanumeric Code',
                            //     value: PasscodeLock.Types.CUSTON_ALPHANUMERIC
                            // },
                        ], e => {
                            this.settings.codeType = e;
                            this.saveSettings();

                            this.settings.hash = -1;
                            Toasts.warning(Locale.current.PASSCODE_RESET_DEFAULT_MESSAGE);

                            CODE_LENGTH = (this.settings.codeType === PasscodeLock.Types.FOUR_DIGIT ? 4 :
                                this.settings.codeType === PasscodeLock.Types.SIX_DIGIT ? 6 : -1);
                        }),

                        new Settings.RadioGroup(Locale.current.AUTOLOCK_SETTING, Locale.current.AUTOLOCK_DESC, this.settings.autolock, [
                            {
                                name: Locale.current.AUTOLOCK_DISABLED,
                                value: false
                            },
                            {
                                name: Locale.current.AUTOLOCK_1M,
                                value: 60
                            },
                            {
                                name: Locale.current.AUTOLOCK_5M,
                                value: 60 * 5
                            },
                            {
                                name: Locale.current.AUTOLOCK_1H,
                                value: 60 * 60
                            },
                            {
                                name: Locale.current.AUTOLOCK_5H,
                                value: 60 * 60 * 5
                            },
                        ], e => {
                            this.settings.autolock = e;
                            this.saveSettings();
                        }),

                        new Settings.SettingField(Locale.current.LOCK_KEYBIND_SETTING, null, () => {}, props => {
                            return React.createElement(this.KeybindRecorder, {
                                defaultValue: this.KeybindStore.toCombo(this.keybindSetting.replace("control", "ctrl")),
                                onChange: (e) => {
                                    const keybindString = this.KeybindStore.toString(e).toLowerCase().replace("ctrl", "control");

                                    KeybindListener.unlisten(this.keybind);
                                    this.keybindSetting = keybindString;
                                    this.keybind = keybindString.split('+');
                                    KeybindListener.listen(this.keybind, () => this.onLockKeybind());

                                    this.settings.keybind = this.keybindSetting;
                                    this.saveSettings();
                                }
                            })
                        }),

                        new Settings.Switch(Locale.current.ALWAYS_LOCK_SETTING, Locale.current.ALWAYS_LOCK_DESC, this.settings.lockOnStartup, e => {
                            this.settings.lockOnStartup = e;
                            this.saveSettings();
                        }),

                        new Settings.Switch(Locale.current.HIGHLIGHT_TYPING_SETTING, Locale.current.HIGHLIGHT_TYPING_DESC, this.settings.highlightButtons, e => {
                            this.settings.highlightButtons = e;
                            this.saveSettings();
                        }),

                        new Settings.RadioGroup(Locale.current.NOTIFICATIONS_SETTING, null, this.settings.hideNotifications, [
                            {
                                name: Locale.current.NOTIFICATIONS_SETTING_DISABLE,
                                value: true
                            },
                            {
                                name: Locale.current.NOTIFICATIONS_SETTING_CENSOR,
                                value: false
                            },
                        ], e => {
                            this.settings.hideNotifications = e;
                            this.saveSettings();
                        }),

                        new Settings.SettingField(null, React.createElement(DiscordModules.TextElement, {
                            children: [
                                'Not your language? Help translate the plugin on the ',
                                React.createElement(DiscordModules.Anchor, {
                                    children: 'Crowdin page',
                                    href: 'https://crwd.in/betterdiscord-passcodelock'
                                }),
                                '.'
                            ],
                            className: `${DiscordModules.TextElement.Colors.STANDARD} ${DiscordModules.TextElement.Sizes.SIZE_14}`
                        }), () => {}, document.createElement('div'))

                    );

                    DOMTools.onMountChange(settingsNode, () => KeybindListener.stop(), true);
                    DOMTools.onMountChange(settingsNode, () => KeybindListener.start(), false);

                    return settingsNode;
                }

                // Props to https://github.com/Farcrada (https://github.com/Farcrada/DiscordPlugins/blob/ed87e32c0e25960b3c76428b8929a9c6f5a1c20d/Hide-Channels/HideChannels.plugin.js)
                checkKeybindLoad(keybindToLoad, defaultKeybind = "control+l") {
                    defaultKeybind = defaultKeybind.toLowerCase().replace("ctrl", "control");

                    //If no keybind
                    if (!keybindToLoad)
                        return defaultKeybind;

                    //Error sensitive, so just plump it into a try-catch
                    try {
                        //If it's already a string, double check it
                        if (typeof (keybindToLoad) === typeof (defaultKeybind)) {
                            keybindToLoad = keybindToLoad.toLowerCase().replace("control", "ctrl");
                            //Does it go into a combo? (i.e.: is it the correct format?)
                            if (this.KeybindStore.toCombo(keybindToLoad))
                                return keybindToLoad.replace("ctrl", "control");
                            else
                                return defaultKeybind;
                        }
                        else
                            //If it's not a string, check if it's a combo.
                        if (this.KeybindStore.toString(keybindToLoad))
                            return this.KeybindStore.toString(keybindToLoad).toLowerCase().replace("ctrl", "control");
                    }
                    catch (e) { return defaultKeybind; }
                }

                constructor() {
                    super();

                    this.defaultSettings = {
                        codeType: PasscodeLock.Types.FOUR_DIGIT,
                        hash: -1,
                        salt: null,
                        iterations: null,
                        autolock: false,
                        keybind: "control+l",
                        highlightButtons: false,
                        lockOnStartup: true,
                        hideNotifications: false
                    };

                    this.settings = this.loadSettings(this.defaultSettings);

                    if (this.settings.code) {
                        delete this.settings.code;
                        ['hash', 'salt', 'iterations'].forEach(k => this.settings[k] = this.defaultSettings[k]);
                        this.saveSettings();

                        Toasts.warning(Locale.current.PASSCODE_RESET_SECURITY_UPDATE_MESSAGE);
                    }
                    if (typeof this.settings.keybind !== 'string') {
                        this.settings.keybind = this.defaultSettings.keybind;
                        this.saveSettings();
                    }

                    CODE_LENGTH = (this.settings.codeType === PasscodeLock.Types.FOUR_DIGIT ? 4 :
                        this.settings.codeType === PasscodeLock.Types.SIX_DIGIT ? 6 : -1);

                    if (!BdApi.getData(this.getName(), 'hasShownAttention')) this.showAttentionModal();
                }

                showAttentionModal() {
                    const that = this;
                    class Modal extends React.Component {
                        render() {
                            return React.createElement(ConfirmationModal, Object.assign({
                                    header: `${that.getName()}`,
                                    confirmButtonColor: ButtonColors.BRAND,
                                    className: Selectors.Modals.small,
                                    confirmText: 'Got it',
                                    cancelText: null,
                                    style: {
                                        lineHeight: '1.4em',
                                    }
                                }, this.props),
                                [
                                    React.createElement(
                                        'div',
                                        {
                                            style: {
                                                lineHeight: '1.4em',
                                            }
                                        },
                                        React.createElement(
                                            Markdown,
                                            null,
                                            Locale.current.ATTENTION_MESSAGE
                                        )
                                    )
                                ]
                            );
                        }
                    }

                    ModalActions.openModal(props => {
                        return React.createElement(Modal, props)
                    });

                    BdApi.setData(this.getName(), 'hasShownAttention', true);
                }
            }
        }

        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();