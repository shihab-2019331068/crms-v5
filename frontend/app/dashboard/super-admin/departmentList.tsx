import React, { useEffect, useState } from 'react';
import api from "@/services/api";


export interface Department {
  id: number;
  name: string;
  acronym: string;
}


export default function DepartmentList() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [newName, setNewName] = useState("");
  const [newAcronym, setNewAcronym] = useState("");

  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<Department[]>('/departments', { withCredentials: true });
      return response.data;
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      throw new Error(error.response?.data?.error || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/dashboard/super-admin/department/${id}`, { withCredentials: true });
      setSuccess("Department deleted successfully!");
      // Refetch departments after deletion
      const res = await api.get<Department[]>("/departments", { withCredentials: true });
      setDepartments(res.data);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to delete department");
    } finally {
      setLoading(false);
    }
  }

  const handleAddDepartment = async (name: string, acronym: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/dashboard/super-admin/department', { name, acronym }, { withCredentials: true });
      setSuccess("Department added successfully!");
      // Refetch departments after adding
      const res = await api.get<Department[]>("/departments", { withCredentials: true });
      setDepartments(res.data);
      setNewName("");
      setNewAcronym("");
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to add department");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments()
      .then(setDepartments)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError("Department name is required");
      return;
    }
    handleAddDepartment(newName, newAcronym);
  };

  if (loading) return <div>Loading departments...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Department List</h2>
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
        <input
          type="text"
          placeholder="Department Name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          className="input input-bordered w-full"
          required
        />
        <input
          type="text"
          placeholder="Acronym"
          value={newAcronym}
          onChange={e => setNewAcronym(e.target.value)}
          className="input input-bordered w-full"
        />
        <button
          type="submit"
          className="btn btn-outline btn-sm mt-2 cursor-pointer custom-bordered-btn"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Department"}
        </button>
      </form>
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Acronym</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((dept) => (
            <tr key={dept.id} className="border-b">
              <td className="py-2 px-4">{dept.name}</td>
              <td className="py-2 px-4">{dept.acronym}</td>
              <td className="py-2 px-4">
                <button
                  onClick={() => handleDeleteDepartment(dept.id)}
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
