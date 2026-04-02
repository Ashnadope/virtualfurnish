'use client';

import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Compress an image File before sending it to the AI API.
 * - If the image is already small (≤800px wide AND ≤300 KB) it is returned as-is
 *   via a data URL so quality is not degraded for no reason.
 * - Otherwise it is resized to max 800px wide and re-encoded as JPEG at 0.7 quality.
 * Returns a data URL string, or null on error (caller falls back to the signed URL).
 */
function compressImageForAI(file) {
  return new Promise((resolve) => {
    const MAX_WIDTH = 800;
    const SIZE_THRESHOLD = 300 * 1024; // 300 KB

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);

      // Already within limits — no compression needed; caller uses the original signed URL
      if (img.width <= MAX_WIDTH && file.size <= SIZE_THRESHOLD) {
        resolve(null);
        return;
      }

      // Downscale (never upscale) and re-encode to JPEG
      const scale = Math.min(1, MAX_WIDTH / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

export default function ImageUploadModal({ isOpen, onClose, onUpload }) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    console.log('=== File selection started ===');
    console.log('File:', file);
    
    if (!file) {
      console.log('No file provided');
      return;
    }

    if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
      console.error('Invalid file type:', file.type);
      setError('Please select a JPEG or PNG image');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      console.error('File too large:', file.size);
      setError('Image size must be less than 10MB');
      return;
    }

    console.log('File validation passed');
    setError('');
    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('Preview created');
      setPreviewUrl(reader.result);
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      setError('Failed to read file');
    };
    reader.readAsDataURL(file);
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

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      setError('Please select a file and ensure you are logged in');
      return;
    }

    try {
      setUploading(true);
      setError('');

      // ── Step 1: Upload the room image through the server route ────────────
      // The server uses the service role key so it never fails due to an
      // expired browser token (the old "bucket policy" timeout problem).
      const roomForm = new FormData();
      roomForm.append('file', selectedFile);
      roomForm.append('prefix', 'room');

      const roomRes = await fetch('/api/room-designer/upload-url', {
        method: 'POST',
        body: roomForm,
      });
      if (!roomRes.ok) {
        const { error } = await roomRes.json();
        throw new Error(error || 'Upload failed');
      }
      const { viewUrl, filePath } = await roomRes.json();

      // ── Step 2: Create room_designs record via server route ───────────────
      const designRes = await fetch('/api/room-designer/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_image_url: filePath }),
      });
      if (!designRes.ok) {
        const { error } = await designRes.json();
        throw new Error(`Failed to save design: ${error}`);
      }
      const { data: designData } = await designRes.json();

      // ── Step 3: Upload compressed image for AI analysis (optional) ────────
      const compressedDataUrl = await compressImageForAI(selectedFile);
      let analysisImageUrl = viewUrl; // fallback to original
      if (compressedDataUrl) {
        try {
          const compressedBlob = await fetch(compressedDataUrl).then(r => r.blob());
          const aiForm = new FormData();
          aiForm.append('file', new File([compressedBlob], 'ai.jpg', { type: 'image/jpeg' }));
          aiForm.append('prefix', 'ai');
          const aiRes = await fetch('/api/room-designer/upload-url', {
            method: 'POST',
            body: aiForm,
          });
          if (aiRes.ok) {
            const { viewUrl: aiViewUrl } = await aiRes.json();
            if (aiViewUrl) analysisImageUrl = aiViewUrl;
          }
        } catch {
          console.warn('Could not upload compressed image; AI will use the full-res original.');
        }
      }

      onUpload({
        imageUrl: viewUrl,
        imagePath: filePath,
        designId: designData.id,
        analysisImageUrl,
      });

      handleClose();
    } catch (error) {
      console.error('Error uploading room:', error);
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsDragging(false);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-foreground/50 z-overlay flex items-start sm:items-center justify-center p-3 sm:p-4 pt-20 sm:pt-4">
      <div className="bg-surface rounded-lg shadow-elevated max-w-2xl w-full max-h-[calc(100vh-5rem)] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
          <h2 className="font-heading font-semibold text-base sm:text-lg text-foreground">Upload Room Photo</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-md hover:bg-muted transition-fast"
            aria-label="Close modal"
          >
            <Icon name="XMarkIcon" size={20} variant="outline" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-error/10 border border-error/20 rounded-md">
              <Icon name="ExclamationCircleIcon" size={18} variant="solid" className="text-error mt-0.5" />
              <p className="font-body text-xs text-error">{error}</p>
            </div>
          )}

          {uploading ? (
            <div className="space-y-4 py-12 text-center">
              <div className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="font-body font-medium text-foreground mb-1">Uploading your room photo...</p>
                <p className="font-body text-sm text-muted-foreground">This may take a few moments</p>
              </div>
            </div>
          ) : !previewUrl ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-6 sm:p-12 text-center transition-fast cursor-pointer
                ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
              `}
              onClick={() => fileInputRef?.current?.click()}
            >
              <Icon name="CloudArrowUpIcon" size={48} variant="outline" className="mx-auto mb-3 sm:mb-4 text-muted-foreground" />
              <p className="font-body text-sm sm:text-base text-foreground mb-1.5 sm:mb-2">
                Drag and drop your room photo here
              </p>
              <p className="font-body text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
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

              <div className="flex items-center justify-between p-3 sm:p-4 bg-muted rounded-lg">
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

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-border">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="px-4 py-2 rounded-md border border-border hover:bg-muted transition-fast font-body text-sm font-medium text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!previewUrl || uploading}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-fast font-body text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading && (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            )}
            {uploading ? 'Uploading...' : 'Upload & Start Designing'}
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