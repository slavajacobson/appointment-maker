var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

$(document).ready(function() {

    $start_hour = 10;
    $end_hour = 20;

    $('#calendar').fullCalendar({

        eventClick:function( event, jsEvent, view ) { 
          if ($.inArray("user_event",event.className) >= 0 || $.inArray("blocked_event",event.className) >= 0) {

            $.get('/appointments/' + event.id + '/' + "edit.js?type=" + event.className[0], function(data) {


              $edit_appointment_form = $(data)

              $("#edit_appointment_form").html($edit_appointment_form);

              $edit_appointment_form.on('click',"input[type='submit']", function(e){
                e.preventDefault();
                
                //pass which sumit button was pressed
                $edit_appointment_form.find("#appointment_form_action").val($(e.target).attr("name"));

                $.post($edit_appointment_form.attr('action') + ".js", $edit_appointment_form.serialize(), function(data) {});
              });
            });
            $('#edit_appointment').modal('show');

          }

          
        },
        columnFormat: {
          month: 'ddd', 
          week: 'dddd - MMM d', 
          day: 'dddd M/d' 
        },
        selectable: false,
        selectHelper: false,
        
        dayClick: function( date, allDay, jsEvent, view ) {
          $make_appointment_current_date = date;

          //Prepare a dropdown menu with Time slots for appointment
          var selected_time = generate_times_for_appointment($("#appointment_appointment_type").val(), $make_appointment_current_date);
          

          //set the time and date and open the new appointment window
          var full_date = monthNames[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();

          $("#full_date").html(full_date);

          $('#appointment_time').val(selected_time).change();
          //date.getHours() + ":" + date.getMinutes() + (date.getMinutes() < 10 ? '0' : '')
          //$('#timepicker').timepicker('setTime', ((date.getHours() > 12 ? date.getHours() - 12 : date.getHours()) + ":" + date.getMinutes() + " " + (date.getHours() > 11 ? "PM" : "AM")));

          //hide the error message from the modal window
          $(".make_appointment_server_info").hide();
          $('#make_appointment').modal('show');
        },
        eventMouseover: function( event, jsEvent, view ) { 
          $("#info_box").hide();
        },
        eventMouseout: function( event, jsEvent, view ) { 
          $("#info_box").show();
        },
        select: gon.admin ? function( startDate, endDate, allDay, jsEvent, view ) {
          var full_date = monthNames[startDate.getMonth()] + " " + startDate.getDate() + ", " + startDate.getFullYear();

          $("#block_full_date").html(full_date);

          $('#make_appointment').modal('show');
          $("#appointment_blocker").show();
          $("#make_appointment #regular").hide();
          $("#make_appointment #myModalLabel").html("Block appointments");


          $('#timepicker_start').timepicker('setTime', ((startDate.getHours() > 12 ? startDate.getHours() - 12 : startDate.getHours()) + ":" + startDate.getMinutes() + " " + (startDate.getHours() > 11 ? "PM" : "AM")));
          $('#timepicker_end').timepicker('setTime', ((endDate.getHours() > 12 ? endDate.getHours() - 12 : endDate.getHours()) + ":" + endDate.getMinutes() + " " + (endDate.getHours() > 11 ? "PM" : "AM")));


        } : null,
        selectable: true,
        selectHelper: gon.admin ? true : false,
        unselectAuto: gon.admin ? false : true,
        editable: false,
        defaultView: 'agendaWeek',
        allDaySlot: false,
        minTime: $start_hour,
        maxTime: $end_hour,
        slotMinutes:30,
        lazyFetching: false,
        events: '/appointments.json',
        loading: function(isLoading, view) {
          if (isLoading) {
            $("#loading").show();
          }
          else {
            $("#loading").hide();
          }
          

        },
    

    });

    $("select[name='appointment[appointment_type]']").change(function() {
      
      

      generate_times_for_appointment($(this).val(), $make_appointment_current_date);

    });

    $(".fc-agenda-slots").on("mousemove", function(e) {
      $("#info_box").css({
         left:  e.pageX + 15,
         top:   e.pageY + 15
      });
    });

    $(".fc-agenda-slots").on("mouseenter", function(e) {
      $("#info_box").show();
    });

    $(".fc-widget-header").on("mouseenter", function(e) {
      $("#info_box").hide();
    });

    $(".fc-agenda-slots").on("mouseleave", function(e) {
      $("#info_box").hide();
    });

    $('#timepicker').timepicker({
        minuteStep: 30,
        showInputs: false,
        disableFocus: true
    });
    $('#timepicker_start').timepicker({
        minuteStep: 10,
        showInputs: false,
        disableFocus: true
    });
    $('#timepicker_end').timepicker({
        minuteStep: 5,
        showInputs: false,
        disableFocus: true
    });

    $("form#new_appointment").submit(function(e){
      var time = null;
      var end_time = null;
      var start_time = null;

      e.preventDefault();
      if (gon.admin) {
        var date = $(this).find("#block_full_date").html();
        start_time = $(this).find("#timepicker_start").val();
        end_time = $(this).find("#timepicker_end").val();

        $(this).find("#timepicker_start").val(date + " " + start_time);
        $(this).find("#timepicker_end").val(date + " " + end_time);
      }
      else {
        var date = $(this).find("#full_date").html();
        //time = $(this).find("#timepicker").val();
        time = $(this).find("#appointment_time").val();
        $(this).find("#timepicker").val(date + " " + time);

      }

      $.post($(this).attr('action') + ".js", $(this).serialize(), function(data) {});

      if (time != null) {
        //$(this).find("#timepicker").val(time);
      }
      else {
        $(this).find("#timepicker").val(start_time);
        $(this).find("#timepicker").val(end_time);
      }
    });



    // Enable pusher logging - don't include this in production
    Pusher.log = function(message) {
      if (window.console && window.console.log) {
        //window.console.log(message);
      }
    };

    var pusher = new Pusher('c394426bdc9d55ba2658');
    var channel = pusher.subscribe('appointments');
    channel.bind('add_event', function(data) {
      $.get('/appointments.json?id=' + data.id, function(data) {
        $('#calendar').fullCalendar('renderEvent', data[0]);
      });
      
      //$('#calendar').fullCalendar( 'addEventSource', '/appointments.json?id=' + data.id );
      //$("#calendar").fullCalendar( 'refetchEvents' )
    });
    channel.bind('remove_event', function(data) {
      $('#calendar').fullCalendar( 'removeEvents', [data.id] );
    });


});

function show_alert(title, message) {
  if (title.length > 0)
    $('#info_popup #myModalLabel').html(title);

  $('#info_popup .modal-body p').html(message);

  $('#info_popup').modal('show');
}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

function equalTime(date1, date2) {
    return date1.getHours() == date2.getHours() && date1.getMinutes() == date2.getMinutes();
}

var event_sort_asc = function (event1, event2) {
  if (event1.start > event2.start) return 1;
  if (event1.start < event2.start) return -1;
  return 0;
};

function console_debug(message) {
  if (debug)
    console.log(message);
}

function generate_times_for_appointment(appt_type, date) {
  var selected_time = null;
  var appt_times = [60, 90, 120];

  $("select#appointment_time").html("");

  //appointment length 60 (could be 90 or 120 minutes)
  var appt_length = typeof appt_type !== 'undefined' ? appt_times[appt_type] : appt_times[0];

  var day_events = [];

  $('#calendar').fullCalendar('clientEvents', function(event) {
    if(event.start.getDate() == date.getDate()) {
       day_events.push(event);

    } 
  });

  //sort appointments
  day_events.sort(event_sort_asc);

  var skip = false;
  var $start_hour = 10;
  var $end_hour = 20;

  cur_time_slot = new Date(date.getFullYear(),date.getMonth(),date.getDate(), $start_hour, 0);
  end_of_day = new Date(date.getFullYear(),date.getMonth(),date.getDate(), $end_hour, 0);
  start_of_day = new Date(date.getFullYear(),date.getMonth(),date.getDate(), $start_hour, 0);

  while (cur_time_slot < end_of_day) {
    skip = false;

    
    for (k in day_events) {

      //is there a 30 minutes gap before the time slot? (AND there's no room ahead)
      next_appt_k = (eval(k) + 1 < day_events.length ? eval(k) + 1 : k );
      if (equalTime(addMinutes(cur_time_slot,-30), day_events[k].end) 
                && (!equalTime(addMinutes(cur_time_slot,appt_length),day_events[next_appt_k].start) && !equalTime(addMinutes(cur_time_slot,appt_length),end_of_day)))
        skip = true;
        
      //does the day start 30 minutes before the time slot? skip it unless it touches the begining of next appointment
      else if (equalTime(addMinutes(cur_time_slot,-30),start_of_day)
                && !equalTime(addMinutes(cur_time_slot,appt_length),day_events[0].start)) 
        skip = true;
      
      //does the the timeslot+appointment end time goes over the limit of working day?
      else if (addMinutes(cur_time_slot,appt_length) > end_of_day) 
        skip = true;
       
      //does the event overlap with the timeslot?
      else if (day_events[k].start < addMinutes(cur_time_slot, appt_length) && day_events[k].end > cur_time_slot) 
        skip = true;
        
    }
    if (!skip) {
      time_formatted = cur_time_slot.getHours() + ":" + cur_time_slot.getMinutes() + (cur_time_slot.getMinutes() < 10 ? '0' : '');
      $("select#appointment_time").append("<option value='" + time_formatted + "'>" + time_formatted + "</option>");

      if (equalTime(cur_time_slot, date) || (cur_time_slot == null && cur_time_slot.getHours() == date.getHours()))
        selected_time = cur_time_slot;

    }

    //increase by 30 minutes
    cur_time_slot = addMinutes(cur_time_slot, 30);
  }


  var formatted_time;

  if (selected_time != null)
    formatted_time = selected_time.getHours() + ":" + selected_time.getMinutes() + (selected_time.getMinutes() < 10 ? '0' : '');
  else
    formatted_time = "";

  return formatted_time;


}