class CreateAppointments < ActiveRecord::Migration
  def change
    create_table :appointments do |t|
      t.datetime :start_time
      t.datetime :end_time
      t.string :appointment_type
      t.text :comment
      t.belongs_to :user
      t.timestamps
    end
  end
end
