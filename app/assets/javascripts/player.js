//<![CDATA[
$(document).ready(function(){
	$("#jquery_jplayer").jPlayer({
		ready: function () {
			$(this).jPlayer("setMedia", {
				mp3:"music.mp3"
			});
			//$(this).jPlayer("play");
			var click = document.ontouchstart === undefined ? 'click' : 'touchstart';
			var kickoff = function () {
				$("#jquery_jplayer").jPlayer("play");
				document.documentElement.removeEventListener(click, kickoff, true);
			};
			document.documentElement.addEventListener(click, kickoff, true);
		},
		repeat: function(event) { // Override the default jPlayer repeat event handler
			$(this).bind($.jPlayer.event.ended + ".jPlayer.jPlayerRepeat", function() {
				$(this).jPlayer("play");
			});
		},
		swfPath: "js",
		cssSelectorAncestor: "#jp_container",
		supplied: "mp3",
		wmode: "window"
	}); 
});
//]]