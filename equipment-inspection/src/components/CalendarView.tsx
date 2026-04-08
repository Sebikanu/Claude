import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
  format,
  isToday,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { useStore, getEquipmentStatus } from '../store/useStore';
import type { Equipment } from '../types';
import { CATEGORY_ICONS } from '../types';

const STATUS_DOT: Record<string, string> = {
  overdue: 'bg-red-500',
  warning: 'bg-amber-400',
  ok: 'bg-green-500',
  uninspected: 'bg-gray-400',
};

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const equipment = useStore((s) => s.equipment);
  const setActiveView = useStore((s) => s.setActiveView);
  const setSelectedEquipmentId = useStore((s) => s.setSelectedEquipmentId);

  // Group equipment by next inspection date
  const equipmentByDate = equipment.reduce<Record<string, Equipment[]>>((acc, eq) => {
    if (!eq.nextInspectionDate) return acc;
    const key = eq.nextInspectionDate;
    acc[key] = acc[key] ? [...acc[key], eq] : [eq];
    return acc;
  }, {});

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const selectedDayEquipment = selectedDay
    ? equipmentByDate[format(selectedDay, 'yyyy-MM-dd')] ?? []
    : [];

  // Upcoming events (next 60 days)
  const today = new Date();
  const upcoming = equipment
    .filter((eq) => {
      if (!eq.nextInspectionDate) return false;
      const d = parseISO(eq.nextInspectionDate);
      const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000);
      return diff >= -30 && diff <= 60;
    })
    .sort((a, b) => (a.nextInspectionDate ?? '').localeCompare(b.nextInspectionDate ?? ''));

  return (
    <div className="p-6 space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Month navigation */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <h2 className="font-bold text-slate-800 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: de })}
            </h2>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2.5">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {days.map((d) => {
              const key = format(d, 'yyyy-MM-dd');
              const items = equipmentByDate[key] ?? [];
              const isSelected = selectedDay && isSameDay(d, selectedDay);
              const isCurrentMonth = isSameMonth(d, currentMonth);
              const todayDay = isToday(d);

              return (
                <div
                  key={key}
                  onClick={() => setSelectedDay(isSameDay(d, selectedDay ?? new Date(-1)) ? null : d)}
                  className={`min-h-[72px] p-1.5 cursor-pointer transition-colors ${
                    !isCurrentMonth ? 'bg-slate-50/60' : 'hover:bg-blue-50/40'
                  } ${isSelected ? 'bg-blue-50 ring-2 ring-inset ring-blue-500' : ''}`}
                >
                  <div
                    className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold mb-1 ${
                      todayDay
                        ? 'bg-blue-600 text-white'
                        : isCurrentMonth
                        ? 'text-slate-700'
                        : 'text-slate-300'
                    }`}
                  >
                    {format(d, 'd')}
                  </div>

                  <div className="space-y-0.5">
                    {items.slice(0, 3).map((eq) => {
                      const status = getEquipmentStatus(eq);
                      return (
                        <div
                          key={eq.id}
                          className={`flex items-center gap-1 px-1 py-0.5 rounded text-xs truncate ${
                            status === 'overdue' ? 'bg-red-100 text-red-800' :
                            status === 'warning' ? 'bg-amber-100 text-amber-800' :
                            'bg-green-100 text-green-800'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[status]}`} />
                          <span className="truncate">{eq.name}</span>
                        </div>
                      );
                    })}
                    {items.length > 3 && (
                      <p className="text-xs text-slate-400 px-1">+{items.length - 3} weitere</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Selected day detail */}
          {selectedDay && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-blue-50">
                <p className="font-semibold text-blue-800 capitalize">
                  {format(selectedDay, 'EEEE, d. MMMM yyyy', { locale: de })}
                </p>
                <p className="text-xs text-blue-600">
                  {selectedDayEquipment.length} Prüfung(en) fällig
                </p>
              </div>
              {selectedDayEquipment.length === 0 ? (
                <p className="px-4 py-4 text-sm text-slate-400">Keine Prüfungen an diesem Tag.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {selectedDayEquipment.map((eq) => {
                    const status = getEquipmentStatus(eq);
                    return (
                      <div key={eq.id} className="px-4 py-3 flex items-center gap-3">
                        <span className="text-xl">{CATEGORY_ICONS[eq.category]}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 text-sm truncate">{eq.name}</p>
                          <p className="text-xs text-slate-500">{eq.location}</p>
                        </div>
                        <button
                          onClick={() => { setSelectedEquipmentId(eq.id); setActiveView('inspection-new'); }}
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            status === 'overdue' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                            status === 'warning' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                            'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          } transition-colors`}
                        >
                          Prüfen
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Upcoming inspections list */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 text-sm">Anstehende Prüfungen</h3>
              <p className="text-xs text-slate-500">Nächste 60 Tage</p>
            </div>
            {upcoming.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-400 text-center">Keine anstehenden Prüfungen.</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {upcoming.map((eq) => {
                  const status = getEquipmentStatus(eq);
                  const nextDate = eq.nextInspectionDate ? parseISO(eq.nextInspectionDate) : null;
                  const diffDays = nextDate
                    ? Math.ceil((nextDate.getTime() - today.getTime()) / 86400000)
                    : null;

                  return (
                    <div
                      key={eq.id}
                      className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => {
                        if (nextDate) setSelectedDay(nextDate);
                      }}
                    >
                      <span className="text-lg">{CATEGORY_ICONS[eq.category]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm truncate">{eq.name}</p>
                        <p className="text-xs text-slate-500">
                          {nextDate ? format(nextDate, 'd. MMM', { locale: de }) : '–'}
                        </p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        status === 'overdue' ? 'bg-red-100 text-red-700' :
                        status === 'warning' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {diffDays !== null && diffDays < 0
                          ? `${Math.abs(diffDays)}d überfällig`
                          : diffDays === 0 ? 'Heute'
                          : `in ${diffDays}d`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
