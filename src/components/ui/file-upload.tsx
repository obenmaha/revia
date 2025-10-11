import { useDropzone, type FileWithPath } from 'react-dropzone';
import { Upload, X } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface FileUploadProps {
  onFileSelect: (files: FileWithPath[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  onFileSelect,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
    'text/*': ['.txt', '.md'],
  },
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024, // 5MB
  className,
  disabled = false,
}: FileUploadProps) {
  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop: onFileSelect,
      accept,
      maxFiles,
      maxSize,
      disabled,
    });

  const hasErrors = fileRejections.length > 0;

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50',
        isDragActive && 'border-primary bg-primary/5',
        hasErrors && 'border-destructive bg-destructive/5',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-2">
        <Upload className="h-8 w-8 text-muted-foreground" />
        <div className="text-sm text-muted-foreground">
          {isDragActive
            ? 'Déposez les fichiers ici...'
            : 'Glissez-déposez des fichiers ici, ou cliquez pour sélectionner'}
        </div>
        <div className="text-xs text-muted-foreground">
          PNG, JPG, PDF jusqu'à {Math.round(maxSize / 1024 / 1024)}MB
        </div>
      </div>
      {hasErrors && (
        <div className="absolute inset-0 flex items-center justify-center bg-destructive/5">
          <div className="text-center">
            <X className="mx-auto h-8 w-8 text-destructive" />
            <div className="text-sm text-destructive">
              {fileRejections[0]?.errors[0]?.message}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
