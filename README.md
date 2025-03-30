# GobbleGo Frontend

## Overview
GobbleGo enhances the restaurant dining experience with a **collaborative ordering system**. Using a unique **QR code** for each table, guests can join a shared digital platform to view the menu, place orders, and manage checkout seamlessly.

## Product Flow

### 1. QR Code Scanning
- Each table has a unique QR code.
- Guests scan the QR code to join a virtual room linked to their table.

### 2. Assigning Leadership
- The first person to scan the QR code is designated as the Table Leader.
- The Table Leader has exclusive authority to finalize the order and proceed to checkout.

### 3. Collaborative Menu Access
- Guests can:
  - View the complete menu, including tags (e.g., Appetizers, Drinks, Main Course, Desserts).
  - Place individual items in their personal cart.

### 4. Checkout Management
- When all members are ready, the Table Leader reviews the combined cart and clicks Checkout.
- Priority of serving is determined based on item tags.
- Multiple checkouts are allowed during a session.

### 5. Billing and Payment
- Once dining concludes, all checkout orders are summed up for a final bill.

## Tech Stack
- **Next.js** 
- **TypeScript** 
- **Tailwind CSS** 

## Installation and Setup

### Prerequisites
- Node.js 
- pnpm installed globally (`npm install -g pnpm`)

### Steps to Run Locally
1. Fork the repository from GitHub.
2. Clone your forked repository:
   ```sh
   git clone https://github.com/yourusername/gobblego-frontend.git
   cd gobblego-frontend
   ```
3. Install dependencies using pnpm:
   ```sh
   pnpm install
   ```
4. Set up environment variables:
   - Copy `.env.example` to `.env`:
     ```sh
     cp .env.example .env
     ```
   - Update `.env` with backend API URL:
     ```sh
     NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/v1
     ```
5. Run the development server:
   ```sh
   pnpm dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

## Connecting to Backend
Ensure your backend is running by following the setup steps in the **[GobbleGo Backend Repository](https://github.com/saanvi-iyer/gobblego/backend)**.

---
<p align="center">Made with ❤️ by Saanvi Iyer</p>

