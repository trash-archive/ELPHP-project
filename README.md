# MyNotes

A simple, modern note-taking web application built with HTML, Bootstrap 5, PHP, and JavaScript.  
This project includes user registration, login, password reset (with OTP simulation), and a dashboard for managing notes.

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
│   └── images/         # Images used in the UI
├── dashboard.html      # Main notes dashboard
├── forgot.html         # Forgot password page
├── index.html          # Landing page
├── login.html          # Login page
├── newpassword.html    # Set new password page
├── otp_code.html       # OTP verification page
├── profile.html        # User profile page
├── register.html       # Registration page
└── .vscode/
    └── launch.json     # VS Code launch config
```

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

## Notes

- **This project is frontend/UI only.**  
  No real authentication, database, or backend logic is implemented.
- All forms simulate navigation and actions for demonstration purposes.

---

## Customization

- Replace images in `assets/images/` as needed.
- Update HTML and JS for real backend integration if required.

---

## License

MIT
