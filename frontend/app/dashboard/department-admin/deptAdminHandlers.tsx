// deptAdminHandlers.tsx
// All handler and fetch methods for Department Admin Dashboard
import api from "@/services/api";

// Type definitions for handler parameters
import { Dispatch, SetStateAction } from "react";

// Define API error interface
export interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

// Define types for entities
export interface Semester {
  id: number;
  name: string;
  session: string;
  startDate: string;
  endDate: string;
  examStartDate: string;
  examEndDate: string;
  departmentId: number;
}
export interface Room {
  id: number;
  roomNumber: string;
  capacity: number;
  departmentId: number;
}

// Add types for preview schedule (for future integration with backend if needed)
export interface ScheduleCellPreview {
  courseName: string;
  teacherName: string;
  roomNumber: string;
}
export type WeekSchedulePreview = {
  [day: string]: {
    [time: string]: ScheduleCellPreview;
  };
};

export const fetchSemesters = async (
  setLoading: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string>>,
  setSemesters: Dispatch<SetStateAction<Semester[]>>
) => {
  setLoading(true);
  setError("");
  try {
    const res = await api.get("/dashboard/department-admin/semesters", { withCredentials: true });
    setSemesters(res.data);
  } catch {
    setError("Failed to fetch semesters");
  } finally {
    setLoading(false);
  }
};

export const fetchRooms = async (
  setLoading: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string>>,
  setRooms: Dispatch<SetStateAction<Room[]>>
) => {
  setLoading(true);
  setError("");
  try {
    const res = await api.get("/dashboard/department-admin/rooms", { withCredentials: true });
    setRooms(res.data);
  } catch {
    setError("Failed to fetch rooms");
  } finally {
    setLoading(false);
  }
};

export const handleAddCourseToSemester = async (
  e: React.FormEvent,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string>>,
  setSuccess: Dispatch<SetStateAction<string>>,
  addCourseSemesterId: string,
  addCourseId: string,
  setAddCourseSemesterId: Dispatch<SetStateAction<string>>,
  setAddCourseId: Dispatch<SetStateAction<string>>,
  fetchSemesters: () => void
) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  setSuccess("");
  try {
    await api.post(
      "/dashboard/department-admin/semester/course",
      {
        semesterId: Number(addCourseSemesterId),
        courseId: Number(addCourseId),
      },
      { withCredentials: true }
    );
    setSuccess("Course added to semester!");
    setAddCourseSemesterId("");
    setAddCourseId("");
    fetchSemesters();
  } catch (err: unknown) {
    let errorMsg = "Failed to add course to semester";
    if (typeof err === "object" && err !== null && "response" in err) {
      const apiErr = err as ApiError;
      if (apiErr.response?.data?.error) errorMsg = apiErr.response.data.error;
    }
    setError(errorMsg);
  } finally {
    setLoading(false);
  }
};

export const handleDeleteCourse = async (
  courseId: number,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string>>,
  setSuccess: Dispatch<SetStateAction<string>>,
  fetchCourses: () => void
) => {
  setLoading(true);
  setError("");
  setSuccess("");
  try {
    await api.delete("/dashboard/department-admin/course", {
      data: { courseId },
      withCredentials: true,
    });
    setSuccess("Course deleted successfully!");
    fetchCourses();
  } catch (err: unknown) {
    let errorMsg = "Failed to delete course";
    if (typeof err === "object" && err !== null && "response" in err) {
      const apiErr = err as ApiError;
      if (apiErr.response?.data?.error) errorMsg = apiErr.response.data.error;
    }
    setError(errorMsg);
  } finally {
    setLoading(false);
  }
};

