# Functional Requirements Document (FRD): StockPilot 
 
 ## 1. Introduction 
 This document outlines the detailed functional requirements for the StockPilot application. Each requirement describes a specific capability or behavior of the system. 
 
 ## 2. User Authentication (Module) 
 | ID      | Requirement                                                                                                                             | 
 |---------|-----------------------------------------------------------------------------------------------------------------------------------------| 
 | **FR-1.1**  | The system shall allow a new user to sign up for an account using an email address and a password.                                      | 
 | **FR-1.2**  | Upon first-time signup, the system shall automatically create a new business profile associated with the user's account.                  | 
 | **FR-1.3**  | The system shall allow registered users to log in using their email and password.                                                       | 
 | **FR-1.4**  | The system shall securely manage user sessions, redirecting logged-in users to their dashboard.                                         | 
 | **FR-1.5**  | The system shall provide a mechanism for users to log out.                                                                              | 
 
 ## 3. Dashboard (Module) 
 | ID      | Requirement                                                                                                                                                             | 
 |---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------| 
 | **FR-2.1**  | The dashboard shall display Key Performance Indicator (KPI) cards for: Today's Total Sales, This Month's Sales vs. Last Month's, Last Month's Sales Summary, and current Inventory Status (Total Units & Low Stock Items). | 
 | **FR-2.2**  | The dashboard shall feature a bar chart visualizing total sales revenue for each of the last 7 days.                                                                  | 
 | **FR-2.3**  | The dashboard shall display a "Needs Restock" list, showing all products whose `currentStock` is below their `minThreshold`.                                          | 
 | **FR-2.4**  | The dashboard shall contain a prominent "Ask AI Analyst" button that navigates the user to the AI Business Analyst page.                                              | 
 | **FR-2.5**  | A floating action button for "Process Sale" shall be visible on the dashboard and other main pages, providing quick access to the sales form.                         | 
 
 ## 4. Product Management (Module) 
 | ID      | Requirement                                                                                                                               | 
 |---------|-------------------------------------------------------------------------------------------------------------------------------------------| 
 | **FR-3.1**  | Users shall be able to view a complete list of their products in a "Product Master" table.                                                 | 
 | **FR-3.2**  | The product table shall display the product's Name, Size, Current Stock, Minimum Threshold, and Selling Price.                            | 
 | **FR-3.3**  | In the product list, the stock quantity shall be visually highlighted if it is below the minimum threshold.                               | 
 | **FR-3.4**  | Users shall be able to add a new product by providing a Name, Size, Selling Price (₹), Cost per Piece (₹), and a Minimum Stock Threshold.   | 
 | **FR-3.5**  | The system shall allow users to edit all details of an existing product through a dialog form.                                            | 
 | **FR-3.6**  | The system shall allow users to delete a product. A confirmation dialog must be displayed to prevent accidental deletion.               | 
 
 ## 5. Inventory Management (Module) 
 | ID      | Requirement                                                                                                                                                                     | 
 |---------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| 
 | **FR-4.1**  | On the "Inventory Ledger" page, users shall have a form to add newly purchased stock.                                                                                          | 
 | **FR-4.2**  | The "Add Stock" form shall require the user to select a Product and Size, and input the Quantity of new stock and the Cost per Piece for that purchase.                          | 
 | **FR-4.3**  | The "Add Stock" form shall display a real-time calculation of the Closing Stock and new Total Inventory Value as the user types.                                                 | 
 | **FR-4.4**  | Submitting the "Add Stock" form shall automatically create a corresponding "expense" transaction in the financial ledger.                                                    | 
 | **FR-4.5**  | The system shall maintain and display a chronological inventory ledger of all stock movements.                                                                                | 
 | **FR-4.6**  | Each entry in the ledger shall record the Date, Product Name & Size, Transaction Type (`addition`, `sale`), Quantity Change (+/-), and the resulting stock level (`Stock After`). | 
 
 ## 6. Sales Processing (Module) 
 | ID      | Requirement                                                                                                                                  | 
 |---------|----------------------------------------------------------------------------------------------------------------------------------------------| 
 | **FR-5.1**  | The "Process Sale" page shall allow users to record a new sale by providing a Customer Name.                                                 | 
 | **FR-5.2**  | Users shall be able to add one or more products from their master list to the sales order.                                                   | 
 | **FR-5.3**  | For each item, the user shall specify the quantity being sold. The system shall prevent a quantity greater than the available stock from being entered/sold. | 
 | **FR-5.4**  | The user shall be able to apply a numerical discount (in ₹) to the entire order.                                                             | 
 | **FR-5.5**  | The system shall display a running summary of the order, including Subtotal, Discount, and final Total Sale Value.                           | 
 | **FR-5.6**  | When a sale is confirmed, the system shall automatically create an "income" transaction in the financial ledger for the total sale amount.    | 
 | **FR-5.7**  | When a sale is confirmed, the system shall create a `sale` entry in the inventory ledger and deduct the sold quantity from the product's `currentStock` for each item. | 
 
 ## 7. Financial Transactions (Module) 
 | ID      | Requirement                                                                                                                             | 
 |---------|-----------------------------------------------------------------------------------------------------------------------------------------| 
 | **FR-6.1**  | The "Transactions" page shall display a table of all financial transactions, sorted with the most recent first.                       | 
 | **FR-6.2**  | The table shall list the transaction's Date, Description, and Amount.                                                                   | 
 | **FR-6.3**  | Income amounts shall be visually distinct from expense amounts (e.g., green vs. red text).                                              | 
 | **FR-6.4**  | Users shall be able to filter the transaction list to show "All", "Income" only, or "Expenses" only.                                   | 
 
 ## 8. AI Business Analyst (Module) 
 | ID      | Requirement                                                                                                                                             | 
 |---------|---------------------------------------------------------------------------------------------------------------------------------------------------------| 
 | **FR-7.1**  | The "AI Analyst" page shall provide a chat-based interface for the user to ask questions.                                                             | 
 | **FR-7.2**  | The user shall be able to type a question into an input field and submit it to the AI.                                                                | 
 | **FR-7.3**  | The system shall send the user's question along with a current snapshot of all business data (Products, Sales, Inventory, Transactions) to the AI model. | 
 | **FR-7.4**  | The AI's response shall be displayed in the chat interface, formatted in readable markdown.                                                             | 
 | **FR-7.5**  | The chat interface shall maintain a history of the current conversation session.                                                                        | 
  # Business Requirements Document (BRD): StockPilot 
 
 
 ## 1. Introduction 
 
 
 ### 1.1 Project Overview 
 **Project Name:**  StockPilot 
 **Purpose:**  To provide small-scale vendors, such as those in street markets, with a simple, accessible, and powerful mobile-first application to manage inventory, track sales, and gain actionable insights into their business performance. 
 **Scope:**  The system encompasses core business operations including product management, real-time inventory tracking, point-of-sale processing, financial transaction logging, and an AI-powered engine for business analysis. 
 
 
 ### 1.2 Business Objectives 
 - **Improve Operational Efficiency:**  Reduce the time and effort spent on manual stock counting and sales reconciliation. 
 - **Enhance Profitability:**  Minimize losses from stockouts of popular items and overstocking of slow-moving products by providing clear inventory visibility. 
 - **Enable Data-Driven Decisions:**  Empower vendors with easy-to-understand data visualizations and AI-driven analysis to identify sales trends, top-performing products, and financial health. 
 - **Simplify Financial Management:**  Automate the recording of income from sales and provide a simple interface for logging business expenses, creating a clear financial ledger. 
 - **Provide a Centralized System:**  Serve as a single source of truth for all product, inventory, and sales data. 
 
 
 ## 2. Stakeholders 
 - **Primary Users:**  Street Vendors, Small Kiosk Owners, Market Stall Holders. 
 - **Secondary Users (Future Scope):**  Business Partners, Employees, Accountants. 
 
 
 ## 3. Key Business Requirements 
 
 
 | ID  | Requirement                                                                                                  | Rationale                                                                                                                   | 
 |-----|--------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------| 
 | B-1 | The system must allow users to maintain a digital master list of their products, including cost and selling price. | To create a centralized catalog, which is the foundation for all inventory and sales activities.                            | 
 | B-2 | The system must track the real-time stock quantity for every product.                                          | To prevent stockouts, reduce carrying costs of excess inventory, and provide accurate data for sales and analysis.          | 
 | B-3 | The system must provide a fast and simple interface to record customer sales.                                  | To ensure sales are captured accurately and quickly in a busy environment, directly impacting inventory and financial data. | 
 | B-4 | The system must automatically update inventory levels when a sale is processed.                                | To maintain data integrity and ensure stock levels are always accurate without manual intervention.                         | 
 | B-5 | The system must automatically log financial transactions for both sales (income) and stock purchases (expenses). | To provide a clear, real-time view of cash flow and profitability.                                                          | 
 | B-6 | The system must present a high-level business overview through a dashboard.                                    | To give vendors a quick, at-a-glance understanding of their business's daily and long-term performance.                  | 
 | B-7 | The system must provide an AI-powered conversational analyst to answer business-related questions.             | To make complex data analysis accessible to non-technical users, allowing them to ask natural language questions.           | 
 | B-8 | The system must be fully functional and user-friendly on both mobile and desktop devices.                      | To cater to the on-the-go nature of street vendors who primarily use mobile phones for their operations.                    | 
 | B-9 | The system must support a secure user authentication system.                                                   | To protect sensitive business data and ensure that only authorized users can access the application.                      | 
 
 
 ## 4. Assumptions and Constraints 
 
 
 ### 4.1 Assumptions 
 - Users have access to a smartphone or computer with a modern web browser and an active internet connection. 
 - Users are comfortable with basic digital interfaces as seen in typical mobile applications. 
 - The initial launch will target individual business owners (single-user-per-business model). 
 
 
 ### 4.2 Constraints 
 - The application is a web-based application and not a native mobile app. 
 - All data is stored in the cloud (Firebase Firestore) and requires an internet connection for real-time synchronization. 
 - The AI features rely on external generative AI services and are subject to their availability and potential costs.