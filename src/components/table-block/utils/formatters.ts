import { DataValue } from "@/lib/charts";

export function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

export function getAlignmentClass(align?: string): string {
  switch (align) {
    case 'center': return 'text-center';
    case 'right': return 'text-right';
    default: return 'text-left';
  }
}

export function detectAlignment(values: DataValue[]): 'left' | 'center' | 'right' {
  if (values.length === 0) return 'left';
  
  const nonNullValues = values.filter(val => val != null);
  if (nonNullValues.length === 0) return 'left';
  
  const isAllNumbers = nonNullValues.every(val =>
    typeof val === 'number' ||
    (typeof val === 'string' && !isNaN(Number(val)) && val.trim() !== '')
  );
  
  if (isAllNumbers) return 'right';
  
  const isAllDates = nonNullValues.every(val => {
    if (val instanceof Date) return true;
    if (typeof val === 'string') {
      const date = new Date(val);
      return !isNaN(date.getTime()) && val.match(/^\d{4}-\d{2}-\d{2}|^\d{1,2}\/\d{1,2}\/\d{4}/);
    }
    return false;
  });
  
  if (isAllDates) return 'center';
  
  return 'left';
}

export function detectWidth(key: string, values: DataValue[]): string | undefined {
  const shortFields = ['id', 'code', 'status', 'type'];
  const mediumFields = ['date', 'price', 'count', 'views', 'rating'];
  const wideFields = ['title', 'name', 'description', 'summary'];
  
  const lowerKey = key.toLowerCase();
  
  if (shortFields.some(field => lowerKey.includes(field))) {
    return '10%';
  }
  
  if (mediumFields.some(field => lowerKey.includes(field))) {
    return '15%';
  }
  
  if (wideFields.some(field => lowerKey.includes(field))) {
    return '30%';
  }
  
  if (values.length > 0) {
    const avgLength = values
      .filter(val => val != null)
      .reduce((sum: number, val) => sum + String(val).length, 0) / values.length;
    
    if (avgLength < 10) return '12%';
    if (avgLength < 20) return '18%';
    if (avgLength > 50) return '35%';
  }
  
  return undefined;
}