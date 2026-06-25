const Patient = require('../models/Patient');
const User = require('../models/User');
const { AppError } = require('../middleware/errorMiddleware');

const createPatient = async (req, res, next) => {
  try {
    const { name, email, password, dateOfBirth, gender, bloodGroup,
            phone, address, emergencyContact, allergies, medicalHistory } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return next(new AppError('Email already exists', 400));

    const user = await User.create({
      name, email, password: password || 'Patient@123', role: 'patient'
    });

    const patient = await Patient.create({
      userId: user._id, name, email, dateOfBirth, gender,
      bloodGroup, phone, address, emergencyContact,
      allergies: allergies || [], medicalHistory: medicalHistory || []
    });

    await User.findByIdAndUpdate(user._id, { profileId: patient._id });

    res.status(201).json({
      success: true,
      message: `Patient ${name} registered successfully!`,
      data: patient
    });
  } catch (error) { next(error); }
};

const getAllPatients = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', bloodGroup, gender } = req.query;
    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } }
      ];
    }
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (gender) filter.gender = gender;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [patients, total] = await Promise.all([
      Patient.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Patient.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true, count: patients.length, total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page), data: patients
    });
  } catch (error) { next(error); }
};

const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return next(new AppError('Patient not found', 404));
    res.status(200).json({ success: true, data: patient });
  } catch (error) { next(error); }
};

const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return next(new AppError('Patient not found', 404));
    }

    // ============================================
    // SECURITY CHECK
    // Patients can only update their OWN profile
    // Admins and doctors can update any patient
    // ============================================
    if (req.user.role === 'patient') {
      // Find the patient profile that belongs to this logged in user
      const myProfile = await Patient.findOne({ userId: req.user._id });

      if (!myProfile) {
        return next(new AppError('Patient profile not found for your account', 404));
      }

      // Check if the profile they are trying to update is their own
      if (myProfile._id.toString() !== req.params.id.toString()) {
        return next(new AppError('You can only update your own profile', 403));
      }

      // Patients cannot change these sensitive medical fields
      // Only doctors and admins can change these
      const {
        medicalHistory,
        patientId,
        userId,
        isActive,
        ...allowedUpdates
      } = req.body;

      // Only update the allowed fields
      const updatedPatient = await Patient.findByIdAndUpdate(
        req.params.id,
        { $set: allowedUpdates },
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Your profile has been updated successfully!',
        data: updatedPatient
      });
    }

    // Admin and Doctor can update everything
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Patient profile updated successfully!',
      data: updatedPatient
    });

  } catch (error) {
    next(error);
  }
};

const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return next(new AppError('Patient not found', 404));
    await Patient.findByIdAndUpdate(req.params.id, { isActive: false });
    await User.findByIdAndUpdate(patient.userId, { isActive: false });
    res.status(200).json({ success: true, message: 'Patient deactivated.' });
  } catch (error) { next(error); }
};

const getPatientHistory = async (req, res, next) => {
  try {
    const Appointment = require('../models/Appointment');
    const Prescription = require('../models/Prescription');
    const Bill = require('../models/Bill');

    const [appointments, prescriptions, bills] = await Promise.all([
      Appointment.find({ patient: req.params.id })
        .populate('doctor', 'name specialization').sort({ appointmentDate: -1 }).limit(20),
      Prescription.find({ patient: req.params.id })
        .populate('doctor', 'name specialization').sort({ prescribedDate: -1 }).limit(20),
      Bill.find({ patient: req.params.id }).sort({ billDate: -1 }).limit(20)
    ]);

    res.status(200).json({ success: true, data: { appointments, prescriptions, bills } });
  } catch (error) { next(error); }
};

module.exports = { createPatient, getAllPatients, getPatientById, updatePatient, deletePatient, getPatientHistory };