import React from 'react';
import { Label } from '@/components/ui/label';
import { UploadComponent } from '@/components/upload-component';
import { File } from '@/generated/prisma';

interface ChartFileUploadProps {
  fileId?: string;
  onFileSelect: (fileId: string) => void;
}

export const ChartFileUpload = React.memo<ChartFileUploadProps>(({
  fileId: _fileId,
  onFileSelect,
}) => {
  const handleFileUpload = React.useCallback((file: File) => {
    onFileSelect(file.id);
  }, [onFileSelect]);

  return (
    <div className="space-y-2">
      <Label>Data File</Label>
      <UploadComponent
        onFileUpload={handleFileUpload}
        fileTypes={[".csv", ".json"]}
        label="Upload CSV or JSON file for chart data"
      />
    </div>
  );
});

ChartFileUpload.displayName = 'ChartFileUpload';