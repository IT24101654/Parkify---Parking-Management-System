# Inventory System - Visual Architecture & Code Examples

## 🏗️ Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      PODashboard.js                              │
│              (Parking Owner Main Dashboard)                      │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Sidebar                                                     │ │
│  │ ├─ Overview                                               │ │
│  │ ├─ My Slots                                               │ │
│  │ ├─ Inventory ◄── CLICK HERE                               │ │
│  │ ├─ Earnings                                               │ │
│  │ └─ Profile                                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Main Content Area                                           │ │
│  │ {activeTab === 'inventory' && (                            │ │
│  │    <InventoryDashboard />                                 │ │
│  │ )}                                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Renders
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              InventoryDashboard.js                               │
│          (Shows 3 Inventory Categories)                          │
│                                                                   │
│  {selectedType === null ? (                                      │
│     <div className="inventory-main">                            │
│       <h1>Inventory Management</h1>                             │
│       <div className="card-grid">                              │
│         ┌──────────────┬──────────────┬──────────────┐         │
│         │   Food &     │  Spare       │    Fuel      │         │
│         │ Beverage     │  Parts       │ Management   │         │
│         │              │              │              │         │
│         │   onClick    │   onClick    │   onClick    │         │
│         │ setSelected  │ setSelected  │ setSelected  │         │
│         │ Type(FOOD)   │ Type(SPARE)  │ Type(FUEL)   │         │
│         └──────────────┴──────────────┴──────────────┘         │
│       </div>                                                     │
│     </div>                                                       │
│  ) : (                                                           │
│     <ManageInventory />                                         │
│  )}                                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ When category selected
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              ManageInventory.js                                  │
│    (Full CRUD operations for selected inventory type)            │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Header with "+ Add New Item" button                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Alert Messages (Success/Error/Warning)                      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Items Table                                                  ││
│  │                                                              ││
│  │ Name    | Qty | Price | Threshold | Status | Actions      ││
│  │ ─────────────────────────────────────────────────────────── ││
│  │ Item 1  | 50  | 250   | 10        | OK     | ✎️ 🗑️       ││
│  │ Item 2  | 5   | 150   | 10        | ⚠️LOW  | ✎️ 🗑️       ││
│  │ (Low stock row highlighted in red)                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Modal Form (Add/Edit)                                       ││
│  │                                                              ││
│  │ ┌─────────────────────────────────────────────────────────┐││
│  │ │ Add New Item                               Close [×]    │││
│  │ ├─────────────────────────────────────────────────────────┤││
│  │ │ Item Name: [____________]                              │││
│  │ │ Quantity:  [____________]                              │││
│  │ │ Price:     [____________]                              │││
│  │ │ Threshold: [____________]                              │││
│  │ │                                                         │││
│  │ │               [Cancel]  [Submit]                       │││
│  │ └─────────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 💾 State Management Flow

### **InventoryDashboard.js State**
```javascript
const [selectedType, setSelectedType] = useState(null);

// Flow:
// null → Show categories
// 'FOOD' → Show ManageInventory for FOOD
// 'SPARE_PART' → Show ManageInventory for SPARE_PART
// 'FUEL' → Show ManageInventory for FUEL

onClick={() => setSelectedType('FOOD')} // Click category
onClick={() => setSelectedType(null)}   // Back button
```

### **ManageInventory.js State**
```javascript
// Data State
const [items, setItems] = useState([]);        // All items from DB
const [loading, setLoading] = useState(true);  // Loading flag
const [error, setError] = useState('');        // Error message

// UI State
const [showForm, setShowForm] = useState(false);      // Modal visible?
const [editingId, setEditingId] = useState(null);    // Editing which item?
const [successMessage, setSuccessMessage] = useState(''); // Success msg

// Form State
const [form, setForm] = useState({
    itemName: '',
    quantity: '',
    unitPrice: '',
    thresholdValue: ''
});
const [formErrors, setFormErrors] = useState({});  // Validation errors
```

---

## 🔄 Data Flow - Add Item Example

```
User clicks "+ Add New Item"
    │
    ├─ setShowForm(true)           // Show modal
    ├─ resetForm()                 // Clear form
    └─ setEditingId(null)          // Not editing
    │
    ▼
User fills form
    │
    ├─ itemName: "Coffee"
    ├─ quantity: 100
    ├─ unitPrice: 200
    └─ thresholdValue: 20
    │
    ▼
User clicks "Add Item"
    │
    ├─ validateForm()              // Check all fields valid
    │   ├─ itemName required?
    │   ├─ quantity > 0?
    │   ├─ unitPrice > 0?
    │   └─ thresholdValue >= 0?
    │
    ▼ (Validation passes)
    │
    ├─ axios.post('/api/inventory/add', payload, {
    │   headers: {
    │     'Authorization': 'Bearer ' + token,
    │     'Content-Type': 'application/json'
    │   }
    │ })
    │
    ▼ (Backend receives POST)
    │
    ├─ Backend validates
    ├─ Backend saves to DB
    ├─ Backend returns item with ID
    │
    ▼ (Frontend receives response)
    │
    ├─ setSuccessMessage('Item added successfully!')
    ├─ loadItems()                 // Refresh items list
    ├─ setShowForm(false)          // Close modal
    ├─ setForm({...})              // Clear form
    │
    ▼
New item appears in table
    │
    └─ After 3 seconds → success message disappears
```

---

## 🔄 Data Flow - Edit Item Example

```
User clicks ✎️ (Edit button)
    │
    ├─ handleEdit(item)
    ├─ setForm({
    │   itemName: item.itemName,
    │   quantity: item.quantity,
    │   unitPrice: item.unitPrice,
    │   thresholdValue: item.thresholdValue
    │ })
    ├─ setEditingId(item.id)       // Mark as editing
    └─ setShowForm(true)           // Show modal
    │
    ▼
User modifies form
    │
    ▼
User clicks "Update Item"
    │
    ├─ validateForm()
    │
    ▼ (Validation passes)
    │
    ├─ axios.put('/api/inventory/' + editingId, payload, {
    │   headers: { Authorization, Content-Type }
    │ })
    │
    ▼ (Backend receives PUT)
    │
    ├─ Backend validates ownership
    ├─ Backend updates in DB
    ├─ Backend returns updated item
    │
    ▼ (Frontend receives response)
    │
    ├─ setSuccessMessage('Item updated successfully!')
    ├─ loadItems()                 // Refresh
    ├─ setShowForm(false)          // Close
    │
    ▼
Updated item appears in table with new values
```

---

## 🗑️ Data Flow - Delete Item Example

```
User clicks 🗑️ (Delete button)
    │
    ├─ window.confirm('Are you sure?')
    │
    ├─ Yes → handleDelete(id)
    │ └─ axios.delete('/api/inventory/' + id, {
    │     headers: { Authorization, Content-Type }
    │   })
    │
    ▼ (Backend receives DELETE)
    │
    ├─ Backend validates ownership
    ├─ Backend deletes from DB
    ├─ Backend returns success
    │
    ▼ (Frontend receives response)
    │
    ├─ setSuccessMessage('Item deleted successfully!')
    ├─ loadItems()                 // Refresh list
    │
    ▼
Item disappears from table
    │
    └─ After 3 seconds → success message disappears
```

---

## 🎨 Styling Layers

### **CSS Structure**
```css
/* Container Styles */
.manage-inventory-container { ... }
.manage-header { ... }

/* Alert Styles */
.alert-success { ... }
.alert-error { ... }
.alert-warning { ... }

/* Form Modal Styles */
.form-modal { ... }
.form-modal-content { ... }
.form-header { ... }
.form-group { ... }
.form-actions { ... }

/* Table Styles */
.table-container { ... }
.inventory-table { ... }
.low-stock-row { ... }

/* Button Styles */
.add-item-btn { ... }
.btn-cancel { ... }
.btn-submit { ... }
.btn-edit { ... }
.btn-delete { ... }

/* Status Badges */
.alert-badge { ... }
.normal-badge { ... }

/* Responsive */
@media (max-width: 768px) { ... }
@media (max-width: 480px) { ... }
```

---

## 🔐 Security Flow

```
User logs in
    │
    ├─ localStorage.setItem('token', jwtToken)
    │
    ▼
User navigates to Inventory
    │
    ├─ const token = localStorage.getItem('token')
    │
    ▼
Frontend makes API call
    │
    ├─ axios.get('/api/inventory/type/FOOD', {
    │   headers: {
    │     'Authorization': 'Bearer ' + token
    │   }
    │ })
    │
    ▼
Backend receives request
    │
    ├─ Extracts token from header
    ├─ Verifies token is valid
    ├─ Gets user ID from token
    ├─ Loads only items for that user
    ├─ Returns items
    │
    ▼
Frontend receives items
    │
    ├─ setItems(response.data)
    │
    ▼
Items display in table
```

---

## 📋 Form Validation Flow

```
Form Submission
    │
    ├─ validateForm() called
    │
    ├─ Check itemName
    │ └─ if (!form.itemName.trim()) {
    │     errors.itemName = 'Item name is required'
    │   }
    │
    ├─ Check quantity
    │ └─ if (quantity < 0) {
    │     errors.quantity = 'Quantity must be positive'
    │   }
    │
    ├─ Check unitPrice
    │ └─ if (unitPrice <= 0) {
    │     errors.unitPrice = 'Price must be positive'
    │   }
    │
    ├─ Check thresholdValue
    │ └─ if (thresholdValue < 0) {
    │     errors.thresholdValue = 'Threshold must be positive'
    │   }
    │
    ├─ setFormErrors(errors)
    │
    ▼
    │
    ├─ If errors exist:
    │ └─ return (don't submit)
    │    └─ Display error messages under fields
    │
    ├─ If no errors:
    │ └─ Submit form to backend
    │
    ▼
```

---

## 🌐 Network Request Examples

### **GET - Fetch Items**
```javascript
// Frontend
const response = await axios.get(
  'http://localhost:8080/api/inventory/type/FOOD',
  {
    headers: {
      'Authorization': 'Bearer eyJhbGc...',
      'Content-Type': 'application/json'
    }
  }
);
setItems(response.data);

// Expected Response (200 OK)
[
  {
    "id": 1,
    "itemName": "Coffee",
    "quantity": 50,
    "thresholdValue": 10,
    "unitPrice": 200,
    "inventoryType": "FOOD"
  }
]
```

### **POST - Create Item**
```javascript
// Frontend
const payload = {
  itemName: 'Tea',
  quantity: 30,
  thresholdValue: 5,
  unitPrice: 150,
  inventoryType: 'FOOD'
};

await axios.post(
  'http://localhost:8080/api/inventory/add',
  payload,
  {
    headers: {
      'Authorization': 'Bearer eyJhbGc...',
      'Content-Type': 'application/json'
    }
  }
);

// Expected Response (201 Created)
{
  "id": 2,
  "itemName": "Tea",
  "quantity": 30,
  "thresholdValue": 5,
  "unitPrice": 150,
  "inventoryType": "FOOD"
}
```

### **PUT - Update Item**
```javascript
// Frontend
await axios.put(
  'http://localhost:8080/api/inventory/1',
  {
    itemName: 'Premium Coffee',
    quantity: 45,
    thresholdValue: 12,
    unitPrice: 220,
    inventoryType: 'FOOD'
  },
  {
    headers: {
      'Authorization': 'Bearer eyJhbGc...',
      'Content-Type': 'application/json'
    }
  }
);

// Expected Response (200 OK)
{
  "id": 1,
  "itemName": "Premium Coffee",
  "quantity": 45,
  "thresholdValue": 12,
  "unitPrice": 220,
  "inventoryType": "FOOD"
}
```

### **DELETE - Remove Item**
```javascript
// Frontend
await axios.delete(
  'http://localhost:8080/api/inventory/1',
  {
    headers: {
      'Authorization': 'Bearer eyJhbGc...',
      'Content-Type': 'application/json'
    }
  }
);

// Expected Response (200 OK)
{
  "message": "Item deleted successfully"
}
```

---

## 🎯 Error Handling Examples

### **Network Error**
```javascript
try {
  const response = await axios.get('/api/inventory/type/FOOD', { headers });
  setItems(response.data);
} catch (err) {
  console.error('Error:', err);
  setError('Failed to load items. Please check your connection.');
  setItems([]);
}
```

### **Validation Error**
```javascript
const validateForm = () => {
  const errors = {};
  
  if (!form.itemName.trim()) {
    errors.itemName = 'Item name is required';
  }
  
  if (form.quantity < 0) {
    errors.quantity = 'Quantity must be positive';
  }
  
  setFormErrors(errors);
  return Object.keys(errors).length === 0;
};

if (!validateForm()) {
  // Errors displayed under each field
  return; // Don't submit
}
```

---

## 📊 Low Stock Detection

```javascript
// For each item in table:
const isLowStock = item.quantity <= item.thresholdValue;

if (isLowStock) {
  // Apply 'low-stock-row' class
  // Shows red background
  // Badge text: "🔴 Low Stock"
  // User immediately sees warning
}

// Warning alert if ANY item is low stock:
{items.some(i => i.quantity <= i.thresholdValue) && (
  <div className="alert-warning">
    ⚠️ Warning: Some items are in low stock!
  </div>
)}
```

---

## ✨ User Experience Flow

```
1. User Login
   │
   ├─ JWT token stored in localStorage
   │
   ▼
2. Dashboard Access
   │
   ├─ Click "Inventory" in sidebar
   │
   ▼
3. Category Selection
   │
   ├─ See 3 cards (Food, Spare Parts, Fuel)
   ├─ Click one
   │
   ▼
4. Item Management
   │
   ├─ See existing items in table
   ├─ Low stock items highlighted
   │
   ▼
5. Add Item
   │
   ├─ Click "+ Add New Item"
   ├─ Fill form
   ├─ See validation errors if needed
   ├─ Submit
   ├─ See success message
   ├─ New item appears in table
   │
   ▼
6. Edit Item
   │
   ├─ Click ✎️ on any row
   ├─ Form pre-fills with current values
   ├─ Modify fields
   ├─ Click "Update Item"
   ├─ Item updated in table
   │
   ▼
7. Delete Item
   │
   ├─ Click 🗑️ on any row
   ├─ Confirm deletion
   ├─ Item removed from table
   │
   ▼
8. Navigation
   │
   ├─ Click "Back to Categories" to go back
   ├─ Click "Inventory" again to refresh
```

---

## 🎓 Code Snippets Reference

### **Get Authorization Header**
```javascript
const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};
```

### **Load Items with Error Handling**
```javascript
const loadItems = async () => {
    try {
        setLoading(true);
        setError('');
        const response = await axios.get(
            `http://localhost:8080/api/inventory/type/${type}`,
            { headers: getHeaders() }
        );
        setItems(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
        console.error('Error:', err);
        setError('Failed to load items.');
        setItems([]);
    } finally {
        setLoading(false);
    }
};
```

### **Form Submission with Validation**
```javascript
const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
        const payload = {
            itemName: form.itemName,
            quantity: parseFloat(form.quantity),
            thresholdValue: parseFloat(form.thresholdValue),
            unitPrice: parseFloat(form.unitPrice),
            inventoryType: type
        };
        
        if (editingId) {
            await axios.put(`/api/inventory/${editingId}`, payload, 
                { headers: getHeaders() });
        } else {
            await axios.post('/api/inventory/add', payload, 
                { headers: getHeaders() });
        }
        
        setSuccessMessage('Success!');
        loadItems();
        setShowForm(false);
    } catch (err) {
        setError(err.response?.data?.message || 'Failed');
    }
};
```

---

This comprehensive guide covers everything about the Inventory system architecture, data flows, security, and examples!

**Last Updated:** 25 March 2026
