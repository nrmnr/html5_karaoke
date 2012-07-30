$(
function(){
	var board = $('#board');

	var load_event = function() {
		var file = 'data/data.xml';
		$.ajax(
			{
				type: 'GET',
				url: file,
				dataType: 'xml',
				success: initialize
			});
	};

	var initialize = function(xml_data) {
		$(xml_data).find('text').each(
			function() {
				var t = $(this).text();
				// console.log(t);
				create_karaoke(t);
			});
		$('div.karaoke').each(
			function() {
				overwrap_karaoke($(this));
			});
		start_animation();
	};

	var create_karaoke = function(text) {
		board.append('<div name="karaoke" class="karaoke"><div>'+text+'</div></div>');
	};

	var overwrap_karaoke = function(elm) {
		var t = elm.find('div:first').text();
		//console.log(elm);
		elm.append('<div class="view_window"><div class="overwrap_text"></div></div>');
		var ot = elm.find('div.overwrap_text');
		ot.text(t);
		ot.css('width', elm.css('width'));
	};

	var create_view_animate_func = function(view, inc) {
		view = $(view);
		// console.log(view);
		var percent = 0;
		return function() {
			//console.log(percent);
			percent += inc;
			if (percent > 100) percent = 0;
			view.css('width', percent+'%');
		};
	};

	var start_animation = function() {
		var views = board.find('div.view_window');
		setInterval(create_view_animate_func(views[0],1), 100);
		setInterval(create_view_animate_func(views[1],1), 100);
	};

	load_event();
});
