/************************
 * 
 * jQuery Trendybox v0.1
 * http://nigelheap.com/labs/trendybox
 *
 * Copyright 2011, Nigel Heap
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date: Sat Apr 23 22:43:00 2011 +1000
 *  
 * 
 *  --PUBLIC SETTINGS--
 * 	
 * 	{
 * 		direction :        "forward" 	
 * 		time :             3000, - Time between slides
 * 		speed :            500, - Speed of transition 
 * 		timeout :          3000, - Pause time before the first move
 * 		direction :        "foward", - Direction of slides 
 * 		setStyle :         true - Is the js setting the style?
 * 		itemHeight:        100, - Item height default px or eg: '2em' : css ! set &  setStyle:true
 * 		itemWidth :        100, - Item width default px or eg: '2em' : css ! set &  setStyle:true
 * 		wrapperElement :   'div', - HTML element inside the called box
 * 		sliderElement :    'ul', - Item conatiner normally a ul or ol
 * 		itemElement :      'li' - Item element
 *		pauseOnHover :		false - pause animation on hover
 *		before : 			function(current, next){} this = nextItem
 *		after :             function(current, next){} this = nextItem
 *		start :             function(items, settings){} this = firstItem
 * 	}	
 * 	
 * 	--USAGE--
 *
 *	<div id="infiniteCarousel">
 *		<div class="wrapper">
 *			<ul>
 *				<li><a href=""><img src="path/to/img/image.png" /></a></li>
 *				<li><a href=""><img src="path/to/img/image1.png" /></a></li>
 *				<li><a href=""><img src="path/to/img/image2.png" /></a></li>
 *				<li><a href=""><img src="path/to/img/image4.png" /></a></li>
 *			</ul>
 *		</div>
 *	</div>
 * 	
 * 	$(document).ready(function(){
 * 	
 * 	  $('#infiniteCarousel').trueInfinite([settings]);
 * 	  
 * 	}); 
 * 
 
TODO:
	adding next & prev options
	
 
************************/

// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
(function(){
  var cache = {};
  
  this.tmpl = function tmpl(str, data){
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :
      
      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +
        
        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +
        
        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");
    
    // Provide some basic currying to the user
    return data ? fn( data ) : fn;
  };
})();

(function( $ ){
	
	
	var T = {

	    /**
	     * The current version of Shadowbox.
	     *
	     * @type    {String}
	     * @public
	     */
	    version: "0.1"

	}
	
	var ua = navigator.userAgent.toLowerCase();
	
	// browser detection -- deprecated. the goal is to use object detection
	// instead of the user agent string
	T.isIE = ua.indexOf('msie') > -1;
	T.isIE6 = ua.indexOf('msie 6') > -1;
	T.isIE7 = ua.indexOf('msie 7') > -1;
	T.isGecko = ua.indexOf('gecko') > -1 && ua.indexOf('safari') == -1;
	T.isWebKit = ua.indexOf('applewebkit/') > -1;
		  
	// Constants	  
	var $wrapper,
		$inner,
		$items,
		$item,
		$nextItem,
		$currentItem,
		totalWidth = 0,
		maxWidth = 0,
		minWidth = 9000,
		totalItems = 0,
		settings = {
		  before :          null,
		  after :           null,
		  build :           null,
		  template : 		''
		};	
	
	function log() {
		if (window.console && window.console.log)
			window.console.log('[trendbox] ' + Array.prototype.join.call(arguments,' '));
	};
		  
	var methods = {
	  init : function( options ) {  

		if ( options ) { 
        	settings = $.extend( settings , options );
		}	
		// need to set these as objects for later functions
		settings.before = settings.before ? [settings.before] : [];
		settings.after = settings.after ? [settings.after] : [];
		settings.start = settings.start ? [settings.start] : [];
		
		// Setting up elements
		$item = $(this);
		$wrapper = $('> '+settings.wrapperElement, this);
		$slider = $wrapper.find('> '+settings.sliderElement);
		$items = $slider.find('> '+settings.itemElement);
		$single = $items.filter(":first");
		totalItems = $items.size();
		singleWidth = $single.outerWidth();
		pages = Math.ceil($items.length);

		// run the start callbacks
		if (settings.start.length)
			$.each(settings.start, function(i,o) {
				o.apply($item, [settings]);
			}); 		
		
		//Set Styling if the mood is right 
		if(settings.setStyle)
			methods.setStyle();
		
		if(settings.timeout > 0)
			setTimeout(methods.start(),settings.timeout);
		else if(settings.time > 0) {
			methods.slide();
			methods.start();
		} 
			
		if(settings.pauseOnHover){
			$outer.hover(function(){
				methods.stop();
			}, function(){
				methods.start();
			});
		}
	  },
	  show : function(options) {
	  		
	  		$currentItem = $slider.find('> li:first:not(:animated)');
	  		$nextItem = $currentItem.next();
	  		
	  		// run the before callbacks
			if (settings.before.length)
				$.each(settings.before, function(i,o) {
					o.apply($nextItem, [$currentItem, $nextItem, $items, settings]);
				}); 
	  	
	  		curentSingleWidth = $currentItem.width();
	  
			$($currentItem.clone()).appendTo($slider);
							
			$currentItem.animate({
				marginRight : '+=' + dir*curentSingleWidth
			}, settings.speed, function () {
				$(this).remove();
				
				$currentItem = $slider.find('> li:first:not(:animated)');
				$nextItem = $currentItem.next();
				
				// run the after callbacks
				if (settings.after.length)
					$.each(settings.after, function(i,o) {			
						o.apply($nextItem, [$currentItem, $nextItem, $items, settings]);
					}); 
					
			});  
			   			
			return false;
			
	  },
	  hide : function(){
			timer = setInterval(methods.slide, settings.time);
	  },
	  close : function(){
			methods.hide();
	  },
	  next : function(){
	  },
	  prev : function(){
	  },
	  setStyle : function(){
			
	  		$outer.css({
	  			position : "relative",
	  			overflow : "hidden"
	  		});
	  
	  		$wrapper.css({
	  			position : 'absolute',
	  			overflow : 'visible',
	  			width : totalWidth+maxWidth
	  		});
	  		
	  		if(settings.direction == "reverse"){
	  			$items.css({float:'right'});
	  			$wrapper.css({
	  				right : 0,
	  				marginLeft : (-1)*((totalWidth+maxWidth)-(minWidth*totalItems))
	  			});
	  		} else {
	  			$items.css({float:'left'});
	  			$wrapper.css({left : 0});
	  		}
	  		
	  		if(settings.setDimensions){
	  		
		  		iHeight = $single.height();
		  		iWidth = $single.width();
		  		
		  		iWidth = iWidth > 0 ? iWidth : settings.itemWidth;
		  		iHeight = iHeight > 0 ? iHeight : settings.itemWidth;
	
				$items.css({
		  			height:	iHeight,
		  			width: iWidth
		  		});
		  		
		  	}
	
	  }
	};

	$.fn.trendybox = function (method) {
		 
		// Method calling logic
		if ( methods[method] ) {
			
		  return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		  
		} else if ( typeof method === 'object' || ! method ) {
			
		  return methods.init.apply( this, arguments );
		  
		} else {
			
		  log( 'Method ' +  method + ' does not exist on jQuery.trendbox' );
		  
		}    
		
	};

})( jQuery );



