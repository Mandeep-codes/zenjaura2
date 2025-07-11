import { body, query, param } from 'express-validator';

// Common validation rules
export const commonValidations = {
  id: param('id').isMongoId().withMessage('Invalid ID format'),
  
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],

  search: query('search').optional().isLength({ max: 100 }).withMessage('Search term too long'),

  email: body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  
  password: body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  name: body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
  
  price: body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  url: (field) => body(field).optional().isURL().withMessage(`${field} must be a valid URL`)
};

// Book validation rules
export const bookValidations = {
  create: [
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
    body('synopsis').trim().isLength({ min: 10, max: 2000 }).withMessage('Synopsis must be 10-2000 characters'),
    body('genre').isIn(['Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy', 'Biography', 'History', 'Self-Help', 'Business', 'Poetry', 'Children', 'Other']).withMessage('Invalid genre'),
    commonValidations.price,
    body('publishingPackage').isMongoId().withMessage('Invalid publishing package ID')
  ],

  update: [
    commonValidations.id,
    body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
    body('synopsis').optional().trim().isLength({ min: 10, max: 2000 }).withMessage('Synopsis must be 10-2000 characters'),
    body('status').optional().isIn(['pending', 'approved', 'rejected', 'published']).withMessage('Invalid status')
  ]
};

// Event validation rules
export const eventValidations = {
  create: [
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
    body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
    body('startDate').isISO8601().custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Start date must be in the future');
      }
      return true;
    }),
    body('endDate').isISO8601().custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
    body('location').trim().isLength({ min: 1, max: 200 }).withMessage('Location must be 1-200 characters'),
    body('maxAttendees').optional().isInt({ min: 0 }).withMessage('Max attendees must be a non-negative integer'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').isIn(['Workshop', 'Seminar', 'Book Launch', 'Reading', 'Conference', 'Other']).withMessage('Invalid category')
  ]
};

// User validation rules
export const userValidations = {
  register: [
    commonValidations.name,
    commonValidations.email,
    commonValidations.password
  ],

  login: [
    commonValidations.email,
    body('password').notEmpty().withMessage('Password is required')
  ],

  updateProfile: [
    body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
    body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters')
  ]
};

export default {
  commonValidations,
  bookValidations,
  eventValidations,
  userValidations
};