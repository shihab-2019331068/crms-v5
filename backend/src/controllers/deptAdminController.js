const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Department Admin: Add Course (must specify department, teacherId is not required)
exports.addCourse = async (req, res) => {
  const { name, code, credits, departmentId } = req.body;
  const user = req.user;
  try {
    // Validate required fields
    if (!name || !code || !departmentId) {
      return res.status(400).json({ error: 'name, code, and departmentId are required.' });
    }
    // Fetch the admin's user record
    const admin = await prisma.user.findUnique({
      where: { id: user.userId },
    });
    if (!admin || !admin.departmentId) {
      return res.status(403).json({ error: 'Department admin must belong to a department.' });
    }
    // Check if admin belongs to the department they are adding the course to
    if (admin.departmentId !== departmentId) {
      return res.status(403).json({ error: 'You can only add courses to your own department.' });
    }
    // Create the course in the specified department
    const course = await prisma.course.create({
      data: {
        name,
        code,
        credits,
        departmentId
      },
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

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

// Department Admin: Add Weekly Schedule (Routine) for a Semester
exports.addWeeklySchedule = async (req, res) => {
  const { semesterId, dayOfWeek, startTime, endTime, courseId, labId, roomId, isBreak, breakName } = req.body;
  const user = req.user;
  try {
    // Validate required fields
    if (!semesterId || !dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({ error: 'semesterId, dayOfWeek, startTime, and endTime are required.' });
    }
    // Fetch the admin's user record
    const admin = await prisma.user.findUnique({
      where: { id: user.userId },
    });
    if (!admin || !admin.departmentId) {
      return res.status(403).json({ error: 'Department admin must belong to a department.' });
    }
    // Fetch the semester and check department
    const semester = await prisma.semester.findUnique({
      where: { id: semesterId },
    });
    if (!semester || semester.departmentId !== admin.departmentId) {
      return res.status(403).json({ error: 'You can only add routines to semesters in your own department.' });
    }
    // Create the weekly schedule
    const weeklySchedule = await prisma.weeklySchedule.create({
      data: {
        semesterId,
        dayOfWeek,
        startTime,
        endTime,
        courseId: courseId || null,
        labId: labId || null,
        roomId: roomId || null,
        isBreak: isBreak || false,
        breakName: breakName || null
      },
    });
    res.status(201).json(weeklySchedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Department Admin: Add Course to a Semester (only for own department)
exports.addCourseToSemester = async (req, res) => {
  const { semesterId, courseId } = req.body;
  const user = req.user;
  try {
    // Validate required fields
    if (!semesterId || !courseId) {
      return res.status(400).json({ error: 'semesterId and courseId are required.' });
    }
    // Fetch the admin's user record
    const admin = await prisma.user.findUnique({
      where: { id: user.userId },
    });
    if (!admin || !admin.departmentId) {
      return res.status(403).json({ error: 'Department admin must belong to a department.' });
    }
    // Fetch the semester and check department
    const semester = await prisma.semester.findUnique({
      where: { id: semesterId },
    });
    if (!semester || semester.departmentId !== admin.departmentId) {
      return res.status(403).json({ error: 'You can only add courses to semesters in your own department.' });
    }
    // Fetch the course and check department
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course || course.departmentId !== admin.departmentId) {
      return res.status(403).json({ error: 'You can only add courses from your own department.' });
    }
    // Connect the course to the semester
    const updatedSemester = await prisma.semester.update({
      where: { id: semesterId },
      data: {
        courses: {
          connect: { id: courseId },
        },
      },
      include: { courses: true },
    });
    res.status(200).json(updatedSemester);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Department Admin: Get all courses for own department
exports.getCourses = async (req, res) => {
  const user = req.user;
  
  try {
    const admin = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!admin || !admin.departmentId) {
      return res.status(403).json({ error: 'Department admin must belong to a department.' });
    }
    const courses = await prisma.course.findMany({ where: { departmentId: admin.departmentId } });

    res.status(200).json(courses);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Department Admin: Get all semesters for own department
exports.getSemesters = async (req, res) => {
  const user = req.user;
  
  try {
    const admin = await prisma.user.findUnique({ where: { id: user.userId } });

    // console.log("Admin Record:", admin);
    
    if (!admin || !admin.departmentId) {
      return res.status(403).json({ error: 'Department admin must belong to a department.' });
    }
    const semesters = await prisma.semester.findMany({ where: { departmentId: admin.departmentId } });

    // console.log(semesters);


    res.status(200).json(semesters);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Department Admin: Get all weekly schedules for own department
exports.getWeeklySchedules = async (req, res) => {
  const user = req.user;
  try {
    const admin = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!admin || !admin.departmentId) {
      return res.status(403).json({ error: 'Department admin must belong to a department.' });
    }
    // Get all semesters for the department
    const semesters = await prisma.semester.findMany({ where: { departmentId: admin.departmentId } });
    const semesterIds = semesters.map(s => s.id);
    // Get all weekly schedules for those semesters
    const weeklySchedules = await prisma.weeklySchedule.findMany({ where: { semesterId: { in: semesterIds } } });
    res.status(200).json(weeklySchedules);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Department Admin: Delete a Course (only from own department)
exports.deleteCourse = async (req, res) => {
  const { courseId } = req.body;
  const user = req.user;
  try {
    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required.' });
    }
    // Fetch the admin's user record
    const admin = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!admin || !admin.departmentId) {
      return res.status(403).json({ error: 'Department admin must belong to a department.' });
    }
    // Fetch the course and check department
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.departmentId !== admin.departmentId) {
      return res.status(403).json({ error: 'You can only delete courses from your own department.' });
    }
    // Delete the course
    await prisma.course.delete({ where: { id: courseId } });
    res.status(200).json({ message: 'Course deleted successfully.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


