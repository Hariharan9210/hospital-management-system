const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String, required: true },
  specialization: {
    type: String,
    required: true,
    enum: [
      'General Medicine', 'Cardiology', 'Dermatology',
      'Orthopedics', 'Pediatrics', 'Gynecology',
      'Neurology', 'Ophthalmology', 'ENT',
      'Psychiatry', 'Radiology', 'Oncology',
      'Urology', 'Nephrology', 'Gastroenterology'
    ]
  },
  department: { type: String, required: true },
  qualification: { type: String, required: true },
  experience: { type: Number, required: true, min: 0 },
  licenseNumber: { type: String, required: true, unique: true },
  consultationFee: { type: Number, required: true, min: 0 },
  availability: [{
    day: {
      type: String,
      enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
    },
    startTime: String,
    endTime: String,
    isAvailable: { type: Boolean, default: true }
  }],
  maxAppointmentsPerDay: { type: Number, default: 20 },
  bio: { type: String, maxlength: 500 },
  doctorId: { type: String, unique: true },
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 0, min: 0, max: 5 }
}, { timestamps: true });

doctorSchema.pre('save', async function() {
  if (!this.doctorId) {
    let isUnique = false;
    let doctorId;
    const year = new Date().getFullYear();

    while (!isUnique) {
      const count = await this.constructor.countDocuments();
      const random = Math.floor(Math.random() * 1000);
      doctorId = `DOC-${year}-${String(count + random + 1).padStart(4, '0')}`;
      const existing = await this.constructor.findOne({ doctorId });
      if (!existing) isUnique = true;
    }

    this.doctorId = doctorId;
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);