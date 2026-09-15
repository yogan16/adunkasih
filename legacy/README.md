# Adunkasih Web Application

Adunkasih is a web-based application for managing users and applications/proposals related to assistance workflows. The system provides separate experiences for Admin and Pegawai (staff), including dashboards, status tracking, reports, feedback, and user profile management (Final Year Project).

---

## Features

### Authentication & User Pages
* Login and Register
* Forgot password
* User Profile page
* Logout

### Admin Modules
* Admin dashboard
* Manage pending items (e.g., approvals/rejections workflow)
* Track and view reports
* Review feedback from users

### Pegawai (Staff) Modules
* Pegawai dashboard
* Manage application/proposal processing
* Track status and progress
* View reports and assigned tasks
* Mark items as approved/lulus or rejected/tolak

### General Pages
* Contact Us
* About Us
* Semakan (verification/checking page)
* Track Status page

---

## Tech Stack
* **Frontend:** HTML, CSS, JavaScript
* **Styling:** Dedicated CSS per module (e.g., dashboard, login, reports, pending, etc.)
* **Authentication/Backend-as-a-Service:** Firebase (see `firebaseConfig.js`)
* **Assets:** Images stored in `images/`

---

## Project Structure (High-Level)
* `index.html` – Landing page / entry point
* `login.html` / `register.html` / `forgetpassword.html` – Authentication pages
* `profile.html` – User profile
* **Multiple role-based pages:**
  * `admindashboard.html`, `adundashboard.html`
  * `pegawaiDashboard.html`, `pegawaiReport.html`, `pegawaiPending.html`, etc.
* `css/` – CSS files for each feature/module
* `images/` – UI images/icons/assets
* `firebaseConfig.js` – Firebase configuration
* `logout.js` – Logout handling

---

## Setup & Running the Project

### Option A: Localhost (Recommended)
1. Copy the project into your web server folder (example: `htdocs/` in XAMPP).
2. Start Apache in XAMPP.
3. Open the project in your browser using the correct URL, for example: `http://localhost/adunkasih/`

### Option B: Direct Browser Use (For Static Pages)
You can open HTML files directly, but Firebase features and authentication will only work correctly when served over a proper web server and with the correct Firebase configuration.

---

## Firebase Configuration
This project uses Firebase. Before running authentication-dependent features:

1. Open `firebaseConfig.js`.
2. Replace the Firebase keys/config values with your own Firebase project configuration:
   * API key
   * Auth domain
   * Project ID
   * etc.

> **Note:** After updating `firebaseConfig.js`, ensure Firebase Authentication is enabled in your Firebase Console for the sign-in methods your app uses.

---

## Usage Workflow (Overview)
1. **Register / Login:** Authenticate into the system.
2. **Role-Based Routing:**
   * **Admin:** Views pending items, reports, and feedback.
   * **Pegawai:** Processes applications and updates their status.
3. **General User Actions:**
   * Check status (Track Status / Semakan)
   * View reports
   * Submit/receive feedback
4. **Logout:** Securely exit the application when finished.
