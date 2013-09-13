preloadImages([
	'images/nav-sub-a.png',
	'images/nav-a.png'
])
$(document).ready(function(){		
	/*MainMenu SetUp
	================*/
	$('.mainmenu').find('li:has(ul)').addClass('has-menu');
	$('.menu_indicator').stop().animate({'opacity' : '0'},1);
	$('.sub_menu').animate({'opacity' : '0'},1);
	$('.mobile_menu').html($('.mainmenu').html());

	/*SubMenu Script
	================*/
	$('.mainmenu').find('li.has-menu').hover(function(){
		showed_menu = $(this).children('.sub_menu');
		showed_menu.css('display', 'block');
		showed_menu.stop().animate({'opacity' : '1'}, 300);
	}, function(){
		showed_menu = $(this).children('.sub_menu');
		showed_menu.stop().animate({'opacity' : '0'}, 300, function() {$(this).css('display', 'none');});
	});
	
	/*Ajaxed loading
	================*/
	$(window).bind('hashchange', function() {
		if(location.hash.indexOf('#')+1){
			$('.ajaxed_content').animate({ opacity : '0' }, 1000, function(){load_site()});
			menuNav()
		}
	});
	
	
});
$(window).load(function(){
	var qwe = setTimeout(function () {$("#jquery_jplayer").jPlayer("play");}, 2000);
	vertAlign();
	enableScroll();
	if (location.hash.substr(1)==""){
		window.location.replace(location.hash+'#home');
	} else {
		load_site();
	}
	sliderHeight();
	if(location.hash.substr(1)=='media-images'){
		galleryHover()
	}
	menuNav();
	if (($.browser.msie) && ($.browser.version == '8.0')) {
		$('.wrap').css({'margin-top':'0'});
	}
	$(".img-container").preloader();
})

$(window).resize(function(){
	sliderHeight();
});

function enableScroll(){
	$(".scroll").mCustomScrollbar({
		scrollEasing:"easeOutQuint",
		autoDraggerLength:true
	})
	setTimeout(function(){
		$('.scroll').each(function(){
			$(this).mCustomScrollbar("update")
		})}
	,1500);
}
function vertAlign(){
	if ($(window).width()>480){
		if ($(window).height()>900){
			var height = ($('#container').height())/2;
			$('#container').css({'top':'50%','margin-top':'-'+height+'px'});
		}
	}
}
function load_site() {
		
		$("#content").find('.ajaxed_content').load(location.hash.substr(1)+'.html', function() {
			$(".img-container").preloader();	
			sliderHeight();
			$('.ajaxed_content').animate({ opacity: 1 }, 1000, function() {});
			vertAlign();
			enableScroll();
			if(location.hash.substr(1)=='home'){
				slider();
			}
			if(location.hash.substr(1)=='media-images' || location.hash.substr(1)=='media-videos'){
				galleryHover();
			}
			if(location.hash.substr(1)=='contacts'){
				formSubmit();
			}
		});
		
}

function addEvent(element, eventName, callback) {
		if (element.addEventListener) {
			element.addEventListener(eventName, callback, false)
		} else {
			element.attachEvent(eventName, callback, false);
		}
	}
	function ready(player_id) {
		var froogaloop = $f(player_id);
		froogaloop.addEvent('play', function(data) {
			jQuery('.flexslider').flexslider("pause");
		});
		froogaloop.addEvent('pause', function(data) {
			jQuery('.flexslider').flexslider("play");
		});
	}
function slider(){
	
	jQuery('.flexslider').flexslider({
		touchSwipe: true,
		controlNav: true,
		slideshow: true,
		slideshowSpeed: 7000,
		animationDuration: 600,
		randomize: false,
		pauseOnAction: true,
		pauseOnHover: false,
		start: function(){
			
		},
		before: function(){
		}
	}); 
}
function sliderHeight(){
	if ($(window).width()>=768 && $(window).width()<959){
		if(location.hash.substr(1)=='home'){
			var height = $('.ajaxed_content').height();
			$('.wrap').css({'height':height+'px'});
		} else {
			$('.wrap').css({'height':'479px'})
		}
	}
}
function galleryHover(){
	$('.zoom, .gallery-hover').css({'opacity':'0'});
	$("a[rel^='prettyPhoto']").prettyPhoto({deeplinking: false});
	$('.gallery-list a[rel=prettyPhoto]').hover(
	function(){
		$(this).find('.zoom').stop().animate({'opacity' : '1'});
		$(this).find('.gallery-hover').stop().animate({'opacity' : '1'});
	}, function(){
		$(this).find('.zoom').stop().animate({'opacity' : '0'});
		$(this).find('.gallery-hover').stop().animate({'opacity' : '0'});
	});	
}
function menuNav(){
	$('.mainmenu li').removeClass('act');
	$('.mainmenu li a[href$="'+location.hash.substr(1)+'"]').parent().addClass('act');
	if($('.mainmenu li.act').parent().hasClass('sub_menu')){
		$('.mainmenu li.act').parent().parent().addClass('act')
	}
}
function formSubmit(){
	$('.btn_send').click(function(){
		if($('.req').val()!=""){
		var options = { 
			clearForm:true,
			success:    function() {
				var req =  $('.request');
				req.fadeIn();
				setTimeout(function(){req.fadeOut()}, 7000)
			} 
		}; 
			$('form#contact').ajaxSubmit(options);
		}
		else{
			$('.required').fadeIn();
			setTimeout(function(){$('.required').fadeOut()}, 7000)
		}
	});
	
}