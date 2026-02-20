'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { createClient } from '@/lib/supabase/client';

const EMPTY_VARIANT_FORM = {
  color: '',
  price: '',
  stock_quantity: '',
  dimensions: '',
  material: '',
  weight: '',
  image: '',
  selectedFile: null,
};

const EMPTY_FORM_DATA = {
  name: '',
  brand: '',
  category: 'Sofa',
  status: 'active',
  description: '',
  imageAlt: '',
};

export default function ProductFormModal({ isOpen, onClose, onSave, product }) {
  const [formData, setFormData] = useState(EMPTY_FORM_DATA);
  const [variants, setVariants] = useState([]);
  const [variantForm, setVariantForm] = useState(EMPTY_VARIANT_FORM);
  const [variantImagePreview, setVariantImagePreview] = useState('');
  const [editingVariantIndex, setEditingVariantIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          name: product.name || '',
          brand: product.brand || '',
          category: product.category || 'Sofa',
          status: product.status || 'active',
          description: product.description || '',
          imageAlt: product.imageAlt || '',
        });
        setVariants(
          (product.variants || []).map(v => ({
            id: v.id,
            color: v.color || '',
            price: v.price ?? '',
            stock_quantity: v.stockQuantity ?? '',
            dimensions: v.dimensions || '',
            material: v.material || '',
            weight: v.weight || '',
            image: v.imageUrl || '',
            selectedFile: null,
          }))
        );
        setVariantForm(EMPTY_VARIANT_FORM);
        setVariantImagePreview('');
        setEditingVariantIndex(null);
        setErrors({});
      } else {
        resetForm();
      }
    }
  }, [product, isOpen]);

  const resetForm = () => {
    setFormData(EMPTY_FORM_DATA);
    setVariants([]);
    setVariantForm(EMPTY_VARIANT_FORM);
    setVariantImagePreview('');
    setEditingVariantIndex(null);
    setErrors({});
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleVariantChange = (field, value) => {
    setVariantForm(prev => ({ ...prev, [field]: value }));
    if (errors[`variant_${field}`]) setErrors(prev => ({ ...prev, [`variant_${field}`]: '' }));
  };

  const handleVariantImageChange = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      setErrors(prev => ({ ...prev, variantImage: 'Please select a valid image (JPEG, PNG, WebP)' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, variantImage: 'Image must be under 5MB' }));
      return;
    }
    setErrors(prev => ({ ...prev, variantImage: '' }));
    setVariantForm(prev => ({ ...prev, selectedFile: file }));
    const reader = new FileReader();
    reader.onloadend = () => setVariantImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const clearVariantImage = () => {
    setVariantImagePreview('');
    setVariantForm(prev => ({ ...prev, selectedFile: null, image: '' }));
  };

  const addOrUpdateVariant = () => {
    const errs = {};
    if (!variantForm.color.trim()) errs.variant_color = 'Color is required';
    if (!variantForm.price || parseFloat(variantForm.price) <= 0) errs.variant_price = 'Valid price is required';
    if (variantForm.stock_quantity === '' || parseInt(variantForm.stock_quantity) < 0) errs.variant_stock_quantity = 'Valid stock is required';
    if (!variantForm.selectedFile && !variantForm.image) errs.variantImage = 'Variant image is required';
    if (Object.keys(errs).length > 0) { setErrors(prev => ({ ...prev, ...errs })); return; }

    const newVariant = {
      ...variantForm,
      price: parseFloat(variantForm.price),
      stock_quantity: parseInt(variantForm.stock_quantity),
    };

    if (editingVariantIndex !== null) {
      setVariants(prev => prev.map((v, i) => (i === editingVariantIndex ? newVariant : v)));
    } else {
      setVariants(prev => [...prev, newVariant]);
    }
    resetVariantForm();
    if (errors.variants) setErrors(prev => ({ ...prev, variants: '' }));
  };

  const resetVariantForm = () => {
    setVariantForm(EMPTY_VARIANT_FORM);
    setVariantImagePreview('');
    setEditingVariantIndex(null);
  };

  const startEditVariant = (index) => {
    const v = variants[index];
    setVariantForm({ ...v });
    setVariantImagePreview(v.image || '');
    setEditingVariantIndex(index);
  };

  const removeVariant = (index) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Product name is required';
    if (!formData.brand.trim()) errs.brand = 'Brand is required';
    if (!formData.description.trim()) errs.description = 'Description is required';
    if (!formData.imageAlt.trim()) errs.imageAlt = 'Image description is required';
    if (variants.length === 0) errs.variants = 'At least one variant is required';
    if (variants.some(v => !v.selectedFile && !v.image)) errs.variants = 'All variants must have an image';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    try {
      if (!validate()) return;

      setUploading(true);
      const supabase = createClient();
      const uploadedVariants = [];

      for (const variant of variants) {
        if (variant.selectedFile) {
          const timestamp = Date.now() + Math.random();
          const ext = variant.selectedFile.name.split('.').pop();
          const filePath = `products/variant-${timestamp}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from('furniture-images')
            .upload(filePath, variant.selectedFile, { cacheControl: '3600', upsert: false });
          if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
          const { data: { publicUrl } } = supabase.storage.from('furniture-images').getPublicUrl(filePath);
          uploadedVariants.push({ ...variant, image: publicUrl, selectedFile: undefined });
        } else {
          uploadedVariants.push({ ...variant, selectedFile: undefined });
        }
      }

      await onSave({ ...formData, id: product?.id, variants: uploadedVariants });
      resetForm();
    } catch (err) {
      console.error('Error saving product:', err);
      const msg = err?.name === 'AbortError'
        ? 'Upload timed out. Check your connection and try again.'
        : err?.message || String(err) || 'Failed to save product';
      setErrors(prev => ({ ...prev, submit: msg }));
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const inputCls = (field) =>
    `w-full px-4 py-2 border rounded-md font-body text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring ${errors[field] ? 'border-error' : 'border-input'}`;

  const smallInputCls = (field) =>
    `w-full px-3 py-2 border rounded-md font-body text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring ${errors[field] ? 'border-error' : 'border-input'}`;

  return (
    <>
      <div className="fixed inset-0 bg-foreground/50 z-dropdown" onClick={onClose} />
      <div className="fixed inset-0 z-overlay flex items-start justify-center p-4 overflow-y-auto pt-8">
        <div className="bg-surface rounded-lg shadow-elevated w-full max-w-4xl mb-8 animate-slide-in">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-heading font-semibold text-xl text-foreground">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button onClick={onClose} className="p-2 rounded-md hover:bg-muted transition-fast" aria-label="Close modal">
              <Icon name="XMarkIcon" size={24} variant="outline" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">

            {/* Product Details */}
            <div>
              <h3 className="font-body text-sm font-semibold text-foreground mb-4 pb-2 border-b border-border">
                Product Details
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <label htmlFor="name" className="block font-body text-sm font-medium text-foreground mb-2">Product Name *</label>
                    <input id="name" type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className={inputCls('name')} placeholder="e.g., Moderno 3-Seater Sofa" />
                    {errors.name && <p className="mt-1 text-xs text-error">{errors.name}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="brand" className="block font-body text-sm font-medium text-foreground mb-2">Brand *</label>
                      <input id="brand" type="text" value={formData.brand} onChange={(e) => handleChange('brand', e.target.value)} className={inputCls('brand')} placeholder="e.g., Brosas Furniture" />
                      {errors.brand && <p className="mt-1 text-xs text-error">{errors.brand}</p>}
                    </div>
                    <div>
                      <label htmlFor="category" className="block font-body text-sm font-medium text-foreground mb-2">Category *</label>
                      <select id="category" value={formData.category} onChange={(e) => handleChange('category', e.target.value)} className="w-full px-4 py-2 border border-input rounded-md font-body text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="Sofa">Sofa</option>
                        <option value="Chair">Chair</option>
                        <option value="Table">Table</option>
                        <option value="Bed">Bed</option>
                        <option value="Cabinet">Cabinet</option>
                        <option value="Desk">Desk</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="description" className="block font-body text-sm font-medium text-foreground mb-2">Description *</label>
                    <textarea id="description" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} rows={4} className={`${inputCls('description')} resize-none`} placeholder="Describe the product  used for AI room analysis and search" />
                    {errors.description && <p className="mt-1 text-xs text-error">{errors.description}</p>}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="status" className="block font-body text-sm font-medium text-foreground mb-2">Status</label>
                    <select id="status" value={formData.status} onChange={(e) => handleChange('status', e.target.value)} className="w-full px-4 py-2 border border-input rounded-md font-body text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <p className="mt-1 text-xs text-muted-foreground">Inactive hides the product and all its variants from the catalog.</p>
                  </div>
                  <div>
                    <label htmlFor="imageAlt" className="block font-body text-sm font-medium text-foreground mb-2">Image Description *</label>
                    <textarea id="imageAlt" value={formData.imageAlt} onChange={(e) => handleChange('imageAlt', e.target.value)} rows={6} className={`${inputCls('imageAlt')} resize-none`} placeholder="Describe the product visually  used by the AI and for accessibility" />
                    {errors.imageAlt && <p className="mt-1 text-xs text-error">{errors.imageAlt}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Variants */}
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                <div>
                  <h3 className="font-body text-sm font-semibold text-foreground">Variants *</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Each variant has its own color, price, stock and image. At least one required.</p>
                </div>
                <span className="text-xs text-muted-foreground font-medium">{variants.length} variant{variants.length !== 1 ? 's' : ''}</span>
              </div>

              {errors.variants && (
                <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-md">
                  <p className="text-xs text-error">{errors.variants}</p>
                </div>
              )}

              {/* Saved Variants List */}
              {variants.length > 0 && (
                <div className="mb-4 space-y-2">
                  {variants.map((v, index) => (
                    <div key={index} className="flex items-center gap-3 bg-muted/30 border border-border rounded-lg p-3">
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0 border border-border">
                        {v.image ? (
                          <AppImage src={v.image} alt={v.color || 'Variant'} className="w-full h-full object-cover" />
                        ) : v.selectedFile ? (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <Icon name="CheckCircleIcon" size={20} variant="solid" className="text-primary" />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon name="PhotoIcon" size={20} variant="outline" className="text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm font-medium text-foreground">
                          {v.color || 'Unnamed'}
                          {!v.selectedFile && !v.image && <span className="ml-2 text-xs text-error font-bold"> No Image</span>}
                          {v.selectedFile && <span className="ml-2 text-xs text-primary font-medium"> New image ready</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ₱{parseFloat(v.price || 0).toLocaleString()} · {v.stock_quantity} in stock{v.dimensions ? ` · ${v.dimensions}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button type="button" onClick={() => startEditVariant(index)} className="px-3 py-1 bg-primary/10 text-primary rounded text-xs font-medium hover:bg-primary/20 transition-fast">Edit</button>
                        <button type="button" onClick={() => removeVariant(index)} className="px-3 py-1 bg-error/10 text-error rounded text-xs font-medium hover:bg-error/20 transition-fast">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add / Edit Variant Sub-form */}
              <div className="bg-muted/20 border border-border rounded-lg p-4 space-y-4">
                <h4 className="font-body text-sm font-semibold text-foreground">
                  {editingVariantIndex !== null ? `Editing Variant #${editingVariantIndex + 1}` : 'Add Variant'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-body text-xs font-medium text-foreground mb-1">Color *</label>
                    <input type="text" value={variantForm.color} onChange={(e) => handleVariantChange('color', e.target.value)} className={smallInputCls('variant_color')} placeholder="e.g., Dark Grey" />
                    {errors.variant_color && <p className="mt-1 text-xs text-error">{errors.variant_color}</p>}
                  </div>
                  <div>
                    <label className="block font-body text-xs font-medium text-foreground mb-1">Price () *</label>
                    <input type="number" step="0.01" min="0" value={variantForm.price} onChange={(e) => handleVariantChange('price', e.target.value)} className={smallInputCls('variant_price')} placeholder="0.00" />
                    {errors.variant_price && <p className="mt-1 text-xs text-error">{errors.variant_price}</p>}
                  </div>
                  <div>
                    <label className="block font-body text-xs font-medium text-foreground mb-1">Stock Quantity *</label>
                    <input type="number" min="0" value={variantForm.stock_quantity} onChange={(e) => handleVariantChange('stock_quantity', e.target.value)} className={smallInputCls('variant_stock_quantity')} placeholder="0" />
                    {errors.variant_stock_quantity && <p className="mt-1 text-xs text-error">{errors.variant_stock_quantity}</p>}
                  </div>
                  <div>
                    <label className="block font-body text-xs font-medium text-foreground mb-1">Dimensions</label>
                    <input type="text" value={variantForm.dimensions} onChange={(e) => handleVariantChange('dimensions', e.target.value)} className={smallInputCls('variant_dimensions')} placeholder="e.g., 2009085 cm" />
                  </div>
                  <div>
                    <label className="block font-body text-xs font-medium text-foreground mb-1">Material</label>
                    <input type="text" value={variantForm.material} onChange={(e) => handleVariantChange('material', e.target.value)} className={smallInputCls('variant_material')} placeholder="e.g., Solid Wood, Velvet" />
                  </div>
                  <div>
                    <label className="block font-body text-xs font-medium text-foreground mb-1">Weight (kg)</label>
                    <input type="text" value={variantForm.weight} onChange={(e) => handleVariantChange('weight', e.target.value)} className={smallInputCls('variant_weight')} placeholder="e.g., 45" />
                  </div>
                </div>

                {/* Variant Image Upload */}
                <div>
                  <label className="block font-body text-xs font-medium text-foreground mb-2">Variant Image *</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    {variantImagePreview ? (
                      <div className="space-y-2">
                        <div className="w-full h-28 rounded-md overflow-hidden bg-muted">
                          <img src={variantImagePreview} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-center justify-center gap-3">
                          <button type="button" onClick={clearVariantImage} className="text-xs text-error hover:text-error/80 transition-fast">Remove</button>
                          <label htmlFor="variantImageReplace" className="text-xs text-primary hover:text-primary/80 cursor-pointer transition-fast">Replace</label>
                          <input id="variantImageReplace" type="file" accept="image/jpeg,image/png,image/jpg,image/webp" onChange={handleVariantImageChange} className="hidden" />
                        </div>
                      </div>
                    ) : variantForm.image ? (
                      <div className="space-y-2">
                        <div className="w-full h-28 rounded-md overflow-hidden bg-muted">
                          <AppImage src={variantForm.image} alt="Current" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-center justify-center gap-3">
                          <button type="button" onClick={clearVariantImage} className="text-xs text-error hover:text-error/80 transition-fast">Remove</button>
                          <label htmlFor="variantImageReplace2" className="text-xs text-primary hover:text-primary/80 cursor-pointer transition-fast">Replace</label>
                          <input id="variantImageReplace2" type="file" accept="image/jpeg,image/png,image/jpg,image/webp" onChange={handleVariantImageChange} className="hidden" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 py-3">
                        <Icon name="PhotoIcon" size={28} variant="outline" className="mx-auto text-muted-foreground" />
                        <label htmlFor="variantImageUpload" className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-md text-xs font-medium cursor-pointer hover:bg-primary/90 transition-fast">
                          <Icon name="ArrowUpTrayIcon" size={14} variant="outline" />
                          Upload Image
                        </label>
                        <input id="variantImageUpload" type="file" accept="image/jpeg,image/png,image/jpg,image/webp" onChange={handleVariantImageChange} className="hidden" />
                        <p className="text-xs text-muted-foreground">JPEG, PNG, WebP  max 5MB</p>
                      </div>
                    )}
                  </div>
                  {errors.variantImage && <p className="mt-1 text-xs text-error">{errors.variantImage}</p>}
                </div>

                {/* Sub-form actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button type="button" onClick={addOrUpdateVariant} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm font-medium hover:bg-primary/90 transition-fast">
                    {editingVariantIndex !== null ? 'Update Variant' : 'Add Variant to List'}
                  </button>
                  {editingVariantIndex !== null && (
                    <button type="button" onClick={resetVariantForm} className="px-4 py-2 border border-border rounded-md font-body text-sm font-medium text-foreground hover:bg-muted transition-fast">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Submit error */}
            {errors.submit && (
              <div className="p-3 bg-error/10 border border-error/30 rounded-md">
                <p className="text-xs text-error">{errors.submit}</p>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button type="button" onClick={onClose} className="px-6 py-2 border border-border rounded-md font-body text-sm font-medium text-foreground hover:bg-muted transition-fast">
                Cancel
              </button>
              <button type="submit" disabled={uploading} className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm font-medium hover:bg-primary/90 transition-fast disabled:opacity-50 flex items-center gap-2">
                {uploading && <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />}
                {uploading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

ProductFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  product: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    brand: PropTypes.string,
    category: PropTypes.string,
    status: PropTypes.string,
    description: PropTypes.string,
    imageAlt: PropTypes.string,
    variants: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      color: PropTypes.string,
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      stockQuantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      dimensions: PropTypes.string,
      material: PropTypes.string,
      weight: PropTypes.string,
      imageUrl: PropTypes.string,
    }))
  })
};
