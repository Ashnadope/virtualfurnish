'use client';

import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
      
      console.log('=== Starting room upload ===');
      console.log('User ID:', user.id);
      console.log('File:', selectedFile.name, selectedFile.size, 'bytes');

      const supabase = createClient();
      
      // Create unique filename with timestamp
      const timestamp = Date.now();
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `room-${timestamp}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      console.log('Upload path:', filePath);
      console.log('Uploading to room-uploads bucket...');

      // Upload file to Supabase Storage (private bucket)
      // Set timeout for upload to prevent indefinite hanging
      const uploadPromise = supabase.storage
        .from('room-uploads')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout - check if room-uploads bucket exists and policies are applied')), 10000)
      );

      const { data: uploadData, error: uploadError } = await Promise.race([
        uploadPromise,
        timeoutPromise
      ]).catch(err => ({ data: null, error: err }));

      console.log('Upload response:', { data: uploadData, error: uploadError });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('Upload successful!', uploadData);

      // Get signed URL for private bucket (valid for 1 hour)
      console.log('Creating signed URL...');
      const { data: urlData, error: urlError } = await supabase.storage
        .from('room-uploads')
        .createSignedUrl(filePath, 3600);

      if (urlError) {
        console.error('Error creating signed URL:', urlError);
        throw new Error(`Failed to create signed URL: ${urlError.message}`);
      }

      console.log('Signed URL created:', urlData.signedUrl);

      // Create room design entry in database
      console.log('Creating room design entry...');
      const { data: designData, error: designError } = await supabase
        .from('room_designs')
        .insert([
          {
            user_id: user.id,
            name: `Room Design - ${new Date().toLocaleDateString()}`,
            room_image_url: filePath, // Store path, not signed URL (signed URLs expire)
            design_data: { furniture: [] }, // Empty furniture array initially
            is_public: false
          }
        ])
        .select()
        .single();

      if (designError) {
        console.error('Error creating design:', designError);
        throw new Error(`Failed to save design: ${designError.message}`);
      }

      console.log('Room design created:', designData);
      console.log('=== Upload completed successfully ===');

      // Pass the signed URL and design ID to parent
      onUpload({
        imageUrl: urlData.signedUrl,
        imagePath: filePath,
        designId: designData.id
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