import React, { useEffect, useState } from 'react';
import api from "@/services/api";

import {
  Department,
}  from "./departmentList";

export interface Room {
  id: number;
  roomNumber: string;
  capacity: number;
  status: string;
  departmentAcronym: string | null;
}

export default function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [roomCapacity, setRoomCapacity] = useState("");
  const [roomDeptId, setRoomDeptId] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Room[]>("/rooms", { withCredentials: true });
      return response.data;
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      throw new Error(error.response?.data?.error || 'Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/dashboard/super-admin/room/${id}`, { withCredentials: true });
      setSuccess("Room deleted successfully!");
      // Refetch rooms after deletion
      const res = await api.get<Room[]>("/rooms", { withCredentials: true });
      setRooms(res.data);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to delete room");
    } finally {
      setLoading(false);
    }
  }

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess("");
    if (!roomNumber.trim() || !roomCapacity.trim() || !roomDeptId.trim()) {
      setError("All fields are required");
      setLoading(false);
      return;
    }
    try {
      await api.post(
        "/dashboard/super-admin/room",
        {
          roomNumber,
          capacity: Number(roomCapacity),
          departmentId: Number(roomDeptId),
        },
        { withCredentials: true }
      );
      setSuccess("Room added successfully!");
      // Refetch rooms after adding
      const res = await api.get<Room[]>("/rooms", { withCredentials: true });
      setRooms(res.data);
      setRoomNumber("");
      setRoomCapacity("");
      setRoomDeptId("");
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to add room");
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments for dropdown
  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Department[]>('/departments', { withCredentials: true });
      setDepartments(response.data);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      throw new Error(error.response?.data?.error || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms()
      .then(setRooms)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    fetchDepartments();
  }, []);

  if (loading) return <div>Loading rooms...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Room List</h2>
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <form onSubmit={handleAddRoom} className="mb-6 flex flex-col gap-2">
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
        {/* <input
          type="text"
          placeholder="Status"
          value={roomStatus}
          onChange={e => setRoomStatus(e.target.value)}
          className="input input-bordered w-full"
          required
        /> */}
        {/* Department Dropdown */}
        <select
          value={roomDeptId}
          onChange={e => setRoomDeptId(e.target.value)}
          className="input input-bordered w-full form-bg-dark text-white"
          required
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name} ({dept.acronym})
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="btn btn-outline btn-sm mt-2 cursor-pointer custom-bordered-btn"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Room"}
        </button>
      </form>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Room Number</th>
            <th className="py-2 px-4 border-b">Capacity</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Department</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id} className="border-b">
              <td className="py-2 px-4">{room.roomNumber}</td>
              <td className="py-2 px-4">{room.capacity}</td>
              <td className="py-2 px-4">{room.status}</td>
              <td className="py-2 px-4">{room.departmentAcronym}</td>
              <td className="py-2 px-4">
                <button
                  onClick={() => handleDeleteRoom(room.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
