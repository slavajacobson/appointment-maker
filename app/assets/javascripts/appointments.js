var monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

$(document).ready(function() {

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

          var full_date = monthNames[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();

          $("#full_date").html(full_date);

          $('#timepicker').timepicker('setTime', ((date.getHours() > 12 ? date.getHours() - 12 : date.getHours()) + ":" + date.getMinutes() + " " + (date.getHours() > 11 ? "PM" : "AM")));

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
        minTime: 10,
        slotMinutes:30,
        maxTime: 20,
        lazyFetching: false,
        events: '/appointments.json',
        loading: function(isLoading, view) {
          // if (isLoading)
          //   console.log(view);

        },
    

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
        minuteStep: 15,
        showInputs: false,
        disableFocus: true
    });
    $('#timepicker_start').timepicker({
        minuteStep: 5,
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
        time = $(this).find("#timepicker").val();
        $(this).find("#timepicker").val(date + " " + time);

      }

      $.post($(this).attr('action') + ".js", $(this).serialize(), function(data) {});

      if (time != null) {
        $(this).find("#timepicker").val(time);
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