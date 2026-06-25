const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointmentDate: { type: Date, required: true },
  timeSlot: {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  },
  type: {
    type: String,
    enum: ['consultation', 'follow-up', 'emergency', 'routine-checkup'],
    default: 'consultation'
  },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  notes: String,
  symptoms: [String],
  vitals: {
    bloodPressure: String,
    pulse: Number,
    temperature: Number,
    weight: Number,
    height: Number
  },
  prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  bill: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill' },
  appointmentId: { type: String, unique: true },
  cancelledBy: { type: String, enum: ['patient', 'doctor', 'admin'] },
  cancellationReason: String
}, { timestamps: true });

appointmentSchema.pre('save', async function() {
  if (!this.appointmentId) {
    let isUnique = false;
    let appointmentId;

    while (!isUnique) {
      const count = await this.constructor.countDocuments();
      const d = new Date();
      const dateStr = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
      const random = Math.floor(Math.random() * 100);
      appointmentId = `APT-${dateStr}-${String(count + random + 1).padStart(4, '0')}`;
      const existing = await this.constructor.findOne({ appointmentId });
      if (!existing) isUnique = true;
    }

    this.appointmentId = appointmentId;
  }
});

appointmentSchema.index({ doctor: 1, appointmentDate: 1 });
appointmentSchema.index({ patient: 1, appointmentDate: -1 });

module.exports = mongoose.model('Appointment', appointmentSchema);