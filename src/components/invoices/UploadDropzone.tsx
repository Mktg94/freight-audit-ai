'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const MAX_SIZE = 20 * 1024 * 1024;

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
}

function UploadDropzone({ onFileSelected }: UploadDropzoneProps) {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejected: any[]) => {
      setError(null);
      if (rejected.length > 0) {
        const rej = rejected[0];
        if (rej.errors.some((e: any) => e.code === 'file-invalid-type')) {
          setError('Only PDF files are accepted.');
        } else if (rej.errors.some((e: any) => e.code === 'file-too-large')) {
          setError('File exceeds the 20 MB limit.');
        } else {
          setError('Invalid file.');
        }
        return;
      }
      if (accepted.length > 0) {
        setFileName(accepted[0].name);
        onFileSelected(accepted[0]);
      }
    },
    [onFileSelected],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: MAX_SIZE,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors',
        isDragActive
          ? 'border-[var(--primary)] bg-[var(--primary)]/5'
          : error
            ? 'border-[var(--danger)] bg-[var(--danger)]/5'
            : 'border-[var(--border)] hover:border-[var(--primary)]/50',
      )}
    >
      <input {...getInputProps()} />
      {fileName ? (
        <>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10">
            <File className="h-6 w-6 text-[var(--primary)]" />
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">{fileName}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Drop a new file to replace</p>
        </>
      ) : (
        <>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-2)]">
            <Upload className="h-6 w-6 text-[var(--text-muted)]" />
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {isDragActive ? 'Drop your file here' : 'Drag & drop your invoice PDF'}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">PDF only, up to 20 MB</p>
        </>
      )}
      {error && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-[var(--danger)]">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export { UploadDropzone };
export type { UploadDropzoneProps };
