# 🚀 Deployment Guide - Niagahoster

Panduan lengkap untuk deploy sistem absensi QR ke Niagahoster.

## 📋 Prerequisites

1. Hosting Niagahoster dengan Node.js support
2. Domain yang sudah dikonfigurasi
3. Akses cPanel atau file manager
4. Database MySQL

## 🏗️ Backend Deployment

### 1. Persiapan File Backend

1. **Build Backend:**
   ```bash
   cd backend
   npm install --production
   ```

2. **Compress Backend:**
   ```bash
   zip -r backend.zip . -x "node_modules/*" "*.log"
   ```

### 2. Upload ke Hosting

1. Login ke cPanel Niagahoster
2. Buka File Manager
3. Navigate ke direktori domain (biasanya `public_html/`)
4. Upload `backend.zip`
5. Extract file

### 3. Install Dependencies

1. Buka Terminal di cPanel
2. Navigate ke folder backend:
   ```bash
   cd public_html/backend
   npm install --production
   ```

### 4. Setup Database

1. **Buat Database di cPanel:**
   - Buka MySQL Databases
   - Buat database baru: `attendance_qr`
   - Buat user dan berikan akses penuh

2. **Import Schema:**
   - Buka phpMyAdmin
   - Select database `attendance_qr`
   - Import file `database/schema.sql`

### 5. Environment Configuration

Create `.env` file:
```env
PORT=3000
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_USER=yourusername_dbuser
DB_PASSWORD=your_secure_password
DB_NAME=yourusername_attendance_qr
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-production-256-bit
JWT_EXPIRE=7d

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# QR Code Configuration
QR_CODE_EXPIRE_TIME=300000
```

### 6. Start Application

1. **Create startup script** (`start.js`):
   ```javascript
   const { spawn } = require('child_process');
   const path = require('path');
   
   const server = spawn('node', ['server.js'], {
     cwd: __dirname,
     stdio: 'inherit'
   });
   
   server.on('close', (code) => {
     console.log(`Server process exited with code ${code}`);
   });
   ```

2. **Start with PM2** (if available):
   ```bash
   npm install -g pm2
   pm2 start server.js --name "attendance-api"
   pm2 startup
   pm2 save
   ```

## 🎨 Frontend Deployment

### 1. Build Frontend

```bash
cd attendance-qr-system
npm run build
```

### 2. Upload Frontend

1. Compress `dist` folder:
   ```bash
   zip -r frontend.zip dist/*
   ```

2. Upload ke folder `public_html/` atau subdomain folder
3. Extract files

### 3. Configure Environment

Update `dist/assets/index.js` atau create `.env` in build:
```env
VITE_API_URL=https://yourdomain.com/backend/api
```

### 4. Setup Apache/Nginx

Create `.htaccess` for SPA routing:
```apache
RewriteEngine On
RewriteBase /

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

# Cache static assets
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
</FilesMatch>
```

## 🔧 Configuration

### 1. Database Optimization

Add to MySQL configuration:
```sql
-- Optimize for attendance system
SET GLOBAL innodb_buffer_pool_size = 128M;
SET GLOBAL query_cache_size = 64M;
SET GLOBAL max_connections = 200;

-- Create indexes
CREATE INDEX idx_attendance_user_date ON attendance(user_id, date);
CREATE INDEX idx_attendance_status ON attendance(status);
CREATE INDEX idx_qr_sessions_expires ON qr_sessions(expires_at);
```

### 2. Security Configuration

1. **SSL Certificate:**
   - Install Let's Encrypt SSL via cPanel
   - Force HTTPS redirects

2. **Firewall Rules:**
   - Block unnecessary ports
   - Allow only HTTP/HTTPS traffic

3. **API Rate Limiting:**
   Already configured in server.js

## 📱 Mobile Optimization

### 1. PWA Configuration

The app is already configured as PWA with:
- Service Worker
- Offline capability
- Add to homescreen
- Push notifications ready

### 2. QR Scanner Optimization

- Optimized for mobile cameras
- Auto-focus and torch support
- Responsive design

## 🔄 Auto Deployment (Optional)

### 1. GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Niagahoster

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd attendance-qr-system
        npm install
        
    - name: Build frontend
      run: |
        cd attendance-qr-system
        npm run build
        
    - name: Deploy via FTP
      uses: SamKirkland/FTP-Deploy-Action@4.0.0
      with:
        server: your-ftp-server.com
        username: ${{ secrets.FTP_USERNAME }}
        password: ${{ secrets.FTP_PASSWORD }}
        local-dir: ./attendance-qr-system/dist/
        server-dir: /public_html/
```

## 🛠️ Troubleshooting

### Common Issues:

1. **Database Connection Error:**
   - Check DB credentials
   - Verify MySQL service is running
   - Check firewall settings

2. **Node.js Version:**
   - Ensure Node.js 16+ is installed
   - Use `nvm` to manage versions

3. **File Permissions:**
   ```bash
   chmod 755 server.js
   chmod -R 755 uploads/
   ```

4. **Memory Issues:**
   - Increase PHP memory limit
   - Optimize Node.js heap size

### Log Files:

- Backend logs: `backend/logs/`
- Frontend errors: Browser console
- Server logs: cPanel Error Logs

## 📊 Monitoring

### 1. Health Check Endpoint

Backend includes `/api/health` endpoint for monitoring.

### 2. Performance Monitoring

- Use cPanel metrics
- Monitor database queries
- Track API response times

### 3. Backup Strategy

1. **Database Backup:**
   ```bash
   mysqldump -u username -p attendance_qr > backup.sql
   ```

2. **File Backup:**
   - Schedule automatic backups via cPanel
   - Backup uploads folder regularly

## 🔐 Security Checklist

- ✅ SSL Certificate installed
- ✅ Environment variables secured
- ✅ Database credentials encrypted
- ✅ API rate limiting active
- ✅ File upload restrictions
- ✅ CORS properly configured
- ✅ Security headers enabled
- ✅ Regular updates scheduled

## 📞 Support

Untuk bantuan deployment:
1. Dokumentasi Niagahoster
2. Community support
3. GitHub Issues

---

**✨ Sistem Absensi QR siap production dengan UI/UX yang sangat menarik dan fitur lengkap!**

## 🎯 Features Overview

### ✅ Completed Features:

1. **🔐 Authentication System**
   - JWT-based login/register
   - Role management (Admin/User)
   - Password encryption

2. **📱 QR Code System**
   - Dynamic QR generation
   - Session-based scanning
   - Expiring QR codes
   - Mobile-optimized scanner

3. **👤 User Management**
   - Profile management
   - Face registration ready
   - 3D ID Card with animations

4. **📊 Dashboard**
   - Real-time statistics
   - 3D animations and effects
   - Glassmorphism design
   - Fully responsive

5. **📈 Attendance Tracking**
   - Check-in/Check-out
   - Late detection
   - Status management
   - History tracking

6. **📋 Admin Panel**
   - QR code generation
   - System monitoring
   - User management
   - Statistics overview

7. **📄 Export Features**
   - PDF reports
   - Excel spreadsheets
   - Filtered exports
   - Beautiful formatting

8. **🎨 UI/UX Design**
   - Dark theme with gradients
   - Framer Motion animations
   - 3D effects and glassmorphism
   - Fully responsive design
   - Modern and futuristic look

### 🚀 Ready for Production:
- Backend API with Express.js
- MySQL database with proper schema
- Frontend with React + Vite
- TailwindCSS for styling
- Security best practices
- Production-ready configuration