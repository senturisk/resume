import React from 'react';

export interface CarbonTextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  labelText: string;
  helperText?: string;
  invalid?: boolean;
  invalidText?: string;
}

export const CarbonTextInput: React.FC<CarbonTextInputProps> = ({
  id,
  labelText,
  helperText,
  invalid,
  invalidText,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1 w-full text-left ${className}`}>
      <label
        htmlFor={id}
        className="text-xs font-medium tracking-wide text-[#525252] dark:text-[#c6c6c6]"
      >
        {labelText}
      </label>
      <div className="relative">
        <input
          id={id}
          className={`w-full h-10 px-3 bg-[#ffffff] dark:bg-[#262626] border-b-2 text-sm text-[#161616] dark:text-[#f4f4f4] placeholder-[#8d8d8d] focus:outline-none transition-colors ${
            invalid
              ? 'border-[#da1e28] focus:border-[#da1e28]'
              : 'border-[#8d8d8d] dark:border-[#525252] focus:border-[#0f62fe] dark:focus:border-[#ffffff]'
          }`}
          {...props}
        />
      </div>
      {invalid && invalidText && (
        <span className="text-xs text-[#da1e28] dark:text-[#fa4d56]">{invalidText}</span>
      )}
      {!invalid && helperText && (
        <span className="text-xs text-[#6f6f6f] dark:text-[#a8a8a8]">{helperText}</span>
      )}
    </div>
  );
};

export interface CarbonTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  labelText: string;
  helperText?: string;
  invalid?: boolean;
  invalidText?: string;
}

export const CarbonTextArea: React.FC<CarbonTextAreaProps> = ({
  id,
  labelText,
  helperText,
  invalid,
  invalidText,
  className = '',
  rows = 3,
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1 w-full text-left ${className}`}>
      <label
        htmlFor={id}
        className="text-xs font-medium tracking-wide text-[#525252] dark:text-[#c6c6c6]"
      >
        {labelText}
      </label>
      <textarea
        id={id}
        rows={rows}
        className={`w-full p-3 bg-[#ffffff] dark:bg-[#262626] border-b-2 text-sm text-[#161616] dark:text-[#f4f4f4] placeholder-[#8d8d8d] focus:outline-none transition-colors resize-y ${
          invalid
            ? 'border-[#da1e28] focus:border-[#da1e28]'
            : 'border-[#8d8d8d] dark:border-[#525252] focus:border-[#0f62fe] dark:focus:border-[#ffffff]'
        }`}
        {...props}
      />
      {invalid && invalidText && (
        <span className="text-xs text-[#da1e28] dark:text-[#fa4d56]">{invalidText}</span>
      )}
      {!invalid && helperText && (
        <span className="text-xs text-[#6f6f6f] dark:text-[#a8a8a8]">{helperText}</span>
      )}
    </div>
  );
};

export interface CarbonSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  labelText: string;
  helperText?: string;
  children: React.ReactNode;
}

export const CarbonSelect: React.FC<CarbonSelectProps> = ({
  id,
  labelText,
  helperText,
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1 w-full text-left ${className}`}>
      <label
        htmlFor={id}
        className="text-xs font-medium tracking-wide text-[#525252] dark:text-[#c6c6c6]"
      >
        {labelText}
      </label>
      <select
        id={id}
        className="w-full h-10 px-3 bg-[#ffffff] dark:bg-[#262626] border-b-2 border-[#8d8d8d] dark:border-[#525252] text-sm text-[#161616] dark:text-[#f4f4f4] focus:outline-none focus:border-[#0f62fe] dark:focus:border-[#ffffff] transition-colors cursor-pointer"
        {...props}
      >
        {children}
      </select>
      {helperText && (
        <span className="text-xs text-[#6f6f6f] dark:text-[#a8a8a8]">{helperText}</span>
      )}
    </div>
  );
};
