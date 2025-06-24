const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Department Admin: Get all rooms for own department
exports.getRooms = async (req, res) => {
  const user = req.user;
  try {
    const admin = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!admin || !admin.departmentId) {
      return res.status(403).json({ error: 'Department admin must belong to a department.' });
    }
    const rooms = await prisma.room.findMany({ where: { departmentId: admin.departmentId } });

    console.log("Rooms for Department:", rooms);
    res.status(200).json(rooms);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Department Admin: Get all teachers for own department
exports.getTeachers = async (req, res) => {
  const user = req.user;
  try {
    const admin = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!admin || !admin.departmentId) {
      return res.status(403).json({ error: 'Department admin must belong to a department.' });
    }
    const teachers = await prisma.user.findMany({
      where: {
        departmentId: admin.departmentId,
        role: 'teacher',
      },
      select: {
        id: true,
        name: true,
      },
    });
    res.status(200).json(teachers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
