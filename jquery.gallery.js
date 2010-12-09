//
//	jquery.gallery.js
//	copyright 2010 Gecko New Media
//	MIT licensed
//
(function( $ ){

    // TODO - unable to set individual speeds for galleries
    var settings = {
        //Slider
        wrapper: '<div class="autogallery" />',
        // smallnav options
        smallNav: true,
        navWrap: '<div class="nav-wrapper" />',
        nextBtn: '<a class="next">next</a>',
        backBtn: '<a class="back">back</a>',
        pauseBtn: '<a class="pause">pause</a>',
        circular: true,
        // fade options
        startSlide: 0,
        fadeSpeed: 500,
        autoStart: false,
        pauseOnHover: true,
        pauseOnClick: true,
        waitTime: 3000,
        showCount: false,
        thumbNav: false //does the selector contain thumbnails for a gallery?
    };
    
    
    $.fn.gallery = function( options ) {  
        
        return this.each(function() {   
        
            if ( options ) { 
                $.extend( settings, options );
            }
            var $this = $(this);
            var $wrapper = $(settings.wrapper);
            var $gal; // whole gallery object
            
            $wrapper.addClass($this.attr("class"));  
            $this.wrap($wrapper);
            $gal = $this.parent();
            buildPanels();
            
            if (settings.smallNav) { 
                buildSmallNav();    
            };
            if (settings.autoStart) {
                startAuto(true);   
            };
            if (settings.thumbNav) {
            	$this.find('a').bind('click', function(event) {
            		event.preventDefault();
            		if (settings.pauseOnClick) { stopAuto() };
            		if (!$(this).closest('li').hasClass('current-nav')) {
            			return showPanel($(this).closest('li').index());	
            		};
            	});
            };
 
            
            function buildPanels() {
                var $panels = $('<ul class="autogallery-panels" />').prependTo($gal);

                $panels.css('position','relative');
                $panels.bind('click', function() {
                    if (settings.pauseOnClick) { stopAuto() };
                	nextSlide();
                });
                
    			$this.wrap('<div class="autogallery-nav-wrapper" />');
    			$this.addClass('autogallery-nav');
                
                //build panels from selector, hiding all but the current-panel slide
                $gal.find('li').each(function(i) {
                	var $panel = $('<li class="panel-'+i+'"/>')
                	if (settings.thumbNav) {
                		var imgSrc = $(this).find('a:first-child').attr('href');
                		var $panelHtml = $('<img src="'+ imgSrc +'"/>');

                		$panel.html($panelHtml).appendTo($panels);
                	}
                	else {
                		//if the selector contains the panels, use all html to build panels then hide them.
                		$panel.html($(this).html()).appendTo($panels);
                		$this.hide();
                	};
                   	if (i===settings.startSlide) {
                   		$(this).addClass('current-nav');
                   		$panel.css('z-index',1000).addClass('current-panel');		
                   	}
                   	else {
                   		 $panel.css({
                            'position':'absolute',
                    	     'left':0,
                            'top':0 })
                            .hide();
                   	};  

                });

                if (settings.showCount) {
                	$gal.append('<p class="gallery-count"><span class="current"></span>/<span class="total"></span>');
                	updateCount(settings.startSlide+1, $panels.find('li').length);
                };

            	//add two empty elements to start and end
            	//so the middle item is first and last item is in middle
               	$this.prepend('<li/><li/>');
               	$this.append('<li/><li/>');
               	$panels.prepend('<li/><li/>');
               	$panels.append('<li/><li/>');
            } 
            
            
            function showPanel(panelNum) { 
                var $panels = $gal.find('ul.autogallery-panels');
                var $thisSlide = $panels.find('li.current-panel');
                var $nextSlide = $panels.find('li:eq('+panelNum+')');
                var leftPos,
                	thumbWidth,
                	newPos;

				
				$thisSlide.css('z-index',1000);
                $nextSlide.addClass('next-slide-here');
                //movement for thumb nav, keeping current item centred
                if (settings.thumbNav) {
                	var $navItem = $gal.find('li.current-nav');
                	thumbWidth = $navItem.outerWidth() + parseInt($navItem.css('marginRight'));
                	newPos = (panelNum-2) * -thumbWidth;
                	$gal.find('ul.autogallery-nav').animate({'left':newPos}, settings.fadeSpeed);
                };
                $gal.find('li.current-nav').removeClass('current-nav');

                $nextSlide.css('z-index',parseInt($thisSlide.css('z-index'))-1).show();
                $thisSlide.fadeOut(settings.fadeSpeed,function(){
                    $thisSlide.removeClass('current-panel');
                    $nextSlide.addClass('current-panel');                

                    $gal.find('ul.autogallery-nav li:eq('+panelNum+')').addClass('current-nav');
                    if (settings.showCount) {
                    	updateCount(panelNum-1);
                    };
                })
                    
            }
            
            
            function buildSmallNav() { 
                var $navWrap = $(settings.navWrap).appendTo($gal);

                $(settings.backBtn).appendTo($navWrap).bind('click',function() { 
                    backSlide($(this));
                    if (settings.pauseOnClick) { stopAuto() };
                });
                
                var $pauseBtn = $(settings.pauseBtn);
                if (!settings.autoStart) { $pauseBtn.addClass('paused')  };
                
                $pauseBtn.appendTo($navWrap).bind('click',function() { 
                    togglePause($(this)); 
                });          
                
                $(settings.nextBtn).appendTo($navWrap).bind('click',function() { 
                    nextSlide($(this)); 
                    if (settings.pauseOnClick) { stopAuto() };
                });
            }
            
            
            function nextSlide($btn) {
                var $panels = $gal.find('ul.autogallery-panels li');
                var thisSlideNum = $gal.find('li.current-panel').index();
                var nextSlideNum = thisSlideNum + 1;
                if (parseInt(thisSlideNum) === parseInt($panels.length)-3 ) {
                    //last slide?
                    if (settings.circular) {
                    	//we have two dummy elelments, so start slide is 2
                        nextSlideNum = 2;
                    }
                    else return;
                };
                showPanel(nextSlideNum, settings);
            }
            
            
            function backSlide($btn ) {
                var $panels = $gal.find('ul.autogallery-panels li');
                var thisSlideNum = $gal.find('li.current-panel').index();
                var nextSlideNum = thisSlideNum - 1;
                if (thisSlideNum === 2) {
                    //first slide?
                    if (settings.circular) {
                        nextSlideNum = $panels.length-3;
                    }
                    else return;
                };
                showPanel(nextSlideNum);
            }
            
            
            function togglePause($btn) {
                if ($btn.hasClass('paused')) {
                	$btn.removeClass('paused');
                    startAuto($gal);
                }
                else {
                    $btn.addClass('paused');
                };
            }
            
            
            function startAuto(firstRun) {
            	if ($gal.find('.paused').length == 0) {
            		if (!firstRun) {
            			nextSlide();
            		};
            		setTimeout(function() {
            			startAuto();
            		},settings.waitTime)
            	};
            }
            
            
            //todo - genericise for any pause button
            function stopAuto(firstRun) {
                $gal.find('a.pause').addClass('paused');
            }
            
            
            function updateCount( current, total ) {
            	var $counter = $gal.find('p.gallery-count');
            	if (!total) { total = $gal.find('ul.autogallery-panels li').length-4 };
            	$counter.find('span.current').text(current);
            	$counter.find('span.total').text(total);
            }
                                    
        });
        
    
    };


})( jQuery );
