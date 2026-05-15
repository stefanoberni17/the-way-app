// Helper TZ Roma: dato un istante, ritorna il lunedi' della sua settimana
// di calendario (formato 'YYYY-MM-DD'). Usato dal tracker pratiche
// per resettare le caselle Lun-Dom ogni nuova settimana.

const ROME_TZ = 'Europe/Rome';

function partsInRome(date: Date): { year: number; month: number; day: number; weekday: number } {
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: ROME_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });

  const parts = fmt.formatToParts(date);
  const get = (t: string) => parts.find(p => p.type === t)?.value || '';

  const year = parseInt(get('year'), 10);
  const month = parseInt(get('month'), 10);
  const day = parseInt(get('day'), 10);

  const weekdayMap: Record<string, number> = {
    Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7,
  };
  const weekday = weekdayMap[get('weekday')] || 1;

  return { year, month, day, weekday };
}

export function getMondayRome(date: Date = new Date()): string {
  const { year, month, day, weekday } = partsInRome(date);
  const utc = Date.UTC(year, month - 1, day);
  const monday = new Date(utc - (weekday - 1) * 24 * 60 * 60 * 1000);

  const y = monday.getUTCFullYear();
  const m = String(monday.getUTCMonth() + 1).padStart(2, '0');
  const d = String(monday.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Data odierna in TZ Roma in formato 'YYYY-MM-DD'.
// Usata dal modulo Vita Quotidiana per identificare il giorno del check-in.
export function getTodayRome(date: Date = new Date()): string {
  const { year, month, day } = partsInRome(date);
  const y = String(year);
  const m = String(month).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Sottrae N giorni a una data 'YYYY-MM-DD' (timezone-safe, lavora in UTC).
export function subtractDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const utc = Date.UTC(y, m - 1, d) - days * 24 * 60 * 60 * 1000;
  const out = new Date(utc);
  const yy = out.getUTCFullYear();
  const mm = String(out.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(out.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}
