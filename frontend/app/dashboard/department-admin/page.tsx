"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

// Types
interface Course {
  id: number;
  name: string;
  code: string;
  credits: number;
  departmentId: number;
}
interface Semester {
  id: number;
  name: string;
  session: string;
  startDate: string;
  endDate: string;
  examStartDate: string;
  examEndDate: string;
  departmentId: number;
}
interface Room {
  id: number;
  roomNumber: string;
  capacity: number;
  status: string;
  departmentId: number;
}
interface WeeklySchedule {
  id: number;
  semesterId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  courseId?: number;
  roomId?: number;
  isBreak: boolean;
  breakName?: string;
}

export default function DepartmentAdminDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [weeklySchedules, setWeeklySchedules] = useState<WeeklySchedule[]>([]);
  const [activeForm, setActiveForm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Form states
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseCredits, setCourseCredits] = useState("");
  const [semesterName, setSemesterName] = useState("");
  const [semesterSession, setSemesterSession] = useState("");
  const [semesterStart, setSemesterStart] = useState("");
  const [semesterEnd, setSemesterEnd] = useState("");
  const [examStart, setExamStart] = useState("");
  const [examEnd, setExamEnd] = useState("");
  const [scheduleSemesterId, setScheduleSemesterId] = useState("");
  const [scheduleDay, setScheduleDay] = useState("");
  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleEnd, setScheduleEnd] = useState("");
  const [scheduleCourseId, setScheduleCourseId] = useState("");
  const [scheduleRoomId, setScheduleRoomId] = useState("");
  const [scheduleIsBreak, setScheduleIsBreak] = useState(false);
  const [scheduleBreakName, setScheduleBreakName] = useState("");
  const [addCourseSemesterId, setAddCourseSemesterId] = useState("");
  const [addCourseId, setAddCourseId] = useState("");
  const [departmentId, setDepartmentId] = useState<number | undefined>(undefined);

  // Fetch user details and set departmentId
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user?.email) return;
      try {
        const res = await api.get(`/user/${encodeURIComponent(user.email)}`);
        if (res.data && res.data.role === "department_admin") {
          setDepartmentId(res.data.departmentId);
        }
      } catch {
        setDepartmentId(undefined);
      }
    };
    fetchUserDetails();
  }, [user?.email]);

  // Fetch all data on mount
  useEffect(() => {
    if (!departmentId) return;
    fetchCourses();
    fetchSemesters();
    fetchRooms();
  }, [departmentId]);

  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<Course[]>("/dashboard/department-admin/courses", { withCredentials: true });
      console.log("Fetched courses:", res.data);
      setCourses(res.data);
    } catch {
      setError("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };
  const fetchSemesters = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<Semester[]>("/dashboard/department-admin/semesters", { withCredentials: true });
      console.log("Fetched semesters:", res.data);
      setSemesters(res.data);
    } catch {
      setError("Failed to fetch semesters");
    } finally {
      setLoading(false);
    }
  };
  const fetchRooms = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<Room[]>("/rooms", { withCredentials: true });
      console.log("Fetched rooms:", res.data);
      setRooms(res.data.filter(r => r.departmentId === departmentId));
    } catch {
      setError("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };
  const fetchWeeklySchedules = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<WeeklySchedule[]>("/dashboard/department-admin/weekly-schedules", { withCredentials: true });
      console.log("Fetched weekly-schedules:", res.data);
      setWeeklySchedules(res.data);
    } catch {
      setError("Failed to fetch weekly schedules");
    } finally {
      setLoading(false);
    }
  };

  // Handlers for forms
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/dashboard/department-admin/course", {
        name: courseName,
        code: courseCode,
        credits: Number(courseCredits),
        departmentId,
      }, { withCredentials: true });
      setSuccess("Course added successfully!");
      setCourseName(""); setCourseCode(""); setCourseCredits("");
      fetchCourses();
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to add course");
    } finally {
      setLoading(false);
    }
  };
  const handleAddSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/dashboard/department-admin/semester", {
        name: semesterName,
        session: semesterSession,
        startDate: semesterStart,
        endDate: semesterEnd,
        examStartDate: examStart,
        examEndDate: examEnd,
        departmentId,
      }, { withCredentials: true });
      setSuccess("Semester added successfully!");
      setSemesterName(""); setSemesterSession(""); setSemesterStart(""); setSemesterEnd(""); setExamStart(""); setExamEnd("");
      fetchSemesters();
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to add semester");
    } finally {
      setLoading(false);
    }
  };
  const handleAddWeeklySchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/dashboard/department-admin/weekly-schedule", {
        semesterId: Number(scheduleSemesterId),
        dayOfWeek: scheduleDay,
        startTime: scheduleStart,
        endTime: scheduleEnd,
        courseId: scheduleIsBreak ? undefined : Number(scheduleCourseId) || undefined,
        roomId: scheduleIsBreak ? undefined : Number(scheduleRoomId) || undefined,
        isBreak: scheduleIsBreak,
        breakName: scheduleIsBreak ? scheduleBreakName : undefined,
      }, { withCredentials: true });
      setSuccess("Weekly schedule added!");
      setScheduleSemesterId(""); setScheduleDay(""); setScheduleStart(""); setScheduleEnd(""); setScheduleCourseId(""); setScheduleRoomId(""); setScheduleIsBreak(false); setScheduleBreakName("");
      fetchWeeklySchedules();
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to add schedule");
    } finally {
      setLoading(false);
    }
  };
  const handleAddCourseToSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/dashboard/department-admin/semester/course", {
        semesterId: Number(addCourseSemesterId),
        courseId: Number(addCourseId),
      }, { withCredentials: true });
      setSuccess("Course added to semester!");
      setAddCourseSemesterId(""); setAddCourseId("");
      fetchSemesters();
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to add course to semester");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col justify-between bg-white dark:bg-gray-900 shadow-lg p-4 min-h-screen">
        <div className="space-y-4">
          <button className="btn btn-outline btn-sm w-full cursor-pointer" onClick={() => { setActiveForm("course"); setError(""); setSuccess(""); }}>Add Course</button>
          <button className="btn btn-outline btn-sm w-full cursor-pointer" onClick={() => { setActiveForm("semester"); setError(""); setSuccess(""); }}>Add Semester</button>
          <button className="btn btn-outline btn-sm w-full cursor-pointer" onClick={() => { setActiveForm("weekly"); setError(""); setSuccess(""); fetchWeeklySchedules(); }}>Add Weekly Schedule</button>
          <button className="btn btn-outline btn-sm w-full cursor-pointer" onClick={() => { setActiveForm("addCourseToSemester"); setError(""); setSuccess(""); }}>Add Course to Semester</button>
        </div>
        <div className="space-y-4 mt-8">
          <button className="btn btn-outline btn-sm w-full cursor-pointer" onClick={() => { setActiveForm("showCourses"); setError(""); setSuccess(""); fetchCourses(); }} disabled={loading}>Show All Courses</button>
          <button className="btn btn-outline btn-sm w-full cursor-pointer" onClick={() => { setActiveForm("showSemesters"); setError(""); setSuccess(""); fetchSemesters(); }} disabled={loading}>Show All Semesters</button>
          <button className="btn btn-outline btn-sm w-full cursor-pointer" onClick={() => { setActiveForm("showWeeklySchedules"); setError(""); setSuccess(""); fetchWeeklySchedules(); }} disabled={loading}>Show Weekly Schedules</button>
        </div>
        <div>
          <button className="btn btn-error btn-sm w-full cursor-pointer" onClick={() => { window.location.href = '/login'; }}>Logout</button>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-6">Welcome to SUST-CRMS, Mr. Department Admin</h1>
        <div className="w-full max-w-xl space-y-8">
          {activeForm === "course" && (
            <form onSubmit={handleAddCourse} className="bg-white dark:bg-gray-800 shadow rounded p-4 space-y-4">
              <h2 className="font-semibold text-lg">Add Course</h2>
              <input type="text" placeholder="Course Name" value={courseName} onChange={e => setCourseName(e.target.value)} className="input input-bordered w-full" required />
              <input type="text" placeholder="Course Code" value={courseCode} onChange={e => setCourseCode(e.target.value)} className="input input-bordered w-full" required />
              <input type="number" placeholder="Credits" value={courseCredits} onChange={e => setCourseCredits(e.target.value)} className="input input-bordered w-full" required />
              <button type="submit" className="btn btn-outline btn-sm mt-2 cursor-pointer" disabled={loading}>{loading ? "Adding..." : "Add Course"}</button>
            </form>
          )}
          {activeForm === "semester" && (
            <form onSubmit={handleAddSemester} className="bg-white dark:bg-gray-800 shadow rounded p-4 space-y-4">
              <h2 className="font-semibold text-lg">Add Semester</h2>
              <input type="text" placeholder="Semester Name" value={semesterName} onChange={e => setSemesterName(e.target.value)} className="input input-bordered w-full" required />
              <input type="text" placeholder="Session (e.g. 2025-2026)" value={semesterSession} onChange={e => setSemesterSession(e.target.value)} className="input input-bordered w-full" required />
              <input type="date" placeholder="Start Date" value={semesterStart} onChange={e => setSemesterStart(e.target.value)} className="input input-bordered w-full" required />
              <input type="date" placeholder="End Date" value={semesterEnd} onChange={e => setSemesterEnd(e.target.value)} className="input input-bordered w-full" required />
              <input type="date" placeholder="Exam Start Date" value={examStart} onChange={e => setExamStart(e.target.value)} className="input input-bordered w-full" required />
              <input type="date" placeholder="Exam End Date" value={examEnd} onChange={e => setExamEnd(e.target.value)} className="input input-bordered w-full" required />
              <button type="submit" className="btn btn-outline btn-sm mt-2 cursor-pointer" disabled={loading}>{loading ? "Adding..." : "Add Semester"}</button>
            </form>
          )}
          {activeForm === "weekly" && (
            <form onSubmit={handleAddWeeklySchedule} className="bg-white dark:bg-gray-800 shadow rounded p-4 space-y-4">
              <h2 className="font-semibold text-lg">Add Weekly Schedule</h2>
              <select value={scheduleSemesterId} onChange={e => setScheduleSemesterId(e.target.value)} className="input input-bordered w-full" required>
                <option value="" disabled>Select Semester</option>
                {semesters.map(s => (<option key={s.id} value={s.id}>{s.name} ({s.session})</option>))}
              </select>
              <select value={scheduleDay} onChange={e => setScheduleDay(e.target.value)} className="input input-bordered w-full" required>
                <option value="" disabled>Select Day</option>
                {['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'].map(day => (<option key={day} value={day}>{day}</option>))}
              </select>
              <input type="time" placeholder="Start Time" value={scheduleStart} onChange={e => setScheduleStart(e.target.value)} className="input input-bordered w-full" required />
              <input type="time" placeholder="End Time" value={scheduleEnd} onChange={e => setScheduleEnd(e.target.value)} className="input input-bordered w-full" required />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={scheduleIsBreak} onChange={e => setScheduleIsBreak(e.target.checked)} className="checkbox" />
                <span>Is Break?</span>
              </label>
              {!scheduleIsBreak && (
                <>
                  <select value={scheduleCourseId} onChange={e => setScheduleCourseId(e.target.value)} className="input input-bordered w-full" required>
                    <option value="" disabled>Select Course</option>
                    {courses.map(c => (<option key={c.id} value={c.id}>{c.name} ({c.code})</option>))}
                  </select>
                  <select value={scheduleRoomId} onChange={e => setScheduleRoomId(e.target.value)} className="input input-bordered w-full" required>
                    <option value="" disabled>Select Room</option>
                    {rooms.map(r => (<option key={r.id} value={r.id}>{r.roomNumber}</option>))}
                  </select>
                </>
              )}
              {scheduleIsBreak && (
                <input type="text" placeholder="Break Name" value={scheduleBreakName} onChange={e => setScheduleBreakName(e.target.value)} className="input input-bordered w-full" required />
              )}
              <button type="submit" className="btn btn-outline btn-sm mt-2 cursor-pointer" disabled={loading}>{loading ? "Adding..." : "Add Schedule"}</button>
            </form>
          )}
          {activeForm === "addCourseToSemester" && (
            <form onSubmit={handleAddCourseToSemester} className="bg-white dark:bg-gray-800 shadow rounded p-4 space-y-4">
              <h2 className="font-semibold text-lg">Add Course to Semester</h2>
              <select value={addCourseSemesterId} onChange={e => setAddCourseSemesterId(e.target.value)} className="input input-bordered w-full" required>
                <option value="" disabled>Select Semester</option>
                {semesters.map(s => (<option key={s.id} value={s.id}>{s.name} ({s.session})</option>))}
              </select>
              <select value={addCourseId} onChange={e => setAddCourseId(e.target.value)} className="input input-bordered w-full" required>
                <option value="" disabled>Select Course</option>
                {courses.map(c => (<option key={c.id} value={c.id}>{c.name} ({c.code})</option>))}
              </select>
              <button type="submit" className="btn btn-outline btn-sm mt-2 cursor-pointer" disabled={loading}>{loading ? "Adding..." : "Add Course to Semester"}</button>
            </form>
          )}
          {error && <div className="text-red-500 text-center">{error}</div>}
          {success && <div className="text-green-600 text-center">{success}</div>}
          {/* Lists */}
          {courses.length > 0 && activeForm === "showCourses" && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">All Courses</h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {courses.map(c => (<li key={c.id} className="py-2">{c.name} ({c.code}) - Credits: {c.credits}</li>))}
              </ul>
            </div>
          )}
          {semesters.length > 0 && activeForm === "showSemesters" && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">All Semesters</h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {semesters.map(s => (<li key={s.id} className="py-2">{s.name} ({s.session}) - {s.startDate} to {s.endDate}</li>))}
              </ul>
            </div>
          )}
          {weeklySchedules.length > 0 && activeForm === "showWeeklySchedules" && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Weekly Schedules</h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {weeklySchedules.map(ws => (
                  <li key={ws.id} className="py-2">
                    {ws.isBreak ? (
                      <span>Break: {ws.breakName} ({ws.dayOfWeek} {ws.startTime}-{ws.endTime})</span>
                    ) : (
                      <span>Course ID: {ws.courseId} | Room ID: {ws.roomId} | {ws.dayOfWeek} {ws.startTime}-{ws.endTime}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
