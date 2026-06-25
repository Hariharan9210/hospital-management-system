const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { AppError } = require('../middleware/errorMiddleware');

const createDoctor = async (req, res, next) => {
  try {
    const { name, email, password, phone, specialization, department,
            qualification, experience, licenseNumber, consultationFee, availability, bio } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return next(new AppError('Email already exists', 400));

    const user = await User.create({ name, email, password: password || 'Doctor@123', role: 'doctor' });
    const doctor = await Doctor.create({
      userId: user._id, name, email, phone, specialization,
      department, qualification, experience, licenseNumber,
      consultationFee, availability: availability || [], bio
    });
    await User.findByIdAndUpdate(user._id, { profileId: doctor._id });

    res.status(201).json({ success: true, message: `Dr. ${name} added!`, data: doctor });
  } catch (error) { next(error); }
};

const getAllDoctors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', specialization } = req.query;
    const filter = { isActive: true };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }
    if (specialization) filter.specialization = specialization;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [doctors, total] = await Promise.all([
      Doctor.find(filter).sort({ name: 1 }).skip(skip).limit(parseInt(limit)),
      Doctor.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true, count: doctors.length, total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page), data: doctors
    });
  } catch (error) { next(error); }
};

const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return next(new AppError('Doctor not found', 404));
    res.status(200).json({ success: true, data: doctor });
  } catch (error) { next(error); }
};

const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id, { $set: req.body }, { new: true, runValidators: true }
    );
    if (!doctor) return next(new AppError('Doctor not found', 404));
    res.status(200).json({ success: true, message: 'Doctor updated!', data: doctor });
  } catch (error) { next(error); }
};

const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return next(new AppError('Doctor not found', 404));
    await Doctor.findByIdAndUpdate(req.params.id, { isActive: false });
    await User.findByIdAndUpdate(doctor.userId, { isActive: false });
    res.status(200).json({ success: true, message: 'Doctor deactivated.' });
  } catch (error) { next(error); }
};

const updateAvailability = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id, { availability: req.body.availability }, { new: true }
    );
    if (!doctor) return next(new AppError('Doctor not found', 404));
    res.status(200).json({ success: true, message: 'Availability updated!', data: doctor.availability });
  } catch (error) { next(error); }
};

module.exports = { createDoctor, getAllDoctors, getDoctorById, updateDoctor, deleteDoctor, updateAvailability };