"use client";
import { useState } from "react";
import api from "@/services/api";

interface StudentProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  department?: string;
  session?: string;
}

interface Course {
  id: number;
  name: string;
  code: string;
  teacher?: string;
  // ...add more fields as needed
}

export default function StudentDashboard() {
  const [activeView, setActiveView] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dashboardData, setDashboardData] = useState<object | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setDashboardData(null);
    try {
      const res = await api.get("/dashboard/student", { withCredentials: true });
      setDashboardData(res.data);
      setActiveView("dashboard");
    } catch {
      setError("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setProfile(null);
    try {
      const res = await api.get("/me", { withCredentials: true });
      setProfile(res.data);
      setActiveView("profile");
    } catch {
      setError("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    setCourses([]);
    try {
      const res = await api.get("/dashboard/student/courses", { withCredentials: true });

      const data = Array.isArray(res.data.courses) ? res.data.courses : [];
      setCourses(data);
      setActiveView("courses");
    } catch {
      setError("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col justify-between bg-white dark:bg-gray-900 shadow-lg p-4 min-h-screen">
        <div className="space-y-4">
          <button
            className="btn btn-outline btn-sm w-full cursor-pointer"
            onClick={fetchDashboard}
            disabled={loading}
          >
            Dashboard
          </button>
          <button
            className="btn btn-outline btn-sm w-full cursor-pointer"
            onClick={fetchProfile}
            disabled={loading}
          >
            Profile
          </button>
          <button
            className="btn btn-outline btn-sm w-full cursor-pointer"
            onClick={fetchCourses}
            disabled={loading}
          >
            Current Courses
          </button>
        </div>
        <div>
          <button
            className="btn btn-error btn-sm w-full cursor-pointer"
            onClick={() => {
              window.location.href = '/login';
            }}
          >
            Logout
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-6">Welcome to SUST-CRMS, Mr. Student</h1>
        <div className="w-full max-w-xl space-y-8">
          {error && <div className="text-red-500 text-center">{error}</div>}
          {success && <div className="text-green-600 text-center">{success}</div>}
          {loading && <div className="text-center">Loading...</div>}
          {/* Dashboard View */}
          {activeView === "dashboard" && dashboardData && (
            <div className="bg-white dark:bg-gray-800 shadow rounded p-4">
              <h2 className="font-semibold text-lg mb-2">Student Dashboard</h2>
              <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(dashboardData, null, 2)}</pre>
            </div>
          )}
          {/* Profile View */}
          {activeView === "profile" && profile && (
            <div className="bg-white dark:bg-gray-800 shadow rounded p-4">
              <h2 className="font-semibold text-lg mb-2">Profile</h2>
              <ul className="space-y-1">
                <li><span className="font-medium">Name:</span> {profile.name}</li>
                <li><span className="font-medium">Email:</span> {profile.email}</li>
                <li><span className="font-medium">Role:</span> {profile.role}</li>
                {profile.department && <li><span className="font-medium">Department:</span> {profile.department}</li>}
                {profile.session && <li><span className="font-medium">Session:</span> {profile.session}</li>}
              </ul>
            </div>
          )}
          {/* Courses View */}
          {activeView === "courses" && (
            <div className="bg-white dark:bg-gray-800 shadow rounded p-4">
              <h2 className="font-semibold text-lg mb-2">Current Courses</h2>
              {courses.length === 0 ? (
                <div>No courses found.</div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {courses.map((course) => (
                    <li key={course.id} className="py-2">
                      <span className="font-medium">{course.name}</span> ({course.code})
                      {course.teacher && <span> - Teacher: {course.teacher}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
