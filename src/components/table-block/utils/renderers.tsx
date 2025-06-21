import { DataValue } from "@/lib/charts";
import { JSX } from "react";

export function createRenderer(values: DataValue[]): ((value: unknown) => (JSX.Element | string | null)) {
  if (values.length === 0) return () => null;
  
  const nonNullValues = values.filter(val => val != null);
  if (nonNullValues.length === 0) return () => null;
  
  const sampleValue = nonNullValues[0];
  
  if (typeof sampleValue === 'number' ||
    (typeof sampleValue === 'string' && !isNaN(Number(sampleValue)) && sampleValue.trim() !== '')) {
    
    const hasDecimalPattern = nonNullValues.some(val =>
      String(val).includes('.') && String(val).split('.')[1]?.length <= 2
    );
    
    if (hasDecimalPattern) {
      return (value) => {
        const num = Number(value);
        return isNaN(num) ? String(value) : num.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      };
    }
    
    return (value) => {
      const num = Number(value);
      return isNaN(num) ? String(value) : num.toLocaleString();
    };
  }
  
  if (sampleValue instanceof Date ||
    (typeof sampleValue === 'string' && !isNaN(new Date(sampleValue).getTime()))) {
    return (value) => {
      const date = new Date(value as string);
      return isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
    };
  }
  
  if (typeof sampleValue === 'string' && sampleValue.match(/^https?:\/\//)) {
    // eslint-disable-next-line react/display-name
    return (value) => (
      <a href={value as string} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
        {String(value).length > 30 ? `${String(value).substring(0, 30)}...` : String(value)}
      </a>
    );
  }
  
  if (typeof sampleValue === 'string') {
    const avgLength = nonNullValues.reduce((sum: number, val) => sum + String(val).length, 0) / nonNullValues.length;
    
    if (avgLength > 50) {
      // eslint-disable-next-line react/display-name
      return (value) => {
        const str = String(value);
        return str.length > 60 ? (
          <span title={str}>{str.substring(0, 60)}...</span>
        ) : str;
      };
    }
    
    // eslint-disable-next-line react/display-name
    return (value) => (
      <span title={String(value)}>{String(value)}</span>
    );
  }
  
  return () => null;
}