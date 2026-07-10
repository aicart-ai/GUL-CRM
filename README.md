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
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

**GUL CRM** is a progressive web application (PWA) frontend for managing jaggery (gur) business operations. This repository contains the static client-side app (HTML/CSS/JS) and PWA support files.

The repository includes:

- index.html — the app shell (open this to run the app)
- style.css — app styles
- script.js — main JavaScript logic
- manifest.json — PWA manifest
- sw.js — service worker for offline caching
- gur-crm.zip — optional distributable archive

This app is offline-first and can be installed as a PWA on supported browsers.

---

## ✨ Key Features

- Offline-first with Service Worker caching
- Local data storage (LocalStorage / IndexedDB)
- Mobile-first responsive UI
- PWA installable (manifest + service worker)
- Simple zero-dependency vanilla JavaScript

---

## 🛠 Tech Stack

- Frontend: HTML5, CSS
- JavaScript: Vanilla ES6
- PWA: manifest.json + sw.js
- Storage: LocalStorage / IndexedDB

---

## 📦 Run locally (recommended)

This project must be served over HTTP(S) for the service worker and PWA features to work. Do not rely on file:// if you want full functionality.

1. Clone the repo:

   git clone https://github.com/aicart-ai/GUL-CRM.git
   cd GUL-CRM

2. Serve with a simple HTTP server:

   - Python 3:
     python -m http.server 8000

   - Node (http-server):
     npx http-server -p 8000

3. Open in browser: http://localhost:8000

If you open index.html with file://, the service worker will not register and some features will be limited.

---

## 🚀 Deploy to GitHub Pages

If GitHub Pages is showing the README.md instead of your app, check the following:

1. Repository → Settings → Pages: verify the Source branch is `main` and the folder is `/ (root)`.
2. If Pages is set to `docs/`, move `index.html` into `docs/` or change the source to root.
3. Wait a few minutes after changing Pages settings; caching can cause delays.

The site should be available at: https://aicart-ai.github.io/GUL-CRM/

---

## ⚙️ Troubleshooting

- README.md shows instead of app:
  - Ensure Pages source points to the branch and folder where index.html resides.
  - Confirm index.html exists in the selected folder.
  - Check the repository branch you published contains index.html.

- Service worker not registering:
  - Serve site over HTTPS or localhost.
  - Open DevTools → Application → Service Workers and inspect errors.

- Data not persisting:
  - Check DevTools → Application → LocalStorage / IndexedDB for keys

---

## 📞 Support

If you want, I can:
- Push this updated README.md to the repository now (commit message: "Update README.md with accurate run & deploy instructions"),
- Or modify the README content (language, screenshots, shorter/longer) before committing.

Batayein main ab commit kar dun?