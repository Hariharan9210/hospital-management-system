const express = require('express');
const router = express.Router();
const {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getPatientHistory
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(authorize('admin', 'doctor'), getAllPatients)
  .post(authorize('admin', 'doctor'), createPatient);

router.route('/:id')
  .get(authorize('admin', 'doctor', 'patient'), getPatientById)
  .put(authorize('admin', 'doctor', 'patient'), updatePatient)  // ← patient added
  .delete(authorize('admin'), deletePatient);

router.get('/:id/history', authorize('admin', 'doctor', 'patient'), getPatientHistory);

module.exports = router;