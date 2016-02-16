!function t(e,n,i){function r(a,s){if(!n[a]){if(!e[a]){var c="function"==typeof require&&require;if(!s&&c)return c(a,!0);if(o)return o(a,!0);var u=new Error("Cannot find module '"+a+"'");throw u.code="MODULE_NOT_FOUND",u}var d=n[a]={exports:{}};e[a][0].call(d.exports,function(t){var n=e[a][1][t];return r(n?n:t)},d,d.exports,t,e,n,i)}return n[a].exports}for(var o="function"==typeof require&&require,a=0;a<i.length;a++)r(i[a]);return r}({1:[function(t,e,n){"use strict";e.exports=function(t,e,n){t.addEventListener?t.addEventListener(e,n,!1):t.attachEvent("on"+e,n)}},{}],2:[function(t,e,n){"use strict";t("autotrack/lib/plugins/media-query-tracker"),t("autotrack/lib/plugins/outbound-link-tracker"),t("autotrack/lib/plugins/session-duration-tracker"),t("autotrack/lib/plugins/social-tracker"),t("autotrack/lib/plugins/url-change-tracker")},{"autotrack/lib/plugins/media-query-tracker":10,"autotrack/lib/plugins/outbound-link-tracker":11,"autotrack/lib/plugins/session-duration-tracker":12,"autotrack/lib/plugins/social-tracker":13,"autotrack/lib/plugins/url-change-tracker":14}],3:[function(t,e,n){"use strict";function i(t){var e=t.title||t.innerText;return e?e+" — Philip Walton":null}function r(t){var e=this.nextPage.path;if(f[e])return t();var n=/(\w+)\.html$/,i=n.test(e)?e.replace(n,"_$1.html"):e+"_index.html",r=new XMLHttpRequest;r.open("GET",i),r.onload=function(){r.status>=200&&r.status<400?(f[e]=r.responseText,t()):t(new Error("("+r.status+") "+r.response))},r.onerror=function(){t(new Error("Error making request to:"+i))},r.send()}function o(){var t=f[this.nextPage.path];u.innerHTML=t}function a(){h.close()}function s(){var t=this.nextPage.hash;if(t)var e=document.getElementById(t.slice(1));var n=e?e.offsetTop:0;window.scrollTo(0,n)}function c(t){ga("send","exception",{exDescription:t.stack||t.message})}var u,d=t("./link-clicked"),l=t("./history2"),h=t("./drawer"),p=t("./parse-url"),f={};e.exports={init:function(){if(window.history&&window.history.pushState){u=document.querySelector("main"),f[location.pathname]=u.innerHTML;var t=(new l).use(r).use(o).use(a).use(s)["catch"](c);d(function(e){if(!(e.metaKey||e.ctrlKey||e.which>1)){var n=p(location.href),r=p(this.href);r.href==n.href&&e.preventDefault(),r.origin==n.origin&&r.path!=n.path&&(e.preventDefault(),t.add(r.href,i(this)))}})}}}},{"./drawer":4,"./history2":5,"./link-clicked":6,"./parse-url":8}],4:[function(t,e,n){"use strict";function i(t,e){var n=t.className;return n?void(n.indexOf(e)>-1||(t.className=n+" "+e)):void(t.className=e)}function r(t,e){var n=t.className;if(!(n.indexOf(e)<0)){for(var i=n.split(/\s/),r=[],o=0,a=i.length;a>o;o++)e!=i[o]&&r.push(i[o]);r.length?t.className=r.join(" "):t.removeAttribute("class")}}function o(t){t.preventDefault(),l?c():s()}function a(t){l&&!u(t.target,"#drawer-container",!0)&&c()}function s(){l=!0,i(document.documentElement,"is-drawerOpen")}function c(){l=!1,r(document.documentElement,"is-drawerOpen")}var u=t("closest"),d=(document.getElementById("drawer-container"),document.getElementById("drawer-toggle")),l=!1;e.exports={init:function(){d.addEventListener("click",o),d.addEventListener("touchend",o),document.addEventListener("click",a),document.addEventListener("touchend",a)},open:s,close:c}},{closest:17}],5:[function(t,e,n){"use strict";function i(){this.currentPage=r(window.location.href),this.currentPage.title=document.title,history.replaceState(this.currentPage,this.currentPage.title,this.currentPage.href),this._queue=[];var t=this;window.addEventListener("popstate",function(e){var n=e.state,i=n&&n.title;t.add(window.location.href,i,n,e)})}var r=t("./parse-url");i.prototype.add=function(t,e,n,i){t!=this.currentPage.href&&(this.nextPage=r(t),this.nextPage.title=e,this.nextPage.state=n,this._processQueue(i))},i.prototype.use=function(t){return this._queue.push(t),this},i.prototype["catch"]=function(t){return this._onError=t,this},i.prototype._onError=function(t){console.error(t.stack)},i.prototype._onComplete=function(t){this.nextPage.title&&(document.title=this.nextPage.title),t&&"popstate"==t.type||history.pushState(this.nextPage,this.nextPage.title,this.nextPage.href),this.currentPage=this.nextPage,this.nextPage=null},i.prototype._processQueue=function(t){var e=this,n=0;!function i(){function r(t){t?e._onError(t):i()}var o=e._queue[n++],a=o&&!o.length;if(!o)return e._onComplete(t);try{o.apply(e,a?[]:[r])}catch(s){return e._onError(s)}a&&i()}()},e.exports=i},{"./parse-url":8}],6:[function(t,e,n){"use strict";function i(t){return t.nodeName&&"a"==t.nodeName.toLowerCase()&&t.href}function r(t){if(i(t))return t;for(;t.parentNode&&1==t.parentNode.nodeType;){if(i(t))return t;t=t.parentNode}}var o=t("./add-listener");e.exports=function(t){o(document,"click",function(e){var n=e||window.event,i=n.target||n.srcElement,o=r(i);o&&t.call(o,n)})}},{"./add-listener":1}],7:[function(t,e,n){"use strict";t("./analytics");var i=t("./content-loader"),r=t("./drawer");i.init(),r.init()},{"./analytics":2,"./content-loader":3,"./drawer":4}],8:[function(t,e,n){"use strict";var i=document.createElement("a"),r={};e.exports=function(t){if(r[t])return r[t];var e=/:80$/,n=/:443/;i.href=t;var o=i.protocol&&":"!=i.protocol?i.protocol:location.protocol,a="80"==i.port||"443"==i.port?"":i.port,s=i.host.replace("http:"==o?e:n,""),c=i.origin?i.origin:o+"//"+s,u="/"==i.pathname.charAt(0)?i.pathname:"/"+i.pathname;return r[t]={hash:i.hash,host:s,hostname:i.hostname,href:i.href,origin:c,path:u+i.search,pathname:u,port:a,protocol:o,search:i.search}}},{}],9:[function(t,e,n){e.exports={DEV_ID:"i5iSjo"}},{}],10:[function(t,e,n){function i(t,e){window.gaplugins=window.gaplugins||{},gaplugins.MediaQueryTracker=i,window.matchMedia&&(this.opts=a(e,{mediaQueryDefinitions:!1,mediaQueryChangeTemplate:this.changeTemplate,mediaQueryChangeTimeout:1e3}),s(this.opts.mediaQueryDefinitions)&&(this.opts.mediaQueryDefinitions=c(this.opts.mediaQueryDefinitions),this.tracker=t,this.timeouts={},this.processMediaQueries()))}function r(t){return l[t]?l[t]:(l[t]=window.matchMedia(t),l[t])}var o=t("debounce"),a=t("../utilities").defaults,s=t("../utilities").isObject,c=t("../utilities").toArray,u=t("../provide"),d="(not set)",l={};i.prototype.processMediaQueries=function(){this.opts.mediaQueryDefinitions.forEach(function(t){if(!t.dimensionIndex)throw new Error("Media query definitions must have a name.");if(!t.dimensionIndex)throw new Error("Media query definitions must have a dimension index.");var e=this.getMatchName(t);this.tracker.set("dimension"+t.dimensionIndex,e),this.addChangeListeners(t)}.bind(this))},i.prototype.getMatchName=function(t){var e;return t.items.forEach(function(t){r(t.media).matches&&(e=t)}),e?e.name:d},i.prototype.addChangeListeners=function(t){t.items.forEach(function(e){var n=r(e.media);n.addListener(o(function(){this.handleChanges(t)}.bind(this),this.opts.mediaQueryChangeTimeout))}.bind(this))},i.prototype.handleChanges=function(t){var e=this.getMatchName(t),n=this.tracker.get("dimension"+t.dimensionIndex);e!==n&&(this.tracker.set("dimension"+t.dimensionIndex,e),this.tracker.send("event",t.name,"change",this.opts.mediaQueryChangeTemplate(n,e)))},i.prototype.changeTemplate=function(t,e){return t+" => "+e},u("mediaQueryTracker",i)},{"../provide":15,"../utilities":16,debounce:18}],11:[function(t,e,n){function i(t,e){window.gaplugins=window.gaplugins||{},gaplugins.OutboundLinkTracker=i,window.addEventListener&&(this.opts=r(e),this.tracker=t,o(document,"a","click",this.handleLinkClicks.bind(this)))}var r=t("../utilities").defaults,o=t("delegate"),a=t("../provide");i.prototype.handleLinkClicks=function(t){var e=t.delegateTarget;e.hostname!=location.hostname&&(navigator.sendBeacon||(e.target="_blank"),this.tracker.send("event","Outbound Link","click",e.href,{transport:"beacon"}))},a("outboundLinkTracker",i)},{"../provide":15,"../utilities":16,delegate:20}],12:[function(t,e,n){function i(t,e){window.gaplugins=window.gaplugins||{},gaplugins.SessionDurationTracker=i,window.addEventListener&&(this.opts=r(e),this.tracker=t,window.addEventListener("unload",this.handleWindowUnload.bind(this)))}var r=t("../utilities").defaults,o=t("../provide");i.prototype.handleWindowUnload=function(){var t={nonInteraction:!0,transport:"beacon"};window.performance&&performance.timing&&(t.eventValue=+new Date-performance.timing.navigationStart),this.tracker.send("event","Window","unload",t)},o("sessionDurationTracker",i)},{"../provide":15,"../utilities":16}],13:[function(t,e,n){function i(t,e){if(window.gaplugins=window.gaplugins||{},gaplugins.SocialTracker=i,window.addEventListener){this.opts=r(e,{attributePrefix:"data-"}),this.tracker=t;var n=this.opts.attributePrefix,a="["+n+"social-network]["+n+"social-action]["+n+"social-target]";o(document,a,"click",this.handleSocialClicks.bind(this)),this.detectLibraryLoad("FB","facebook-jssdk",this.addFacebookEventHandlers.bind(this)),this.detectLibraryLoad("twttr","twitter-wjs",this.addTwitterEventHandlers.bind(this))}}var r=t("../utilities").defaults,o=t("delegate"),a=t("../provide");i.prototype.handleSocialClicks=function(t){var e=t.delegateTarget,n=this.opts.attributePrefix;this.tracker.send("social",{socialNetwork:e.getAttribute(n+"social-network"),socialAction:e.getAttribute(n+"social-action"),socialTarget:e.getAttribute(n+"social-target")})},i.prototype.detectLibraryLoad=function(t,e,n){if(window[t])n();else{var i=document.getElementById(e);i&&(i.onload=n)}},i.prototype.addTwitterEventHandlers=function(){try{twttr.ready(function(){twttr.events.bind("tweet",function(t){if("tweet"==t.region){var e=t.data.url||t.target.getAttribute("data-url")||location.href;this.tracker.send("social","Twitter","tweet",e)}}.bind(this)),twttr.events.bind("follow",function(t){if("follow"==t.region){var e=t.data.screen_name||t.target.getAttribute("data-screen-name");this.tracker.send("social","Twitter","follow",e)}}.bind(this))}.bind(this))}catch(t){}},i.prototype.addFacebookEventHandlers=function(){try{FB.Event.subscribe("edge.create",function(t){this.tracker.send("social","Facebook","like",t)}.bind(this)),FB.Event.subscribe("edge.remove",function(t){this.tracker.send("social","Facebook","unlike",t)}.bind(this))}catch(t){}},a("socialTracker",i)},{"../provide":15,"../utilities":16,delegate:20}],14:[function(t,e,n){function i(t,e){if(window.gaplugins=window.gaplugins||{},gaplugins.UrlChangeTracker=i,history.pushState&&window.addEventListener){this.opts=o(e,{shouldTrackUrlChange:this.shouldTrackUrlChange}),this.tracker=t,this.path=r();var n=history.pushState;history.pushState=function(t,e,i){a(t)&&e&&(t.title=e),n.call(history,t,e,i),this.updateTrackerData()}.bind(this);var s=history.replaceState;history.replaceState=function(t,e,n){a(t)&&e&&(t.title=e),s.call(history,t,e,n),this.updateTrackerData(!1)}.bind(this),window.addEventListener("popstate",this.updateTrackerData.bind(this))}}function r(){return location.pathname+location.search}var o=t("../utilities").defaults,a=t("../utilities").isObject,s=t("../provide");i.prototype.updateTrackerData=function(t){t=t===!1?!1:!0,setTimeout(function(){var e=this.path,n=r();e!=n&&this.opts.shouldTrackUrlChange.call(this,n,e)&&(this.path=n,this.tracker.set({page:n,title:a(history.state)&&history.state.title||document.title}),t&&this.tracker.send("pageview"))}.bind(this),0)},i.prototype.shouldTrackUrlChange=function(t,e){return!0},s("urlChangeTracker",i)},{"../provide":15,"../utilities":16}],15:[function(t,e,n){var i=t("./constants");(window.gaDevIds=window.gaDevIds||[]).push(i.DEV_ID),e.exports=function(t,e){var n=window[window.GoogleAnalyticsObject||"ga"];"function"==typeof n&&n("provide",t,e)}},{"./constants":9}],16:[function(t,e,n){var i={withTimeout:function(t,e){var n=!1;return setTimeout(t,e||2e3),function(){n||(n=!0,t())}},defaults:function(t,e){var n={};"object"!=typeof t&&(t={}),"object"!=typeof e&&(e={});for(var i in e)e.hasOwnProperty(i)&&(n[i]=t.hasOwnProperty(i)?t[i]:e[i]);return n},isObject:function(t){return"object"==typeof t&&null!==t},isArray:Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)},toArray:function(t){return i.isArray(t)?t:[t]}};e.exports=i},{}],17:[function(t,e,n){var i=t("matches-selector");e.exports=function(t,e,n){for(var r=n?t:t.parentNode;r&&r!==document;){if(i(r,e))return r;r=r.parentNode}}},{"matches-selector":21}],18:[function(t,e,n){var i=t("date-now");e.exports=function(t,e,n){function r(){var d=i()-c;e>d&&d>0?o=setTimeout(r,e-d):(o=null,n||(u=t.apply(s,a),o||(s=a=null)))}var o,a,s,c,u;return null==e&&(e=100),function(){s=this,a=arguments,c=i();var d=n&&!o;return o||(o=setTimeout(r,e)),d&&(u=t.apply(s,a),s=a=null),u}}},{"date-now":19}],19:[function(t,e,n){function i(){return(new Date).getTime()}e.exports=Date.now||i},{}],20:[function(t,e,n){function i(t,e,n,i,o){var a=r.apply(this,arguments);return t.addEventListener(n,a,o),{destroy:function(){t.removeEventListener(n,a,o)}}}function r(t,e,n,i){return function(n){n.delegateTarget=o(n.target,e,!0),n.delegateTarget&&i.call(t,n)}}var o=t("closest");e.exports=i},{closest:17}],21:[function(t,e,n){function i(t,e){if(o)return o.call(t,e);for(var n=t.parentNode.querySelectorAll(e),i=0;i<n.length;++i)if(n[i]==t)return!0;return!1}var r=Element.prototype,o=r.matchesSelector||r.webkitMatchesSelector||r.mozMatchesSelector||r.msMatchesSelector||r.oMatchesSelector;e.exports=i},{}]},{},[7]);
//# sourceMappingURL=main.js.map
