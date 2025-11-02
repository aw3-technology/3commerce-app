# Income Pages Backend Integration

All income-related pages have been successfully connected to the Supabase backend!

## Overview

The income section consists of three main areas:
1. **Earning** - Daily earnings tracking, product sales charts, and top countries
2. **Statements** - Financial statements with funds, earnings, fees, and transaction history
3. **Payouts** - Account balance and payout history

## Pages Updated

### 1. Earning Section (`/earning`)

#### Earning Overview (`src/screens/Earning/Overview/index.js`)
- **Data Source**: `getOrderStats()` from orderService
- **Metrics Displayed**:
  - Total Earnings (revenue from completed orders)
  - Current Balance (40% of total revenue)
  - Total Value of Sales
  - Week-over-week growth percentages (placeholders)
- **Features**:
  - Real-time data from backend
  - Loading states
  - Formatted currency display

#### Earning Table (`src/screens/Earning/Table/index.js`)
- **Data Source**: `getAllOrders()` from orderService
- **Displays**: Daily earnings breakdown (last 7 days)
- **Features**:
  - Groups orders by date
  - Shows sales count per day
  - Displays earnings with Paid/Pending status
  - Formatted dates and currency

#### Product Sales Chart (`src/screens/Earning/ProductSales/index.js`)
- **Data Source**: `getSalesData()` from analyticsService
- **Chart Type**: Bar chart showing daily sales
- **Filters**:
  - Last 7 days
  - This month
  - All time
- **Features**:
  - Interactive bar chart using Recharts
  - Dark mode support
  - Responsive design
  - Dynamic data filtering by date range

#### Top Countries (`src/screens/Earning/TopCountries/index.js`)
- **Data Source**: `getAllOrders()` from orderService
- **Displays**: Top 6 countries by earnings
- **Features**:
  - Country flag emojis
  - Sorted by revenue (highest first)
  - Only includes completed orders
  - Loading states

### 2. Statements Section (`/statements`)

#### Statements Overview (`src/screens/Statements/Overview/index.js`)
- **Data Sources**:
  - `getOrderStats()` for revenue
  - `getTransactions()` for fee calculation
- **Metrics Displayed**:
  - Funds (total revenue)
  - Earnings (revenue minus 10% platform fee)
  - Fees (10% of total revenue)
- **Features**:
  - Real-time calculation of platform fees
  - Tooltips explaining each metric
  - Loading states

#### Statements Transactions (`src/screens/Statements/Transactions/index.js`)
- **Data Source**: `getTransactions()` from orderService
- **Filters**:
  - Last 30 days
  - Last 20 days
  - Last 10 days
- **Features**:
  - Transaction history with product details
  - Sale vs Author fee classification
  - Pagination with "Load more"
  - CSV export functionality
  - Date range filtering
  - Shows invoice numbers
  - Net earnings calculation (after 10% fee)

**CSV Export**: Downloads transaction data as CSV file with selected date range.

### 3. Payouts Section (`/payouts`)

#### Payouts Overview (`src/screens/Payouts/Overview/index.js`)
- **Data Source**: `getOrderStats()` from orderService
- **Metrics Displayed**:
  - Current Account Balance (net earnings after 10% platform fee)
  - Available for Withdrawal (70% of balance, 30% held for pending)
- **Features**:
  - Real-time balance calculation
  - Withdraw button (disabled if balance is $0)
  - Withdrawal modal
  - Platform fee calculation

**Balance Calculation Logic**:
```javascript
Total Revenue = Sum of all completed orders
Platform Fee = Total Revenue × 10%
Net Earnings = Total Revenue - Platform Fee
Available for Withdrawal = Net Earnings × 70% (30% held for pending orders)
```

#### Payout History (`src/screens/Payouts/PayoutHistory/index.js`)
- **Data Source**: `getTransactions()` from orderService
- **Displays**: Monthly payout history (last 12 months)
- **Features**:
  - Groups earnings by month
  - Shows payout method (Paypal/SWIFT)
  - Displays Paid/Pending status
  - Earnings and withdrawn amounts
  - Fallback to simulated data if no payout transactions exist

**Data Logic**:
- If payout type transactions exist, displays actual payout data
- Otherwise, generates monthly summaries from payment transactions
- Groups by month and year
- Calculates net earnings after 10% platform fee

## Financial Calculations

All income pages use consistent financial calculations:

### Platform Fee
- **Rate**: 10% of gross revenue
- **Applied to**: All completed orders/transactions

### Net Earnings Formula
```
Net Earnings = Gross Revenue - (Gross Revenue × 0.10)
```

### Available for Withdrawal Formula
```
Total Balance = Sum of completed orders - Platform fees
Available = Total Balance × 0.70 (30% held for pending orders)
```

## Data Flow

```
Database (Supabase)
    ↓
orderService / analyticsService
    ↓
Component State (React useState)
    ↓
UI Display (with loading/error states)
```

## Backend Services Used

### orderService.js
- `getOrderStats()` - Get order statistics and revenue
- `getAllOrders(options)` - Get all orders with filtering
- `getTransactions(options)` - Get transaction history

### analyticsService.js
- `getSalesData()` - Get sales data for charts

## Features Implemented

✅ Real-time data from Supabase backend
✅ Loading states for all data fetching
✅ Error handling
✅ Date range filtering
✅ Pagination with "Load more"
✅ CSV export for transactions
✅ Interactive charts with dark mode
✅ Currency formatting
✅ Country grouping with flags
✅ Daily/weekly/monthly aggregation
✅ Platform fee calculations
✅ Withdrawal balance calculations
✅ Empty states for no data
✅ Responsive design

## Testing

### Test the Earning Section

1. Navigate to `/earning`
2. Verify Overview shows earnings metrics
3. Check Product Sales chart displays data
4. Confirm Top Countries shows country rankings
5. Verify Table shows daily earnings

### Test the Statements Section

1. Navigate to `/statements`
2. Verify Overview shows Funds, Earnings, and Fees
3. Check Transactions table loads
4. Test date range filters (30/20/10 days)
5. Click "Download CSV" to export data
6. Test "Load more" pagination

### Test the Payouts Section

1. Navigate to `/payouts`
2. Verify Current Balance and Available amounts
3. Check Payout History table
4. Verify monthly grouping is correct
5. Test "Withdraw balance" button

## Sample SQL Queries for Testing

### Create Test Orders
```sql
-- Insert test orders (run in Supabase SQL Editor)
INSERT INTO orders (customer_id, product_id, total_amount, status, payment_status, created_at)
SELECT
  (SELECT id FROM customers LIMIT 1),
  (SELECT id FROM products LIMIT 1),
  (RANDOM() * 500 + 50)::DECIMAL(10,2),
  'completed',
  'completed',
  NOW() - (INTERVAL '1 day' * floor(random() * 30))
FROM generate_series(1, 20);
```

### Create Test Transactions
```sql
-- Insert test transactions
INSERT INTO transactions (order_id, customer_id, amount, type, status, payment_method, created_at)
SELECT
  o.id,
  o.customer_id,
  o.total_amount,
  'payment',
  'completed',
  CASE WHEN RANDOM() > 0.5 THEN 'Paypal' ELSE 'SWIFT' END,
  o.created_at
FROM orders o
WHERE o.status = 'completed'
LIMIT 20;
```

## Customization

### Adjust Platform Fee
To change the platform fee percentage, update these files:
- `src/screens/Statements/Overview/index.js` (line 35)
- `src/screens/Statements/Transactions/index.js` (line 51)
- `src/screens/Payouts/Overview/index.js` (line 33)
- `src/screens/Payouts/PayoutHistory/index.js` (line 67)

Current value: `0.10` (10%)

### Adjust Pending Hold Percentage
To change how much is held for pending orders:
- `src/screens/Payouts/Overview/index.js` (line 37)

Current value: `0.30` (30% held, 70% available)

### Modify Chart Appearance
Edit chart settings in:
- `src/screens/Earning/ProductSales/index.js`

Properties to customize:
- Bar colors
- Chart margins
- Tooltip styling
- Grid appearance

## Integration with Other Features

### Creating Orders Automatically Updates Income
When new orders are created via `orderService.createOrder()`:
- Earning Overview updates with new revenue
- Product Sales chart includes new data
- Top Countries reflects new customer locations
- Statements show new transactions
- Payout balances increase

### Transaction Tracking
All financial operations are tracked:
- Orders create payment transactions
- Refunds create refund transactions
- Payouts create payout transactions

## Troubleshooting

### Earnings not showing
- Verify orders exist with status='completed'
- Check that orders have `total_amount` values
- Ensure `getOrderStats()` service is working

### Charts not displaying
- Check that orders have valid `created_at` timestamps
- Verify Recharts library is installed
- Check browser console for errors

### Transactions page empty
- Verify transactions table has data
- Check that transactions link to orders correctly
- Ensure date filters aren't too restrictive

### Payout history empty
- Create some transactions with type='payment'
- Verify transactions have valid dates
- Check that monthly grouping logic is working

## Next Steps

Consider these enhancements:

1. **Add Payout Requests** - Create a payout request system
2. **Email Receipts** - Send transaction receipts via email
3. **Tax Reporting** - Generate tax documents
4. **Multi-currency Support** - Support different currencies
5. **Export Options** - Add PDF export in addition to CSV
6. **Advanced Filtering** - Add product, customer, and status filters
7. **Real-time Updates** - Add Supabase subscriptions for live data
8. **Analytics Dashboard** - Create detailed analytics with more charts
9. **Forecasting** - Predict future earnings based on trends
10. **Commission Tiers** - Implement variable platform fee rates

## Database Schema Recommendations

For better payout tracking, consider adding a `payouts` table:

```sql
CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    amount DECIMAL(10, 2) NOT NULL,
    method VARCHAR(50), -- paypal, swift, bank_transfer
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    transaction_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

This would enable:
- Proper payout request tracking
- Payout status management
- Better reporting and history
