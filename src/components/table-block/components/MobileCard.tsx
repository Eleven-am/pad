import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Column } from "../types";
import { DataRow } from "@/lib/charts";

interface MobileCardProps {
  row: DataRow;
  columns: Column[];
  index: number;
}

export const MobileCard = React.memo<MobileCardProps>(({ row, columns, index }) => {
  const renderCellValue = (column: Column, row: DataRow) => {
    const value = row[column.key];
    return column.render ? column.render(value, row) : String(value);
  };
  
  return (
    <Card key={index} className="border-border/30">
      <CardContent className="p-3 space-y-2">
        {columns.map((column) => (
          <div key={column.key} className="flex justify-between items-start">
            <span className="text-xs font-medium text-muted-foreground min-w-0 flex-shrink-0 mr-2">
              {column.label}:
            </span>
            <span className="text-sm text-right flex-1">
              {renderCellValue(column, row)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});

MobileCard.displayName = 'MobileCard';