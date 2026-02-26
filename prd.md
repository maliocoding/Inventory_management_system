Here is the updated PRD. I have added a new "Design & Theming" section to specifically outline your typography choices.

*A quick technical note:* You've assigned `Geist Mono` to your `--font-sans` variable. While this is totally fine if you are going for a highly technical, terminal-style aesthetic where everything is monospaced, standard practice usually assigns a non-monospaced font (like standard `Geist`, `Inter`, or `Roboto`) to the sans-serif variable. I have included your exact variables below, but just wanted to point that out in case it was a typo!

---

## Product Requirements Document (PRD)

**Product Name:** Warehouse Inventory Manager (MVP)
**Document Status:** Draft v1.2 (Updated with Stock Traceability & Theming)
**Target Platform:** Web Application

---

### 1. Objective

To build a streamlined, secure web application that allows warehouse staff to digitally track and manage physical inventory. The system will provide real-time visibility into stock levels, track individual products via SKU, and provide **complete traceability of stock movements** (additions, sales, transfers, and losses).

### 2. User Personas

* **Warehouse Manager / Admin:** Needs to oversee total stock, create new product profiles, track where inventory is going, and ensure the warehouse operates smoothly.
* **Warehouse Staff:** Needs quick access to record incoming shipments and log outgoing stock with specific reasons/destinations.

### 3. User Stories

* **As a user**, I want to create an account and log in securely so that unauthorized individuals cannot access warehouse data.
* **As a user**, I want to see a dashboard upon logging in so that I can quickly understand the current state of my inventory and recent movements.
* **As a user**, I want to create a new product and assign it a unique SKU so that I can track specific items.
* **As a user**, I want to add or remove stock and record the reason and destination (e.g., "Sold to Customer X," "Moved to Store A," "Damaged") so that I have a clear history of where my inventory went.
* **As a user**, I want to view a history log for a specific product so that I can audit its past movements.

---

### 4. Feature Requirements

#### 4.1. Authentication Module (Login/Signup)

* **Registration:** Users can sign up using an email address and password.
* **Login:** Secure login with email and password.
* **Access Control:** Unauthenticated users attempting to access the app must be redirected to the login page.

#### 4.2. Dashboard Overview (Home Page)

* **High-Level Metrics:** * Total unique products.
* Total items currently in stock.


* **Low Stock Alerts:** A quick view of products that are running low on stock.
* **Recent Activity Log:** A feed displaying the most recent stock transactions (e.g., "User A removed 5 units of SKU-123 for Order #999").

#### 4.3. Product Management

* **Create Product:** A form to add a new item. Required fields: Product Name, SKU (unique), Description (optional). *Note: Initial stock is no longer set here; it is logged via the first "Add Stock" transaction to maintain the ledger.*
* **Product Directory:** A searchable and sortable table displaying all products and their current available stock.

#### 4.4. Stock Tracking & Transactions (The Ledger)

* **Log Movement (Add/Remove):** Users click "Update Stock" which opens a form requiring:
* **Action:** In (Add) or Out (Remove).
* **Quantity:** Number of units moving.
* **Reason/Category:** Dropdown menu (e.g., New Shipment, Return, Sale, Internal Transfer, Damaged/Lost).
* **Destination/Reference:** A text field to specify *where* it went or *why* (e.g., "Order #456", "Moved to Retail Location B").


* **Validation:** The system must prevent "Out" transactions that exceed the currently available stock.

#### 4.5. Stock History (Audit Trail)

* **Item Ledger:** Clicking on a specific product opens a detailed view showing its current stock and a chronological table of all transactions (Date, Action, Quantity, Reason, Reference, User who logged it).

---

### 5. Design & UI Requirements

#### 5.1. Typography Variables

The application will utilize a highly technical, code-friendly aesthetic utilizing the following core CSS font variables:

* **Sans-Serif (Primary UI):** `--font-sans: Geist Mono, ui-monospace, monospace;`
* **Serif:** `--font-serif: serif;`
* **Monospace (Code/Data):** `--font-mono: JetBrains Mono, monospace;`

*Note: The heavy use of monospaced fonts (Geist Mono and JetBrains Mono) aligns well with reading structured data, SKUs, and transaction logs.*

---

### 6. Non-Functional Requirements

* **Data Integrity:** Stock counts must be calculated dynamically based on the sum of all transactions, ensuring the current count always matches the movement history.
* **Responsiveness:** Usable on desktop and mobile devices on the warehouse floor.
* **Security & Performance:** Passwords hashed, fast load times (under 2 seconds).

### 7. Out of Scope for MVP (Future Enhancements)

* Multi-warehouse location tracking.
* Barcode or QR code scanning integrations.
* Direct integration with e-commerce platforms.

---

