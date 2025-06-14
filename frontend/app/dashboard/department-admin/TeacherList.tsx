import React, { useEffect, useState } from 'react';
import api from "@/services/api";

export interface Teacher {
  id: number;
  name: string;
  email: string;
  departmentId: number;
}

interface TeacherListProps {
  departmentId?: number;
}

const TeacherList: React.FC<TeacherListProps> = ({ departmentId }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchTeachers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/dashboard/department-admin/teachers", { withCredentials: true });
      setTeachers(res.data);
      setSuccess("");
    } catch {
      setError("Failed to fetch teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [departmentId]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Teacher List</h2>
      {loading && <div className="text-red-500 text-center mb-2">Loading...</div>}
      {error && <div className="text-red-500 text-center mb-2">{error}</div>}
      {success && <div className="text-green-600 text-center mb-2">{success}</div>}
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Name</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => (
            <tr key={teacher.id}>
              <td className="border px-4 py-2">{teacher.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TeacherList;
