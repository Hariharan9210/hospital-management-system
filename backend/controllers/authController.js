const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const jwt = require('jsonwebtoken');
const { AppError } = require('../middleware/errorMiddleware');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Block public registration for admin and doctor
    if (role === 'admin' || role === 'doctor') {
      return next(new AppError(
        'Only administrators can create doctor or admin accounts.',
        403
      ));
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('An account with this email already exists', 400));
    }

    // Create User account
    const user = await User.create({
      name,
      email,
      password,
      role: 'patient'  // Always patient for public registration
    });

    // ============================================
    // AUTO CREATE PATIENT PROFILE
    // When someone registers, automatically create
    // their basic patient profile so they can
    // immediately book appointments
    // ============================================
    try {
      const Patient = require('../models/Patient');

      const patient = await Patient.create({
        userId: user._id,
        name: name,
        email: email,
        // Default values - patient can update later
        dateOfBirth: new Date('2000-01-01'),
        gender: 'male',
        bloodGroup: 'O+',
        phone: '0000000000',
        address: {
          street: '',
          city: 'Not set',
          state: 'Not set',
          pincode: ''
        }
      });

      // Link patient profile to user
      await User.findByIdAndUpdate(user._id, { profileId: patient._id });

    } catch (profileError) {
      // If patient profile creation fails, still let them login
      // Admin can create profile later
      console.log('Patient profile auto-creation note:', profileError.message);
    }

    // Generate token
    const token = generateToken(user);
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Please update your profile details.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return next(new AppError('Invalid email or password', 401));
    if (!user.isActive) return next(new AppError('Account deactivated. Contact admin.', 401));

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return next(new AppError('Invalid email or password', 401));

    let profileData = null;
    if (user.role === 'doctor') profileData = await Doctor.findOne({ userId: user._id });
    else if (user.role === 'patient') profileData = await Patient.findOne({ userId: user._id });

    const token = generateToken(user);
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user._id, name: user.name,
        email: user.email, role: user.role,
        profileId: profileData ? profileData._id : null
      }
    });
  } catch (error) { next(error); }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;
    if (user.role === 'doctor') profile = await Doctor.findOne({ userId: user._id });
    else if (user.role === 'patient') profile = await Patient.findOne({ userId: user._id });

    res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      profile
    });
  } catch (error) { next(error); }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const Appointment = require('../models/Appointment');
    const Bill = require('../models/Bill');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [totalPatients, totalDoctors, totalAppointments,
           todayAppointments, pendingBills, revenue] = await Promise.all([
      Patient.countDocuments({ isActive: true }),
      Doctor.countDocuments({ isActive: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({ appointmentDate: { $gte: today, $lte: todayEnd } }),
      Bill.countDocuments({ paymentStatus: 'pending' }),
      Bill.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amountPaid' } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalPatients, totalDoctors, totalAppointments,
        todayAppointments, pendingBills,
        totalRevenue: revenue[0]?.total || 0
      }
    });
  } catch (error) { next(error); }
};

// @route   POST /api/auth/admin/create-user
// @desc    Admin creates doctor or admin accounts
// @access  Admin only
const adminCreateUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Only allow admin and doctor roles from this endpoint
    if (!['admin', 'doctor'].includes(role)) {
      return next(new AppError('This endpoint is for admin and doctor accounts only', 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already exists', 400));
    }

    const user = await User.create({ name, email, password, role });
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: `${role} account created successfully!`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, getDashboardStats,adminCreateUser };