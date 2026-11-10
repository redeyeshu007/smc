# Production-Ready AR Door & Window Showroom Platform

A modular, production-architected **Augmented Reality (AR) Door & Window Website**.

---

## 1. System Architecture Overview

```
                      +---------------------------------------+
                      |       Next.js 15 (React 19) App       |
                      |  - Customer Showcase & Configurator   |
                      |  - Google Model Viewer & AR Pipeline  |
                      |  - Apple ARKit Quick Look (USDZ)      |
                      |  - Android ARCore Scene Viewer (GLB)  |
                      |  - Administrative Backoffice Hub      |
                      +-------------------+-------------------+
                                          |
                                HTTP / REST API (CORS, JWT)
                                          |
                      +-------------------v-------------------+
                      |      Express.js + TypeScript API      |
                      |  - Zod Request & Query Validation     |
                      |  - Centralized Error Handling         |
                      |  - Multer 3D & Texture Upload Filter  |
                      |  - Sharp Image Processing             |
                      +---------+-------------------+---------+
                                |                   |
                 Mongoose ODM   |                   |  AWS SDK v3 / S3-API
                                v                   v
                  +-------------------+     +-------------------+
                  |  MongoDB Database |     | Cloudflare R2/ S3 |
                  |  - Products       |     |  - GLB Models     |
                  |  - 3D Assets (LOD)|     |  - USDZ (iOS AR)  |
                  |  - Categories     |     |  - PBR Textures   |
                  |  - Auth & Users   |     |  - WebP Images    |
                  +-------------------+     +-------------------+
```

---

## 2. Directory Structure

```
SMC/
├── package.json                         # Root task orchestrator scripts
├── .gitignore                           # Git exclusions (node_modules, .next, dist, .env)
├── README.md                            # Complete architectural documentation
├── backend/                             # Independent REST API service
│   ├── .env                             # Active environment variables
│   ├── .env.example                     # Reference environment variables
│   ├── package.json                     # Backend dependencies and scripts
│   ├── tsconfig.json                    # NodeNext TypeScript configuration
│   ├── eslint.config.mjs                # ESLint configuration
│   ├── .prettierrc                      # Prettier configuration
│   └── src/
│       ├── config/
│       │   ├── env.ts                   # Zod-validated environment config
│       │   ├── database.ts              # Mongoose singleton with lifecycle hooks & state check
│       │   └── storage.ts               # Cloudflare R2 / S3 client & local fallback
│       ├── controllers/
│       │   ├── healthController.ts      # Health & MongoDB status endpoint
│       │   ├── productController.ts     # Door & Window CRUD controller
│       │   ├── assetController.ts       # 3D GLB/USDZ asset upload & presigned URLs
│       │   └── authController.ts        # JWT authentication controller
│       ├── middleware/
│       │   ├── auth.ts                  # JWT authentication & RBAC middleware
│       │   ├── errorHandler.ts          # Centralized error handler
│       │   ├── upload.ts                # Multer with 3D format & texture file filter
│       │   └── validateRequest.ts       # Zod schema request validation middleware
│       ├── models/
│       │   ├── Asset3D.ts               # GLB, USDZ, LOD levels, polycount, AR flags
│       │   ├── Category.ts              # Category schema (doors, windows, hardware)
│       │   ├── Product.ts               # Sizing ranges, PBR materials, hardware, AR config
│       │   └── User.ts                  # User authentication & role schema
│       ├── routes/
│       │   ├── healthRoutes.ts          # /api/v1/health
│       │   ├── productRoutes.ts         # /api/v1/products
│       │   ├── assetRoutes.ts           # /api/v1/assets
│       │   ├── authRoutes.ts            # /api/v1/auth
│       │   └── index.ts                 # Unified API v1 router
│       ├── services/
│       │   ├── storageService.ts        # S3/R2 presigned URLs, uploads & Sharp WebP
│       │   ├── productService.ts        # Product domain logic & queries
│       │   └── assetService.ts          # 3D asset metadata & registration
│       ├── utils/
│       │   ├── apiError.ts              # Standardized ApiError class
│       │   ├── apiResponse.ts           # Unified JSON response envelope
│       │   ├── asyncHandler.ts          # Promise rejection wrapper
│       │   ├── logger.ts                # Structured terminal logger
│       │   └── verify-db.ts             # MongoDB & Mongoose verification utility
│       ├── app.ts                       # Express application factory (CORS, Helmet)
│       └── server.ts                    # HTTP server bootstrap & graceful shutdown
└── frontend/                            # Next.js 15 App Router Frontend
    ├── .env.local                       # Active frontend environment variables
    ├── .env.example                     # Reference frontend environment variables
    ├── package.json                     # Frontend dependencies and scripts
    ├── tsconfig.json                    # TypeScript path aliases (@/* -> ./*)
    ├── tailwind.config.ts               # Tailwind CSS with shadcn theme tokens
    ├── components.json                  # shadcn/ui configuration
    ├── app/
    │   ├── layout.tsx                   # Root layout with Navbar, Footer & Providers
    │   ├── page.tsx                     # Architecture Overview & API Health Dashboard
    │   ├── catalog/page.tsx             # Dynamic Showroom Product Catalog
    │   ├── ar-viewer/page.tsx           # AR Integration Hub (Google Model Viewer)
    │   └── admin/page.tsx               # Admin & 3D Asset Management Hub
    ├── components/
    │   ├── ui/                          # shadcn/ui buttons, cards, badges
    │   ├── common/                      # Navbar, Footer, Providers
    │   └── 3d/                          # ModelViewerCanvas, ARLaunchButton
    ├── features/
    │   ├── catalog/                     # ProductCard, ProductFilter
    │   ├── customizer/                  # DimensionInputs, MaterialSelector
    │   └── ar-viewer/                   # AR device capability inspection
    ├── hooks/
    │   ├── useModelViewer.ts            # Dynamic Google Model Viewer lifecycle
    │   ├── useARCapabilities.ts         # ARCore / ARKit / WebXR detection
    │   └── useMediaQuery.ts             # Responsive breakpoint hook
    ├── services/
    │   ├── api-client.ts                # Axios client with interceptors & JWT handling
    │   ├── health-service.ts            # Telemetry health fetcher
    │   ├── product-service.ts           # Catalog API client
    │   └── asset-service.ts             # 3D asset presigned URL client
    ├── stores/
    │   ├── useConfiguratorStore.ts      # Sizing, PBR finish & real-time pricing
    │   └── useARStore.ts                # AR placement and session state
    ├── types/
    │   ├── api.ts
    │   ├── asset3d.ts
    │   ├── product.ts
    │   └── ar.ts
    └── utils/
        ├── cn.ts                        # ClassName merge utility
        ├── formatters.ts                # Currency, dimension (mm/in), polycount formatters
        └── 3d-helpers.ts                # Android Scene Viewer URL builder, WebXR checks
```

---

## 3. Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Zustand, TanStack Query
- **Backend**: Node.js, Express.js, TypeScript, REST Architecture
- **Database**: MongoDB with Mongoose ODM (strictly no PostgreSQL / Prisma)
- **3D & AR**: Blender-created 3D assets, GLB/GLTF 2.0, Apple USDZ, Google model-viewer, Android Scene Viewer (ARCore), Apple AR Quick Look (ARKit), Three.js (only where necessary for custom 3D utilities)
- **Cloud Storage**: Cloudflare R2 / AWS S3 (`@aws-sdk/client-s3`) with automatic local fallback
- **Validation & Tools**: Zod (schema validation), JWT, bcryptjs, Sharp (WebP image compression)

---

## 4. Quick Start: Running the Project Locally

### Prerequisites
- Node.js >= 20.x (Recommended: v22 or v24)
- npm >= 10.x
- MongoDB (Local instance at `mongodb://localhost:27017` or MongoDB Atlas connection string)

### Step 1: Install Dependencies
```bash
# In backend
cd backend
npm install

# In frontend
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables
Copy the example files:
```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env.local
```

### Step 3: Verify MongoDB & Mongoose Setup
```bash
cd backend
npm run test:db
```
*This diagnostic runs an end-to-end verification of connection, schema compilation, and CRUD operations.*

### Step 4: Run the Backend API Server
```bash
cd backend
npm run dev
```
- Server URL: `http://localhost:5000`
- Health check API: `http://localhost:5000/api/v1/health`

### Step 5: Run the Next.js Frontend
In a separate terminal:
```bash
cd frontend
npm run dev
```
- Frontend application: `http://localhost:3000`
- Showroom Catalog: `http://localhost:3000/catalog`
- AR Experience Engine: `http://localhost:3000/ar-viewer`
- Admin Dashboard: `http://localhost:3000/admin`
