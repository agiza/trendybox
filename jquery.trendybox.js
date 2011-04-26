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

(function( $ ){
	
	
	var T = {

	    /**
	     * The current version of Shadowbox.
	     *
	     * @type    {String}
	     * @public
	     */
	    version: "0.1"
		// helper functions
		
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
	var $outer,
		$wrapper,
		$inner,
		$items,
		$item,
		$triggers,
		$trigger,
		$nextItem,
		$currentItem,
		totalWidth = 0,
		maxWidth = 0,
		minWidth = 9000,
		totalItems = 0,
		selector = "",
		cache = {},
		container = '<div class="trendybox-outer" id="trendybox_outer">' +
			'<div class="trendybox-overlay" id="trendybox_overlay">' +
				'<div class="trendybox-inner" id="trendybox_inner">' +
				'</div>' + 
			'</div>' +
		'</div>',
		settings = {
			before :          null,
			after :           null,
			build :           null,
			nameSelector :    '.trendybox',
			template : 		'<%=content%>',
			overlay_color : 'transparent',
			overlay_opacity : 1,
			trigger : 		'.trendybox',
			template_selectors : null,
			obj : null,
			gap : {
				top : 0,
				right : 0,
				bottom : 0,
				left : 0
			},
			width : 800
		};
	
	function log() {
		if (window.console && window.console.log)
			window.console.log('[trendbox] ' + Array.prototype.join.call(arguments,' '));
	};
		  
	var methods = {
	    tmpl : function(str, data){
	    // Figure out if we're getting a template, or if we need to
	    // load the template - and be sure to cache the result.
	    alert(str);
	    var fn = !/\W/.test(str) ? cache[str] = cache[str] || tmpl(document.getElementById(str).innerHTML) :
	      
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
	  },
	  init : function( options ) {
	  
	  	// set selector for parenting
	  	
		if ( options ) { 
        	settings = $.extend( settings , options );
		}	
		// need to set these as objects for later functions
		settings.before = settings.before ? [settings.before] : [];
		settings.after = settings.after ? [settings.after] : [];
		settings.start = settings.start ? [settings.start] : [];
		
		// Setting up elements obj
		$("body").append(container);
		$outer = $("#trendybox_outer");
		$overlay = $("#trendybox_overlay");
		$inner = $("#trendybox_inner");
		$items = $(this);
		
		$overlay.click(function(){
			methods.hide();
		});		
		
		methods.hide();
				
		if(methods.is_trigger($items, settings.trigger)){
			$items.click(function(){
				methods.show($(this));
			});	
		} else {
			$triggers = $items.find(settings.trigger);
			$triggers.click(function(){
				$item = methods.get_element(this);		
				methods.show($item, $(this));
			});			
		}
		
		$(trigger).click(function(){
			methods.show($(this));
			return false;
		});
		
		methods.hide();
				
		// run the start callbacks
		if (settings.start.length)
			$.each(settings.start, function(i,o) {
				o.apply($item, [$items, settings]);
			}); 		
		
	  },
	  get_element : function(_elm){
	  	$item = $(_elm).parentsUntil(settings.nameSelector).parent();
	  	return $item;
	  },
	  is_trigger : function(_elm, _trigger) {	
		//get elements and return the clicker
		$_elm = $(_elm); 
		var isClass = settings.trigger.replace(/[^a-zA-Z0-9]+/g,'');
		if($_elm.hasClass(isClass)){
			return true;	
		} else {
			return false;
		}
	  },
	  build_html : function(){
	  		var $table = $("#parent").children("table");
			$table.css({ position: "absolute", visibility: "hidden", display: "block" });
			var tableWidth = $table.outerWidth();
			$table.css({ position: "", visibility: "", display: "" });
	  },
	  show : function(_elm, _trigger) {
			
			// run the before callbacks
			if (settings.before.length)
				$.each(settings.before, function(i,o) {
					o.apply(this, [$items, settings]);
				}); 
			
				
			temp = methods.tmpl(settings.template);
			alert(temp);
			o = {
				content : 'something'
			}
			
			alert(tmpl(settings.template, o));
			
			$item = $(_elm);
			$trigger = $(_trigger);
			
			// to be replaced with build html
			href = "";
			if(!(href = $item.attr("href"))){
				href = $trigger.attr("href");
			}
			o = {
				content : '<img src="' + href + '" />'
			}
			
			//template = tmpl(settings.template,o);
			//alert(methods.template(o));
			
			//$inner.html(template);
			
			//$inner.css({ position: "absolute", visibility: "hidden", display: "block" });
			//var theWidth = $table.outerWidth();
			//$inner.css({ position: "", visibility: "", display: "" });
			//alert(theWidth);
			//methods.resize();
			$outer.show();
			
			// run the after callbacks
			if (settings.after.length)
				$.each(settings.after, function(i,o) {			
					o.apply(this, [$items, settings]);
				}); 
			   			
			return false;
			
	  },
	  hide : function(){
			$inner.html("");
			$outer.hide();
	  },
	  resize : function(){
			var wid = $inner.width();
			$inner.css({
				marginLeft : (wid/2) 
			});
	  },
	  close : function(){
			methods.hide();
	  },
	  next : function(){
	  },
	  prev : function(){
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


// Helperzzzzz





