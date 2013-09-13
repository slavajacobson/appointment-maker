class Appointment < ActiveRecord::Base
	belongs_to :user
	
	before_validation :set_end_date
	validate :appointment_overlap
	after_create :update_all_connected_clients_add_event
	after_destroy :update_all_connected_clients_remove_event

	def  update_all_connected_clients_remove_event
    Pusher['appointments'].trigger('remove_event', {
      id: self.id
    })
	end
	def  update_all_connected_clients_add_event
    Pusher['appointments'].trigger('add_event', {
      id: self.id
    })
	end

  def appointment_overlap

  	exists = Appointment.where("start_time < ? AND end_time > ? AND id != ?", self.end_time, self.start_time, self.id.nil? ? -1 : self.id)
  	#debugger
    unless exists.blank?
      errors.add(:start_time, "This time is in use. Please select another time slot.")
    end
  end


	def set_end_date

		if self.appointment_type
			#debugger
			duration_type = [60, 90, 120]

			duration = duration_type[self.appointment_type.to_i]

			self.end_time = self.start_time.advance(minutes: duration)
		end
	end


end
