const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const superAdminController = require('../controllers/superAdminController');
const deptAdminController = require('../controllers/deptAdminController');
const studentController = require('../controllers/studentController');

// Role-specific dashboard routes have been moved to their respective files: studentRoutes.js, teacherRoutes.js, departmentAdminRoutes.js, superAdminRoutes.js

// Add any general/shared dashboard routes here if needed

module.exports = router;