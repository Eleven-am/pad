import React from "react";
import { Column } from "../types";
import { DataRow } from "@/lib/charts";
import { getAlignmentClass } from "../utils/formatters";

interface TableRowProps {
  row: DataRow;
  columns: Column[];
  index: number;
}

export const TableRow = React.memo<TableRowProps>(({ row, columns }) => {
  const renderCellValue = (column: Column, row: DataRow) => {
    const value = row[column.key];
    return column.render ? column.render(value, row) : String(value);
  };
  
  return (
    <tr className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
      {columns.map((column) => (
        <td
          key={column.key}
          className={`px-6 py-4 text-sm ${getAlignmentClass(column.align)}`}
        >
          {renderCellValue(column, row)}
        </td>
      ))}
    </tr>
  );
});

TableRow.displayName = 'TableRow';