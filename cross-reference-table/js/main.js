jQuery(document).ready(function($){
	var $columns_number = $('#cd-table .cd-table-container').find('.cd-table-column').length;
	
	$('.cd-table-container').on('scroll', function(){ 
		$this = $(this);
		//hide the arrow on scrolling
		if( $this.scrollLeft() > 0 ) {
			$('.cd-scroll-right').hide();
		}
		//remove color gradient when table has scrolled to the end
		var total_table_width = parseInt($('.cd-table-wrapper').css('width').replace('px', '')),
			table_viewport = parseInt($('#cd-table').css('width').replace('px', ''));
			
		if( $this.scrollLeft() >= total_table_width - table_viewport - $columns_number) {
			$('#cd-table').addClass('table-end');
		} else {
			$('#cd-table').removeClass('table-end');
		}
	});

	//scroll the table (scroll value equal to column width) when clicking on the .cd-scroll-right arrow
 	$('.cd-scroll-right').on('click', function(){
 		$this= $(this);
 		var column_width = $(this).siblings('.cd-table-container').find('.cd-table-column').eq(0).css('width').replace('px', ''),
 			new_left_scroll = parseInt($('.cd-table-container').scrollLeft()) + parseInt(column_width);
 		
 		$('.cd-table-container').animate( {scrollLeft: new_left_scroll}, 200 );
 		$this.hide();
 	});
});