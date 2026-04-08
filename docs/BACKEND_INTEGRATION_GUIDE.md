# Spring Boot Backend Integration - Inventory Module

## Quick Reference for Backend Developers

This document outlines what your Spring Boot backend needs to support the Inventory Management module in the Parkify frontend.

---

## 🔌 Required API Endpoints

### **1. Get All Items by Type**
```
GET /api/inventory/type/{type}
Authorization: Bearer {token}

Response:
[
  {
    "id": 1,
    "itemName": "Orange Juice",
    "quantity": 50.5,
    "thresholdValue": 10,
    "unitPrice": 250.00,
    "inventoryType": "FOOD"
  },
  {
    "id": 2,
    "itemName": "Diesel",
    "quantity": 100.0,
    "thresholdValue": 20,
    "unitPrice": 95.50,
    "inventoryType": "FUEL"
  }
]
```

### **2. Create New Item**
```
POST /api/inventory/add
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "itemName": "Milk",
  "quantity": 30,
  "thresholdValue": 5,
  "unitPrice": 150.00,
  "inventoryType": "FOOD"
}

Response (Success):
{
  "id": 3,
  "itemName": "Milk",
  "quantity": 30,
  "thresholdValue": 5,
  "unitPrice": 150.00,
  "inventoryType": "FOOD"
}
```

### **3. Update Item**
```
PUT /api/inventory/{id}
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "itemName": "Milk (Updated)",
  "quantity": 25,
  "thresholdValue": 8,
  "unitPrice": 155.00,
  "inventoryType": "FOOD"
}

Response:
{
  "id": 3,
  "itemName": "Milk (Updated)",
  "quantity": 25,
  "thresholdValue": 8,
  "unitPrice": 155.00,
  "inventoryType": "FOOD"
}
```

### **4. Delete Item**
```
DELETE /api/inventory/{id}
Authorization: Bearer {token}

Response:
{
  "message": "Item deleted successfully"
}
```

---

## 📊 Entity Structure (Recommended)

```java
@Entity
@Table(name = "inventory")
public class Inventory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String itemName;
    
    @Column(nullable = false)
    private Double quantity;
    
    @Column(nullable = false)
    private Double thresholdValue;
    
    @Column(nullable = false)
    private Double unitPrice;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private InventoryType inventoryType;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime createdAt;
    
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime updatedAt;
    
    // Getters and Setters
}

public enum InventoryType {
    FOOD,
    SPARE_PART,
    FUEL
}
```

---

## 🛡️ Security & Authorization

### **JWT Authentication**
- All endpoints require valid JWT token in Authorization header
- Token format: `Authorization: Bearer {jwtToken}`
- Extract user ID from JWT to filter items by owner

### **Sample Filter Logic**
```java
@GetMapping("/api/inventory/type/{type}")
public ResponseEntity<?> getInventoryByType(
    @PathVariable String type,
    @RequestHeader("Authorization") String token
) {
    // Extract user from JWT token
    User user = userService.getUserFromToken(token);
    
    // Get inventory only for this user
    List<Inventory> items = inventoryRepository
        .findByInventoryTypeAndUser(InventoryType.valueOf(type), user);
    
    return ResponseEntity.ok(items);
}
```

---

## ✅ Request/Response Validation

### **Field Constraints**
```
itemName:       String, Required, Min 1 char, Max 100 chars
quantity:       Double, Required, >= 0
thresholdValue: Double, Required, >= 0
unitPrice:      Double, Required, > 0
inventoryType:  Enum, Required, One of: FOOD, SPARE_PART, FUEL
```

### **Error Responses**
```javascript
// 400 Bad Request
{
  "message": "Item name is required"
}

// 401 Unauthorized
{
  "message": "Invalid or expired token"
}

// 404 Not Found
{
  "message": "Item not found"
}

// 500 Server Error
{
  "message": "Failed to process request"
}
```

---

## 🔄 Recommended Controller Implementation

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {
    
    @Autowired
    private InventoryService inventoryService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/type/{type}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getByType(
        @PathVariable String type,
        HttpServletRequest request
    ) {
        try {
            User user = userService.getUserFromRequest(request);
            List<Inventory> items = inventoryService
                .findByTypeAndUser(InventoryType.valueOf(type), user);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.status(400)
                .body(new ErrorResponse(e.getMessage()));
        }
    }
    
    @PostMapping("/add")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addItem(
        @RequestBody InventoryRequest request,
        HttpServletRequest httpRequest
    ) {
        try {
            User user = userService.getUserFromRequest(httpRequest);
            Inventory item = inventoryService.createItem(request, user);
            return ResponseEntity.status(201).body(item);
        } catch (Exception e) {
            return ResponseEntity.status(400)
                .body(new ErrorResponse(e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateItem(
        @PathVariable Long id,
        @RequestBody InventoryRequest request,
        HttpServletRequest httpRequest
    ) {
        try {
            User user = userService.getUserFromRequest(httpRequest);
            Inventory item = inventoryService.updateItem(id, request, user);
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            return ResponseEntity.status(400)
                .body(new ErrorResponse(e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteItem(
        @PathVariable Long id,
        HttpServletRequest request
    ) {
        try {
            User user = userService.getUserFromRequest(request);
            inventoryService.deleteItem(id, user);
            return ResponseEntity.ok(new MessageResponse("Item deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(400)
                .body(new ErrorResponse(e.getMessage()));
        }
    }
}
```

---

## 📝 DTO Classes

```java
public class InventoryRequest {
    private String itemName;
    private Double quantity;
    private Double thresholdValue;
    private Double unitPrice;
    private String inventoryType;
    
    // Getters and Setters
}

public class MessageResponse {
    private String message;
    
    public MessageResponse(String message) {
        this.message = message;
    }
    
    public String getMessage() {
        return message;
    }
}

public class ErrorResponse {
    private String message;
    
    public ErrorResponse(String message) {
        this.message = message;
    }
    
    public String getMessage() {
        return message;
    }
}
```

---

## 🗄️ Database Schema (SQL)

```sql
CREATE TABLE inventory (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(100) NOT NULL,
    quantity DOUBLE NOT NULL,
    threshold_value DOUBLE NOT NULL,
    unit_price DOUBLE NOT NULL,
    inventory_type ENUM('FOOD', 'SPARE_PART', 'FUEL') NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_type_user ON inventory(inventory_type, user_id);
```

---

## 🔒 CORS Configuration

Make sure your Spring Boot has CORS enabled for localhost:3000 (React dev server):

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:3000", "http://localhost:8080")
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

---

## 🧪 Testing the APIs

### **Using cURL**
```bash
# Get items
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/inventory/type/FOOD

# Add item
curl -X POST http://localhost:8080/api/inventory/add \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "itemName": "Coffee",
       "quantity": 50,
       "thresholdValue": 10,
       "unitPrice": 200
     }'
```

### **Using Postman**
1. Set Authorization header with Bearer token
2. Content-Type: application/json
3. Send requests to endpoints above

---

## 📋 Checklist Before Deployment

- [ ] All endpoints return proper HTTP status codes
- [ ] JWT validation works correctly
- [ ] User-specific data isolation (inventory per user)
- [ ] Input validation on all fields
- [ ] Error messages are clear and helpful
- [ ] Database schema is created
- [ ] CORS is properly configured
- [ ] Timestamps (createdAt, updatedAt) are tracked
- [ ] Low stock items can be identified (quantity <= thresholdValue)
- [ ] Tests pass for all CRUD operations

---

## 🚀 Ready to Deploy?

Once your backend implements these endpoints, the frontend will automatically:
- ✅ Load and display items
- ✅ Handle CRUD operations
- ✅ Show low stock alerts
- ✅ Validate forms
- ✅ Display error messages
- ✅ Show success confirmations

**No frontend changes needed!** The integration is already complete.

---

**Last Updated:** 25 March 2026
