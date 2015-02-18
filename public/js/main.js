
requirejs.config({
	paths: {
		gsap: 'http://cdnjs.cloudflare.com/ajax/libs/gsap/1.15.1/TweenLite.min',
		gsap_css: 'http://cdnjs.cloudflare.com/ajax/libs/gsap/1.15.1/plugins/CSSPlugin.min',
		gsap_scrollTo: 'http://cdnjs.cloudflare.com/ajax/libs/gsap/1.15.1/plugins/ScrollToPlugin.min'
	},
	shim: {
		gsap_css: {
			deps: ['gsap']
		},
		gsap_scrollTo: {
			deps: ['gsap']
		}
	}
});

require(['gsap', 'gsap_css', 'gsap_scrollTo'], function() {
	document.documentElement.addEventListener('click', function(evt) {
		if(evt.target.classList && evt.target.classList.contains('goto')) {
			evt.preventDefault();
			var destinationSection = evt.target.getAttribute('data-destination');
			if(destinationSection) {
				var destination = 
					document.querySelector('[data-section="' + destinationSection + '"]');
				if(destination) {
					console.log('Scroll to', destination);
					TweenLite.to(
						window
						, 0.250
						, {
							scrollTo: {
								y: destination.getBoundingClientRect().top
							}
						}
					);
				} else {
					console.warn('No destination');
				}
			}
			return false;
		}
	});
});

var footerForm = document.querySelector('footer form');
if(footerForm) {
	footerForm.addEventListener('submit', function(evt) {
		console.log('Form submit');
		evt.preventDefault();
		var post = new XMLHTTPRequest();
		post.open('POST', '/', true);
		post.onload = function() {
			console.log('Returned', post);
			if(post.status >= 200 && post.status < 400) {
				var data = JSON.parse(post.responseText);
				console.log(data);
			}
		};
		post.send();
		return false;
	});
}


(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-21971893-1', 'auto');
ga('send', 'pageview');

