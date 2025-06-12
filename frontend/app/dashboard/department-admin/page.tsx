"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import {
  fetchCourses as fetchCoursesHandler,
  fetchSemesters as fetchSemestersHandler,
  fetchRooms as fetchRoomsHandler,
  fetchWeeklySchedules as fetchWeeklySchedulesHandler,
  handleAddCourse as handleAddCourseHandler,
  handleAddWeeklySchedule as handleAddWeeklyScheduleHandler,
  handleAddCourseToSemester as handleAddCourseToSemesterHandler,
  Course,
  Semester,
  Room,
  WeeklySchedule
} from "./deptAdminHandlers";

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
    fetchCoursesHandler(setLoading, setError, setCourses);
    fetchSemestersHandler(setLoading, setError, setSemesters);
    fetchRoomsHandler(setLoading, setError, setRooms, departmentId);
  }, [departmentId]);

  // Handler wrappers
  const fetchCourses = () => fetchCoursesHandler(setLoading, setError, setCourses);
  const fetchSemesters = () => fetchSemestersHandler(setLoading, setError, setSemesters);
  const fetchRooms = () => fetchRoomsHandler(setLoading, setError, setRooms, departmentId);
  const fetchWeeklySchedules = () => fetchWeeklySchedulesHandler(setLoading, setError, setWeeklySchedules);

  const handleAddCourse = (e: React.FormEvent) => handleAddCourseHandler(
    e, setLoading, setError, setSuccess, courseName, courseCode, courseCredits, departmentId, setCourseName, setCourseCode, setCourseCredits, fetchCourses
  );
  const handleAddWeeklySchedule = (e: React.FormEvent) => handleAddWeeklyScheduleHandler(
    e, setLoading, setError, setSuccess, scheduleSemesterId, scheduleDay, scheduleStart, scheduleEnd, scheduleIsBreak, scheduleCourseId, scheduleRoomId, scheduleBreakName, setScheduleSemesterId, setScheduleDay, setScheduleStart, setScheduleEnd, setScheduleCourseId, setScheduleRoomId, setScheduleIsBreak, setScheduleBreakName, fetchWeeklySchedules
  );
  const handleAddCourseToSemester = (e: React.FormEvent) => handleAddCourseToSemesterHandler(
    e, setLoading, setError, setSuccess, addCourseSemesterId, addCourseId, setAddCourseSemesterId, setAddCourseId, fetchSemesters
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col justify-between bg-white dark:bg-gray-900 shadow-lg p-4 min-h-screen">
        <div className="space-y-4">
          <button className="btn btn-outline btn-sm w-full cursor-pointer" onClick={() => { setActiveForm("course"); setError(""); setSuccess(""); }}>Add Course</button>
          <button className="btn btn-outline btn-sm w-full cursor-pointer" onClick={() => { setActiveForm("weekly"); setError(""); setSuccess(""); fetchWeeklySchedulesHandler(setLoading, setError, setWeeklySchedules); }}>Add Weekly Schedule</button>
          <button className="btn btn-outline btn-sm w-full cursor-pointer" onClick={() => { setActiveForm("addCourseToSemester"); setError(""); setSuccess(""); }}>Add Course to Semester</button>
        </div>
        <div className="space-y-4 mt-8">
          <button className="btn btn-outline btn-sm w-full cursor-pointer" onClick={() => { setActiveForm("showCourses"); setError(""); setSuccess(""); fetchCoursesHandler(setLoading, setError, setCourses); }} disabled={loading}>Show All Courses</button>
          <button className="btn btn-outline btn-sm w-full cursor-pointer" onClick={() => { setActiveForm("showSemesters"); setError(""); setSuccess(""); fetchSemestersHandler(setLoading, setError, setSemesters); }} disabled={loading}>Show All Semesters</button>
          <button className="btn btn-outline btn-sm w-full cursor-pointer" onClick={() => { setActiveForm("showWeeklySchedules"); setError(""); setSuccess(""); fetchWeeklySchedulesHandler(setLoading, setError, setWeeklySchedules); }} disabled={loading}>Show Weekly Schedules</button>
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
            <form onSubmit={(e) => handleAddCourseHandler(
              e, setLoading, setError, setSuccess, courseName, courseCode, courseCredits, departmentId, setCourseName, setCourseCode, setCourseCredits, () => fetchCoursesHandler(setLoading, setError, setCourses)
            )} className="bg-white dark:bg-gray-800 shadow rounded p-4 space-y-4">
              <h2 className="font-semibold text-lg">Add Course</h2>
              <input type="text" placeholder="Course Name" value={courseName} onChange={e => setCourseName(e.target.value)} className="input input-bordered w-full" required />
              <input type="text" placeholder="Course Code" value={courseCode} onChange={e => setCourseCode(e.target.value)} className="input input-bordered w-full" required />
              <input type="number" placeholder="Credits" value={courseCredits} onChange={e => setCourseCredits(e.target.value)} className="input input-bordered w-full" required />
              <button type="submit" className="btn btn-outline btn-sm mt-2 cursor-pointer" disabled={loading}>{loading ? "Adding..." : "Add Course"}</button>
            </form>
          )}
          {activeForm === "weekly" && (
            <form onSubmit={(e) => handleAddWeeklyScheduleHandler(
              e, setLoading, setError, setSuccess, scheduleSemesterId, scheduleDay, scheduleStart, scheduleEnd, scheduleIsBreak, scheduleCourseId, scheduleRoomId, scheduleBreakName, setScheduleSemesterId, setScheduleDay, setScheduleStart, setScheduleEnd, setScheduleCourseId, setScheduleRoomId, setScheduleIsBreak, setScheduleBreakName, () => fetchWeeklySchedulesHandler(setLoading, setError, setWeeklySchedules)
            )} className="bg-white dark:bg-gray-800 shadow rounded p-4 space-y-4">
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
            <form onSubmit={(e) => handleAddCourseToSemesterHandler(
              e, setLoading, setError, setSuccess, addCourseSemesterId, addCourseId, setAddCourseSemesterId, setAddCourseId, () => fetchSemestersHandler(setLoading, setError, setSemesters)
            )} className="bg-white dark:bg-gray-800 shadow rounded p-4 space-y-4">
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
