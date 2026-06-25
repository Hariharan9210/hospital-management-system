const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: {
    type: String,
    required: true,
    enum: [
      'Once daily', 'Twice daily', 'Three times daily',
      'Four times daily', 'Every 6 hours', 'Every 8 hours',
      'Every 12 hours', 'As needed', 'Before meals',
      'After meals', 'At bedtime'
    ]
  },
  duration: { type: String, required: true },
  instructions: String
});

const prescriptionSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  prescribedDate: { type: Date, default: Date.now },
  medicines: {
    type: [medicineSchema],
    validate: {
      validator: function(v) { return v && v.length > 0; },
      message: 'At least one medicine is required'
    }
  },
  diagnosis: { type: String, required: true },
  generalInstructions: String,
  followUpDate: Date,
  labTests: [String],
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  prescriptionId: { type: String, unique: true }
}, { timestamps: true });

prescriptionSchema.pre('save', async function() {
  if (!this.prescriptionId) {
    let isUnique = false;
    let prescriptionId;
    const year = new Date().getFullYear();

    while (!isUnique) {
      const count = await this.constructor.countDocuments();
      const random = Math.floor(Math.random() * 1000);
      prescriptionId = `RX-${year}-${String(count + random + 1).padStart(5, '0')}`;
      const existing = await this.constructor.findOne({ prescriptionId });
      if (!existing) isUnique = true;
    }

    this.prescriptionId = prescriptionId;
  }
});

module.exports = mongoose.model('Prescription', prescriptionSchema);