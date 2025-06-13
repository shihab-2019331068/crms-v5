// deptAdminHandlers.tsx
// All handler and fetch methods for Department Admin Dashboard
import api from "@/services/api";

// Type definitions for handler parameters
import { Dispatch, SetStateAction } from "react";

// Define types for entities
export interface Course {
  id: number;
  name: string;
  code: string;
  credits: number;
  departmentId: number;
}
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

export const fetchCourses = async (
  setLoading: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string>>,
  setCourses: Dispatch<SetStateAction<Course[]>>
) => {
  setLoading(true);
  setError("");
  try {
    const res = await api.get("/dashboard/department-admin/courses", { withCredentials: true });
    setCourses(res.data);
  } catch {
    setError("Failed to fetch courses");
  } finally {
    setLoading(false);
  }
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

    console.log("Fetched semesters:", res.data); // Debugging line
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

    console.log("Fetched rooms:", res.data); // Debugging line
    setRooms(res.data);
  } catch {
    setError("Failed to fetch rooms");
  } finally {
    setLoading(false);
  }
};

// Helper type for API error
interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

export const handleAddCourse = async (
  e: React.FormEvent,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string>>,
  setSuccess: Dispatch<SetStateAction<string>>,
  courseName: string,
  courseCode: string,
  courseCredits: string,
  departmentId: number | undefined,
  setCourseName: Dispatch<SetStateAction<string>>,
  setCourseCode: Dispatch<SetStateAction<string>>,
  setCourseCredits: Dispatch<SetStateAction<string>>,
  fetchCourses: () => void
) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  setSuccess("");
  try {
    await api.post(
      "/dashboard/department-admin/course",
      {
        name: courseName,
        code: courseCode,
        credits: Number(courseCredits),
        departmentId,
      },
      { withCredentials: true }
    );
    setSuccess("Course added successfully!");
    setCourseName("");
    setCourseCode("");
    setCourseCredits("");
    fetchCourses();
  } catch (err: unknown) {
    let errorMsg = "Failed to add course";
    if (typeof err === "object" && err !== null && "response" in err) {
      const apiErr = err as ApiError;
      if (apiErr.response?.data?.error) errorMsg = apiErr.response.data.error;
    }
    setError(errorMsg);
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

