# Technical Architecture: StockPilot

## 1. Overview

StockPilot is a mobile-first Progressive Web Application (PWA) designed for small-scale vendors to manage inventory, sales, and finances. It leverages a modern web stack to provide a native-app-like experience on Android and iOS devices.

## 2. Tech Stack

### Frontend

* **Framework**: React 18+ (with TypeScript)

* **Build Tool**: Vite

* **State Management**: Zustand (for global store)

* **Styling**: Tailwind CSS (with shadcn/ui components for consistent design)

* **Routing**: React Router DOM v6

* **Icons**: Lucide React

* **Charts**: Recharts (for Dashboard KPIs)

* **HTTP Client**: Axios or Fetch API

### Backend & Database

* **Platform**: Supabase (Backend-as-a-Service)

* **Database**: PostgreSQL (managed by Supabase)

* **Authentication**: Supabase Auth (Email/Password)

* **API**: Express.js (Node.js) - *Used primarily for AI proxy and complex business logic aggregation if needed, but direct Supabase client preferred for CRUD to leverage RLS.*

* **AI Integration**: OpenAI API (via Express backend to secure keys)

### Deployment

* **Frontend**: Vercel

* **Backend**: Vercel Serverless Functions (or Render if persistent server needed)

## 3. Architecture Diagrams

### 3.1 High-Level Architecture

```mermaid
graph TD
    Client[Mobile/Web Client] -->|HTTPS| CDN[Vercel CDN]
    Client -->|Data/Auth| Supabase[Supabase (DB & Auth)]
    Client -->|AI Requests| Express[Express Server]
    Express -->|Prompt| OpenAI[OpenAI API]
    Express -->|Context Data| Supabase
```

## 4. Database Schema (Supabase)

### Tables

1. **profiles** (extends auth.users)

   * `id` (uuid, PK, ref auth.users)

   * `business_name` (text)

   * `created_at` (timestamptz)

2. **products**

   * `id` (uuid, PK)

   * `user_id` (uuid, FK profiles.id)

   * `name` (text)

   * `size` (text)

   * `selling_price` (numeric)

   * `cost_price` (numeric)

   * `min_stock_threshold` (int)

   * `current_stock` (int)

   * `created_at` (timestamptz)

3. **inventory\_ledger**

   * `id` (uuid, PK)

   * `user_id` (uuid, FK profiles.id)

   * `product_id` (uuid, FK products.id)

   * `transaction_type` (enum: 'addition', 'sale')

   * `quantity_change` (int)

   * `stock_after` (int)

   * `date` (timestamptz)

4. **financial\_transactions**

   * `id` (uuid, PK)

   * `user_id` (uuid, FK profiles.id)

   * `type` (enum: 'income', 'expense')

   * `amount` (numeric)

   * `description` (text)

   * `date` (timestamptz)

   * `related_sale_id` (uuid, optional)

   * `related_inventory_id` (uuid, optional)

5. **sales**

   * `id` (uuid, PK)

   * `user_id` (uuid, FK profiles.id)

   * `customer_name` (text)

   * `total_amount` (numeric)

   * `discount` (numeric)

   * `created_at` (timestamptz)

6. **sale\_items**

   * `id` (uuid, PK)

   * `sale_id` (uuid, FK sales.id)

   * `product_id` (uuid, FK products.id)

   * `quantity` (int)

   * `unit_price` (numeric)

   * `subtotal` (numeric)

## 5. Security & Permissions

* **Row Level Security (RLS)**: Enabled on all tables.

* **Policies**: Users can only `SELECT`, `INSERT`, `UPDATE`,

