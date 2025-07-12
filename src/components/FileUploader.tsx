'use client';

import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content?: ArrayBuffer; 
  url?: string;     
}

interface FileUploaderProps {
  onFileUpload: (files: UploadedFile[]) => void;
  allowedTypes?: string[];
  maxSizeMB?: number;
}

export default function FileUploader({ 
  onFileUpload, 
  allowedTypes = [
    '.pdf', '.txt', '.doc', '.docx', '.md', '.mdx', 
    '.js', '.ts', '.py', '.rb', '.java', '.cpp', '.c', '.go', '.rs', '.php', '.html', '.css',
    '.json'
],
  maxSizeMB = 10 
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to read file as ArrayBuffer"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  };
  
  const processFiles = async (files: FileList) => {
    setError(null);
    setIsLoading(true);
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const uploadedFiles: UploadedFile[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file size
        if (file.size > maxSizeBytes) {
          setError(`File ${file.name} exceeds the maximum size of ${maxSizeMB}MB`);
          continue;
        }
        
        // Check file type
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        if (!allowedTypes.includes(fileExtension) && !allowedTypes.includes('*')) {
          setError(`File type ${fileExtension} is not supported`);
          continue;
        }
        
        // Read file content
        const content = await readFileAsArrayBuffer(file);
        
        // Create uploaded file object
        uploadedFiles.push({
          id: `file-${i}`,
          name: file.name,
          size: file.size,
          type: file.name.split('.').pop()?.toLowerCase() || '',
          content
        });
      }
      
      if (uploadedFiles.length > 0) {
        onFileUpload(uploadedFiles);
      }
    } catch (err) {
      console.error("Error processing files:", err);
      setError("Failed to process files. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };
  
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
    }
  };
  
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="w-full">
      <div 
        className={`rounded-lg p-6 text-center cursor-pointer transition-colors 
            ${isDragging ? 'bg-accent/10' : ''}
            ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileInputChange}
          className="hidden"
          multiple
          accept={allowedTypes.join(',')}
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-10 w-10 text-accent" />
          <p className="text-sm text-white">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          {isLoading && (
            <p className="text-xs text-accent animate-pulse">
              Processing files...
            </p>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
}
