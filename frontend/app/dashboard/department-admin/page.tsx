"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import {
  fetchCourses as fetchCoursesHandler,
  fetchSemesters as fetchSemestersHandler,
  handleAddCourse as handleAddCourseHandler,
  handleAddCourseToSemester as handleAddCourseToSemesterHandler,
  handleDeleteCourse as handleDeleteCourseHandler,
  fetchRooms as fetchRoomsHandler, // import fetchRooms
  Course,
  Semester,
  Room
} from "./deptAdminHandlers";

export default function DepartmentAdminDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeForm, setActiveForm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // Form states
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseCredits, setCourseCredits] = useState("");
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
  

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col justify-between sidebar-dark shadow-lg p-4 min-h-screen">
        <div className="space-y-4">
          <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { setActiveForm("course"); setError(""); setSuccess(""); }}>Add Course</button>
          <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { setActiveForm("addCourseToSemester"); setError(""); setSuccess(""); }}>Add Course to Semester</button>
        </div>
        <div className="space-y-4 mt-8">
          <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { setActiveForm("showCourses"); setError(""); setSuccess(""); fetchCoursesHandler(setLoading, setError, setCourses); }} disabled={loading}>Show All Courses</button>
          <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { setActiveForm("showSemesters"); setError(""); setSuccess(""); fetchSemestersHandler(setLoading, setError, setSemesters); }} disabled={loading}>Show All Semesters</button>
          <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { setActiveForm("showRooms"); setError(""); setSuccess(""); fetchRoomsHandler(setLoading, setError, setRooms); }} disabled={loading}>Show All Rooms</button>
        </div>
        <div>
          <button className="btn btn-error btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { window.location.href = '/login'; }}>Logout</button>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-6">Welcome to SUST-CRMS, Mr. Department Admin</h1>
        <div className="w-full max-w-xl space-y-8">
          {activeForm === "course" && (
            <form onSubmit={(e) => handleAddCourseHandler(
              e, setLoading, setError, setSuccess, courseName, courseCode, courseCredits, departmentId, setCourseName, setCourseCode, setCourseCredits, () => fetchCoursesHandler(setLoading, setError, setCourses)
            )} className="bg-white dark:bg-gray-800 shadow rounded p-4 space-y-4 form-bg-dark">
              <h2 className="font-semibold text-lg">Add Course</h2>
              <input type="text" placeholder="Course Name" value={courseName} onChange={e => setCourseName(e.target.value)} className="input input-bordered w-full" required />
              <input type="text" placeholder="Course Code" value={courseCode} onChange={e => setCourseCode(e.target.value)} className="input input-bordered w-full" required />
              <input type="number" placeholder="Credits" value={courseCredits} onChange={e => setCourseCredits(e.target.value)} className="input input-bordered w-full" required />
              <button type="submit" className="btn btn-outline btn-sm mt-2 cursor-pointer custom-bordered-btn" disabled={loading}>{loading ? "Adding..." : "Add Course"}</button>
            </form>
          )}
          {activeForm === "addCourseToSemester" && (
            <form onSubmit={(e) => handleAddCourseToSemesterHandler(
              e, setLoading, setError, setSuccess, addCourseSemesterId, addCourseId, setAddCourseSemesterId, setAddCourseId, () => fetchSemestersHandler(setLoading, setError, setSemesters)
            )} className="bg-white dark:bg-gray-800 shadow rounded p-4 space-y-4 form-bg-dark">
              <h2 className="font-semibold text-lg">Add Course to Semester</h2>
              <select value={addCourseSemesterId} onChange={e => setAddCourseSemesterId(e.target.value)} className="input input-bordered w-full form-bg-dark" required>
                <option value="" disabled>Select Semester</option>
                {semesters.map(s => (<option key={s.id} value={s.id}>{s.name} ({s.session})</option>))}
              </select>
              <select value={addCourseId} onChange={e => setAddCourseId(e.target.value)} className="input input-bordered w-full form-bg-dark" required>
                <option value="" disabled>Select Course</option>
                {courses.map(c => (<option key={c.id} value={c.id}>{c.name} ({c.code})</option>))}
              </select>
              <button type="submit" className="btn btn-outline btn-sm mt-2 cursor-pointer custom-bordered-btn" disabled={loading}>{loading ? "Adding..." : "Add Course to Semester"}</button>
            </form>
          )}
          {error && <div className="text-red-500 text-center">{error}</div>}
          {success && <div className="text-green-600 text-center">{success}</div>}
          {/* Lists */}
          {courses.length > 0 && activeForm === "showCourses" && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">All Courses</h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {courses.map(c => (
                  <li key={c.id} className="py-2 flex items-center justify-between">
                    <span>{c.name} ({c.code}) - Credits: {c.credits}</span>
                    <button
                      className="btn btn-outline btn-sm cursor-pointer custom-bordered-btn"
                      disabled={loading}
                      onClick={() => handleDeleteCourseHandler(
                        c.id,
                        setLoading,
                        setError,
                        setSuccess,
                        () => fetchCoursesHandler(setLoading, setError, setCourses)
                      )}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {semesters.length > 0 && activeForm === "showSemesters" && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">All Semesters</h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {semesters.map(s => (<li key={s.id} className="py-2">{s.name} ({s.session})</li>))}
              </ul>
            </div>
          )}
          {rooms.length > 0 && activeForm === "showRooms" && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">All Rooms</h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {rooms.map(r => (
                  <li key={r.id} className="py-2">{r.roomNumber}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
