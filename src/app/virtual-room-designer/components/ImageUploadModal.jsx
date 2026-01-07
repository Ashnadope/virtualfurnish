'use client';

import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default function ImageUploadModal({ isOpen, onClose, onUpload }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && (file?.type === 'image/jpeg' || file?.type === 'image/png')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader?.result);
      };
      reader?.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e?.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setIsDragging(false);
    const file = e?.dataTransfer?.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = () => {
    if (previewUrl) {
      onUpload(previewUrl);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsDragging(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-foreground/50 z-overlay flex items-center justify-center p-4">
      <div className="bg-surface rounded-lg shadow-elevated max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-heading font-semibold text-lg text-foreground">Upload Room Photo</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-md hover:bg-muted transition-fast"
            aria-label="Close modal"
          >
            <Icon name="XMarkIcon" size={24} variant="outline" />
          </button>
        </div>

        <div className="p-6">
          {!previewUrl ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-12 text-center transition-fast cursor-pointer
                ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
              `}
              onClick={() => fileInputRef?.current?.click()}
            >
              <Icon name="CloudArrowUpIcon" size={64} variant="outline" className="mx-auto mb-4 text-muted-foreground" />
              <p className="font-body text-base text-foreground mb-2">
                Drag and drop your room photo here
              </p>
              <p className="font-body text-sm text-muted-foreground mb-4">
                or click to browse files
              </p>
              <p className="font-body text-xs text-muted-foreground">
                Supported formats: JPEG, PNG (Max 10MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <AppImage
                  src={previewUrl}
                  alt="Preview of uploaded room photo showing walls and floor"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon name="PhotoIcon" size={24} variant="solid" className="text-primary" />
                  <div>
                    <p className="font-body font-medium text-sm text-foreground">
                      {selectedFile?.name || 'room-photo.jpg'}
                    </p>
                    <p className="font-body text-xs text-muted-foreground">
                      {selectedFile ? `${(selectedFile?.size / 1024 / 1024)?.toFixed(2)} MB` : '0 MB'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="p-2 rounded-md hover:bg-surface transition-fast"
                  aria-label="Remove file"
                >
                  <Icon name="TrashIcon" size={20} variant="outline" />
                </button>
              </div>

              <div className="flex items-start gap-2 p-3 bg-accent/10 rounded-md">
                <Icon name="InformationCircleIcon" size={18} variant="solid" className="text-accent mt-0.5" />
                <p className="font-body text-xs text-foreground">
                  Our AI will automatically detect walls and floors in your room photo to help you place furniture accurately.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-md border border-border hover:bg-muted transition-fast font-body text-sm font-medium text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!previewUrl}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-fast font-body text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload & Start Designing
          </button>
        </div>
      </div>
    </div>
  );
}

ImageUploadModal.propTypes = {
  isOpen: PropTypes?.bool?.isRequired,
  onClose: PropTypes?.func?.isRequired,
  onUpload: PropTypes?.func?.isRequired
};