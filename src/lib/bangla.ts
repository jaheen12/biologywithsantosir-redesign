// Converts numbers to Bengali numerals
export function toBengaliNumerals(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return '';
  const numStr = num.toString();
  const banglaDigits: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return numStr.replace(/[0-9]/g, (digit) => banglaDigits[digit] || digit);
}

// Formats Postgres time e.g. "16:00:00" -> "বিকাল ৪:০০"
export function formatBanglaTime(timeStr: string | null | undefined): string {
  if (!timeStr) return '—';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hour = parseInt(parts[0], 10);
  const minute = parts[1];
  
  let period = 'সকাল';
  if (hour >= 12 && hour < 16) {
    period = 'দুপুর';
  } else if (hour >= 16 && hour < 18) {
    period = 'বিকাল';
  } else if (hour >= 18 && hour < 20) {
    period = 'সন্ধ্যা';
  } else if (hour >= 20 || hour < 5) {
    period = 'রাত';
  }
  
  if (hour > 12) hour = hour - 12;
  if (hour === 0) hour = 12;
  
  const banglaDigits: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  
  const banglaHour = hour.toString().replace(/[0-9]/g, (digit) => banglaDigits[digit] || digit);
  const banglaMinute = minute.replace(/[0-9]/g, (digit) => banglaDigits[digit] || digit);
  
  return `${period} ${banglaHour}:${banglaMinute}`;
}

// Formats date string into Bangla format (e.g. "2026-06-10" -> "১০ জুন ২০২৬")
export function formatBanglaDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

// Formats date string into short Bangla format (e.g. "2026-06-10" -> "১০ জুন")
export function formatBanglaShortDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'long'
  });
}

// Returns the correct Bangla ordinal representation for a rank number (e.g. 1 -> ১ম, 4 -> ৪র্থ, 12 -> ১২তম)
export function getBanglaOrdinal(rank: number): string {
  const ordinals: Record<number, string> = {
    1: '১ম',
    2: '২য়',
    3: '৩য়',
    4: '৪র্থ',
    5: '৫ম',
    6: '৬ষ্ঠ',
    7: '৭ম',
    8: '৮ম',
    9: '৯ম',
    10: '১০ম'
  };
  if (ordinals[rank]) return ordinals[rank];
  return `${toBengaliNumerals(rank)}তম`;
}
