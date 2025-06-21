import { DataRow, DataValue } from "@/lib/charts";
import { TableBlockData } from "@/services/types";
import { ReactNode } from "react";

export interface Column {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  render?: (value: DataValue, row: DataRow) => ReactNode;
}

export interface TableBlockProps {
  block: TableBlockData;
  dataRowPromise: Promise<DataRow[]>;
}

export interface ColumnGeneration {
  columns: Column[];
  data: DataRow[];
}