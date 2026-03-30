# Parkify - Parking Management System Documentation

## 1. Project Overview

**Brief Introduction**:  
Parkify is a comprehensive web-based Parking Management System tailored to connect drivers with parking owners while allowing super admins to monitor and manage the entire platform. 

**Purpose of the Project**:  
The primary purpose is to streamline the process of finding and managing parking spaces, managing user vehicles, and ensuring secure, role-based access for different types of users (Drivers, Parking Owners, and Super Admins). The system eliminates manual parking management and digitizes the experience with robust authorization mechanisms.

**Key Features**:
*   Secure Registration and Login with OTP Verification (via Email).
*   JWT-based authentication for secured API access.
*   Role-Based Access Control (DRIVER, PARKING_OWNER, SUPER_ADMIN).
*   Profile Management including profile picture and NIC image uploads.
*   Vehicle Management for Drivers (Add, View, Update, Delete with document holding).
*   Real-time Notifications for Super Admins on new user registrations.
*   Multi-role support: users holding multiple roles can choose their desired dashboard upon login.

**Technologies Used**:
*   **Backend**: Java 17, Spring Boot, Spring Security, Spring Data JPA, Java Mail Sender, JWT.
*   **Frontend**: React.js, Axios, React Router.
*   **Database**: MySQL.

---

## 2. System Architecture

**High-Level Architecture**:  
The system follows a standard decoupled Client-Server architecture. The React frontend acts as the Single Page Application (SPA) client, interacting with the Spring Boot backend via RESTful APIs.

**Frontend and Backend Interaction**:  
The frontend uses Axios to make asynchronous HTTP requests to the backend. The backend processes these requests, interacts with the MySQL database using Spring Data JPA (Hibernate), and returns structured JSON responses or standard HTTP status codes.

**API-Based Communication Flow**:  
Once a user is successfully authenticated via OTP, the backend generates and issues a JSON Web Token (JWT). The frontend stores this token (usually in local storage/session storage) and includes it in the `Authorization: Bearer <token>` header for all subsequent secured API requests to grant access and identify the current user context.

---

## 3. Authentication & Security

### OTP Implementation
*   **Where OTP is generated**: OTPs are generated and managed in the `OtpService`. They are generated upon:
    *   New User Registration (`POST /api/auth/register-otp`).
    *   Login (`POST /api/auth/login`) directly, or after role selection if the user holds multiple roles.
*   **How OTP is verified**: Verified in the `AuthController` by calling `otpService.validateOtp(email, otp)`. 
*   **APIs used**:
    *   `POST /api/auth/register-otp`: Sends OTP to the provided email during registration.
    *   `POST /api/auth/verify-register-otp`: Validates the OTP and persists the pending user into the database.
    *   `POST /api/auth/login`: Validates password and sends an OTP to authenticate the session.
    *   `POST /api/auth/verify-otp`: Verifies the login OTP and responds with the JWT token.

### JWT Implementation
*   **Where JWT is created**: Handled in `JwtService.java` (`generateToken()`). It is invoked inside the `AuthController` upon successful OTP verification.
*   **How it is validated**: Validated by `JwtAuthenticationFilter` (which extends `OncePerRequestFilter`). For every incoming request, it intercepts the call, extracts the token from the `Authorization` header, parses the embedded email and role, and builds a `UsernamePasswordAuthenticationToken` to populate the Spring `SecurityContextHolder`.
*   **Secured Endpoints**: Configured dynamically in `SecurityConfig.java`. Public endpoints (e.g., `/api/auth/**`, password resets, image retrieval) are explicitly listed under `.permitAll()`. All other system endpoints automatically require `.authenticated()`.

---

## 4. User Management

**Registration Flow**:
1.  **Request**: User submits details (Name, Email, Password, Phone, Role, Address, NIC).
2.  **Pending State**: The backend stores the data temporarily via `RegistrationService` and triggers an OTP email.
3.  **Verification**: The user enters the OTP.
4.  **Completion**: Upon correct OTP (`verify-register-otp`), the user is permanently saved to the `users` table via `UserService`. A notification is immediately fired to SUPER_ADMINs, and a JWT token is returned.

**Login Flow**:
1.  **Credentials Check**: User provides Email and Password. `UserService.loginUser()` verifies the password hash.
2.  **Role Verification & OTP**: 
    *   If the user has 1 role (or is SUPER_ADMIN), an OTP is emailed immediately.
    *   If the user holds multiple roles, they are prompted via the UI to choose the role. `POST /api/auth/select-role` then fires the OTP.
3.  **Completion**: User submits the OTP (`verify-otp`), validation succeeds, and the standard JWT is returned.

**Role-Based Access Control (RBAC)**:
Authorization is strictly reinforced via the Spring Security context, built from the JWT claims. Users cannot bypass roles since endpoints expect a valid role. 

**Where Role Handling Logic is Implemented**: 
At login/registration in the `AuthController.java` and globally for API access via `JwtAuthenticationFilter.java`.

---

## 5. Role Handling

**Roles Managed**: `DRIVER`, `PARKING_OWNER`, `SUPER_ADMIN` (Defined in the `Role` enum).

**Where Role-Based Decisions Happen in the Code**:
*   *Backend*: In `AuthController`, a strict check blocks new users from registering directly as `SUPER_ADMIN`.
*   *Frontend*: UI routing decisions are explicitly handled. Menus, Sidebars, and views render conditionally based on the active role encoded in the JWT or session.

**Dashboards Assignment**: 
After successful login, the React frontend router resolves the `role` property returned in the login payload and redirects the user to their respective distinct dashboard layout.

---

## 6. Vehicle Management

**How vehicles are added, updated, deleted**: 
This feature is exclusive to the `DRIVER` role.
*   **Add**: Drivers submit vehicle metadata (`vehicleNumber`, `brand`, etc.) along with Image/License files. Handled via `MultipartFile` processing. The images are stored locally in the `vehicle-docs/` sub-directory.
*   **Update**: Drivers can update textual metadata and selectively replace image documents.
*   **Delete**: Standard removal of the entity.

**How vehicle data is linked to users**: 
In `Vehicle.java`, an `@ManyToOne` relationship mapped by `@JoinColumn(name = "user_id")` creates a direct foreign key link back to the `User` owner.

**API Endpoints Used**:
*   `POST /api/vehicles/add/{userId}`: Register a new vehicle with files.
*   `GET /api/vehicles/user/{userId}`: Retrieve all vehicles for a specific driver.
*   `GET /api/vehicles/{vehicleId}`: Fetch singular vehicle details.
*   `PUT /api/vehicles/{vehicleId}`: Update existing vehicle fields and optionally re-upload documents.
*   `DELETE /api/vehicles/{vehicleId}`: Delete an owned vehicle.
*   `GET /api/vehicles/docs/{fileName}`: Provide public read-access to stored images.

---

## 7. Notification System

**Where Notification Feature is Implemented**: 
*   **Scope:** `Notification.java` (Entity), `NotificationService.java` (Logic), `NotificationController.java` (Endpoints).
*   **Target:** Exclusive feature targeting `SUPER_ADMIN` users.

**How notifications are created**: 
Automatically triggered dynamically in `AuthController` (`verify-register-otp`) via `notificationService.notifyAdminsOnNewUserRegistration(createdUser)` immediately after successful user registration.

**How notifications are sent/stored**: 
Saved into the `notifications` database table and implicitly linked to the `id` of an Admin user. They are flagged with standard metadata (`message`, `type`, `createdAt`, `isRead`).

**How notifications are fetched and displayed**:
The Admin frontend dashboard queries `GET /api/notifications` using their secure JWT to retrieve their notifications list. They are displayed as unread until the admin interacts with it, triggering `PUT /api/notifications/{id}/read` to set the flag.

---

## 8. API Documentation

| Endpoint                                       | Method | Request Body/Params                                               | Response                                | Purpose                                        |
|------------------------------------------------|--------|-------------------------------------------------------------------|-----------------------------------------|------------------------------------------------|
| **`/api/auth/register-otp`**                   | POST   | `RegisterRequest` (email, name, role, etc)                        | `{ "message": "OTP sent..." }`          | Submits user details, emails OTP.              |
| **`/api/auth/verify-register-otp`**            | POST   | `VerifyRequest` (email, otp, role)                                | JWT token, role, ID, message            | Verifies OTP, finalizes registration.          |
| **`/api/auth/login`**                          | POST   | `LoginRequest` (email, password)                                  | Status (OTP_SENT), allowed roles        | Validates password, triggers OTP/role prompt.  |
| **`/api/auth/verify-otp`**                     | POST   | `VerifyRequest` (email, otp, role)                                | JWT token, role, ID, message            | Solves login MFA, issues authenticated token.  |
| **`/api/users/me`**                            | GET    | Authorization JWT Header                                          | Authenticated `User` JSON               | Retrieves active user session boundaries/data. |
| **`/api/users/{id}/profile`**                  | PUT    | `Map<String, String>` (name, phone, address, nic)                 | Updated `User` JSON                     | Updates personal profile textual info.         |
| **`/api/users/{id}/upload-profile-image`**     | POST   | `MultipartFile`                                                   | Image Name file metadata                | Uploads/replaces user profile photo.           |
| **`/api/users/admin/all`**                     | GET    | Authorization JWT Header                                          | List of `AdminUserDTO` (Users/Vehicles) | Gathers platform-wide user details.            |
| **`/api/vehicles/add/{userId}`**               | POST   | `MultipartFile`s + Metadata params (vehicleNumber, brand, target) | Saved `Vehicle` JSON                    | Binds a new vehicle + files to a driver.       |
| **`/api/vehicles/user/{userId}`**              | GET    | None                                                              | List of `Vehicle` JSON objects          | Renders fleet of vehicles for specific driver. |
| **`/api/notifications`**                       | GET    | Authorization JWT Header                                          | List of `Notification` objects          | Loads admin global alerts.                     |
| **`/api/notifications/{id}/read`**             | PUT    | Notification ID (Path Param)                                      | Success Message                         | Clears unread notification status flag.        |

---

## 9. Database Design

**Tables/Entities Used**:
1.  **`users`**: Core user table holding credentials, demographics, active role, boolean flags, and dates. Features a complex `UniqueConstraint` on composite `email` + `role`.
2.  **`vehicles`**: Defines autonomous records for cars, vans, trucks bound to a user.
3.  **`notifications`**: Persistent table for tracking dynamic system broadcasts.
4.  **`otp`**: Short-lived table defining OTP tokens and respective expiration timestamps bound by `email`.
5.  **`parking_locations`**: Details geographic points marking registered parking spaces and availability.

**Relationships**:
*   `User` (1) ——> (N) `Vehicle`
*   `User` (1) ——> (N) `Notification` (Specifically Admin Users)
*   `User` (1) ——> (N) `ParkingLocation` (Specifically Parking Owner Users)

**Explanation of Key Fields**:
*   `is_read` (Notification): Tracks whether the alert badge has been dismissed or acknowledged by an admin.
*   `twoFactorEnabled` (User): Boilerplate field supporting the system-wide Mandatory Email OTP security stance.
*   `vehicleNumber` (Vehicle): Acts as a strict `unique=true` natural key to avoid duplicate licenses entering the network.

---

## 10. File/Code Structure

**Backend Folder Structure (`src/main/java/com/parkify/parkify`)**:
*   `/config`: Encompasses Security configurations, globally enabling CORS, and initializing JWT interceptors. 
*   `/controller`: Exposes strictly typed REST endpoints mapped to HTTP action verbs. The public entry point.
*   `/dto`: Simplifies complex data structures (`LoginRequest`, `RegisterRequest`, `AdminUserDTO`) entering/leaving endpoints.
*   `/model`: Holds the Hibernate/JPA mapped object entities.
*   `/repository`: Declares JPA interfaces orchestrating direct database CRUD interactions invisibly.
*   `/service` & `/serviceImpl`: Encapsulates heavy business logic (Mail sending, validation, complex DB multi-saves).

**Frontend Folder Structure (`parkify-frontend/src`)**:
*   `/Pages`: Major dashboard screen layouts isolated per user role (`Driver`, `Admin`, `ParkingOwner`).
*   `/Components`: Modular UI components representing standard forms, UI alerts, Modals, and Cards.
*   `/Assets`: SVGs, generic placeholder images.

**Important Files**: 
*   `application.properties`: Critical environment bounds containing the `spring.datasource.url` configuring the MySQL port.
*   `SecurityConfig.java`: Formally locks down endpoint visibility and assigns the JWT filtering proxy.
*   `AuthController.java`: Orchestrates the complex multi-step Auth and OTP workflow.

---

## 11. Data Flow

**Registration → OTP → Login → Dashboard**:
1.  User fills out registration form components.
2.  React dispatches `register-otp`. Backend caches info, sends an SMTP Email to the requested inbox.
3.  User inputs the OTP. React executes `verify-register-otp`. Backend saves the User.
4.  (Assuming auto-login happens, or user redirects to manual login) -> user enters credentials.
5.  `AuthController` authenticates the password, fires another OTP if necessary, and ultimately provisions a JWT on `verify-otp`.
6.  Frontend sets `localStorage.setItem("token", jwt)`. React Router dynamically evaluates the token role and forces a redirect to the respective `/dashboard` route.

**Vehicle Creation Flow**:
1.  Driver accesses the "Add Vehicle" modal. Attaches basic data + 2 physical image uploads.
2.  Frontend compiles a `FormData` payload and dispatches a multipart `POST` to `/api/vehicles/add/{userId}`.
3.  Controller streams images to local `vehicle-docs/` filesystem, sets their generated UUID-style paths onto the `Vehicle` entity, and commands the repository to save.
4.  Controller spits out the saved Entity. Frontend re-renders the vehicle grid state.

**Notification Flow**:
1.  New account finalizing registration trips `NotificationService` hooks.
2.  Backend locates all active `SUPER_ADMIN` user references.
3.  A `Notification` record is formulated and persisted.
4.  Simultaneously/Later, the Admin Dashboard mounts and fires `GET /api/notifications` polling for changes. The bell icon updates displaying the new unread count.

---

## 12. Additional Features

*   **Profile Management**: Granular settings giving users control over textual properties (Phone, NIC, Address).
*   **Image Upload Handling**: Custom local storage approach isolating profile images to `user-photos/` and fleet images to `vehicle-docs/`. Serves files out to the network cleanly wrapped in appropriate HTTP headers (`image/jpeg`) via endpoints like `/api/users/profile-image/{fileName}`.
*   **Validations**:
    *   Backend restricts bad registrations entirely via robust constraints like `@Email`, custom RegEx `@Pattern(regexp = "^\\d{10}$")` enforcing 10-digit phone numbers and complex 10-12 character NIC limits.

---

## 13. Guide / How to Run

### Backend Setup:
1.  Verify **MySQL Server** is running locally (default 3306).
2.  Create an empty schema in MySQL named `parkify_db`.
3.  In the project root, edit `src/main/resources/application.properties` to ensure your MySQL `root` username and password match your environment.
4.  From your terminal, navigate into `Parkify---Parking-Management-System`.
5.  Run following Maven command to boot: 
    *   `./mvnw spring-boot:run` (MacOS/Linux) 
    *   `mvnw.cmd spring-boot:run` (Windows)
6.  The REST APIs will begin listening on `http://localhost:8080`.

### Frontend Setup:
1.  Open a robust terminal instance and navigate specifically into the UI directory: `cd parkify-frontend`.
2.  Ensure Node.js and npm are natively installed.
3.  Install raw node dependencies via `npm install`.
4.  Start up the React developer server via `npm start`.
5.  The app will bootstrap dynamically at `http://localhost:3000`.

---

## 14. Important Notes

*   **Assumptions**: The system assumes the backend is perpetually communicating via Google SMTP (`smtp.gmail.com`). An active Google Account App Password must remain valid.
*   **Limitations**: 
    *   Images are inherently saved to local disk (`user-photos/` / `vehicle-docs/`). This is sufficient for single-instance or local deployments but not horizontally scalable.
*   **Future Improvements**: 
    1.  Transition local file storage strategy over to secure object buckets (AWS S3, Firebase).
    2.  Implement Centralized Controller Exception management (`@ControllerAdvice`) to gracefully scrub raw Java syntax errors from leaking out over generic frontend API 500 crashes.
    3.  Potential complete restructuring from Spring Boot into Express/MERN stacks, matching recent architecture investigation. 
