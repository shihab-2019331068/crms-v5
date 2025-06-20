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

// Get all rooms for department admin
router.get(
  '/dashboard/department-admin/rooms',
  authenticateToken,
  authorizeRoles('department_admin'),
  deptAdminController.getRooms
);

// Delete a course (Department Admin only)
router.delete(
  '/dashboard/department-admin/course',
  authenticateToken,
  authorizeRoles('department_admin'),
  deptAdminController.deleteCourse
);

// Get all courses for a specific semester (Department Admin only)
router.get(
  '/dashboard/department-admin/semester/:semesterId/courses',
  authenticateToken,
  authorizeRoles('department_admin'),
  deptAdminController.getCoursesForSemester
);

// Get all teachers for department admin
router.get(
  '/dashboard/department-admin/teachers',
  authenticateToken,
  authorizeRoles('department_admin'),
  deptAdminController.getTeachers
);

// Assign teacher to course (Department Admin only)
router.post(
  '/dashboard/department-admin/assign-teacher',
  authenticateToken,
  authorizeRoles('department_admin'),
  deptAdminController.assignTeacherToCourse
);

// Set the session of a semester (Department Admin only)
router.post(
  '/dashboard/department-admin/semester/set-session',
  authenticateToken,
  authorizeRoles('department_admin'),
  deptAdminController.setSemesterSession
);

module.exports = router;
