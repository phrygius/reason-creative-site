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
    querySelector: '.viewport.left',
    element: document.querySelector('.viewport.left'),
    style: "translate3d(0vw, 0vh, 0px)"
  },
  center: {
    querySelector: '.viewport.center',
    element: document.querySelector('.viewport.center'),
    style: "translate3d(-100vw, 0vh, 0px)"
  },
  right: {
    querySelector: '.viewport.right',
    element: document.querySelector('.viewport.right'),
    style: "translate3d(-200vw, 0vh, 0px)"
  }
};
viewports.current = viewports.center;

// Center well scroll listener
var centerWellScrollListener = null;
if(viewports.current === viewports.center) {
  var logo = viewports.center.element.querySelector('.logo-container');
  centerWellScrollListener = onScroll(viewports.center.element, logo);
  viewports.center.element.addEventListener('scroll', centerWellScrollListener);
}
var originalPageState = {
  url: document.location.pathname,
  container: viewports.current.querySelector
  };
var footerForm = $('footer .form-container');

$('body').on('click', 'a', function(event) {
  // The <a> element
  var current = event.target;

  if(current.classList.contains('js-page-transition')) {
    event.preventDefault();
    var container = '',
      targetContainer = viewports.center,
      targetViewportContainerClass = 'center';

    if(current.classList.contains('js-page-destination-right')) {
      targetContainer = viewports.right;
      targetViewportContainerClass = 'right'
    }

    viewportContainer.classList.remove('center', 'left', 'right');
    viewportContainer.classList.add(targetViewportContainerClass);
//    viewportContainer.style.transform = targetContainer.style;
    container = targetContainer.querySelector;
    viewports.current = targetContainer;

    var newStateObject = {
      url: current.getAttribute('href'),
      container: targetContainer.querySelector
      };

    console.log('[AJAX LOAD]', $(viewports.current), current.getAttribute('href'), container);
    console.log('pushState', newStateObject, current.getAttribute('data-title'), current.getAttribute('href'));
    history.pushState(newStateObject, current.getAttribute('data-title'), current.getAttribute('href'));

    try {
      $.ajax({
        url: current.getAttribute('href'),
        context: viewports.current.element,
        success: function(data) {
          var html = $(data);
          var rightHtml = html.find(container);
          var title = html.filter('title').text();
          document.title = title;
          this.innerHTML = rightHtml.get(0).innerHTML;
          moveFrame();

          // Center well scroll listener
          if(viewports.current === viewports.center) {
            var logo = viewports.center.element.querySelector('.logo-container');
            viewports.center.element.removeEventListener('scroll', centerWellScrollListener);
            centerWellScrollListener = onScroll(viewports.center.element, logo);
            viewports.center.element.addEventListener('scroll', centerWellScrollListener);
          }
        }
      })
    }

    catch(ex) {
      console.warn(ex.message);
      console.trace();
    }
    return false;
  } // END current.classList.contains('js-page-transition') check
});

window.onpopstate = function(event) {
  console.log('[POPSTATE]', event);
  var state = event.state || originalPageState;

  try {
    var container = state.container,
      targetContainer = viewports.center,
      targetViewportContainerClass = 'center';

    if(container.indexOf('right') > -1) {
      targetContainer = viewports.right;
      targetViewportContainerClass = 'right';
    }
    
    else if(container.indexOf('left') > -1) {
      targetContainer = viewports.left;
      targetViewportContainerClass = 'left';
    }
    
    viewportContainer.classList.remove('center', 'left', 'right');
    viewportContainer.classList.add(targetViewportContainerClass);
//    viewportContainer.style.transform = targetContainer.style;
    container = targetContainer.querySelector;
    viewports.current = targetContainer;

    $.ajax({
      url: event.state.url,
      context: document.querySelector(),
      success: function(data) {
        var html = $(data);
        var rightHtml = html.find(container);
        var title = html.filter('title').text();
        document.title = title;
        this.innerHTML = rightHtml.get(0).innerHTML;
        moveFrame();

        // Center well scroll listener
        if(viewports.current === viewports.center) {
          var logo = viewports.center.element.querySelector('.logo-container');
          viewports.center.element.removeEventListener('scroll', centerWellScrollListener);
          centerWellScrollListener = onScroll(viewports.center.element, logo);
          viewports.center.element.addEventListener('scroll', centerWellScrollListener);
        }
      }
    })
  }

  catch(ex) {
    console.warn(ex.message);
    console.trace();
  }
};

function moveFrame() {
  $(viewports.current.element).find('footer .form-container').html(footerForm.remove());
}