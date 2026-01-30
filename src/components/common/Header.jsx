'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { cartService } from '@/services/cart.service';
import { useAuth } from '../../hooks/auth.hook';

export default function Header() {
  const { user, userRole, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (userRole === 'customer') {
      loadCartCount();
    }
  }, [userRole, pathname]);

  const loadCartCount = async () => {
    const { count } = await cartService?.getCartCount();
    setCartCount(count);
  };

  const navigationLinks = [
    { 
      name: 'Home', 
      path: '/', 
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      roles: ['customer', 'admin', 'guest']
    },
    { 
      name: 'Catalog', 
      path: '/furniture-catalog', 
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      roles: ['customer', 'admin', 'guest']
    },
    { 
      name: 'Dashboard', 
      path: userRole === 'customer' ? '/customer-dashboard' : '/admin-dashboard', 
      icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z',
      roles: ['customer', 'admin']
    },
  ];

  const customerNavigation = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/customer-dashboard' },
    { label: 'Room Designer', path: '/virtual-room-designer' },
    { label: 'My Orders', path: '/order-history' },
  ];

  const adminNavigation = [
    { label: 'Home', path: '/' },
    { label: 'Dashboard', path: '/admin-dashboard' },
    { label: 'Orders', path: '/admin-orders' },
    { label: 'Products', path: '/product-management' },
    { label: 'Analytics', path: '/analytics-dashboard' },
  ];

  const navigation = userRole === 'admin' ? adminNavigation : customerNavigation;

  const isActive = (path) => pathname === path;

  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface border-b border-border z-sidebar">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-8">
          <Link href={userRole === 'admin' ? '/admin-dashboard' : '/customer-dashboard'} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7L10 3L17 7V15L10 19L3 15V7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 11L14 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-semibold text-sm text-foreground">Brosas</span>
              <span className="font-body text-xs text-muted-foreground">Furniture Store</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            {navigation?.map((item) => (
              <Link
                key={item?.path}
                href={item?.path}
                className={`
                  px-4 py-2 rounded-md font-body text-nav transition-fast
                  ${isActive(item?.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                  }
                `}
              >
                {item?.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {userRole === 'customer' && (
            <Link
              href="/cart"
              className="relative p-2 rounded-md hover:bg-muted transition-fast"
              aria-label="Shopping cart"
            >
              <Icon name="ShoppingCartIcon" size={24} variant="outline" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          <div className="relative">
            <button
              onClick={toggleProfile}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-fast"
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-heading font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <Icon name="ChevronDownIcon" size={16} variant="outline" />
            </button>

            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-dropdown"
                  onClick={toggleProfile}
                  aria-hidden="true"
                />
                <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-elevated z-overlay animate-slide-in">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="font-body font-medium text-sm text-popover-foreground">{user?.name}</p>
                    <p className="font-body text-xs text-muted-foreground capitalize">{userRole}</p>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={async () => {
                        toggleProfile();
                        const { error } = await signOut();
                        if (!error) {
                          // Wait a moment for the auth state to update
                          setTimeout(() => {
                            window.location.href = '/login';
                          }, 300);
                        }
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-fast"
                    >
                      <Icon name="ArrowRightOnRectangleIcon" size={18} variant="outline" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}