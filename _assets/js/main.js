function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

var scrollTimeout = null;
var scrollTop = 0;

function makeTranslate3d(ele, x, y, z) {
  if(ele['selector']) {
    ele = ele.get(0);
  }
  ele.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)';
}
function makeScrollTransformForElement(container, targetEle, factor) {
  return debounce(function(event) {
    scrollTop = container.scrollTop;

    clearTimeout(scrollTimeout);
    $('body').addClass('scrolling');
    scrollTimeout = setTimeout(function() {
      $('body').removeClass('scrolling');
    }, 1000);

    makeTranslate3d(targetEle, 0, (0 - Math.floor(scrollTop / factor)), 0);
  }, 10);
}
/**
 * [left ][center][right]
 */
var viewportContainer = $('#vpc');
var currentViewport = $('.viewport.active');
var currentViewportScrollListeners = getViewportScrollListeners();
var currentViewportClass = 'center';
if(currentViewport.hasClass('right')) {
  currentViewportClass = 'right';
} else if(currentViewport.hasClass('left')) {
  currentViewportClass = 'left';
}
var originalPageState = {
  url: document.location.pathname,
  container: currentViewportClass
  };
var footerForm = $('footer .form-container');

/**
 * Center well scroll listener
 */
var centerViewport = $('.viewport.center');
var logo = centerViewport.find('.logo-container').get(0);
var bgContainer = centerViewport.find('.background-container').get(0);
var logoScrollListener = makeScrollTransformForElement(currentViewport.get(0), logo, 10);
var backgroundScrollListener = makeScrollTransformForElement(currentViewport.get(0), bgContainer, -5);
centerViewport.on('scroll', logoScrollListener)
  .on('scroll', backgroundScrollListener);

/**
 * Scroll listener for visible/invisible
 */
function getViewportScrollListeners() {
  return currentViewport.find('.js-pub-sub.js-pub-sub-scroll');
}
var visibleScrollCheckLast = 0;
function visibleScrollCheck(timestamp) {
  var diff = timestamp - visibleScrollCheckLast;
  if(diff > 50) {
    currentViewportScrollListeners.each(function(i, ele) {
      if($(ele).visible(true)) {
        $(ele).removeClass('unseen').addClass('visible');
      } else {
        $(ele).removeClass('visible');
      }
    });
    visibleScrollCheckLast = timestamp;
  }
  requestAnimationFrame(visibleScrollCheck);
}
requestAnimationFrame(visibleScrollCheck);

/**
 * Viewport switching
 */
function swapViews(target) {
  // Animate
  var animationClass = currentViewportClass + '-to-' + target;
  $('body').addClass(animationClass);
  viewportContainer.removeClass('center left right');
  viewportContainer.addClass(target);
  setTimeout(function() {
    $('body').removeClass(animationClass);
  }, 1000);

  // 
  currentViewport.removeClass('active');
  currentViewport = $('.viewport.' + target);
  currentViewportScrollListeners = getViewportScrollListeners();
  currentViewport.addClass('active');
  currentViewportClass = target;

  return currentViewport;
}

function fetchContent(url, targetViewportContainerClass) {
    try {
      var context = {
        className: targetViewportContainerClass
      };
      $.ajax({
        url: url,
        success: $.proxy(function(data) {
          var html = $(data);
          var rightHtml = html.find('.viewport.' + this.className);
          var title = html.filter('title').text();
          document.title = title;
          currentViewport.html(rightHtml.get(0).innerHTML);
          moveFrame();
        }, context)
      });
    }

    catch(ex) {
      console.warn(ex.message);
      console.trace();
    }
}

/**
 * Capture anchor clicks
 */
$('body').on('click', 'a', function(event) {
  // The <a> element
  var current = $(event.target);
  if(current.hasClass('js-page-transition')) {
    event.preventDefault();
    var targetViewportContainerClass = 'center';
    if(current.hasClass('js-page-destination-right')) {
      targetViewportContainerClass = 'right'
    }

    swapViews(targetViewportContainerClass);
    var targetTitle = current.attr('title')
      , targetHref = current.attr('href')
      , newStateObject = {
        url: targetHref,
        container: targetViewportContainerClass
        };
    history.pushState(newStateObject, targetTitle, targetHref);
    fetchContent(targetHref, targetViewportContainerClass);
    return false;
  }
});

window.onpopstate = function(event) {
  console.log('[POPSTATE]', event);
  var state = event.state || originalPageState;
  var targetViewportContainerClass = state.container;
  swapViews(targetViewportContainerClass);
  fetchContent(event.state.url, targetViewportContainerClass);
};

function moveFrame() {
  currentViewport.find('footer .form-container').html(footerForm.remove());
}

(function($) {

  /**
   * Copyright 2012, Digital Fusion
   * Licensed under the MIT license.
   * http://teamdf.com/jquery-plugins/license/
   *
   * @author Sam Sehnert
   * @desc A small plugin that checks whether elements are within
   *     the user visible viewport of a web browser.
   *     only accounts for vertical position, not horizontal.
   */

  $.fn.visible = function(partial) {
    
      var $t            = $(this),
          $w            = $(window),
          viewTop       = $w.scrollTop(),
          viewBottom    = viewTop + $w.height(),
          _top          = $t.offset().top,
          _bottom       = _top + $t.height(),
          compareTop    = partial === true ? _bottom : _top,
          compareBottom = partial === true ? _top : _bottom;
    
    return ((compareBottom <= viewBottom) && (compareTop >= viewTop));

  };
    
})(jQuery);