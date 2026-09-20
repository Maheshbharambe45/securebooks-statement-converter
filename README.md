# Secure Books — Direct-to-Outlook Bookkeeping Document Submission Portal

![Secure Books Logo](./frontend/public/logo.png)

A professional, enterprise-grade UK bookkeeping document submission website for **Secure Books** ([https://www.securebooks.co.uk](https://www.securebooks.co.uk) / `info@securebooks.co.uk`).

This web application allows UK bookkeeping clients to securely upload sensitive financial documents (bank statements, invoices, receipts, payroll records, VAT returns, etc.) directly into Secure Books' Microsoft 365 Outlook inbox via the Microsoft Graph API with **ZERO PERMANENT DOCUMENT STORAGE**.

---

## 🔒 Security & Architecture Overview

```
Client Browser (HTTPS)
   │
   ▼ https://www.securebooks.co.uk
Frontend Application (React + TypeScript + Vite + Tailwind CSS)
   │  (Encrypted Multipart Form Upload)
   ▼
Backend API (Node.js + Express + TypeScript)
   ├── Rate Limiter & Helmet Security Headers
   ├── Form & Client Data Validation
   ├── Server-Side File Inspection (MIME, Extension Whitelist & Magic Bytes Header Signature)
   ├── Security & Malware Quarantine Scanning
   ├── Isolated Temporary Storage (`os.tmpdir()/secure-books-uploads/<submission-id>/`)
   ├── Microsoft Graph API Delivery (Entra ID Client Credentials OAuth 2.0)
   │      ├── Direct Small Attachments (<3 MB)
   │      └── Upload Session Chunking (3 MB - 150 MB)
   ├── Delivery to `info@securebooks.co.uk` Outlook Mailbox
   └── ABSOLUTE CLEANUP: Hard-delete temporary files immediately in `finally` block
```

### Critical Zero Permanent Storage Guarantee
- **No S3 Buckets**
- **No Document Database**
- **No Permanent Upload Directory**
- **No Public Document URLs**
- Uploaded files reside in OS temporary storage only for the active lifecycle of the Microsoft Graph upload request and are **hard-deleted immediately** upon email dispatch.
- A background retention sweeper automatically purges any abandoned temporary uploads older than 30 minutes.

---

## 📋 Key Features

1. **11 Document Categories + Additional Documents**:
   - Bank Statements
   - Credit Card Statements
   - Sales Invoices, Receipts & Payouts
   - Purchase Bills
   - Expense Bills & Receipts
   - Expense Claims
   - Petty Cash Expenses
   - Payroll Reports
   - Workplace Pension Reports
   - VAT Records
   - Loan / Hire Purchase Agreements
   - Additional Documents & General Notes

2. **Mandatory N/A Functionality**:
   - Every category features radio selectors: `○ I have documents` vs `○ N/A — I don't have this / Not applicable`.
   - Selecting N/A disables the dropzone without preventing submission.
   - Per-category notes fields allow custom instructions for bookkeepers.

3. **Modern Upload & Smartphone Support**:
   - Drag & Drop upload zones with format badges (`.pdf`, `.jpg`, `.jpeg`, `.png`, `.webp`, `.xls`, `.xlsx`, `.csv`).
   - Mobile camera photo capture integration for photographing physical receipts directly on smartphones.
   - File preview list displaying human-readable file sizes and `[ Remove ]` buttons.

4. **Multi-Stage Submission Flow**:
   - Client Info Step (Client Name *, Bookkeeping Period *, Month / Quarter *, Optional Client Email).
   - Category Selection & Upload.
   - Pre-submission Review Modal summarizing client info, file counts per category, N/A statuses, and privacy declaration.
   - Live Upload Progress Modal showing validation stages.
   - Success Page displaying unique reference number (`SB-2026-XXXXXXXX`).

---

## 🚀 Local Setup & Quickstart

### Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/securebooks/secure-books-submission-portal.git
cd secure-books-submission-portal

# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create `.env` inside `backend/` (or copy `.env.example`):

```bash
cp .env.example backend/.env
```

Default local configuration (`USE_MOCK_GRAPH=true` is enabled automatically when Entra ID secrets are missing, allowing instant local testing without Azure credentials).

### 3. Run Development Servers

In one terminal, start the Backend API:

```bash
cd backend
npm run dev
# Backend runs on http://localhost:3000
```

In a second terminal, start the Frontend Vite dev server:

```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing

Run backend file validation, magic bytes, security scan, and temp cleanup unit tests:

```bash
cd backend
npm run build
npm test
```

---

## 🔑 Microsoft Entra ID (Azure AD) Setup

For production deployment, configure Microsoft Entra ID to deliver attachments directly to `info@securebooks.co.uk`:

1. **Register Application**: Register `Secure Books Document Submission Portal` in Entra ID Admin Center.
2. **Permissions**: Grant **Microsoft Graph** > **Application Permission** > `Mail.Send`.
3. **Admin Consent**: Grant admin consent for your organization.
4. **Environment Variables**: Add your `MICROSOFT_TENANT_ID`, `MICROSOFT_CLIENT_ID`, and `MICROSOFT_CLIENT_SECRET` to `backend/.env`.

See detailed step-by-step guide in [`docs/entra-id-setup.md`](./docs/entra-id-setup.md).

---

## 🐳 Docker Deployment

Run full stack using Docker Compose:

```bash
docker-compose up --build -d
```

---

## 🌐 Production Domain & SSL Configuration

1. **Domain**: Point `www.securebooks.co.uk` to your production frontend server IP or CloudFront / Cloudflare CNAME.
2. **Root Domain Redirect**: Configure 301 redirect from `https://securebooks.co.uk` to `https://www.securebooks.co.uk`.
3. **HTTPS / TLS**: Mandatory TLS 1.3 certificate via Let's Encrypt or AWS ACM.

---

## 🛡️ Security Considerations & Logging Rules

- **Zero Sensitive Data Logging**: Server logs log operational metadata only (`[SB-2026-XXXXXXXX] 4 files validated, 8.2 MB`). File binary buffers, bank account numbers, transaction details, and client secrets are **NEVER logged**.
- **Magic Byte File Signatures**: Server inspects initial file byte headers (`%PDF-`, JPEG `FF D8 FF`, PNG `89 50 4E 47`, WEBP `RIFF...WEBP`, XLS/XLSX `PK\x03\x04`, etc.) to reject executable binaries (`.exe`, `.elf`), scripts (`.php`, `.js`, `.sh`), or HTML/SVG injection vectors.
- **Configurable Size Limits**: Individual file limit (`MAX_FILE_SIZE_MB=25`), total submission upload limit (`MAX_TOTAL_UPLOAD_MB=70`).

---

## 📞 Support & Contact

- **Company**: Secure Books
- **Website**: [https://www.securebooks.co.uk](https://www.securebooks.co.uk)
- **Email**: [info@securebooks.co.uk](mailto:info@securebooks.co.uk)
