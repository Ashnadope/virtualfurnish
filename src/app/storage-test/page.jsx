'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function StorageTestPage() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setUploading(true);
      setError('');
      setUploadedUrl('');

      console.log('Starting upload...');
      console.log('User ID:', user.id);
      console.log('File:', file.name, file.size, 'bytes');

      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/test-${Date.now()}.${fileExt}`;
      
      console.log('Upload path:', fileName);

      // Upload to room-uploads bucket
      const { data, error: uploadError } = await supabase.storage
        .from('room-uploads')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      console.log('Upload response:', { data, error: uploadError });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      // Get SIGNED URL for private bucket (expires in 1 hour)
      const { data: urlData, error: urlError } = await supabase.storage
        .from('room-uploads')
        .createSignedUrl(fileName, 3600); // 3600 seconds = 1 hour

      if (urlError) {
        console.error('URL generation error:', urlError);
        throw urlError;
      }

      console.log('Signed URL:', urlData.signedUrl);
      setUploadedUrl(urlData.signedUrl);
      alert('Upload successful! Check console for details.');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || JSON.stringify(err));
      alert('Upload failed: ' + (err.message || JSON.stringify(err)));
    } finally {
      setUploading(false);
    }
  };

  const testListFiles = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from('room-uploads')
        .list(user.id, {
          limit: 10,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;
      console.log('Files in your folder:', data);
      alert(`Found ${data.length} files. Check console for details.`);
    } catch (err) {
      console.error('List error:', err);
      alert('Error: ' + err.message);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Please log in to test storage</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Storage Test Page</h1>
        
        <div className="bg-surface border border-border rounded-lg p-6 space-y-6">
          {/* Upload Test */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Test Upload to room-uploads</h2>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="block w-full text-sm text-foreground
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90"
            />
            {uploading && <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>}
            {error && <p className="mt-2 text-sm text-red-600">Error: {error}</p>}
          </div>

          {/* Display uploaded image */}
          {uploadedUrl && (
            <div>
              <h3 className="text-lg font-semibold mb-2">✅ Upload Successful!</h3>
              <p className="text-sm text-muted-foreground mb-2">URL: {uploadedUrl}</p>
              <img 
                src={uploadedUrl} 
                alt="Uploaded" 
                className="max-w-full h-auto rounded border"
              />
            </div>
          )}

          {/* List Files Test */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Test List Files</h2>
            <button
              onClick={testListFiles}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              List My Files
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h3 className="font-semibold mb-2">Test Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Select an image file to upload</li>
              <li>If successful, you'll see the image below</li>
              <li>Click "List My Files" to see all your uploaded files</li>
              <li>Check browser console for detailed logs</li>
            </ol>
          </div>

          {/* User Info */}
          <div className="text-sm text-muted-foreground">
            <p>Logged in as: {user.email}</p>
            <p>User ID: {user.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
