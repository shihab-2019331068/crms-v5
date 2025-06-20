import React, { useEffect, useState } from 'react';
import api from "@/services/api";

export interface Room {
  id: number;
  roomNumber: string;
  capacity: number;
  departmentId: number;
}

interface RoomListProps {
  departmentId?: number;
}

const RoomList: React.FC<RoomListProps> = ({ departmentId }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchRooms = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/dashboard/department-admin/rooms", { withCredentials: true });
      setRooms(res.data);
      setSuccess("");
    } catch {
      setError("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [departmentId]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Room List</h2>
      {loading && <div className="text-red-500 text-center mb-2">{loading}</div>}
      {error && <div className="text-red-500 text-center mb-2">{error}</div>}
      {success && <div className="text-green-600 text-center mb-2">{success}</div>}
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Room Number</th>
            <th className="border px-4 py-2">Capacity</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td className="border px-4 py-2">{room.roomNumber}</td>
              <td className="border px-4 py-2">{room.capacity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoomList;
