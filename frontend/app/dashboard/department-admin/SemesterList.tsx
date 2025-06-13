import React, { useEffect, useState } from 'react';
import api from "@/services/api";

export interface Semester {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  departmentId: number;
}

interface SemesterListProps {
  user: { email?: string; role?: string; departmentId?: number } | null;
}

const SemesterList: React.FC<SemesterListProps> = ({ user }) => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [departmentId, setDepartmentId] = useState<number | undefined>(undefined);
  // Add state for add course form
  const [showAddCourseFormId, setShowAddCourseFormId] = useState<number | null>(null);
  const [addCourseId, setAddCourseId] = useState("");
  const [addCourseLoading, setAddCourseLoading] = useState(false);
  const [addCourseError, setAddCourseError] = useState("");
  const [addCourseSuccess, setAddCourseSuccess] = useState("");
  // Placeholder for courses, you may want to fetch this from API
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
  // State for showing courses per semester
  const [showCoursesSemesterId, setShowCoursesSemesterId] = useState<number | null>(null);
  const [semesterCourses, setSemesterCourses] = useState<{ [semesterId: number]: { id: number; name: string }[] }>({});
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState("");

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user?.email) return;
      try {
        const res = await api.get(`/user/${encodeURIComponent(user.email)}`);
        if (res.data && res.data.role === "department_admin") {
          setDepartmentId(res.data.departmentId);
        }
      } catch {
        setDepartmentId(undefined);
      }
    };
    fetchUserDetails();
  }, [user?.email]);

  const fetchSemesters = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/dashboard/department-admin/semesters", { withCredentials: true });
      setSemesters(res.data);
      setSuccess("");
    } catch {
      setError("Failed to fetch semesters");
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses for dropdown (replace with your API endpoint)
  const fetchCourses = async () => {
    try {
      const res = await api.get("/dashboard/department-admin/courses", { withCredentials: true });
      setCourses(res.data);
    } catch {
      setCourses([]);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, [departmentId]);

  // Fetch courses when add course form is shown
  useEffect(() => {
    if (showAddCourseFormId !== null) {
      fetchCourses();
    }
  }, [showAddCourseFormId]);

  // Handler for adding course to semester (moved from main page and deptAdminHandlers)
  const handleAddCourseToSemester = async (
    e: React.FormEvent,
    semesterId: number
  ) => {
    e.preventDefault();
    setAddCourseLoading(true);
    setAddCourseError("");
    setAddCourseSuccess("");
    try {
      await api.post(
        "/dashboard/department-admin/semester/course",
        {
          semesterId: Number(semesterId),
          courseId: Number(addCourseId),
        },
        { withCredentials: true }
      );
      setAddCourseSuccess("Course added to semester!");
      setAddCourseId("");
      setShowAddCourseFormId(null);
      fetchSemesters();
    } catch (err: unknown) {
      let errorMsg = "Failed to add course to semester";
      if (err && typeof err === 'object' && 'response' in err && 
          err.response && typeof err.response === 'object' && 
          'data' in err.response && err.response.data && 
          typeof err.response.data === 'object' && 
          'error' in err.response.data) {
        errorMsg = String(err.response.data.error);
      }
      setAddCourseError(errorMsg);
    } finally {
      setAddCourseLoading(false);
    }
  };

  // Fetch courses for a specific semester
  const fetchSemesterCourses = async (semesterId: number) => {
    setCoursesLoading(true);
    setCoursesError("");
    try {
      const res = await api.get(`/dashboard/department-admin/semester/${semesterId}/courses`, { withCredentials: true });
      setSemesterCourses(prev => ({ ...prev, [semesterId]: res.data }));
    } catch {
      setCoursesError("Failed to fetch courses for this semester");
    } finally {
      setCoursesLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Semester List</h2>
      {error && <div className="text-red-500 text-center mb-2">{error}</div>}
      {success && <div className="text-green-600 text-center mb-2">{success}</div>}
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {semesters.map((semester) => (
            <React.Fragment key={semester.id}>
              <tr>
                <td className="border px-4 py-2">{semester.name}</td>
                <td className="border px-4 py-2 flex gap-2">
                  <button
                    className="btn btn-outline btn-xs custom-bordered-btn  cursor-pointer"
                    onClick={() => {
                      setShowAddCourseFormId(semester.id);
                      setAddCourseId("");
                      setAddCourseError("");
                      setAddCourseSuccess("");
                    }}
                  >
                    Add Course
                  </button>
                  <button
                    className="btn btn-outline btn-xs custom-bordered-btn cursor-pointer"
                    onClick={() => {
                      if (showCoursesSemesterId === semester.id) {
                        setShowCoursesSemesterId(null);
                      } else {
                        setShowCoursesSemesterId(semester.id);
                        fetchSemesterCourses(semester.id);
                      }
                    }}
                  >
                    {showCoursesSemesterId === semester.id ? "Hide Courses" : "Show Courses"}
                  </button>
                </td>
              </tr>
              {showAddCourseFormId === semester.id && (
                <tr>
                  <td colSpan={2} className="border px-4 py-2 bg-gray-50 dark:bg-gray-900">
                    <form
                      onSubmit={e => handleAddCourseToSemester(e, semester.id)}
                      className="flex flex-col gap-2"
                    >
                      <select
                        value={addCourseId}
                        onChange={e => setAddCourseId(e.target.value)}
                        className="input input-bordered w-full form-bg-dark"
                        required
                      >
                        <option value="" disabled>Select Course</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="btn btn-outline btn-xs custom-bordered-btn"
                          disabled={addCourseLoading}
                        >
                          {addCourseLoading ? "Adding..." : "Add Course"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-xs custom-bordered-btn"
                          onClick={() => setShowAddCourseFormId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                      {addCourseError && <div className="text-red-500 text-xs">{addCourseError}</div>}
                      {addCourseSuccess && <div className="text-green-600 text-xs">{addCourseSuccess}</div>}
                    </form>
                  </td>
                </tr>
              )}
              {showCoursesSemesterId === semester.id && (
                <tr>
                  <td colSpan={2} className="border px-4 py-2 bg-gray-50 dark:bg-gray-900">
                    {coursesLoading ? (
                      <div>Loading courses...</div>
                    ) : coursesError ? (
                      <div className="text-red-500 text-xs">{coursesError}</div>
                    ) : (
                      <ul className="list-disc pl-5">
                        {(semesterCourses[semester.id] || []).length === 0 ? (
                          <li>No courses found for this semester.</li>
                        ) : (
                          semesterCourses[semester.id].map(course => (
                            <li key={course.id}>{course.name}</li>
                          ))
                        )}
                      </ul>
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SemesterList;
