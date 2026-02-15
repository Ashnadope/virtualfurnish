# Virtual Furnish - Workspace Index

**Project**: Virtual Furnish E-Commerce Platform  
**Framework**: Next.js 14 with React 18  
**Styling**: Tailwind CSS  
**Language**: JavaScript/JSX  
**Development Port**: 4028

---

## 📊 Project Overview

Virtual Furnish is a comprehensive furniture e-commerce and virtual room design platform with:
- **Admin Dashboard** - Order management, inventory, analytics
- **Customer Features** - Shopping, cart, checkout, virtual room designer
- **Payment Integration** - Stripe & GCash support
- **Database** - Supabase (PostgreSQL)
- **AI Integration** - OpenAI for room analysis
- **Real-time Features** - Order tracking, wishlist management

---

## 🗂️ Directory Structure

### Root Configuration Files
| File | Purpose |
|------|---------|
| `package.json` | Dependencies & scripts (v0.1.0) |
| `next.config.mjs` | Next.js configuration with image remotes |
| `jsconfig.json` | JavaScript/path aliases configuration |
| `tailwind.config.js` | Tailwind CSS theme customization |
| `postcss.config.js` | PostCSS processing pipeline |
| `.env` / `.env.example` | Environment variables |
| `.eslintrc.json` | ESLint rules configuration |
| `.prettierrc` | Code formatting rules |

---

## 📦 Dependencies

### Critical Runtime Dependencies
```
next: 14.2.0
react: 18.2.0
react-dom: 18.2.0
@stripe/stripe-js: 8.6.1
@stripe/react-stripe-js: 5.4.1
@supabase/ssr: 0.8.0
openai: 5.12.2
recharts: 2.15.2
html2canvas: 1.4.1
jspdf: 4.0.0
tailwindcss-animate: 1.0.7
@tailwindcss/forms: 0.5.10
@tailwindcss/typography: 0.5.16
@heroicons/react: 2.2.0
prop-types: 15.8.1
@dhiwise/component-tagger: 1.0.10
```

### Dev Dependencies
```
tailwindcss: 3.4.6
autoprefixer: 10.4.2
postcss: 8.4.8
eslint: 9
prettier: 3.5.3
cross-env: 10.1.0
@netlify/plugin-nextjs: 5.12.0
```

---

## 🚀 NPM Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (port 4028) |
| `npm run build` | Build production bundle |
| `npm start` | Run production server |
| `npm run lint` | Check code quality |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run format` | Format code with Prettier |
| `npm run serve` | Alias for start |

---

## 📁 Source Directory (`/src`)

### App Routes (`/src/app`)
**Next.js App Router Pages:**

| Route | Components | Purpose |
|-------|-----------|---------|
| `/` | `page.jsx` | Landing page |
| `/layout.jsx` | Root layout | Global layout wrapper |
| `/not-found.jsx` | Custom 404 | Not found page |
| `/login` | `page.jsx`, LoginForm | User authentication |
| `/signup` | `page.jsx`, SignupForm | User registration |
| `/furniture-catalog` | `page.jsx`, ProductList | Main product browsing |
| `/product/[id]` | Dynamic route | Individual product details |
| `/add-product-form` | `page.jsx`, AddProductFormInteractive | Admin: Add new products |
| `/product-management` | `page.jsx`, Components | Admin: Manage products |
| `/cart` | `page.jsx`, CartInteractive | Shopping cart |
| `/checkout` | `page.jsx`, CheckoutInteractive | Order checkout |
| `/checkout/success` | `page.jsx` | Payment success confirmation |
| `/order-history` | `page.jsx`, OrderHistoryInteractive | Customer order tracking |
| `/customer-dashboard` | `page.jsx`, CustomerDashboardInteractive | Customer account hub |
| `/admin-dashboard` | `page.jsx`, AdminDashboardInteractive | Admin overview & analytics |
| `/admin-orders` | `page.jsx`, AdminOrdersInteractive | Order management |
| `/analytics-dashboard` | `page.jsx`, Analytics | Business metrics |
| `/virtual-room-designer` | `page.jsx`, RoomDesignerInteractive | AR/VR room preview |
| `/wishlist` | `page.jsx`, WishlistInteractive | Saved favorite items |
| `/api/auth/[...auth]` | NextAuth route | Authentication endpoints |
| `/api/room-analysis` | Custom endpoint | AI room analysis |

### Admin Dashboard Components (`/src/app/admin-dashboard/components`)
| Component | Purpose |
|-----------|---------|
| `AdminDashboardInteractive.jsx` | Main dashboard container |
| `ActivityItem.jsx` | Recent activity display |
| `MetricsCard.jsx` | Statistics/KPI cards |
| `SalesChart.jsx` | Recharts visualization |
| `OrderPreviewItem.jsx` | Order summary widget |
| `InventoryAlertItem.jsx` | Low stock alerts |
| `QuickActionTile.jsx` | Quick action buttons |
| `AdminProtection.jsx` | Role-based access control |

### Common Components (`/src/components/common`)
| Component | Purpose |
|-----------|---------|
| `Header.jsx` | Navigation bar |
| `Sidebar.jsx` | Side navigation |
| `Breadcrumb.jsx` | Navigation breadcrumbs |

### UI Components (`/src/components/ui`)
| Component | Purpose |
|-----------|---------|
| `AppIcon.jsx` | Icon wrapper component |
| `AppImage.jsx` | Optimized image wrapper |

### Payment Components (`/src/components/payment`)
| Component | Purpose |
|-----------|---------|
| `StripePaymentForm.jsx` | Stripe checkout |
| `GCashPaymentForm.jsx` | GCash payment integration |

### Other Components
| Component | Purpose |
|-----------|---------|
| `DebugPanel.jsx` | Dev tools debugging |

---

## 🔧 Services (`/src/services`)

Service layer for API communication:

| Service | Endpoints |
|---------|-----------|
| `product.service.js` | CRUD operations for products |
| `cart.service.js` | Add/remove items, cart state |
| `order.service.js` | Create, retrieve, update orders |
| `payment.service.js` | Payment processing, refunds |
| `wishlist.service.js` | Save/remove favorites |

---

## 🏗️ Libraries & Utilities (`/src/lib`)

| Module | Purpose |
|--------|---------|
| `supabase.js` | Supabase client initialization |
| `supabase/client.js` | Client-side Supabase instance |
| `supabase/server.js` | Server-side Supabase instance |
| `stripe/client.js` | Stripe client initialization |
| `openaiClient.js` | OpenAI API configuration |

---

## 🛠️ Utilities (`/src/utils`)

| Utility | Purpose |
|---------|---------|
| `invoiceGenerator.js` | Generate PDF invoices (html2canvas + jsPDF) |
| `mockData.js` | Test/demo data |

---

## 🔐 Context (`/src/contexts`)

State management with React Context:

| Context | Purpose |
|---------|---------|
| `AuthContext.jsx` | User authentication state |
| `DebugContext.jsx` | Debug mode toggle |

---

## 🪝 Custom Hooks (`/src/hooks`)

| Hook | Purpose |
|------|---------|
| `auth.hook.jsx` | Authentication utilities |

---

## 🎨 Styles (`/src/styles`)

| File | Purpose |
|------|---------|
| `tailwind.css` | Custom Tailwind extensions |
| `index.css` | Global styles |

---

## 💾 Supabase Configuration (`/supabase`)

### Database Migrations (`/supabase/migrations`)
| File | Purpose | Date |
|------|---------|------|
| `20260107021117_payment_system.sql` | Payment tables schema | Jan 7, 2026 |
| `20260107024234_wishlist_module.sql` | Wishlist tables schema | Jan 7, 2026 |
| `20260126000000_seed_products.sql` | Product seeding | Jan 26, 2026 |
| `20260129000000_seed_customer_orders.sql` | Customer orders data | Jan 29, 2026 |
| `20260129000002_seed_gen_lee_orders.sql` | Gen Lee orders data | Jan 29, 2026 |

### Edge Functions (`/supabase/functions`)
| Function | Purpose |
|----------|---------|
| `create-payment-intent` | Initialize Stripe payment |
| `confirm-payment` | Verify payment completion |
| `process-gcash-payment` | Handle GCash transactions |

---

## 📸 Public Assets (`/public`)

| Folder | Contains |
|--------|----------|
| `assets/images/` | Product images, UI graphics |

---

## 🔌 External Integrations

### Payment Processing
- **Stripe** - Credit card payments, payment intents
- **GCash** - Philippines mobile wallet

### Database & Auth
- **Supabase** - PostgreSQL database, authentication, edge functions
- **Row Level Security (RLS)** - Database access control

### AI Services
- **OpenAI** - Room analysis, product recommendations

### Image Hosting
- **Unsplash** - Product placeholder images
- **Pexels** - Room design reference images
- **Pixabay** - Additional imagery

---

## 🔄 Data Flow Architecture

```
UI Components
    ↓
Services (API calls)
    ↓
API Routes (Next.js)
    ↓
Supabase (Database)
    ↓
Edge Functions (Payment processing)
```

---

## 🎯 Key Features by Module

### Admin Module
- Dashboard with KPI metrics
- Order management & tracking
- Product inventory management
- Sales analytics with charts
- Admin protection/access control

### Customer Module
- Product catalog browsing
- Shopping cart management
- Checkout flow
- Payment processing (Stripe/GCash)
- Order history & tracking
- Wishlist functionality
- Virtual room designer with AI analysis

### Authentication
- Login/signup system
- Session management via AuthContext
- Role-based access control

### Analytics
- Real-time sales metrics
- Order trends
- Inventory alerts

---

## 🔐 Environment Variables Required

Based on integrations, you'll need:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
GCASH_API_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_API_URL=
```

---

## 📊 Database Tables (Inferred from Migrations)

### Payment System
- `payments` - Payment records
- `payment_intents` - Stripe intent tracking
- `transactions` - Transaction log

### Products & Orders
- `products` - Furniture catalog
- `orders` - Customer orders
- `order_items` - Items per order
- `inventory` - Stock tracking

### Customer Features
- `wishlist` - Saved favorites
- `cart` - Shopping cart
- `customers` - Customer profiles
- `addresses` - Shipping addresses

---

## 🚀 Development Workflow

1. **Start dev server**: `npm run dev`
2. **Code at**: `src/app/` (pages) and `src/components/` (components)
3. **Services**: Use files in `src/services/` for API calls
4. **Styling**: Use Tailwind classes + `src/styles/` customizations
5. **Database**: Query via Supabase client from services
6. **Testing**: Check localhost:4028

---

## ⚠️ Critical Dependencies

**Do NOT remove or modify these (marked in package.json):**
- next
- react
- react-dom
- prop-types
- @dhiwise/component-tagger
- @tailwindcss/typography
- recharts

---

## 📝 Last Updated

**Current Date**: February 2, 2026  
**Index Version**: 1.0

---

**This index provides a complete roadmap of your Virtual Furnish codebase. Use it as a reference while developing features or debugging issues.**
