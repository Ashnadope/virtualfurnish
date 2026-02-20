'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

export default function Breadcrumb() {
  const pathname = usePathname();

  const pathSegments = pathname?.split('/')?.filter(Boolean);

  const breadcrumbMap = {
    'customer-dashboard': 'Dashboard',
    'virtual-room-designer': 'Room Designer',
    'admin-dashboard': 'Dashboard',
    'product-management': 'Products',
    'analytics-dashboard': 'Analytics',
    'furniture-catalog': 'Furniture Catalog',
    'order-history': 'Order History',
    'my-designs': 'My Designs',
    'login': 'Login',
  };

  const generateBreadcrumbs = () => {
    const breadcrumbs = [{ label: 'Home', path: '/' }];

    let currentPath = '';
    pathSegments?.forEach((segment) => {
      currentPath += `/${segment}`;
      breadcrumbs?.push({
        label: breadcrumbMap?.[segment] || segment?.charAt(0)?.toUpperCase() + segment?.slice(1),
        path: currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs?.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm font-body">
      {breadcrumbs?.map((crumb, index) => {
        const isLast = index === breadcrumbs?.length - 1;

        return (
          <div key={crumb?.path} className="flex items-center gap-2">
            {index > 0 && (
              <Icon name="ChevronRightIcon" size={16} variant="outline" className="text-muted-foreground" />
            )}
            {isLast ? (
              <span className="text-foreground font-medium">{crumb?.label}</span>
            ) : (
              <Link
                href={crumb?.path}
                className="text-muted-foreground hover:text-foreground transition-fast"
              >
                {crumb?.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}