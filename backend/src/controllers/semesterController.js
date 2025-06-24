const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Department Admin: Add Semester (must specify department, only for own department)
exports.addSemester = async (req, res) => {
  const { name, session, startDate, endDate, examStartDate, examEndDate, departmentId } = req.body;
  const user = req.user;
  try {
    // Validate required fields
    if (!name || !session || !startDate || !endDate || !examStartDate || !examEndDate || !departmentId) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    // Fetch the admin's user record
    const admin = await prisma.user.findUnique({
      where: { id: user.userId },
    });
    if (!admin || !admin.departmentId) {
      return res.status(403).json({ error: 'Department admin must belong to a department.' });
    }
    if (admin.departmentId !== departmentId) {
      return res.status(403).json({ error: 'You can only add semesters to your own department.' });
    }
    // Create the semester
    const semester = await prisma.semester.create({
      data: {
        name,
        session,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        examStartDate: new Date(examStartDate),
        examEndDate: new Date(examEndDate),
        departmentId
      },
    });
    res.status(201).json(semester);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Department Admin: Get all semesters for own department
exports.getSemesters = async (req, res) => {
  // Read departmentId from query params, fallback to admin's department
  const reqDeptId = Number(req.query.departmentId);
  
  try {
    const semesters = await prisma.semester.findMany({ where: { departmentId: reqDeptId } });


    res.status(200).json(semesters);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Department Admin: Set the session of a semester
exports.setSemesterSession = async (req, res) => {
  const { semesterId, session } = req.body;
  const user = req.user;
  try {
    if (!semesterId || !session) {
      return res.status(400).json({ error: 'semesterId and session are required.' });
    }
    // Validate session format (e.g., 2019-2020)
    if (!/^\d{4}-\d{4}$/.test(session)) {
      return res.status(400).json({ error: 'Session must be in the format YYYY-YYYY.' });
    }
    // Fetch the admin's user record
    const admin = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!admin || !admin.departmentId) {
      return res.status(403).json({ error: 'Department admin must belong to a department.' });
    }
    // Fetch the semester and check department
    const semester = await prisma.semester.findUnique({ where: { id: Number(semesterId) } });
    if (!semester || semester.departmentId !== admin.departmentId) {
      return res.status(403).json({ error: 'You can only update semesters in your own department.' });
    }
    // Update the session
    const updatedSemester = await prisma.semester.update({
      where: { id: Number(semesterId) },
      data: { session },
    });
    res.status(200).json(updatedSemester);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
