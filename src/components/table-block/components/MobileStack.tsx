import React from "react";
import { Column } from "../types";
import { DataRow } from "@/lib/charts";

interface MobileStackProps {
  row: DataRow;
  columns: Column[];
  index: number;
}

export const MobileStack = React.memo<MobileStackProps>(({ row, columns, index }) => {
  const renderCellValue = (column: Column, row: DataRow) => {
    const value = row[column.key];
    return column.render ? column.render(value, row) : String(value);
  };
  
  return (
    <div
      key={index}
      className="px-4 py-3 border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors space-y-1"
    >
      {columns.map((column, colIndex) => (
        <div key={column.key}>
          {colIndex === 0 ? (
            <div className="font-medium text-sm">
              {renderCellValue(column, row)}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">{column.label}:</span>{' '}
              {renderCellValue(column, row)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

MobileStack.displayName = 'MobileStack';