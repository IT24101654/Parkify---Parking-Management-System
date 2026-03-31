# Inventory Management Integration Guide

## Overview
This guide explains how the Inventory Management module is integrated into the Parking Owner Dashboard.

---

## 📁 Project Structure

```
parkify-frontend/src/
├── Components/
│   └── Inventory/
│       ├── InventoryDashboard.js      (Main inventory categories)
│       ├── ManageInventory.js         (CRUD operations for each type)
│       └── Inventory.css              (Complete styling)
│
└── Pages/
    └── Parking-Owner/
        └── PODashboard.js             (Updated with InventoryDashboard)
```

---

## 🎯 How It Works

### 1. **Dashboard Integration Flow**

```
User clicks "Inventory" tab in PODashboard
    ↓
PODashboard renders <InventoryDashboard />
    ↓
User sees 3 options (Food, Spare Parts, Fuel)
    ↓
Clicking a category loads <ManageInventory /> with that type
    ↓
User can perform CRUD operations on items
```

### 2. **File Changes Summary**

#### **PODashboard.js**
- **Import:** Added `import InventoryDashboard from '../../Components/Inventory/InventoryDashboard';`
- **Change:** When `activeTab === 'inventory'`, now renders `<InventoryDashboard />` instead of static text

#### **InventoryDashboard.js**
- **Complete Rewrite:** Now manages internal state for category selection
- **Functionality:**
  - Shows 3 category cards initially
  - When a category is clicked, sets `selectedType` state
  - Renders `<ManageInventory />` with the selected type
  - Provides "Back to Categories" button to return

#### **ManageInventory.js**
- **Added Features:**
  - Full CRUD operations (Create, Read, Update, Delete)
  - Form validation for all fields
  - JWT authentication with Bearer tokens
  - Error and success messages
  - Low stock alerts with visual indicators
  - Modal form for adding/editing items
  - Loading states and empty states
  - Responsive table design

#### **Inventory.css**
- **Complete Rewrite:** Enhanced with:
  - Modern card designs
  - Smooth animations
  - Modal styling
  - Form validation styles
  - Table responsive design
  - Alert message styling
  - Responsive breakpoints

---

## 🔄 CRUD Operations

### **Create (Add Item)**
```javascript
POST /api/inventory/add
Headers: Authorization: Bearer {token}
Body: {
  itemName: "string",
  quantity: number,
  thresholdValue: number,
  unitPrice: number,
  inventoryType: "FOOD|SPARE_PART|FUEL"
}
```

### **Read (Get Items)**
```javascript
GET /api/inventory/type/{type}
Headers: Authorization: Bearer {token}
```

### **Update (Edit Item)**
```javascript
PUT /api/inventory/{id}
Headers: Authorization: Bearer {token}
Body: {
  itemName: "string",
  quantity: number,
  thresholdValue: number,
  unitPrice: number,
  inventoryType: "FOOD|SPARE_PART|FUEL"
}
```

### **Delete (Remove Item)**
```javascript
DELETE /api/inventory/{id}
Headers: Authorization: Bearer {token}
```

---

## 🔐 Authentication

All API calls automatically include JWT token from localStorage:

```javascript
const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};
```

---

## ✅ Form Validations

The ManageInventory component validates:
- ✓ Item name is not empty
- ✓ Quantity is a positive number
- ✓ Unit price is a positive number
- ✓ Threshold is a positive number

Validation errors are displayed inline under each field.

---

## 🎨 Features Implemented

### **Low Stock Alerts**
```javascript
const isLowStock = item.quantity <= item.thresholdValue;
// Shows red badge: "🔴 Low Stock"
// Highlights entire row in light red
```

### **Success/Error Messages**
- Auto-dismiss after 3 seconds
- Manual dismiss button (×)
- Color-coded for status (green, red, yellow)

### **Modal Form**
- Overlay with semi-transparent background
- Click outside to close or use close button
- Form fields clear on successful submission
- Error messages appear inline

### **Loading States**
- Spinner animation while fetching data
- "Loading items..." text
- Prevents user interaction during loading

### **Empty State**
- Shows when no items exist
- Encourages adding first item
- "Add First Item" button

---

## 🌐 Navigation Flow

```
Dashboard (Overall)
  └─ Inventory Tab (PODashboard)
      └─ InventoryDashboard (Shows 3 categories)
          ├─ Food & Beverage
          │   └─ ManageInventory (FOOD)
          ├─ Spare Parts
          │   └─ ManageInventory (SPARE_PART)
          └─ Fuel Management
              └─ ManageInventory (FUEL)
```

### **Navigation Methods**
1. Click category card → Load ManageInventory
2. Click "Back to Categories" → Show InventoryDashboard
3. "Inventory" tab in sidebar → Show InventoryDashboard

---

## 🐛 Error Handling

### **API Errors**
```javascript
catch (err) {
    console.error('Error:', err);
    setError('Failed to load items. Please check your connection.');
}
```

### **Form Errors**
```javascript
if (!validateForm()) return;
// Shows specific error under each invalid field
```

### **Backend Connection Errors**
- Shows user-friendly message
- Suggests checking connection
- Provides fallback UI

---

## 📱 Responsive Design

- **Desktop:** Full-width tables, side-by-side cards
- **Tablet:** Adjusted spacing, single-column cards
- **Mobile:** Stacked layout, optimized touch targets

Breakpoints:
- `768px`: Tablet adjustments
- `480px`: Mobile adjustments

---

## 🚀 How to Use

### **For Users**
1. Login to Parking Owner Dashboard
2. Click "Inventory" in sidebar
3. Select a category (Food, Spare Parts, or Fuel)
4. Click "+ Add New Item" to add inventory
5. Fill form and click "Add Item"
6. View items in table
7. Click ✎ to edit or 🗑️ to delete

### **For Developers**
1. Ensure JWT token is in localStorage as 'token'
2. Backend must accept POST/PUT/GET/DELETE at `/api/inventory/*`
3. Items with low stock are highlighted automatically
4. All validations run client-side before sending to backend

---

## 🔧 Backend Requirements

Your Spring Boot backend should have these endpoints:

```
GET    /api/inventory/type/{type}              // Get all items by type
POST   /api/inventory/add                      // Create new item
PUT    /api/inventory/{id}                     // Update item
DELETE /api/inventory/{id}                     // Delete item
```

**Required Fields in Response:**
```json
{
  "id": 1,
  "itemName": "string",
  "quantity": number,
  "thresholdValue": number,
  "unitPrice": number,
  "inventoryType": "FOOD|SPARE_PART|FUEL"
}
```

---

## 🎓 Key Technologies Used

- **React Hooks:** useState, useEffect
- **React Router:** useParams, useNavigate
- **Axios:** HTTP requests with authentication
- **CSS:** Flexbox, Grid, Animations
- **Form Handling:** Controlled components, validation

---

## 📝 Summary of Changes

| File | Changes |
|------|---------|
| PODashboard.js | Import InventoryDashboard, render in inventory tab |
| InventoryDashboard.js | Complete rewrite for state-based navigation |
| ManageInventory.js | Full CRUD, validation, JWT auth, error handling |
| Inventory.css | Complete redesign with modern styling |

---

## ✨ Features at a Glance

- ✅ Full CRUD operations
- ✅ JWT authentication
- ✅ Form validation
- ✅ Low stock alerts
- ✅ Loading states
- ✅ Error handling
- ✅ Responsive design
- ✅ Modal forms
- ✅ Success messages
- ✅ Empty states

---

## 🆘 Troubleshooting

### **Backend connection fails**
- Check if `http://localhost:8080` is running
- Verify JWT token is in localStorage
- Check CORS configuration on backend

### **Items not loading**
- Check browser console for errors
- Verify backend endpoints exist
- Ensure token is valid (not expired)

### **Form won't submit**
- Check validation errors (red text under fields)
- Ensure all required fields are filled
- Try refreshing page and retrying

---

## 📚 Additional Notes

- All dates/times are handled on the backend
- Currency is displayed as "Rs." format
- Component supports both dashboard and standalone routing
- CSS uses CSS Grid and Flexbox (no dependencies)

---

**Last Updated:** 25 March 2026
