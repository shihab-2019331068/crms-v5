"use client";
import { useEffect, useState } from "react";
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

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

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
    <div className="rounded p-8 max-h-[90vh] min-h-[70vh] min-w-[1200px] overflow-auto shadow-2xl bg-dark">
      <h2 className="font-bold mb-4 text-lg">Final Routine</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {routine && (
        <div className="overflow-x-auto">
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
              {getTimeSlots(routine).map((time) => (
                <tr key={time}>
                  <td className="font-semibold bg-dark text-white sticky left-0 z-10">{time}</td>
                  {daysOfWeek.map((day) => {
                    const cellEntries = getCellEntries(routine, day, time);
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
        </div>
      )}
    </div>
  );
}
