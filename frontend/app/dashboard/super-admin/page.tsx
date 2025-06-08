"use client";
import { useState, useEffect } from "react";
import api from "@/services/api";

// Define types for Department and Room
interface Department {
  id: number;
  name: string;
  headId?: number | null;
}

interface Room {
  id: number;
  roomNumber: string;
  capacity: number;
  status: string;
  departmentId: number;
}

export default function SuperAdminDashboard() {
  const [deptName, setDeptName] = useState("");
  const [deptHeadId, setDeptHeadId] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [roomCapacity, setRoomCapacity] = useState("");
  const [roomStatus, setRoomStatus] = useState("");
  const [roomDeptId, setRoomDeptId] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showDepartments, setShowDepartments] = useState(false);
  const [showRooms, setShowRooms] = useState(false);
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

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post(
        "/dashboard/super-admin/department",
        {
          name: deptName,
          headId: deptHeadId || null,
        },
        { withCredentials: true }
      );
      setSuccess("Department added successfully!");
      setDeptName("");
      setDeptHeadId("");
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to add department");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post(
        "/dashboard/super-admin/room",
        {
          roomNumber,
          capacity: Number(roomCapacity),
          status: roomStatus,
          departmentId: Number(roomDeptId), // Ensure departmentId is sent as a number
        },
        { withCredentials: true }
      );
      setSuccess("Room added successfully!");
      setRoomNumber("");
      setRoomCapacity("");
      setRoomStatus("");
      setRoomDeptId("");
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to add room");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<Department[]>("/departments", { withCredentials: true });
      setDepartments(res.data);
      setShowDepartments(true);
      setShowRooms(false);
    } catch {
      setError("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<Room[]>("/rooms", { withCredentials: true });
      setRooms(res.data);
      setShowRooms(true);
      setShowDepartments(false);
    } catch {
      setError("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col justify-between bg-white dark:bg-gray-900 shadow-lg p-4 min-h-screen">
        {/* Top Section */}
        <div className="space-y-4">
          <button
            className="btn btn-outline btn-sm w-full cursor-pointer"
            onClick={() => {
              setShowDepartments(false);
              setShowRooms(false);
              setError("");
              setSuccess("");
              setActiveForm("department");
            }}
          >
            Add Department
          </button>
          <button
            className="btn btn-outline btn-sm w-full cursor-pointer"
            onClick={() => {
              setShowDepartments(false);
              setShowRooms(false);
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
          <button className="btn btn-outline btn-sm w-full cursor-pointer" onClick={() => { fetchDepartments(); setActiveForm(""); }} disabled={loading}>
            Show All Departments
          </button>
          <button className="btn btn-outline btn-sm w-full cursor-pointer" onClick={() => { fetchRooms(); setActiveForm(""); }} disabled={loading}>
            Show All Rooms
          </button>
        </div>
        {/* Bottom Section */}
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
        <h1 className="text-2xl font-bold mb-6">Welcome to SUST-CRMS, Mr. Super Admin</h1>
        <div className="w-full max-w-xl space-y-8">
          {/* Only show forms or lists if a sidebar button is clicked */}
          {activeForm === "department" && (
            <form id="add-dept-form" onSubmit={handleAddDepartment} className="bg-white dark:bg-gray-800 shadow rounded p-4 space-y-4">
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
                placeholder="Head ID (optional)"
                value={deptHeadId}
                onChange={e => setDeptHeadId(e.target.value)}
                className="input input-bordered w-full"
              />
              <button type="submit" className="btn btn-outline btn-sm mt-2 cursor-pointer" disabled={loading}>
                {loading ? "Adding..." : "Add Department"}
              </button>
            </form>
          )}
          {activeForm === "room" && (
            <form id="add-room-form" onSubmit={handleAddRoom} className="bg-white dark:bg-gray-800 shadow rounded p-4 space-y-4">
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
              <button type="submit" className="btn btn-outline btn-sm mt-2 cursor-pointer" disabled={loading}>
                {loading ? "Adding..." : "Add Room"}
              </button>
            </form>
          )}
          {error && (activeForm || showDepartments || showRooms) && <div className="text-red-500 text-center">{error}</div>}
          {success && (activeForm || showDepartments || showRooms) && <div className="text-green-600 text-center">{success}</div>}
          {showDepartments && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">All Departments</h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {departments.map((dept) => (
                  <li key={dept.id} className="py-2">
                    <span className="font-medium">{dept.name}</span> (ID: {dept.id}) Head: {dept.headId || "N/A"}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {showRooms && (
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
        </div>
      </div>
    </div>
  );
}
