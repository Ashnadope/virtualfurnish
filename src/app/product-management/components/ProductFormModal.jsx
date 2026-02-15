'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { createClient } from '@/lib/supabase/client';

export default function ProductFormModal({ isOpen, onClose, onSave, product }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Sofa',
    price: '',
    stock: '',
    status: 'active',
    description: '',
    dimensions: '',
    material: '',
    weight: '',
    color: '',
    image: '',
    imageAlt: ''
  });

  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (product) {
      setFormData(product);
      setImagePreview(product?.image);
    } else {
      resetForm();
    }
  }, [product, isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Sofa',
      price: '',
      stock: '',
      status: 'active',
      description: '',
      dimensions: '',
      material: '',
      weight: '',
      color: '',
      image: '',
      imageAlt: ''
    });
    setImagePreview('');
    setSelectedFile(null);
    setErrors({});
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e?.target?.files?.[0];
    
    console.log('=== Image selection started ===');
    console.log('File from input:', file);
    
    if (!file) {
      console.log('No file selected');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', file.type);
      setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      console.error('File too large:', file.size, 'bytes');
      setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
      return;
    }

    console.log('File validation passed');
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Clear any previous errors
    setErrors(prev => ({ ...prev, image: '' }));

    // Store the file for later upload
    console.log('Storing file for upload');
    setSelectedFile(file);

    // Create preview
    console.log('Creating preview...');
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('Preview created successfully');
      setImagePreview(reader.result);
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };
    reader.readAsDataURL(file);
    console.log('=== Image selection completed ===');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData?.name?.trim()) newErrors.name = 'Product name is required';
    if (!formData?.price || parseFloat(formData?.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData?.stock || parseInt(formData?.stock) < 0) newErrors.stock = 'Valid stock quantity is required';
    if (!formData?.description?.trim()) newErrors.description = 'Description is required';
    
    // Check for image: either a new file selected OR existing image URL (for edit mode)
    if (!selectedFile && !formData?.image) {
      newErrors.image = 'Product image is required';
    }
    
    if (!formData?.imageAlt?.trim()) newErrors.imageAlt = 'Image description is required';

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    console.log('=== Form submit started ===');
    console.log('Validation check...');
    
    if (!validate()) {
      console.log('Validation failed');
      return;
    }

    console.log('Validation passed');

    try {
      setUploading(true);
      console.log('Upload state set to true');
      
      let imageUrl = formData?.image; // Use existing image URL for edit mode

      // Upload new image if a file was selected
      if (selectedFile) {
        console.log('New file selected for upload');
        console.log('File details:', {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type
        });

        const supabase = createClient();
        console.log('Supabase client created');
        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

        // Create unique filename with timestamp
        const timestamp = Date.now();
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `product-${timestamp}.${fileExt}`;
        const filePath = `products/${fileName}`;

        console.log('Upload path:', filePath);
        console.log('Starting upload to furniture-images bucket...');
        console.log('File to upload:', selectedFile);

        // Upload file to Supabase Storage (public bucket)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('furniture-images')
          .upload(filePath, selectedFile, {
            cacheControl: '3600',
            upsert: false
          });
        
        console.log('Upload response:', { data: uploadData, error: uploadError });

        if (uploadError) {
          console.error('Upload error details:', uploadError);
          alert(`Upload failed: ${uploadError.message}`);
          setErrors(prev => ({ ...prev, image: `Upload failed: ${uploadError.message}` }));
          setUploading(false);
          return;
        }

        console.log('Upload successful!', uploadData);

        // Get public URL
        console.log('Getting public URL...');
        const { data: { publicUrl } } = supabase.storage
          .from('furniture-images')
          .getPublicUrl(filePath);

        console.log('Public URL generated:', publicUrl);
        imageUrl = publicUrl;
      } else {
        console.log('No new file to upload, using existing image:', imageUrl);
      }

      // Prepare data to save with uploaded image URL
      const dataToSave = {
        ...formData,
        image: imageUrl,
        price: parseFloat(formData?.price),
        stock: parseInt(formData?.stock),
        id: product?.id || formData?.id || Date.now()
      };

      console.log('Saving product data:', dataToSave);
      await onSave(dataToSave);
      
      console.log('Product saved successfully!');
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Error: ${error.message}`);
      setErrors(prev => ({ ...prev, submit: 'Failed to save product' }));
    } finally {
      console.log('=== Form submit completed ===');
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-foreground/50 z-dropdown" onClick={onClose} />
      <div className="fixed inset-0 z-overlay flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-surface rounded-lg shadow-elevated w-full max-w-4xl my-8 animate-slide-in">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-heading font-semibold text-xl text-foreground">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-muted transition-fast"
              aria-label="Close modal"
            >
              <Icon name="XMarkIcon" size={24} variant="outline" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label htmlFor="name" className="block font-body text-sm font-medium text-foreground mb-2">
                    Product Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData?.name}
                    onChange={(e) => handleChange('name', e?.target?.value)}
                    className={`w-full px-4 py-2 border rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                      errors?.name ? 'border-error' : 'border-input'
                    }`}
                    placeholder="Enter product name"
                  />
                  {errors?.name && <p className="mt-1 text-xs text-error">{errors?.name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="category" className="block font-body text-sm font-medium text-foreground mb-2">
                      Category *
                    </label>
                    <select
                      id="category"
                      value={formData?.category}
                      onChange={(e) => handleChange('category', e?.target?.value)}
                      className="w-full px-4 py-2 border border-input rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="Sofa">Sofa</option>
                      <option value="Chair">Chair</option>
                      <option value="Table">Table</option>
                      <option value="Bed">Bed</option>
                      <option value="Cabinet">Cabinet</option>
                      <option value="Desk">Desk</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="price" className="block font-body text-sm font-medium text-foreground mb-2">
                      Price (₱) *
                    </label>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData?.price}
                      onChange={(e) => handleChange('price', e?.target?.value)}
                      className={`w-full px-4 py-2 border rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                        errors?.price ? 'border-error' : 'border-input'
                      }`}
                      placeholder="0.00"
                    />
                    {errors?.price && <p className="mt-1 text-xs text-error">{errors?.price}</p>}
                  </div>

                  <div>
                    <label htmlFor="stock" className="block font-body text-sm font-medium text-foreground mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      id="stock"
                      type="number"
                      value={formData?.stock}
                      onChange={(e) => handleChange('stock', e?.target?.value)}
                      className={`w-full px-4 py-2 border rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                        errors?.stock ? 'border-error' : 'border-input'
                      }`}
                      placeholder="0"
                    />
                    {errors?.stock && <p className="mt-1 text-xs text-error">{errors?.stock}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block font-body text-sm font-medium text-foreground mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    value={formData?.description}
                    onChange={(e) => handleChange('description', e?.target?.value)}
                    rows={4}
                    className={`w-full px-4 py-2 border rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none ${
                      errors?.description ? 'border-error' : 'border-input'
                    }`}
                    placeholder="Enter product description"
                  />
                  {errors?.description && <p className="mt-1 text-xs text-error">{errors?.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dimensions" className="block font-body text-sm font-medium text-foreground mb-2">
                      Dimensions (L x W x H)
                    </label>
                    <input
                      id="dimensions"
                      type="text"
                      value={formData?.dimensions}
                      onChange={(e) => handleChange('dimensions', e?.target?.value)}
                      className="w-full px-4 py-2 border border-input rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="e.g., 200 x 90 x 85 cm"
                    />
                  </div>

                  <div>
                    <label htmlFor="material" className="block font-body text-sm font-medium text-foreground mb-2">
                      Material
                    </label>
                    <input
                      id="material"
                      type="text"
                      value={formData?.material}
                      onChange={(e) => handleChange('material', e?.target?.value)}
                      className="w-full px-4 py-2 border border-input rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="e.g., Solid Wood, Fabric"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="weight" className="block font-body text-sm font-medium text-foreground mb-2">
                      Weight (kg)
                    </label>
                    <input
                      id="weight"
                      type="text"
                      value={formData?.weight}
                      onChange={(e) => handleChange('weight', e?.target?.value)}
                      className="w-full px-4 py-2 border border-input rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="e.g., 45"
                    />
                  </div>

                  <div>
                    <label htmlFor="color" className="block font-body text-sm font-medium text-foreground mb-2">
                      Color
                    </label>
                    <input
                      id="color"
                      type="text"
                      value={formData?.color}
                      onChange={(e) => handleChange('color', e?.target?.value)}
                      className="w-full px-4 py-2 border border-input rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="e.g., Brown, Gray"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="status" className="block font-body text-sm font-medium text-foreground mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    value={formData?.status}
                    onChange={(e) => handleChange('status', e?.target?.value)}
                    className="w-full px-4 py-2 border border-input rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-body text-sm font-medium text-foreground mb-2">
                    Product Image *
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    {uploading ? (
                      <div className="space-y-3 py-8">
                        <div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-muted-foreground">Uploading image...</p>
                      </div>
                    ) : imagePreview ? (
                      <div className="space-y-3">
                        <div className="w-full h-48 rounded-md overflow-hidden bg-muted">
                          <AppImage
                            src={imagePreview}
                            alt={formData?.imageAlt || 'Product preview'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setSelectedFile(null);
                            handleChange('image', '');
                          }}
                          className="text-sm text-error hover:text-error/80 transition-fast"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Icon name="PhotoIcon" size={48} variant="outline" className="mx-auto text-muted-foreground" />
                        <div>
                          <label
                            htmlFor="imageUpload"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm font-medium cursor-pointer hover:bg-primary/90 transition-fast"
                          >
                            <Icon name="ArrowUpTrayIcon" size={18} variant="outline" />
                            Upload Image
                          </label>
                          <input
                            id="imageUpload"
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">JPEG, PNG up to 5MB</p>
                      </div>
                    )}
                  </div>
                  {errors?.image && <p className="mt-1 text-xs text-error">{errors?.image}</p>}
                </div>

                <div>
                  <label htmlFor="imageAlt" className="block font-body text-sm font-medium text-foreground mb-2">
                    Image Description *
                  </label>
                  <textarea
                    id="imageAlt"
                    value={formData?.imageAlt}
                    onChange={(e) => handleChange('imageAlt', e?.target?.value)}
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none ${
                      errors?.imageAlt ? 'border-error' : 'border-input'
                    }`}
                    placeholder="Describe the product image for accessibility"
                  />
                  {errors?.imageAlt && <p className="mt-1 text-xs text-error">{errors?.imageAlt}</p>}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                disabled={uploading}
                className="px-6 py-2 border border-border rounded-md font-body text-sm font-medium text-foreground hover:bg-muted transition-fast disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm font-medium hover:bg-primary/90 transition-fast disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading && (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                )}
                {uploading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

ProductFormModal.propTypes = {
  isOpen: PropTypes?.bool?.isRequired,
  onClose: PropTypes?.func?.isRequired,
  onSave: PropTypes?.func?.isRequired,
  product: PropTypes?.shape({
    id: PropTypes?.number,
    name: PropTypes?.string,
    category: PropTypes?.string,
    price: PropTypes?.number,
    stock: PropTypes?.number,
    status: PropTypes?.string,
    description: PropTypes?.string,
    dimensions: PropTypes?.string,
    material: PropTypes?.string,
    weight: PropTypes?.string,
    color: PropTypes?.string,
    image: PropTypes?.string,
    imageAlt: PropTypes?.string
  })
};