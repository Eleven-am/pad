import { Card, CardContent } from "@/components/ui/card";
import { Suspense, use } from "react";
import { DataRow } from "@/lib/charts";
import { getDataRows } from "@/lib/data";
import { TableBlockData } from "@/services/types";
import { unwrap } from "@/lib/unwrap";
import { BlockLoading } from "@/components/blocks/loading";
import { TableBlockProps } from "./types";
import { generateColumns } from "./utils/column-generator";
import { getAlignmentClass } from "./utils/formatters";
import { TableHeader } from "./components/TableHeader";
import { TableRow } from "./components/TableRow";
import { MobileCard } from "./components/MobileCard";
import { MobileStack } from "./components/MobileStack";

function Block({ block, dataRowPromise }: TableBlockProps) {
  const tableData = use(dataRowPromise);
  const { caption, description, mobileLayout } = block;
  const { columns, data } = generateColumns(tableData);
  
  if (!data?.length || !columns?.length) {
    return null;
  }
  
  return (
    <Card className="border-border/50 py-0">
      <CardContent className="p-0">
        <table className={`w-full ${mobileLayout === 'SCROLL' ? 'table' : 'hidden sm:table'}`}>
          <TableHeader caption={caption} description={description} />
          <thead>
            <tr className="border-b border-border/50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-sm font-medium text-muted-foreground ${getAlignmentClass(column.align)}`}
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <TableRow key={index} row={row} columns={columns} index={index} />
            ))}
          </tbody>
        </table>
        
        {mobileLayout !== 'SCROLL' && (
          <div className="sm:hidden w-full">
            {caption && (
              <div className="text-sm text-muted-foreground pt-4 pb-2 px-4 w-full">
                {caption}
              </div>
            )}
            
            {mobileLayout === 'CARDS' && (
              <div className="space-y-3 p-4">
                {data.map((row, index) => (
                  <MobileCard key={index} row={row} columns={columns} index={index} />
                ))}
              </div>
            )}
            
            {mobileLayout === 'STACK' && (
              <div>
                {data.map((row, index) => (
                  <MobileStack key={index} row={row} columns={columns} index={index} />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TableBlock({ block }: { block: TableBlockData }) {
  return (
    <Suspense fallback={<BlockLoading />}>
      <Block block={block} dataRowPromise={unwrap(getDataRows(block.fileId)) as Promise<DataRow[]>} />
    </Suspense>
  );
}