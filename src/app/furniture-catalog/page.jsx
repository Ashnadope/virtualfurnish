


import CatalogInteractive from './components/CatalogInteractive';

// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Furniture Catalog - VirtualFurnish',
  description: 'Browse our complete furniture collection with detailed product information and pricing'
};

export default function FurnitureCatalogPage() {
  return <CatalogInteractive />;
}