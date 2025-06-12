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
  status: string;
  departmentId: number;
}
export interface WeeklySchedule {
  id: number;
  semesterId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  courseId?: number;
  roomId?: number;
  isBreak: boolean;
  breakName?: string;
}

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
  setRooms: Dispatch<SetStateAction<Room[]>>,
  departmentId: number | undefined
) => {
  setLoading(true);
  setError("");
  try {
    const res = await api.get("/rooms", { withCredentials: true });
    setRooms(res.data.filter((r: Room) => r.departmentId === departmentId));
  } catch {
    setError("Failed to fetch rooms");
  } finally {
    setLoading(false);
  }
};

export const fetchWeeklySchedules = async (
  setLoading: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string>>,
  setWeeklySchedules: Dispatch<SetStateAction<WeeklySchedule[]>>
) => {
  setLoading(true);
  setError("");
  try {
    const res = await api.get("/dashboard/department-admin/weekly-schedules", { withCredentials: true });
    setWeeklySchedules(res.data);
  } catch {
    setError("Failed to fetch weekly schedules");
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

export const handleAddWeeklySchedule = async (
  e: React.FormEvent,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string>>,
  setSuccess: Dispatch<SetStateAction<string>>,
  scheduleSemesterId: string,
  scheduleDay: string,
  scheduleStart: string,
  scheduleEnd: string,
  scheduleIsBreak: boolean,
  scheduleCourseId: string,
  scheduleRoomId: string,
  scheduleBreakName: string,
  setScheduleSemesterId: Dispatch<SetStateAction<string>>,
  setScheduleDay: Dispatch<SetStateAction<string>>,
  setScheduleStart: Dispatch<SetStateAction<string>>,
  setScheduleEnd: Dispatch<SetStateAction<string>>,
  setScheduleCourseId: Dispatch<SetStateAction<string>>,
  setScheduleRoomId: Dispatch<SetStateAction<string>>,
  setScheduleIsBreak: Dispatch<SetStateAction<boolean>>,
  setScheduleBreakName: Dispatch<SetStateAction<string>>,
  fetchWeeklySchedules: () => void
) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  setSuccess("");
  try {
    await api.post(
      "/dashboard/department-admin/weekly-schedule",
      {
        semesterId: Number(scheduleSemesterId),
        dayOfWeek: scheduleDay,
        startTime: scheduleStart,
        endTime: scheduleEnd,
        courseId: scheduleIsBreak ? undefined : Number(scheduleCourseId) || undefined,
        roomId: scheduleIsBreak ? undefined : Number(scheduleRoomId) || undefined,
        isBreak: scheduleIsBreak,
        breakName: scheduleIsBreak ? scheduleBreakName : undefined,
      },
      { withCredentials: true }
    );
    setSuccess("Weekly schedule added!");
    setScheduleSemesterId("");
    setScheduleDay("");
    setScheduleStart("");
    setScheduleEnd("");
    setScheduleCourseId("");
    setScheduleRoomId("");
    setScheduleIsBreak(false);
    setScheduleBreakName("");
    fetchWeeklySchedules();
  } catch (err: unknown) {
    let errorMsg = "Failed to add schedule";
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
