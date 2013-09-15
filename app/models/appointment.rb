class Appointment < ActiveRecord::Base
	belongs_to :user
	
	before_validation :set_end_date
	validate :appointment_overlap
	validate :early_appointment
	validate :late_appointment
	validate :more_than_one_appointment_per_two_weeks
	validate :time_selected

	after_create :update_all_connected_clients_add_event
	after_destroy :update_all_connected_clients_remove_event


	def time_selected 
		if self.start_time == self.start_time.at_beginning_of_day
			errors.add(:start_time, "Please select appointment time from the drop down menu.")
		end

	end
	def more_than_one_appointment_per_two_weeks

		unless self.user.is_admin
			apt_time = self.start_time
			#debugger
			if Appointment.where("((start_time < ? AND start_time > ?) OR (start_time > ? AND start_time < ?)) AND user_id = ?", apt_time, (apt_time - 14.days), apt_time, (apt_time + 14.days), self.user.id).first
				errors.add(:start_time, "System only allows one appointment per two weeks. Please call directly to make an appointment.")


			end


		end

	end


	def early_appointment 
		if self.start_time  < (DateTime.now + 1.days).beginning_of_day && !self.user.is_admin
			errors.add(:start_time, "To make an appointment within the next 24 hours please call us directly.")
		end
	end

	def late_appointment 
		if self.start_time  > (DateTime.now + 90.days) && !self.user.is_admin
			errors.add(:start_time, "You can only make an appointment 90 days ahead.")
		end
	end

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
