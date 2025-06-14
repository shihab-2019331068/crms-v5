import React, { useEffect, useState } from 'react';
import api from "@/services/api";

export interface Course {
  id: number;
  name: string;
  code: string;
  credits: number;
  departmentId: number;
}

// Helper type for API error
interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

interface CourseListProps {
  departmentId?: number;
}

const CourseList: React.FC<CourseListProps> = ({ departmentId }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseCredits, setCourseCredits] = useState("");

  // Fetch courses
  const fetchCourses = async () => {
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

  useEffect(() => {
    if (departmentId !== undefined) {
      fetchCourses();
    }
  }, [departmentId]);

  // Add course
  const handleAddCourse = async (e: React.FormEvent) => {
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

  // Delete course
  const handleDeleteCourse = async (courseId: number) => {
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

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Course List</h2>
      <form onSubmit={handleAddCourse} className="mb-6 flex flex-col gap-2">
        <input type="text" placeholder="Course Name" value={courseName} onChange={e => setCourseName(e.target.value)} className="input input-bordered w-full" required disabled={departmentId === undefined} />
        <input type="text" placeholder="Course Code" value={courseCode} onChange={e => setCourseCode(e.target.value)} className="input input-bordered w-full" required disabled={departmentId === undefined} />
        <input type="number" placeholder="Credits" value={courseCredits} onChange={e => setCourseCredits(e.target.value)} className="input input-bordered w-full" required disabled={departmentId === undefined} />
        <button type="submit" className="btn btn-outline btn-sm mt-2 cursor-pointer custom-bordered-btn" disabled={loading || departmentId === undefined}>{loading ? "Adding..." : "Add Course"}</button>
      </form>
      {error && <div className="text-red-500 text-center mb-2">{error}</div>}
      {success && <div className="text-green-600 text-center mb-2">{success}</div>}
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Code</th>
            <th className="border px-4 py-2">Credits</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td className="border px-4 py-2">{course.id}</td>
              <td className="border px-4 py-2">{course.name}</td>
              <td className="border px-4 py-2">{course.code}</td>
              <td className="border px-4 py-2">{course.credits}</td>
              <td className="border px-4 py-2">
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 cursor-pointer"
                  onClick={() => handleDeleteCourse(course.id)}
                  disabled={loading}
                >
                  Delete Course
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourseList;
