$(
function(){
	var board = $('#board');
	var audio = $('#audio_elm').get(0);

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
		$(xml_data).find('file').each(
			function(){
				var file = $(this);
				var text = file.find('text:first').text();
				create_karaoke(text);
				var laps = file.find('lap:first');
				var i = 0;
				$('div.karaoke').each(
					function() {
						var div_karaoke = $(this);
						overwrap_karaoke(div_karaoke);
						// start_animation(div_karaoke, laps[i]);
						++i;
					});
				var audio_file = file.attr('src');
				init_audio(audio_file, $('div.karaoke:first'), laps);
				audio.play();
			});
	};

	var timeupdate_event = undefined;
	var init_audio = function(audio_file, div_karaoke, laps) {
		audio.src = 'data/' + audio_file;
		audio.load();
		timeupdate_event = create_timeupdate_event(div_karaoke, laps);
		audio.addEventListener('timeupdate', timeupdate_event);
		audio.addEventListener("ended", ended_event);
	};

	var create_timeupdate_event = function(div_karaoke, laps){
		var views = div_karaoke.find('div.view_window');
		var lap_times = canonicalize_lap_times(laps);
		return function(){
			var c = audio.currentTime * 1000 + 200; // to offset the interval
			for (var i = 0; i < views.length; ++i) {
				var view = $(views[i]);
				if (c >= lap_times[i+1]) {
					view.css('width', '100%');
				} else if(c < lap_times[i+1]) {
					var time_span = lap_times[i+1] - lap_times[i];
					var par = c * 100 / time_span;
					view.css('width', par + '%');
					break;
				}
			}
		}
	};

	var ended_event = function(){
		audio.removeEventListener('timeupdate', timeupdate_event);
		audio.removeEventListener('ended', ended_event);
	};

	var create_karaoke = function(text) {
		var words = text.split(/ /);
		// console.log(words.length);
		var tags = '';
		for ( var i = 0; i < words.length; ++i ) {
			tags += '<div class="karaoke_word">' + words[i] + '</div>';
		}
		board.append('<div name="karaoke" class="karaoke">' + tags + '</div>');
	};

	/**
	 * カラオケの上にかぶせる赤字のdivを生成
	 * div.view_windowを表示領域としてはみ出し部分は非表示
	 */
	var overwrap_karaoke = function(div_karaoke) {
		var append_view = function() {
			var karaoke_word = $(this);
			var t = karaoke_word.text();
			karaoke_word.append('<div class="view_window"><div class="overwrap_text" /></div>')
			var ot = karaoke_word.find('div.overwrap_text');
			ot.text(t);
			ot.css('width', karaoke_word.css('width'));
		};
		div_karaoke.find('div.karaoke_word').each(append_view);
	};

	var canonicalize_lap_times = function(lap_data) {
		var laps = $(lap_data).text().split(/,/);
		var new_laps = [];
		for (var i = 0; i < laps.length; ++i) {
			new_laps.push(laps[i] * 1000);
		}
		return new_laps;
	};

	var start_animation = function(div_karaoke, lap_data) {
		var views = div_karaoke.find('div.view_window');
		var lap_times = canonicalize_lap_times(lap_data);
		/**
		 * アニメーションの連鎖
		 * アニメーション設定のcompleteに
		 * 次のアニメーションを起動する関数をセット
		 */
		var func = undefined;
		for (var i = views.length-1; i >= 0; --i){
			func = (
				function(view, next_func, timespan){
					return function(){
						view.animate(
							{ width: '100%' },
							{
								duration: timespan,
								complete: next_func
							}
						);
					};
				})($(views[i]), func, lap_times[i+1] - lap_times[i]);
		}
		func();
	};

	load_event();
});
