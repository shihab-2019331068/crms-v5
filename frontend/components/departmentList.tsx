import React, { useEffect, useState } from 'react';
import api from "@/services/api";
import RoomList from "./RoomList";
import CourseList from "./CourseList";
import TeacherList from "./TeacherList";
import SemesterList from "./SemesterList";
import FinalRoutine from "./finalRoutine";


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
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAcronym, setNewAcronym] = useState("");
  const [viewDeptId, setViewDeptId] = useState<number | null>(null);
  const [viewType, setViewType] = useState<"rooms"|"courses"|"users"|"semesters"|"routine"|null>(null);

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

  if (viewDeptId && viewType) {
    const selectedDept = departments.find(d => d.id === viewDeptId);
    let ViewComponent = null;
    let componentTitle = "";
    if (viewType === "rooms") {
      ViewComponent = <RoomList departmentId={viewDeptId} />; componentTitle = "Rooms";
    }
    if (viewType === "courses") {
      ViewComponent = <CourseList departmentId={viewDeptId} />; componentTitle = "Courses";
    }
    if (viewType === "semesters") {
      ViewComponent = <SemesterList departmentId={viewDeptId} />; componentTitle = "Semesters";
    }
    if (viewType === "routine") {
      ViewComponent = <FinalRoutine departmentId={viewDeptId} />; componentTitle = "Routine";
    }
    return (
      <div className="max-w-2xl mx-auto p-4">
        <button
          className="btn btn-outline btn-sm mb-4 cursor-pointer custom-bordered-btn"
          onClick={() => { setViewDeptId(null); setViewType(null); }}
        >
          ← Back to Department List
        </button>
        {selectedDept && (
          <div className="mb-4 p-3 border rounded bg-dark">
            <div className="font-bold text-lg">{selectedDept.acronym} {componentTitle}</div>
          </div>
        )}
        {ViewComponent}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Department List</h2>
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {/* Add Department Button */}
      {!showAddForm && (
        <button
          className="btn btn-outline btn-sm mb-4 cursor-pointer custom-bordered-btn"
          onClick={() => setShowAddForm(true)}
        >
          + Add Department
        </button>
      )}

      {/* Add Department Form */}
      {showAddForm && (
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
          <div className="flex gap-2">
            <button
              type="submit"
              className="btn btn-outline btn-sm mt-2 cursor-pointer custom-bordered-btn"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Department"}
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm mt-2 cursor-pointer custom-bordered-btn"
              onClick={() => {
                setShowAddForm(false);
                setNewName("");
                setNewAcronym("");
                setError(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <table className="min-w-full border" style={{ minWidth: '1500px' }}>
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Acronym</th>
            <th className="py-2 px-4 border-b">Actions</th>
            <th className="py-2 px-4 border-b">View</th>
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
                  className="text-white px-1 rounded btn-sm cursor-pointer custom-bordered-btn"
                >
                  Delete
                </button>
              </td>
              <td className="py-2 px-4 space-x-1">
                <button
                  className="text-white px-1 rounded btn-sm cursor-pointer custom-bordered-btn"
                  onClick={() => { setViewDeptId(dept.id); setViewType("rooms"); }}
                  type="button"
                >Rooms</button>
                <button
                  className="text-white px-1 rounded btn-sm cursor-pointer custom-bordered-btn"
                  onClick={() => { setViewDeptId(dept.id); setViewType("courses"); }}
                  type="button"
                >Courses</button>
                <button
                  className="text-white px-1 rounded btn-sm cursor-pointer custom-bordered-btn"
                  onClick={() => { setViewDeptId(dept.id); setViewType("semesters"); }}
                  type="button"
                >Semesters</button>
                <button
                  className="text-white px-1 rounded btn-sm cursor-pointer custom-bordered-btn"
                  onClick={() => { setViewDeptId(dept.id); setViewType("routine"); }}
                  type="button"
                >Routine</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {viewDeptId && viewType === "rooms" && (
        <div className="mt-6"><RoomList departmentId={viewDeptId} /></div>
      )}
      {viewDeptId && viewType === "courses" && (
        <div className="mt-6"><CourseList departmentId={viewDeptId} /></div>
      )}
      {viewDeptId && viewType === "users" && (
        <div className="mt-6"><TeacherList departmentId={viewDeptId} /></div>
      )}
      {viewDeptId && viewType === "semesters" && (
        <div className="mt-6"><SemesterList departmentId={viewDeptId} /></div>
      )}
      {viewDeptId && viewType === "routine" && (
        <div className="mt-6"><FinalRoutine departmentId={viewDeptId} /></div>
      )}
    </div>
  );
}
