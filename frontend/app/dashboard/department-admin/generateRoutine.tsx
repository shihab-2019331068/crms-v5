"use client";
import { useState } from "react";
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
  };

  // Helper: get unique sorted time slots
  const getTimeSlots = (entries: RoutineEntry[]) => {
    const times = new Set<string>();
    entries.forEach((r) => {
      if (r.startTime) times.add(r.startTime);
    });
    return Array.from(times).sort();
  };

  // Helper: days of week
  const daysOfWeek = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];

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
                  {getTimeSlots(preview).map((time) => (
                    <tr key={time}>
                      <td className="font-semibold bg-dark text-white sticky left-0 z-10">{time}</td>
                      {daysOfWeek.map((day) => {
                        const cellEntries = getCellEntries(preview, day, time);
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
                                      <Draggable key={idx + droppableId} draggableId={droppableId + "-" + idx} index={idx}>
                                        {(dragProvided, snapshot) => (
                                          <div
                                            ref={dragProvided.innerRef}
                                            {...dragProvided.draggableProps}
                                            {...dragProvided.dragHandleProps}
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
