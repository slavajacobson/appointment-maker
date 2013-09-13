# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)


User.create(email:'vs.jacobson@gmail.com', password: '12344321', 
						password_confirmation:'12344321', is_admin: true, full_name: "Slava Jacobson", phone_number:"6477782846")