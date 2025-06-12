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

export async function fetchDepartments(
  setLoading: (b: boolean) => void,
  setError: (s: string) => void,
  setDepartments: (d: Department[]) => void,
  setShowDepartments: (b: boolean) => void,
  setShowRooms: (b: boolean) => void
) {
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
}

export async function fetchRooms(
  setLoading: (b: boolean) => void,
  setError: (s: string) => void,
  setRooms: (r: Room[]) => void,
  setShowRooms: (b: boolean) => void,
  setShowDepartments: (b: boolean) => void
) {
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
}
