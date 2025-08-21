const express = require('express');
const { body, param, query } = require('express-validator');
const {
  getInquiries,
  getInquiry,
  createInquiry,
  updateInquiry,
  deleteInquiry,
  getInquiryStats,
  convertInquiry,
  addInquiryCommunication,
} = require('../controllers/inquiryController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { handleValidationErrors } = require('../middleware/validationMiddleware');

const router = express.Router();

// Validation rules
const createInquiryValidation = [
  body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address'),
  body('phone').matches(/^\+?[\d\s\-\(\)]+$/).withMessage('Please enter a valid phone number'),
  body('eventType').isIn(['wedding', 'engagement', 'corporate_event', 'private_celebration', 'bar_mitzvah', 'nonprofits', 'birthday_party', 'anniversary', 'other']).withMessage('Invalid event type'),
  body('eventDate').isISO8601().withMessage('Valid event date is required'),
  body('guestCount').isInt({ min: 1 }).withMessage('Guest count must be at least 1'),
  body('message').optional().isLength({ max: 2000 }).withMessage('Message cannot exceed 2000 characters'),
];

const updateInquiryValidation = [
  param('id').isMongoId().withMessage('Invalid inquiry ID'),
  body('status').optional().isIn(['new', 'contacted', 'qualified', 'proposal_sent', 'converted', 'lost', 'spam']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid assigned user ID'),
];

const inquiryIdValidation = [
  param('id').isMongoId().withMessage('Invalid inquiry ID'),
];

const convertInquiryValidation = [
  param('id').isMongoId().withMessage('Invalid inquiry ID'),
  body('createClient').optional().isBoolean().withMessage('createClient must be a boolean'),
  body('createEvent').optional().isBoolean().withMessage('createEvent must be a boolean'),
];

const communicationValidation = [
  param('id').isMongoId().withMessage('Invalid inquiry ID'),
  body('type').isIn(['email', 'phone', 'meeting', 'text', 'note']).withMessage('Invalid communication type'),
  body('direction').isIn(['inbound', 'outbound']).withMessage('Direction must be inbound or outbound'),
  body('subject').trim().isLength({ min: 1, max: 200 }).withMessage('Subject must be between 1 and 200 characters'),
  body('content').optional().isLength({ max: 5000 }).withMessage('Content cannot exceed 5000 characters'),
];

// Public route for creating inquiries (from website contact form)
router.post('/', optionalAuth, createInquiryValidation, handleValidationErrors, createInquiry);

// Protected routes
router.use(protect);

router.get('/', getInquiries);
router.get('/stats', getInquiryStats);
router.get('/:id', inquiryIdValidation, handleValidationErrors, getInquiry);
router.post('/:id/communications', communicationValidation, handleValidationErrors, addInquiryCommunication);
router.post('/:id/convert', convertInquiryValidation, handleValidationErrors, convertInquiry);
router.put('/:id', updateInquiryValidation, handleValidationErrors, updateInquiry);
router.delete('/:id', inquiryIdValidation, handleValidationErrors, deleteInquiry);

module.exports = router;
