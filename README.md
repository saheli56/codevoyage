# ScamShield

ScamShield is an open-source, multi-signal fraud defense and cyber threat intelligence application for mobile and web. It analyzes suspicious SMS, WhatsApp notifications, URLs, and payment vectors in real time to prevent financial fraud and credential theft.

---

## Key Features

- **Multi-Signal Threat Engine**: Evaluates high-pressure coercion, banking impersonation, credential harvesting, and regional scam patterns (e.g., electricity disconnection notices, fake KYC alerts).
- **Multi-Hop Redirect Unroller**: Traces shortened and disguised URLs (e.g., `bit.ly`, `tinyurl.com`) across intermediate HTTP 301/302 redirects to audit the final destination domain.
- **VirusTotal Multi-Engine Reputation**: Integrates VirusTotal API v3 with heuristic fallbacks for lexical typosquatting and high-risk TLD analysis.
- **Background Interception**: Android BroadcastReceiver (`SMS_RECEIVED`) and NotificationListenerService for real-time threat interception with graceful clipboard fallbacks in Expo Go.
- **Payment & UPI VPA Risk Simulator**: Assesses payment amounts, new beneficiary risk, and deceptive handle keywords before fund transfers.
- **1930 Emergency Response Kit**: Integrated quick-dialer for India's National Cyber Crime Helpline (`1930`) and a step-by-step incident response checklist to freeze compromised accounts.
- **Community Threat Intelligence**: Decentralized reporting feed with verification statuses and confirmation metrics.
- **Web SOC Dashboard**: Standalone Security Operations Center interface with telemetry graphs, moderation queue, and target distribution charts.

---

## Architecture

ScamShield uses a hybrid local-first and microservice architecture:

```
├── mobile/ (React Native & Expo SDK 52+)
│   ├── src/app/             # Expo Router screen navigation
│   ├── src/services/        # Threat engine, OCR, and storage layer
│   ├── src/components/ui/   # Design system components
│   └── modules/             # Local native Android Kotlin interceptor
├── backend/ (FastAPI)
│   ├── main.py              # Cloud threat API, redirect resolver, OCR
│   └── requirements.txt     # Python backend dependencies
└── web/
    └── index.html           # Standalone SOC Operations Dashboard
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (3.10+) for the backend
- Expo CLI (`npx expo`)

### 1. Mobile & Web Frontend Setup

```bash
# Install dependencies
npm install

# Start the Expo development server
npx expo start -c
```

- Press `w` to open in your browser.
- Press `a` or scan the QR code to run in Expo Go on Android.

### 2. Custom Native Dev Build (For Native SMS & Notification Interception)

```bash
# Build and install the Android custom dev client
npx expo run:android
```

### 3. FastAPI Backend Setup (Optional)

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

The interactive API documentation is available at `http://localhost:8000/docs`.

---

## Configuration

Set environment variables in a `.env` file at the root:

```env
VIRUSTOTAL_API_KEY=your_64_character_virustotal_api_key
EXPO_PUBLIC_BACKEND_URL=http://localhost:8000
```

---

## Quality Assurance & Verification

```bash
# Run TypeScript compilation check
npx tsc --noEmit

# Run ESLint
npx expo lint

# Run backend tests
cd backend && pytest
```

---

## License

This project is licensed under the MIT License.
