"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

/** Local date components only — never routes through toISOString(), which converts to UTC and
 * can silently shift the date by a day depending on the visitor's timezone and time of day. */
function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parses via the (year, month, day) constructor, not `new Date(isoString)` — that form parses
 * as UTC midnight, which the same timezone shift then displays as the wrong local day. */
function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO(): string {
  return toISO(new Date());
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

interface DatePickerProps {
  /** ISO yyyy-mm-dd */
  value: string;
  onChange: (value: string) => void;
  /** ISO yyyy-mm-dd, defaults to today — days after this are shown but not selectable. */
  max?: string;
  /** When set, also renders a hidden input with this name, so the picker drops straight into an
   * existing <form action={...}> without the page needing its own hidden input. */
  name?: string;
}

/**
 * A small popover calendar replacing the browser's native date input, which renders as
 * segmented day/month/year fields that look inert unless you already know you have to click
 * directly on one segment and type over it — easy to miss, easy to silently submit whatever it
 * defaulted to (see git log for the actual bug report). This shows the selected date as plain,
 * obviously-clickable text and opens a real calendar to change it.
 */
export function DatePicker({ value, onChange, max, name }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const maxDate = max ? parseISO(max) : parseISO(todayISO());
  const selected = parseISO(value);
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Nudges the panel back on screen when opening it near an edge. The "Watched" field sits at the
   * right of its row on /log, so a panel anchored to the field's left ran straight off a phone
   * viewport — the calendar was cut in half mid-week.
   *
   * Writes the transform directly rather than through state: this has to happen before paint (a
   * visible jump otherwise), and measuring then setting state would re-render for a value only the
   * DOM needs. Both edges are handled, since the same picker is left-aligned in the rewatch form.
   */
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;

    panel.style.transform = "";
    const rect = panel.getBoundingClientRect();
    // documentElement.clientWidth, not window.innerWidth: innerWidth includes any horizontal
    // overflow the page already has, so measuring against it let the panel "fit" inside an area
    // that was only that wide *because the panel was hanging off the edge*.
    const viewport = document.documentElement.clientWidth;
    const margin = 8;
    let shift = 0;
    if (rect.right > viewport - margin) shift = viewport - margin - rect.right;
    if (rect.left + shift < margin) shift = margin - rect.left;
    if (shift !== 0) panel.style.transform = `translateX(${shift}px)`;
  }, [open]);

  function openPicker() {
    setViewYear(selected.getFullYear());
    setViewMonth(selected.getMonth());
    setOpen((v) => !v);
  }

  function goMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setViewMonth(m);
    setViewYear(y);
  }

  const startWeekday = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: Array<Date | null> = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ];
  const today = parseISO(todayISO());

  return (
    <div ref={containerRef} className="relative inline-block">
      {name && <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        onClick={openPicker}
        aria-expanded={open}
        className="border-b border-line pb-1.5 text-[13px] whitespace-nowrap text-ink outline-none hover:border-line-strong"
      >
        {selected.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
      </button>

      {open && (
        <div
          ref={panelRef}
          /* max-w so a viewport narrower than the panel shrinks it instead of letting it hang off
             the edge and give the whole page a horizontal scrollbar. */
          className="popover absolute top-full left-0 z-30 mt-2 w-[236px] max-w-[calc(100vw-1rem)] rounded-xl p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => goMonth(-1)}
              aria-label="Previous month"
              className="px-1.5 text-[13px] text-ink-soft hover:text-ink"
            >
              ‹
            </button>
            <span className="text-[11.5px] font-semibold text-ink">
              {new Date(viewYear, viewMonth).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <button
              type="button"
              onClick={() => goMonth(1)}
              aria-label="Next month"
              className="px-1.5 text-[13px] text-ink-soft hover:text-ink"
            >
              ›
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 text-center text-[9px] text-ink-faint">
            {WEEKDAYS.map((w, i) => (
              <span key={i}>{w}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((d, i) => {
              if (!d) return <span key={i} />;
              const future = d > maxDate;
              const isSelected = isSameDay(d, selected);
              const isToday = isSameDay(d, today);
              return (
                <button
                  type="button"
                  key={i}
                  disabled={future}
                  onClick={() => {
                    onChange(toISO(d));
                    setOpen(false);
                  }}
                  className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
                    isSelected
                      ? "bg-accent-strong font-semibold text-white"
                      : future
                        ? "cursor-not-allowed text-ink-faint/30"
                        : isToday
                          ? "text-accent-strong"
                          : "text-ink-soft hover:bg-glass-edge"
                  }`}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
