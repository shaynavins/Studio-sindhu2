# TailorHub - Boutique Management System

## Overview

TailorHub is a professional tailor management application designed for boutique companies. It provides a comprehensive system for managing customers, measurements, orders, and photos. The application follows a Linear-inspired design system with a focus on clarity, efficiency, and professional aesthetics suitable for daily business use.

The system enables tailors and administrators to:
- Track customer information and contact details
- Store and manage customer measurements
- Monitor order status through the production workflow (new → measuring → cutting → stitching → ready → delivered)
- Upload and organize customer photos via Google Drive integration
- Maintain measurement records via Google Sheets integration

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, utilizing Vite as the build tool

**UI Component System**: 
- Shadcn/ui component library (New York variant) for consistent, accessible components
- Radix UI primitives for headless, accessible component foundations
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for type-safe component variants

**Design Philosophy**:
- Linear + Notion hybrid approach prioritizing clarity over decoration
- Light and dark mode support via theme provider
- Professional color palette with HSL-based color system
- Inter font family throughout for consistency
- Responsive design with mobile-first approach

**State Management**:
- TanStack Query (React Query) for server state management, caching, and data fetching
- React Hook Form with Zod validation for form state and validation
- Local React state for UI-specific concerns

**Routing**: Wouter for lightweight client-side routing

**Key Pages**:
- Dashboard: Overview statistics and recent customer activity
- Customers: Full customer list with search and filtering
- New Customer: Multi-step form for customer creation and measurement entry
- Settings: Application configuration including Google Drive/Sheets integration

### Backend Architecture

**Runtime**: Node.js with Express.js framework

**Language**: TypeScript with ES modules

**API Design**: RESTful JSON API with the following key endpoints:
- `GET /api/customers` - Retrieve all customers (with optional tailor filtering)
- `GET /api/customers/:id` - Get single customer details
- `POST /api/customers` - Create new customer with image uploads
- `GET /api/orders` - Retrieve orders by customer
- `POST /api/orders` - Create new order

**File Upload Handling**: Multer middleware for multipart/form-data processing (customer images)

**Data Validation**: Zod schemas shared between client and server for type safety and validation consistency

**Storage Layer**: 
- Abstracted storage interface (IStorage) for data operations
- In-memory implementation (MemStorage) for development
- Design supports future PostgreSQL integration via Drizzle ORM

### Database Schema

**ORM**: Drizzle ORM configured for PostgreSQL

**Schema Design** (defined in `shared/schema.ts`):

1. **users** table:
   - UUID primary key
   - Username (unique), password, name
   - Role-based access control (admin, tailor)

2. **customers** table:
   - UUID primary key
   - Contact information: name, phone, email, address
   - Google Drive folder ID for photo storage
   - Google Sheets ID for measurement tracking
   - Tailor assignment via foreign key
   - Timestamps for creation and updates

3. **orders** table:
   - UUID primary key
   - Customer relationship via foreign key
   - Garment type and delivery date
   - Status tracking through workflow stages
   - Notes field for additional context
   - Timestamps for creation and updates

**Database Provider**: Configured for Neon serverless PostgreSQL with connection pooling

**Migrations**: Drizzle Kit manages schema migrations in `/migrations` directory

### External Dependencies

**Google Drive Integration**:
- Purpose: Store customer photos in organized folder structure
- Implementation: Google APIs client library with OAuth2 authentication
- Folder hierarchy: One folder per customer named `{customerName} - {customerId}`
- Access token management via Replit Connectors API for automated credential refresh

**Google Sheets Integration**:
- Purpose: Maintain structured measurement records
- Implementation: Google Sheets API v4
- Sheet creation: One spreadsheet per customer for measurement tracking
- Data persistence: Measurements added as rows with timestamp tracking

**Replit-Specific Integrations**:
- Connector system for Google OAuth management via `REPLIT_CONNECTORS_HOSTNAME`
- Identity tokens (`REPL_IDENTITY`, `WEB_REPL_RENEWAL`) for secure connector access
- Development tooling: Cartographer and dev banner plugins for Replit environment
- Runtime error overlay for improved developer experience

**Authentication Strategy**:
- Token-based authentication with credentials stored in connectors
- Automatic token refresh when expired (checked before API calls)
- Environment-specific token selection (development vs. deployment)

**Third-Party UI Libraries**:
- Lucide React for consistent iconography
- date-fns for date manipulation and formatting
- React Day Picker for calendar/date selection components
- cmdk for command palette functionality
- Vaul for drawer components

**Development Tools**:
- TypeScript for type safety across the stack
- ESBuild for backend bundling in production
- PostCSS with Autoprefixer for CSS processing
- Drizzle Kit for database schema management