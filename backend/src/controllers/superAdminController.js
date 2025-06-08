const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.addDepartment = async (req, res) => {
  const { name, headId } = req.body;
  try {
    const department = await prisma.department.create({
      data: {
        name,
        headId: headId || null,
      },
    });
    res.status(201).json(department);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.addRoom = async (req, res) => {
  const { roomNumber, capacity, status, departmentId } = req.body;
  try {
    const room = await prisma.room.create({
      data: {
        roomNumber,
        capacity,
        status,
        departmentId,
      },
    });
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
