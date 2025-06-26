const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Department Admin: Add Course (must specify department, teacherId is not required)
exports.addCourse = async (req, res) => {
  const { name, code, credits, departmentId, isMajor, forDept, type } = req.body;
  const user = req.user;
  try {
    // Validate required fields
    if (!name || !code || !departmentId) {
      return res.status(400).json({ error: 'name, code, and departmentId are required.' });
    }
    if (typeof isMajor !== 'boolean') {
      return res.status(400).json({ error: 'isMajor (boolean) is required.' });
    }
    if (!forDept) {
      return res.status(400).json({ error: 'forDept (int) is required.' });
    }
    // Fetch the admin's user record
    const admin = await prisma.user.findUnique({
      where: { id: user.userId },
    });
    // Create the course in the specified department
    const course = await prisma.course.create({
      data: {
        name,
        code,
        credits,
        departmentId,
        isMajor,
        forDept,
        type
      },
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Department Admin: Get all courses for own department
exports.getCourses = async (req, res) => {
  // Read departmentId from query params, fallback to admin's department
  const reqDeptId = Number(req.query.departmentId);
  try {
    // Include teacher's name in the response
    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { forDept: reqDeptId },
          { departmentId: reqDeptId }
        ]
      },
      include: { teacher: { select: { id: true, name: true } } },
    });
    // Map to include teacherName for frontend compatibility
    const coursesWithTeacher = courses.map(course => ({
      ...course,
      teacherName: course.teacher ? course.teacher.name : null,
    }));
    res.status(200).json(coursesWithTeacher);
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
    // Delete the course
    await prisma.course.delete({ where: { id: courseId } });
    res.status(200).json({ message: 'Course deleted successfully.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Department Admin: Assign Teacher to Course
exports.assignTeacherToCourse = async (req, res) => {
  const { courseId, teacherId } = req.body;
  const user = req.user;
  try {
    // Validate required fields
    if (!courseId || !teacherId) {
      return res.status(400).json({ error: 'courseId and teacherId are required.' });
    }
    // Fetch the course and check department
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      return res.status(404).json({ error: 'Course not found.' });
    }
    // Fetch the teacher and check department
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
    });
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ error: 'Teacher not found or not in your department.' });
    }
    // Assign teacher to course
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: { teacherId },
    });
    res.status(200).json(updatedCourse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Department Admin: Get all courses for a specific semester (only for own department)
exports.getCoursesForSemester = async (req, res) => {
  const user = req.user;
  const { semesterId } = req.params;
  try {
    if (!semesterId) {
      return res.status(400).json({ error: 'semesterId is required.' });
    }
    const admin = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!admin || !admin.departmentId) {
      return res.status(403).json({ error: 'Department admin must belong to a department.' });
    }
    const semester = await prisma.semester.findUnique({
      where: { id: Number(semesterId) },
      include: { courses: true },
    });
    if (!semester || semester.departmentId !== admin.departmentId) {
      return res.status(403).json({ error: 'You can only view courses for semesters in your own department.' });
    }
    res.status(200).json(semester.courses);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Department Admin: Add Course to a Semester (only for own department)
exports.addCourseToSemester = async (req, res) => {
  const { semesterId, courseIds, courseId } = req.body;
  const user = req.user;
  try {
    // Accept either courseIds (array) or courseId (single)
    let courseIdList = [];
    if (Array.isArray(courseIds) && courseIds.length > 0) {
      courseIdList = courseIds.map(Number);
    } else if (courseId) {
      courseIdList = [Number(courseId)];
    }
    if (!semesterId || courseIdList.length === 0) {
      return res.status(400).json({ error: 'semesterId and at least one courseId are required.' });
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
    // Fetch all courses and check department
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIdList } },
    });
    if (courses.length !== courseIdList.length || courses.some(c => c.departmentId !== admin.departmentId)) {
      return res.status(403).json({ error: 'All courses must belong to your own department.' });
    }
    // Connect all courses to the semester
    const updatedSemester = await prisma.semester.update({
      where: { id: semesterId },
      data: {
        courses: {
          connect: courseIdList.map(id => ({ id })),
        },
      },
      include: { courses: true },
    });
    
    res.status(200).json(updatedSemester);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};