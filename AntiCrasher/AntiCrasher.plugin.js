/**
 * @name AntiCrasher
 * @description Removes all malicious GIFs that can crash your Discord app.
 * @author arg0NNY
 * @version 1.0.3
 * @updateUrl https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/AntiCrasher/AntiCrasher.plugin.js
 * @source https://github.com/arg0NNY/DiscordPlugins/tree/master/AntiCrasher
 */

class AntiCrasher {
    constructor() {
        this.last_id = 0;
    }

    css() {
        BdApi.injectCSS('anticrasherCSS', `
        .checking:not(.checked):not(video) {
            position: relative;
            pointer-events: none;
        }
        .checking:not(.checked):not(video)::before {
            content: 'AntiCrasher: Checking media...';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,.7);
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            color: #fff;
            z-index: 3;
        }
        `);
    }

    cssClear() {
        BdApi.clearCSS('anticrasherCSS');
    }

    listenIFrameMessages() {
        window.addEventListener('message', e => {
            let result = JSON.parse(e.data);

            document.querySelector(`iframe[data-anticrasher-id="${result.id}"]`).remove();

            let video = document.querySelector(`video[data-anticrasher-id="${result.id}"]`);
            video.classList.add('checked');
            video.classList.remove('checking');
            video.parentNode.classList.remove('checking');

            if(video.getAttribute('data-autoplay') !== 'false') {
                video.autoplay = true;
                video.play();
            }

            if (video && result.result === true) {
                let message_container = video.parentNode.parentNode.parentNode;
                message_container.innerHTML = 'AntiCrasher: Your Discord app was saved from crash! Be careful with some GIFs!';
                message_container.style.color = '#ff0000';
            }
        });
    }

    listenIFrameMessagesStop() {
        window.removeEventListener('message');
    }

    insertIFramesWrapper() {
        this.iframes_wrapper = document.createElement('div');
        this.iframes_wrapper.className = 'anticrasher-iframes';
        document.body.appendChild(this.iframes_wrapper);
    }

    removeIFramesWrapper() {
        this.iframes_wrapper.remove();
    }

    checkVideo(video) {
        let url = !video.getAttribute('src').includes('external') ? video.getAttribute('src') : 'https://'+video.getAttribute('src').split('https/')[1];

        this.last_id += 1;
        video.setAttribute('data-anticrasher-id', this.last_id);

        video.setAttribute('data-autoplay', video.autoplay);
        video.autoplay = false;
        video.pause();

        if (url === '') {
            video.classList.remove('checking');
        }
        else if (url.includes('attachments')) {
            video.classList.remove('checking');
            video.parentNode.classList.remove('checking');
            video.classList.add('checked');
            video.parentNode.classList.add('checked');
        }
        else {
            let iframe = document.createElement('iframe');
            iframe.setAttribute('data-anticrasher-id', this.last_id);
            iframe.src = `https://hamsk.ru/MT/mediainfo/?id=${this.last_id}&url=${url}`;
            iframe.style.display = 'none';
            this.iframes_wrapper.appendChild(iframe);
        }
    }

    createInterval() {
        this.interval = setInterval(() => {
            document.querySelectorAll('.da-chatContent video:not(.checking):not(.checked)').forEach(video => {
                this.checkVideo(video);
                video.classList.add('checking');
                video.parentNode.classList.add('checking');
            });
            document.querySelectorAll('video.checking:not(.checked)').forEach(video => video.currentTime = 0);
        }, 100);
    }

    removeInterval() {
        clearInterval(this.interval);
    }

    start() {
        this.insertIFramesWrapper();
        this.css();
        this.createInterval();
        this.listenIFrameMessages();
    }

    stop() {
        this.removeInterval();
        this.listenIFrameMessagesStop();
        this.cssClear();
        this.removeIFramesWrapper();
    };
}
