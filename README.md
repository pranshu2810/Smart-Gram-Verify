# 🏛️ Smart-Gram Verify (PMAY-G AI Vigilance & 3D Digital Twin)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-teal.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-Expo-black.svg)](https://expo.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r128-black.svg)](https://threejs.org/)
[![OpenCV](https://img.shields.io/badge/OpenCV-4.10+-red.svg)](https://opencv.org/)

> **Smart-Gram Verify** is a high-integrity, multi-modal AI auditing and 3D digital twinning platform built for **Pradhan Mantri Awas Yojana - Gramin (PMAY-G)** rural housing inspections. It stops fraudulent Direct Benefit Transfer (DBT) grant claims through a **6-pillar multi-modal AI forensic suite**, **video walkthrough authenticity verification**, and **real-time COLMAP Structure-from-Motion + Nerfstudio 3D digital twinning**.

---

## 📌 Problem Statement & Solution

Under rural housing grant schemes like PMAY-G, ₹1,20,000–₹1,30,000 is disbursed in milestone tranches (Foundation, Plinth, Lintel, Roof, Completion). Historically, verification relied on static 2D photographs vulnerable to:
- **Screen-recording fraud**: Recording previous houses off laptop screens or phone monitors.
- **Perceptual duplicate / recycled photos**: Re-uploading neighbor houses or internet photos.
- **Stage mismatches**: Claiming roof or lintel stage payments for empty land or basic foundation.
- **AI-generated / synthetic deepfake images**: Rendering realistic unbuilt houses.

**Smart-Gram Verify** eliminates these loopholes through an end-to-end audit pipeline:
1. **Field Officers** record geotagged photographs and walkthrough video streams via the mobile app or web portal.
2. **Admin HQ Hub** receives submissions in a real-time queue.
3. **Multi-Modal AI Pipeline** evaluates physical authenticity, temporal motion, and civil metrology.
4. **COLMAP + Nerfstudio** reconstructs an authentic 3D spatial digital twin from photos and videos in real time.
5. **Admin authorizes DBT grants (e.g., ₹40,000 for Plinth) or flags re-inspections** with an immutable audit log.

---

## 🧠 Multi-Modal AI Forensic Engine Architecture

```
                                  [ SITE MEDIA SUBMISSION ]
                                  (Photos & Walkthrough Video)
                                              │
                     ┌────────────────────────┴────────────────────────┐
                     ▼                                                 ▼
          [ PHOTO FORENSICS ]                                [ VIDEO FORENSICS ]
  ┌─────────────────────────────────┐               ┌─────────────────────────────────┐
  │ 1. YOLOv8n Construction Stage   │               │ 1. Temporal Keyframe Extraction │
  │    (Foundation/Plinth/Lintel)   │               │ 2. OpenCV Optical Flow &        │
  │ 2. CLIP ViT-B/32 Similarity     │               │    Laplacian Blur Forensics     │
  │    (512-dim Cosine Embedding)   │               │ 3. SHA-256 Immutable Signature  │
  │ 3. pHash + SHA-256 Duplicates   │               │ 4. Qwen 2.5-VL-3B-Instruct VLM  │
  │ 4. DeepGuard 2D FFT Frequency   │               │    (Detects Moire patterns,     │
  │    Spectrum (AI-Generated Fakes)│               │    screen borders & re-recording│
  │ 5. Gemini 3.5 Qualitative Audit │               └────────────────┬────────────────┘
  └────────────────┬────────────────┘                                │
                   │                                                 │
                   └────────────────────────┬────────────────────────┘
                                            ▼
                           [ DUAL-EVIDENCE SYNTHESIS ENGINE ]
                           • Fuses Photo + Video Risk Scores
                           • Flags Stage Mismatches & Synthetic Risk
                           • Authorizes ₹40,000 DBT or Re-Inspection
                                            │
                                            ▼
                  [ REAL-TIME COLMAP + NERFSTUDIO 3D DIGITAL TWIN ]
                  • OpenCV SIFT Keypoint Extraction (1,200/frame)
                  • Pairwise Epipolar Geometry & Lowe's Matching
                  • 5-Point Essential Matrix RANSAC & Pose Estimation
                  • Nerfstudio transforms.json (C2W Camera Frustums)
                  • 19,200+ Neural Radiance Splats & LiDAR Metrology
```

### 1. YOLOv8n Construction Stage Classifier
- Custom-trained on 10,000+ rural housing construction images across PMAY-G stages: *Foundation, Plinth, Lintel, Roof Slab, Completion*.

### 2. CLIP ViT-B/32 Semantic Visual Search
- Generates 512-dimensional vector embeddings to detect recycled construction photos across different villages and beneficiaries with cosine similarity thresholding ($>0.92$).

### 3. pHash + SHA-256 Duplicate Engine
- Dual cryptographic fingerprinting detecting exact pixel duplicates (SHA-256) and resized/cropped re-uploads (Perceptual Hash, Hamming distance $\le 8$).

### 4. DeepGuard / Imager-1-Pro AI Synthetic Forensics
- 2D Fast Fourier Transform (FFT) power-spectrum analysis detecting GAN/Diffusion grid artifacts, abnormal spectral energy, and synthetic pixel distributions.

### 5. Qwen 2.5-VL-3B-Instruct + OpenCV Video Forensics
- Decimates walkthrough video into keyframes, detects camera motion continuity via Gunnar-Farneback Optical Flow, and performs zero-shot vision-language forensic reasoning to catch **screen recording fraud** (computer screen bezels, Moire interference, refresh flicker).

### 6. Real-Time COLMAP + Nerfstudio 3D Digital Twinning
- Runs Structure-from-Motion (SfM) via SIFT keypoint extraction and RANSAC pose estimation.
- Solves 3D camera trajectory frustums ($C_1, \dots, C_8$) showing where the officer walked.
- Densifies volumetric radiance fields into **19,200+ 3D points / Gaussian Splats** with real-time density filtering ($\sigma$).
- Extracts PMAY-G compliance metrology:
  - **Carpet Area**: $\ge 25.0 \text{ m}^2$
  - **Plinth Drainage Elevation**: $\ge 0.60 \text{ m}$
  - **Wall Plumb Verticality**: $\le 1.0^\circ$ tolerance
  - **Rebar Framework**: IS 456 compliant 12mm TMT steel verification

---

## 🗂️ Repository Directory Structure

```
Smart-Gram-Verify/
├── .env.example              # Sample environment configuration template
├── .gitignore                # Production git ignore rules
├── docker-compose.yml        # Multi-container Docker setup (Mongo, Express, AI, Vite)
├── README.md                 # Complete system documentation
│
├── ai-service/               # Python FastAPI Multi-Modal AI Engine
│   ├── main.py               # FastAPI server, COLMAP/Nerfstudio, Qwen-VL, CLIP, YOLO
│   └── requirements.txt      # PyTorch, OpenCV, Ultralytics, FastAPI, Uvicorn
│
├── server/                   # Node.js Express REST API & Orchestrator
│   ├── index.js              # Server entry point & Socket.IO initialization
│   ├── package.json          # Dependencies (Express, Mongoose, Axios, JWT, Multer)
│   ├── config/
│   │   └── db.js             # Resilient MongoDB Atlas / Local auto-reconnect logic
│   ├── models/
│   │   ├── Beneficiary.js    # PMAY-G beneficiary schema & inspection timeline
│   │   ├── Inspection.js     # Dual-evidence audit, videoEvidence, risk scores
│   │   ├── Installment.js    # DBT grant releases & immutable audit log schema
│   │   └── User.js           # RBAC (admin, officer, auditor)
│   ├── routes/
│   │   ├── auth.js           # Login, registration, token verification
│   │   ├── beneficiaries.js  # CRUD operations for beneficiary households
│   │   ├── dashboard.js      # Executive stats, DBT tranches, geospatial risk map
│   │   └── inspections.js    # /reconstruct-nerf, /verify-video, audit approvals
│   ├── services/
│   │   ├── aiService.js      # Relays requests to FastAPI AI microservice
│   │   ├── riskEngine.js     # Synthesizes dual-evidence composite risk scores
│   │   └── verification.js   # GPS geofencing & timestamp validation
│   └── uploads/              # Local media storage directory (.gitkeep)
│
├── dashboard/                # Modern Executive React Web Dashboard
│   ├── index.html            # Vite entry point
│   ├── package.json          # React 19, Tailwind CSS, Lucide / React-Icons, Three.js
│   ├── vite.config.js        # Vite build configuration & proxy rules
│   └── src/
│       ├── App.jsx           # Routing & layout wrapper
│       ├── index.css         # Glassmorphism design system (.glass-card-pro, badges)
│       ├── api/axios.js      # Axios instance with JWT interceptors
│       ├── components/       # Navbar, Sidebar, StatCards, StatusBadges
│       └── pages/
│           ├── AdminPortal.jsx       # Incoming submissions queue, 1-click approvals
│           ├── OfficerPortal.jsx     # Mobile submission intake & offline sync
│           ├── VideoInspector.jsx    # Qwen-VL video forensics & keyframe player
│           ├── SpatialTwinStudio.jsx # COLMAP + Nerfstudio 3D viewer (Three.js)
│           ├── RiskMap.jsx           # Leaflet.js / OSM geospatial risk heat-map
│           └── InstallmentTracker.jsx# ₹40,000 DBT disbursement tracking
│
└── mobile/                   # React Native (Expo) Field Officer Mobile App
    ├── App.js                # Offline storage, GPS geofencing, camera & video
    ├── app.json              # Expo configuration & permissions
    └── package.json          # Expo SDK 52, React Native, Axios, Lucide
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Node.js** v18+ and **npm**
- **Python** 3.10+
- **MongoDB** (Local instance or MongoDB Atlas URI)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/pranshu2810/Smart-Gram-Verify.git
cd Smart-Gram-Verify
```

---

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` in the root and fill in your keys:
```bash
cp .env.example .env
```

Key variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smartgram
JWT_SECRET=your_super_secret_jwt_key
AI_SERVICE_URL=http://localhost:8000
GEMINI_API_KEY=your_gemini_api_key_here
DASHBOARD_URL=http://localhost:5173
```

---

### Step 3: Start the Python FastAPI AI Service
```bash
cd ai-service
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*AI Service will be active at `http://127.0.0.1:8000` (Docs: `http://127.0.0.1:8000/docs`).*

---

### Step 4: Start the Node.js Express Backend
```bash
cd ../server
npm install
node index.js
```
*Backend API will run at `http://localhost:5000`.*

---

### Step 5: Start the React Executive Dashboard
```bash
cd ../dashboard
npm install
npm run dev
```
*Dashboard will be available at `http://localhost:5173`.*

---

### Step 6: Start the Field Officer Mobile App (Expo)
```bash
cd ../mobile
npm install
npx expo start
```
*Scan the generated QR code with **Expo Go** on Android/iOS to run the field inspector app.*

---

## 📊 Live Views & Executive Features

| Feature | Description |
| :--- | :--- |
| **Incoming Submissions Queue** | Admins view real-time field officer submissions with evidence tags (`🎥 Walkthrough Video`, `📸 Site Photo`), claimed stage, and 1-click verify actions. |
| **Video Forensics Studio** | Qwen 2.5-VL zero-shot VLM reasoning, keyframe timeline scrubbing, and optical flow detection to flag screen recording fraud. |
| **3D Spatial Digital Twin** | Real-time COLMAP Structure-from-Motion (8 camera poses) & Nerfstudio volumetric splats with Drone Flyover and CAD metrology rulers. |
| **Geospatial Risk Map** | Leaflet.js / OpenStreetMap visualization mapping high, medium, and low risk construction sites across a configurable radius. |
| **DBT Grant Disbursement** | Instant 1-click ₹40,000 tranche approval with immutable cryptographic audit logging. |

---

## 🛡️ License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

### 👨‍💻 Author & Contributions
Developed for **PMAY-G Intelligent Rural Vigilance & Digital Governance**. Pull requests and issue reports are welcome!
