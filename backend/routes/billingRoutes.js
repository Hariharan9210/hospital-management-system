const express = require('express');
const router = express.Router();
const { createBill, getAllBills, getBillById, updatePaymentStatus, deleteBill } = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getAllBills).post(authorize('admin'), createBill);
router.route('/:id').get(getBillById).delete(authorize('admin'), deleteBill);
router.put('/:id/payment', authorize('admin'), updatePaymentStatus);

module.exports = router;