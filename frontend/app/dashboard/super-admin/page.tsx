"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";
import {
  handleAddDepartment,
  handleAddRoom,
  fetchDepartmentsList,
  fetchRoomsList,
  fetchUsersList,
  handleDeleteUserLocal,
  handleDeleteDepartmentLocal,
} from "./superAdminHandlers";

// Define types for Department and Room
interface Department {
  id: number;
  name: string;
  acronym: string;
}

interface Room {
  id: number;
  roomNumber: string;
  capacity: number;
  status: string;
  departmentId: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  departmentId?: number;
}

export default function SuperAdminDashboard() {
  const [deptName, setDeptName] = useState("");
  const [deptAcronym, setDeptAcronym] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [roomCapacity, setRoomCapacity] = useState("");
  const [roomStatus, setRoomStatus] = useState("");
  const [roomDeptId, setRoomDeptId] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeForm, setActiveForm] = useState(""); // Track active form or list

  // Fetch departments for dropdown on mount
  useEffect(() => {
    const fetchInitialDepartments = async () => {
      try {
        const res = await api.get<Department[]>("/departments", { withCredentials: true });
        setDepartments(res.data);
      } catch {
        // ignore error here, handled elsewhere
      }
    };
    fetchInitialDepartments();
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col justify-between sidebar-dark shadow-lg p-4 min-h-screen">
        {/* Top Section */}
        <div className="space-y-4">
          <button
            className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn"
            onClick={() => {
              setError("");
              setSuccess("");
              setActiveForm("department");
            }}
          >
            Add Department
          </button>
          <button
            className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn"
            onClick={() => {
              setError("");
              setSuccess("");
              setActiveForm("room");
            }}
          >
            Add Room
          </button>
        </div>
        {/* Middle Section */}
        <div className="space-y-4">
          <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => fetchDepartmentsList(setLoading, setError, setDepartments, setActiveForm)} disabled={loading}>
            Show All Departments
          </button>
          <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => fetchRoomsList(setLoading, setError, setRooms, setActiveForm)} disabled={loading}>
            Show All Rooms
          </button>
          <button className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn" onClick={() => fetchUsersList(setLoading, setError, setSuccess, setUsers, setActiveForm)} disabled={loading}>
            Show All Users
          </button>
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
          {/* Only show forms or lists if a sidebar button is clicked */}
          {activeForm === "department" && (
            <form id="add-dept-form" onSubmit={e => handleAddDepartment(e, deptName, deptAcronym, setLoading, setError, setSuccess, setDeptName, setDeptAcronym)} className="bg-white dark:bg-gray-800 shadow rounded p-4 space-y-4">
              <h2 className="font-semibold text-lg">Add Department</h2>
              <input
                type="text"
                placeholder="Department Name"
                value={deptName}
                onChange={e => setDeptName(e.target.value)}
                className="input input-bordered w-full"
                required
              />
              <input
                type="text"
                placeholder="Acronym (e.g., CSE)"
                value={deptAcronym}
                onChange={e => setDeptAcronym(e.target.value)}
                className="input input-bordered w-full"
                required
              />
              <button type="submit" className="btn btn-outline btn-sm mt-2 cursor-pointer custom-bordered-btn" disabled={loading}>
                {loading ? "Adding..." : "Add Department"}
              </button>
            </form>
          )}
          {activeForm === "room" && (
            <form id="add-room-form" onSubmit={e => handleAddRoom(e, roomNumber, roomCapacity, roomStatus, roomDeptId, setLoading, setError, setSuccess, setRoomNumber, setRoomCapacity, setRoomStatus, setRoomDeptId)} className="bg-white dark:bg-gray-800 shadow rounded p-4 space-y-4">
              <h2 className="font-semibold text-lg">Add Room</h2>
              <input
                type="text"
                placeholder="Room Number"
                value={roomNumber}
                onChange={e => setRoomNumber(e.target.value)}
                className="input input-bordered w-full"
                required
              />
              <input
                type="number"
                placeholder="Capacity"
                value={roomCapacity}
                onChange={e => setRoomCapacity(e.target.value)}
                className="input input-bordered w-full"
                required
              />
              {/* Room Status as Checkbox */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={roomStatus === "AVAILABLE"}
                  onChange={e => setRoomStatus(e.target.checked ? "AVAILABLE" : "UNAVAILABLE")}
                  className="checkbox"
                />
                <span>Available</span>
              </label>
              <select
                value={roomDeptId}
                onChange={e => setRoomDeptId(e.target.value)}
                className="input input-bordered w-full bg-gray-800 text-white"
                required
              >
                <option value="" disabled>
                  Select Department
                </option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} (ID: {dept.id})
                  </option>
                ))}
              </select>
              <button type="submit" className="btn btn-outline btn-sm mt-2 cursor-pointer custom-bordered-btn" disabled={loading}>
                {loading ? "Adding..." : "Add Room"}
              </button>
            </form>
          )}
          {error && activeForm && <div className="text-red-500 text-center">{error}</div>}
          {success && activeForm && <div className="text-green-600 text-center">{success}</div>}
          {activeForm === "showDepartments" && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">All Departments</h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {departments.map((dept) => (
                  <li key={dept.id} className="py-2 flex items-center justify-between">
                    <span>
                      <span className="font-medium">{dept.name}</span> (ID: {dept.id}) Acronym: {dept.acronym}
                    </span>
                    <button
                      className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn"
                      onClick={async () => {
                        await handleDeleteDepartmentLocal(
                          dept.id,
                          setLoading,
                          setError,
                          setSuccess,
                          setDepartments
                        );
                      }}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {activeForm === "showRooms" && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">All Rooms</h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {rooms.map((room) => (
                  <li key={room.id} className="py-2">
                    <span className="font-medium">Room {room.roomNumber}</span> (ID: {room.id}) - Capacity: {room.capacity} - Status: {room.status} - Dept: {room.departmentId}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {activeForm === "showUsers" && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">All Users</h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <li key={user.id} className="py-2 flex items-center justify-between">
                    <span>
                      <span className="font-medium">{user.name}</span> (ID: {user.id}) - {user.email} - Role: {user.role}
                      {user.departmentId && <> - Dept: {user.departmentId}</>}
                    </span>
                    {user.role.toLowerCase() !== "super_admin" && user.role.toLowerCase() !== "superadmin" && (
                      <button
                        className="btn btn-outline btn-sm w-full cursor-pointer custom-bordered-btn"
                        onClick={async () => await handleDeleteUserLocal(user.id, setLoading, setError, setSuccess, setUsers)}
                        disabled={loading}
                      >
                        Delete
                      </button>
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
