$(document).ready(function() {
	
	var day;
	var month;
	var year;
	var startDate;
	
	var currentUser = $(".username").text();
	
	function usersToArray() {
		var allUsers = $(".all-users-list li").toArray();
		var chosen = [currentUser];
		
		for (var i = 0; i < allUsers.length; i++) {
			
			if(allUsers[i].className.includes("list-group-item-success")){
				chosen.push(allUsers[i].innerText);
			}
		}
		
		return chosen;
	}
	
	function arrayToString(id) {
		var arr = $("#" + id + " td").toArray();
		var arrstring = "";
		
		for (var i = 0; i < arr.length; i++) {
			if(arr[i].className.includes("red")){
				arrstring += 1;
			} else {
				arrstring += 0;
			}
		}
		
		return arrstring;

	}
	
	function stringToArray(bits, id, colour) {
		var arr = $("#" + id + " td").toArray();
		
		for (var i = 0; i < arr.length; i++) {
			if(bits[i] == 1){
				arr[i].className = colour;
			}
		}
	}
	
	function setDays(day, month, scheduleId) {
		
		day = parseInt(day, 10);
		month = parseInt(month, 10);
		
		var d = new Date();
		d.setMonth(month - 1, day);
		var week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		var weekdayNum = d.getDay();
		var weekday;
		
		if(scheduleId != "none") {
			$("#" + scheduleId + " .days-headers").each( function (index) {
				$(this).find(".dates").text(day + "." + month + ".");
				weekday = week[weekdayNum];
				$(this).find(".days").text(weekday);
				day += 1;
				weekdayNum += 1;
				if (day == 29 && month == 2) {
					day = 1;
					month += 1;	
				} else if (day == 32 && month == 12) {
					day = 1;
					month = 1;	
				} else if (day == 31) {
					if (month == 4 || month == 6 || month == 9 || month == 11) {
						day = 1;
						month += 1;	
					}
				} else if (day == 32) {
					if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10) {
						day = 1;
						month += 1;	
					}
				} 
			});
		}
		
	}
	
	// mark hours
	var mousedown = false;
	
	$("td").on("mousedown", function (e) {
		mousedown = true;
		e.preventDefault();
		$(this).toggleClass("red");
	})
	.on("mouseover", function() {
		if(mousedown){
			$(this).toggleClass("red");
		}
	});
  
  	$(document).on("mouseup", function () {
      	mousedown = false;
    });
	
	// convert data 
	$(".confirm").on("click", function () {
		
		$(this).hide();
		
		var scheduleId = $(this).siblings('.table').attr('id');
		var arrstring = arrayToString(scheduleId);
		
		$.post( "/personalSchedules", { personalSchedule: arrstring, currentUser: currentUser, scheduleId: scheduleId } )
			.done(function( data ) {
			
				$("#" + scheduleId + " td").each( function() {
					$(this).removeClass("rose");
				});
			
				stringToArray(data.freeTime, scheduleId, "red");
				$.each( data.users, function (index, user) {
					if (user['image']) {
						$img = "<img src='images/" + user['image'] + "'>";
					} else {
						$img = "<i class='fa fa-user-secret'></i>";
					}
					$("#" + scheduleId).parent().siblings('.names-container').find('.names').append("<li class='list-group-item list-group-item-action'>" + $img + user['name'] + "</li>");
				});
			});
		
	});
	
	$(".main-tables").each( function () {
		var id = $(this).attr("id");
		var day = $(this).data("day");
		var month = $(this).data("month");
		setDays(day, month, id);
	
		var bits = $(this).data("bits");
		stringToArray(bits, id, "rose");
	});
	
	$(".all-users-list li").click(function(e) {
		e.stopPropagation();
		$(this).toggleClass("list-group-item-success");
	});
	
	$("#btn-new-schedule").click(function() {
		
		$(this).hide();
		$("#datepicker").show();
		$("#all-users-dropdown-btn").show();
		$("#btn-send-date").show();
	
		$("#datepicker").datepicker();
		$("#datepicker").datepicker( "option", "dateFormat", "d'.'mm'.'yy" );
		
	});
	
	$("#btn-send-date").click(function() {
		
		var date = $("#datepicker").val();
		var parsedDate = $.datepicker.parseDate( "d'.'mm'.'yy", date );
		day = parsedDate.getDate();
		month = parsedDate.getMonth() + 1;
		year = parsedDate.getFullYear();
		
		startDate = year + "-" + month + "-" + day;
		
		console.log(startDate);
		
		$(this).hide();
		$("#datepicker").hide();
		$("#all-users-dropdown-btn").hide();
		
		var users = usersToArray();
		
		$.post( "/home", { startDate: startDate, creator: currentUser, users: users } )
			.done(function(data) {			
				$("#btn-send-date").hide();
				$("#all-users-dropdown-btn").hide();
			});
		
	});
	
	// Ensure CSRF token is sent with AJAX requests
	$.ajaxSetup({
		headers: {
			'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
		}
	});
	
});