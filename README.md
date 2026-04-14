# 🚗 Smart Parking Management System

<p align="center">
  <img src="https://img.shields.io/badge/Java-Spring%20Boot-brightgreen?style=for-the-badge&logo=springboot" />
  <img src="https://img.shields.io/badge/Database-MySQL-blue?style=for-the-badge&logo=mysql" />
  <img src="https://img.shields.io/badge/Frontend-HTML%20CSS%20JS-orange?style=for-the-badge&logo=javascript" />
  <img src="https://img.shields.io/badge/Maps-Google%20Maps-red?style=for-the-badge&logo=googlemaps" />
</p>

<p align="center">
  A modern web-based solution designed to simplify parking space discovery, booking, and management.
</p>

---

## 📌 Project Overview

The **Smart Parking Management System** is a **web-based full-stack application** developed to help drivers quickly find available parking spaces, make reservations, and navigate to selected parking locations.

This system supports **three user roles**:

| Role | Description |
|------|-------------|
| 🚗 **Driver** | Finds and books parking spaces |
| 🏢 **Parking Owner** | Manages parking facilities |
| 🛡️ **Super Admin** | Controls approvals and monitors the system |

---

## 🎯 Objectives

- Reduce time spent searching for parking
- Provide real-time parking availability
- Enable easy parking reservations
- Improve parking management efficiency
- Support navigation using map integration

---

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| **Backend** | Java Spring Boot |
| **Frontend** | CSS, JavaScript |
| **Database** | MySQL |
| **Mapping** | Google Maps URL Integration |
| **Version Control** | Git & GitHub |
| **IDE** | IntelliJ IDEA / VS Code |

---

## ⚙️ Key Features

### 🚗 Driver Features
- 🔍 Search available parking spaces
- 📍 Manually select a parking location
- 💳 Make online payments
- 🧭 Get navigation directions
- 📜 View reservation history
- 🕒 Check booking details

### 🏢 Parking Owner Features
- 📝 Register parking facilities
- 🚗 Add and manage parking slots
- 📊 Monitor reservations
- 💰 Track earnings
- 🔄 Update parking availability
- 📈 View parking usage data

### 🛡️ Super Admin Features
- ✅ Approve or reject parking owners
- 👥 Manage users
- 📊 Monitor system activity
- 📄 Generate reports
- 🔐 Maintain system security

---

## 🖥️ System Modules

- User Management
- Parking Place Management
- Reservation Management
- Payment Management
- Employee Management
- Vehicle Service Center Management

---

## 🗺️ Navigation Integration

This system integrates **Google Maps** to provide navigation functionality.

Users can:
- Open a parking location directly in Google Maps
- Get turn-by-turn directions from their current location
- Navigate easily to their reserved parking spot

---

## 🗂️ Project Structure

**`src/main/java/`**
- `controller/` — Handles HTTP requests and routing
- `service/` — Core business logic
- `repository/` — Database access and queries
- `entity/` — Data models and entities

**`parkify-frontend/src/`**
- CSS, JavaScript, and image assets

**`database/`**
- MySQL Scripts — Database setup and seed files

**`README.md`** — Project documentation

---

## 🧩 System Architecture

**Modules:**
- Driver Module
- Parking Owner Module
- Super Admin Module
- Reservation Management
- Payment Management
- Parking Slot Management
- User Management
- Map Navigation Integration

---

## 🚀 Getting Started

### Step 1 — Clone the Repository

```bash
git clone https://github.com/yourusername/SmartParkingSystem.git
cd SmartParkingSystem
```

### Step 2 — Open the Project

Open using **IntelliJ IDEA** or **VS Code**.

### Step 3 — Configure the Database

Create a MySQL database:

```sql
CREATE DATABASE smart_parking_db;
```

Update `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smart_parking_db
spring.datasource.username=root
spring.datasource.password=your_password
```

### Step 4 — Run the Application

```bash
mvn spring-boot:run
```

```Open your browser and visit:
http://localhost:8080

---

## 📊 Future Enhancements

- 📱 Mobile App Integration
- 🔔 Real-time Notification System
- 📡 Live Slot Tracking
- 🤖 AI-based Parking Prediction
- 💳 Online Payment Gateway Integration
- 📷 Camera-based Slot Detection

---

## 👥 Team Members

| Student ID | Name |
|------------|------|
| IT24102636 | DISSANAYAKE R.P.Y.R. |
| IT24101671 | MUNTHAS F.M. |
| IT24101654 | HASARINDA W.D.Y.L. |
| IT24101820 | VIKIRUTHAN P. |
| IT24100902 | CHANDANAYAKE S.P.V.V. |
| IT24100036 | SURENTHIRAN K. |

---

## 📬 Contact

**Developer:** Yasith L. Hasarinda

📧 **Email:** [yasith.hasarinda2003@gmail.com](mailto:yasith.hasarinda2003@gmail.com)  
🌍 **Location:** Sri Lanka 🇱🇰

---

## ⭐ Support

If you find this project helpful:

- ⭐ **Star** this repository
- 🍴 **Fork** this repository

---

## 📄 License

This project is developed for **academic and educational purposes**.
