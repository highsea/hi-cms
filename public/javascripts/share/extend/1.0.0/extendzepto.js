	(function($){
		$.extend($.fn, {
			hiTab: function(dom){
				var tab_head = $(dom).children('.tab-heading'),
					tab_body = $(dom).children('.tab-body');

				tab_head.on('click', 'li', function(e) {
					e.preventDefault();
					
					tab_body.find('.'+$(this).attr('class')).addClass('block').siblings('li').removeClass('block');
					
					$(this).addClass('tablight').siblings('li').removeClass('tablight');
				});
			}
		})
	})(Zepto)