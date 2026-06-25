const express = require('express');
const router = express.Router();
const { createPrescription, getAllPrescriptions, getPrescriptionById, updatePrescription, deletePrescription } = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getAllPrescriptions).post(authorize('admin', 'doctor'), createPrescription);
router.route('/:id').get(getPrescriptionById).put(authorize('admin', 'doctor'), updatePrescription).delete(authorize('admin', 'doctor'), deletePrescription);

module.exports = router;