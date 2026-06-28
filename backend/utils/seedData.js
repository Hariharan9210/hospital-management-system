const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

const seedDatabase = async () => {
  try {
    // Check if admin already exists
    // If yes - skip seeding (already done before)
    const existingAdmin = await User.findOne({ email: 'admin@hospital.com' });
    if (existingAdmin) {
      console.log('✅ Database already seeded. Skipping...');
      return false;
    }

    console.log('🌱 Seeding database with sample data...');

    // Admin
    await User.create({
      name: 'Admin User',
      email: 'admin@hospital.com',
      password: 'Admin@123',
      role: 'admin'
    });

    // Doctor 1
    const d1User = await User.create({
      name: 'Dr. Arjun Sharma',
      email: 'arjun@hospital.com',
      password: 'Doctor@123',
      role: 'doctor'
    });
    const doctor1 = await Doctor.create({
      userId: d1User._id,
      name: 'Dr. Arjun Sharma',
      email: 'arjun@hospital.com',
      phone: '9876543210',
      specialization: 'Cardiology',
      department: 'Cardiology',
      qualification: 'MBBS, MD',
      experience: 12,
      licenseNumber: 'MCI-001',
      consultationFee: 800,
      availability: [
        { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Friday', startTime: '09:00', endTime: '13:00', isAvailable: true }
      ]
    });
    await User.findByIdAndUpdate(d1User._id, { profileId: doctor1._id });

    // Doctor 2
    const d2User = await User.create({
      name: 'Dr. Priya Nair',
      email: 'priya@hospital.com',
      password: 'Doctor@123',
      role: 'doctor'
    });
    const doctor2 = await Doctor.create({
      userId: d2User._id,
      name: 'Dr. Priya Nair',
      email: 'priya@hospital.com',
      phone: '9876543211',
      specialization: 'Pediatrics',
      department: 'Pediatrics',
      qualification: 'MBBS, DCH',
      experience: 8,
      licenseNumber: 'MCI-002',
      consultationFee: 600,
      availability: [
        { day: 'Tuesday', startTime: '10:00', endTime: '18:00', isAvailable: true },
        { day: 'Thursday', startTime: '10:00', endTime: '18:00', isAvailable: true },
        { day: 'Saturday', startTime: '09:00', endTime: '14:00', isAvailable: true }
      ]
    });
    await User.findByIdAndUpdate(d2User._id, { profileId: doctor2._id });

    // Patient 1
    const p1User = await User.create({
      name: 'Ravi Kumar',
      email: 'ravi@gmail.com',
      password: 'Patient@123',
      role: 'patient'
    });
    const patient1 = await Patient.create({
      userId: p1User._id,
      name: 'Ravi Kumar',
      email: 'ravi@gmail.com',
      phone: '9500123456',
      dateOfBirth: new Date('1985-06-15'),
      gender: 'male',
      bloodGroup: 'O+',
      address: {
        street: '123 Anna Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600040'
      },
      emergencyContact: {
        name: 'Meena Kumar',
        relationship: 'Wife',
        phone: '9500654321'
      },
      allergies: ['Penicillin']
    });
    await User.findByIdAndUpdate(p1User._id, { profileId: patient1._id });

    // Patient 2
    const p2User = await User.create({
      name: 'Lakshmi Devi',
      email: 'lakshmi@gmail.com',
      password: 'Patient@123',
      role: 'patient'
    });
    const patient2 = await Patient.create({
      userId: p2User._id,
      name: 'Lakshmi Devi',
      email: 'lakshmi@gmail.com',
      phone: '9600234567',
      dateOfBirth: new Date('1990-03-22'),
      gender: 'female',
      bloodGroup: 'B+',
      address: {
        street: '45 T Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600017'
      },
      emergencyContact: {
        name: 'Suresh',
        relationship: 'Husband',
        phone: '9600765432'
      }
    });
    await User.findByIdAndUpdate(p2User._id, { profileId: patient2._id });

    // Appointment
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await Appointment.create({
      patient: patient1._id,
      doctor: doctor1._id,
      appointmentDate: tomorrow,
      timeSlot: { startTime: '10:00', endTime: '10:30' },
      type: 'consultation',
      reason: 'Chest pain and shortness of breath',
      status: 'scheduled'
    });

    console.log('🎉 Database seeded successfully!');
    console.log('📧 admin@hospital.com     / Admin@123');
    console.log('📧 arjun@hospital.com     / Doctor@123');
    console.log('📧 priya@hospital.com     / Doctor@123');
    console.log('📧 ravi@gmail.com          / Patient@123');
    console.log('📧 lakshmi@gmail.com       / Patient@123');
    return true;

  } catch (error) {
    console.error('❌ Seed error:', error.message);
    return false;
  }
};

module.exports = seedDatabase;