# 🎯 AttendanceQR - Smart Attendance System

> **Sistem absensi QR modern dengan UI/UX yang sangat menarik, efek 3D, dan fitur lengkap**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg)
![Node.js](https://img.shields.io/badge/Node.js-18.0+-339933.svg)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1.svg)

## ✨ Features Utama

### 🔐 Authentication & Security
- **JWT-based Authentication** dengan refresh tokens
- **Role Management** (Admin & User)
- **Password Encryption** dengan bcrypt
- **Rate Limiting** untuk keamanan API
- **CORS Protection** yang dikonfigurasi dengan baik

### 📱 QR Code System
- **Dynamic QR Generation** untuk setiap sesi
- **Session-based Scanning** dengan expiry time
- **Mobile-optimized Scanner** dengan camera support
- **Real-time QR Refresh** otomatis
- **QR Code per User** untuk identitas

### 👤 User Management
- **Profile Management** lengkap dengan foto
- **3D ID Card** dengan animasi yang menakjubkan
- **Face Registration** (siap implementasi)
- **Personal QR Code** unik per user
- **Department & Position** tracking

### 📊 Dashboard & Analytics
- **Real-time Statistics** dengan visualisasi menarik
- **3D Animations** menggunakan Framer Motion
- **Glassmorphism Design** yang modern
- **Responsive Layout** untuk semua device
- **Interactive Charts** dan metrics

### 📈 Attendance Tracking
- **Check-in/Check-out** dengan timestamp akurat
- **Late Detection** otomatis berdasarkan jam kerja
- **Status Management** (Present, Late, Absent)
- **Work Hours Calculation** otomatis
- **Location Tracking** (siap implementasi)

### 📋 Admin Panel
- **QR Code Generator** untuk admin
- **System Monitoring** real-time
- **User Management** lengkap
- **Statistics Overview** comprehensive
- **Export Controls** untuk laporan

### 📄 Export & Reporting
- **PDF Reports** dengan formatting profesional
- **Excel Spreadsheets** dengan styling
- **Filtered Exports** berdasarkan kriteria
- **Automated Scheduling** (siap implementasi)
- **Email Reports** (siap implementasi)

### 🎨 UI/UX Design
- **Dark Theme** dengan gradient yang indah
- **Framer Motion Animations** di setiap interaksi
- **3D Effects** dan depth yang realistis
- **Glassmorphism** untuk modern look
- **Fully Responsive** dari mobile sampai desktop
- **Loading States** dengan animasi menarik
- **Micro-interactions** yang smooth

## 🚀 Tech Stack

### Frontend
- **React 18** dengan Hooks modern
- **Vite** untuk build tool yang cepat
- **TailwindCSS** untuk styling
- **Framer Motion** untuk animasi
- **React Router** untuk navigation
- **Axios** untuk HTTP requests
- **React Hot Toast** untuk notifications
- **Html5-QRCode** untuk scanner
- **Heroicons** untuk icons

### Backend
- **Node.js** dengan Express.js
- **MySQL** database dengan connection pooling
- **JWT** untuk authentication
- **Bcrypt** untuk password hashing
- **Multer** untuk file upload
- **QRCode** generator
- **ExcelJS** untuk export Excel
- **PDFKit** untuk export PDF
- **Helmet** untuk security headers
- **Morgan** untuk logging
- **CORS** protection

## 📦 Installation

### Prerequisites
- Node.js 16.0 atau lebih baru
- MySQL 8.0 atau lebih baru
- npm atau yarn package manager

### 1. Clone Repository
```bash
git clone https://github.com/your-username/attendanceqr-system.git
cd attendanceqr-system
```

### 2. Setup Backend
```bash
cd backend
npm install

# Setup environment variables
cp .env.example .env
# Edit .env file dengan konfigurasi database Anda

# Setup database
mysql -u root -p < database/schema.sql

# Start backend server
npm run dev
```

### 3. Setup Frontend
```bash
cd attendance-qr-system
npm install

# Setup environment variables
cp .env.example .env
# Edit .env file dengan URL backend API

# Start frontend development server
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=attendance_qr_system
DB_PORT=3306

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Frontend URL
FRONTEND_URL=http://localhost:5173

# QR Configuration
QR_CODE_EXPIRE_TIME=300000
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📱 API Documentation

### Authentication Endpoints
```
POST /api/auth/register - Register new user
POST /api/auth/login - User login
GET /api/auth/profile - Get user profile
PUT /api/auth/profile - Update user profile
PUT /api/auth/change-password - Change password
```

### Attendance Endpoints
```
POST /api/attendance/generate-qr - Generate QR code (Admin only)
POST /api/attendance/scan-qr - Scan QR code for attendance
GET /api/attendance/today - Get today's attendance
GET /api/attendance/history - Get attendance history
GET /api/attendance/all - Get all attendance (Admin only)
```

### Export Endpoints
```
GET /api/export/excel - Export to Excel (Admin)
GET /api/export/pdf - Export to PDF (Admin)
GET /api/export/user/excel - Export user data to Excel
GET /api/export/user/pdf - Export user data to PDF
GET /api/export/stats - Get export statistics
```

## 🎮 Default Accounts

### Admin Account
- **Email**: admin@company.com
- **Password**: admin123
- **Role**: Administrator

### Test User Account
- **Email**: user@company.com  
- **Password**: user123
- **Role**: User

## 🔒 Security Features

- **Password Hashing** dengan bcrypt (10 salt rounds)
- **JWT Tokens** dengan expiration
- **Rate Limiting** (100 requests per 15 minutes)
- **Auth Rate Limiting** (10 requests per 15 minutes)
- **CORS Configuration** yang aman
- **Security Headers** dengan Helmet
- **Input Validation** dan sanitization
- **SQL Injection Protection** dengan parameterized queries
- **File Upload Restrictions** dengan size limits

## 📊 Database Schema

### Users Table
- `id` - Primary key
- `user_id` - Unique user identifier
- `email` - User email (unique)
- `password` - Hashed password
- `full_name` - User's full name
- `role` - User role (admin/user)
- `department` - User department
- `position` - User position
- `phone` - Phone number
- `profile_image` - Profile image path
- `face_data` - Face recognition data
- `qr_code` - Personal QR code
- `is_active` - Account status
- `created_at`, `updated_at` - Timestamps

### Attendance Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `check_in_time` - Check-in timestamp
- `check_out_time` - Check-out timestamp
- `date` - Attendance date
- `status` - Attendance status
- `check_in_qr`, `check_out_qr` - QR session IDs
- `location` - Location data
- `notes` - Additional notes
- `created_at`, `updated_at` - Timestamps

### QR Sessions Table
- `id` - Primary key
- `session_id` - Unique session identifier
- `qr_code_data` - QR code data
- `type` - QR type (check_in/check_out)
- `expires_at` - Expiration timestamp
- `is_used` - Usage status
- `used_by` - User who used the QR
- `created_at` - Creation timestamp

## 🚀 Deployment

Sistem ini siap di-deploy ke production dengan panduan lengkap di [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

### Supported Platforms
- **Niagahoster** (Primary target)
- **Vercel** (Frontend)
- **Heroku** (Backend)
- **DigitalOcean** (Full stack)
- **VPS** dengan Node.js support

## 🛠️ Development

### Available Scripts

#### Backend
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm test         # Run tests
```

#### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Code Structure
```
/
├── backend/                 # Backend API
│   ├── config/             # Database & app configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   ├── database/           # Database schema & seeds
│   └── uploads/            # File uploads
├── attendance-qr-system/   # Frontend React app
│   ├── public/             # Public assets
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context
│   │   ├── pages/          # Page components
│   │   └── hooks/          # Custom hooks
│   └── dist/               # Build output
└── docs/                   # Documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** untuk framework yang luar biasa
- **TailwindCSS** untuk utility-first CSS
- **Framer Motion** untuk animasi yang smooth
- **Heroicons** untuk icon set yang konsisten
- **Vite** untuk build tool yang cepat

## 📞 Support

Jika Anda mengalami masalah atau punya pertanyaan:

1. Check [Issues](https://github.com/your-username/attendanceqr-system/issues)
2. Buat issue baru jika diperlukan
3. Contact: your-email@example.com

---

**✨ Dibuat dengan ❤️ menggunakan React, Node.js, dan teknologi modern lainnya**

**🎯 Siap production dengan UI/UX yang sangat menarik dan fitur lengkap!**