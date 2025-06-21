import { DataRow } from "@/lib/charts";
import { Column, ColumnGeneration } from "../types";
import { formatLabel, detectAlignment, detectWidth } from "./formatters";
import { createRenderer } from "./renderers";

export function generateColumns(data: DataRow[]): ColumnGeneration {
  if (!data || data.length === 0) {
    return { columns: [], data };
  }
  
  const allKeys = new Set<string>();
  data.forEach(row => {
    Object.keys(row).forEach(key => allKeys.add(key));
  });
  
  const columns: Column[] = Array.from(allKeys).map(key => {
    const values = data.map(row => row[key]).filter(val => val != null);
    
    return {
      key,
      label: formatLabel(key),
      align: detectAlignment(values),
      width: detectWidth(key, values),
      render: createRenderer(values)
    };
  });
  
  return {
    columns,
    data
  };
}