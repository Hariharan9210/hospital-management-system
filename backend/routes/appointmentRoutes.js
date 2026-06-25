const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  deleteAppointment
} = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/')
  .get(getAllAppointments)
  .post(createAppointment);
router.route('/:id')
  .get(getAppointmentById)
  .delete(authorize('admin', 'doctor', 'patient'), cancelAppointment);
router.put('/:id/status', authorize('admin', 'doctor'), updateAppointmentStatus);

// Hard delete - admin only
router.delete('/:id/permanent', authorize('admin'), deleteAppointment);

module.exports = router;