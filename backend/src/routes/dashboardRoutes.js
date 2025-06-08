const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const superAdminController = require('../controllers/superAdminController');
const deptAdminController = require('../controllers/deptAdminController');
const studentController = require('../controllers/studentController');

// Student dashboard
router.get('/dashboard/student', authenticateToken, authorizeRoles('student'), (req, res) => {
  res.json({ message: 'Student dashboard data' });
});

// Teacher dashboard
router.get('/dashboard/teacher', authenticateToken, authorizeRoles('teacher'), (req, res) => {
  res.json({ message: 'Teacher dashboard data' });
});

// Department Admin dashboard
router.get('/dashboard/department-admin', authenticateToken, authorizeRoles('department_admin'), (req, res) => {
  res.json({ message: 'Department Admin dashboard data' });
});

// Super Admin dashboard
router.get('/dashboard/super-admin', authenticateToken, authorizeRoles('super_admin'), (req, res) => {
  res.json({ message: 'Super Admin dashboard data' });
});

// Add new department (Super Admin only)
router.post(
  '/dashboard/super-admin/department',
  authenticateToken,
  authorizeRoles('super_admin'),
  superAdminController.addDepartment
);

// Add new room (Super Admin only)
router.post(
  '/dashboard/super-admin/room',
  authenticateToken,
  authorizeRoles('super_admin'),
  superAdminController.addRoom
);

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

// Student: Get all current courses in their semester (same department and session)
router.get(
  '/dashboard/student/courses',
  authenticateToken,
  authorizeRoles('student'),
  studentController.getCurrentCourses
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