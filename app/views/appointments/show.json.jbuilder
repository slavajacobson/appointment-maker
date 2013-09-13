json.extract! @appointment, :date, :length, :created_at, :updated_at

if current_user.is_admin
  json.allDay false
  json.type appointment.appointment_type
  json.comment appointment.comment
  json.start appointment.start_time.strftime("%F %T")
  json.end appointment.end_time.strftime("%F %T")
  json.id appointment.id
  json.user_id appointment.user.id
  json.client_name appointment.user.full_name
end
