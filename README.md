# 🛒 Ecommerce Web Application

A full-stack ecommerce web application built using Django REST Framework and React (Vite).  
The platform allows users to browse products, manage carts, place orders, and securely authenticate using JWT-based authentication.

---

## 🚀 Tech Stack

### Frontend
- React.js
- Vite
- React Router
- Axios

### Backend
- Django
- Django REST Framework
- JWT Authentication
- MySQL

### Other Tools
- Git & GitHub
- Environment Variables (.env)
- REST APIs

---

## ✨ Features

- 🔐 User Authentication (JWT Login/Register)
- 🛍 Product Listing & Details
- 🛒 Add to Cart Functionality
- 📦 Order Management
- 👤 User Profile Section
- 💡 Budget Setup Feature
- 📱 Responsive UI Design
- 🔎 Search & Navigation
- ⚡ REST API Integration
- 🔒 Secure Environment Variable Handling

---

## 📂 Project Structure

```text
Ecommerce_Project/
│
├── backend/      # Django REST API
├── frontend/     # React + Vite frontend
└── README.md
```

---

## ⚙️ Requirements

- Python 3.10+
- Node.js 16+
- MySQL
- npm or yarn

---

## 🔑 Environment Setup

Copy:

```bash
backend/.env.example
```

to:

```bash
backend/.env
```

Then fill your real environment values.

⚠️ Do NOT commit `.env` files.

---

## 🖥 Backend Setup

Create virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
pip install -r backend/requirements.txt
```

Run migrations:

```powershell
cd backend
python manage.py migrate
```

Create superuser:

```powershell
python manage.py createsuperuser
```

Start backend server:

```powershell
python manage.py runserver
```

Backend runs at:

```text
http://127.0.0.1:8000/
```

---

## 🌐 Frontend Setup

Install dependencies:

```bash
cd frontend
npm install
```

Start development server:

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173/
```

Build production version:

```bash
npm run build
```

---

## 📁 Media & Static Files

- Uploaded files are stored locally in:

```text
backend/media/
```

- Media files are ignored using `.gitignore`.

---

## 🧪 Testing

Backend:

```bash
cd backend
python manage.py test
```

Frontend:
Check scripts inside `frontend/package.json`.

---

## 🔒 Security Notes

- Secrets are managed using environment variables.
- `.env` files are excluded from Git tracking.
- Sensitive credentials are never pushed to GitHub.

---

## 📌 Future Improvements

- Payment Gateway Integration
- Wishlist Feature
- Product Reviews & Ratings
- Admin Dashboard Analytics
- Deployment using Docker/AWS

---

## 👩‍💻 Author

**Abinaya K**  

