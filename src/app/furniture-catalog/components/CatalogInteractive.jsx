'use client';

import { useState, useEffect } from 'react';
import { productService } from '../../../services/product.service';
import Header from '../../../components/common/Header';
import ProductCard from './ProductCard';
import CatalogFilters from './CatalogFilters';
import SearchBar from './SearchBar';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import EmptyCatalog from './EmptyCatalog';

export default function CatalogInteractive() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, selectedCategory, searchTerm, sortBy, priceRange]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load products and categories in parallel
      const [productsResult, categoriesResult] = await Promise.all([
        productService?.getAllProducts(),
        productService?.getCategories()
      ]);

      if (productsResult?.error) {
        throw new Error(productsResult.error);
      }

      if (categoriesResult?.error) {
        throw new Error(categoriesResult.error);
      }

      setProducts(productsResult?.data || []);
      setCategories(categoriesResult?.data || []);
    } catch (err) {
      console.error('Error loading catalog:', err);
      setError(err?.message || 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered?.filter(product => 
        product?.category?.toLowerCase() === selectedCategory?.toLowerCase()
      ) || [];
    }

    // Search filter
    if (searchTerm?.trim()) {
      const search = searchTerm?.toLowerCase();
      filtered = filtered?.filter(product =>
        product?.name?.toLowerCase()?.includes(search) ||
        product?.description?.toLowerCase()?.includes(search) ||
        product?.brand?.toLowerCase()?.includes(search)
      ) || [];
    }

    // Price range filter
    filtered = filtered?.filter(product => {
      const price = parseFloat(product?.basePrice || 0);
      return price >= priceRange?.min && price <= priceRange?.max;
    }) || [];

    // Sort
    if (sortBy === 'price-low') {
      filtered = filtered?.sort((a, b) => 
        parseFloat(a?.basePrice || 0) - parseFloat(b?.basePrice || 0)
      ) || [];
    } else if (sortBy === 'price-high') {
      filtered = filtered?.sort((a, b) => 
        parseFloat(b?.basePrice || 0) - parseFloat(a?.basePrice || 0)
      ) || [];
    } else if (sortBy === 'name') {
      filtered = filtered?.sort((a, b) => 
        (a?.name || '')?.localeCompare(b?.name || '')
      ) || [];
    } else if (sortBy === 'newest') {
      filtered = filtered?.sort((a, b) => 
        new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
      ) || [];
    }

    setFilteredProducts(filtered || []);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
  };

  const handlePriceRangeChange = (range) => {
    setPriceRange(range);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <ErrorMessage 
          message={error}
          onRetry={loadInitialData}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Furniture Catalog
          </h1>
          <p className="text-gray-600">
            Browse our complete collection of quality furniture
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar 
            onSearch={handleSearch}
            placeholder="Search by name, description, or brand..."
          />
        </div>

        {/* Filters and Results */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <CatalogFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              priceRange={priceRange}
              onPriceRangeChange={handlePriceRangeChange}
            />
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-600">
                {filteredProducts?.length || 0} products found
              </p>
            </div>

            {/* Products */}
            {filteredProducts?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts?.map(product => (
                  <ProductCard 
                    key={product?.id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <EmptyCatalog 
                hasFilters={selectedCategory !== 'all' || searchTerm?.trim() !== ''}
                onClearFilters={() => {
                  setSelectedCategory('all');
                  setSearchTerm('');
                  setPriceRange({ min: 0, max: 100000 });
                  setSortBy('newest');
                }}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}