#debugger
@appointments = [ @appointment ] unless @appointment.nil?

json.array!(@appointments) do |appointment|
	
	json.extract! appointment, :id, :start_time
	

	if current_user.is_admin
	  json.allDay false
	  json.type appointment.appointment_type
	  json.title "Client: #{appointment.user.full_name} Comment:"
	  json.start appointment.start_time.strftime("%F %T")
	  json.end appointment.end_time.strftime("%F %T")
	  json.id appointment.id
	  json.user_id appointment.user.id
	  json.className appointment.user.is_admin ? "blocked_event" : "user_event"
	elsif appointment.user_id == current_user.id
	  json.allDay false
	  json.full_name appointment.user.full_name
	  json.phone_number appointment.user.phone_number
	  json.title "Your appointment. Click to modify."
	  json.type appointment.appointment_type
	  json.id appointment.id
	  json.start appointment.start_time.strftime("%F %T")
	  json.end appointment.end_time.strftime("%F %T")
	  json.className "user_event"
	else
		json.title "Busy"
		json.allDay false
		json.start appointment.start_time.strftime("%F %T")
	  json.end appointment.end_time.strftime("%F %T")
	  json.className "busy_event"
	end

end


  