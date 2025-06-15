const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get weekly schedule by room
exports.getByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const schedules = await prisma.weeklySchedule.findMany({
      where: { roomId: Number(roomId) },
      include: { course: true, lab: true, semester: true, room: true },
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get weekly schedule by semester
exports.getBySemester = async (req, res) => {
  try {
    const { semesterId } = req.params;
    const schedules = await prisma.weeklySchedule.findMany({
      where: { semesterId: Number(semesterId) },
      include: { course: true, lab: true, semester: true, room: true },
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get weekly schedule by teacher
exports.getByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    // Find all courses taught by this teacher
    const courses = await prisma.course.findMany({
      where: { teacherId: Number(teacherId) },
      select: { id: true },
    });
    const courseIds = courses.map(c => c.id);
    const schedules = await prisma.weeklySchedule.findMany({
      where: { courseId: { in: courseIds } },
      include: { course: true, lab: true, semester: true, room: true },
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get weekly schedule by course
exports.getByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const schedules = await prisma.weeklySchedule.findMany({
      where: { courseId: Number(courseId) },
      include: { course: true, lab: true, semester: true, room: true },
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate a weekly routine: now just saves a finalized routine from frontend
exports.generateWeeklyRoutine = async (req, res) => {
  const { routine } = req.body;
  if (!Array.isArray(routine) || routine.length === 0) {
    return res.status(400).json({ error: 'Routine array is required.' });
  }
  try {
    // Delete all existing weeklySchedules for the same departmentId
    const departmentId = routine[0]?.departmentId;
    if (!departmentId) {
      return res.status(400).json({ error: 'departmentId is required in routine entries.' });
    }
    await prisma.weeklySchedule.deleteMany({ where: { departmentId } });
    // Save all entries in bulk
    const created = await prisma.weeklySchedule.createMany({ data: routine });
    res.status(201).json({ message: 'Routine saved.', createdCount: created.count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Preview generated weekly routine for a department (does not save to DB)
exports.previewWeeklyRoutine = async (req, res) => {
  const { departmentId } = req.body;
  if (!departmentId) {
    return res.status(400).json({ error: 'departmentId is required.' });
  }
  try {
    // 1. Get all semesters for the department
    const semesters = await prisma.semester.findMany({ where: { departmentId: Number(departmentId) } });
    if (!semesters.length) return res.status(404).json({ error: 'No semesters found for department.' });
    const semesterIds = semesters.map(s => s.id);

    // 2. Get all courses for the department (with teacher and semester info)
    const courses = await prisma.course.findMany({
      where: { departmentId: Number(departmentId), teacherId: { not: null }, semesterId: { not: null } },
      include: { teacher: true, semester: true }
    });
    if (!courses.length) return res.status(404).json({ error: 'No courses with assigned teachers/semesters.' });

    // 3. Get all rooms for the department
    const rooms = await prisma.room.findMany({ where: { departmentId: Number(departmentId), status: 'AVAILABLE' } });
    if (!rooms.length) return res.status(404).json({ error: 'No available rooms for department.' });

    // 4. Prepare time slots (e.g., 8am-5pm, 1hr slots, Sun-Thu)
    const days = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY'];
    const timeSlots = [];
    for (let hour = 8; hour < 17; hour++) {
      const start = hour.toString().padStart(2, '0') + ':00';
      const end = (hour+1).toString().padStart(2, '0') + ':00';
      timeSlots.push({ start, end });
    }

    // 5. Track assignments to avoid conflicts
    const teacherBusy = {};
    const roomBusy = {};
    const semesterBusy = {};
    const routine = [];

    // 6. Assign each course to required number of slots per week
    // Track how many assignments per day for balancing
    const dayAssignmentCount = {};
    days.forEach(day => { dayAssignmentCount[day] = 0; });
    for (const course of courses) {
      let requiredClasses = course.credits;
      let assignedCount = 0;
      let usedDaySlots = new Set();
      while (assignedCount < requiredClasses) {
        const availableDays = days.filter(day => !usedDaySlots.has(day));
        if (!availableDays.length) break;
        let minDay = availableDays[0];
        for (const day of availableDays) {
          if (dayAssignmentCount[day] < dayAssignmentCount[minDay]) minDay = day;
        }
        let slotAssigned = false;
        for (const slot of timeSlots) {
          const tBusy = teacherBusy[course.teacherId]?.[minDay] || [];
          const sBusy = semesterBusy[course.semesterId]?.[minDay] || [];
          const rCandidates = rooms.filter(room => {
            const rBusy = roomBusy[room.id]?.[minDay] || [];
            return !rBusy.includes(slot.start);
          });
          if (!tBusy.includes(slot.start) && !sBusy.includes(slot.start) && rCandidates.length) {
            const room = rCandidates[0];
            teacherBusy[course.teacherId] = teacherBusy[course.teacherId] || {};
            teacherBusy[course.teacherId][minDay] = [...tBusy, slot.start];
            roomBusy[room.id] = roomBusy[room.id] || {};
            roomBusy[room.id][minDay] = [...(roomBusy[room.id][minDay] || []), slot.start];
            semesterBusy[course.semesterId] = semesterBusy[course.semesterId] || {};
            semesterBusy[course.semesterId][minDay] = [...sBusy, slot.start];
            routine.push({
              semesterId: course.semesterId,
              departmentId: Number(departmentId),
              dayOfWeek: minDay,
              startTime: slot.start,
              endTime: slot.end,
              courseId: course.id,
              roomId: room.id,
              isBreak: false
            });
            assignedCount++;
            dayAssignmentCount[minDay]++;
            usedDaySlots.add(minDay);
            slotAssigned = true;
            break;
          }
        }
        if (!slotAssigned) {
          usedDaySlots.add(minDay);
        }
      }
      if (assignedCount < requiredClasses) {
        routine.push({
          semesterId: course.semesterId,
          departmentId: Number(departmentId),
          dayOfWeek: null,
          startTime: null,
          endTime: null,
          courseId: course.id,
          roomId: null,
          isBreak: false,
          note: `Could not assign all required classes (${assignedCount}/${requiredClasses}).`
        });
      }
    }

    // 7. Return generated routine (do not save)
    res.status(200).json({ routine: routine.filter(r => r.dayOfWeek), unassigned: routine.filter(r => !r.dayOfWeek) });
    // console.log('Routine preview generated successfully.', routine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get the final routine for a department (read-only, for display)
exports.getFinalRoutine = async (req, res) => {
  const { departmentId } = req.query;
  if (!departmentId) {
    return res.status(400).json({ error: 'departmentId is required.' });
  }
  try {
    // Get all semesters for the department
    const semesters = await prisma.semester.findMany({ where: { departmentId: Number(departmentId) } });
    if (!semesters.length) return res.status(404).json({ error: 'No semesters found for department.' });
    const semesterIds = semesters.map(s => s.id);

    // Get all weekly schedule entries for these semesters
    const routine = await prisma.weeklySchedule.findMany({
      where: { semesterId: { in: semesterIds } },
      orderBy: [{ startTime: 'asc' }],
    });
    res.status(200).json({ routine });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



