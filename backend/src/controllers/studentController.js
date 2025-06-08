const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Student: Get all current courses in their semester (same department and session)
exports.getCurrentCourses = async (req, res) => {
  const user = req.user;
  try {
    // Fetch the student user from DB to get departmentId and session
    const student = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { departmentId: true, session: true }
    });
    if (!student || !student.departmentId || !student.session) {
      return res.status(400).json({ error: 'Student must have department and session.' });
    }

    
    // Find the semester for this department and session
    const semester = await prisma.semester.findFirst({
      where: {
        departmentId: student.departmentId,
        session: student.session
      },
      orderBy: { startDate: 'desc' } // get the latest if multiple
    });
    
    if (!semester) {
      return res.status(404).json({ error: 'No semester found for your department and session.' });
    }
    // Get all courses in this semester
    const courses = await prisma.course.findMany({
      where: {
        semesters: {
          some: { id: semester.id }
        }
      },
      select: {
        id: true,
        name: true,
        code: true,
        credits: true,
        teacher: { select: { id: true, name: true, email: true } },
        department: { select: { id: true, name: true } }
      }
    });
    res.json({ semester: { id: semester.id, name: semester.name, session: semester.session }, courses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
