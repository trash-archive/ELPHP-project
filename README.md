# MyNotes

A simple, modern note-taking web application built with HTML, Bootstrap 5, PHP, and JavaScript.  
This project includes user registration, login, password reset (with OTP simulation), and a dashboard for managing notes.

---

## Members

- **Luis Wayne Christian E. Mahusay**
- **Jhon Mark A. Panimdim**
- **Eufemio L. Capoy**
- **Hasim W. Tordios**

---

## Features

- User Registration & Login (UI only)
- Forgot Password & OTP Verification (UI only)
- Dashboard for creating and viewing notes
- Responsive design using Bootstrap 5
- Profile page for user info (UI only)

---

## Folder Structure

```
ELPHP-project/
│
├── assets/
│   └── images/
│       ├── screenshot_dashboard.PNG
│       ├── screenshot_forgot.PNG
│       ├── screenshot_index.PNG
│       ├── screenshot_index2.PNG
│       ├── screenshot_login.PNG
│       ├── screenshot_newpassword.PNG
│       ├── screenshot_otp.PNG
│       ├── screenshot_profile.PNG
│       └── screenshot_register.PNG
│
├── dashboard.html
├── forgot.html
├── index.html
├── login.html
├── newpassword.html
├── otp_code.html
├── profile.html
├── register.html
│
├── README.md

---

## Prerequisites

- **Web Browser:** Chrome, Edge, Firefox, etc.
- **Local Web Server:**  
  - **Recommended:** [XAMPP](https://www.apachefriends.org/) (Apache)
  - **Alternative:** PHP built-in server, Laragon, WampServer, or any static server

---

## Running the Project

Using XAMPP (Recommended for Windows)

1. **Install XAMPP**  
   Download and install from [https://www.apachefriends.org/](https://www.apachefriends.org/).

2. **Place the Project Folder**  
   Copy the `ELPHP-project` folder into `C:\xampp\htdocs\`.

3. **Start Apache**  
   Open XAMPP Control Panel and click **Start** next to Apache.

4. **Open in Browser**  
   Go to: [http://localhost/ELPHP-project](http://localhost/ELPHP-project)

---

## Usage
- **Index:** Starting page of the project.
- **Register:** Create a new account on `register.html`.
- **Login:** Use your number and password on `login.html`.
- **Forgot Password:** Reset your password via `forgot.html` and OTP simulation.
- **Dashboard:** Create, view, and manage notes (UI only, no backend).
- **Profile:** View and edit your profile (UI only).

---

## Screenshots

### Landing Page (`index.html`)
![Landing Page](assets/images/screenshot_index.png)

### Landing Page2 ('index.html')
![Landing Page](assets/images/screenshot_index2.png)

### Register Page (`register.html`)
![Register Page](assets/images/screenshot_register.png)

### Login Page (`login.html`)
![Login Page](assets/images/screenshot_login.png)

### Forgot Password Page (`forgot.html`)
![Forgot Password Page](assets/images/screenshot_forgot.png)

### OTP Verification Page (`otp_code.html`)
![OTP Verification Page](assets/images/screenshot_otp.png)

### New Password Page (`newpassword.html`)
![New Password Page](assets/images/screenshot_newpassword.png)

### Dashboard (`dashboard.html`)
![Dashboard](assets/images/screenshot_dashboard.png)

### Profile Page (`profile.html`)
![Profile Page](assets/images/screenshot_profile.png)

---
## Database structure
Instructions: This table below is the exact database structure in my phpmyadmin, enable for you to use this application you need to copy this database okay? okayyyy
-- Users table
CREATE TABLE users (
    id INT(11) NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Notes table
CREATE TABLE notes (
    id INT(11) NOT NULL AUTO_INCREMENT,
    user_id INT(11) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (id),
    KEY (user_id),
    CONSTRAINT fk_notes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- OTP Codes table
CREATE TABLE otp_codes (
    id INT(11) NOT NULL AUTO_INCREMENT,
    user_id INT(11) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY (user_id),
    CONSTRAINT fk_otp_codes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- OTP Verification table
CREATE TABLE otp_verification (
    id INT(11) NOT NULL AUTO_INCREMENT,
    otp_id INT(11) NOT NULL,
    ip_address VARCHAR(50) NOT NULL,
    user_agent VARCHAR(255) NOT NULL,
    status ENUM('success','failed') NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY (otp_id),
    CONSTRAINT fk_otp_verification_code FOREIGN KEY (otp_id) REFERENCES otp_codes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

Hashed Password admin
INSERT INTO users (first_name, last_name, email, password, role)
VALUES ('Mark', 'Jhon', 'adminmark@gmail.com', 'run the genhashed.html', 'admin');

---

## Notes

- **This project is frontend/UI only.**  
  No real authentication, database, or backend logic is implemented.
- All forms simulate navigation and actions for demonstration purposes.

---

## Customization

- Replace images in `assets/images/` as needed.
- Update HTML and JS for real backend integration if required.
