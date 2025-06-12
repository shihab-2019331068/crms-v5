import React, { useState } from "react";

// Define the time slots (8am to 6pm, hourly)
const TIME_SLOTS = Array.from({ length: 10 }, (_, i) => `${8 + i}:00`);
const WEEK_DAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

interface ScheduleCell {
  courseName: string;
  teacherName: string;
  roomNumber: string;
}

type WeekSchedule = {
  [day: string]: {
    [time: string]: ScheduleCell;
  };
};

const getEmptySchedule = (): WeekSchedule => {
  const schedule: WeekSchedule = {};
  WEEK_DAYS.forEach((day) => {
    schedule[day] = {};
    TIME_SLOTS.forEach((time) => {
      schedule[day][time] = { courseName: "", teacherName: "", roomNumber: "" };
    });
  });
  return schedule;
};

const WeeklySchedulePreview: React.FC = () => {
  const [schedule, setSchedule] = useState<WeekSchedule>(getEmptySchedule());

  const handleCellChange = (
    day: string,
    time: string,
    field: keyof ScheduleCell,
    value: string
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [time]: {
          ...prev[day][time],
          [field]: value,
        },
      },
    }));
  };

  return (
    <div className="w-full flex justify-start">
      <table className="table-fixed w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border px-1 py-1 w-24">Day / Time</th>
            {TIME_SLOTS.map((time) => (
              <th key={time} className="border px-1 py-1 w-32">{time}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {WEEK_DAYS.map((day) => (
            <tr key={day}>
              <td className="border px-1 py-1 font-semibold">{day}</td>
              {TIME_SLOTS.map((time) => (
                <td key={time} className="border px-1 py-1">
                  <input
                    type="text"
                    placeholder="Course"
                    value={schedule[day][time].courseName}
                    onChange={(e) => handleCellChange(day, time, "courseName", e.target.value)}
                    className="w-full text-xs p-0.5"
                  />
                  <input
                    type="text"
                    placeholder="Teacher"
                    value={schedule[day][time].teacherName}
                    onChange={(e) => handleCellChange(day, time, "teacherName", e.target.value)}
                    className="w-full text-xs p-0.5"
                  />
                  <input
                    type="text"
                    placeholder="Room"
                    value={schedule[day][time].roomNumber}
                    onChange={(e) => handleCellChange(day, time, "roomNumber", e.target.value)}
                    className="w-full text-xs p-0.5"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WeeklySchedulePreview;
