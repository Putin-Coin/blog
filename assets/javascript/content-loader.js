import delegate from 'dom-utils/lib/delegate';
import parseUrl from 'dom-utils/lib/parse-url';
import drawer from './drawer';
import History2 from './history2';


/* global ga */


// Cache the container element to avoid multiple lookups.
var container;

// Store the result of page content requests to avoid multiple
// lookups when navigation to a previously seen page.
var pageCache = {};


function getTitle(a) {
  var title = a.title || a.innerText;
  return title ? title + ' \u2014 Philip Walton' : null;
}


function loadPageContent(done) {
  var path = this.nextPage.path;

  if (pageCache[path]) return done();

  var basename = /(\w+)\.html$/;
  var url = basename.test(path) ?
      path.replace(basename, '_$1.html') : path + '_index.html';

  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 400) {
      pageCache[path] = xhr.responseText;
      done();
    }
    else {
      done(new Error('(' + xhr.status + ') ' + xhr.response));
    }
  };
  xhr.onerror = function() {
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


function trackError(error) {
  ga('send', 'exception', {exDescription: error.stack || error.message});
}


module.exports = {

  init: function() {

    // Only load external content via AJAX if the browser support pushState.
    if (!(window.history && window.history.pushState)) return;

    // Add the current page to the cache.
    container = document.querySelector('main');
    pageCache[location.pathname] = container.innerHTML;

    var history2 = new History2()
        .use(loadPageContent)
        .use(showPageContent)
        .use(closeDrawer)
        .use(setScroll)
        .catch(trackError);

    delegate(document, 'click', 'a[href]', function(event) {

      // Don't attempt to load content if the user is trying to open a new tab.
      if (event.metaKey || event.ctrlKey || event.which > 1) return;

      var page = parseUrl(location.href);
      var link = parseUrl(this.href);

      // Don't do anything when clicking on links to the current URL.
      if (link.href == page.href) event.preventDefault();

      // If the clicked link is on the same site but has a different path,
      // prevent the browser from navigating there and load the page via ajax.
      if ((link.origin == page.origin) && (link.path != page.path)) {
        event.preventDefault();
        history2.add(link.href, getTitle(this));
      }
    });
  }
};
