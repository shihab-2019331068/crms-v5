"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";

import CourseList from "./CourseList";
import SemesterList from "./SemesterList";
import RoomList from "./RoomList";

export default function DepartmentAdminDashboard() {
  const { user } = useAuth();
  const [activeForm, setActiveForm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch user details and set departmentId (if needed for other logic)
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user?.email) return;
      try {
        await api.get(`/user/${encodeURIComponent(user.email)}`);
        // ...existing code for departmentId if needed elsewhere...
      } catch {
        // ...existing code...
      }
    };
    fetchUserDetails();
  }, [user?.email]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col justify-between sidebar-dark shadow-lg p-4 min-h-screen">
        <div className="space-y-4 mt-8">
          <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { setActiveForm("showCourses"); setError(""); setSuccess(""); }} disabled={loading}>Show All Courses</button>
          <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { setActiveForm("showSemesters"); setError(""); setSuccess(""); }} disabled={loading}>Show All Semesters</button>
          <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { setActiveForm("showRooms"); setError(""); setSuccess(""); }} disabled={loading}>Show All Rooms</button>
        </div>
        <div>
          <button className="btn btn-error btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { window.location.href = '/login'; }}>Logout</button>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-6">Welcome to SUST-CRMS, Mr. Department Admin</h1>
        <div className="w-full max-w-xl space-y-8">
          {error && <div className="text-red-500 text-center">{error}</div>}
          {success && <div className="text-green-600 text-center">{success}</div>}
          {/* Lists */}
          {activeForm === "showCourses" && (
            <div className="mt-6">
              <CourseList user={user} />
            </div>
          )}
          {activeForm === "showSemesters" && (
            <div className="mt-6">
              <SemesterList user={user} />
            </div>
          )}
          {activeForm === "showRooms" && (
            <div className="mt-6">
              <RoomList user={user} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
