!function t(e,i,n){function r(a,o){if(!i[a]){if(!e[a]){var c="function"==typeof require&&require;if(!o&&c)return c(a,!0);if(s)return s(a,!0);var l=new Error("Cannot find module '"+a+"'");throw l.code="MODULE_NOT_FOUND",l}var u=i[a]={exports:{}};e[a][0].call(u.exports,function(t){var i=e[a][1][t];return r(i?i:t)},u,u.exports,t,e,i,n)}return i[a].exports}for(var s="function"==typeof require&&require,a=0;a<n.length;a++)r(n[a]);return r}({1:[function(t,e,i){"use strict";t("autotrack/lib/plugins/clean-url-tracker"),t("autotrack/lib/plugins/event-tracker"),t("autotrack/lib/plugins/media-query-tracker"),t("autotrack/lib/plugins/outbound-link-tracker"),t("autotrack/lib/plugins/page-visibility-tracker"),t("autotrack/lib/plugins/url-change-tracker")},{"autotrack/lib/plugins/clean-url-tracker":7,"autotrack/lib/plugins/event-tracker":8,"autotrack/lib/plugins/media-query-tracker":9,"autotrack/lib/plugins/outbound-link-tracker":10,"autotrack/lib/plugins/page-visibility-tracker":11,"autotrack/lib/plugins/url-change-tracker":12}],2:[function(t,e,i){"use strict";function n(t){var e=t.title||t.innerText;return e?e+" — Philip Walton":null}function r(t){var e=this.nextPage.path;if(f[e])return t();var i=/(\w+)\.html$/,n=i.test(e)?e.replace(i,"_$1.html"):e+"_index.html",r=new XMLHttpRequest;r.open("GET",n),r.onload=function(){r.status>=200&&r.status<400?(f[e]=r.responseText,t()):t(new Error("("+r.status+") "+r.response))},r.onerror=function(){t(new Error("Error making request to:"+n))},r.send()}function s(){var t=f[this.nextPage.path];l.innerHTML=t}function a(){d.close()}function o(){var t=this.nextPage.hash;if(t)var e=document.getElementById(t.slice(1));var i=e?e.offsetTop:0;window.scrollTo(0,i)}function c(t){ga("send","exception",{exDescription:t.stack||t.message})}var l,u=t("dom-utils/lib/delegate"),h=t("dom-utils/lib/parse-url"),p=t("./history2"),d=t("./drawer"),f={};e.exports={init:function(){if(window.history&&window.history.pushState){l=document.querySelector("main"),f[location.pathname]=l.innerHTML;var t=(new p).use(r).use(s).use(a).use(o)["catch"](c);u(document,"click","a[href]",function(e){if(!(e.metaKey||e.ctrlKey||e.which>1)){var i=h(location.href),r=h(this.href);r.href==i.href&&e.preventDefault(),r.origin==i.origin&&r.path!=i.path&&(e.preventDefault(),t.add(r.href,n(this)))}})}}}},{"./drawer":3,"./history2":4,"dom-utils/lib/delegate":19,"dom-utils/lib/parse-url":23}],3:[function(t,e,i){"use strict";function n(t,e){var i=t.className;return i?void(i.indexOf(e)>-1||(t.className=i+" "+e)):void(t.className=e)}function r(t,e){var i=t.className;if(!(i.indexOf(e)<0)){for(var n=i.split(/\s/),r=[],s=0,a=n.length;a>s;s++)e!=n[s]&&r.push(n[s]);r.length?t.className=r.join(" "):t.removeAttribute("class")}}function s(t){t.preventDefault(),h?c():o()}function a(t){h&&!l(t.target,"#drawer-container",!0)&&c()}function o(){h=!0,n(document.documentElement,"is-drawerOpen")}function c(){h=!1,r(document.documentElement,"is-drawerOpen")}var l=t("dom-utils/lib/closest"),u=(document.getElementById("drawer-container"),document.getElementById("drawer-toggle")),h=!1;e.exports={init:function(){u.addEventListener("click",s),u.addEventListener("touchend",s),document.addEventListener("click",a),document.addEventListener("touchend",a)},open:o,close:c}},{"dom-utils/lib/closest":18}],4:[function(t,e,i){"use strict";function n(){this.currentPage=r(window.location.href),this.currentPage.title=document.title,history.replaceState(this.currentPage,this.currentPage.title,this.currentPage.href),this._queue=[];var t=this;window.addEventListener("popstate",function(e){var i=e.state,n=i&&i.title;t.add(window.location.href,n,i,e)})}var r=t("dom-utils/lib/parse-url");n.prototype.add=function(t,e,i,n){t!=this.currentPage.href&&(this.nextPage=r(t),this.nextPage.title=e,this.nextPage.state=i,this._processQueue(n))},n.prototype.use=function(t){return this._queue.push(t),this},n.prototype["catch"]=function(t){return this._onError=t,this},n.prototype._onError=function(t){console.error(t.stack)},n.prototype._onComplete=function(t){this.nextPage.title&&(document.title=this.nextPage.title),t&&"popstate"==t.type||history.pushState(this.nextPage,this.nextPage.title,this.nextPage.href),this.currentPage=this.nextPage,this.nextPage=null},n.prototype._processQueue=function(t){var e=this,i=0;!function n(){function r(t){t?e._onError(t):n()}var s=e._queue[i++],a=s&&!s.length;if(!s)return e._onComplete(t);try{s.apply(e,a?[]:[r])}catch(o){return e._onError(o)}a&&n()}()},e.exports=n},{"dom-utils/lib/parse-url":23}],5:[function(t,e,i){"use strict";t("./analytics"),t("./content-loader").init(),t("./drawer").init()},{"./analytics":1,"./content-loader":2,"./drawer":3}],6:[function(t,e,i){e.exports={DEV_ID:"i5iSjo",NULL_DIMENSION:"(not set)"}},{}],7:[function(t,e,i){function n(t,e){this.opts=o(e,{stripQuery:!0,queryDimensionIndex:null,indexFilename:null,trailingSlash:null}),this.tracker=t,this.overrideTrackerBuildHitTask()}var r=t("dom-utils/lib/parse-url"),s=t("../constants"),a=t("../provide"),o=t("../utilities").defaults;n.prototype.cleanUrlTask=function(t){var e=t.get("location"),i=t.get("page"),n=r(i||e),a=n.pathname,o=a;if(this.opts.indexFilename){var c=o.split("/");this.opts.indexFilename==c[c.length-1]&&(c[c.length-1]="",o=c.join("/"))}if(this.opts.trailingSlash===!1)o=o.replace(/\/+$/,"");else if(this.opts.trailingSlash===!0){var l=/\.\w+$/.test(o);l||"/"==o.substr(-1)||(o+="/")}this.opts.stripQuery&&this.opts.queryDimensionIndex&&t.set("dimension"+this.opts.queryDimensionIndex,n.query||s.NULL_DIMENSION),t.set("page",o+(this.opts.stripQuery?"":n.search))},n.prototype.overrideTrackerBuildHitTask=function(){this.originalTrackerBuildHitTask=this.tracker.get("buildHitTask"),this.tracker.set("buildHitTask",function(t){this.cleanUrlTask(t),this.originalTrackerBuildHitTask(t)}.bind(this))},n.prototype.remove=function(){this.tracker.set("sendHitTask",this.originalTrackerSendHitTask)},a("cleanUrlTracker",n)},{"../constants":6,"../provide":13,"../utilities":14,"dom-utils/lib/parse-url":23}],8:[function(t,e,i){function n(t,e){if(window.addEventListener){this.opts=l(e,{events:["click"],attributePrefix:"ga-",fieldsObj:null,hitFilter:null}),this.tracker=t,this.handleEvents=this.handleEvents.bind(this);var i="["+this.opts.attributePrefix+"on]";this.delegates={},this.opts.events.forEach(function(t){this.delegates[t]=r(document,t,i,this.handleEvents,{deep:!0,useCapture:!0})}.bind(this))}}var r=t("dom-utils/lib/delegate"),s=t("dom-utils/lib/get-attributes"),a=t("../provide"),o=t("../utilities").camelCase,c=t("../utilities").createFieldsObj,l=t("../utilities").defaults;n.prototype.handleEvents=function(t,e){var i=this.opts.attributePrefix;if(t.type==e.getAttribute(i+"on")){var n={},r=s(e);Object.keys(r).forEach(function(t){if(0===t.indexOf(i)&&t!=i+"on"){var e=r[t];"true"==e&&(e=!0),"false"==e&&(e=!1);var s=o(t.slice(i.length));n[s]=e}}),this.tracker.send(n.hitType||"event",c(n,this.opts.fieldsObj,this.tracker,this.opts.hitFilter))}},n.prototype.remove=function(){Object.keys(this.delegates).forEach(function(t){this.delegates[t].destroy()}.bind(this))},a("eventTracker",n)},{"../provide":13,"../utilities":14,"dom-utils/lib/delegate":19,"dom-utils/lib/get-attributes":20}],9:[function(t,e,i){function n(t,e){window.matchMedia&&(this.opts=l(e,{definitions:!1,changeTemplate:this.changeTemplate,changeTimeout:1e3,fieldsObj:null,hitFilter:null}),u(this.opts.definitions)&&(this.opts.definitions=h(this.opts.definitions),this.tracker=t,this.changeListeners=[],this.processMediaQueries()))}function r(t){return p[t]?p[t]:(p[t]=window.matchMedia(t),p[t])}var s=t("debounce"),a=t("../constants"),o=t("../provide"),c=t("../utilities").createFieldsObj,l=t("../utilities").defaults,u=t("../utilities").isObject,h=t("../utilities").toArray,p={};n.prototype.processMediaQueries=function(){this.opts.definitions.forEach(function(t){if(t.name&&t.dimensionIndex){var e=this.getMatchName(t);this.tracker.set("dimension"+t.dimensionIndex,e),this.addChangeListeners(t)}}.bind(this))},n.prototype.getMatchName=function(t){var e;return t.items.forEach(function(t){r(t.media).matches&&(e=t)}),e?e.name:a.NULL_DIMENSION},n.prototype.addChangeListeners=function(t){t.items.forEach(function(e){var i=r(e.media),n=s(function(){this.handleChanges(t)}.bind(this),this.opts.changeTimeout);i.addListener(n),this.changeListeners.push({mql:i,fn:n})}.bind(this))},n.prototype.handleChanges=function(t){var e=this.getMatchName(t),i=this.tracker.get("dimension"+t.dimensionIndex);if(e!==i){this.tracker.set("dimension"+t.dimensionIndex,e);var n={eventCategory:t.name,eventAction:"change",eventLabel:this.opts.changeTemplate(i,e)};this.tracker.send("event",c(n,this.opts.fieldsObj,this.tracker,this.opts.hitFilter))}},n.prototype.remove=function(){for(var t,e=0;t=this.changeListeners[e];e++)t.mql.removeListener(t.fn)},n.prototype.changeTemplate=function(t,e){return t+" => "+e},o("mediaQueryTracker",n)},{"../constants":6,"../provide":13,"../utilities":14,debounce:17}],10:[function(t,e,i){function n(t,e){window.addEventListener&&(this.opts=c(e,{linkSelector:"a",shouldTrackOutboundLink:this.shouldTrackOutboundLink,fieldsObj:null,hitFilter:null}),this.tracker=t,this.delegate=r(document,"click",this.opts.linkSelector,this.handleLinkClicks.bind(this),{deep:!0,useCapture:!0}))}var r=t("dom-utils/lib/delegate"),s=t("dom-utils/lib/parse-url"),a=t("../provide"),o=t("../utilities").createFieldsObj,c=t("../utilities").defaults;n.prototype.handleLinkClicks=function(t,e){if(this.opts.shouldTrackOutboundLink(e,s)){navigator.sendBeacon||(e.target="_blank");var i={transport:"beacon",eventCategory:"Outbound Link",eventAction:"click",eventLabel:e.href};this.tracker.send("event",o(i,this.opts.fieldsObj,this.tracker,this.opts.hitFilter))}},n.prototype.shouldTrackOutboundLink=function(t,e){var i=e(t.href);return i.hostname!=location.hostname&&"http"==i.protocol.slice(0,4)},n.prototype.remove=function(){this.delegate.destroy()},a("outboundLinkTracker",n)},{"../provide":13,"../utilities":14,"dom-utils/lib/delegate":19,"dom-utils/lib/parse-url":23}],11:[function(t,e,i){function n(t,e){window.addEventListener&&(this.opts=a(e,{visibleMetricIndex:null,hiddenMetricIndex:null,sessionTimeout:c,changeTemplate:this.changeTemplate,fieldsObj:null,hitFilter:null}),this.tracker=t,this.visibilityState=document.visibilityState,this.lastVisibilityChangeTime=+new Date,this.handleVisibilityStateChange=this.handleVisibilityStateChange.bind(this),this.overrideTrackerSendMethod(),this.overrideTrackerSendHitTask(),document.addEventListener("visibilitychange",this.handleVisibilityStateChange))}var r=t("../provide"),s=t("../utilities").createFieldsObj,a=t("../utilities").defaults,o=t("../utilities").isObject,c=30;n.prototype.handleVisibilityStateChange=function(){var t;if(this.prevVisibilityState=this.visibilityState,this.visibilityState=document.visibilityState,this.sessionHasTimedOut()){if("hidden"==this.visibilityState)return;"visible"==this.visibilityState&&(t={transport:"beacon"},this.tracker.send("pageview",s(t,this.opts.fieldsObj,this.tracker,this.opts.hitFilter)))}else{var e=Math.round((new Date-this.lastVisibilityChangeTime)/1e3)||1;t={transport:"beacon",eventCategory:"Page Visibility",eventAction:"change",eventLabel:this.opts.changeTemplate(this.prevVisibilityState,this.visibilityState),eventValue:e};var i=this.opts[this.prevVisibilityState+"MetricIndex"];i&&(t["metric"+i]=e),this.tracker.send("event",s(t,this.opts.fieldsObj,this.tracker,this.opts.hitFilter))}this.lastVisibilityChangeTime=+new Date},n.prototype.sessionHasTimedOut=function(){var t=(new Date-this.lastHitTime)/6e4;return this.opts.sessionTimeout<t},n.prototype.overrideTrackerSendMethod=function(){this.originalTrackerSendMethod=this.tracker.send,this.tracker.send=function(){var t=Array.prototype.slice.call(arguments),e=t[0],i=o(e)?e.hitType:e,n="pageview"==i;if(!n&&this.sessionHasTimedOut()){var r={transport:"beacon"};this.originalTrackerSendMethod.call(this.tracker,"pageview",s(r,this.opts.fieldsObj,this.tracker,this.opts.hitFilter))}this.originalTrackerSendMethod.apply(this.tracker,t)}.bind(this)},n.prototype.overrideTrackerSendHitTask=function(){this.originalTrackerSendHitTask=this.tracker.get("sendHitTask"),this.lastHitTime=+new Date,this.tracker.set("sendHitTask",function(t){this.originalTrackerSendHitTask(t),this.lastHitTime=+new Date}.bind(this))},n.prototype.changeTemplate=function(t,e){return t+" => "+e},n.prototype.remove=function(){this.tracker.set("sendHitTask",this.originalTrackerSendHitTask),this.tracker.send=this.originalTrackerSendMethod,document.removeEventListener("visibilitychange",this.handleVisibilityStateChange)},r("pageVisibilityTracker",n)},{"../provide":13,"../utilities":14}],12:[function(t,e,i){function n(t,e){history.pushState&&window.addEventListener&&(this.opts=o(e,{shouldTrackUrlChange:this.shouldTrackUrlChange,fieldsObj:null,hitFilter:null}),this.tracker=t,this.path=r(),this.updateTrackerData=this.updateTrackerData.bind(this),this.originalPushState=history.pushState,history.pushState=function(t,e){c(t)&&e&&(t.title=e),this.originalPushState.apply(history,arguments),this.updateTrackerData()}.bind(this),this.originalReplaceState=history.replaceState,history.replaceState=function(t,e){c(t)&&e&&(t.title=e),this.originalReplaceState.apply(history,arguments),this.updateTrackerData(!1)}.bind(this),window.addEventListener("popstate",this.updateTrackerData))}function r(){return location.pathname+location.search}var s=t("../provide"),a=t("../utilities").createFieldsObj,o=t("../utilities").defaults,c=t("../utilities").isObject;n.prototype.updateTrackerData=function(t){t=t!==!1,setTimeout(function(){var e=this.path,i=r();if(e!=i&&this.opts.shouldTrackUrlChange.call(this,i,e)&&(this.path=i,this.tracker.set({page:i,title:c(history.state)&&history.state.title||document.title}),t)){var n={transport:"beacon"};this.tracker.send("pageview",a(n,this.opts.fieldsObj,this.tracker,this.opts.hitFilter))}}.bind(this),0)},n.prototype.shouldTrackUrlChange=function(t,e){return t&&e},n.prototype.remove=function(){window.removeEventListener("popstate",this.updateTrackerData),history.replaceState=this.originalReplaceState,history.pushState=this.originalPushState,this.tracker=null,this.opts=null,this.path=null,this.updateTrackerData=null,this.originalReplaceState=null,this.originalPushState=null},s("urlChangeTracker",n)},{"../provide":13,"../utilities":14}],13:[function(t,e,i){var n=t("./constants"),r=t("./utilities");(window.gaDevIds=window.gaDevIds||[]).push(n.DEV_ID),e.exports=function(t,e){var i=window.GoogleAnalyticsObject||"ga";window[i]=window[i]||function(){(window[i].q=window[i].q||[]).push(arguments)},window[i]("provide",t,e),window.gaplugins=window.gaplugins||{},window.gaplugins[r.capitalize(t)]=e}},{"./constants":6,"./utilities":14}],14:[function(t,e,i){var n=t("object-assign"),r={createFieldsObj:function(t,e,i,s){if(r.isObject(t)||(t={}),r.isObject(e)||(e={}),"function"==typeof s){var a=i.get("buildHitTask");return{buildHitTask:function(i){var n;for(n in t)t.hasOwnProperty(n)&&i.set(n,t[n],!0);for(n in e)e.hasOwnProperty(n)&&i.set(n,e[n],!0);s(i),a(i)}}}return n({},t,e)},withTimeout:function(t,e){var i=!1;return setTimeout(t,e||2e3),function(){i||(i=!0,t())}},defaults:function(t,e){var i={};r.isObject(t)||(t={}),r.isObject(e)||(e={});for(var n in e)e.hasOwnProperty(n)&&(i[n]=t.hasOwnProperty(n)?t[n]:e[n]);return i},camelCase:function(t){return t.replace(/[\-\_]+(\w?)/g,function(t,e){return e.toUpperCase()})},capitalize:function(t){return t.charAt(0).toUpperCase()+t.slice(1)},isObject:function(t){return"object"==typeof t&&null!==t},isArray:Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)},toArray:function(t){return r.isArray(t)?t:[t]}};e.exports=r},{"object-assign":15}],15:[function(t,e,i){"use strict";function n(t){if(null===t||void 0===t)throw new TypeError("Object.assign cannot be called with null or undefined");return Object(t)}function r(){try{if(!Object.assign)return!1;var t=new String("abc");if(t[5]="de","5"===Object.getOwnPropertyNames(t)[0])return!1;for(var e={},i=0;10>i;i++)e["_"+String.fromCharCode(i)]=i;var n=Object.getOwnPropertyNames(e).map(function(t){return e[t]});if("0123456789"!==n.join(""))return!1;var r={};return"abcdefghijklmnopqrst".split("").forEach(function(t){r[t]=t}),"abcdefghijklmnopqrst"===Object.keys(Object.assign({},r)).join("")}catch(s){return!1}}var s=Object.prototype.hasOwnProperty,a=Object.prototype.propertyIsEnumerable;e.exports=r()?Object.assign:function(t,e){for(var i,r,o=n(t),c=1;c<arguments.length;c++){i=Object(arguments[c]);for(var l in i)s.call(i,l)&&(o[l]=i[l]);if(Object.getOwnPropertySymbols){r=Object.getOwnPropertySymbols(i);for(var u=0;u<r.length;u++)a.call(i,r[u])&&(o[r[u]]=i[r[u]])}}return o}},{}],16:[function(t,e,i){function n(){return(new Date).getTime()}e.exports=Date.now||n},{}],17:[function(t,e,i){var n=t("date-now");e.exports=function(t,e,i){function r(){var u=n()-c;e>u&&u>0?s=setTimeout(r,e-u):(s=null,i||(l=t.apply(o,a),s||(o=a=null)))}var s,a,o,c,l;return null==e&&(e=100),function(){o=this,a=arguments,c=n();var u=i&&!s;return s||(s=setTimeout(r,e)),u&&(l=t.apply(o,a),o=a=null),l}}},{"date-now":16}],18:[function(t,e,i){var n=t("./matches"),r=t("./parents");e.exports=function(t,e,i){if(t&&1==t.nodeType&&e)for(var s,a=(i?[t]:[]).concat(r(t)),o=0;s=a[o];o++)if(n(s,e))return s}},{"./matches":21,"./parents":22}],19:[function(t,e,i){var n=t("./closest"),r=t("./matches");e.exports=function(t,e,i,s,a){a=a||{};var o=function(t){if(a.deep&&"function"==typeof t.deepPath)for(var e,o=t.deepPath(),c=0;e=o[c];c++)1==e.nodeType&&r(e,i)&&(l=e);else var l=n(t.target,i,!0);l&&s.call(l,t,l)};return t.addEventListener(e,o,a.useCapture),{destroy:function(){t.removeEventListener(e,o,a.useCapture)}}}},{"./closest":18,"./matches":21}],20:[function(t,e,i){e.exports=function(t){var e={};if(!t||1!=t.nodeType)return e;var i=t.attributes;if(0===i.length)return{};for(var n,r=0;n=i[r];r++)e[n.name]=n.value;return e}},{}],21:[function(t,e,i){function n(t,e){if("string"!=typeof e)return!1;if(s)return s.call(t,e);for(var i,n=t.parentNode.querySelectorAll(e),r=0;i=n[r];r++)if(i==t)return!0;return!1}var r=Element.prototype,s=r.matches||r.matchesSelector||r.webkitMatchesSelector||r.mozMatchesSelector||r.msMatchesSelector||r.oMatchesSelector;e.exports=function(t,e){if(t&&1==t.nodeType&&e){if("string"==typeof e||1==e.nodeType)return t==e||n(t,e);if("length"in e)for(var i,r=0;i=e[r];r++)if(t==i||n(t,i))return!0}return!1}},{}],22:[function(t,e,i){e.exports=function(t){for(var e=[];t&&t.parentNode&&1==t.parentNode.nodeType;)e.push(t=t.parentNode);return e}},{}],23:[function(t,e,i){var n="80",r="443",s=document.createElement("a"),a={};e.exports=function o(t){if(t=t&&"."!=t?t:location.href,a[t])return a[t];if(s.href=t,"."==t.charAt(0))return o(s.href);var e=s.protocol&&":"!=s.protocol?s.protocol:location.protocol,i=s.port==n||s.port==r?"":s.port;i="0"==i?"":i;var c=""==s.host?location.host:s.host,l=""==s.hostname?location.hostname:s.hostname;c=c.replace(":"+("http:"==e?n:r),"");var u=s.origin?s.origin:e+"//"+c,h="/"==s.pathname.charAt(0)?s.pathname:"/"+s.pathname;return a[t]={hash:s.hash,host:c,hostname:l,href:s.href,origin:u,pathname:h,port:i,protocol:e,search:s.search,fragment:s.hash.slice(1),path:h+s.search,query:s.search.slice(1)}}},{}]},{},[5]);
//# sourceMappingURL=main.js.map
