/**
 * @name PasscodeLock
 * @author arg0NNY
 * @authorLink https://github.com/arg0NNY/DiscordPlugins
 * @invite M8DBtcZjXD
 * @version 1.3.3
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
            "version": "1.3.3",
            "description": "Protect your Discord with a passcode.",
            github: "https://github.com/arg0NNY/DiscordPlugins/tree/master/PasscodeLock",
            github_raw: "https://raw.githubusercontent.com/arg0NNY/DiscordPlugins/master/PasscodeLock/PasscodeLock.plugin.js"
        },
        "changelog": [
            {
                "type": "fixed",
                "title": "Fixed",
                "items": [
                    "Plugin works in the latest Discord breakdown update.",
                    "Lock button in the channel header disabled due to changed webpack modules structure. Waiting for a workaround.",
                    "Most probably fixed lock keybind not working sometimes.",
                    "(+) Fixed lock keybind resetting after Discord restart."
                ]
            }
        ]
    };

    const electron = require("electron");
    const request = require("request");
    const fs = require("fs");
    const path = require("path");

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
            // CryptoJS
            var CryptoJS = (function(){var n,o,s,a,h,t,e,l,r,i,c,f,d,u,p,S,x,b,A,H,z,_,v,g,y,B,w,k,m,C,D,E,R,M,F,P,W,O,I,U=U||function(h){var i;if("undefined"!=typeof window&&window.crypto&&(i=window.crypto),"undefined"!=typeof self&&self.crypto&&(i=self.crypto),!(i=!(i=!(i="undefined"!=typeof globalThis&&globalThis.crypto?globalThis.crypto:i)&&"undefined"!=typeof window&&window.msCrypto?window.msCrypto:i)&&"undefined"!=typeof global&&global.crypto?global.crypto:i)&&"function"==typeof require)try{i=require("crypto")}catch(t){}var r=Object.create||function(t){return e.prototype=t,t=new e,e.prototype=null,t};function e(){}var t={},n=t.lib={},o=n.Base={extend:function(t){var e=r(this);return t&&e.mixIn(t),e.hasOwnProperty("init")&&this.init!==e.init||(e.init=function(){e.$super.init.apply(this,arguments)}),(e.init.prototype=e).$super=this,e},create:function(){var t=this.extend();return t.init.apply(t,arguments),t},init:function(){},mixIn:function(t){for(var e in t)t.hasOwnProperty(e)&&(this[e]=t[e]);t.hasOwnProperty("toString")&&(this.toString=t.toString)},clone:function(){return this.init.prototype.extend(this)}},l=n.WordArray=o.extend({init:function(t,e){t=this.words=t||[],this.sigBytes=null!=e?e:4*t.length},toString:function(t){return(t||c).stringify(this)},concat:function(t){var e=this.words,r=t.words,i=this.sigBytes,n=t.sigBytes;if(this.clamp(),i%4)for(var o=0;o<n;o++){var s=r[o>>>2]>>>24-o%4*8&255;e[i+o>>>2]|=s<<24-(i+o)%4*8}else for(var c=0;c<n;c+=4)e[i+c>>>2]=r[c>>>2];return this.sigBytes+=n,this},clamp:function(){var t=this.words,e=this.sigBytes;t[e>>>2]&=4294967295<<32-e%4*8,t.length=h.ceil(e/4)},clone:function(){var t=o.clone.call(this);return t.words=this.words.slice(0),t},random:function(t){for(var e=[],r=0;r<t;r+=4)e.push(function(){if(i){if("function"==typeof i.getRandomValues)try{return i.getRandomValues(new Uint32Array(1))[0]}catch(t){}if("function"==typeof i.randomBytes)try{return i.randomBytes(4).readInt32LE()}catch(t){}}throw new Error("Native crypto module could not be used to get secure random number.")}());return new l.init(e,t)}}),s=t.enc={},c=s.Hex={stringify:function(t){for(var e=t.words,r=t.sigBytes,i=[],n=0;n<r;n++){var o=e[n>>>2]>>>24-n%4*8&255;i.push((o>>>4).toString(16)),i.push((15&o).toString(16))}return i.join("")},parse:function(t){for(var e=t.length,r=[],i=0;i<e;i+=2)r[i>>>3]|=parseInt(t.substr(i,2),16)<<24-i%8*4;return new l.init(r,e/2)}},a=s.Latin1={stringify:function(t){for(var e=t.words,r=t.sigBytes,i=[],n=0;n<r;n++){var o=e[n>>>2]>>>24-n%4*8&255;i.push(String.fromCharCode(o))}return i.join("")},parse:function(t){for(var e=t.length,r=[],i=0;i<e;i++)r[i>>>2]|=(255&t.charCodeAt(i))<<24-i%4*8;return new l.init(r,e)}},f=s.Utf8={stringify:function(t){try{return decodeURIComponent(escape(a.stringify(t)))}catch(t){throw new Error("Malformed UTF-8 data")}},parse:function(t){return a.parse(unescape(encodeURIComponent(t)))}},d=n.BufferedBlockAlgorithm=o.extend({reset:function(){this._data=new l.init,this._nDataBytes=0},_append:function(t){"string"==typeof t&&(t=f.parse(t)),this._data.concat(t),this._nDataBytes+=t.sigBytes},_process:function(t){var e,r=this._data,i=r.words,n=r.sigBytes,o=this.blockSize,s=n/(4*o),c=(s=t?h.ceil(s):h.max((0|s)-this._minBufferSize,0))*o,n=h.min(4*c,n);if(c){for(var a=0;a<c;a+=o)this._doProcessBlock(i,a);e=i.splice(0,c),r.sigBytes-=n}return new l.init(e,n)},clone:function(){var t=o.clone.call(this);return t._data=this._data.clone(),t},_minBufferSize:0}),u=(n.Hasher=d.extend({cfg:o.extend(),init:function(t){this.cfg=this.cfg.extend(t),this.reset()},reset:function(){d.reset.call(this),this._doReset()},update:function(t){return this._append(t),this._process(),this},finalize:function(t){return t&&this._append(t),this._doFinalize()},blockSize:16,_createHelper:function(r){return function(t,e){return new r.init(e).finalize(t)}},_createHmacHelper:function(r){return function(t,e){return new u.HMAC.init(r,e).finalize(t)}}}),t.algo={});return t}(Math);function K(t,e,r){return t&e|~t&r}function X(t,e,r){return t&r|e&~r}function L(t,e){return t<<e|t>>>32-e}function j(t,e,r,i){var n,o=this._iv;o?(n=o.slice(0),this._iv=void 0):n=this._prevBlock,i.encryptBlock(n,0);for(var s=0;s<r;s++)t[e+s]^=n[s]}function T(t){var e,r,i;return 255==(t>>24&255)?(r=t>>8&255,i=255&t,255===(e=t>>16&255)?(e=0,255===r?(r=0,255===i?i=0:++i):++r):++e,t=0,t+=e<<16,t+=r<<8,t+=i):t+=1<<24,t}function N(){for(var t=this._X,e=this._C,r=0;r<8;r++)E[r]=e[r];e[0]=e[0]+1295307597+this._b|0,e[1]=e[1]+3545052371+(e[0]>>>0<E[0]>>>0?1:0)|0,e[2]=e[2]+886263092+(e[1]>>>0<E[1]>>>0?1:0)|0,e[3]=e[3]+1295307597+(e[2]>>>0<E[2]>>>0?1:0)|0,e[4]=e[4]+3545052371+(e[3]>>>0<E[3]>>>0?1:0)|0,e[5]=e[5]+886263092+(e[4]>>>0<E[4]>>>0?1:0)|0,e[6]=e[6]+1295307597+(e[5]>>>0<E[5]>>>0?1:0)|0,e[7]=e[7]+3545052371+(e[6]>>>0<E[6]>>>0?1:0)|0,this._b=e[7]>>>0<E[7]>>>0?1:0;for(r=0;r<8;r++){var i=t[r]+e[r],n=65535&i,o=i>>>16;R[r]=((n*n>>>17)+n*o>>>15)+o*o^((4294901760&i)*i|0)+((65535&i)*i|0)}t[0]=R[0]+(R[7]<<16|R[7]>>>16)+(R[6]<<16|R[6]>>>16)|0,t[1]=R[1]+(R[0]<<8|R[0]>>>24)+R[7]|0,t[2]=R[2]+(R[1]<<16|R[1]>>>16)+(R[0]<<16|R[0]>>>16)|0,t[3]=R[3]+(R[2]<<8|R[2]>>>24)+R[1]|0,t[4]=R[4]+(R[3]<<16|R[3]>>>16)+(R[2]<<16|R[2]>>>16)|0,t[5]=R[5]+(R[4]<<8|R[4]>>>24)+R[3]|0,t[6]=R[6]+(R[5]<<16|R[5]>>>16)+(R[4]<<16|R[4]>>>16)|0,t[7]=R[7]+(R[6]<<8|R[6]>>>24)+R[5]|0}function q(){for(var t=this._X,e=this._C,r=0;r<8;r++)O[r]=e[r];e[0]=e[0]+1295307597+this._b|0,e[1]=e[1]+3545052371+(e[0]>>>0<O[0]>>>0?1:0)|0,e[2]=e[2]+886263092+(e[1]>>>0<O[1]>>>0?1:0)|0,e[3]=e[3]+1295307597+(e[2]>>>0<O[2]>>>0?1:0)|0,e[4]=e[4]+3545052371+(e[3]>>>0<O[3]>>>0?1:0)|0,e[5]=e[5]+886263092+(e[4]>>>0<O[4]>>>0?1:0)|0,e[6]=e[6]+1295307597+(e[5]>>>0<O[5]>>>0?1:0)|0,e[7]=e[7]+3545052371+(e[6]>>>0<O[6]>>>0?1:0)|0,this._b=e[7]>>>0<O[7]>>>0?1:0;for(r=0;r<8;r++){var i=t[r]+e[r],n=65535&i,o=i>>>16;I[r]=((n*n>>>17)+n*o>>>15)+o*o^((4294901760&i)*i|0)+((65535&i)*i|0)}t[0]=I[0]+(I[7]<<16|I[7]>>>16)+(I[6]<<16|I[6]>>>16)|0,t[1]=I[1]+(I[0]<<8|I[0]>>>24)+I[7]|0,t[2]=I[2]+(I[1]<<16|I[1]>>>16)+(I[0]<<16|I[0]>>>16)|0,t[3]=I[3]+(I[2]<<8|I[2]>>>24)+I[1]|0,t[4]=I[4]+(I[3]<<16|I[3]>>>16)+(I[2]<<16|I[2]>>>16)|0,t[5]=I[5]+(I[4]<<8|I[4]>>>24)+I[3]|0,t[6]=I[6]+(I[5]<<16|I[5]>>>16)+(I[4]<<16|I[4]>>>16)|0,t[7]=I[7]+(I[6]<<8|I[6]>>>24)+I[5]|0}return F=(M=U).lib,n=F.Base,o=F.WordArray,(M=M.x64={}).Word=n.extend({init:function(t,e){this.high=t,this.low=e}}),M.WordArray=n.extend({init:function(t,e){t=this.words=t||[],this.sigBytes=null!=e?e:8*t.length},toX32:function(){for(var t=this.words,e=t.length,r=[],i=0;i<e;i++){var n=t[i];r.push(n.high),r.push(n.low)}return o.create(r,this.sigBytes)},clone:function(){for(var t=n.clone.call(this),e=t.words=this.words.slice(0),r=e.length,i=0;i<r;i++)e[i]=e[i].clone();return t}}),"function"==typeof ArrayBuffer&&(P=U.lib.WordArray,s=P.init,(P.init=function(t){if((t=(t=t instanceof ArrayBuffer?new Uint8Array(t):t)instanceof Int8Array||"undefined"!=typeof Uint8ClampedArray&&t instanceof Uint8ClampedArray||t instanceof Int16Array||t instanceof Uint16Array||t instanceof Int32Array||t instanceof Uint32Array||t instanceof Float32Array||t instanceof Float64Array?new Uint8Array(t.buffer,t.byteOffset,t.byteLength):t)instanceof Uint8Array){for(var e=t.byteLength,r=[],i=0;i<e;i++)r[i>>>2]|=t[i]<<24-i%4*8;s.call(this,r,e)}else s.apply(this,arguments)}).prototype=P),function(){var t=U,n=t.lib.WordArray,t=t.enc;t.Utf16=t.Utf16BE={stringify:function(t){for(var e=t.words,r=t.sigBytes,i=[],n=0;n<r;n+=2){var o=e[n>>>2]>>>16-n%4*8&65535;i.push(String.fromCharCode(o))}return i.join("")},parse:function(t){for(var e=t.length,r=[],i=0;i<e;i++)r[i>>>1]|=t.charCodeAt(i)<<16-i%2*16;return n.create(r,2*e)}};function s(t){return t<<8&4278255360|t>>>8&16711935}t.Utf16LE={stringify:function(t){for(var e=t.words,r=t.sigBytes,i=[],n=0;n<r;n+=2){var o=s(e[n>>>2]>>>16-n%4*8&65535);i.push(String.fromCharCode(o))}return i.join("")},parse:function(t){for(var e=t.length,r=[],i=0;i<e;i++)r[i>>>1]|=s(t.charCodeAt(i)<<16-i%2*16);return n.create(r,2*e)}}}(),a=(w=U).lib.WordArray,w.enc.Base64={stringify:function(t){var e=t.words,r=t.sigBytes,i=this._map;t.clamp();for(var n=[],o=0;o<r;o+=3)for(var s=(e[o>>>2]>>>24-o%4*8&255)<<16|(e[o+1>>>2]>>>24-(o+1)%4*8&255)<<8|e[o+2>>>2]>>>24-(o+2)%4*8&255,c=0;c<4&&o+.75*c<r;c++)n.push(i.charAt(s>>>6*(3-c)&63));var a=i.charAt(64);if(a)for(;n.length%4;)n.push(a);return n.join("")},parse:function(t){var e=t.length,r=this._map;if(!(i=this._reverseMap))for(var i=this._reverseMap=[],n=0;n<r.length;n++)i[r.charCodeAt(n)]=n;var o=r.charAt(64);return!o||-1!==(o=t.indexOf(o))&&(e=o),function(t,e,r){for(var i=[],n=0,o=0;o<e;o++){var s,c;o%4&&(s=r[t.charCodeAt(o-1)]<<o%4*2,c=r[t.charCodeAt(o)]>>>6-o%4*2,c=s|c,i[n>>>2]|=c<<24-n%4*8,n++)}return a.create(i,n)}(t,e,i)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="},h=(F=U).lib.WordArray,F.enc.Base64url={stringify:function(t,e=!0){var r=t.words,i=t.sigBytes,n=e?this._safe_map:this._map;t.clamp();for(var o=[],s=0;s<i;s+=3)for(var c=(r[s>>>2]>>>24-s%4*8&255)<<16|(r[s+1>>>2]>>>24-(s+1)%4*8&255)<<8|r[s+2>>>2]>>>24-(s+2)%4*8&255,a=0;a<4&&s+.75*a<i;a++)o.push(n.charAt(c>>>6*(3-a)&63));var h=n.charAt(64);if(h)for(;o.length%4;)o.push(h);return o.join("")},parse:function(t,e=!0){var r=t.length,i=e?this._safe_map:this._map;if(!(n=this._reverseMap))for(var n=this._reverseMap=[],o=0;o<i.length;o++)n[i.charCodeAt(o)]=o;e=i.charAt(64);return!e||-1!==(e=t.indexOf(e))&&(r=e),function(t,e,r){for(var i=[],n=0,o=0;o<e;o++){var s,c;o%4&&(s=r[t.charCodeAt(o-1)]<<o%4*2,c=r[t.charCodeAt(o)]>>>6-o%4*2,c=s|c,i[n>>>2]|=c<<24-n%4*8,n++)}return h.create(i,n)}(t,r,n)},_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",_safe_map:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"},function(a){var t=U,e=t.lib,r=e.WordArray,i=e.Hasher,e=t.algo,A=[];!function(){for(var t=0;t<64;t++)A[t]=4294967296*a.abs(a.sin(t+1))|0}();e=e.MD5=i.extend({_doReset:function(){this._hash=new r.init([1732584193,4023233417,2562383102,271733878])},_doProcessBlock:function(t,e){for(var r=0;r<16;r++){var i=e+r,n=t[i];t[i]=16711935&(n<<8|n>>>24)|4278255360&(n<<24|n>>>8)}var o=this._hash.words,s=t[e+0],c=t[e+1],a=t[e+2],h=t[e+3],l=t[e+4],f=t[e+5],d=t[e+6],u=t[e+7],p=t[e+8],_=t[e+9],y=t[e+10],v=t[e+11],g=t[e+12],B=t[e+13],w=t[e+14],k=t[e+15],m=H(m=o[0],b=o[1],x=o[2],S=o[3],s,7,A[0]),S=H(S,m,b,x,c,12,A[1]),x=H(x,S,m,b,a,17,A[2]),b=H(b,x,S,m,h,22,A[3]);m=H(m,b,x,S,l,7,A[4]),S=H(S,m,b,x,f,12,A[5]),x=H(x,S,m,b,d,17,A[6]),b=H(b,x,S,m,u,22,A[7]),m=H(m,b,x,S,p,7,A[8]),S=H(S,m,b,x,_,12,A[9]),x=H(x,S,m,b,y,17,A[10]),b=H(b,x,S,m,v,22,A[11]),m=H(m,b,x,S,g,7,A[12]),S=H(S,m,b,x,B,12,A[13]),x=H(x,S,m,b,w,17,A[14]),m=z(m,b=H(b,x,S,m,k,22,A[15]),x,S,c,5,A[16]),S=z(S,m,b,x,d,9,A[17]),x=z(x,S,m,b,v,14,A[18]),b=z(b,x,S,m,s,20,A[19]),m=z(m,b,x,S,f,5,A[20]),S=z(S,m,b,x,y,9,A[21]),x=z(x,S,m,b,k,14,A[22]),b=z(b,x,S,m,l,20,A[23]),m=z(m,b,x,S,_,5,A[24]),S=z(S,m,b,x,w,9,A[25]),x=z(x,S,m,b,h,14,A[26]),b=z(b,x,S,m,p,20,A[27]),m=z(m,b,x,S,B,5,A[28]),S=z(S,m,b,x,a,9,A[29]),x=z(x,S,m,b,u,14,A[30]),m=C(m,b=z(b,x,S,m,g,20,A[31]),x,S,f,4,A[32]),S=C(S,m,b,x,p,11,A[33]),x=C(x,S,m,b,v,16,A[34]),b=C(b,x,S,m,w,23,A[35]),m=C(m,b,x,S,c,4,A[36]),S=C(S,m,b,x,l,11,A[37]),x=C(x,S,m,b,u,16,A[38]),b=C(b,x,S,m,y,23,A[39]),m=C(m,b,x,S,B,4,A[40]),S=C(S,m,b,x,s,11,A[41]),x=C(x,S,m,b,h,16,A[42]),b=C(b,x,S,m,d,23,A[43]),m=C(m,b,x,S,_,4,A[44]),S=C(S,m,b,x,g,11,A[45]),x=C(x,S,m,b,k,16,A[46]),m=D(m,b=C(b,x,S,m,a,23,A[47]),x,S,s,6,A[48]),S=D(S,m,b,x,u,10,A[49]),x=D(x,S,m,b,w,15,A[50]),b=D(b,x,S,m,f,21,A[51]),m=D(m,b,x,S,g,6,A[52]),S=D(S,m,b,x,h,10,A[53]),x=D(x,S,m,b,y,15,A[54]),b=D(b,x,S,m,c,21,A[55]),m=D(m,b,x,S,p,6,A[56]),S=D(S,m,b,x,k,10,A[57]),x=D(x,S,m,b,d,15,A[58]),b=D(b,x,S,m,B,21,A[59]),m=D(m,b,x,S,l,6,A[60]),S=D(S,m,b,x,v,10,A[61]),x=D(x,S,m,b,a,15,A[62]),b=D(b,x,S,m,_,21,A[63]),o[0]=o[0]+m|0,o[1]=o[1]+b|0,o[2]=o[2]+x|0,o[3]=o[3]+S|0},_doFinalize:function(){var t=this._data,e=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;e[i>>>5]|=128<<24-i%32;var n=a.floor(r/4294967296),r=r;e[15+(64+i>>>9<<4)]=16711935&(n<<8|n>>>24)|4278255360&(n<<24|n>>>8),e[14+(64+i>>>9<<4)]=16711935&(r<<8|r>>>24)|4278255360&(r<<24|r>>>8),t.sigBytes=4*(e.length+1),this._process();for(var e=this._hash,o=e.words,s=0;s<4;s++){var c=o[s];o[s]=16711935&(c<<8|c>>>24)|4278255360&(c<<24|c>>>8)}return e},clone:function(){var t=i.clone.call(this);return t._hash=this._hash.clone(),t}});function H(t,e,r,i,n,o,s){s=t+(e&r|~e&i)+n+s;return(s<<o|s>>>32-o)+e}function z(t,e,r,i,n,o,s){s=t+(e&i|r&~i)+n+s;return(s<<o|s>>>32-o)+e}function C(t,e,r,i,n,o,s){s=t+(e^r^i)+n+s;return(s<<o|s>>>32-o)+e}function D(t,e,r,i,n,o,s){s=t+(r^(e|~i))+n+s;return(s<<o|s>>>32-o)+e}t.MD5=i._createHelper(e),t.HmacMD5=i._createHmacHelper(e)}(Math),P=(M=U).lib,t=P.WordArray,e=P.Hasher,P=M.algo,l=[],P=P.SHA1=e.extend({_doReset:function(){this._hash=new t.init([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(t,e){for(var r=this._hash.words,i=r[0],n=r[1],o=r[2],s=r[3],c=r[4],a=0;a<80;a++){a<16?l[a]=0|t[e+a]:(h=l[a-3]^l[a-8]^l[a-14]^l[a-16],l[a]=h<<1|h>>>31);var h=(i<<5|i>>>27)+c+l[a];h+=a<20?1518500249+(n&o|~n&s):a<40?1859775393+(n^o^s):a<60?(n&o|n&s|o&s)-1894007588:(n^o^s)-899497514,c=s,s=o,o=n<<30|n>>>2,n=i,i=h}r[0]=r[0]+i|0,r[1]=r[1]+n|0,r[2]=r[2]+o|0,r[3]=r[3]+s|0,r[4]=r[4]+c|0},_doFinalize:function(){var t=this._data,e=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;return e[i>>>5]|=128<<24-i%32,e[14+(64+i>>>9<<4)]=Math.floor(r/4294967296),e[15+(64+i>>>9<<4)]=r,t.sigBytes=4*e.length,this._process(),this._hash},clone:function(){var t=e.clone.call(this);return t._hash=this._hash.clone(),t}}),M.SHA1=e._createHelper(P),M.HmacSHA1=e._createHmacHelper(P),function(n){var t=U,e=t.lib,r=e.WordArray,i=e.Hasher,e=t.algo,o=[],p=[];!function(){function t(t){return 4294967296*(t-(0|t))|0}for(var e=2,r=0;r<64;)!function(t){for(var e=n.sqrt(t),r=2;r<=e;r++)if(!(t%r))return;return 1}(e)||(r<8&&(o[r]=t(n.pow(e,.5))),p[r]=t(n.pow(e,1/3)),r++),e++}();var _=[],e=e.SHA256=i.extend({_doReset:function(){this._hash=new r.init(o.slice(0))},_doProcessBlock:function(t,e){for(var r=this._hash.words,i=r[0],n=r[1],o=r[2],s=r[3],c=r[4],a=r[5],h=r[6],l=r[7],f=0;f<64;f++){f<16?_[f]=0|t[e+f]:(d=_[f-15],u=_[f-2],_[f]=((d<<25|d>>>7)^(d<<14|d>>>18)^d>>>3)+_[f-7]+((u<<15|u>>>17)^(u<<13|u>>>19)^u>>>10)+_[f-16]);var d=i&n^i&o^n&o,u=l+((c<<26|c>>>6)^(c<<21|c>>>11)^(c<<7|c>>>25))+(c&a^~c&h)+p[f]+_[f],l=h,h=a,a=c,c=s+u|0,s=o,o=n,n=i,i=u+(((i<<30|i>>>2)^(i<<19|i>>>13)^(i<<10|i>>>22))+d)|0}r[0]=r[0]+i|0,r[1]=r[1]+n|0,r[2]=r[2]+o|0,r[3]=r[3]+s|0,r[4]=r[4]+c|0,r[5]=r[5]+a|0,r[6]=r[6]+h|0,r[7]=r[7]+l|0},_doFinalize:function(){var t=this._data,e=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;return e[i>>>5]|=128<<24-i%32,e[14+(64+i>>>9<<4)]=n.floor(r/4294967296),e[15+(64+i>>>9<<4)]=r,t.sigBytes=4*e.length,this._process(),this._hash},clone:function(){var t=i.clone.call(this);return t._hash=this._hash.clone(),t}});t.SHA256=i._createHelper(e),t.HmacSHA256=i._createHmacHelper(e)}(Math),r=(w=U).lib.WordArray,F=w.algo,i=F.SHA256,F=F.SHA224=i.extend({_doReset:function(){this._hash=new r.init([3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428])},_doFinalize:function(){var t=i._doFinalize.call(this);return t.sigBytes-=4,t}}),w.SHA224=i._createHelper(F),w.HmacSHA224=i._createHmacHelper(F),function(){var t=U,e=t.lib.Hasher,r=t.x64,i=r.Word,n=r.WordArray,r=t.algo;function o(){return i.create.apply(i,arguments)}var t1=[o(1116352408,3609767458),o(1899447441,602891725),o(3049323471,3964484399),o(3921009573,2173295548),o(961987163,4081628472),o(1508970993,3053834265),o(2453635748,2937671579),o(2870763221,3664609560),o(3624381080,2734883394),o(310598401,1164996542),o(607225278,1323610764),o(1426881987,3590304994),o(1925078388,4068182383),o(2162078206,991336113),o(2614888103,633803317),o(3248222580,3479774868),o(3835390401,2666613458),o(4022224774,944711139),o(264347078,2341262773),o(604807628,2007800933),o(770255983,1495990901),o(1249150122,1856431235),o(1555081692,3175218132),o(1996064986,2198950837),o(2554220882,3999719339),o(2821834349,766784016),o(2952996808,2566594879),o(3210313671,3203337956),o(3336571891,1034457026),o(3584528711,2466948901),o(113926993,3758326383),o(338241895,168717936),o(666307205,1188179964),o(773529912,1546045734),o(1294757372,1522805485),o(1396182291,2643833823),o(1695183700,2343527390),o(1986661051,1014477480),o(2177026350,1206759142),o(2456956037,344077627),o(2730485921,1290863460),o(2820302411,3158454273),o(3259730800,3505952657),o(3345764771,106217008),o(3516065817,3606008344),o(3600352804,1432725776),o(4094571909,1467031594),o(275423344,851169720),o(430227734,3100823752),o(506948616,1363258195),o(659060556,3750685593),o(883997877,3785050280),o(958139571,3318307427),o(1322822218,3812723403),o(1537002063,2003034995),o(1747873779,3602036899),o(1955562222,1575990012),o(2024104815,1125592928),o(2227730452,2716904306),o(2361852424,442776044),o(2428436474,593698344),o(2756734187,3733110249),o(3204031479,2999351573),o(3329325298,3815920427),o(3391569614,3928383900),o(3515267271,566280711),o(3940187606,3454069534),o(4118630271,4000239992),o(116418474,1914138554),o(174292421,2731055270),o(289380356,3203993006),o(460393269,320620315),o(685471733,587496836),o(852142971,1086792851),o(1017036298,365543100),o(1126000580,2618297676),o(1288033470,3409855158),o(1501505948,4234509866),o(1607167915,987167468),o(1816402316,1246189591)],e1=[];!function(){for(var t=0;t<80;t++)e1[t]=o()}();r=r.SHA512=e.extend({_doReset:function(){this._hash=new n.init([new i.init(1779033703,4089235720),new i.init(3144134277,2227873595),new i.init(1013904242,4271175723),new i.init(2773480762,1595750129),new i.init(1359893119,2917565137),new i.init(2600822924,725511199),new i.init(528734635,4215389547),new i.init(1541459225,327033209)])},_doProcessBlock:function(t,e){for(var r=this._hash.words,i=r[0],n=r[1],o=r[2],s=r[3],c=r[4],a=r[5],h=r[6],l=r[7],f=i.high,d=i.low,u=n.high,p=n.low,_=o.high,y=o.low,v=s.high,g=s.low,B=c.high,w=c.low,k=a.high,m=a.low,S=h.high,x=h.low,b=l.high,r=l.low,A=f,H=d,z=u,C=p,D=_,E=y,R=v,M=g,F=B,P=w,W=k,O=m,I=S,U=x,K=b,X=r,L=0;L<80;L++){var j,T,N=e1[L];L<16?(T=N.high=0|t[e+2*L],j=N.low=0|t[e+2*L+1]):($=(q=e1[L-15]).high,J=q.low,G=(Q=e1[L-2]).high,V=Q.low,Z=(Y=e1[L-7]).high,q=Y.low,Y=(Q=e1[L-16]).high,T=(T=(($>>>1|J<<31)^($>>>8|J<<24)^$>>>7)+Z+((j=(Z=(J>>>1|$<<31)^(J>>>8|$<<24)^(J>>>7|$<<25))+q)>>>0<Z>>>0?1:0))+((G>>>19|V<<13)^(G<<3|V>>>29)^G>>>6)+((j+=J=(V>>>19|G<<13)^(V<<3|G>>>29)^(V>>>6|G<<26))>>>0<J>>>0?1:0),j+=$=Q.low,N.high=T=T+Y+(j>>>0<$>>>0?1:0),N.low=j);var q=F&W^~F&I,Z=P&O^~P&U,V=A&z^A&D^z&D,G=(H>>>28|A<<4)^(H<<30|A>>>2)^(H<<25|A>>>7),J=t1[L],Q=J.high,Y=J.low,$=X+((P>>>14|F<<18)^(P>>>18|F<<14)^(P<<23|F>>>9)),N=K+((F>>>14|P<<18)^(F>>>18|P<<14)^(F<<23|P>>>9))+($>>>0<X>>>0?1:0),J=G+(H&C^H&E^C&E),K=I,X=U,I=W,U=O,W=F,O=P,F=R+(N=(N=(N=N+q+(($=$+Z)>>>0<Z>>>0?1:0))+Q+(($=$+Y)>>>0<Y>>>0?1:0))+T+(($=$+j)>>>0<j>>>0?1:0))+((P=M+$|0)>>>0<M>>>0?1:0)|0,R=D,M=E,D=z,E=C,z=A,C=H,A=N+(((A>>>28|H<<4)^(A<<30|H>>>2)^(A<<25|H>>>7))+V+(J>>>0<G>>>0?1:0))+((H=$+J|0)>>>0<$>>>0?1:0)|0}d=i.low=d+H,i.high=f+A+(d>>>0<H>>>0?1:0),p=n.low=p+C,n.high=u+z+(p>>>0<C>>>0?1:0),y=o.low=y+E,o.high=_+D+(y>>>0<E>>>0?1:0),g=s.low=g+M,s.high=v+R+(g>>>0<M>>>0?1:0),w=c.low=w+P,c.high=B+F+(w>>>0<P>>>0?1:0),m=a.low=m+O,a.high=k+W+(m>>>0<O>>>0?1:0),x=h.low=x+U,h.high=S+I+(x>>>0<U>>>0?1:0),r=l.low=r+X,l.high=b+K+(r>>>0<X>>>0?1:0)},_doFinalize:function(){var t=this._data,e=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;return e[i>>>5]|=128<<24-i%32,e[30+(128+i>>>10<<5)]=Math.floor(r/4294967296),e[31+(128+i>>>10<<5)]=r,t.sigBytes=4*e.length,this._process(),this._hash.toX32()},clone:function(){var t=e.clone.call(this);return t._hash=this._hash.clone(),t},blockSize:32});t.SHA512=e._createHelper(r),t.HmacSHA512=e._createHmacHelper(r)}(),P=(M=U).x64,c=P.Word,f=P.WordArray,P=M.algo,d=P.SHA512,P=P.SHA384=d.extend({_doReset:function(){this._hash=new f.init([new c.init(3418070365,3238371032),new c.init(1654270250,914150663),new c.init(2438529370,812702999),new c.init(355462360,4144912697),new c.init(1731405415,4290775857),new c.init(2394180231,1750603025),new c.init(3675008525,1694076839),new c.init(1203062813,3204075428)])},_doFinalize:function(){var t=d._doFinalize.call(this);return t.sigBytes-=16,t}}),M.SHA384=d._createHelper(P),M.HmacSHA384=d._createHmacHelper(P),function(l){var t=U,e=t.lib,f=e.WordArray,i=e.Hasher,d=t.x64.Word,e=t.algo,A=[],H=[],z=[];!function(){for(var t=1,e=0,r=0;r<24;r++){A[t+5*e]=(r+1)*(r+2)/2%64;var i=(2*t+3*e)%5;t=e%5,e=i}for(t=0;t<5;t++)for(e=0;e<5;e++)H[t+5*e]=e+(2*t+3*e)%5*5;for(var n=1,o=0;o<24;o++){for(var s,c=0,a=0,h=0;h<7;h++)1&n&&((s=(1<<h)-1)<32?a^=1<<s:c^=1<<s-32),128&n?n=n<<1^113:n<<=1;z[o]=d.create(c,a)}}();var C=[];!function(){for(var t=0;t<25;t++)C[t]=d.create()}();e=e.SHA3=i.extend({cfg:i.cfg.extend({outputLength:512}),_doReset:function(){for(var t=this._state=[],e=0;e<25;e++)t[e]=new d.init;this.blockSize=(1600-2*this.cfg.outputLength)/32},_doProcessBlock:function(t,e){for(var r=this._state,i=this.blockSize/2,n=0;n<i;n++){var o=t[e+2*n],s=t[e+2*n+1],o=16711935&(o<<8|o>>>24)|4278255360&(o<<24|o>>>8);(m=r[n]).high^=s=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8),m.low^=o}for(var c=0;c<24;c++){for(var a=0;a<5;a++){for(var h=0,l=0,f=0;f<5;f++)h^=(m=r[a+5*f]).high,l^=m.low;var d=C[a];d.high=h,d.low=l}for(a=0;a<5;a++)for(var u=C[(a+4)%5],p=C[(a+1)%5],_=p.high,p=p.low,h=u.high^(_<<1|p>>>31),l=u.low^(p<<1|_>>>31),f=0;f<5;f++)(m=r[a+5*f]).high^=h,m.low^=l;for(var y=1;y<25;y++){var v=(m=r[y]).high,g=m.low,B=A[y];l=B<32?(h=v<<B|g>>>32-B,g<<B|v>>>32-B):(h=g<<B-32|v>>>64-B,v<<B-32|g>>>64-B);B=C[H[y]];B.high=h,B.low=l}var w=C[0],k=r[0];w.high=k.high,w.low=k.low;for(a=0;a<5;a++)for(f=0;f<5;f++){var m=r[y=a+5*f],S=C[y],x=C[(a+1)%5+5*f],b=C[(a+2)%5+5*f];m.high=S.high^~x.high&b.high,m.low=S.low^~x.low&b.low}m=r[0],k=z[c];m.high^=k.high,m.low^=k.low}},_doFinalize:function(){var t=this._data,e=t.words,r=(this._nDataBytes,8*t.sigBytes),i=32*this.blockSize;e[r>>>5]|=1<<24-r%32,e[(l.ceil((1+r)/i)*i>>>5)-1]|=128,t.sigBytes=4*e.length,this._process();for(var n=this._state,e=this.cfg.outputLength/8,o=e/8,s=[],c=0;c<o;c++){var a=n[c],h=a.high,a=a.low,h=16711935&(h<<8|h>>>24)|4278255360&(h<<24|h>>>8);s.push(a=16711935&(a<<8|a>>>24)|4278255360&(a<<24|a>>>8)),s.push(h)}return new f.init(s,e)},clone:function(){for(var t=i.clone.call(this),e=t._state=this._state.slice(0),r=0;r<25;r++)e[r]=e[r].clone();return t}});t.SHA3=i._createHelper(e),t.HmacSHA3=i._createHmacHelper(e)}(Math),Math,F=(w=U).lib,u=F.WordArray,p=F.Hasher,F=w.algo,S=u.create([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,7,4,13,1,10,6,15,3,12,0,9,5,2,14,11,8,3,10,14,4,9,15,8,1,2,7,0,6,13,11,5,12,1,9,11,10,0,8,12,4,13,3,7,15,14,5,6,2,4,0,5,9,7,12,2,10,14,1,3,8,11,6,15,13]),x=u.create([5,14,7,0,9,2,11,4,13,6,15,8,1,10,3,12,6,11,3,7,0,13,5,10,14,15,8,12,4,9,1,2,15,5,1,3,7,14,6,9,11,8,12,2,10,0,4,13,8,6,4,1,3,11,15,0,5,12,2,13,9,7,10,14,12,15,10,4,1,5,8,7,6,2,13,14,0,3,9,11]),b=u.create([11,14,15,12,5,8,7,9,11,13,14,15,6,7,9,8,7,6,8,13,11,9,7,15,7,12,15,9,11,7,13,12,11,13,6,7,14,9,13,15,14,8,13,6,5,12,7,5,11,12,14,15,14,15,9,8,9,14,5,6,8,6,5,12,9,15,5,11,6,8,13,12,5,12,13,14,11,8,5,6]),A=u.create([8,9,9,11,13,15,15,5,7,7,8,11,14,14,12,6,9,13,15,7,12,8,9,11,7,7,12,7,6,15,13,11,9,7,15,11,8,6,6,14,12,13,5,14,13,13,7,5,15,5,8,11,14,14,6,14,6,9,12,9,12,5,15,8,8,5,12,9,12,5,14,6,8,13,6,5,15,13,11,11]),H=u.create([0,1518500249,1859775393,2400959708,2840853838]),z=u.create([1352829926,1548603684,1836072691,2053994217,0]),F=F.RIPEMD160=p.extend({_doReset:function(){this._hash=u.create([1732584193,4023233417,2562383102,271733878,3285377520])},_doProcessBlock:function(t,e){for(var r=0;r<16;r++){var i=e+r,n=t[i];t[i]=16711935&(n<<8|n>>>24)|4278255360&(n<<24|n>>>8)}for(var o,s,c,a,h,l,f=this._hash.words,d=H.words,u=z.words,p=S.words,_=x.words,y=b.words,v=A.words,g=o=f[0],B=s=f[1],w=c=f[2],k=a=f[3],m=h=f[4],r=0;r<80;r+=1)l=o+t[e+p[r]]|0,l+=r<16?(s^c^a)+d[0]:r<32?K(s,c,a)+d[1]:r<48?((s|~c)^a)+d[2]:r<64?X(s,c,a)+d[3]:(s^(c|~a))+d[4],l=(l=L(l|=0,y[r]))+h|0,o=h,h=a,a=L(c,10),c=s,s=l,l=g+t[e+_[r]]|0,l+=r<16?(B^(w|~k))+u[0]:r<32?X(B,w,k)+u[1]:r<48?((B|~w)^k)+u[2]:r<64?K(B,w,k)+u[3]:(B^w^k)+u[4],l=(l=L(l|=0,v[r]))+m|0,g=m,m=k,k=L(w,10),w=B,B=l;l=f[1]+c+k|0,f[1]=f[2]+a+m|0,f[2]=f[3]+h+g|0,f[3]=f[4]+o+B|0,f[4]=f[0]+s+w|0,f[0]=l},_doFinalize:function(){var t=this._data,e=t.words,r=8*this._nDataBytes,i=8*t.sigBytes;e[i>>>5]|=128<<24-i%32,e[14+(64+i>>>9<<4)]=16711935&(r<<8|r>>>24)|4278255360&(r<<24|r>>>8),t.sigBytes=4*(e.length+1),this._process();for(var e=this._hash,n=e.words,o=0;o<5;o++){var s=n[o];n[o]=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8)}return e},clone:function(){var t=p.clone.call(this);return t._hash=this._hash.clone(),t}}),w.RIPEMD160=p._createHelper(F),w.HmacRIPEMD160=p._createHmacHelper(F),P=(M=U).lib.Base,_=M.enc.Utf8,M.algo.HMAC=P.extend({init:function(t,e){t=this._hasher=new t.init,"string"==typeof e&&(e=_.parse(e));var r=t.blockSize,i=4*r;(e=e.sigBytes>i?t.finalize(e):e).clamp();for(var t=this._oKey=e.clone(),e=this._iKey=e.clone(),n=t.words,o=e.words,s=0;s<r;s++)n[s]^=1549556828,o[s]^=909522486;t.sigBytes=e.sigBytes=i,this.reset()},reset:function(){var t=this._hasher;t.reset(),t.update(this._iKey)},update:function(t){return this._hasher.update(t),this},finalize:function(t){var e=this._hasher,t=e.finalize(t);return e.reset(),e.finalize(this._oKey.clone().concat(t))}}),F=(w=U).lib,M=F.Base,v=F.WordArray,P=w.algo,F=P.SHA1,g=P.HMAC,y=P.PBKDF2=M.extend({cfg:M.extend({keySize:4,hasher:F,iterations:1}),init:function(t){this.cfg=this.cfg.extend(t)},compute:function(t,e){for(var r=this.cfg,i=g.create(r.hasher,t),n=v.create(),o=v.create([1]),s=n.words,c=o.words,a=r.keySize,h=r.iterations;s.length<a;){var l=i.update(e).finalize(o);i.reset();for(var f=l.words,d=f.length,u=l,p=1;p<h;p++){u=i.finalize(u),i.reset();for(var _=u.words,y=0;y<d;y++)f[y]^=_[y]}n.concat(l),c[0]++}return n.sigBytes=4*a,n}}),w.PBKDF2=function(t,e,r){return y.create(r).compute(t,e)},M=(P=U).lib,F=M.Base,B=M.WordArray,w=P.algo,M=w.MD5,k=w.EvpKDF=F.extend({cfg:F.extend({keySize:4,hasher:M,iterations:1}),init:function(t){this.cfg=this.cfg.extend(t)},compute:function(t,e){for(var r,i=this.cfg,n=i.hasher.create(),o=B.create(),s=o.words,c=i.keySize,a=i.iterations;s.length<c;){r&&n.update(r),r=n.update(t).finalize(e),n.reset();for(var h=1;h<a;h++)r=n.finalize(r),n.reset();o.concat(r)}return o.sigBytes=4*c,o}}),P.EvpKDF=function(t,e,r){return k.create(r).compute(t,e)},U.lib.Cipher||function(){var t=U,e=t.lib,r=e.Base,s=e.WordArray,i=e.BufferedBlockAlgorithm,n=t.enc,o=(n.Utf8,n.Base64),c=t.algo.EvpKDF,a=e.Cipher=i.extend({cfg:r.extend(),createEncryptor:function(t,e){return this.create(this._ENC_XFORM_MODE,t,e)},createDecryptor:function(t,e){return this.create(this._DEC_XFORM_MODE,t,e)},init:function(t,e,r){this.cfg=this.cfg.extend(r),this._xformMode=t,this._key=e,this.reset()},reset:function(){i.reset.call(this),this._doReset()},process:function(t){return this._append(t),this._process()},finalize:function(t){return t&&this._append(t),this._doFinalize()},keySize:4,ivSize:4,_ENC_XFORM_MODE:1,_DEC_XFORM_MODE:2,_createHelper:function(i){return{encrypt:function(t,e,r){return h(e).encrypt(i,t,e,r)},decrypt:function(t,e,r){return h(e).decrypt(i,t,e,r)}}}});function h(t){return"string"==typeof t?p:u}e.StreamCipher=a.extend({_doFinalize:function(){return this._process(!0)},blockSize:1});var l=t.mode={},n=e.BlockCipherMode=r.extend({createEncryptor:function(t,e){return this.Encryptor.create(t,e)},createDecryptor:function(t,e){return this.Decryptor.create(t,e)},init:function(t,e){this._cipher=t,this._iv=e}}),n=l.CBC=((l=n.extend()).Encryptor=l.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize;f.call(this,t,e,i),r.encryptBlock(t,e),this._prevBlock=t.slice(e,e+i)}}),l.Decryptor=l.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize,n=t.slice(e,e+i);r.decryptBlock(t,e),f.call(this,t,e,i),this._prevBlock=n}}),l);function f(t,e,r){var i,n=this._iv;n?(i=n,this._iv=void 0):i=this._prevBlock;for(var o=0;o<r;o++)t[e+o]^=i[o]}var l=(t.pad={}).Pkcs7={pad:function(t,e){for(var e=4*e,r=e-t.sigBytes%e,i=r<<24|r<<16|r<<8|r,n=[],o=0;o<r;o+=4)n.push(i);e=s.create(n,r);t.concat(e)},unpad:function(t){var e=255&t.words[t.sigBytes-1>>>2];t.sigBytes-=e}},d=(e.BlockCipher=a.extend({cfg:a.cfg.extend({mode:n,padding:l}),reset:function(){var t;a.reset.call(this);var e=this.cfg,r=e.iv,e=e.mode;this._xformMode==this._ENC_XFORM_MODE?t=e.createEncryptor:(t=e.createDecryptor,this._minBufferSize=1),this._mode&&this._mode.__creator==t?this._mode.init(this,r&&r.words):(this._mode=t.call(e,this,r&&r.words),this._mode.__creator=t)},_doProcessBlock:function(t,e){this._mode.processBlock(t,e)},_doFinalize:function(){var t,e=this.cfg.padding;return this._xformMode==this._ENC_XFORM_MODE?(e.pad(this._data,this.blockSize),t=this._process(!0)):(t=this._process(!0),e.unpad(t)),t},blockSize:4}),e.CipherParams=r.extend({init:function(t){this.mixIn(t)},toString:function(t){return(t||this.formatter).stringify(this)}})),l=(t.format={}).OpenSSL={stringify:function(t){var e=t.ciphertext,t=t.salt,e=t?s.create([1398893684,1701076831]).concat(t).concat(e):e;return e.toString(o)},parse:function(t){var e,r=o.parse(t),t=r.words;return 1398893684==t[0]&&1701076831==t[1]&&(e=s.create(t.slice(2,4)),t.splice(0,4),r.sigBytes-=16),d.create({ciphertext:r,salt:e})}},u=e.SerializableCipher=r.extend({cfg:r.extend({format:l}),encrypt:function(t,e,r,i){i=this.cfg.extend(i);var n=t.createEncryptor(r,i),e=n.finalize(e),n=n.cfg;return d.create({ciphertext:e,key:r,iv:n.iv,algorithm:t,mode:n.mode,padding:n.padding,blockSize:t.blockSize,formatter:i.format})},decrypt:function(t,e,r,i){return i=this.cfg.extend(i),e=this._parse(e,i.format),t.createDecryptor(r,i).finalize(e.ciphertext)},_parse:function(t,e){return"string"==typeof t?e.parse(t,this):t}}),t=(t.kdf={}).OpenSSL={execute:function(t,e,r,i){i=i||s.random(8);t=c.create({keySize:e+r}).compute(t,i),r=s.create(t.words.slice(e),4*r);return t.sigBytes=4*e,d.create({key:t,iv:r,salt:i})}},p=e.PasswordBasedCipher=u.extend({cfg:u.cfg.extend({kdf:t}),encrypt:function(t,e,r,i){r=(i=this.cfg.extend(i)).kdf.execute(r,t.keySize,t.ivSize);i.iv=r.iv;i=u.encrypt.call(this,t,e,r.key,i);return i.mixIn(r),i},decrypt:function(t,e,r,i){i=this.cfg.extend(i),e=this._parse(e,i.format);r=i.kdf.execute(r,t.keySize,t.ivSize,e.salt);return i.iv=r.iv,u.decrypt.call(this,t,e,r.key,i)}})}(),U.mode.CFB=((F=U.lib.BlockCipherMode.extend()).Encryptor=F.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize;j.call(this,t,e,i,r),this._prevBlock=t.slice(e,e+i)}}),F.Decryptor=F.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize,n=t.slice(e,e+i);j.call(this,t,e,i,r),this._prevBlock=n}}),F),U.mode.CTR=(M=U.lib.BlockCipherMode.extend(),P=M.Encryptor=M.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize,n=this._iv,o=this._counter;n&&(o=this._counter=n.slice(0),this._iv=void 0);var s=o.slice(0);r.encryptBlock(s,0),o[i-1]=o[i-1]+1|0;for(var c=0;c<i;c++)t[e+c]^=s[c]}}),M.Decryptor=P,M),U.mode.CTRGladman=(F=U.lib.BlockCipherMode.extend(),P=F.Encryptor=F.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize,n=this._iv,o=this._counter;n&&(o=this._counter=n.slice(0),this._iv=void 0),0===((n=o)[0]=T(n[0]))&&(n[1]=T(n[1]));var s=o.slice(0);r.encryptBlock(s,0);for(var c=0;c<i;c++)t[e+c]^=s[c]}}),F.Decryptor=P,F),U.mode.OFB=(M=U.lib.BlockCipherMode.extend(),P=M.Encryptor=M.extend({processBlock:function(t,e){var r=this._cipher,i=r.blockSize,n=this._iv,o=this._keystream;n&&(o=this._keystream=n.slice(0),this._iv=void 0),r.encryptBlock(o,0);for(var s=0;s<i;s++)t[e+s]^=o[s]}}),M.Decryptor=P,M),U.mode.ECB=((F=U.lib.BlockCipherMode.extend()).Encryptor=F.extend({processBlock:function(t,e){this._cipher.encryptBlock(t,e)}}),F.Decryptor=F.extend({processBlock:function(t,e){this._cipher.decryptBlock(t,e)}}),F),U.pad.AnsiX923={pad:function(t,e){var r=t.sigBytes,e=4*e,e=e-r%e,r=r+e-1;t.clamp(),t.words[r>>>2]|=e<<24-r%4*8,t.sigBytes+=e},unpad:function(t){var e=255&t.words[t.sigBytes-1>>>2];t.sigBytes-=e}},U.pad.Iso10126={pad:function(t,e){e*=4,e-=t.sigBytes%e;t.concat(U.lib.WordArray.random(e-1)).concat(U.lib.WordArray.create([e<<24],1))},unpad:function(t){var e=255&t.words[t.sigBytes-1>>>2];t.sigBytes-=e}},U.pad.Iso97971={pad:function(t,e){t.concat(U.lib.WordArray.create([2147483648],1)),U.pad.ZeroPadding.pad(t,e)},unpad:function(t){U.pad.ZeroPadding.unpad(t),t.sigBytes--}},U.pad.ZeroPadding={pad:function(t,e){e*=4;t.clamp(),t.sigBytes+=e-(t.sigBytes%e||e)},unpad:function(t){for(var e=t.words,r=t.sigBytes-1,r=t.sigBytes-1;0<=r;r--)if(e[r>>>2]>>>24-r%4*8&255){t.sigBytes=r+1;break}}},U.pad.NoPadding={pad:function(){},unpad:function(){}},m=(P=U).lib.CipherParams,C=P.enc.Hex,P.format.Hex={stringify:function(t){return t.ciphertext.toString(C)},parse:function(t){t=C.parse(t);return m.create({ciphertext:t})}},function(){var t=U,e=t.lib.BlockCipher,r=t.algo,h=[],l=[],f=[],d=[],u=[],p=[],_=[],y=[],v=[],g=[];!function(){for(var t=[],e=0;e<256;e++)t[e]=e<128?e<<1:e<<1^283;for(var r=0,i=0,e=0;e<256;e++){var n=i^i<<1^i<<2^i<<3^i<<4;h[r]=n=n>>>8^255&n^99;var o=t[l[n]=r],s=t[o],c=t[s],a=257*t[n]^16843008*n;f[r]=a<<24|a>>>8,d[r]=a<<16|a>>>16,u[r]=a<<8|a>>>24,p[r]=a,_[n]=(a=16843009*c^65537*s^257*o^16843008*r)<<24|a>>>8,y[n]=a<<16|a>>>16,v[n]=a<<8|a>>>24,g[n]=a,r?(r=o^t[t[t[c^o]]],i^=t[t[i]]):r=i=1}}();var B=[0,1,2,4,8,16,32,64,128,27,54],r=r.AES=e.extend({_doReset:function(){if(!this._nRounds||this._keyPriorReset!==this._key){for(var t=this._keyPriorReset=this._key,e=t.words,r=t.sigBytes/4,i=4*(1+(this._nRounds=6+r)),n=this._keySchedule=[],o=0;o<i;o++)o<r?n[o]=e[o]:(a=n[o-1],o%r?6<r&&o%r==4&&(a=h[a>>>24]<<24|h[a>>>16&255]<<16|h[a>>>8&255]<<8|h[255&a]):(a=h[(a=a<<8|a>>>24)>>>24]<<24|h[a>>>16&255]<<16|h[a>>>8&255]<<8|h[255&a],a^=B[o/r|0]<<24),n[o]=n[o-r]^a);for(var s=this._invKeySchedule=[],c=0;c<i;c++){var a,o=i-c;a=c%4?n[o]:n[o-4],s[c]=c<4||o<=4?a:_[h[a>>>24]]^y[h[a>>>16&255]]^v[h[a>>>8&255]]^g[h[255&a]]}}},encryptBlock:function(t,e){this._doCryptBlock(t,e,this._keySchedule,f,d,u,p,h)},decryptBlock:function(t,e){var r=t[e+1];t[e+1]=t[e+3],t[e+3]=r,this._doCryptBlock(t,e,this._invKeySchedule,_,y,v,g,l);r=t[e+1];t[e+1]=t[e+3],t[e+3]=r},_doCryptBlock:function(t,e,r,i,n,o,s,c){for(var a=this._nRounds,h=t[e]^r[0],l=t[e+1]^r[1],f=t[e+2]^r[2],d=t[e+3]^r[3],u=4,p=1;p<a;p++)var _=i[h>>>24]^n[l>>>16&255]^o[f>>>8&255]^s[255&d]^r[u++],y=i[l>>>24]^n[f>>>16&255]^o[d>>>8&255]^s[255&h]^r[u++],v=i[f>>>24]^n[d>>>16&255]^o[h>>>8&255]^s[255&l]^r[u++],g=i[d>>>24]^n[h>>>16&255]^o[l>>>8&255]^s[255&f]^r[u++],h=_,l=y,f=v,d=g;_=(c[h>>>24]<<24|c[l>>>16&255]<<16|c[f>>>8&255]<<8|c[255&d])^r[u++],y=(c[l>>>24]<<24|c[f>>>16&255]<<16|c[d>>>8&255]<<8|c[255&h])^r[u++],v=(c[f>>>24]<<24|c[d>>>16&255]<<16|c[h>>>8&255]<<8|c[255&l])^r[u++],g=(c[d>>>24]<<24|c[h>>>16&255]<<16|c[l>>>8&255]<<8|c[255&f])^r[u++];t[e]=_,t[e+1]=y,t[e+2]=v,t[e+3]=g},keySize:8});t.AES=e._createHelper(r)}(),function(){var t=U,e=t.lib,i=e.WordArray,r=e.BlockCipher,e=t.algo,h=[57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4],l=[14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,41,52,31,37,47,55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32],f=[1,2,4,6,8,10,12,14,15,17,19,21,23,25,27,28],d=[{0:8421888,268435456:32768,536870912:8421378,805306368:2,1073741824:512,1342177280:8421890,1610612736:8389122,1879048192:8388608,2147483648:514,2415919104:8389120,2684354560:33280,2952790016:8421376,3221225472:32770,3489660928:8388610,3758096384:0,4026531840:33282,134217728:0,402653184:8421890,671088640:33282,939524096:32768,1207959552:8421888,1476395008:512,1744830464:8421378,2013265920:2,2281701376:8389120,2550136832:33280,2818572288:8421376,3087007744:8389122,3355443200:8388610,3623878656:32770,3892314112:514,4160749568:8388608,1:32768,268435457:2,536870913:8421888,805306369:8388608,1073741825:8421378,1342177281:33280,1610612737:512,1879048193:8389122,2147483649:8421890,2415919105:8421376,2684354561:8388610,2952790017:33282,3221225473:514,3489660929:8389120,3758096385:32770,4026531841:0,134217729:8421890,402653185:8421376,671088641:8388608,939524097:512,1207959553:32768,1476395009:8388610,1744830465:2,2013265921:33282,2281701377:32770,2550136833:8389122,2818572289:514,3087007745:8421888,3355443201:8389120,3623878657:0,3892314113:33280,4160749569:8421378},{0:1074282512,16777216:16384,33554432:524288,50331648:1074266128,67108864:1073741840,83886080:1074282496,100663296:1073758208,117440512:16,134217728:540672,150994944:1073758224,167772160:1073741824,184549376:540688,201326592:524304,218103808:0,234881024:16400,251658240:1074266112,8388608:1073758208,25165824:540688,41943040:16,58720256:1073758224,75497472:1074282512,92274688:1073741824,109051904:524288,125829120:1074266128,142606336:524304,159383552:0,176160768:16384,192937984:1074266112,209715200:1073741840,226492416:540672,243269632:1074282496,260046848:16400,268435456:0,285212672:1074266128,301989888:1073758224,318767104:1074282496,335544320:1074266112,352321536:16,369098752:540688,385875968:16384,402653184:16400,419430400:524288,436207616:524304,452984832:1073741840,469762048:540672,486539264:1073758208,503316480:1073741824,520093696:1074282512,276824064:540688,293601280:524288,310378496:1074266112,327155712:16384,343932928:1073758208,360710144:1074282512,377487360:16,394264576:1073741824,411041792:1074282496,427819008:1073741840,444596224:1073758224,461373440:524304,478150656:0,494927872:16400,511705088:1074266128,528482304:540672},{0:260,1048576:0,2097152:67109120,3145728:65796,4194304:65540,5242880:67108868,6291456:67174660,7340032:67174400,8388608:67108864,9437184:67174656,10485760:65792,11534336:67174404,12582912:67109124,13631488:65536,14680064:4,15728640:256,524288:67174656,1572864:67174404,2621440:0,3670016:67109120,4718592:67108868,5767168:65536,6815744:65540,7864320:260,8912896:4,9961472:256,11010048:67174400,12058624:65796,13107200:65792,14155776:67109124,15204352:67174660,16252928:67108864,16777216:67174656,17825792:65540,18874368:65536,19922944:67109120,20971520:256,22020096:67174660,23068672:67108868,24117248:0,25165824:67109124,26214400:67108864,27262976:4,28311552:65792,29360128:67174400,30408704:260,31457280:65796,32505856:67174404,17301504:67108864,18350080:260,19398656:67174656,20447232:0,21495808:65540,22544384:67109120,23592960:256,24641536:67174404,25690112:65536,26738688:67174660,27787264:65796,28835840:67108868,29884416:67109124,30932992:67174400,31981568:4,33030144:65792},{0:2151682048,65536:2147487808,131072:4198464,196608:2151677952,262144:0,327680:4198400,393216:2147483712,458752:4194368,524288:2147483648,589824:4194304,655360:64,720896:2147487744,786432:2151678016,851968:4160,917504:4096,983040:2151682112,32768:2147487808,98304:64,163840:2151678016,229376:2147487744,294912:4198400,360448:2151682112,425984:0,491520:2151677952,557056:4096,622592:2151682048,688128:4194304,753664:4160,819200:2147483648,884736:4194368,950272:4198464,1015808:2147483712,1048576:4194368,1114112:4198400,1179648:2147483712,1245184:0,1310720:4160,1376256:2151678016,1441792:2151682048,1507328:2147487808,1572864:2151682112,1638400:2147483648,1703936:2151677952,1769472:4198464,1835008:2147487744,1900544:4194304,1966080:64,2031616:4096,1081344:2151677952,1146880:2151682112,1212416:0,1277952:4198400,1343488:4194368,1409024:2147483648,1474560:2147487808,1540096:64,1605632:2147483712,1671168:4096,1736704:2147487744,1802240:2151678016,1867776:4160,1933312:2151682048,1998848:4194304,2064384:4198464},{0:128,4096:17039360,8192:262144,12288:536870912,16384:537133184,20480:16777344,24576:553648256,28672:262272,32768:16777216,36864:537133056,40960:536871040,45056:553910400,49152:553910272,53248:0,57344:17039488,61440:553648128,2048:17039488,6144:553648256,10240:128,14336:17039360,18432:262144,22528:537133184,26624:553910272,30720:536870912,34816:537133056,38912:0,43008:553910400,47104:16777344,51200:536871040,55296:553648128,59392:16777216,63488:262272,65536:262144,69632:128,73728:536870912,77824:553648256,81920:16777344,86016:553910272,90112:537133184,94208:16777216,98304:553910400,102400:553648128,106496:17039360,110592:537133056,114688:262272,118784:536871040,122880:0,126976:17039488,67584:553648256,71680:16777216,75776:17039360,79872:537133184,83968:536870912,88064:17039488,92160:128,96256:553910272,100352:262272,104448:553910400,108544:0,112640:553648128,116736:16777344,120832:262144,124928:537133056,129024:536871040},{0:268435464,256:8192,512:270532608,768:270540808,1024:268443648,1280:2097152,1536:2097160,1792:268435456,2048:0,2304:268443656,2560:2105344,2816:8,3072:270532616,3328:2105352,3584:8200,3840:270540800,128:270532608,384:270540808,640:8,896:2097152,1152:2105352,1408:268435464,1664:268443648,1920:8200,2176:2097160,2432:8192,2688:268443656,2944:270532616,3200:0,3456:270540800,3712:2105344,3968:268435456,4096:268443648,4352:270532616,4608:270540808,4864:8200,5120:2097152,5376:268435456,5632:268435464,5888:2105344,6144:2105352,6400:0,6656:8,6912:270532608,7168:8192,7424:268443656,7680:270540800,7936:2097160,4224:8,4480:2105344,4736:2097152,4992:268435464,5248:268443648,5504:8200,5760:270540808,6016:270532608,6272:270540800,6528:270532616,6784:8192,7040:2105352,7296:2097160,7552:0,7808:268435456,8064:268443656},{0:1048576,16:33555457,32:1024,48:1049601,64:34604033,80:0,96:1,112:34603009,128:33555456,144:1048577,160:33554433,176:34604032,192:34603008,208:1025,224:1049600,240:33554432,8:34603009,24:0,40:33555457,56:34604032,72:1048576,88:33554433,104:33554432,120:1025,136:1049601,152:33555456,168:34603008,184:1048577,200:1024,216:34604033,232:1,248:1049600,256:33554432,272:1048576,288:33555457,304:34603009,320:1048577,336:33555456,352:34604032,368:1049601,384:1025,400:34604033,416:1049600,432:1,448:0,464:34603008,480:33554433,496:1024,264:1049600,280:33555457,296:34603009,312:1,328:33554432,344:1048576,360:1025,376:34604032,392:33554433,408:34603008,424:0,440:34604033,456:1049601,472:1024,488:33555456,504:1048577},{0:134219808,1:131072,2:134217728,3:32,4:131104,5:134350880,6:134350848,7:2048,8:134348800,9:134219776,10:133120,11:134348832,12:2080,13:0,14:134217760,15:133152,2147483648:2048,2147483649:134350880,2147483650:134219808,2147483651:134217728,2147483652:134348800,2147483653:133120,2147483654:133152,2147483655:32,2147483656:134217760,2147483657:2080,2147483658:131104,2147483659:134350848,2147483660:0,2147483661:134348832,2147483662:134219776,2147483663:131072,16:133152,17:134350848,18:32,19:2048,20:134219776,21:134217760,22:134348832,23:131072,24:0,25:131104,26:134348800,27:134219808,28:134350880,29:133120,30:2080,31:134217728,2147483664:131072,2147483665:2048,2147483666:134348832,2147483667:133152,2147483668:32,2147483669:134348800,2147483670:134217728,2147483671:134219808,2147483672:134350880,2147483673:134217760,2147483674:134219776,2147483675:0,2147483676:133120,2147483677:2080,2147483678:131104,2147483679:134350848}],u=[4160749569,528482304,33030144,2064384,129024,8064,504,2147483679],n=e.DES=r.extend({_doReset:function(){for(var t=this._key.words,e=[],r=0;r<56;r++){var i=h[r]-1;e[r]=t[i>>>5]>>>31-i%32&1}for(var n=this._subKeys=[],o=0;o<16;o++){for(var s=n[o]=[],c=f[o],r=0;r<24;r++)s[r/6|0]|=e[(l[r]-1+c)%28]<<31-r%6,s[4+(r/6|0)]|=e[28+(l[r+24]-1+c)%28]<<31-r%6;s[0]=s[0]<<1|s[0]>>>31;for(r=1;r<7;r++)s[r]=s[r]>>>4*(r-1)+3;s[7]=s[7]<<5|s[7]>>>27}for(var a=this._invSubKeys=[],r=0;r<16;r++)a[r]=n[15-r]},encryptBlock:function(t,e){this._doCryptBlock(t,e,this._subKeys)},decryptBlock:function(t,e){this._doCryptBlock(t,e,this._invSubKeys)},_doCryptBlock:function(t,e,r){this._lBlock=t[e],this._rBlock=t[e+1],p.call(this,4,252645135),p.call(this,16,65535),_.call(this,2,858993459),_.call(this,8,16711935),p.call(this,1,1431655765);for(var i=0;i<16;i++){for(var n=r[i],o=this._lBlock,s=this._rBlock,c=0,a=0;a<8;a++)c|=d[a][((s^n[a])&u[a])>>>0];this._lBlock=s,this._rBlock=o^c}var h=this._lBlock;this._lBlock=this._rBlock,this._rBlock=h,p.call(this,1,1431655765),_.call(this,8,16711935),_.call(this,2,858993459),p.call(this,16,65535),p.call(this,4,252645135),t[e]=this._lBlock,t[e+1]=this._rBlock},keySize:2,ivSize:2,blockSize:2});function p(t,e){e=(this._lBlock>>>t^this._rBlock)&e;this._rBlock^=e,this._lBlock^=e<<t}function _(t,e){e=(this._rBlock>>>t^this._lBlock)&e;this._lBlock^=e,this._rBlock^=e<<t}t.DES=r._createHelper(n);e=e.TripleDES=r.extend({_doReset:function(){var t=this._key.words;if(2!==t.length&&4!==t.length&&t.length<6)throw new Error("Invalid key length - 3DES requires the key length to be 64, 128, 192 or >192.");var e=t.slice(0,2),r=t.length<4?t.slice(0,2):t.slice(2,4),t=t.length<6?t.slice(0,2):t.slice(4,6);this._des1=n.createEncryptor(i.create(e)),this._des2=n.createEncryptor(i.create(r)),this._des3=n.createEncryptor(i.create(t))},encryptBlock:function(t,e){this._des1.encryptBlock(t,e),this._des2.decryptBlock(t,e),this._des3.encryptBlock(t,e)},decryptBlock:function(t,e){this._des3.decryptBlock(t,e),this._des2.encryptBlock(t,e),this._des1.decryptBlock(t,e)},keySize:6,ivSize:2,blockSize:2});t.TripleDES=r._createHelper(e)}(),function(){var t=U,e=t.lib.StreamCipher,r=t.algo,i=r.RC4=e.extend({_doReset:function(){for(var t=this._key,e=t.words,r=t.sigBytes,i=this._S=[],n=0;n<256;n++)i[n]=n;for(var n=0,o=0;n<256;n++){var s=n%r,s=e[s>>>2]>>>24-s%4*8&255,o=(o+i[n]+s)%256,s=i[n];i[n]=i[o],i[o]=s}this._i=this._j=0},_doProcessBlock:function(t,e){t[e]^=n.call(this)},keySize:8,ivSize:0});function n(){for(var t=this._S,e=this._i,r=this._j,i=0,n=0;n<4;n++){var r=(r+t[e=(e+1)%256])%256,o=t[e];t[e]=t[r],t[r]=o,i|=t[(t[e]+t[r])%256]<<24-8*n}return this._i=e,this._j=r,i}t.RC4=e._createHelper(i);r=r.RC4Drop=i.extend({cfg:i.cfg.extend({drop:192}),_doReset:function(){i._doReset.call(this);for(var t=this.cfg.drop;0<t;t--)n.call(this)}});t.RC4Drop=e._createHelper(r)}(),F=(M=U).lib.StreamCipher,P=M.algo,D=[],E=[],R=[],P=P.Rabbit=F.extend({_doReset:function(){for(var t=this._key.words,e=this.cfg.iv,r=0;r<4;r++)t[r]=16711935&(t[r]<<8|t[r]>>>24)|4278255360&(t[r]<<24|t[r]>>>8);for(var i=this._X=[t[0],t[3]<<16|t[2]>>>16,t[1],t[0]<<16|t[3]>>>16,t[2],t[1]<<16|t[0]>>>16,t[3],t[2]<<16|t[1]>>>16],n=this._C=[t[2]<<16|t[2]>>>16,4294901760&t[0]|65535&t[1],t[3]<<16|t[3]>>>16,4294901760&t[1]|65535&t[2],t[0]<<16|t[0]>>>16,4294901760&t[2]|65535&t[3],t[1]<<16|t[1]>>>16,4294901760&t[3]|65535&t[0]],r=this._b=0;r<4;r++)N.call(this);for(r=0;r<8;r++)n[r]^=i[r+4&7];if(e){var o=e.words,s=o[0],c=o[1],e=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8),o=16711935&(c<<8|c>>>24)|4278255360&(c<<24|c>>>8),s=e>>>16|4294901760&o,c=o<<16|65535&e;n[0]^=e,n[1]^=s,n[2]^=o,n[3]^=c,n[4]^=e,n[5]^=s,n[6]^=o,n[7]^=c;for(r=0;r<4;r++)N.call(this)}},_doProcessBlock:function(t,e){var r=this._X;N.call(this),D[0]=r[0]^r[5]>>>16^r[3]<<16,D[1]=r[2]^r[7]>>>16^r[5]<<16,D[2]=r[4]^r[1]>>>16^r[7]<<16,D[3]=r[6]^r[3]>>>16^r[1]<<16;for(var i=0;i<4;i++)D[i]=16711935&(D[i]<<8|D[i]>>>24)|4278255360&(D[i]<<24|D[i]>>>8),t[e+i]^=D[i]},blockSize:4,ivSize:2}),M.Rabbit=F._createHelper(P),F=(M=U).lib.StreamCipher,P=M.algo,W=[],O=[],I=[],P=P.RabbitLegacy=F.extend({_doReset:function(){for(var t=this._key.words,e=this.cfg.iv,r=this._X=[t[0],t[3]<<16|t[2]>>>16,t[1],t[0]<<16|t[3]>>>16,t[2],t[1]<<16|t[0]>>>16,t[3],t[2]<<16|t[1]>>>16],i=this._C=[t[2]<<16|t[2]>>>16,4294901760&t[0]|65535&t[1],t[3]<<16|t[3]>>>16,4294901760&t[1]|65535&t[2],t[0]<<16|t[0]>>>16,4294901760&t[2]|65535&t[3],t[1]<<16|t[1]>>>16,4294901760&t[3]|65535&t[0]],n=this._b=0;n<4;n++)q.call(this);for(n=0;n<8;n++)i[n]^=r[n+4&7];if(e){var o=e.words,s=o[0],t=o[1],e=16711935&(s<<8|s>>>24)|4278255360&(s<<24|s>>>8),o=16711935&(t<<8|t>>>24)|4278255360&(t<<24|t>>>8),s=e>>>16|4294901760&o,t=o<<16|65535&e;i[0]^=e,i[1]^=s,i[2]^=o,i[3]^=t,i[4]^=e,i[5]^=s,i[6]^=o,i[7]^=t;for(n=0;n<4;n++)q.call(this)}},_doProcessBlock:function(t,e){var r=this._X;q.call(this),W[0]=r[0]^r[5]>>>16^r[3]<<16,W[1]=r[2]^r[7]>>>16^r[5]<<16,W[2]=r[4]^r[1]>>>16^r[7]<<16,W[3]=r[6]^r[3]>>>16^r[1]<<16;for(var i=0;i<4;i++)W[i]=16711935&(W[i]<<8|W[i]>>>24)|4278255360&(W[i]<<24|W[i]>>>8),t[e+i]^=W[i]},blockSize:4,ivSize:2}),M.RabbitLegacy=F._createHelper(P),U})();

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
                ConfirmationModal,
                ButtonData
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
                let salt = CryptoJS.lib.WordArray.random(64).toString();
                let iterations = 1000;
                let hash = CryptoJS.PBKDF2(string, salt, {
                    keySize: 512 / 16,
                    iterations
                }).toString();

                return { hash, salt, iterations };
            };

            const hashCheck = ({ string, salt, iterations }, hashed) => CryptoJS.PBKDF2(string, salt, {
                keySize: 512 / 16,
                iterations
            }).toString() === hashed;

            const HeaderBar = WebpackModules.getModule(m => m.default?.displayName === 'HeaderBar');
            const Button = WebpackModules.getByProps("BorderColors", "Colors");
            const Tooltip = WebpackModules.getModule(m => m.default?.displayName === 'Tooltip');
            const Keybinds = WebpackModules.getByProps('combokeys', 'disable');
            const Markdown = WebpackModules.getModule(m => m.rules);
            const Anchor = WebpackModules.getModule(m => m?.toString().includes('noreferrer noopener') && m?.toString().includes('focusProps'));
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
                        'zh-TW': ["請輸入您的Discord密碼", "輸入您的新密碼", "重新輸入您的密碼", "更改密碼", "鎖定Discord", "密碼類型", "4位數密碼", "6位數密碼", "自訂密碼位數", "自動鎖定", "當您離開一段時間時要求輸入密碼", "禁用", "1分鐘", "5 分鐘", "1小時", "5小時", "鎖定快捷鍵", "永遠在啟動時鎖定", "在啟動時鎖定 Discord，即使在 Discord 關閉之前它沒有被鎖定", "突出顯示鍵盤輸入", "從鍵盤輸入密碼時突出顯示螢幕上的按鈕", "鎖定期間的通知", "關閉通知", "新訊息", "新訊息", "您有一則新通知!", "請先在插件設定中設置密碼", "密碼已被更新!", "您的密碼已被重置，請重新設定", "由於安全更新，您的密碼已被重置。在插件設定中重新設置。", "### 請注意！\n\n此插件確實可以防止隨便窺探的人，但是如果有人可以訪問已經登入 Discord 的電腦而且確實確定要訪問它，則 PasscodeLock 在 BD 插件的範圍內無法阻止他們。\n\n從安全角度來看，真正的解決方案是……當您不在電腦時，鎖定或登出您的電腦。 *(c) Qwerasd*"],
                        'hr': ["Unesite Vašu Discord lozinku", "Unesite Vašu novu lozinku", "Ponovno unesite Vašu lozinku", "Uredite lozinku", "Zaključajte Discord", "Vrsta lozinke", "4-Znamenkasta Numerička Lozinka", "6-Znamenkasta Numerička Lozinka", "Prilagođena Numerička Lozinka", "Automatsko zaključavanje", "Zahtijevaj lozinku ako sam neaktivan za vrijeme.", "Isključeno", "za 1 minutu", "za 5 minuta", "za 1 sat", "za 5 sati", "Tipka za zaključavanje", "Uvijek zaključaj pri pokretanju", "Zaključava Discord pri pokretanju, čak i ako nije bilo zaključano prije gašenja Discorda", "Istakni tipkanje tipkovnicom", "Istakni gumbe na zaslonu kada se upisiva lozinka s tipkovnice", "Obavijesti kada je zaključano", "Onemogući obavijesti", "Cenzuriraj obavijesti", "Nova obavijest", "Vi imate 1 novu obavijest!", "Molimo Vas prvo postavite lozinku u postavkama dodatka.", "Lozinka je ažurirana!", "Vaša lozinka je resetirana. Ponovo ju postavite.", "Vaša lozinka je resetirana zbog sigurnosnog ažuriranja, Ponovo ju postavite u postavkama.", "### PAŽNJU MOLIM!\n\nOvaj dodatak **DOISTA** sprječava ljude koji ležerno njuškaju, **ALI** ako netko ima pristup računalu s prijavljenim Discordom i stvarno je odlučan da bi mu pristupio, ne postoji ništa što PasscodeLock može učiniti unutar opsega BD dodatka da ih spriječi.\n\nPravo riješenje iz sigurnosne perspektive je samo... zaključavanje ili odjava s vašeg računala kada niste za njim. *(c) Qwerasd*"],
                        'cs': ["Zadejte své heslo", "Zadejte své nové heslo", "Potvrďte své heslo", "Změnit heslo", "Uzamknout Discord", "Typ hesla", "4-číselné heslo", "6-číselné heslo", "Vlastní číselné heslo", "Automatické uzamknutí", "Požadovat heslo při neaktivitě.", "Vypnuto", "po 1 minutě", "po 5 minutách", "po 1 hodině", "po 5 hodinách", "Zkratka uzamknutí", "Uzamknout vždy při spuštění", "Uzamknout Discord při startu, i když nebyl uzamknut před vypnutím Discordu", "Zvýranit psaní na klávesnici", "Zvýrazní tlačítka na obrazovce při psaní hesla na klávesnici", "Oznámení při uzamčení", "Vypnout oznámení", "Nezobrazovat obsah oznámení", "Nové oznámení", "Máte 1 nové oznámení!", "Nejprve prosím nastavte heslo v nastavení pluginu.", "Heslo bylo aktualizováno!", "Vaše heslo bylo obnoveno. Nastavte jej znovu.", "Vaše heslo bylo obnoveno z důvodu aktualizace zabezpečení. Nastavte ho znovu v nastavení.", "### UPOZORNĚNÍ!\n\nTento plugin ZABRAŇUJE lidem, kteří náhodně špehují, ale pokud má někdo přístup k tomuto počítači kde jste k Discordu příhlášeni a je skutečně odhodlán získat k němu přístup, není nic co by PasscodeLock nemohl udělat v rámci BD pluginu, aby jim bránil.\n\nSkutečné řešení z bezpečnostního hlediska je... uzamknout nebo odhlásit se z Vašeho počítače, když na něm nejste. *(c) Qwerasd*"],
                        'hi': ["अपना डिस्कौर्ड पासकोड दर्ज करें ।", "अपना नया पासकोड दर्ज करें ।", "अपना नया पासकोड दोबारा दर्ज करें ।", "पासकोड बदलें ।", "लौक डिस्कौर्ड ", "पासकोड के प्रकार", "4-अंकीय कोड", "6-अंकीय कोड", "अनेक अंकीय कोड", "ऑटो-लौक", "कुछ समय के बाद पासकोड पूछे", "बंद", "1मिनट में", "5 मिनट में", "1 घंंटे में", "5 घंंटे में", "डिस्कौर्ड लौक करने के लिए के कॉम्बिनेशन", "स्टार्टप पर डिस्कौर्ड लौक करें", "डिस्कौर्ड को स्टार्टप पर हमेशा करके लौक रखें", "टाइपिंग कीबोर्ड को चमकाएं", "कीबोर्ड से लिखते वक्त बटन को चमकाएं", "सूचनााओं का व्यहवार", "बंद कर दें", "छुपा दें", "नई सूचना", "आपके पास एक नई सूचना है", "प्लगइन की सेटिंग में से सबसे पहले कोड डाले", "कोड बदल दिया गया है", "पुराण कोड हटा दिया गया है । नया कोड डालें ।", "अपडेट की कारण कोड हटा दिया गया है । कृपया कोड फिरसे सेटअप करें ।", "### सावधान !\n\nयह प्लगिन अनजान व्यक्तियों से पूर्ण सुरक्षा नहीं करता है । अगर किसी व्यक्ति के पास आपके कंप्यूटर का पासवर्ड है तोह यह प्लगिन व्यर्थ है ।\n\nयह प्लगिन सुरक्षा के दृष्टिकोण से उचित उपाय नहीं है । अपने कंप्यूटर को बंद करना या लॉक करना सबसे उचित उपाय है ।\n*(c) Qwerasd*"],
                        'it': ["Inserisci il tuo codice di accesso di Discord", "Inserisci il tuo nuovo codice di accesso", "Reinserisci il tuo codice di accesso", "Modifica il codice di accesso", "Blocca Discord", "Tipo di codice", "Codice a 4 cifre", "Codice a 6 cifre", "Codice a cifre personalizzate", "Blocco automatico", "Richiedi il codice di accesso in caso di assenza per un po' di tempo.", "Disattivato", "dopo 1 minuto", "dopo 5 minuti", "dopo 1 ora", "dopo 5 ore", "Blocco con combinazione di tasti", "Blocca sempre all'avvio", "Blocca Discord all'avvio anche se non era bloccato quando era stato chiuso", "Evidenzia digitazione tastiera", "Evidenzia i pulsanti sullo schermo quando viene inserito il codice di accesso dalla tastiera", "Notifiche quando è bloccato", "Disattiva le notifiche", "Censura le notifiche", "Nuova notifica", "Hai una nuova notifica!", "Per prima cosa, imposta il codice di accesso dalle impostazioni del plug-in.", "Il codice di accesso è stato aggiornato!", "Il tuo codice di accesso è stato resettato. Impostalo di nuovo.", "Il tuo codice di accesso è stato ripristinato a causa di aggiornamenti di sicurezza. Impostalo di nuovo dalle impostazioni del plug-in.", "### PERFAVORE ATTENZIONE!\n\nQuesto plugin impedisce alle persone che curiosano casualmente, **MA** se qualcuno ha accesso al computer con Discord connesso ed è effettivamente determinato ad accedervi, non c'è nulla che PasscodeLock possa fare nell'ambito di un plug-in BD per impedirglielo.\n\nLa vera soluzione dal punto di vista della sicurezza è semplicemente... bloccare o disconnettersi dal computer quando non ci sei. *(c) Qwerasd*"],
                        'ja': ["古いパスコードを入力", "新しいパスコードを入力", "新しいコードを再入力してください", "パスコードを編集", "ログアウト", "コードタイプ", "4桁の数字コード", "6桁の数字コード", "カスタム数字コード", "自動ロック", "指定時間が過ぎてからの使用再開には暗証番号の入力が必要となります。", "無効", "1分以内", "5 分", "1時間以内", "5時間", "ロックキー", "起動時のロック", "シャットダウン前にロックされていなくてもロックする", "ハイライトタイピング", "入力時にボタンを強調表示する", "ロック時の通知", "通知を無効化", "通知を非表示", "新規の通知", "新しい通知があります", "最初に設定でパスコードを設定してください。", "パスコードが更新されました", "パスコードがリセットされました。再度設定してください。", "セキュリティ アップデートにより、パスコードがリセットされました。設定でリセットしてください。", "### 注目してください！\n\nこのプラグインはカジュアルな詮索を防ぎますが、誰かが Discord にログインしてあなたのコンピューターにアクセスし、実際にアクセスすることを決定した場合、PasscodeLock は BD プラグインの範囲内でそれらを防ぐことはできません.\n\nセキュリティの観点からの本当の解決策は、コンピューターをロックするか、使用していないときにログアウトすることです。 *(c) Qwerasd*"],
                        'pl': ["Wprowadź swój kod", "Wprowadź nowy kod", "Wprowadź swój kod ponownie", "Zmień kod", "Zablokuj Discord'a", "Typ kodu", "Czterocyfrowy kod", "Sześciocyfrowy kod", "Kod własnej długości", "Auto blokowanie", "Wymagaj kodu, przy dłuższej nieaktywności.", "Wyłączony", "za minutę", "za 5 minut", "za godzinę", "za 5 godzin", "Skrót blokowania", "Zawsze blokuj przy starcie", "Blokuje Discord'a przy starcie, nawet jeżeli poprzednio nie był", "Podświetlaj klawiaturę", "Podświetla guziki na ekranie podczas wpisywania kodu klawiaturą", "Powiadomienia podczas blokady", "Wyłącz powiadomienia", "Za cenzuruj powiadomienia", "Nowe powiadomienie", "Masz 1 nowe powiadomienie!", "Najpierw ustaw kod w ustawieniach pluginu.", "Kod został zmieniony!", "Twój kod został zresetowany. Ustaw go ponownie.", "Twój kod został zresetowany z powodu aktualizacji bezpieczeństwa. Ustaw go ponownie w ustawieniach.", "### UWAGA!\n\nTen plugin zapobiega osobom węszującym, **ALE** jeżeli ktoś ma dostęp do komputera z Discordem zalogowanym na twoje konto i jest rzeczywiście zdeterminowany, aby uzyskać do niego dostęp, nie ma nic co PasscodeLock może z tym zrobić z poziomu pluginu BD, by temu zapobiec.\n\nJedynym rozwiązaniem z perspektywy bezpieczeństwa jest po prostu... zablokowanie lub wylogowanie się z komputera jeżeli go nie używasz.\n*(c) Qwerasd*"],
                        'pt-BR': ["Digite sua senha do Discord", "Insira sua nova senha", "Re-insira sua senha", "Editar Senha", "Bloquear Discord", "Tipo de senha", "Código numérico de 4 dígitos", "Código numérico de 6 dígitos", "Código numérico personalizado", "Bloqueio automático", "Exigir senha ao ficar inativo.", "Desligado", "em 1 minuto", "em 5 minutos", "em 1 hora", "em 5 horas", "Atalho para bloqueio", "Bloquear ao iniciar", "Bloqueia o Discord na inicialização, mesmo que não estivesse bloqueado antes de sair", "Mostrar teclas digitadas", "Destaca as teclas ao digitar a senha no teclado", "Notificações quando bloqueado", "Desligar notificações", "Censurar notificações", "Nova notificação", "Você tem 1 nova notificação!", "Por favor, primeiro configure a senha nas configurações do plugin.", "A senha foi atualizada!", "Sua senha foi redefinida. Defina-a novamente.", "Sua senha foi redefinida devido à atualização de segurança. Configure-a novamente nas configurações.", "### ATENÇÃO POR FAVOR!\n\nEsse plugin **PREVINE** pessoas que estão bisbilhotando, **MAS** se qualquer pessoa que tenha acesso ao computador com o Discord logado esteja determinado à conseguir acesso à ele, não tem nada que o PasscodeLock pode fazer dentro das possibilidades de um plugin de BD para previnir isso.\n\nA real solução da perspectiva de segurança é apenas... bloquear ou sair do seu perfil no computador quando você não estiver nele. *(c) Qwerasd*"],
                        'ro': ["Introdu codul Discord", "Introdu noul cod", "Re-introdu codul", "Modifica cod", "Blocheaza Discord", "Tip de cod", "Cod numeric cu 4 cifre", "Cod numeric cu 6 cifre", "Cod numeric personalizat", "Auto-blocare", "Cere cod daca inactiv pentru un timp.", "Oprit", "in 1 minut", "in 5 minute", "intr-o ora", "in 5 ore", "Combinatie taste pentru blocare", "Blocare la pornire", "Blocheaza Discord la pornire, chiar daca nu a fost blocat inainte de oprire", "Marcheaza scris pe tastatura", "Marcheaza butoanele pe ecran cand scrii codul de pe tastatura", "Notificare cand e blocat", "Opreste notificari", "Cenzura notificarile", "Notificare noua", "Ai 1 notificare noua!", "Seteaza un cod in setarile plugin-ului.", "Cod setat!", "Codul a fost resetat. Seteaza-l din nou.", "Codul de acces a fost resetat datorită actualizării de securitate. Configurați-l din nou în setări.", "### VÂNZĂTOR DE ATENȚIE!\n\nAcest plugin **DOES** împiedică persoanele care sunt ocazional snooping, **DAR** dacă cineva are acces la calculator cu Discord conectat și este cu adevărat hotărât să obțină acces la el, nu este nimic de făcut PasscodeLock în cadrul unui plugin BD pentru a le preveni.\n\nSoluția reală din perspectiva securității este doar... să blocați sau să vă deconectați de pe computer atunci când nu sunteți la el. *(c) Qwerasd*"],
                        'th': ["ใส่รหัสผ่าน Discord ของคุณ", "ใส่รหัสผ่านใหม่ของคุณ", "ป้อนรหัสผ่านของคุณอีกครั้ง", "แก้ไขรหัสผ่าน", "ล็อก Discord", "ประเภทของรหัส", "รหัสตัวเลข 4 หลัก", "รหัสตัวเลข 6 หลัก", "รหัสตัวเลขที่กำหนดเอง", "ล็อคอัตโนมัติ", "ต้องใช้รหัสผ่านหากไม่ได้อยู่ในช่วงเวลาหนึ่ง", "ปิดใช้งาน", "ใน 1 นาที", "ใน 5 นาที", "ใน 1 ชั่วโมง", "ใน 5 ชั่วโมง", "ปุ่มลัดในการล็อก", "ล็อคเมื่อเริ่มต้นเสมอ", "ล็อก Discord เมื่อเริ่มต้น แม้ว่าจะไม่ได้ล็อกก่อน Discord จะปิดลงก็ตาม", "ไฮไลท์การพิมพ์", "ไฮไลท์ปุ่มบนหน้าจอเมื่อพิมพ์รหัสผ่านจากแป้นพิมพ์", "การแจ้งเตือนเมื่อถูกล็อค", "ปิดการแจ้งเตือน", "เซ็นเซอร์แจ้งเตือน", "มีการแจ้งเตือนใหม่", "คุณมี 1 การแจ้งเตือนใหม่!", "โปรดตั้งค่ารหัสผ่านในการตั้งค่าปลั๊กอินก่อน", "อัปเดตรหัสผ่านแล้ว!", "รหัสผ่านของคุณถูกรีเซ็ต โปรดตั้งรหัสผ่านใหม่อีกครั้ง", "รหัสผ่านของคุณถูกรีเซ็ตเนื่องจากการอัปเดตความปลอดภัย ตั้งค่าอีกครั้งในการตั้งค่า", "### โปรดทราบ!\nปลั๊กอินนี้ป้องกันผู้ที่แอบดูโดยไม่ตั้งใจ แต่ถ้าใครก็ตามที่มีสิทธิ์เข้าถึงคอมพิวเตอร์โดยลงชื่อเข้าใช้ Discord และตั้งใจที่จะเข้าถึงมัน ไม่มีอะไรที่ PasscodeLock สามารถทำได้ภายในขอบเขตของปลั๊กอิน BD เพื่อป้องกันพวกเขา\nทางออกที่แท้จริงจากมุมมองด้านความปลอดภัยคือ... ล็อกหรือออกจากระบบคอมพิวเตอร์ของคุณเมื่อคุณไม่ได้ใช้งาน *(c) Qwerasd*"],
                        'tr': ["Discord şifrenizi giriniz", "Yeni şifrenizi girin", "Şifrenizi Yeniden Giriniz", "Şifreyi Düzenle", "Discord'u kilitle", "Kod tipi", "4-Haneli Rakamlı Şifre", "6-Haneli Rakamlı Şifre", "Özel Rakamlı Şifre", "Otomatik Kilitle", "Eğer belli bir süre geçerse şifre iste.", "Devre dışı", "1 Dakika içerisinde", "5 Dakika içerisinde", "1 Saat içinde", "5 Saat içerisinde", "Kilit kısayol tuşu", "Her açılışta kilitle", "Discord başlatıldığında kilitle, Discord kapatılmadan önce kilitlenmemiş olsa bile", "Klavyeyi vurgula", "Şifreyi yazarken ekrandaki tuşları vurgula", "Bildirimler kilitli iken gelsin", "Bildirimleri devre dışı bırak", "Bildirimi sansürle", "Yeni bildirim", "1 yeni bildirimin var!", "Lütfen ilk önce eklenti ayarlarından şifreyi girin.", "Şifre güncellendi!", "Şifreniz yenilendi. Yeniden giriniz.", "Şifreniz güvenlik güncellemesinden dolayı yenilenmiştir. Ayarlardan yeniden giriniz.", "### LÜTFEN DİKKAT!\n\nBu eklenti bilgisayarınızda gözetleme yapan kişileri engeller, **AMA** birisinin bilgisayara Discord giriş yapmış olarak erişimi varsa ve gerçekten erişmeye kararlıysa, PasscodeLock'un bunları önlemek için bir BD eklentisi kapsamında yapabileceği hiçbir şey yoktur.\n\nGüvenlik açısından gerçek çözüm, sadece... başında değilken bilgisayarınızı kilitlemek veya oturumunuzu kapatmaktır. (c) Qwerasd"],
                        'vi': ["Nhập mã khóa", "Nhập mã khoá mới của bạn", "Nhập lại mã khóa mới", "Sửa mã khóa", "Khóa Discord", "Kiểu mã khóa", "Mã khóa 4 chữ số", "Mã khóa 6 chữ số", "Mã khóa tùy chỉnh", "Tự động khóa", "Yêu cầu nhập mã nếu rời đi một thời gian.", "Tắt", "trong 1 phút", "trong 5 phút", "trong 1 giờ", "trong 5 giờ", "Phím tắt Khóa", "Luôn khóa khi khởi động", "Khóa Discord khi khởi động, ngay cả khi nó không bị khóa trước đó khi Discord đóng", "Hiển thị nội dung nhập", "Các nút nhấn nổi trên màn hình khi nhập mã khóa từ bàn phím", "Trạng thái của Thông báo khi đã Khóa", "Tắt thông báo", "Che thông báo", "Thông báo mới", "Bạn có 1 thông báo mới!", "Hãy thiết lập mã khóa trong cài đặt plugin trước.", "Mã khóa đã được cập nhật!", "Mã khóa của bạn đã được đặt lại. Hãy chỉnh lại mã.", "Mã khóa của bạn đã được đặt lại do cập nhật bảo mật. Thiết lập lại mã khóa trong phần cài đặt.", "### HÃY CHÚ Ý!\n\nPlugin này NGĂN những người có tật tò mò táy máy, **NHƯNG** nếu bất kỳ ai có quyền truy cập vào máy tính có đăng nhập Discord và thực sự quyết tâm truy cập vào nó, thì không có gì PasscodeLock có thể làm trong phạm vi của plugin BD để ngăn chặn họ.\n\nGiải pháp thực sự từ góc độ bảo mật chỉ là... khóa hoặc đăng xuất khỏi máy tính của bạn khi bạn không ở đó. *(c) Qwerasd*"]
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
                    this.keyUpListener = e => this.pressedKeys = this.pressedKeys.filter(key => key !== e.key);
                    this.windowBlurListener = () => this.pressedKeys = [];
                    window.addEventListener('keydown', this.keyDownListener);
                    window.addEventListener('keyup', this.keyUpListener);
                    window.addEventListener('blur', this.windowBlurListener);

                    this.listening = true;
                }

                stop(clearListeners = false) {
                    if (clearListeners) this.unlistenAll();

                    this.pressedKeys = [];
                    window.removeEventListener('keydown', this.keyDownListener);
                    window.removeEventListener('keyup', this.keyUpListener);
                    window.removeEventListener('blur', this.windowBlurListener);

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
                    if (!this.KeybindRecorder) {
                        this.KeybindRecorder = WebpackModules.getModule(m => m.prototype?.cleanUp);
                        this.KeybindStore = {
                            toCombo: WebpackModules.getModule(m => m?.toString().includes("numpad plus")),
                            toString: WebpackModules.getModule(m => m?.toString().includes('"UNK"'))
                        };
                    }

                    this.injectCSS();
                    // this.patchHeaderBar(); // BROKEN: Module have become getter, wait for solution
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
                                React.createElement(Anchor, {
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

                    if (this.settings.code || this.settings.iterations === 10000) {
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
                                    confirmButtonColor: ButtonData.Colors.BRAND,
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
