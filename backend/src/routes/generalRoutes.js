const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all rooms (Prisma)
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        department: {
          select: { acronym: true }
        }
      }
    });
    // Map to include departmentAcronym at top level
    const roomsWithAcronym = rooms.map(room => ({
      ...room,
      departmentAcronym: room.department?.acronym || null,
      department: undefined // Remove nested department
    }));
    res.json(roomsWithAcronym);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all departments (Prisma)
router.get('/departments', async (req, res) => {
  try {
    const departments = await prisma.department.findMany();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user details by email (Prisma)
router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get department by ID (Prisma)
router.get('/department/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const department = await prisma.department.findUnique({
      where: { id: parseInt(id, 10) },
    });
    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
