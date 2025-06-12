const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const deptAdminController = require('../controllers/deptAdminController');

// Department Admin dashboard
router.get('/dashboard/department-admin', authenticateToken, authorizeRoles('department_admin'), (req, res) => {
  res.json({ message: 'Department Admin dashboard data' });
});

// Add new course (Department Admin only)
router.post(
  '/dashboard/department-admin/course',
  authenticateToken,
  authorizeRoles('department_admin'),
  deptAdminController.addCourse
);

// Add new semester (Department Admin only)
router.post(
  '/dashboard/department-admin/semester',
  authenticateToken,
  authorizeRoles('department_admin'),
  deptAdminController.addSemester
);

// Add new weekly schedule (Department Admin only)
router.post(
  '/dashboard/department-admin/weekly-schedule',
  authenticateToken,
  authorizeRoles('department_admin'),
  deptAdminController.addWeeklySchedule
);

// Add course to semester (Department Admin only)
router.post(
  '/dashboard/department-admin/semester/course',
  authenticateToken,
  authorizeRoles('department_admin'),
  deptAdminController.addCourseToSemester
);

// Get all courses for department admin
router.get(
  '/dashboard/department-admin/courses',
  authenticateToken,
  authorizeRoles('department_admin'),
  deptAdminController.getCourses
);

// Get all semesters for department admin
router.get(
  '/dashboard/department-admin/semesters',
  authenticateToken,
  authorizeRoles('department_admin'),
  deptAdminController.getSemesters
);

// Get all weekly schedules for department admin
router.get(
  '/dashboard/department-admin/weekly-schedules',
  authenticateToken,
  authorizeRoles('department_admin'),
  deptAdminController.getWeeklySchedules
);

module.exports = router;
