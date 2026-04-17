'use client';

import { useState, useEffect } from 'react';
import { productService } from '../../../services/product.service';
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../../../components/common/Header';
import Sidebar from '../../../components/common/Sidebar';
import Breadcrumb from '../../../components/common/Breadcrumb';
import ProductCard from './ProductCard';
import CatalogFilters from './CatalogFilters';
import SearchBar from './SearchBar';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import EmptyCatalog from './EmptyCatalog';

export default function CatalogInteractive({ initialProducts = [] }) {
  const [products, setProducts] = useState(initialProducts || []);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(!initialProducts || initialProducts.length === 0);
  const [error, setError] = useState('');
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // ML recommendations (product_id → score map)
  const { user } = useAuth();
  const [recScores, setRecScores] = useState({});

  useEffect(() => {
    // If initialProducts provided, use them directly
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
      setLoading(false);
      
      // Extract unique categories from initial products
      const uniqueCategories = [...new Set(initialProducts.map(p => p?.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } else {
      loadInitialData();
    }
  }, [initialProducts]);

  // Refetch products on mount (covers in-app navigation) and when tab regains focus
  useEffect(() => {
    refreshProducts();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshProducts();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Fetch ML recommendations whenever the user changes
  useEffect(() => {
    if (!user?.id) return;
    productService.getRecommendations(user.id).then(({ data }) => {
      setRecScores(data || {});
    });
  }, [user?.id]);

  useEffect(() => {
    applyFilters();
  }, [products, selectedCategory, searchTerm, sortBy, priceRange, recScores]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load products and categories in parallel
      const [productsResult, categoriesResult] = await Promise.all([
        productService?.getAllProducts(),
        productService?.getCategories()
      ]);

      console.log('[CatalogInteractive] Products result:', productsResult);
      console.log('[CatalogInteractive] Categories result:', categoriesResult);

      let productsToUse = productsResult?.data || [];
      
      // If no products from Supabase, show empty
      setProducts(productsToUse);
      setCategories(categoriesResult?.data || []);
    } catch (err) {
      console.error('[CatalogInteractive] Error loading catalog:', err);
      setError(err?.message || 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Silently refresh products in the background (no loading spinner)
  const refreshProducts = async () => {
    try {
      const result = await productService?.getAllProducts();
      if (result?.data) {
        setProducts(result.data);
        const uniqueCategories = [...new Set(result.data.map(p => p?.category).filter(Boolean))];
        setCategories(uniqueCategories);
      }
    } catch (err) {
      // Silent refresh — don't show errors
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Hide products where every active variant is out of stock
    filtered = filtered.filter(product => {
      const activeVariants = (product?.variants || []).filter(v => v?.isActive !== false);
      // If no variant data, fall back to product-level stock_quantity
      if (activeVariants.length === 0) return (product?.stock_quantity ?? 0) > 0;
      return activeVariants.some(v => (parseInt(v?.stockQuantity) || 0) > 0);
    });

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
    } else if (sortBy === 'recommended') {
      // Scored products first (desc); unscored items sorted newest-first as fallback
      filtered = filtered?.sort((a, b) => {
        const sa = recScores[a?.id] ?? -1;
        const sb = recScores[b?.id] ?? -1;
        if (sa !== sb) return sb - sa;
        return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
      }) || [];
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
        <Sidebar userRole="customer" />
        <Header />
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar userRole="customer" />
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
      <Sidebar userRole="customer" />
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-20">
        {/* Breadcrumb */}
        <Breadcrumb />

        {/* Page Header */}
        <div className="mt-4 mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-1">
            Furniture Catalog
          </h1>
          <p className="font-body text-muted-foreground">
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
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileFiltersOpen(prev => !prev)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              aria-expanded={isMobileFiltersOpen}
              aria-controls="catalog-mobile-filters"
            >
              {isMobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Sidebar Filters */}
          <aside
            id="catalog-mobile-filters"
            className={`${isMobileFiltersOpen ? 'block' : 'hidden'} lg:block lg:w-64 flex-shrink-0`}
          >
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