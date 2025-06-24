"use client";
import { useEffect, useState, useMemo } from "react";
import api from "@/services/api";

interface RoutineEntry {
  semesterId: number | null;
  dayOfWeek: string | null;
  startTime: string | null;
  endTime: string | null;
  courseId: number | null;
  roomId: number | null;
  isBreak: boolean;
  note?: string;
}

interface FinalRoutineProps {
  departmentId?: number;
}

export default function FinalRoutine({ departmentId }: FinalRoutineProps) {
  const [routine, setRoutine] = useState<RoutineEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState<"room" | "semester" | "course" | "teacher" | "">("");
  const [filterValue, setFilterValue] = useState<number | null>(null);
  const [teacherId, setTeacherId] = useState<number | null>(null);
  const [teacherCourses, setTeacherCourses] = useState<number[]>([]);
  const [teachers, setTeachers] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    if (!departmentId) return;
    const fetchRoutine = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/routine/final?departmentId=${departmentId}`);
        setRoutine(res.data.routine);
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response) {
          const responseData = err.response.data as { error?: string };
          setError(responseData.error || "Failed to fetch final routine.");
        } else {
          setError("Failed to fetch final routine.");
        }
      }
      setLoading(false);
    };
    fetchRoutine();
  }, [departmentId]);

  const getTimeSlots = (entries: RoutineEntry[]) => {
    const times = new Set<string>();
    entries.forEach((r) => {
      if (r.startTime) times.add(r.startTime);
    });
    return Array.from(times).sort();
  };

  const daysOfWeek = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", ];

  const getCellEntries = (
    entries: RoutineEntry[],
    day: string,
    time: string
  ) => {
    return entries.filter(
      (r) => r.dayOfWeek?.toUpperCase() === day.toUpperCase() && r.startTime === time
    );
  };

  // Extract unique rooms, semesters, and courses from routine
  const uniqueRooms = useMemo(() => {
    if (!routine) return [];
    const ids = Array.from(new Set(routine.map(e => e.roomId).filter(Boolean)));
    return ids as number[];
  }, [routine]);
  const uniqueSemesters = useMemo(() => {
    if (!routine) return [];
    const ids = Array.from(new Set(routine.map(e => e.semesterId).filter(Boolean)));
    return ids as number[];
  }, [routine]);
  const uniqueCourses = useMemo(() => {
    if (!routine) return [];
    const ids = Array.from(new Set(routine.map(e => e.courseId).filter(Boolean)));
    return ids as number[];
  }, [routine]);

  // Fetch teacher's courses when filterType is 'teacher' and teacherId is set
  useEffect(() => {
    if (filterType !== "teacher" || !teacherId) return;
    const fetchCourses = async () => {
      try {
        const res = await api.get(`/teachers/${teacherId}/courses`, { withCredentials: true });
        setTeacherCourses((res.data.courses || []).map((c: { id: string | number }) => Number(c.id)));
      } catch {
        setTeacherCourses([]);
      }
    };
    fetchCourses();
  }, [filterType, teacherId]);

  // Fetch teachers for the department when filterType is 'teacher'
  useEffect(() => {
    if (filterType !== "teacher" || !departmentId) return;
    const fetchTeachers = async () => {
      try {
        const res = await api.get("/dashboard/department-admin/teachers", { withCredentials: true });
        setTeachers(res.data || []);
      } catch {
        setTeachers([]);
      }
    };
    fetchTeachers();
  }, [filterType, departmentId]);

  // Filtered routine
  const filteredRoutine = useMemo(() => {
    if (!routine) return null;
    if (!filterType) return routine;
    if ((filterType === "room" || filterType === "semester" || filterType === "course") && !filterValue) return routine;
    if (filterType === "room") return routine.filter(e => e.roomId === filterValue);
    if (filterType === "semester") return routine.filter(e => e.semesterId === filterValue);
    if (filterType === "course") return routine.filter(e => e.courseId === filterValue);
    if (filterType === "teacher") return routine.filter(e => teacherCourses.includes(Number(e.courseId)));
    return routine;
  }, [routine, filterType, filterValue, teacherCourses]);

  return (
    <div className="rounded p-8 shadow-2xl bg-dark">
      <h2 className="font-bold mb-4 text-lg">Final Routine</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {routine && (
        <>
          {/* Filter Controls */}
          <div className="flex gap-4 mb-4">
            <select
              className="input input-bordered bg-gray-700 text-white"
              value={filterType}
              onChange={e => {
                setFilterType(e.target.value as "room" | "semester" | "course" | "teacher" | "");
                setFilterValue(null);
                setTeacherId(null);
                setTeacherCourses([]);
              }}
            >
              <option value="">Filter By</option>
              <option value="room">Room</option>
              <option value="semester">Semester</option>
              <option value="course">Course</option>
              <option value="teacher">Teacher</option>
            </select>
            {filterType === "room" && (
              <select
                className="input input-bordered bg-gray-700 text-white"
                value={filterValue ?? ""}
                onChange={e => setFilterValue(Number(e.target.value) || null)}
              >
                <option value="">Select Room</option>
                {uniqueRooms.map(id => (
                  <option key={id} value={id}>Room {id}</option>
                ))}
              </select>
            )}
            {filterType === "semester" && (
              <select
                className="input input-bordered bg-gray-700 text-white"
                value={filterValue ?? ""}
                onChange={e => setFilterValue(Number(e.target.value) || null)}
              >
                <option value="">Select Semester</option>
                {uniqueSemesters.map(id => (
                  <option key={id} value={id}>Semester {id}</option>
                ))}
              </select>
            )}
            {filterType === "course" && (
              <select
                className="input input-bordered bg-gray-700 text-white"
                value={filterValue ?? ""}
                onChange={e => setFilterValue(Number(e.target.value) || null)}
              >
                <option value="">Select Course</option>
                {uniqueCourses.map(id => (
                  <option key={id} value={id}>Course {id}</option>
                ))}
              </select>
            )}
            {filterType === "teacher" && (
              <select
                className="input input-bordered bg-gray-700 text-white"
                value={teacherId ?? ""}
                onChange={e => setTeacherId(Number(e.target.value) || null)}
              >
                <option value="">Select Teacher</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
            {(filterType && (filterValue || (filterType === "teacher" && teacherId))) && (
              <button className="btn btn-xs btn-outline ml-2 cursor-pointer custom-bordered-btn" onClick={() => { setFilterType(""); setFilterValue(null); setTeacherId(null); setTeacherCourses([]); }}>Clear Filter</button>
            )}
          </div>
          <table className="table w-full text-lg bg-dark" style={{ minWidth: '1500px' }}>
            <thead>
              <tr>
                <th className="bg-dark text-white sticky left-0 z-10">Time</th>
                {daysOfWeek.map((day) => (
                  <th key={day} className="bg-dark text-white">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(filteredRoutine ? getTimeSlots(filteredRoutine) : []).map((time) => (
                <tr key={time}>
                  <td className="font-semibold bg-dark text-white sticky left-0 z-10">{time}</td>
                  {daysOfWeek.map((day) => {
                    const cellEntries = getCellEntries(filteredRoutine || [], day, time);
                    return (
                      <td key={day} className="align-top min-w-[140px] border border-gray-200 bg-dark">
                        <div style={{ minHeight: 40 }}>
                          {cellEntries.length === 0 ? (
                            <span className="text-gray-300">-</span>
                          ) : (
                            cellEntries.map((r, idx) => (
                              <div
                                key={idx}
                                className={`mb-2 rounded shadow ${r.note ? "bg-yellow-100" : "bg-blue-50"}`}
                              >
                                <div className="font-bold text-xs truncate bg-gray-700">
                                  Semester: {r.semesterId}
                                </div>
                                <div className="text-xs bg-gray-700">
                                  Course: {r.courseId} <br />
                                  Room: {r.roomId}
                                </div>
                                {r.note && (
                                  <div className="text-s text-yellow-700">{r.note}</div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
