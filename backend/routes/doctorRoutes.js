const express = require('express');
const router = express.Router();
const { createDoctor, getAllDoctors, getDoctorById, updateDoctor, deleteDoctor, updateAvailability } = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getAllDoctors).post(authorize('admin'), createDoctor);
router.route('/:id').get(getDoctorById).put(authorize('admin', 'doctor'), updateDoctor).delete(authorize('admin'), deleteDoctor);
router.put('/:id/availability', authorize('admin', 'doctor'), updateAvailability);

module.exports = router;