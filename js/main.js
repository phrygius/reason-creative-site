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

var logo = $('.logo-container');
function makeTranslate3d(ele, x, y, z) {
  if(ele['selector']) {
    ele = ele.get(0);
  }
  ele.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)';
}
function onScroll(container, targetEle) {
  return debounce(function(event) {
    scrollTop = container.scrollTop;

    clearTimeout(scrollTimeout);
    $('body').addClass('scrolling');
    scrollTimeout = setTimeout(function() {
      $('body').removeClass('scrolling');
    }, 1000);

  makeTranslate3d(targetEle, 0, (0 - Math.floor(scrollTop / 10)), 0);
  }, 10);
}
/**
 * [left ][center][right]
 */
var viewportContainer = document.getElementById('vpc');
var viewports = {
  left: {
    element: document.querySelector('.viewport.left'),
    style: "translate3d(0vw, 0vh, 0px)"
  },
  center: {
    element: document.querySelector('.viewport.center'),
    style: "translate3d(-100vw, 0vh, 0px)"
  },
  right: {
    element: document.querySelector('.viewport.right'),
    style: "translate3d(-200vw, 0vh, 0px)"
  }
};
viewports.current = viewports.center;

// Center well scroll listener
viewports.center.element.addEventListener('scroll', onScroll(viewports.center.element, logo));

$('body').on('click', 'a', function(event) {
  event.preventDefault();
  var current = event.target,
    stateObject = {
      currentUrl: document.location.pathname
      };
  if(current.classList.contains('js-page-transition')) {
    var container = '';
    if(current.classList.contains('js-page-destination-right')) {
      viewportContainer.style.transform = viewports.right.style;
      viewports.current = viewports.right;
      container = '.viewport.right';
    }

    else if(current.classList.contains('js-page-destination-center')) {
      viewportContainer.style.transform = viewports.center.style;
      viewports.current = viewports.center;
      container = '.viewport.center';
    }

    console.log('[AJAX LOAD]', $(viewports.current), current.getAttribute('href'), container);
    console.log('pushState', stateObject, current.getAttribute('data-title'), current.getAttribute('href'));
    history.pushState(stateObject, current.getAttribute('data-title'), current.getAttribute('href'));

    try {
      //$(viewports.current).html('<h2>Loading</h2>').load(current.getAttribute('href') + ' ' + container);
      $.ajax({
        url: current.getAttribute('href'),
        context: viewports.current.element,
        success: function(data) {
          var html = $(data);
          var rightHtml = html.find(container);
          this.innerHTML = rightHtml.get(0).innerHTML;
        }
      })
    }

    catch(ex) {
      console.warn(ex.message);
      console.trace();
    }
  }
  return false;
});

window.onpopstate = function(event) {
  console.log('[POPSTATE]', event);
};