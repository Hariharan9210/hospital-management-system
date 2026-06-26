const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { AppError } = require('../middleware/errorMiddleware');

const createPrescription = async (req, res, next) => {
  try {
    const { appointment, patient, doctor, medicines, diagnosis, generalInstructions, followUpDate, labTests } = req.body;

    const prescription = await Prescription.create({
      appointment, patient, doctor, medicines,
      diagnosis, generalInstructions, followUpDate, labTests: labTests || []
    });

    if (appointment) {
      await Appointment.findByIdAndUpdate(appointment, { prescription: prescription._id });
    }

    await prescription.populate([
      { path: 'patient', select: 'name patientId' },
      { path: 'doctor', select: 'name specialization' }
    ]);

    res.status(201).json({ success: true, message: 'Prescription created!', data: prescription });
  } catch (error) { next(error); }
};

const getAllPrescriptions = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    let filter = {};

    // ============================================
    // By default exclude cancelled prescriptions
    // Only show cancelled if status=cancelled is
    // explicitly requested in query params
    // ============================================
    if (status) {
      filter.status = status;
    } else {
      // Default: show only active and completed
      filter.status = { $in: ['active', 'completed'] };
    }

    // Role based filtering
    if (req.user.role === 'patient') {
      const p = await Patient.findOne({ userId: req.user._id });
      if (p) filter.patient = p._id;
      else return res.status(200).json({
        success: true, count: 0, total: 0,
        totalPages: 0, currentPage: 1, data: []
      });
    } else if (req.user.role === 'doctor') {
      const d = await Doctor.findOne({ userId: req.user._id });
      if (d) filter.doctor = d._id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [prescriptions, total] = await Promise.all([
      Prescription.find(filter)
        .populate('patient', 'name patientId')
        .populate('doctor', 'name specialization')
        .sort({ prescribedDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Prescription.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: prescriptions
    });

  } catch (error) {
    next(error);
  }
};

const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name patientId dateOfBirth bloodGroup allergies')
      .populate('doctor', 'name specialization qualification licenseNumber')
      .populate('appointment');
    if (!prescription) return next(new AppError('Prescription not found', 404));
    res.status(200).json({ success: true, data: prescription });
  } catch (error) { next(error); }
};

const updatePrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id, { $set: req.body }, { new: true, runValidators: true }
    );
    if (!prescription) return next(new AppError('Prescription not found', 404));
    res.status(200).json({ success: true, message: 'Prescription updated!', data: prescription });
  } catch (error) { next(error); }
};

const deletePrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id, { status: 'cancelled' }, { new: true }
    );
    if (!prescription) return next(new AppError('Prescription not found', 404));
    res.status(200).json({ success: true, message: 'Prescription cancelled.' });
  } catch (error) { next(error); }
};

module.exports = { createPrescription, getAllPrescriptions, getPrescriptionById, updatePrescription, deletePrescription };