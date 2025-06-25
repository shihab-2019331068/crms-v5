import React, { useEffect, useState } from 'react';
import api from "@/services/api";
import AuthForm from "@/components/AuthForm";

interface Department {
  id: string;
  name: string;
  acronym?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: Department;
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Add filter states
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<User[]>("/dashboard/super-admin/users", { withCredentials: true });
      return response.data;
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      throw new Error(error.response?.data?.error || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get<Department[]>("/departments", { withCredentials: true });
      setDepartments(response.data);
    } catch {
      setDepartments([]);
    }
  };

  const handleDeleteUser = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/dashboard/super-admin/user/${id}`, { withCredentials: true });
      setSuccess("User deleted successfully!");
      const res = await api.get<User[]>("/users", { withCredentials: true });
      setUsers(res.data);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  // Filtered users
  const filteredUsers = users.filter(user => {
    const roleMatch = roleFilter === "all" || user.role === roleFilter;
    // If department info is available on user, filter by department
    // Adjust this logic if user object has department info (e.g., user.department)
    const departmentMatch = departmentFilter === "all" || 
    (user.department && user.department.acronym === departmentFilter);
    if (user.department) {
      console.log (user.department.acronym, departmentFilter, departmentMatch);
    }
    return roleMatch && departmentMatch;
  });

  // Validation helpers (copy from register page)
  function isNonEmpty(str: string) {
    return !!str && str.trim().length > 0;
  }
  function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  function isStrongPassword(password: string) {
    return password.length >= 6 && /[A-Za-z]/.test(password) && /\d/.test(password);
  }

  async function handleRegister(data: { name: string; email: string; password: string; confirmPassword: string; role: string; department: string; session?: string }) {
    setError("");
    // Custom validation for super_admin: department not required, session required for student
    if (
      !isNonEmpty(data.name) ||
      !isNonEmpty(data.email) ||
      !isNonEmpty(data.password) ||
      !isNonEmpty(data.confirmPassword) ||
      !isNonEmpty(data.role) ||
      (data.role !== "super_admin" && !isNonEmpty(data.department)) ||
      (data.role === "student" && !isNonEmpty(data.session ?? ''))
    ) {
      setError("All fields are required.");
      return;
    }
    if (!isValidEmail(data.email)) {
      setError("Invalid email address.");
      return;
    }
    if (!isStrongPassword(data.password)) {
      setError("Password must be at least 6 characters and contain letters and numbers.");
      return;
    }
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
  }

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
    fetchDepartments();
  }, []);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">User List</h2>
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <button
        className="btn btn-outline btn-sm mb-4 cursor-pointer custom-bordered-btn"
        onClick={() => setShowAddForm((v) => !v)}
      >
        [+add user]
      </button>
      {showAddForm && (
        <AuthForm type="register" onSubmit={handleRegister} loading={loading} error={error || ""} departments={departments} />
      )}
      
      {/* Filter controls */}
      <div className="flex gap-4 mb-4">
        <div>
          <label className="mr-2">Role:</label>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="border px-2 py-1 rounded bg-gray-500"
          >
            <option value="all">All</option>
            <option value="super_admin">Super Admin</option>
            <option value="department_admin">Department Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
        </div>
        <div>
          <label className="mr-2">Department:</label>
          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="border px-2 py-1 rounded bg-gray-500"
          >
            <option value="all">All</option>
            {departments.map(dep => (
              <option key={dep.id} value={dep.acronym}>
                {dep.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <table className="min-w-full border" style={{ minWidth: '1500px' }}>
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Role</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="py-2 px-4">{user.name}</td>
              <td className="py-2 px-4">{user.email}</td>
              <td className="py-2 px-4">{user.role}</td>
              <td className="py-2 px-4">
                {user.role !== "super_admin" && (
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="btn btn-outline btn-sm mt-2 cursor-pointer custom-bordered-btn"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}