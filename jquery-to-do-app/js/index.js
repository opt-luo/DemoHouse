var $todoapp = $('.todo')
var $displayTask = $('#displayTask');
var $deleteButton = $('<span class="delete-btn"></span>');


//Show $displayTask
$('.todo__uncompleted').hover(function() {
		$displayTask.show("slowly")
	},
	//Hide $displayTask
	function() {
		$displayTask.hide("slowly");
	});

//Create new Task 
function newTasks() {
		var $new = $('<li><input type="checkbox"><input type="text" value=""><span class="delete-btn"></span></li>');
		//Add before $displayTask
		$displayTask.before( $new );
		//Focus on the created item
		$new.children('input[type="text"]').focus();
	}
	//When clicked or focused create a newTask()
	$displayTask.click(newTasks).focusin(newTasks);
	$displayTask.children("input:text").focus(newTasks);

//Focus in $displayTask to create a new item when Pressed Enter
$todoapp.on("keypress", "input:text", function() {
		$(this).each(function() {
			if (event.keyCode === 13 || event.keyCode === 9) {
				if ( $(this).val() === '') {
					$('.todo__uncompleted-list').effect("shake", function(){
						$displayTask.focusin();
					});
				} else {
					$displayTask.focusin();
				}
			}
		})
	})
	//Clicking .delete button remove its parent
	.on("click", ".delete-btn", function() {
		$(this).each(function () {
			$(this).parent().remove();
		})
	})
	//Toggles tasks between completedList and todoList
	.on("click", "input:checkbox", function() {
		$(this).each(function() {
			//when <checkbox> checked move to the .todo__completed <ul> list
			if ($(this).prop('checked') === true) {
				$(this).parent().appendTo('.todo__completed-list');
				$(this).prop('checked', true);
				//Else move to the .todo__uncompleted <ul> list before $displayTask
			} else {
				$displayTask.before( $(this).parent() );
				$(this).prop('checked', false);
			}
		})
	})
	//Removes empty <li> on focusout
	.on("blur", "input:text", function() {
		$(this).each(function() {
			if ($(this).val() === '' || $(this).val() === 'undefined' ) {
				$(this).parent().remove();
			}
		})
	});