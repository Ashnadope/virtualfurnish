'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { cartService } from '@/services/cart.service';
import { supportService } from '@/services/support.service';
import { useAuth } from '../../hooks/auth.hook';

export default function Header() {
  const { user, userRole, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [unreadSupport, setUnreadSupport] = useState(0);
  const [unreadAdminSupport, setUnreadAdminSupport] = useState(0);

  useEffect(() => {
    if (userRole !== 'customer' || !user?.id) return;

    let isMounted = true;

    const refresh = async () => {
      try {
        const [{ count }, unread] = await Promise.all([
          cartService.getCartCount(),
          supportService.getUnreadCount(),
        ]);
        if (isMounted) {
          setCartCount(count ?? 0);
          setUnreadSupport(unread ?? 0);
        }
      } catch { /* silent */ }
    };

    refresh();
    const interval = setInterval(refresh, 10_000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [userRole, user?.id]);

  useEffect(() => {
    if (userRole !== 'admin') return;

    let isMounted = true;

    const refreshAdmin = async () => {
      try {
        const res = await fetch('/api/support/admin/unread-count');
        if (!res.ok) return;
        const { count } = await res.json();
        if (isMounted) setUnreadAdminSupport(count ?? 0);
      } catch { /* silent */ }
    };

    refreshAdmin();
    const interval = setInterval(refreshAdmin, 30_000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [userRole]);

  const navigationLinks = [
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
    { label: 'Dashboard', path: '/customer-dashboard' },
    { label: 'Room Designer', path: '/virtual-room-designer' },
    { label: 'My Orders', path: '/order-history' },
  ];

  const adminNavigation = [
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
      <div className="flex items-center justify-between h-full px-3 md:px-6">
        <div className="flex items-center gap-2 md:gap-8">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-mobile-sidebar'))}
            className="md:hidden p-1.5 rounded-md hover:bg-muted transition-fast flex-shrink-0"
            aria-label="Open navigation"
          >
            <Icon name="Bars3Icon" size={20} variant="outline" />
          </button>
          <Link href={userRole === 'admin' ? '/admin-dashboard' : '/customer-dashboard'} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7L10 3L17 7V15L10 19L3 15V7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 11L14 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-semibold text-sm text-foreground">Brosas</span>
              <span className="hidden sm:block font-body text-xs text-muted-foreground">Furniture Store</span>
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

        <div className="flex items-center gap-1 md:gap-4">
          {/* Support message icon */}
          {userRole === 'customer' && (
            <Link
              href="/support"
              className="relative p-1.5 md:p-2 rounded-md hover:bg-muted transition-fast"
              aria-label="Support messages"
            >
              <Icon name="ChatBubbleLeftEllipsisIcon" size={24} variant="outline" />
              {unreadSupport > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadSupport > 9 ? '9+' : unreadSupport}
                </span>
              )}
            </Link>
          )}
          {userRole === 'admin' && (
            <Link
              href="/admin-support"
              className="relative p-1.5 md:p-2 rounded-md hover:bg-muted transition-fast"
              aria-label="Support inbox"
            >
              <Icon name="ChatBubbleLeftEllipsisIcon" size={24} variant="outline" />
              {unreadAdminSupport > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadAdminSupport > 9 ? '9+' : unreadAdminSupport}
                </span>
              )}
            </Link>
          )}
          {userRole === 'customer' && (
            <Link
              href="/cart"
              className="relative p-1.5 md:p-2 rounded-md hover:bg-muted transition-fast"
              aria-label="Shopping cart"
            >
              <Icon name="ShoppingCartIcon" size={24} variant="outline" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          <div className="relative">
            <button
              onClick={toggleProfile}
              className="flex items-center gap-1.5 p-1.5 md:p-2 rounded-md hover:bg-muted transition-fast"
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-heading font-semibold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <Icon name="ChevronDownIcon" size={16} variant="outline" className="hidden sm:block" />
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
                        await signOut();
                        window.location.href = '/';
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