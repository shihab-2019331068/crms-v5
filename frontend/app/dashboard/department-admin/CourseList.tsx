import React, { useEffect, useState } from 'react';
import api from "@/services/api";
import { Teacher } from "./TeacherList";
import { Department } from "../super-admin/departmentList";

export interface Course {
  id: number;
  name: string;
  code: string;
  credits: number;
  departmentId: number;
  teacherName?: string;
  department?: { acronym: string };
  forDept?: number;
  forDepartment?: { acronym: string };
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assigningCourseId, setAssigningCourseId] = useState<number | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(departmentId ?? null);
  const [isMajor, setIsMajor] = useState(true);
  const [courseFilter, setCourseFilter] = useState<'all' | 'major' | 'non-major' | 'offered'>('all');
  const [selectedForDept, setSelectedForDept] = useState<number | null>(null);

  // Fetch courses
  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const deptId = departmentId ?? selectedDepartmentId;
      const res = await api.get("/dashboard/department-admin/courses", {
        params: { departmentId: deptId },
        withCredentials: true,
      });
      setCourses(res.data);
    } catch {
      setError("Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get<Department[]>("/departments", { withCredentials: true });
        setDepartments(res.data);
        if (!departmentId && res.data.length > 0) {
          setSelectedDepartmentId(res.data[0].id);
        }
      } catch {
        setError("Failed to fetch departments");
      }
    };
    if (departmentId !== undefined) {
      fetchCourses();
    }
    fetchDepartments();
  }, [departmentId]);

  const filteredCourses = courses.filter((course) => {
    if (!departmentId) return true;
    if (courseFilter === 'all') return true;
    if (courseFilter === 'major') {
      return course.departmentId === departmentId && course.forDept === departmentId;
    }
    if (courseFilter === 'non-major') {
      return course.forDept === departmentId && course.departmentId !== departmentId;
    }
    if (courseFilter === 'offered') {
      return course.departmentId === departmentId && course.forDept !== departmentId;
    }
    return true;
  });

  // Add course
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    let forDeptValue: number | null = null;
    if (isMajor) {
      forDeptValue = departmentId ?? selectedDepartmentId ?? null;
    } else {
      forDeptValue = selectedForDept;
    }
    try {
      await api.post(
        "/dashboard/department-admin/course",
        {
          name: courseName,
          code: courseCode,
          credits: Number(courseCredits),
          departmentId: departmentId ?? selectedDepartmentId,
          isMajor,
          forDept: forDeptValue,
        },
        { withCredentials: true }
      );
      setSuccess("Course added successfully!");
      setCourseName("");
      setCourseCode("");
      setCourseCredits("");
      setIsMajor(true);
      setSelectedForDept(null);
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

  // Fetch teachers for assignment
  const fetchTeachers = async () => {
    try {
      const res = await api.get("/dashboard/department-admin/teachers", { withCredentials: true });
      setTeachers(res.data);
    } catch {
      setError("Failed to fetch teachers");
    }
  };

  // Assign teacher to course
  const handleAssignTeacher = async (courseId: number) => {
    if (!selectedTeacherId) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post(
        "/dashboard/department-admin/assign-teacher",
        { courseId, teacherId: selectedTeacherId },
        { withCredentials: true }
      );
      setSuccess("Teacher assigned successfully!");
      setAssigningCourseId(null);
      setSelectedTeacherId(null);
      fetchCourses();
    } catch (err: unknown) {
      let errorMsg = "Failed to assign teacher";
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
      <h2 className="text-xl font-bold mb-4"> Course List </h2>
      <button
        className="text-white px-3 py-3 rounded cursor-pointer custom-bordered-btn"
        onClick={() => setShowAddForm((prev) => !prev)}
        disabled={departmentId === undefined && departments.length === 0}
      >
        {showAddForm ? "Hide Add Course Form" : "Add Course"}
      </button>
      {showAddForm && (
        <form onSubmit={handleAddCourse} className="mb-6 flex flex-col gap-2">
          <input type="text" placeholder="Course Name" value={courseName} onChange={e => setCourseName(e.target.value)} className="input input-bordered w-full" required disabled={loading} />
          <input type="text" placeholder="Course Code" value={courseCode} onChange={e => setCourseCode(e.target.value)} className="input input-bordered w-full" required disabled={loading} />
          <input type="number" placeholder="Credits" value={courseCredits} onChange={e => setCourseCredits(e.target.value)} className="input input-bordered w-full" required disabled={loading} />
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="majorType"
                checked={isMajor}
                onChange={() => setIsMajor(true)}
                className="radio radio-primary"
              />
              Major
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="majorType"
                checked={!isMajor}
                onChange={() => setIsMajor(false)}
                className="radio radio-primary"
              />
              Non-Major
            </label>
          </div>
          {!isMajor && (
            <select
              className="input input-bordered w-full bg-gray-800 text-white"
              value={selectedForDept ?? ''}
              onChange={e => setSelectedForDept(Number(e.target.value))}
              required
            >
              <option value="">Select Department</option>
              {departments
                .filter(dep => dep.id !== (departmentId ?? selectedDepartmentId))
                .map(dep => (
                  <option key={dep.id} value={dep.id}>{dep.name} ({dep.acronym})</option>
                ))}
            </select>
          )}
          <button type="submit" className="btn btn-outline btn-sm mt-2 cursor-pointer custom-bordered-btn" disabled={loading || (!isMajor && !selectedForDept)}>{loading ? "Adding..." : "Add Course"}</button>
        </form>
      )}
      {error && <div className="text-red-500 text-center mb-2">{error}</div>}
      {success && <div className="text-green-600 text-center mb-2">{success}</div>}
      <div className="flex gap-2 mb-4">
        <button
          className={`btn btn-sm ${courseFilter === 'all' ? 'btn-primary' : 'btn-outline'} cursor-pointer custom-bordered-btn`}
          onClick={() => setCourseFilter('all')}
          type="button"
        >
          All Courses
        </button>
        <button
          className={`btn btn-sm ${courseFilter === 'major' ? 'btn-primary' : 'btn-outline'} cursor-pointer custom-bordered-btn`}
          onClick={() => setCourseFilter('major')}
          type="button"
        >
          Major Courses
        </button>
        <button
          className={`btn btn-sm ${courseFilter === 'non-major' ? 'btn-primary' : 'btn-outline'} cursor-pointer custom-bordered-btn`}
          onClick={() => setCourseFilter('non-major')}
          type="button"
        >
          Non-Major Courses
        </button>
        <button
          className={`btn btn-sm ${courseFilter === 'offered' ? 'btn-primary' : 'btn-outline'} cursor-pointer custom-bordered-btn`}
          onClick={() => setCourseFilter('offered')}
          type="button"
        >
          Offered Courses
        </button>
      </div>
      <table className="min-w-full border " style={{ minWidth: '1500px' }}>
        <thead>
          <tr>
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Code</th>
            <th className="border px-4 py-2">Credits</th>
            <th className="border px-4 py-2">Department</th>
            <th className="border px-4 py-2">Offered To</th>
            <th className="border px-4 py-2">Teacher</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCourses.map((course) => {
            const departmentAcronym = course.department?.acronym || departments.find(dep => dep.id === course.departmentId)?.acronym || '';
            const forDepartmentAcronym = course.forDepartment?.acronym || departments.find(dep => dep.id === course.forDept)?.acronym || '';
            const canEdit = (departmentId ?? selectedDepartmentId) === course.departmentId;
            return (
              <tr key={course.id}>
                <td className="border px-4 py-2">{course.id}</td>
                <td className="border px-4 py-2">{course.name}</td>
                <td className="border px-4 py-2">{course.code}</td>
                <td className="border px-4 py-2">{course.credits}</td>
                <td className="border px-4 py-2">{departmentAcronym}</td>
                <td className="border px-4 py-2">{forDepartmentAcronym}</td>
                <td className="border px-4 py-2">{course.teacherName}</td>
                <td className="border px-4 py-2">
                  {canEdit && (
                    <>
                      <button
                        className="text-white px-3 py-1 cursor-pointer custom-bordered-btn mr-2"
                        onClick={() => handleDeleteCourse(course.id)}
                        disabled={loading}
                      >
                        Delete Course
                      </button>
                      <button
                        className="text-white px-3 py-1 cursor-pointer custom-bordered-btn"
                        onClick={async () => {
                          setAssigningCourseId(course.id);
                          setSelectedTeacherId(null);
                          await fetchTeachers();
                        }}
                        disabled={loading}
                      >
                        Add Teacher
                      </button>
                      {assigningCourseId === course.id && (
                        <div className="mt-2 flex flex-col gap-2">
                          <select
                            className="input input-bordered bg-gray-500 text-white w-full"
                            value={selectedTeacherId ?? ''}
                            onChange={e => setSelectedTeacherId(Number(e.target.value))}
                          >
                            <option value="">Select Teacher</option>
                            {teachers.map(teacher => (
                              <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                            ))}
                          </select>
                          <button
                            className="btn btn-outline btn-sm mt-1 cursor-pointer custom-bordered-btn"
                            onClick={() => handleAssignTeacher(course.id)}
                            disabled={loading || !selectedTeacherId}
                          >
                            {loading ? "Assigning..." : "Confirm Assignment"}
                          </button>
                          <button
                            className="btn btn-outline btn-xs mt-1 cursor-pointer custom-bordered-btn"
                            onClick={() => setAssigningCourseId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CourseList;
