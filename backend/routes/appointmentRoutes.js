const express = require('express');
const router = express.Router();
const { createAppointment, getAllAppointments, getAppointmentById, updateAppointmentStatus, cancelAppointment } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getAllAppointments).post(createAppointment);
router.route('/:id').get(getAppointmentById).delete(cancelAppointment);
router.put('/:id/status', authorize('admin', 'doctor'), updateAppointmentStatus);

module.exports = router;