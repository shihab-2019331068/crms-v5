// Handler and fetcher functions for Super Admin Dashboard
import api from "@/services/api";

// Define types for Department and Room here instead of importing from page.tsx
export interface Department {
  id: number;
  name: string;
  acronym: string;
}

export interface Room {
  id: number;
  roomNumber: string;
  capacity: number;
  status: string;
  departmentId: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  departmentId?: number;
}

export async function handleAddDepartment(
  e: React.FormEvent,
  deptName: string,
  deptAcronym: string,
  setLoading: (b: boolean) => void,
  setError: (s: string) => void,
  setSuccess: (s: string) => void,
  setDeptName: (s: string) => void,
  setDeptAcronym: (s: string) => void
) {
  e.preventDefault();
  setLoading(true);
  setError("");
  setSuccess("");
  try {
    await api.post(
      "/dashboard/super-admin/department",
      {
        name: deptName,
        acronym: deptAcronym,
      },
      { withCredentials: true }
    );
    setSuccess("Department added successfully!");
    setDeptName("");
    setDeptAcronym("");
  } catch (err) {
    const error = err as { response?: { data?: { error?: string } } };
    setError(error.response?.data?.error || "Failed to add department");
  } finally {
    setLoading(false);
  }
}

export async function handleAddRoom(
  e: React.FormEvent,
  roomNumber: string,
  roomCapacity: string,
  roomStatus: string,
  roomDeptId: string,
  setLoading: (b: boolean) => void,
  setError: (s: string) => void,
  setSuccess: (s: string) => void,
  setRoomNumber: (s: string) => void,
  setRoomCapacity: (s: string) => void,
  setRoomStatus: (s: string) => void,
  setRoomDeptId: (s: string) => void
) {
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
        departmentId: Number(roomDeptId),
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
}

export async function handleDeleteDepartment(
  id: number,
  setLoading: (b: boolean) => void,
  setError: (s: string) => void,
  setSuccess: (s: string) => void,
  setDepartments: (d: Department[]) => void
) {
  setLoading(true);
  setError("");
  setSuccess("");
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

export async function fetchDepartmentsList(
  setLoading: (b: boolean) => void,
  setError: (s: string) => void,
  setDepartments: (d: Department[]) => void,
  setActiveForm: (s: string) => void
) {
  setLoading(true);
  setError("");
  try {
    const res = await api.get<Department[]>("/departments", { withCredentials: true });
    setDepartments(res.data);
    setActiveForm("showDepartments");
  } catch {
    setError("Failed to fetch departments");
  } finally {
    setLoading(false);
  }
}

export async function fetchRoomsList(
  setLoading: (b: boolean) => void,
  setError: (s: string) => void,
  setRooms: (r: Room[]) => void,
  setActiveForm: (s: string) => void
) {
  setLoading(true);
  setError("");
  try {
    const res = await api.get<Room[]>("/rooms", { withCredentials: true });
    setRooms(res.data);
    setActiveForm("showRooms");
  } catch {
    setError("Failed to fetch rooms");
  } finally {
    setLoading(false);
  }
}

export async function fetchUsersList(
  setLoading: (b: boolean) => void,
  setError: (s: string) => void,
  setSuccess: (s: string) => void,
  setUsers: (u: User[]) => void,
  setActiveForm: (s: string) => void
) {
  setLoading(true);
  setError("");
  setSuccess("");
  try {
    const res = await api.get<User[]>("/dashboard/super-admin/users", { withCredentials: true });
    setUsers(res.data);
    setActiveForm("showUsers");
  } catch {
    setError("Failed to fetch users");
  } finally {
    setLoading(false);
  }
}

export async function handleDeleteUserLocal(
  id: number,
  setLoading: (b: boolean) => void,
  setError: (s: string) => void,
  setSuccess: (s: string) => void,
  setUsers: (u: User[]) => void
) {
  setLoading(true);
  setError("");
  setSuccess("");
  try {
    await api.delete(`/dashboard/super-admin/user/${id}`, { withCredentials: true });
    setSuccess("User deleted successfully!");
    // Refetch users after deletion
    const res = await api.get<User[]>("/dashboard/super-admin/users", { withCredentials: true });
    setUsers(res.data);
  } catch (err) {
    const error = err as { response?: { data?: { error?: string } } };
    setError(error.response?.data?.error || "Failed to delete user");
  } finally {
    setLoading(false);
  }
}

export async function handleDeleteDepartmentLocal(
  id: number,
  setLoading: (b: boolean) => void,
  setError: (s: string) => void,
  setSuccess: (s: string) => void,
  setDepartments: (d: Department[]) => void
) {
  setLoading(true);
  setError("");
  setSuccess("");
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
