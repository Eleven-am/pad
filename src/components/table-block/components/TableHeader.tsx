import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface TableHeaderProps {
  caption?: string | null;
  description?: string | null;
}

export const TableHeader = React.memo<TableHeaderProps>(({ caption, description }) => {
  if (!caption) return null;
  
  return (
    <caption className="text-left">
      <CardHeader className="p-6 w-full">
        <CardTitle>{caption}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
    </caption>
  );
});

TableHeader.displayName = 'TableHeader';