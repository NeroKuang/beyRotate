"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { regionLabel } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export type CalendarEvent = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  region: string;
  venue: string | null;
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function TournamentCalendar({ events }: { events: CalendarEvent[] }) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = startOfMonth(cursor).getDay();
  const totalDays = daysInMonth(year, month);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const start = new Date(ev.starts_at);
      const end = ev.ends_at ? new Date(ev.ends_at) : start;
      const d = new Date(start);
      while (d <= end) {
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        const list = map.get(key) ?? [];
        if (!list.some((e) => e.id === ev.id)) list.push(ev);
        map.set(key, list);
        d.setDate(d.getDate() + 1);
      }
    }
    return map;
  }, [events]);

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = `${year} 年 ${month + 1} 月`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          className="bey-btn-secondary px-3 py-1 text-sm"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
        >
          ← 上月
        </button>
        <h2 className="font-bold">{monthLabel}</h2>
        <button
          type="button"
          className="bey-btn-secondary px-3 py-1 text-sm"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
        >
          下月 →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-500">
        {["日", "一", "二", "三", "四", "五", "六"].map((w) => (
          <div key={w} className="py-1 font-medium">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="min-h-[4.5rem] rounded bg-zinc-50/50 dark:bg-zinc-900/30" />;
          }
          const date = new Date(year, month, day);
          const key = `${year}-${month}-${day}`;
          const dayEvents = eventsByDay.get(key) ?? [];
          const isToday = sameDay(date, new Date());

          return (
            <div
              key={key}
              className={`min-h-[4.5rem] rounded border p-1 text-left text-xs ${
                isToday
                  ? "border-sky-400 bg-sky-50/80 dark:border-sky-600 dark:bg-sky-950/40"
                  : "border-zinc-100 bg-white dark:border-zinc-800 dark:bg-slate-950/50"
              }`}
            >
              <span className={`font-medium ${isToday ? "text-sky-700 dark:text-sky-300" : ""}`}>
                {day}
              </span>
              <ul className="mt-0.5 space-y-0.5">
                {dayEvents.slice(0, 2).map((ev) => (
                  <li key={ev.id}>
                    <Link
                      href={`/tournaments/${ev.id}`}
                      className="block truncate rounded bg-emerald-100/80 px-0.5 text-[10px] text-emerald-800 hover:underline dark:bg-emerald-900/40 dark:text-emerald-200"
                      title={ev.title}
                    >
                      {ev.title}
                    </Link>
                  </li>
                ))}
                {dayEvents.length > 2 && (
                  <li className="text-[10px] text-zinc-400">+{dayEvents.length - 2}</li>
                )}
              </ul>
            </div>
          );
        })}
      </div>

      {events.length === 0 && (
        <p className="text-center text-sm text-zinc-500">
          你尚未標記感興趣的賽事。到
          <Link href="/tournaments" className="mx-1 underline">賽事列表</Link>
          點「我有興趣」加入行事曆。
        </p>
      )}

      {events.length > 0 && (
        <ul className="space-y-2 border-t pt-4 dark:border-zinc-800">
          <p className="text-sm font-medium">清單</p>
          {events.map((ev) => (
            <li key={ev.id}>
              <Link href={`/tournaments/${ev.id}`} className="text-sm hover:underline">
                <span className="font-medium">{ev.title}</span>
                <span className="ml-2 text-zinc-500">
                  {formatDate(ev.starts_at)} · {regionLabel(ev.region)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
