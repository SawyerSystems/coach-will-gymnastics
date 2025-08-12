import React, { memo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Custom equality check for props
const inputPropsAreEqual = (prevProps: any, nextProps: any) => {
  return prevProps.value === nextProps.value && 
         prevProps.onChange === nextProps.onChange;
};

// Stable Text Input that won't re-render unless its specific props change
export const StableTextInput = memo(({ 
  label, 
  value, 
  onChange, 
  placeholder = "",
  className = "", 
  labelClassName = "text-[#0F0276] dark:text-white",
  list,
  type = "text"
}: { 
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  list?: string;
  type?: string;
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <Label className={labelClassName}>{label}</Label>
      <Input 
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
        list={list}
      />
    </div>
  );
}, inputPropsAreEqual);

StableTextInput.displayName = "StableTextInput";

// Custom equality check for select props
const selectPropsAreEqual = (prevProps: any, nextProps: any) => {
  return prevProps.value === nextProps.value && 
         prevProps.onValueChange === nextProps.onValueChange;
};

// Stable Select component
export const StableSelect = memo(({ 
  label, 
  value, 
  onValueChange, 
  options,
  placeholder = "",
  labelClassName = "text-[#0F0276] dark:text-white",
  triggerClassName = "",
}: { 
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{value: string; label: string}>;
  placeholder?: string;
  labelClassName?: string;
  triggerClassName?: string;
}) => {
  const handleValueChange = useCallback((newValue: string) => {
    onValueChange(newValue);
  }, [onValueChange]);

  return (
    <div className="space-y-2">
      <Label className={labelClassName}>{label}</Label>
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger className={triggerClassName}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}, selectPropsAreEqual);

StableSelect.displayName = "StableSelect";

// Custom equality check for checkbox props
const checkboxPropsAreEqual = (prevProps: any, nextProps: any) => {
  return prevProps.checked === nextProps.checked && 
         prevProps.onChange === nextProps.onChange;
};

// Stable Checkbox component
export const StableCheckbox = memo(({ 
  label, 
  checked, 
  onChange,
  labelClassName = "text-[#0F0276] dark:text-white",
  checkboxTextClassName = "text-slate-700 dark:text-white/90",
}: { 
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  labelClassName?: string;
  checkboxTextClassName?: string;
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <Label className={labelClassName}>{label}</Label>
      <div className="flex items-center gap-2 text-sm">
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={handleChange} 
        />
        <span className={checkboxTextClassName}>Mark this as a connected combo</span>
      </div>
    </div>
  );
}, checkboxPropsAreEqual);

StableCheckbox.displayName = "StableCheckbox";
