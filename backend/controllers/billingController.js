const Bill = require('../models/Bill');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { AppError } = require('../middleware/errorMiddleware');

const createBill = async (req, res, next) => {
  try {
    const {
      patient, doctor, appointment,
      items, discount, taxRate, notes
    } = req.body;

    // Validate items
    if (!items || items.length === 0) {
      return next(new AppError('At least one bill item is required', 400));
    }

    // Calculate totals manually here too as a safety net
    const processedItems = items.map(item => ({
      description: item.description,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      total: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0)
    }));

    const subtotal = processedItems.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = Number(discount) || 0;
    const taxRateNum = Number(taxRate) || 0;
    const taxAmount = (subtotal - discountAmount) * (taxRateNum / 100);
    const totalAmount = subtotal - discountAmount + taxAmount;

    // Create bill with all calculated values
    const bill = await Bill.create({
      patient,
      doctor: doctor || undefined,
      appointment: appointment || undefined,
      items: processedItems,
      subtotal,
      discount: discountAmount,
      taxRate: taxRateNum,
      taxAmount,
      totalAmount,        // ← sending it directly so required validation passes
      amountPaid: 0,
      balanceDue: totalAmount,
      notes: notes || ''
    });

    // Link bill to appointment if provided
    if (appointment) {
      await Appointment.findByIdAndUpdate(appointment, { bill: bill._id });
    }

    await bill.populate([
      { path: 'patient', select: 'name patientId phone' },
      { path: 'doctor', select: 'name specialization' }
    ]);

    res.status(201).json({
      success: true,
      message: `Bill generated successfully! Total: ₹${totalAmount}`,
      data: bill
    });

  } catch (error) {
    next(error);
  }
};

const getAllBills = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, paymentStatus } = req.query;
    let filter = {};

    if (req.user.role === 'patient') {
      const p = await Patient.findOne({ userId: req.user._id });
      if (p) filter.patient = p._id;
    }
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [bills, total] = await Promise.all([
      Bill.find(filter)
        .populate('patient', 'name patientId')
        .populate('doctor', 'name specialization')
        .sort({ billDate: -1 }).skip(skip).limit(parseInt(limit)),
      Bill.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true, count: bills.length, total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page), data: bills
    });
  } catch (error) { next(error); }
};

const getBillById = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('patient', 'name patientId phone email address')
      .populate('doctor', 'name specialization')
      .populate('appointment');
    if (!bill) return next(new AppError('Bill not found', 404));
    res.status(200).json({ success: true, data: bill });
  } catch (error) { next(error); }
};

const updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus, paymentMethod, amountPaid } = req.body;
    const bill = await Bill.findById(req.params.id);
    if (!bill) return next(new AppError('Bill not found', 404));

    const updateData = { paymentStatus, paymentMethod };
    if (amountPaid !== undefined) {
      updateData.amountPaid = amountPaid;
      updateData.balanceDue = bill.totalAmount - amountPaid;
    }
    if (paymentStatus === 'paid') {
      updateData.paidAt = new Date();
      updateData.amountPaid = bill.totalAmount;
      updateData.balanceDue = 0;
    }

    const updated = await Bill.findByIdAndUpdate(
      req.params.id, { $set: updateData }, { new: true }
    ).populate('patient', 'name patientId');

    res.status(200).json({ success: true, message: 'Payment updated!', data: updated });
  } catch (error) { next(error); }
};

const deleteBill = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) return next(new AppError('Bill not found', 404));
    if (bill.paymentStatus === 'paid') return next(new AppError('Cannot delete a paid bill', 400));
    await Bill.findByIdAndUpdate(req.params.id, { paymentStatus: 'cancelled' });
    res.status(200).json({ success: true, message: 'Bill cancelled.' });
  } catch (error) { next(error); }
};

module.exports = { createBill, getAllBills, getBillById, updatePaymentStatus, deleteBill };