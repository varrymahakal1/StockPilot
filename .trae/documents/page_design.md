# Page Design & UI/UX: StockPilot

## 1. Design System
- **Theme**: Mobile-first, clean, high-contrast for readability outdoors.
- **Colors**:
  - Primary: `blue-600` (Actions, Highlights)
  - Secondary: `slate-900` (Text, Headings)
  - Success: `green-600` (Income, Stock OK)
  - Danger: `red-500` (Expense, Low Stock, Delete)
  - Warning: `amber-500` (Near Threshold)
  - Background: `slate-50` (App Bg), `white` (Cards/Containers)
- **Typography**: Sans-serif (Inter or similar), large touch targets.
- **Components**: shadcn/ui (Cards, Dialogs, Tables, Forms, Buttons).

## 2. Page Structure & Navigation
- **Layout**:
  - **Top Bar**: Logo/Title, User Avatar (Menu: Profile, Logout).
  - **Main Content**: Scrollable area with padding.
  - **Bottom Navigation (Mobile)** / **Sidebar (Desktop)**:
    - Dashboard (Home)
    - Products (Box Icon)
    - Inventory (Clipboard Icon)
    - Transactions (Wallet Icon)
    - AI Analyst (Sparkles/Bot Icon)

## 3. Detailed Page Designs

### 3.1 Authentication
- **Login/Signup Page**:
  - Centered Card.
  - Logo.
  - Email & Password fields.
  - "Sign In" and "Create Account" toggle.
  - Error message display.

### 3.2 Dashboard (Home)
- **KPI Cards (Grid)**:
  - `Today's Sales`: Large Number + Trend Indicator.
  - `Monthly Sales`: Comparison with last month.
  - `Low Stock`: Count of items (Red if > 0).
- **Chart Section**:
  - Bar Chart: Last 7 days revenue.
- **Needs Restock List**:
  - Simple list of items < minThreshold.
  - Action button: "Add Stock" (Quick link).
- **Floating Action Button (FAB)**:
  - "Process Sale" (Primary Action).

### 3.3 Product Management (Product Master)
- **Header**: "Products" + "Add New" Button.
- **List/Table**:
  - Mobile: Card view per product (Name, Price, Stock).
  - Desktop: Table view.
  - Visual Indicator: Red border/text if Low Stock.
- **Add/Edit Dialog**:
  - Form fields: Name, Size, Selling Price, Cost Price, Min Threshold.
- **Delete**: Confirmation Modal.

### 3.4 Inventory Management (Ledger)
- **Add Stock Form**:
  - Select Product (Dropdown/Search).
  - Input: Quantity, Cost/Piece.
  - Auto-calc: Total Value.
  - Submit Button.
- **Inventory Ledger List**:
  - Chronological list of movements.
  - Format: Date | Product | +10 / -5 | Stock After: 50.

### 3.5 Sales Processing (POS)
- **Customer Info**: Name input (optional).
- **Product Selector**:
  - Searchable dropdown or list.
  - Add to cart mechanism.
- **Cart List**:
  - Item, Qty, Price, Subtotal.
  - Remove item button.
- **Totals**:
  - Subtotal.
  - Discount Input (Numeric).
  - Grand Total (Large Text).
- **Actions**:
  - "Confirm Sale" (Commits transaction & inventory update).
  - "Cancel".

### 3.6 Financial Transactions
- **Filter Tabs**: All | Income | Expense.
- **List**:
  - Date | Description | Amount (+ Green / - Red).
- **Sort**: Newest first.

### 3.7 AI Business Analyst
- **Chat Interface**:
  - Chat history area (bubbles).
  - Input area with Send button.
  - "Thinking..." indicator.
- **Context**:
  - System automatically fetches summaries of Sales/Inventory to inject into the prompt context invisibly.
