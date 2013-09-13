class AppointmentsController < ApplicationController
  before_action :set_appointment, only: [:show, :edit, :update, :destroy]
  before_action :authenticate_user!
  # GET /appointments
  # GET /appointments.json
  def index
    gon.admin = current_user.is_admin


    #@appointments_events = @appointments.to_json(current_user.id.to_s).html_safe
    respond_to do |format|
      format.html {
        @appointment = Appointment.new
      }

      

      format.json { 
        #debugger
        if params[:id]
          @appointment = Appointment.find(params[:id])
        else
          @appointments = Appointment.where("start_time >= ? AND start_time <= ?", DateTime.strptime(params[:start],'%s'), DateTime.strptime(params[:end],'%s'))
        end
        
      
        format.json { render json: @appointments }
      }
    end
  end


  # GET /appointments/1
  # GET /appointments/1.json
  def show
  end

  # GET /appointments/new
  def new
    @appointment = Appointment.new

  end

  # GET /appointments/1/edit
  def edit


  end

  # POST /appointments
  # POST /appointments.json
  def create
    @appointment = Appointment.new(appointment_params)
    @appointment.user = current_user

    #debugger
    respond_to do |format|
      if @appointment.save
        format.html { redirect_to @appointment, notice: 'Appointment was successfully created.' }
        format.js
      else
        format.html { render action: 'new' }
        format.js
      end
    end
  end

  # PATCH/PUT /appointments/1
  # PATCH/PUT /appointments/1.json
  def update
    #debugger
    respond_to do |format|


      if (params[:appointment_form_action] == "commit")
        @appointment.update(appointment_params)
      elsif (params[:appointment_form_action] == "cancel")
        @appointment.destroy
      elsif (params[:unblock_appointment])
        @appointment.destroy
      end
      

      format.js
    end
  end

  # DELETE /appointments/1
  # DELETE /appointments/1.json
  def destroy
    @appointment.destroy
    respond_to do |format|
      format.html { redirect_to appointments_url }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_appointment
      @appointment = Appointment.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def appointment_params
      params.require(:appointment).permit(:start_time, :end_time, :appointment_type, :comment)
    end
end
