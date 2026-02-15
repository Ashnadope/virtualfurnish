'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { orderService } from '@/services/order.service';

export default function Sidebar({ userRole = 'customer', isCollapsed = false }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    if (userRole === 'customer' && user?.id) {
      loadOrderCount();
    }
  }, [userRole, user?.id]);

  const loadOrderCount = async () => {
    try {
      const orders = await orderService.getUserOrders(user.id);
      setOrderCount(orders?.length || 0);
    } catch (error) {
      console.error('Error loading order count:', error);
    }
  };

  const customerNavigation = [
    { label: 'Dashboard', path: '/customer-dashboard', icon: 'HomeIcon' },
    { label: 'Room Designer', path: '/virtual-room-designer', icon: 'CubeIcon' },
    { label: 'My Orders', path: '/order-history', icon: 'ShoppingBagIcon' },
  ];

  const adminNavigation = [
    { label: 'Dashboard', path: '/admin-dashboard', icon: 'ChartBarIcon' },
    { label: 'Orders', path: '/admin-orders', icon: 'ShoppingBagIcon' },
    { label: 'Products', path: '/product-management', icon: 'CubeIcon' },
    { label: 'Analytics', path: '/analytics-dashboard', icon: 'ChartPieIcon' },
  ];

  const navigation = userRole === 'admin' ? adminNavigation : customerNavigation;

  const isActive = (path) => pathname === path;

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  return (
    <>
      <button
        onClick={toggleMobile}
        className="lg:hidden fixed top-4 left-4 z-overlay p-2 rounded-md bg-surface shadow-card"
        aria-label="Toggle navigation"
      >
        <Icon name="Bars3Icon" size={24} variant="outline" />
      </button>
      <aside
        className={`
          fixed top-0 left-0 h-full bg-surface border-r border-border z-sidebar
          transition-all duration-300 ease-smooth
          ${isCollapsed ? 'w-16' : 'w-sidebar'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 px-4 border-b border-border">
            <Link href={userRole === 'admin' ? '/admin-dashboard' : '/customer-dashboard'} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 7L10 3L17 7V15L10 19L3 15V7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 11L14 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-heading font-semibold text-sm text-foreground">Brosas</span>
                  <span className="font-body text-xs text-muted-foreground">Furniture Store</span>
                </div>
              )}
            </Link>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation?.map((item) => (
              <Link
                key={item?.path}
                href={item?.path}
                className={`
                  flex items-center gap-3 px-3 h-nav-item rounded-md
                  transition-fast font-body text-nav
                  ${isActive(item?.path)
                    ? 'bg-primary text-primary-foreground shadow-card'
                    : 'text-foreground hover:bg-muted hover:text-foreground'
                  }
                `}
              >
                <Icon name={item?.icon} size={20} variant={isActive(item?.path) ? 'solid' : 'outline'} />
                {!isCollapsed && <span>{item?.label}</span>}
                {item?.label === 'My Orders' && userRole === 'customer' && orderCount > 0 && !isCollapsed && (
                  <span className="ml-auto bg-accent text-accent-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                    {orderCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="px-3 py-4 border-t border-border">
            <Link
              href="/login"
              className="flex items-center gap-3 px-3 h-nav-item rounded-md text-foreground hover:bg-muted transition-fast font-body text-nav"
            >
              <Icon name="ArrowRightOnRectangleIcon" size={20} variant="outline" />
              {!isCollapsed && <span>Logout</span>}
            </Link>
          </div>
        </div>
      </aside>
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/50 z-dropdown"
          onClick={toggleMobile}
          aria-hidden="true"
        />
      )}
    </>
  );
}