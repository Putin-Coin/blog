(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = function (element, event, fn) {
  if (element.addEventListener) {
    element.addEventListener(event, fn, false);
  } else {
    element.attachEvent('on' + event, fn);
  }
};

},{}],2:[function(require,module,exports){
'use strict';

// Requires the individual autotrack plugins that are used in
// templates/_analytics.html
require('autotrack/lib/plugins/media-query-tracker');
require('autotrack/lib/plugins/outbound-link-tracker');
require('autotrack/lib/plugins/page-visibility-tracker');
require('autotrack/lib/plugins/social-tracker');
// require('autotrack/lib/plugins/url-change-tracker');

},{"autotrack/lib/plugins/media-query-tracker":10,"autotrack/lib/plugins/outbound-link-tracker":11,"autotrack/lib/plugins/page-visibility-tracker":12,"autotrack/lib/plugins/social-tracker":13}],3:[function(require,module,exports){
'use strict';

/* global ga */

var linkClicked = require('./link-clicked');
var History2 = require('./history2');
var drawer = require('./drawer');
var parseUrl = require('./parse-url');

// Cache the container element to avoid multiple lookups.
var container;

// Store the result of page content requests to avoid multiple
// lookups when navigation to a previously seen page.
var pageCache = {};

function getTitle(a) {
  var title = a.title || a.innerText;
  return title ? title + ' — Philip Walton' : null;
}

function loadPageContent(done) {
  var path = this.nextPage.path;

  if (pageCache[path]) return done();

  var basename = /(\w+)\.html$/;
  var url = basename.test(path) ? path.replace(basename, '_$1.html') : path + '_index.html';

  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 400) {
      pageCache[path] = xhr.responseText;
      done();
    } else {
      done(new Error('(' + xhr.status + ') ' + xhr.response));
    }
  };
  xhr.onerror = function () {
    done(new Error('Error making request to:' + url));
  };
  xhr.send();
}

function showPageContent() {
  var content = pageCache[this.nextPage.path];
  container.innerHTML = content;
}

function closeDrawer() {
  drawer.close();
}

function setScroll() {
  var hash = this.nextPage.hash;
  if (hash) {
    var target = document.getElementById(hash.slice(1));
  }
  var scrollPos = target ? target.offsetTop : 0;

  // TODO: There's a weird chrome bug were sometime this function
  // doesn't do anything if Chrome has already visited this page and
  // thinks it has a scroll position in mind. Just chrome, weird...
  window.scrollTo(0, scrollPos);
}

function trackPageview() {
  ga('send', 'pageview', { dimension4: 'urlChangeTracker' });
}

function trackError(error) {
  ga('send', 'exception', { exDescription: error.stack || error.message });
}

module.exports = {

  init: function init() {

    // Only load external content via AJAX if the browser support pushState.
    if (!(window.history && window.history.pushState)) return;

    // Add the current page to the cache.
    container = document.querySelector('main');
    pageCache[location.pathname] = container.innerHTML;

    var history2 = new History2().use(loadPageContent).use(showPageContent).use(closeDrawer).use(setScroll).use(trackPageview)['catch'](trackError);

    linkClicked(function (event) {

      // Don't attempt to load content if the user is trying to open a new tab.
      if (event.metaKey || event.ctrlKey || event.which > 1) return;

      var page = parseUrl(location.href);
      var link = parseUrl(this.href);

      // Don't do anything when clicking on links to the current URL.
      if (link.href == page.href) event.preventDefault();

      // If the clicked link is on the same site but has a different path,
      // prevent the browser from navigating there and load the page via ajax.
      if (link.origin == page.origin && link.path != page.path) {
        event.preventDefault();
        history2.add(link.href, getTitle(this));
      }
    });
  }
};

},{"./drawer":4,"./history2":5,"./link-clicked":6,"./parse-url":8}],4:[function(require,module,exports){
'use strict';

var closest = require('closest');

var drawerContainer = document.getElementById('drawer-container');
var drawerToggle = document.getElementById('drawer-toggle');
var isOpen = false;

function addClass(element, className) {
  var cls = element.className;
  if (!cls) {
    element.className = className;
    return;
  } else if (cls.indexOf(className) > -1) {
    return;
  } else {
    element.className = cls + ' ' + className;
  }
}

function removeClass(element, className) {
  var cls = element.className;
  if (cls.indexOf(className) < 0) return;

  var prevClasses = cls.split(/\s/);
  var newClasses = [];
  for (var i = 0, len = prevClasses.length; i < len; i++) {
    if (className != prevClasses[i]) newClasses.push(prevClasses[i]);
  }

  if (!newClasses.length) {
    element.removeAttribute('class');
  } else {
    element.className = newClasses.join(' ');
  }
}

function handleDrawerToggleClick(event) {
  event.preventDefault();
  isOpen ? close() : open();
}

function handleClickOutsideDrawerContainer(event) {
  // Closes an open menu if the user clicked outside of the nav element.
  if (isOpen && !closest(event.target, '#drawer-container', true)) close();
}

function open() {
  isOpen = true;
  addClass(document.documentElement, 'is-drawerOpen');
}

function close() {
  isOpen = false;
  removeClass(document.documentElement, 'is-drawerOpen');
}

module.exports = {
  init: function init() {
    drawerToggle.addEventListener('click', handleDrawerToggleClick);
    drawerToggle.addEventListener('touchend', handleDrawerToggleClick);

    document.addEventListener('click', handleClickOutsideDrawerContainer);
    document.addEventListener('touchend', handleClickOutsideDrawerContainer);
  },
  open: open,
  close: close
};

},{"closest":16}],5:[function(require,module,exports){
'use strict';

var parseUrl = require('./parse-url');

function History2() {

  // Store the current url information.
  this.currentPage = parseUrl(window.location.href);
  this.currentPage.title = document.title;

  // Add history state initially so the first `popstate` event contains data.
  history.replaceState(this.currentPage, this.currentPage.title, this.currentPage.href);

  this._queue = [];

  // Listen for popstate changes and log them.
  var self = this;
  window.addEventListener('popstate', function (event) {
    var state = event.state;
    var title = state && state.title;
    self.add(window.location.href, title, state, event);
  });
}

History2.prototype.add = function (url, title, state, event) {

  // Ignore urls pointing to the current address
  if (url == this.currentPage.href) return;

  this.nextPage = parseUrl(url);
  this.nextPage.title = title;
  this.nextPage.state = state;

  this._processQueue(event);
};

/**
 * Register a plugin with the History2 instance.
 * @param {Function(History2, done)} - A plugin that runs some task and
 *     informs the next plugin in the queue when it's done.
 */
History2.prototype.use = function (plugin) {
  this._queue.push(plugin);

  return this;
};

/**
 * Register a handler to catch any errors.
 * Note: In ES3 reserved words like "catch" couldn't be used as property names:
 * http://kangax.github.io/compat-table/es5/#Reserved_words_as_property_names
 * @param {Function(Error)} - The function to handle the error.
 */
History2.prototype['catch'] = function (onError) {
  this._onError = onError;

  return this;
};

History2.prototype._onError = function (error) {
  // Left blank so calling `_onError` never fails.
  console.error(error.stack);
};

History2.prototype._onComplete = function (event) {

  if (this.nextPage.title) document.title = this.nextPage.title;

  // Popstate triggered navigation is already handled by the browser,
  // so we only add to the history in non-popstate cases.
  if (!(event && event.type == 'popstate')) {
    history.pushState(this.nextPage, this.nextPage.title, this.nextPage.href);
  }

  // Update the last url to the current url
  this.currentPage = this.nextPage;
  this.nextPage = null;
};

History2.prototype._processQueue = function (event) {
  var self = this;
  var i = 0;

  (function next() {

    var plugin = self._queue[i++];
    var isSync = plugin && !plugin.length;

    if (!plugin) return self._onComplete(event);

    // The callback for async plugins.
    function done(error) {
      if (error) {
        self._onError(error);
      } else {
        next();
      }
    }

    try {
      plugin.apply(self, isSync ? [] : [done]);
    } catch (error) {
      return self._onError(error);
    }

    // Sync plugins are done by now and can immediately process
    // the next item in the queue.
    if (isSync) next();
  })();
};

module.exports = History2;

},{"./parse-url":8}],6:[function(require,module,exports){
'use strict';

var addListener = require('./add-listener');

function isLink(el) {
  return el.nodeName && el.nodeName.toLowerCase() == 'a' && el.href;
}

function getLinkAncestor(el) {
  if (isLink(el)) return el;
  while (el.parentNode && el.parentNode.nodeType == 1) {
    if (isLink(el)) return el;
    el = el.parentNode;
  }
}

module.exports = function (fn) {
  addListener(document, 'click', function (event) {
    var e = event || window.event;
    var target = e.target || e.srcElement;
    var link = getLinkAncestor(target);
    if (link) {
      fn.call(link, e);
    }
  });
};

},{"./add-listener":1}],7:[function(require,module,exports){
'use strict';

// Loads autotrack plugins.
require('./analytics');

// Loads link via AJAX instead of full page loads in browsers with pushState.
require('./content-loader').init();

// Turns on the collapsable drawer.
require('./drawer').init();

},{"./analytics":2,"./content-loader":3,"./drawer":4}],8:[function(require,module,exports){
'use strict';

var a = document.createElement('a');
var cache = {};

/**
 * Parse the given url and return the properties returned
 * by the `Location` object.
 * @param {string} url - The url to parse.
 * @return {Object} An object with the same keys as `window.location`.
 */
module.exports = function (url) {

  if (cache[url]) return cache[url];

  var httpPort = /:80$/;
  var httpsPort = /:443/;

  a.href = url;

  // Sometimes IE will return no port or just a colon, especially for things
  // like relative port URLs (e.g. "//google.com").
  var protocol = !a.protocol || ':' == a.protocol ? location.protocol : a.protocol;

  // Don't include default ports.
  var port = a.port == '80' || a.port == '443' ? '' : a.port;

  // Sometimes IE incorrectly includes a port (e.g. `:80` or `:443`)  even
  // when no port is specified in the URL.
  // http://bit.ly/1rQNoMg
  var host = a.host.replace(protocol == 'http:' ? httpPort : httpsPort, '');

  // Not all browser support `origin` so we have to build it.
  var origin = a.origin ? a.origin : protocol + '//' + host;

  // Sometimes IE doesn't include the leading slash for pathname.
  // http://bit.ly/1rQNoMg
  var pathname = a.pathname.charAt(0) == '/' ? a.pathname : '/' + a.pathname;

  return cache[url] = {
    hash: a.hash,
    host: host,
    hostname: a.hostname,
    href: a.href,
    origin: origin,
    path: pathname + a.search,
    pathname: pathname,
    port: port,
    protocol: protocol,
    search: a.search
  };
};

},{}],9:[function(require,module,exports){
/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


module.exports = {
  DEV_ID: 'i5iSjo'
};

},{}],10:[function(require,module,exports){
/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


var debounce = require('debounce');
var defaults = require('../utilities').defaults;
var isObject = require('../utilities').isObject;
var toArray = require('../utilities').toArray;
var provide = require('../provide');


/**
 * Sets the string to use when no custom dimension value is available.
 */
var NULL_DIMENSION = '(not set)';


/**
 * Declares the MediaQueryListener instance cache.
 */
var mediaMap = {};


/**
 * Registers media query tracking.
 * @constructor
 * @param {Object} tracker Passed internally by analytics.js
 * @param {?Object} opts Passed by the require command.
 */
function MediaQueryTracker(tracker, opts) {

  // Registers the plugin on the global gaplugins object.
  window.gaplugins = window.gaplugins || {};
  gaplugins.MediaQueryTracker = MediaQueryTracker;

  // Feature detects to prevent errors in unsupporting browsers.
  if (!window.matchMedia) return;

  this.opts = defaults(opts, {
    mediaQueryDefinitions: false,
    mediaQueryChangeTemplate: this.changeTemplate,
    mediaQueryChangeTimeout: 1000
  });

  // Exits early if media query data doesn't exist.
  if (!isObject(this.opts.mediaQueryDefinitions)) return;

  this.opts.mediaQueryDefinitions = toArray(this.opts.mediaQueryDefinitions);
  this.tracker = tracker;
  this.timeouts = {};

  this.processMediaQueries();
}


/**
 * Loops through each media query definition, sets the custom dimenion data,
 * and adds the change listeners.
 */
MediaQueryTracker.prototype.processMediaQueries = function() {
  this.opts.mediaQueryDefinitions.forEach(function(dimension) {

    if (!dimension.dimensionIndex) {
      throw new Error('Media query definitions must have a name.');
    }

    if (!dimension.dimensionIndex) {
      throw new Error('Media query definitions must have a dimension index.');
    }

    var name = this.getMatchName(dimension);
    this.tracker.set('dimension' + dimension.dimensionIndex, name);

    this.addChangeListeners(dimension);
  }.bind(this));
};


/**
 * Takes a dimension object and return the name of the matching media item.
 * If no match is found, the NULL_DIMENSION value is returned.
 * @param {Object} dimension A set of named media queries associated
 *     with a single custom dimension.
 * @return {string} The name of the matched media or NULL_DIMENSION.
 */
MediaQueryTracker.prototype.getMatchName = function(dimension) {
  var match;

  dimension.items.forEach(function(item) {
    if (getMediaListener(item.media).matches) {
      match = item;
    }
  });
  return match ? match.name : NULL_DIMENSION;
};


/**
 * Adds change listeners to each media query in the dimension list.
 * Debounces the changes to prevent unnecessary hits from being sent.
 * @param {Object} dimension A set of named media queries associated
 *     with a single custom dimension
 */
MediaQueryTracker.prototype.addChangeListeners = function(dimension) {
  dimension.items.forEach(function(item) {
    var mql = getMediaListener(item.media);
    mql.addListener(debounce(function() {
      this.handleChanges(dimension);
    }.bind(this), this.opts.mediaQueryChangeTimeout));
  }.bind(this));
};


/**
 * Handles changes to the matched media. When the new value differs from
 * the old value, a change event is sent.
 * @param {Object} dimension A set of named media queries associated
 *     with a single custom dimension
 */
MediaQueryTracker.prototype.handleChanges = function(dimension) {
  var newValue = this.getMatchName(dimension);
  var oldValue = this.tracker.get('dimension' + dimension.dimensionIndex);

  if (newValue !== oldValue) {
    this.tracker.set('dimension' + dimension.dimensionIndex, newValue);
    this.tracker.send('event', dimension.name, 'change',
        this.opts.mediaQueryChangeTemplate(oldValue, newValue));
  }
};


/**
 * Sets the default formatting of the change event label.
 * This can be overridden by setting the `mediaQueryChangeTemplate` option.
 * @param {string} oldValue
 * @param {string} newValue
 * @return {string} The formatted event label.
 */
MediaQueryTracker.prototype.changeTemplate = function(oldValue, newValue) {
  return oldValue + ' => ' + newValue;
};



/**
 * Accepts a media query and returns a MediaQueryListener object.
 * Caches the values to avoid multiple unnecessary instances.
 * @param {string} media A media query value.
 * @return {MediaQueryListener}
 */
function getMediaListener(media) {
  // Returns early if the media is cached.
  if (mediaMap[media]) return mediaMap[media];

  mediaMap[media] = window.matchMedia(media);
  return mediaMap[media];
}


provide('mediaQueryTracker', MediaQueryTracker);

},{"../provide":14,"../utilities":15,"debounce":17}],11:[function(require,module,exports){
/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


var defaults = require('../utilities').defaults;
var delegate = require('delegate');
var provide = require('../provide');


/**
 * Registers outbound link tracking on a tracker object.
 * @constructor
 * @param {Object} tracker Passed internally by analytics.js
 * @param {?Object} opts Passed by the require command.
 */
function OutboundLinkTracker(tracker, opts) {

  // Registers the plugin on the global gaplugins object.
  window.gaplugins = window.gaplugins || {};
  gaplugins.OutboundLinkTracker = OutboundLinkTracker;

  // Feature detects to prevent errors in unsupporting browsers.
  if (!window.addEventListener) return;

  this.opts = defaults(opts, {
    shouldTrackOutboundLink: this.shouldTrackOutboundLink
  });

  this.tracker = tracker;

  delegate(document, 'a', 'click', this.handleLinkClicks.bind(this));
}


/**
 * Handles all clicks on link elements. A link is considered an outbound link
 * its hostname property does not match location.hostname. When the beacon
 * transport method is not available, the links target is set to "_blank" to
 * ensure the hit can be sent.
 * @param {Event} event The DOM click event.
 */
OutboundLinkTracker.prototype.handleLinkClicks = function(event) {
  var link = event.delegateTarget;
  if (this.opts.shouldTrackOutboundLink(link)) {
    // Opens outbound links in a new tab if the browser doesn't support
    // the beacon transport method.
    if (!navigator.sendBeacon) {
      link.target = '_blank';
    }
    this.tracker.send('event', 'Outbound Link', 'click', link.href, {
      transport: 'beacon'
    });
  }
};


/**
 * Determines whether or not the tracker should send a hit when a link is
 * clicked. By default links with a hostname property not equal to the current
 * hostname are tracked.
 * @param {Element} link The link that was clicked on.
 * @return {boolean} Whether or not the link should be tracked.
 */
OutboundLinkTracker.prototype.shouldTrackOutboundLink = function(link) {
  return link.hostname != location.hostname;
};


provide('outboundLinkTracker', OutboundLinkTracker);

},{"../provide":14,"../utilities":15,"delegate":19}],12:[function(require,module,exports){
/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


var defaults = require('../utilities').defaults;
var isObject = require('../utilities').isObject;
var provide = require('../provide');


var DEFAULT_SESSION_TIMEOUT = 30; // 30 minutes.


/**
 * Registers outbound link tracking on tracker object.
 * @constructor
 * @param {Object} tracker Passed internally by analytics.js
 * @param {?Object} opts Passed by the require command.
 */
function PageVisibilityTracker(tracker, opts) {

  // Registers the plugin on the global gaplugins object.
  window.gaplugins = window.gaplugins || {};
  gaplugins.PageVisibilityTracker = PageVisibilityTracker;

  // Feature detects to prevent errors in unsupporting browsers.
  if (!window.addEventListener) return;

  this.opts = defaults(opts, {
    sessionTimeout: DEFAULT_SESSION_TIMEOUT,
    virtualPageviewFields: {},
  });

  this.tracker = tracker;

  this.overrideTrackerSendMethod();
  this.overrideTrackerSentHitTask();

  document.addEventListener(
      'visibilitychange', this.handleVisibilityStateChange.bind(this));
}


/**
 * Handles changes to `document.visibilityState`.
 */
PageVisibilityTracker.prototype.handleVisibilityStateChange = function() {
  var visibilityState = document.visibilityState;

  if (this.sessionHasTimedOut()) {
    // Prevents sending 'hidden' state hits when the session has timed out.
    if (visibilityState == 'hidden') return;

    if (visibilityState == 'visible') {
      // If the session has timed out, a transition to "visible" should be
      // considered a new pageview and a new session.
      this.tracker.send('pageview', this.opts.virtualPageviewFields);
    }
  }
  else {
    this.tracker.send('event', {
      eventCategory: 'Page Visibility',
      eventAction: 'change',
      eventLabel: document.visibilityState,
      transport: 'beacon'
    });
  }
};


/**
 * Returns true if the session has not timed out. A session timeout occurs when
 * more than `this.opts.sessionTimeout` minutes has elapsed since the
 * tracker sent the previous hit.
 * @return {boolean} True if the session has timed out.
 */
PageVisibilityTracker.prototype.sessionHasTimedOut = function() {
  var minutesSinceLastHit = (new Date - this.lastHitTime_) / (60 * 1000);
  return this.opts.sessionTimeout < minutesSinceLastHit;
}


/**
 * Overrides the `tracker.send` method to send a pageview hit before the
 * current hit being sent if the session has timed out and the current hit is
 * not a pageview itself.
 */
PageVisibilityTracker.prototype.overrideTrackerSendMethod = function() {
  var originalTrackerSendMethod = this.tracker.send;

  this.tracker.send = function() {
    var args = Array.prototype.slice.call(arguments);
    var firstArg = args[0];
    var hitType = isObject(firstArg) ? firstArg.hitType : firstArg;
    var isPageview = hitType == 'pageview';

    if (!isPageview && this.sessionHasTimedOut()) {
      originalTrackerSendMethod.call(this.tracker,
          'pageview', this.opts.virtualPageviewFields);
    }

    originalTrackerSendMethod.apply(this.tracker, args);
  }.bind(this);
};


/**
 * Overrides the tracker's `sendHitTask` to record the time of the previous
 * hit. This is used to determine whether or not a session has timed out.
 */
PageVisibilityTracker.prototype.overrideTrackerSentHitTask = function() {
  var originalTrackerSendHitTask = this.tracker.get('sendHitTask');
  this.lastHitTime_ = +new Date;

  this.tracker.set('sendHitTask', function(model) {
    originalTrackerSendHitTask(model);
    this.lastHitTime_ = +new Date;
  }.bind(this));
}


provide('pageVisibilityTracker', PageVisibilityTracker);

},{"../provide":14,"../utilities":15}],13:[function(require,module,exports){
/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


var defaults = require('../utilities').defaults;
var delegate = require('delegate');
var provide = require('../provide');


/**
 * Registers social tracking on tracker object.
 * Supports both declarative social tracking via HTML attributes as well as
 * tracking for social events when using official Twitter or Facebook widgets.
 * @constructor
 * @param {Object} tracker Passed internally by analytics.js
 * @param {?Object} opts Passed by the require command.
 */
function SocialTracker(tracker, opts) {

  // Registers the plugin on the global gaplugins object.
  window.gaplugins = window.gaplugins || {};
  gaplugins.SocialTracker = SocialTracker;

  // Feature detects to prevent errors in unsupporting browsers.
  if (!window.addEventListener) return;

  this.opts = defaults(opts, {
    attributePrefix: 'data-'
  });

  this.tracker = tracker;

  var prefix = this.opts.attributePrefix;
  var selector = '[' + prefix + 'social-network]' +
                 '[' + prefix + 'social-action]' +
                 '[' + prefix + 'social-target]';

  delegate(document, selector, 'click', this.handleSocialClicks.bind(this));

  this.detectLibraryLoad('FB', 'facebook-jssdk',
      this.addFacebookEventHandlers.bind(this));

  this.detectLibraryLoad('twttr', 'twitter-wjs',
      this.addTwitterEventHandlers.bind(this));
}


/**
 * Handles all clicks on elements with social tracking attributes.
 * @param {Event} event The DOM click event.
 */
SocialTracker.prototype.handleSocialClicks = function(event) {

  var link = event.delegateTarget;
  var prefix = this.opts.attributePrefix;

  this.tracker.send('social', {
    socialNetwork: link.getAttribute(prefix + 'social-network'),
    socialAction: link.getAttribute(prefix + 'social-action'),
    socialTarget: link.getAttribute(prefix + 'social-target')
  });
};


/**
 * A utility method that determines when a social library is finished loading.
 * @param {string} namespace The global property name added to window.
 * @param {string} domId The ID of a script element in the DOM.
 * @param {Function} done A callback to be invoked when done.
 */
SocialTracker.prototype.detectLibraryLoad = function(namespace, domId, done) {
  if (window[namespace]) {
    done();
  }
  else {
    var script = document.getElementById(domId);
    if (script) {
      script.onload = done;
    }
  }
};


/**
 * Adds event handlers for the "tweet" and "follow" events emitted by the
 * official tweet and follow buttons. Note: this does not capture tweet or
 * follow events emitted by other Twitter widgets (tweet, timeline, etc.).
 */
SocialTracker.prototype.addTwitterEventHandlers = function() {
  try {
    twttr.ready(function() {

      twttr.events.bind('tweet', function(event) {
        // Ignore tweets from widgets that aren't the tweet button.
        if (event.region != 'tweet') return;

        var url = event.data.url || event.target.getAttribute('data-url') ||
            location.href;

        this.tracker.send('social', 'Twitter', 'tweet', url);
      }.bind(this));

      twttr.events.bind('follow', function(event) {
        // Ignore follows from widgets that aren't the follow button.
        if (event.region != 'follow') return;

        var screenName = event.data.screen_name ||
            event.target.getAttribute('data-screen-name');

        this.tracker.send('social', 'Twitter', 'follow', screenName);
      }.bind(this));
    }.bind(this));
  } catch(err) {}
};


/**
 * Adds event handlers for the "like" and "unlike" events emitted by the
 * official Facebook like button.
 */
SocialTracker.prototype.addFacebookEventHandlers = function() {
  try {
    FB.Event.subscribe('edge.create', function(url) {
      this.tracker.send('social', 'Facebook', 'like', url);
    }.bind(this));

    FB.Event.subscribe('edge.remove', function(url) {
      this.tracker.send('social', 'Facebook', 'unlike', url);
    }.bind(this));
  } catch(err) {}
};


provide('socialTracker', SocialTracker);

},{"../provide":14,"../utilities":15,"delegate":19}],14:[function(require,module,exports){
/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


var constants = require('./constants');


// Adds the dev ID to the list of dev IDs if any plugin is used.
(window.gaDevIds = window.gaDevIds || []).push(constants.DEV_ID);


/**
 * Provides a plugin for use with analytics.js, accounting for the possibility
 * that the global command queue has been renamed.
 * @param {string} pluginName The plugin name identifier.
 * @param {Function} pluginConstructor The plugin constructor function.
 */
module.exports = function providePlugin(pluginName, pluginConstructor) {
  var w = window;
  var g = w.GoogleAnalyticsObject || 'ga';

  // Creates the global command queue if it's not defined.
  w[g] = w[g] || function(){(w[g].q=w[g].q||[]).push(arguments)};
  w[g].l = w[g].l || +new Date;

  w[g]('provide', pluginName, pluginConstructor);
};

},{"./constants":9}],15:[function(require,module,exports){
/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


var utilities = {

  /**
   * Accepts a function and returns a wrapped version of the function that is
   * expected to be called elsewhere in the system. If it's not called
   * elsewhere after the timeout period, it's called regardless. The wrapper
   * function also prevents the callback from being called more than once.
   * @param {Function} callback The function to call.
   * @param {number} wait How many milliseconds to wait before invoking
   *     the callback.
   */
  withTimeout: function(callback, wait) {
    var called = false;
    setTimeout(callback, wait || 2000);
    return function() {
      if (!called) {
        called = true;
        callback();
      }
    };
  },


  /**
   * Accepts an object of overrides and defaults and returns a new object
   * with the values merged. For each key in defaults, if there's a
   * corresponding value in overrides, it gets used.
   * @param {Object} overrides.
   * @param {?Object} defaults.
   */
  defaults: function(overrides, defaults) {
    var result = {};

    if (typeof overrides != 'object') {
      overrides = {};
    }

    if (typeof defaults != 'object') {
      defaults = {};
    }

    for (var key in defaults) {
      if (defaults.hasOwnProperty(key)) {
        result[key] = overrides.hasOwnProperty(key) ?
            overrides[key] : defaults[key];
      }
    }
    return result;
  },


  isObject: function(obj) {
    return typeof obj == 'object' && obj !== null;
  },


  isArray: Array.isArray || function(arr) {
    return Object.prototype.toString.call(arr) === '[object Array]';
  },


  toArray: function(obj) {
    return utilities.isArray(obj) ? obj : [obj];
  }
};

module.exports = utilities;

},{}],16:[function(require,module,exports){
var matches = require('matches-selector')

module.exports = function (element, selector, checkYoSelf) {
  var parent = checkYoSelf ? element : element.parentNode

  while (parent && parent !== document) {
    if (matches(parent, selector)) return parent;
    parent = parent.parentNode
  }
}

},{"matches-selector":20}],17:[function(require,module,exports){

/**
 * Module dependencies.
 */

var now = require('date-now');

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing.
 *
 * @source underscore.js
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */

module.exports = function debounce(func, wait, immediate){
  var timeout, args, context, timestamp, result;
  if (null == wait) wait = 100;

  function later() {
    var last = now() - timestamp;

    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      }
    }
  };

  return function debounced() {
    context = this;
    args = arguments;
    timestamp = now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };
};

},{"date-now":18}],18:[function(require,module,exports){
module.exports = Date.now || now

function now() {
    return new Date().getTime()
}

},{}],19:[function(require,module,exports){
var closest = require('closest');

/**
 * Delegates event to a selector.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @param {Boolean} useCapture
 * @return {Object}
 */
function delegate(element, selector, type, callback, useCapture) {
    var listenerFn = listener.apply(this, arguments);

    element.addEventListener(type, listenerFn, useCapture);

    return {
        destroy: function() {
            element.removeEventListener(type, listenerFn, useCapture);
        }
    }
}

/**
 * Finds closest match and invokes callback.
 *
 * @param {Element} element
 * @param {String} selector
 * @param {String} type
 * @param {Function} callback
 * @return {Function}
 */
function listener(element, selector, type, callback) {
    return function(e) {
        e.delegateTarget = closest(e.target, selector, true);

        if (e.delegateTarget) {
            callback.call(element, e);
        }
    }
}

module.exports = delegate;

},{"closest":16}],20:[function(require,module,exports){

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matchesSelector
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (vendor) return vendor.call(el, selector);
  var nodes = el.parentNode.querySelectorAll(selector);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}
},{}]},{},[7])


//# sourceMappingURL=main.js.map
