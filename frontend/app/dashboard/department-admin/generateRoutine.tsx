"use client";
import { useState, useMemo } from "react";
import api from "@/services/api";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

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

interface GenerateRoutineProps {
  departmentId?: number;
  onSuccess?: (msg: string) => void;
  onError?: (msg: string) => void;
}

export default function GenerateRoutine({ departmentId, onSuccess }: GenerateRoutineProps) {
  const [preview, setPreview] = useState<RoutineEntry[] | null>(null);
  const [unassigned, setUnassigned] = useState<RoutineEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [filterType, setFilterType] = useState<"room" | "semester" | "course" | "">("");
  const [filterValue, setFilterValue] = useState<number | null>(null);

  const handlePreview = async () => {
    if (!departmentId) return setError("Department ID not found.");
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.post("/routine/preview", { departmentId });
      setPreview(res.data.routine);
      setUnassigned(res.data.unassigned);
      setShowPreview(true);
      setLoading(false);
    } catch (err: Error | unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error?.response?.data?.error || "Failed to generate preview.");
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!departmentId) return setError("Department ID not found.");
    if (!preview || preview.length === 0) return setError("No routine to save.");
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.post("/routine/generate", { routine: preview });
      setSuccess(res.data.message || "Routine saved successfully.");
      setShowPreview(false);
      if (onSuccess) onSuccess(res.data.message);
      setLoading(false);
    } catch (err: Error | unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error?.response?.data?.error || "Failed to generate preview.");
      setLoading(false);
    }
  };

  // Move a routine entry from one cell to another
  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !preview) return;
    const [fromTime, fromDay] = result.source.droppableId.split("|");
    const [toTime, toDay] = result.destination.droppableId.split("|");
    if (fromTime === toTime && fromDay === toDay) return;
    // Find the entry being moved
    const fromEntries = getCellEntries(preview, fromDay, fromTime);
    const entry = fromEntries[result.source.index];
    if (!entry) return;

    // Check for conflicts in the destination cell
    const toCellEntries = getCellEntries(preview, toDay, toTime);
    const hasConflict = toCellEntries.some((e) =>
      (entry.roomId && e.roomId === entry.roomId) ||
      (entry.courseId && e.courseId === entry.courseId) ||
      (entry.semesterId && e.semesterId === entry.semesterId)
    );
    if (hasConflict) {
      setError("Conflict: Room, course, or semester already assigned in this slot.");
      return;
    }

    // Remove from old cell, add to new cell (update dayOfWeek and startTime)
    const newPreview = preview.filter((e) => {
      if (
        e.dayOfWeek?.toUpperCase() === fromDay.toUpperCase() &&
        e.startTime === fromTime
      ) {
        // Only remove the dragged entry at the correct index
        const idx = getCellEntries(preview, fromDay, fromTime).indexOf(e);
        return idx !== result.source.index;
      }
      return true;
    });
    newPreview.push({ ...entry, dayOfWeek: toDay, startTime: toTime });
    setPreview([...newPreview]);
    setError(""); // Clear any previous error
  };

  // Helper: fixed time slots from 08:00 to 17:00
  const fixedTimeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  // Helper: format time to 12-hour format
  const formatTime12Hour = (time: string) => {
    if (!time) return "";
    const [hourStr, minute] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour.toString().padStart(2, "0")}:${minute} ${ampm}`;
  };

  // Helper: days of week
  const daysOfWeek = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY",];

  // Helper: get entries for a cell
  const getCellEntries = (
    entries: RoutineEntry[],
    day: string,
    time: string
  ) => {
    return entries.filter(
      (r) => r.dayOfWeek?.toUpperCase() === day.toUpperCase() && r.startTime === time
    );
  };

  // Extract unique rooms, semesters, and courses from preview
  const uniqueRooms = useMemo(() => {
    if (!preview) return [];
    const ids = Array.from(new Set(preview.map(e => e.roomId).filter(Boolean)));
    return ids as number[];
  }, [preview]);
  const uniqueSemesters = useMemo(() => {
    if (!preview) return [];
    const ids = Array.from(new Set(preview.map(e => e.semesterId).filter(Boolean)));
    return ids as number[];
  }, [preview]);
  const uniqueCourses = useMemo(() => {
    if (!preview) return [];
    const ids = Array.from(new Set(preview.map(e => e.courseId).filter(Boolean)));
    return ids as number[];
  }, [preview]);

  // Filtered preview
  const filteredPreview = useMemo(() => {
    if (!preview) return null;
    if (!filterType || !filterValue) return preview;
    if (filterType === "room") return preview.filter(e => e.roomId === filterValue);
    if (filterType === "semester") return preview.filter(e => e.semesterId === filterValue);
    if (filterType === "course") return preview.filter(e => e.courseId === filterValue);
    return preview;
  }, [preview, filterType, filterValue]);

  return (
    <div className="space-y-4">
      <button className="btn btn-primary w-full cursor-pointer custom-bordered-btn" onClick={handlePreview} disabled={loading}>
        {loading ? "Generating Preview..." : "Preview Routine"}
      </button>
      {error && <div className="text-red-500 text-center">{error}</div>}
      {success && <div className="text-green-600 text-center">{success}</div>}
      {showPreview && preview && (
        <div className="rounded p-8 max-h-[90vh] min-h-[70vh] min-w-[1200px] overflow-auto shadow-2xl bg-dark">
          <h2 className="font-bold mb-4 text-lg">Routine Preview</h2>
          {/* Filter Controls */}
          <div className="flex gap-4 mb-4">
            <select
              className="input input-bordered bg-gray-700 text-white"
              value={filterType}
              onChange={e => {
                setFilterType(e.target.value as "room" | "semester" | "course" | "");
                setFilterValue(null);
              }}
            >
              <option value="">Filter By</option>
              <option value="room">Room</option>
              <option value="semester">Semester</option>
              <option value="course">Course</option>
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
            {(filterType && filterValue) && (
              <button className="btn btn-xs btn-outline ml-2 cursor-pointer custom-bordered-btn" onClick={() => { setFilterType(""); setFilterValue(null); }}>Clear Filter</button>
            )}
          </div>
          <div className="overflow-x-auto">
            <DragDropContext onDragEnd={onDragEnd}>
              <table className="table w-full text-lg bg-dark">
                <thead>
                  <tr>
                    <th className="bg-dark text-white sticky left-0 z-10">Time</th>
                    {daysOfWeek.map((day) => (
                      <th key={day} className="bg-dark text-white">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fixedTimeSlots.map((time) => (
                    <tr key={time}>
                      <td className="font-semibold bg-dark text-white sticky left-0 z-10">{formatTime12Hour(time)}</td>
                      {daysOfWeek.map((day) => {
                        // Use filteredPreview instead of preview
                        const cellEntries = getCellEntries(filteredPreview || [], day, time);
                        const droppableId = `${time}|${day}`;
                        return (
                          <td key={day} className="align-top min-w-[140px] border border-gray-200 bg-dark">
                            <Droppable droppableId={droppableId} direction="vertical">
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: 40 }}>
                                  {cellEntries.length === 0 ? (
                                    <span className="text-gray-300">-</span>
                                  ) : (
                                    cellEntries.map((r, idx) => (
                                      <Draggable key={idx} draggableId={day + time + idx} index={idx}>
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={`mb-2 rounded shadow cursor-move ${r.note ? "bg-yellow-100" : "bg-blue-50"} ${snapshot.isDragging ? "ring-2 ring-blue-400" : ""}`}
                                          >
                                            <div className="font-bold text-m truncate bg-gray-700">
                                              Semester: {r.semesterId}
                                            </div>
                                            <div className="text-s bg-gray-700">
                                              Course: {r.courseId} <br />
                                              Room: {r.roomId}
                                            </div>
                                            {r.note && (
                                              <div className="text-s text-yellow-700">{r.note}</div>
                                            )}
                                          </div>
                                        )}
                                      </Draggable>
                                    ))
                                  )}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </DragDropContext>
          </div>
          {unassigned && unassigned.length > 0 && (
            <div className="mt-2 text-yellow-700">
              <b>Unassigned:</b>
              <ul className="list-disc ml-6">
                {unassigned.map((u, i) => (
                  <li key={i}>{u.note || "Could not assign class."}</li>
                ))}
              </ul>
            </div>
          )}
          <button className="btn btn-success mt-4 w-full cursor-pointer custom-bordered-btn" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Routine"}
          </button>
        </div>
      )}
    </div>
  );
}
