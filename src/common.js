$(document).ready(function () {
	$('input[type="text"]:first').select().focus();
	$('.ajax-card').each(function () {
		var that = this;
		$.ajax({
			url: '/thing/show',
			type: 'POST',
			datatype: 'json',
			data: { id: $(this).attr('x-id') },
			success: function (j) {
				format_card(that, j);
			}
		});
	}); 
	// if ($('.recent-recommendations').length > 0) {
	// 	$.ajax({
	// 		url: 'things/latest',
	// 		dataType: 'json',
	// 		type: 'get',
	// 		success: function (j) {
	// 			for (i in j) {
	// 				$('.recent-recommendations').append('<div class="ajax-card" x-id="' + j[i]._id + '"></div');
	// 				format_card($('.recent-recommendations > .ajax-card:last'), j[i]);
	// 			}
	// 		}
	// 	});
	// }
	$('.fake_input').bind('keyup', function () {
		var that = this;
		$.ajax({
			url: '/things/suggest',
			data: { n: $(this).find('input').val() },
			dataType: 'json',
			type: 'post',
			success: function (j) {
				$('.suggestions').remove();
				if (j.length == 0) return;
				$(that).append('<div class="suggestions"></div>');
				for (i in j) {
					$('.suggestions').append('<div class="suggest">' + j[i].name + '</div>');
				}
			}
		});
	});
	$('.fake_input input').bind('blur', function () {
		setTimeout(function () {
			$('.suggestions').remove();
		}, 100);
	});
	$('body').on('click', '.suggest', function () {
		$(this).closest('.fake_input').find('input').val( $(this).text() );
		$('.suggestions').remove();
	});
	$('body').on('click', '.category small', function () {
		$(this).html('<select class="category_select">' + 
		'<option value="">Select a Category</option>' +
		'<option value="movie">Movie</option>' +
		'<option value="Show">Show</option>' +
		'<option value="Book">Book</option>' +
		'<option value="Music">Music</option>' +
		'<option value="Comic">Comic</option>' +
		'<option value="Person">Person</option>' +
		'<option value="Food">Food</option>' +
		'<option value="video game">Video Game</option>' +
		'<option value="Website">Website</option>' +
		'<option value="Software">Software</option>' +
		'</select>');
	});
	$('body').on('click', '.rating span', function () {
		var card = $(this).closest('.ajax-card');
		$.ajax({
			url: '/thing/rate',
			data: { id: card.attr('x-id'), rating: $(this).attr('x-rating') },
			dataType: 'json',
			type: 'post',
			success: function (j) {
				if (j.err) return alert(j.err);
				format_card(card, j);
			}
		});
	});
	$('body').on('change', '.category_select', function () {
		var card = $(this).closest('.ajax-card');
		$.ajax({
			url: '/thing/categorize',
			data: { id: card.attr('x-id'), category: $(this).val() },
			dataType: 'json',
			type: 'post',
			success: function (j) {
				if (j.err) return alert(j.err);
				format_card(card, j);
			}
		});
	});
});
function format_card(card, thing) {
	$(card).html('<b>' + thing.name + '</b><div class="rating">' +
		'<span x-rating="5">☆</span><span x-rating="4">☆</span><span x-rating="3">☆</span><span x-rating="2">☆</span><span x-rating="1">☆</span></div>' + 
		'<div class="category">' + ((thing.category)? thing.category : '<small>Add Category</small>') + '</div><div class="similar"></div>');
	if (!thing.rating) thing.rating = 0;
	for (var i = 1; i <= thing.rating; i++) {
		$(card).find('.rating span[x-rating="' + i + '"]').addClass('highlight');
	}
	$.ajax({
		url: '/thing/similar',
		data: { id: $(card).attr('x-id') },
		datatype: 'json',
		success: function (j) {
			if (j.length < 2) return;
			var j_join = '<small>Similar</small>';
			for (i in j) {
				j_join = j_join + ((i > 0)? ', ' : '' ) + '<span class="similar_item" x-id="' + j[i]._id + '">' + j[i].name + '</span>';
			}
			$(card).find('.similar').html(j_join);
		}
	});
}