const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Teacher dashboard
router.get('/dashboard/teacher', authenticateToken, authorizeRoles('teacher'), (req, res) => {
  res.json({ message: 'Teacher dashboard data' });
});

module.exports = router;
