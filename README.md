# ERP Frontend (Full) - TypeScript / TSX

This is a full-featured TypeScript Next.js (App Router) frontend scaffold tailored to your Express.js backend.

**Schema file used as reference:** `/mnt/data/databs.docx`

## Features
- CRUD pages for Customers, Products, Quotations, Sales Orders, Delivery Orders, Invoices
- Pagination, search, basic form validation
- Toast notifications, loading skeletons, error handling
- API helper configured to talk to: `NEXT_PUBLIC_API_URL` (default `http://localhost:5000/api`)

## Quick start

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` with:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. Run dev server:
```bash
npm run dev
```

4. Open http://localhost:3000

Adjust endpoints in `app/lib/api.ts` if your Express routes differ.

