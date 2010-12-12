//
//	jquery.slidegallery.js
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
        startLeftPos: 0,
        clickPanelSlide: true,
        miniNav: true,
        // fade options
        slideSpeed: 500,
        autoStart: false,
        pauseOnHover: true,
        pauseOnClick: true,
        waitTime: 3000,
        showCount: false,
        thumbNav: false, //does the selector contain thumbnails for a gallery?
        onSlideStart : function(){},
        onSlideStarted : function(){},
        onSlideEnd : function(){}
    };
    
    
    $.fn.slideGallery = function( options ) {  
        
        return this.each(function() {   
        
            if ( options ) { 
                $.extend( settings, options );
            }
            var $this = $(this);
            var $gallery = $this;
            var fullWidth = $this.find('.panel').outerWidth(true);            
            var $panels = $this.find('.panels');
            var totalPanels = $this.find('.panel').length;
            
            $this.find('.panel:first-child').addClass('current-panel');
            
            
            //buildPanels();
            
            if (settings.smallNav) { 
                buildSmallNav();    
            };
            if (settings.autoStart) {
               startAuto(true);   
            };
            if (settings.clickPanelSlide) {
                $this.find('.panel').bind('click', function(event) {
            		//event.preventDefault();
            		if (settings.pauseOnClick) { stopAuto() };
            		if (!$(this).closest('li').hasClass('current-nav')) {
            			return slideTo($(this).closest('li').index());	
            		};
            	});
            };
        	
 
            
            function buildPanels() {
                
            } 
            
            
            function slideTo(panelNum) {
                settings.onSlideStart.call($this); 
            	var currentPanel = $this.find('.current-panel').index();
            	var moveDistance = (panelNum-currentPanel) * -fullWidth;
            	if (panelNum == 0) {
            	    $panels.animate({left:settings.startLeftPos}, settings.slideSpeed, function() {
            	        settings.onSlideEnd.call($this); 
            	    });
            	}
            	else {
            	    if (moveDistance < 0) {
                	    moveDistance = -moveDistance;
                	    $panels.animate({left:'-='+moveDistance}, settings.slideSpeed, function() {
                	        settings.onSlideEnd.call($this); 
                	    });
                	}
                	else {
                	    $panels.animate({left:'+='+moveDistance}, settings.slideSpeed, function() {
                	        settings.onSlideEnd.call($this); 
                	    });
                	}
            	}

            	$gallery.find('.current-panel').removeClass('current-panel');
            	$gallery.find('.panels .panel:eq('+parseInt(panelNum)+')').addClass('current-panel');
            	$gallery.find('ul.mini-nav li').removeClass('active');
            	$gallery.find('ul.mini-nav li:eq('+parseInt(panelNum)+')').addClass('active');
            	settings.onSlideStarted.call($this);  
            	
            	if (settings.showCount) {
            	    updateCount(panelNum+1,totalPanels);
            	};          
            }
            
            
            function buildSmallNav() { 
                var $navWrap = $(settings.navWrap).appendTo($gallery);

                $(settings.backBtn).appendTo($navWrap).bind('click',function() { 
                    backSlide($(this));
                    if (settings.pauseOnClick) { stopAuto() };
                });
                
                var $pauseBtn = $(settings.pauseBtn);
                if (!settings.autoStart) { $pauseBtn.addClass('paused')  };
                
                $pauseBtn.appendTo($navWrap).live('click',function() { 
                    togglePause($(this)); 
                });  
                
                if (settings.showCount) {
                	$navWrap.append('<p class="gallery-count"><span class="current"></span>/<span class="total"></span>');
                	updateCount(1, totalPanels);
                };        
                
                $(settings.nextBtn).appendTo($navWrap).bind('click',function() { 
                    nextSlide($(this)); 
                    if (settings.pauseOnClick) { stopAuto() };
                });
                
                if (settings.miniNav) {
                    var $miniNav = $('<ul class="mini-nav"/>').appendTo($navWrap);
                    $gallery.find('.panel').each(function(i) {
                        if (i == 0) {
                            $miniNav.append('<li class="active">'+(i+1)+'</li>');
                        }
                        else {
                            $miniNav.append('<li>'+(i+1)+'</li>');
                        }
                    });

                    $('ul.mini-nav li').live('click', function() {
                        $('ul.mini-nav li').removeClass('active');
                        slideTo($(this).index());
                        $(this).addClass('active');
                    });
                };
                
                
            }
            
            
            function nextSlide($btn) {
                var thisSlideNum = $this.find('.current-panel').index();
                var nextSlideNum = thisSlideNum + 1;

                if (parseInt(thisSlideNum) === parseInt(totalPanels)-1 ) {
                    //last slide?
                    if (settings.circular) {
                        nextSlideNum = 0;
                    }
                    else return;
                };
                slideTo(nextSlideNum);
            }
            
            
            function backSlide($btn) {
                var thisSlideNum = $gallery.find('.current-panel').index();
                var nextSlideNum = thisSlideNum - 1;
                if (thisSlideNum === 0) {
                    //first slide?
                    if (settings.circular) {
                        nextSlideNum = totalPanels-1;
                    }
                    else return;
                };
                slideTo(nextSlideNum);
            }
            
            
            function togglePause($btn) {
                if ($btn.hasClass('paused')) {
                	$btn.removeClass('paused');
                    startAuto($gallery);
                }
                else {
                    $btn.addClass('paused');
                };
            }
            
            
            function startAuto(firstRun) {
            	if ($gallery.find('.paused').length == 0) {
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
                $gallery.find('a.pause').addClass('paused');
            }
            
            
            function updateCount( current, total ) {
            	var $counter = $gallery.find('p.gallery-count');
            	if (!total) { total = $gallery.find('.panel').length };
            	$counter.find('span.current').text(current);
            	$counter.find('span.total').text(total);
            }
                                    
        });
        
    
    };


})( jQuery );
