import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface FormFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  as?: "input" | "textarea";
}

export const FormField = React.memo<FormFieldProps>(({
  label,
  id,
  value,
  onChange,
  placeholder = "",
  type = "text",
  className = "",
  as = "input"
}) => {
  const Component = as === "textarea" ? Textarea : Input;
  
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <Component
        id={id}
        type={as === "input" ? type : undefined}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        rows={as === "textarea" ? 4 : undefined}
      />
    </div>
  );
});

FormField.displayName = 'FormField';