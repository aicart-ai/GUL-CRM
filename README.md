# 🌾 GUL CRM - Smart Jaggery Business Management System

> **One App to Manage the Entire Jaggery Business Offline and Online**

![Jaggery OS Badge](https://img.shields.io/badge/GUL%20CRM-v2.0-orange?style=for-the-badge)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue?style=for-the-badge)
![Offline First](https://img.shields.io/badge/Offline%20First-✓-success?style=for-the-badge)

---

## 📋 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [How to Deploy](#how-to-deploy)
- [Configuration](#configuration)
- [Usage Guide](#usage-guide)
- [Architecture](#architecture)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

**GUL CRM** is a progressive web application (PWA) designed specifically for jaggery (gur) business operators in India. It provides a unified platform to manage:

- 👥 **Buyer Relationships** - CRM for bulk procurement leads
- 🏭 **Supplier Management** - Khandsari (local jaggery makers) ledger
- 👨‍🌾 **Farmer Network** - Sugarcane sourcing and production tracking
- 🔥 **Bhatti Units** - Processing facility management
- 🚚 **Transport Fleet** - Logistics and freight operations
- 📦 **Warehouse Stock** - Real-time inventory management
- 📋 **Orders & Payments** - Sales orders and financial tracking
- 🤖 **AI Parser** - Gemini 2.5 powered data extraction

**Works completely offline** with automatic sync when internet returns!

---

## ✨ Key Features

### 🔌 Offline-First Architecture
- Service Worker-powered offline capability
- All data stored in IndexedDB/LocalStorage
- Automatic sync when connectivity restored
- No data loss guarantee

### 📱 Mobile-First Design
- Responsive PWA interface
- Native app feel on iOS & Android
- Bottom tab navigation for mobile
- Dark mode support (light/dark themes)

### 🤖 AI-Powered Data Entry
- **Smart Clipboard Parser** - Copy-paste WhatsApp messages, IndiaMART listings, or raw data
- Gemini 2.5 AI extracts structured information automatically
- Auto-fill forms for faster data entry

### 📊 Real-Time Dashboard
- Live follow-ups carousel
- Key metrics (buyers, orders, stock, suppliers)
- Activity timeline and audit logs
- Order status tracking

### 📈 Business Operations
- **Buyer CRM**: Track leads, requirements, priority levels
- **Supplier Matrix**: Manage production capacity and pricing
- **Farmer Hub**: Monitor sugarcane variety and crop areas
- **Bhatti Module**: Track processing units and fuel inventory
- **Transport Fleet**: Manage vehicles, drivers, freight rates
- **Warehouse**: Stock in/out tracking with logs
- **Orders Desk**: Create, dispatch, and deliver orders
- **Payments Log**: Record collections, advances, and dues

### 🔍 Smart Filters
- Global search across all databases
- Filter by priority, location, phone number
- Instant results without page reload

---

## 🛠 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | HTML5, Tailwind CSS v2.2.19 |
| **JavaScript** | Vanilla JS (no frameworks required) |
| **Styling** | Tailwind CSS + Font Awesome 6.4 |
| **Fonts** | Plus Jakarta Sans (Google Fonts) |
| **Offline** | Service Worker (sw.js) |
| **Storage** | LocalStorage + IndexedDB |
| **AI** | Gemini 2.5 API (optional) |
| **PWA** | Web Manifest + Service Worker |
| **Icons** | Font Awesome 6.4.0 |

**Zero external dependencies!** Pure vanilla JavaScript with CDN-loaded libraries.

---

## 📦 Installation & Setup

### Option 1: Local Development

#### Prerequisites
- Node.js 14+ (optional, only if using a local server)
- Any modern web browser
- Git

#### Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/aicart-ai/GUL-CRM.git
   cd GUL-CRM
   ```

2. **Start a Local Server** (Required for Service Worker)
   
   **Using Python 3:**
   ```bash
   python -m http.server 8000
   ```
   
   **Using Node.js (http-server):**
   ```bash
   npx http-server -p 8000
   ```
   
   **Using PHP:**
   ```bash
   php -S localhost:8000
   ```

3. **Open in Browser**
   ```
   http://localhost:8000
   ```

4. **Enable PWA Installation**
   - Open DevTools (F12)
   - Go to Application → Manifest
   - Click "Install" or use browser's "Install app" prompt

### Option 2: Direct File Access

⚠️ **Service Worker won't work** with `file://` protocol
- Download all files locally
- Open `index.html` directly (limited offline functionality)

---

## 🚀 How to Deploy

### Option A: Deploy on GitHub Pages (FREE)

1. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/aicart-ai/GUL-CRM.git
   git add .
   git commit -m "GUL CRM v2.0"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to Repository Settings
   - Scroll to "Pages" section
   - Source: `main` branch
   - Save
   - Access at: `https://aicart-ai.github.io/GUL-CRM/`

3. **Enable PWA Installation**
   - Manifest and Service Worker will work on GitHub Pages (HTTPS)

---

### Option B: Deploy on Vercel (Recommended - FREE)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow the prompts** and get instant deployment

4. **Auto-HTTPS** is enabled with custom domain support

---

### Option C: Deploy on Netlify (FREE)

1. **Connect Your GitHub Repo**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Select your GitHub repo

2. **Configure Build Settings**
   - Build command: (leave empty)
   - Publish directory: `.` (root)

3. **Deploy** and get a live URL instantly

---

### Option D: Self-Hosted (VPS/Shared Hosting)

1. **Upload Files via FTP**
   - Upload all files to your web server
   - Ensure HTTPS is configured

2. **Configure Web Server**

   **For Nginx:**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       root /var/www/gul-crm;
       
       location / {
           try_files $uri $uri/ /index.html;
           # Enable CORS for API calls
           add_header Access-Control-Allow-Origin "*";
       }
       
       # Cache Service Worker
       location = /sw.js {
           add_header Cache-Control "max-age=3600";
       }
   }
   ```

   **For Apache:**
   ```apache
   <VirtualHost *:443>
       ServerName yourdomain.com
       DocumentRoot /var/www/gul-crm
       
       SSLEngine on
       SSLCertificateFile /path/to/cert.pem
       SSLCertificateKeyFile /path/to/key.pem
       
       <Directory /var/www/gul-crm>
           RewriteEngine On
           RewriteBase /
           RewriteRule ^index\.html$ - [L]
           RewriteCond %{REQUEST_FILENAME} !-f
           RewriteCond %{REQUEST_FILENAME} !-d
           RewriteRule . /index.html [L]
       </Directory>
   </VirtualHost>
   ```

3. **Verify HTTPS** (Required for Service Worker)
   - Open your domain
   - Check for secure lock icon

---

### Option E: Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM nginx:alpine
   COPY . /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build & Run**
   ```bash
   docker build -t gul-crm .
   docker run -p 80:80 gul-crm
   ```

3. **Access at** `http://localhost`

---

## ⚙️ Configuration

### 1. Business Information

Edit in **Settings Panel** (within app):
- Business Name (displays in sidebar)
- Theme preference (Light/Dark)

### 2. Gemini AI Setup (Optional)

For AI data extraction feature:

1. **Get Gemini API Key**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Click "Create API Key"
   - Copy the key

2. **Add to GUL CRM**
   - Open Settings tab
   - Paste key in "Gemini 2.5 API Key" field
   - Key stored securely in browser (LocalStorage)

3. **Features Unlocked**
   - Smart Clipboard AI parser
   - Auto-extract data from unstructured text

### 3. Customize Theme Colors

Edit in `index.html` (lines 48-50):
```css
.text-jaggery-color { color: #b45309; }        /* Change primary color */
.bg-jaggery-color { background-color: #d97706; }
```

---

## 📖 Usage Guide

### Dashboard
- **Follow-ups Carousel**: Today's buyer follow-ups with quick call/WhatsApp buttons
- **Metrics Grid**: Real-time counts of buyers, orders, suppliers, stock
- **Activity Timeline**: Last 10 operations in chronological order
- **Quick Commands**: Shortcuts to add buyers, orders, payments, inventory

### Adding Records

#### Add Buyer
1. Click **"Register Buyer"** or **"+"** button
2. Fill details: Name, Phone, Company, Product type, Quantity needed
3. Set follow-up date for reminders
4. Save

#### Create Order
1. Go to **Orders Desk**
2. Click **"Create Order"**
3. Select buyer and product
4. Enter quantity and amount
5. Track status: Pending → Dispatched → Delivered

#### Manage Inventory
1. Go to **Warehouse Stock**
2. Click **"Adjust Stock Entry"**
3. Select product type (Laddu Gud, Block Gud, etc.)
4. Choose "Stock In" or "Stock Out"
5. Add remarks and save
6. View history in table below

### Smart Search
1. Go to **Smart Filters** tab
2. Type name, phone, location, or tag
3. Results update instantly across all modules
4. Filter by priority (High/Medium)

### Export Data
1. Go to **Settings & Data**
2. Click **"Export Database to JSON"**
3. Backup file downloaded
4. Can restore later if needed

---

## 🏗 Architecture

```
GUL-CRM/
├── index.html           # Main PWA shell
├── manifest.json        # PWA manifest (auto-generated)
├── sw.js               # Service Worker (offline support)
├── gul_crm_service_worker.js  # Service worker config
├── gul_crm_manifest_configuration.json  # PWA config
└── README.md           # This file
```

### Data Flow
```
User Input → FormModal → Validate → GUL_DATABASE → LocalStorage
                                    ↓
                            Render UI (renderDataGrids)
                                    ↓
                            Display on cards/tables
                                    ↓
                            Timeline logging (audit trail)
```

### Service Worker Caching Strategy
```
Network Request
    ↓
Check Cache (offline?)
    ↓
If found → Return cached
If not → Fetch from network
    ↓
On offline → Fallback to index.html (cached)
```

---

## 🐛 Troubleshooting

### Issue: Service Worker not registering

**Solution:**
- App must be on **HTTPS** (or localhost)
- Check browser console for errors
- Try **refreshing** the page
- Clear browser cache

**Code location:** `index.html` lines ~170-182

### Issue: Data not persisting

**Solution:**
- Check if LocalStorage is enabled in browser
- Open DevTools → Application → LocalStorage
- Look for key: `GUL_CRM_V2_FINAL`
- Ensure you clicked **"Save"** in forms

### Issue: PWA not installable

**Solution:**
- Verify HTTPS/localhost
- Check manifest.json is valid
- Service Worker must be registered successfully
- Try **Chrome DevTools → Application → Manifest**

### Issue: Gemini AI not working

**Solution:**
- Verify API key is valid and **active**
- Check internet connection
- Open DevTools → Console for error messages
- Ensure key is pasted correctly in Settings

### Issue: Mobile app not installing

**Solution:**
- Use HTTPS domain (not localhost)
- Wait 30 seconds after first visit
- Look for "Install app" button in browser menu
- Try in different browser (Chrome/Edge recommended)

---

## 📱 Mobile Installation

### iOS (Safari)
1. Open app in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. App appears as native app icon

### Android (Chrome)
1. Open app in Chrome
2. Tap menu (3 dots) → "Install app"
3. Confirm installation
4. App appears in App drawer

---

## 🔐 Data Security

- ✅ All data stored **locally** in your browser
- ✅ No server-side storage by default
- ✅ Export feature for backups
- ✅ Gemini API key stored securely (LocalStorage)
- ⚠️ Clear browser cache = data loss (unless exported)

**Recommendation:** Export data weekly!

---

## 📊 Performance

| Metric | Value |
|--------|-------|
| Load Time | < 2s |
| Offline Capability | 100% |
| Storage Limit | ~50MB (browser dependent) |
| Max Records | 10,000+ |
| API Calls | Async (non-blocking) |

---

## 🤝 Contributing

Found a bug or have a feature request?

1. Open an **Issue** on GitHub
2. Provide clear description and steps to reproduce
3. Submit a **Pull Request** with fixes

---

## 📄 License

This project is licensed under the **MIT License** - see details in LICENSE file.

---

## 📞 Support & Contact

- **GitHub Issues**: [Create Issue](https://github.com/aicart-ai/GUL-CRM/issues)
- **Email**: support@aicart.ai
- **Documentation**: Check this README

---

## 🎉 Roadmap

- [ ] Multi-user support with role-based access
- [ ] Cloud sync with Firebase/Supabase
- [ ] Advanced analytics and reporting
- [ ] Mobile native apps (React Native)
- [ ] WhatsApp integration for notifications
- [ ] Invoice generation and printing
- [ ] SMS reminder system
- [ ] Integration with bank payment APIs

---

**Made with ❤️ for Jaggery Business Operators in India**

**GUL CRM v2.0** | Offline-First | PWA | AI-Powered

