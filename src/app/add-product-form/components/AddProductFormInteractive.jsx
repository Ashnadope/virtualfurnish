'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export default function AddProductFormInteractive() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Sofa',
    costPrice: '',
    retailPrice: '',
    discountPercent: '',
    length: '',
    width: '',
    height: '',
    dimensionUnit: 'cm',
    material: 'Solid Wood',
    color: '#8B4513',
    stock: '',
    reorderPoint: '',
    supplier: '',
    description: '',
    seoTitle: '',
    seoDescription: '',
    tags: '',
    isFeatured: false,
    status: 'active'
  });

  const [images, setImages] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const categories = ['Sofa', 'Chair', 'Table', 'Bed', 'Cabinet', 'Desk', 'Shelf', 'Ottoman'];
  const materials = ['Solid Wood', 'Engineered Wood', 'Metal', 'Fabric', 'Leather', 'Glass', 'Rattan', 'Plastic'];
  const colorOptions = [
    { name: 'Brown', hex: '#8B4513' },
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Gray', hex: '#808080' },
    { name: 'Beige', hex: '#F5F5DC' },
    { name: 'Navy', hex: '#000080' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e?.target?.files || []);
    if (files?.length === 0) return;

    files?.forEach(file => {
      if (file?.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, {
          url: reader?.result,
          alt: '',
          file: file
        }]);
      };
      reader?.readAsDataURL(file);
    });

    if (errors?.image) {
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev?.filter((_, i) => i !== index));
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(0);
    } else if (primaryImageIndex > index) {
      setPrimaryImageIndex(prev => prev - 1);
    }
  };

  const handleImageAltChange = (index, alt) => {
    setImages(prev => prev?.map((img, i) => i === index ? { ...img, alt } : img));
  };

  const calculateFinalPrice = () => {
    const retail = parseFloat(formData?.retailPrice) || 0;
    const discount = parseFloat(formData?.discountPercent) || 0;
    return retail - (retail * discount / 100);
  };

  const generateSKU = () => {
    const prefix = formData?.category?.substring(0, 3)?.toUpperCase();
    const random = Math.floor(Math.random() * 10000)?.toString()?.padStart(4, '0');
    const timestamp = Date.now()?.toString()?.slice(-4);
    return `${prefix}-${random}-${timestamp}`;
  };

  const handleGenerateSKU = () => {
    handleChange('sku', generateSKU());
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData?.name?.trim()) newErrors.name = 'Product name is required';
    if (!formData?.sku?.trim()) newErrors.sku = 'SKU is required';
    if (!formData?.description?.trim()) newErrors.description = 'Description is required';
    if (!formData?.costPrice || parseFloat(formData?.costPrice) <= 0) {
      newErrors.costPrice = 'Valid cost price is required';
    }
    if (!formData?.retailPrice || parseFloat(formData?.retailPrice) <= 0) {
      newErrors.retailPrice = 'Valid retail price is required';
    }
    if (parseFloat(formData?.costPrice) > parseFloat(formData?.retailPrice)) {
      newErrors.retailPrice = 'Retail price must be greater than cost price';
    }
    if (!formData?.stock || parseInt(formData?.stock) < 0) {
      newErrors.stock = 'Valid stock quantity is required';
    }
    if (images?.length === 0) {
      newErrors.image = 'At least one product image is required';
    }
    if (images?.some(img => !img?.alt?.trim())) {
      newErrors.imageAlt = 'All images must have descriptions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    if (!validate()) {
      return;
    }

    // Simulate product save
    const productData = {
      ...formData,
      id: Date.now(),
      costPrice: parseFloat(formData?.costPrice),
      retailPrice: parseFloat(formData?.retailPrice),
      discountPercent: parseFloat(formData?.discountPercent) || 0,
      stock: parseInt(formData?.stock),
      reorderPoint: parseInt(formData?.reorderPoint) || 0,
      images: images,
      primaryImageIndex: primaryImageIndex,
      finalPrice: calculateFinalPrice(),
      createdAt: new Date()?.toISOString()
    };

    console.log('Product saved:', productData);
    setShowSuccessModal(true);
  };

  const handleSaveAndAddAnother = (e) => {
    e?.preventDefault();
    
    if (!validate()) {
      return;
    }

    // Reset form
    setFormData({
      name: '',
      sku: '',
      category: 'Sofa',
      costPrice: '',
      retailPrice: '',
      discountPercent: '',
      length: '',
      width: '',
      height: '',
      dimensionUnit: 'cm',
      material: 'Solid Wood',
      color: '#8B4513',
      stock: '',
      reorderPoint: '',
      supplier: '',
      description: '',
      seoTitle: '',
      seoDescription: '',
      tags: '',
      isFeatured: false,
      status: 'active'
    });
    setImages([]);
    setPrimaryImageIndex(0);
    setErrors({});
  };

  const handleCancel = () => {
    router?.push('/product-management');
  };

  return (
    <>
      <form className="bg-surface rounded-lg shadow-card">
        <div className="p-6 border-b border-border">
          <h2 className="font-heading font-semibold text-lg text-foreground">
            Product Information
          </h2>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Information Section */}
          <div>
            <h3 className="font-heading font-medium text-base text-foreground mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <label htmlFor="sku" className="block font-body text-sm font-medium text-foreground mb-2">
                  SKU *
                </label>
                <div className="flex gap-2">
                  <input
                    id="sku"
                    type="text"
                    value={formData?.sku}
                    onChange={(e) => handleChange('sku', e?.target?.value)}
                    className={`flex-1 px-4 py-2 border rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                      errors?.sku ? 'border-error' : 'border-input'
                    }`}
                    placeholder="Enter or generate SKU"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateSKU}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md font-body text-sm font-medium hover:bg-secondary/90 transition-fast"
                  >
                    Generate
                  </button>
                </div>
                {errors?.sku && <p className="mt-1 text-xs text-error">{errors?.sku}</p>}
              </div>

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
                  {categories?.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
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

            <div className="mt-4">
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
                placeholder="Enter detailed product description"
              />
              {errors?.description && <p className="mt-1 text-xs text-error">{errors?.description}</p>}
            </div>
          </div>

          {/* Pricing Section */}
          <div>
            <h3 className="font-heading font-medium text-base text-foreground mb-4">
              Pricing (Philippine Peso ₱)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="costPrice" className="block font-body text-sm font-medium text-foreground mb-2">
                  Cost Price *
                </label>
                <input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={formData?.costPrice}
                  onChange={(e) => handleChange('costPrice', e?.target?.value)}
                  className={`w-full px-4 py-2 border rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                    errors?.costPrice ? 'border-error' : 'border-input'
                  }`}
                  placeholder="0.00"
                />
                {errors?.costPrice && <p className="mt-1 text-xs text-error">{errors?.costPrice}</p>}
              </div>

              <div>
                <label htmlFor="retailPrice" className="block font-body text-sm font-medium text-foreground mb-2">
                  Retail Price *
                </label>
                <input
                  id="retailPrice"
                  type="number"
                  step="0.01"
                  value={formData?.retailPrice}
                  onChange={(e) => handleChange('retailPrice', e?.target?.value)}
                  className={`w-full px-4 py-2 border rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                    errors?.retailPrice ? 'border-error' : 'border-input'
                  }`}
                  placeholder="0.00"
                />
                {errors?.retailPrice && <p className="mt-1 text-xs text-error">{errors?.retailPrice}</p>}
              </div>

              <div>
                <label htmlFor="discountPercent" className="block font-body text-sm font-medium text-foreground mb-2">
                  Discount %
                </label>
                <input
                  id="discountPercent"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData?.discountPercent}
                  onChange={(e) => handleChange('discountPercent', e?.target?.value)}
                  className="w-full px-4 py-2 border border-input rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0.00"
                />
              </div>
            </div>

            {(formData?.retailPrice && parseFloat(formData?.retailPrice) > 0) && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <p className="font-body text-sm text-foreground">
                  Final Price: <span className="font-semibold">₱{calculateFinalPrice()?.toFixed(2)}</span>
                </p>
              </div>
            )}
          </div>

          {/* Specifications Section */}
          <div>
            <h3 className="font-heading font-medium text-base text-foreground mb-4">
              Product Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-2">
                  Dimensions (L x W x H)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={formData?.length}
                    onChange={(e) => handleChange('length', e?.target?.value)}
                    className="col-span-1 px-3 py-2 border border-input rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="L"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={formData?.width}
                    onChange={(e) => handleChange('width', e?.target?.value)}
                    className="col-span-1 px-3 py-2 border border-input rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="W"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={formData?.height}
                    onChange={(e) => handleChange('height', e?.target?.value)}
                    className="col-span-1 px-3 py-2 border border-input rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="H"
                  />
                  <select
                    value={formData?.dimensionUnit}
                    onChange={(e) => handleChange('dimensionUnit', e?.target?.value)}
                    className="col-span-1 px-3 py-2 border border-input rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="cm">cm</option>
                    <option value="inch">inch</option>
                    <option value="m">m</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="material" className="block font-body text-sm font-medium text-foreground mb-2">
                  Material
                </label>
                <select
                  id="material"
                  value={formData?.material}
                  onChange={(e) => handleChange('material', e?.target?.value)}
                  className="w-full px-4 py-2 border border-input rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {materials?.map(mat => (
                    <option key={mat} value={mat}>{mat}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block font-body text-sm font-medium text-foreground mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-3">
                  {colorOptions?.map(colorOption => (
                    <button
                      key={colorOption?.hex}
                      type="button"
                      onClick={() => handleChange('color', colorOption?.hex)}
                      className={`relative w-12 h-12 rounded-md border-2 transition-fast ${
                        formData?.color === colorOption?.hex ? 'border-primary' : 'border-input'
                      }`}
                      style={{ backgroundColor: colorOption?.hex }}
                      title={colorOption?.name}
                    >
                      {formData?.color === colorOption?.hex && (
                        <Icon
                          name="CheckIcon"
                          size={20}
                          variant="outline"
                          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
                            ['#FFFFFF', '#F5F5DC']?.includes(colorOption?.hex) ? 'text-foreground' : 'text-white'
                          }`}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div>
            <h3 className="font-heading font-medium text-base text-foreground mb-4">
              Product Images *
            </h3>
            
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Icon name="PhotoIcon" size={48} variant="outline" className="mx-auto text-muted-foreground mb-3" />
              <div className="mb-3">
                <label
                  htmlFor="imageUpload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md font-body text-sm font-medium cursor-pointer hover:bg-primary/90 transition-fast"
                >
                  <Icon name="ArrowUpTrayIcon" size={18} variant="outline" />
                  Upload Images
                </label>
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Drag and drop images or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPEG, PNG up to 5MB each. Multiple images supported.
              </p>
            </div>
            {errors?.image && <p className="mt-2 text-sm text-error">{errors?.image}</p>}

            {images?.length > 0 && (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images?.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted border-2 border-border">
                        <AppImage
                          src={img?.url}
                          alt={img?.alt || `Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-error text-error-foreground rounded-md opacity-0 group-hover:opacity-100 transition-fast"
                        aria-label="Remove image"
                      >
                        <Icon name="XMarkIcon" size={16} variant="outline" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setPrimaryImageIndex(index)}
                        className={`absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-medium transition-fast ${
                          primaryImageIndex === index
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background/80 text-foreground hover:bg-background'
                        }`}
                      >
                        {primaryImageIndex === index ? 'Primary' : 'Set Primary'}
                      </button>

                      <input
                        type="text"
                        value={img?.alt}
                        onChange={(e) => handleImageAltChange(index, e?.target?.value)}
                        placeholder="Image description"
                        className="w-full mt-2 px-3 py-2 border border-input rounded-md font-body text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  ))}
                </div>
                {errors?.imageAlt && <p className="mt-2 text-sm text-error">{errors?.imageAlt}</p>}
              </div>
            )}
          </div>

          {/* Inventory Management Section */}
          <div>
            <h3 className="font-heading font-medium text-base text-foreground mb-4">
              Inventory Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="stock" className="block font-body text-sm font-medium text-foreground mb-2">
                  Initial Stock Quantity *
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

              <div>
                <label htmlFor="reorderPoint" className="block font-body text-sm font-medium text-foreground mb-2">
                  Reorder Point
                </label>
                <input
                  id="reorderPoint"
                  type="number"
                  value={formData?.reorderPoint}
                  onChange={(e) => handleChange('reorderPoint', e?.target?.value)}
                  className="w-full px-4 py-2 border border-input rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="supplier" className="block font-body text-sm font-medium text-foreground mb-2">
                  Supplier
                </label>
                <input
                  id="supplier"
                  type="text"
                  value={formData?.supplier}
                  onChange={(e) => handleChange('supplier', e?.target?.value)}
                  className="w-full px-4 py-2 border border-input rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Supplier name"
                />
              </div>
            </div>
          </div>

          {/* Advanced Options Section */}
          <div>
            <h3 className="font-heading font-medium text-base text-foreground mb-4">
              Advanced Options
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="seoTitle" className="block font-body text-sm font-medium text-foreground mb-2">
                    SEO Title
                  </label>
                  <input
                    id="seoTitle"
                    type="text"
                    value={formData?.seoTitle}
                    onChange={(e) => handleChange('seoTitle', e?.target?.value)}
                    className="w-full px-4 py-2 border border-input rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="SEO-friendly title"
                  />
                </div>

                <div>
                  <label htmlFor="tags" className="block font-body text-sm font-medium text-foreground mb-2">
                    Product Tags
                  </label>
                  <input
                    id="tags"
                    type="text"
                    value={formData?.tags}
                    onChange={(e) => handleChange('tags', e?.target?.value)}
                    className="w-full px-4 py-2 border border-input rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="modern, luxury, comfortable"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="seoDescription" className="block font-body text-sm font-medium text-foreground mb-2">
                  SEO Meta Description
                </label>
                <textarea
                  id="seoDescription"
                  value={formData?.seoDescription}
                  onChange={(e) => handleChange('seoDescription', e?.target?.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-input rounded-md font-body text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="SEO meta description"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="isFeatured"
                  type="checkbox"
                  checked={formData?.isFeatured}
                  onChange={(e) => handleChange('isFeatured', e?.target?.checked)}
                  className="w-4 h-4 text-primary border-input rounded focus:ring-2 focus:ring-ring"
                />
                <label htmlFor="isFeatured" className="font-body text-sm text-foreground cursor-pointer">
                  Mark as Featured Product
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/50">
          <button
            type="button"
            onClick={handleCancel}
            className="w-full sm:w-auto px-6 py-2.5 border border-border rounded-md font-body text-sm font-medium text-foreground hover:bg-background transition-fast"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAndAddAnother}
            className="w-full sm:w-auto px-6 py-2.5 bg-secondary text-secondary-foreground rounded-md font-body text-sm font-medium hover:bg-secondary/90 transition-fast"
          >
            Save & Add Another
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-full sm:w-auto px-6 py-2.5 bg-primary text-primary-foreground rounded-md font-body text-sm font-medium hover:bg-primary/90 transition-fast"
          >
            Save Product
          </button>
        </div>
      </form>
      {/* Success Modal */}
      {showSuccessModal && (
        <>
          <div className="fixed inset-0 bg-foreground/50 z-dropdown" onClick={() => setShowSuccessModal(false)} />
          <div className="fixed inset-0 z-overlay flex items-center justify-center p-4">
            <div className="bg-surface rounded-lg shadow-elevated w-full max-w-md animate-slide-in">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="CheckCircleIcon" size={32} variant="outline" className="text-success" />
                </div>
                <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                  Product Added Successfully!
                </h3>
                <p className="font-body text-sm text-muted-foreground mb-6">
                  Your product has been created and is now available in the inventory.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      router?.push('/product-management');
                    }}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md font-body text-sm font-medium hover:bg-primary/90 transition-fast"
                  >
                    View Products
                  </button>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="flex-1 px-4 py-2 border border-border rounded-md font-body text-sm font-medium text-foreground hover:bg-muted transition-fast"
                  >
                    Add Another
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

AddProductFormInteractive.propTypes = {};