const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  phone: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  address: {
    street: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  allergies: [String],
  medicalHistory: [{
    condition: String,
    diagnosedYear: Number,
    status: { type: String, enum: ['active', 'resolved', 'chronic'] }
  }],
  currentMedications: [String],
  insurance: {
    provider: String,
    policyNumber: String,
    validUntil: Date
  },
  patientId: { type: String, unique: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

patientSchema.pre('save', async function() {
  if (!this.patientId) {
    // Keep trying until we find a unique ID
    let isUnique = false;
    let patientId;
    const year = new Date().getFullYear();

    while (!isUnique) {
      // Count ALL documents including inactive ones
      const count = await this.constructor.countDocuments();
      // Add random number to avoid conflicts
      const random = Math.floor(Math.random() * 1000);
      patientId = `PAT-${year}-${String(count + random + 1).padStart(5, '0')}`;

      // Check if this ID already exists
      const existing = await this.constructor.findOne({ patientId });
      if (!existing) {
        isUnique = true;
      }
    }

    this.patientId = patientId;
  }
});

patientSchema.virtual('age').get(function() {
  const today = new Date();
  const birth = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
});

patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Patient', patientSchema);