# Testing & Deployment Checklist

## ✅ Pre-Deployment Testing Checklist

### **1. Frontend Setup & Build**
- [ ] All files created/modified correctly
- [ ] No console errors when running app
- [ ] No missing imports or dependencies
- [ ] React dev server runs on localhost:3000
- [ ] App builds without errors (`npm run build`)

### **2. Dashboard Integration**
- [ ] "Inventory" tab appears in sidebar
- [ ] Clicking "Inventory" tab loads InventoryDashboard
- [ ] Other dashboard tabs still work (Overview, Slots, Earnings, Profile)
- [ ] Sidebar navigation works properly
- [ ] Top navbar displays correctly

### **3. Inventory Categories Page**
- [ ] 3 category cards display (Food, Spare Parts, Fuel)
- [ ] Cards have proper styling and icons
- [ ] Cards are clickable and responsive
- [ ] Hover effects work (cards lift up)
- [ ] All text is visible and readable

### **4. Manage Inventory Page**
- [ ] Page loads when category is clicked
- [ ] "+ Add New Item" button is visible
- [ ] "Back to Categories" button works
- [ ] Empty state shows when no items exist
- [ ] Loading spinner appears while fetching
- [ ] Items table displays correctly

### **5. CRUD Operations**

#### **Create (Add Item)**
- [ ] "+ Add New Item" button opens modal
- [ ] Modal form has all required fields
  - [ ] Item Name
  - [ ] Quantity
  - [ ] Unit Price
  - [ ] Low Stock Threshold
- [ ] Form validation works
  - [ ] Required field errors shown
  - [ ] Positive number validation works
  - [ ] Error text displays under fields
- [ ] Submit button works
- [ ] New item appears in table immediately
- [ ] Success message shows and disappears
- [ ] Form clears after submission

#### **Read (View Items)**
- [ ] Items load from backend
- [ ] Table displays all columns
  - [ ] Item Name
  - [ ] Quantity
  - [ ] Unit Price
  - [ ] Threshold
  - [ ] Status
  - [ ] Actions
- [ ] Data is formatted correctly
- [ ] Prices show with "Rs." format
- [ ] No duplicates in list

#### **Update (Edit Item)**
- [ ] Edit button (✎️) appears on each row
- [ ] Clicking edit opens modal with pre-filled data
- [ ] All fields can be modified
- [ ] Validation works same as create
- [ ] "Update Item" button works
- [ ] Item updates in table
- [ ] Success message shows
- [ ] Form closes after update

#### **Delete (Remove Item)**
- [ ] Delete button (🗑️) appears on each row
- [ ] Confirmation dialog appears when clicked
- [ ] Cancel confirmation works
- [ ] Confirming deletes item
- [ ] Item removed from table immediately
- [ ] Success message shows
- [ ] Empty state appears if all items deleted

### **6. Low Stock Alerts**
- [ ] Add item with quantity < threshold
- [ ] Row highlights in red/light pink
- [ ] "🔴 Low Stock" badge shows
- [ ] Warning alert appears at top
- [ ] Multiple low stock items highlight correctly
- [ ] Edit quantity to above threshold → highlight removes

### **7. Validation**
- [ ] Empty item name shows error
- [ ] Negative quantity shows error
- [ ] Zero price shows error
- [ ] Negative threshold shows error
- [ ] Error text appears under correct field
- [ ] Error text disappears when field is corrected
- [ ] Form won't submit with errors
- [ ] Numbers accept decimals (0.01, 100.5, etc.)

### **8. Error Handling**
- [ ] Disconnect backend → error message shows
- [ ] Network timeout → handled gracefully
- [ ] Invalid token → error shown
- [ ] Server error (500) → handled
- [ ] Error messages are readable and helpful
- [ ] Error dismiss button (×) works
- [ ] Auto-refresh button available if needed

### **9. User Feedback**
- [ ] Loading spinner shows while fetching
- [ ] "Loading items..." text visible
- [ ] Success messages auto-dismiss after 3 seconds
- [ ] Manual dismiss (×) button works
- [ ] Color coding correct (green=success, red=error, yellow=warning)
- [ ] Toast/alert messages are positioned well
- [ ] No overlapping of messages

### **10. Responsive Design**

#### **Desktop (1024px+)**
- [ ] Table shows all columns
- [ ] Cards layout side-by-side
- [ ] No horizontal scrolling needed
- [ ] Modal fits on screen
- [ ] All buttons clickable

#### **Tablet (768px - 1023px)**
- [ ] Layout adjusts properly
- [ ] Table may need scroll but is readable
- [ ] Cards stack if needed
- [ ] Touch targets are large enough (44px+)
- [ ] Modal responsive

#### **Mobile (< 768px)**
- [ ] Full-width layout
- [ ] Table may scroll horizontally
- [ ] Cards stack vertically
- [ ] Buttons stack properly
- [ ] Form fields full width
- [ ] Modal centered and properly sized

### **11. Browser Compatibility**
- [ ] Chrome/Chromium ✓
- [ ] Firefox ✓
- [ ] Safari ✓
- [ ] Edge ✓
- [ ] Mobile Chrome ✓
- [ ] Mobile Safari ✓

### **12. Authentication & Security**
- [ ] JWT token stored in localStorage
- [ ] Token sent in Authorization header
- [ ] Format is "Bearer {token}"
- [ ] Logout clears token
- [ ] Without token → redirects to login
- [ ] Expired token → error shown

### **13. Performance**
- [ ] Pages load in < 2 seconds
- [ ] No unnecessary re-renders
- [ ] Smooth animations and transitions
- [ ] No lag when typing in form
- [ ] Table scroll is smooth
- [ ] Modal opens/closes smoothly

### **14. Accessibility**
- [ ] All form fields have labels
- [ ] Error messages associated with fields
- [ ] Buttons have clear text
- [ ] Icons have alt text or title attributes
- [ ] Color not only indicator (also use text/icons)
- [ ] Keyboard navigation works

---

## 🧪 Manual Testing Scenarios

### **Scenario 1: First Time User**
1. Login to dashboard
2. See Inventory tab in sidebar ✅
3. Click Inventory tab ✅
4. See 3 category cards ✅
5. Click "Food & Beverage" ✅
6. See empty state "No items yet" ✅
7. Click "+ Add First Item" ✅
8. Fill form with valid data ✅
9. Submit ✅
10. Item appears in table ✅

### **Scenario 2: Add Multiple Items**
1. Click "+ Add New Item"
2. Add "Coffee" (qty: 50, threshold: 10)
3. Add "Tea" (qty: 8, threshold: 10) ← Low stock
4. Add "Milk" (qty: 20, threshold: 5)
5. Verify all 3 appear in table
6. Verify Tea row is highlighted red
7. Verify warning alert appears

### **Scenario 3: Edit Item**
1. Click ✎️ on "Coffee" row
2. Change quantity from 50 to 35
3. Change price from 200 to 220
4. Click "Update Item"
5. Table updates immediately
6. Success message shows

### **Scenario 4: Delete Item**
1. Click 🗑️ on "Milk" row
2. Confirm deletion
3. "Milk" disappears from table
4. Success message shows

### **Scenario 5: Form Validation**
1. Click "+ Add New Item"
2. Leave "Item Name" empty, click submit
3. Error appears under field ✅
4. Type "Sugar" in field
5. Error disappears ✅
6. Leave "Quantity" empty, click submit
7. Error appears ✅
8. Type "-10" (negative)
9. Error appears ✅
10. Type "0"
11. Error appears ✅
12. Type "25" (valid)
13. Error disappears ✅

### **Scenario 6: Network Error**
1. Stop backend server
2. Try to load items
3. Error message appears
4. Message says "Failed to load items"
5. Suggests checking connection
6. Start backend again
7. Page still shows error
8. Click refresh or reload page
9. Items load successfully

### **Scenario 7: Low Stock Scenario**
1. Add item with threshold of 20
2. Set quantity to 15
3. Row highlighted in red ✅
4. Badge shows "🔴 Low Stock" ✅
5. Increase quantity to 25
6. Refresh items
7. Row no longer highlighted ✅
8. Badge shows "✓ Normal" ✅

### **Scenario 8: Category Switching**
1. Click "Food & Beverage"
2. Add "Apple" (FOOD type)
3. Go back to categories
4. Click "Spare Parts"
5. Add "Bolt" (SPARE_PART type)
6. Go back to categories
7. Click "Fuel"
8. Add "Diesel" (FUEL type)
9. Go back and check each category has correct items

---

## 🔌 Backend Testing

### **API Endpoint Tests (using Postman or cURL)**

#### **1. GET /api/inventory/type/FOOD**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8080/api/inventory/type/FOOD
```
**Expected:** 200 OK with array of items

#### **2. POST /api/inventory/add**
```bash
curl -X POST http://localhost:8080/api/inventory/add \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "itemName": "Test Item",
       "quantity": 50,
       "thresholdValue": 10,
       "unitPrice": 200,
       "inventoryType": "FOOD"
     }'
```
**Expected:** 201 Created with item object

#### **3. PUT /api/inventory/1**
```bash
curl -X PUT http://localhost:8080/api/inventory/1 \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "itemName": "Updated Item",
       "quantity": 60,
       "thresholdValue": 10,
       "unitPrice": 220,
       "inventoryType": "FOOD"
     }'
```
**Expected:** 200 OK with updated item

#### **4. DELETE /api/inventory/1**
```bash
curl -X DELETE http://localhost:8080/api/inventory/1 \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
**Expected:** 200 OK with success message

---

## 📋 Deployment Checklist

### **Before Deploying to Production**

#### **Code Quality**
- [ ] No console.error or console.warn in production
- [ ] Remove console.log statements
- [ ] No console.warn about uninitialized state
- [ ] Proper error boundaries
- [ ] Try-catch blocks everywhere needed
- [ ] No commented-out code
- [ ] Consistent code style

#### **Security**
- [ ] JWT tokens never exposed in logs
- [ ] Password fields use input type="password"
- [ ] CORS properly configured
- [ ] No hardcoded sensitive data
- [ ] API base URL configurable
- [ ] All API calls use HTTPS in production

#### **Performance**
- [ ] Images optimized
- [ ] CSS minified
- [ ] JavaScript minified
- [ ] No unnecessary API calls
- [ ] Lazy loading implemented where needed
- [ ] Cache headers configured

#### **Testing**
- [ ] All CRUD operations tested
- [ ] Error scenarios tested
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility verified
- [ ] Load testing completed
- [ ] User acceptance testing done

#### **Documentation**
- [ ] README updated
- [ ] API documentation complete
- [ ] Code comments added where needed
- [ ] Deployment guide written
- [ ] Troubleshooting guide created

#### **Backend Readiness**
- [ ] All endpoints implemented
- [ ] Database migrations applied
- [ ] Server configured and tested
- [ ] Logging enabled
- [ ] Backup strategy in place
- [ ] Monitoring setup

#### **Frontend Build**
- [ ] `npm run build` succeeds
- [ ] Build has no warnings
- [ ] Bundle size acceptable
- [ ] Source maps configured
- [ ] Environment variables set

---

## 🐛 Debugging Tips

### **If Frontend Won't Load**
1. Check browser console (F12)
2. Look for red error messages
3. Check network tab for failed requests
4. Verify backend is running
5. Check localStorage has JWT token
6. Clear cache and refresh

### **If Items Won't Load**
1. Check browser console for network errors
2. Verify backend endpoint exists
3. Check JWT token is valid
4. Verify CORS is enabled
5. Test endpoint with Postman
6. Check backend logs

### **If Form Won't Submit**
1. Check for validation errors (red text)
2. Verify all required fields filled
3. Check browser console for JS errors
4. Verify JWT token is valid
5. Test endpoint with Postman
6. Check backend logs

### **If Items Don't Update**
1. Refresh page (F5)
2. Check browser cache
3. Clear localStorage
4. Verify backend update endpoint
5. Check database directly
6. Check backend logs

---

## 📞 Support Escalation

| Issue | Check | Solution |
|-------|-------|----------|
| Frontend won't load | Browser console | Check imports, verify file paths |
| No items loading | Network tab | Verify backend running, check token |
| Form won't submit | Validation errors | Ensure all fields valid, check token |
| Items not persisting | Database | Verify backend saving correctly |
| CORS errors | Network tab | Configure CORS on backend |
| Login issues | localStorage | Check token storage, verify JWT |
| Mobile layout broken | Browser DevTools | Test responsive design |
| Slow performance | Network tab | Optimize API calls, add caching |

---

## 🎯 Success Criteria

✅ **All CRUD operations work**
✅ **Form validation works**
✅ **Error handling works**
✅ **Low stock alerts visible**
✅ **Responsive on all devices**
✅ **Fast loading**
✅ **Secure (JWT auth)**
✅ **Professional UI**
✅ **Comprehensive documentation**
✅ **Tested and verified**

---

## 📅 Sign-Off Checklist

- [ ] Frontend development complete
- [ ] Backend integration verified
- [ ] All tests passed
- [ ] Documentation complete
- [ ] Performance acceptable
- [ ] Security verified
- [ ] User acceptance test passed
- [ ] Ready for production deployment

---

**Created:** 25 March 2026
**Last Updated:** 25 March 2026
**Status:** Ready for Testing
