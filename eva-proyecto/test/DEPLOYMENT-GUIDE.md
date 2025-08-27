# 🚀 EVA Project - Complete Deployment Guide

## 📋 Overview

This guide provides step-by-step instructions for deploying the EVA project with the complete **Role Management System** and **SECOP Integration** to production.

## ✅ Pre-Deployment Checklist

### System Requirements
- [ ] PHP 8.1+ with required extensions
- [ ] Node.js 18+ and npm/yarn
- [ ] MySQL 8.0+ or MariaDB 10.4+
- [ ] Redis (recommended for caching)
- [ ] Web server (Apache/Nginx)
- [ ] SSL certificate for HTTPS

### Code Validation
- [ ] Run `php FINAL-SYSTEM-VALIDATION.php` (should show 90%+ success rate)
- [ ] Run `php test-role-system.php` (should pass all tests)
- [ ] Run `php test-secop-integration.php` (should show integration working)
- [ ] Frontend builds without errors
- [ ] All tests pass

## 🔧 Backend Deployment

### 1. Environment Configuration

Create `.env` file with production settings:

```env
# Application
APP_NAME="EVA System"
APP_ENV=production
APP_KEY=base64:YOUR_32_CHARACTER_SECRET_KEY
APP_DEBUG=false
APP_URL=https://your-domain.com

# Database
DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_PORT=3306
DB_DATABASE=eva_production
DB_USERNAME=eva_user
DB_PASSWORD=your-secure-password

# Cache & Sessions
CACHE_DRIVER=redis
SESSION_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# File Storage
FILESYSTEM_DISK=public
AWS_BUCKET=your-s3-bucket  # If using S3

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls

# SECOP Integration
SECOP_API_URL=https://www.datos.gov.co/resource/xvdy-vvsk.json
SECOP_CACHE_TTL=1800  # 30 minutes

# Security
SANCTUM_STATEFUL_DOMAINS=your-frontend-domain.com
SESSION_DOMAIN=.your-domain.com
```

### 2. Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE eva_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'eva_user'@'localhost' IDENTIFIED BY 'your-secure-password';
GRANT ALL PRIVILEGES ON eva_production.* TO 'eva_user'@'localhost';
FLUSH PRIVILEGES;

# Run migrations
php artisan migrate --force

# Seed initial data (if needed)
php artisan db:seed --force
```

### 3. File Permissions

```bash
# Set proper permissions
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
chown -R www-data:www-data storage/
chown -R www-data:www-data bootstrap/cache/

# Create upload directories
mkdir -p storage/app/public/ordenes_compra
chmod -R 775 storage/app/public/ordenes_compra
chown -R www-data:www-data storage/app/public/ordenes_compra
```

### 4. Optimization Commands

```bash
# Clear and cache configurations
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Create symbolic link for storage
php artisan storage:link

# Install dependencies
composer install --no-dev --optimize-autoloader
```

## 🎨 Frontend Deployment

### 1. Environment Configuration

Create `.env.production` file:

```env
REACT_APP_API_URL=https://your-api-domain.com/api/v1
REACT_APP_APP_NAME=EVA System
REACT_APP_VERSION=1.0.0
GENERATE_SOURCEMAP=false
```

### 2. Build Process

```bash
# Install dependencies
npm install --production

# Build for production
npm run build

# Deploy build files to web server
# Copy build/* to your web server document root
```

## 🌐 Web Server Configuration

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    root /var/www/eva-frontend/build;
    index index.html;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API routes
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # File uploads
    client_max_body_size 10M;
}

# Backend API server
server {
    listen 8000;
    server_name localhost;
    root /var/www/eva-backend/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

## 🔒 Security Configuration

### 1. SSL/TLS Setup

```bash
# Using Let's Encrypt
certbot --nginx -d your-domain.com
```

### 2. Firewall Configuration

```bash
# UFW configuration
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 3. Security Headers

Add to Nginx configuration:

```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

## 📊 Monitoring & Logging

### 1. Application Monitoring

```bash
# Set up log rotation
sudo nano /etc/logrotate.d/eva-system

/var/www/eva-backend/storage/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 www-data www-data
}
```

### 2. Performance Monitoring

```bash
# Install monitoring tools
apt install htop iotop nethogs

# Set up cron jobs for system health
crontab -e

# Add health check every 5 minutes
*/5 * * * * curl -f https://your-domain.com/api/health || echo "API Down" | mail -s "EVA API Alert" admin@your-domain.com
```

## 🧪 Post-Deployment Testing

### 1. System Validation

```bash
# Run comprehensive validation
php FINAL-SYSTEM-VALIDATION.php

# Expected output: 90%+ success rate
```

### 2. Feature Testing Checklist

#### Role Management System
- [ ] User login with different roles
- [ ] Dynamic navbar based on permissions
- [ ] Permission-based API access
- [ ] New user registration with default permissions

#### SECOP Integration
- [ ] SECOP API connectivity
- [ ] Process search and filtering
- [ ] Purchase order creation with SECOP data
- [ ] File upload functionality
- [ ] Equipment association

### 3. Performance Testing

```bash
# Test API response times
curl -w "@curl-format.txt" -o /dev/null -s "https://your-domain.com/api/secop/consultar"

# Expected: < 2 seconds response time
```

## 🔄 Maintenance & Updates

### 1. Regular Maintenance Tasks

```bash
# Weekly maintenance script
#!/bin/bash
# Clear expired cache
php artisan cache:clear

# Optimize database
php artisan optimize

# Clean old logs
find storage/logs/ -name "*.log" -mtime +30 -delete

# Update composer dependencies (staging first)
composer update --no-dev
```

### 2. Backup Strategy

```bash
# Database backup
mysqldump -u eva_user -p eva_production > backup_$(date +%Y%m%d_%H%M%S).sql

# File backup
tar -czf files_backup_$(date +%Y%m%d_%H%M%S).tar.gz storage/app/public/
```

## 🚨 Troubleshooting

### Common Issues

1. **SECOP API not responding**
   - Check external API status
   - Verify network connectivity
   - Check cache configuration

2. **Permission system not working**
   - Verify database permissions
   - Check middleware registration
   - Clear application cache

3. **File uploads failing**
   - Check directory permissions
   - Verify disk space
   - Check PHP upload limits

### Debug Commands

```bash
# Check application status
php artisan about

# View logs
tail -f storage/logs/laravel.log

# Test database connection
php artisan tinker
>>> DB::connection()->getPdo();
```

## 📞 Support Contacts

- **System Administrator**: admin@your-domain.com
- **Development Team**: dev@your-domain.com
- **Emergency Contact**: +1-xxx-xxx-xxxx

---

## 🎯 Deployment Checklist Summary

- [ ] Environment configured
- [ ] Database migrated and seeded
- [ ] File permissions set
- [ ] SSL certificate installed
- [ ] Web server configured
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] All tests passing
- [ ] Performance validated
- [ ] Security headers configured

**Status**: ✅ Ready for Production Deployment  
**Last Updated**: 2025-01-27  
**Version**: 1.0.0
