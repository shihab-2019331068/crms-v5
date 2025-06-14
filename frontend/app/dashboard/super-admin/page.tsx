"use client";
import { useState } from "react";


import DepartmentList from "./departmentList";
import RoomList from "./RoomList";
import UserList from "./userList";

export default function SuperAdminDashboard() {
  const [loading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeForm, setActiveForm] = useState(""); // Track active form or list

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 h-screen flex-shrink-0 flex flex-col justify-between sidebar-dark shadow-lg p-4 sticky top-0">
        {/* Top Section */}
        <div className="space-y-4">
          <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { setActiveForm("showDepartments"); setError(""); setSuccess(""); }} disabled={loading}>Show All Departments</button>
          <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { setActiveForm("showRooms"); setError(""); setSuccess(""); }} disabled={loading}>Show All Rooms</button>
          <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => { setActiveForm("showUsers"); setError(""); setSuccess(""); }} disabled={loading}>Show All Users</button>
        </div>
        {/* Bottom Section */}
        <div>
          <button
            className="btn btn-error btn-sm w-full cursor-pointer custom-bordered-btn"
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
        <h1 className="text-2xl font-bold mb-6">Welcome to SUST-CRMS, Mr. Super Admin</h1>
        <div className="w-full max-w-xl space-y-8">
          {error && activeForm && <div className="text-red-500 text-center">{error}</div>}
          {success && activeForm && <div className="text-green-600 text-center">{success}</div>}
          {activeForm === "showDepartments" && (
            <div className="mt-6">
              <DepartmentList />
            </div>
          )}
          {activeForm === "showRooms" && (
            <div className="mt-6">
              <RoomList />
            </div>
          )}
          {activeForm === "showUsers" && (
            <div className="mt-6">
              <UserList />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
