'use client';

import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import ProductFilters from './ProductFilters';
import ProductTableHeader from './ProductTableHeader';
import ProductTableRow from './ProductTableRow';
import ProductFormModal from './ProductFormModal';
import BulkActionsBar from './BulkActionsBar';
import DeleteConfirmModal from './DeleteConfirmModal';
import Pagination from './Pagination';

export default function ProductManagementInteractive({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [filters, setFilters] = useState({
    search: '',
    category: 'All Categories',
    status: 'All Status',
    priceRange: 'all'
  });
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: 'All Categories',
      status: 'All Status',
      priceRange: 'all'
    });
    setCurrentPage(1);
  };

  const handleSort = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
  };

  const handleSelectProduct = (id, checked) => {
    setSelectedProducts(prev =>
      checked ? [...prev, id] : prev?.filter(pid => pid !== id)
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedProducts(checked ? filteredProducts?.map(p => p?.id) : []);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  const handleSaveProduct = (productData) => {
    if (editingProduct) {
      setProducts(prev =>
        prev?.map(p => (p?.id === productData?.id ? productData : p))
      );
    } else {
      setProducts(prev => [...prev, productData]);
    }
    setIsFormModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id) => {
    setDeleteTarget([id]);
    setIsDeleteModalOpen(true);
  };

  const handleBulkDelete = () => {
    setDeleteTarget(selectedProducts);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setProducts(prev => prev?.filter(p => !deleteTarget?.includes(p?.id)));
    setSelectedProducts([]);
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleToggleStatus = (id) => {
    setProducts(prev =>
      prev?.map(p =>
        p?.id === id
          ? { ...p, status: p?.status === 'active' ? 'inactive' : 'active' }
          : p
      )
    );
  };

  const handleBulkStatusChange = (status) => {
    setProducts(prev =>
      prev?.map(p =>
        selectedProducts?.includes(p?.id) ? { ...p, status } : p
      )
    );
    setSelectedProducts([]);
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (filters?.search) {
      const searchLower = filters?.search?.toLowerCase();
      filtered = filtered?.filter(
        p =>
          p?.name?.toLowerCase()?.includes(searchLower) ||
          p?.sku?.toLowerCase()?.includes(searchLower)
      );
    }

    if (filters?.category !== 'All Categories') {
      filtered = filtered?.filter(p => p?.category === filters?.category);
    }

    if (filters?.status !== 'All Status') {
      filtered = filtered?.filter(p => p?.status === filters?.status?.toLowerCase());
    }

    if (filters?.priceRange !== 'all') {
      const [min, max] = filters?.priceRange?.split('-')?.map(v => parseFloat(v?.replace('+', '')));
      filtered = filtered?.filter(p => {
        if (filters?.priceRange?.includes('+')) return p?.price >= min;
        return p?.price >= min && p?.price <= max;
      });
    }

    filtered?.sort((a, b) => {
      let aVal = a?.[sortField];
      let bVal = b?.[sortField];

      if (typeof aVal === 'string') {
        aVal = aVal?.toLowerCase();
        bVal = bVal?.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [products, filters, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredProducts?.length / itemsPerPage);
  const paginatedProducts = filteredProducts?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-foreground">Product Management</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Manage your furniture inventory and product catalog
          </p>
        </div>
        <button
          onClick={handleAddProduct}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-md font-body text-sm font-medium hover:bg-primary/90 transition-fast shadow-card"
        >
          <Icon name="PlusIcon" size={20} variant="outline" />
          Add Product
        </button>
      </div>
      <ProductFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />
      <div className="bg-surface border border-border rounded-lg shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <p className="font-body text-sm text-muted-foreground">
              Showing {paginatedProducts?.length} of {filteredProducts?.length} products
            </p>
            {selectedProducts?.length > 0 && (
              <p className="font-body text-sm font-medium text-primary">
                {selectedProducts?.length} selected
              </p>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <ProductTableHeader
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              allSelected={selectedProducts?.length === filteredProducts?.length && filteredProducts?.length > 0}
              onSelectAll={handleSelectAll}
            />
            <tbody>
              {paginatedProducts?.map(product => (
                <ProductTableRow
                  key={product?.id}
                  product={product}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onToggleStatus={handleToggleStatus}
                  isSelected={selectedProducts?.includes(product?.id)}
                  onSelect={handleSelectProduct}
                />
              ))}
            </tbody>
          </table>

          {paginatedProducts?.length === 0 && (
            <div className="py-12 text-center">
              <Icon name="InboxIcon" size={48} variant="outline" className="mx-auto text-muted-foreground mb-3" />
              <p className="font-body text-sm text-muted-foreground">No products found</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        product={editingProduct}
      />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
        productCount={deleteTarget?.length || 0}
      />
      <BulkActionsBar
        selectedCount={selectedProducts?.length}
        onBulkDelete={handleBulkDelete}
        onBulkStatusChange={handleBulkStatusChange}
        onClearSelection={() => setSelectedProducts([])}
      />
    </div>
  );
}

ProductManagementInteractive.propTypes = {
  initialProducts: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.number?.isRequired,
      name: PropTypes?.string?.isRequired,
      sku: PropTypes?.string?.isRequired,
      category: PropTypes?.string?.isRequired,
      price: PropTypes?.number?.isRequired,
      stock: PropTypes?.number?.isRequired,
      status: PropTypes?.string?.isRequired,
      description: PropTypes?.string?.isRequired,
      dimensions: PropTypes?.string,
      material: PropTypes?.string,
      weight: PropTypes?.string,
      color: PropTypes?.string,
      image: PropTypes?.string?.isRequired,
      imageAlt: PropTypes?.string?.isRequired
    })
  )?.isRequired
};