const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { AppError } = require('../middleware/errorMiddleware');

const createAppointment = async (req, res, next) => {
  try {
    const { patient, doctor, appointmentDate, timeSlot, type, reason, symptoms } = req.body;

    const [patientExists, doctorExists] = await Promise.all([
      Patient.findById(patient), Doctor.findById(doctor)
    ]);
    if (!patientExists) return next(new AppError('Patient not found', 404));
    if (!doctorExists) return next(new AppError('Doctor not found', 404));

    const conflict = await Appointment.findOne({
      doctor, appointmentDate: new Date(appointmentDate),
      'timeSlot.startTime': timeSlot.startTime,
      status: { $nin: ['cancelled', 'no-show'] }
    });
    if (conflict) return next(new AppError('This time slot is already booked', 400));

    const appointment = await Appointment.create({
      patient, doctor, appointmentDate, timeSlot,
      type: type || 'consultation', reason, symptoms: symptoms || []
    });

    await appointment.populate([
      { path: 'patient', select: 'name patientId phone' },
      { path: 'doctor', select: 'name specialization consultationFee' }
    ]);

    res.status(201).json({ success: true, message: 'Appointment booked!', data: appointment });
  } catch (error) { next(error); }
};

const getAllAppointments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, date } = req.query;
    let filter = {};

    if (req.user.role === 'patient') {
      const p = await Patient.findOne({ userId: req.user._id });
      if (p) {
        filter.patient = p._id;
      } else {
        return res.status(200).json({
          success: true, count: 0, total: 0,
          totalPages: 0, currentPage: 1, data: []
        });
      }
    } else if (req.user.role === 'doctor') {
      const d = await Doctor.findOne({ userId: req.user._id });
      if (d) filter.doctor = d._id;
    }

    if (status) filter.status = status;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.appointmentDate = { $gte: start, $lte: end };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate({
          path: 'patient',
          select: 'name patientId phone email bloodGroup gender age'
        })
        .populate({
          path: 'doctor',
          select: 'name specialization consultationFee department'
        })
        .sort({ appointmentDate: -1, 'timeSlot.startTime': 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Appointment.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: appointments
    });

  } catch (error) {
    next(error);
  }
};

const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name patientId phone email bloodGroup allergies')
      .populate('doctor', 'name specialization consultationFee')
      .populate('prescription').populate('bill');
    if (!appointment) return next(new AppError('Appointment not found', 404));
    res.status(200).json({ success: true, data: appointment });
  } catch (error) { next(error); }
};

const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, notes, vitals, cancellationReason } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return next(new AppError('Appointment not found', 404));

    const updateData = { status };
    if (notes) updateData.notes = notes;
    if (vitals) updateData.vitals = vitals;
    if (status === 'cancelled') {
      updateData.cancellationReason = cancellationReason;
      updateData.cancelledBy = req.user.role;
    }

    const updated = await Appointment.findByIdAndUpdate(
      req.params.id, { $set: updateData }, { new: true }
    ).populate('patient', 'name').populate('doctor', 'name');

    res.status(200).json({ success: true, message: `Appointment ${status}!`, data: updated });
  } catch (error) { next(error); }
};

const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return next(new AppError('Appointment not found', 404));
    if (['completed', 'cancelled'].includes(appointment.status)) {
      return next(new AppError(`Cannot cancel a ${appointment.status} appointment`, 400));
    }
    await Appointment.findByIdAndUpdate(req.params.id, {
      status: 'cancelled', cancelledBy: req.user.role,
      cancellationReason: req.body.reason
    });
    res.status(200).json({ success: true, message: 'Appointment cancelled.' });
  } catch (error) { next(error); }
};

// Hard delete appointment - admin only
const deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return next(new AppError('Appointment not found', 404));
    }
    await Appointment.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Appointment deleted permanently.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAppointment, getAllAppointments, getAppointmentById, updateAppointmentStatus, cancelAppointment,deleteAppointment  };