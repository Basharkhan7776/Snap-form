# Snap-form

Snap-form is a modern form builder that enables users to create, edit, and analyze forms with a minimal and intuitive interface.
It combines a clean, monochrome design with drag-and-drop features, Google OAuth authentication, real-time Google Sheets export, and analytics integration.

---

## Index

1. [About the Project](#about-the-project)  
2. [Tech Stack](#tech-stack)  
3. [Features](#features)  
4. [Getting Started](#getting-started)  
5. [Project Structure](#project-structure)  
6. [Contribution Guidelines](#contribution-guidelines)  
7. [License](#license)

---

## About the Project

Snap-form is built to simplify form creation and analysis, offering a smooth, modern user experience inspired by Google Forms.
Users can create forms with drag-and-drop, collect responses, export data to Google Sheets in real-time, and visualize analytics.

---

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **UI:** [shadcn/ui](https://ui.shadcn.com/) with Tailwind CSS v4 (Neutral preset)
- **Auth:** [BetterAuth](https://better-auth.com/) (Google OAuth only)
- **Database:** PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Storage:** [Cloudflare R2](https://developers.cloudflare.com/r2/) for file uploads
- **Integration:** [Google Sheets API](https://developers.google.com/sheets/api) for real-time response export
- **Validation:** [Zod](https://zod.dev/) for schema validation
- **Drag & Drop:** [@dnd-kit](https://dndkit.com/) for form builder
- **Charts:** [Recharts](https://recharts.org/) for analytics visualization  

---

## Features

### Core Features
- ✅ **Drag-and-drop form builder** with 9 field types (text, choice, file upload, layout)
- ✅ **Google OAuth authentication** (BetterAuth)
- ✅ **Real-time Google Sheets export** - All form responses automatically exported to Google Sheets
- ✅ **Form analytics** with time-series charts and response tracking
- ✅ **File uploads** with Cloudflare R2 storage (10MB limit, images & PDFs)
- ✅ **Admin dashboard** for system-wide management
- ✅ **Role-based access control** (User, Admin, Super Admin)

### Form Builder
- Live preview panel
- Sortable fields with drag-and-drop reordering
- 9 field types: Short Text, Long Text, Multiple Choice, Checkboxes, Dropdown, Image, File Upload, Section Break, Divider
- Form customization (title, description, cover image, icon, email requirements)
- Field validation and required fields

### Response Collection
- Public form submission pages
- Email collection (optional)
- Form validation with Zod schemas
- Response metadata (IP address, user agent, timestamp)

### Google Sheets Integration
- Automatic spreadsheet creation on form publish
- Real-time response appending
- Automatic sharing with form owner
- Header updates when form fields change

### Admin Features
- User management (view all users, manage roles)
- Form management (view all forms across users)
- System statistics (users, forms, responses, trends)
- Super admin configuration via code

### Planned Features
- 🔄 AI-assisted form creation
- 🔄 Conditional logic and branching
- 🔄 Custom themes and branding
- 🔄 Form templates library
- 🔄 Response notifications  

---

## Getting Started

### Quick Start (Minimal Setup)

For a quick local development setup without full integration features:

```bash
# 1. Clone and install
git clone https://github.com/openlabsdevs/snap-form.git
cd snap-form
bun install

# 2. Set up PostgreSQL database
createdb snapform  # Or use your preferred method

# 3. Create minimal .env file
cp .env.example .env
# Edit .env and add only these required fields:
#   - DATABASE_URL
#   - BETTER_AUTH_SECRET (generate with: openssl rand -base64 32)
#   - BETTER_AUTH_URL=http://localhost:3000
#   - NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
#   - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (see Google OAuth setup below)

# 4. Initialize database
bunx prisma generate
bunx prisma migrate dev --name init

# 5. Start development server
bun dev
```

**Note:** Without Google Sheets API and Cloudflare R2 configured, you can still:
- ✅ Create and edit forms
- ✅ Submit responses (stored in database)
- ✅ View analytics
- ❌ Auto-export to Google Sheets (will show warnings in console)
- ❌ Upload files (will fail without R2 configuration)

### Full Setup (All Features)

### Prerequisites

- **Bun** (v1.0+ recommended) or Node.js (v18+)
- **PostgreSQL** database instance (v12+)
- **Google Cloud Project** with:
  - OAuth 2.0 credentials
  - Service account for Google Sheets API
  - Sheets API and Drive API enabled
- **Cloudflare R2** bucket (for file uploads)
- **Razorpay Account** (for payment processing - optional)

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/openlabsdevs/snap-form.git
   cd snap-form
   ```

2. **Install dependencies:**
   ```bash
   bun install
   # Or with npm/pnpm:
   # npm install
   # pnpm install
   ```

3. **Configure environment variables:**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Fill in the following required variables:

   **Database:**
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/snapform"
   ```

   **Authentication:**
   ```env
   BETTER_AUTH_SECRET="your-random-secret"  # Generate with: openssl rand -base64 32
   BETTER_AUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

   **Google Sheets API:**
   ```env
   GOOGLE_SERVICE_ACCOUNT_EMAIL="service-account@project.iam.gserviceaccount.com"
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

   **Cloudflare R2:**
   ```env
   CLOUDFLARE_R2_ACCOUNT_ID="your-account-id"
   CLOUDFLARE_R2_ACCESS_KEY_ID="your-access-key"
   CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-secret-key"
   CLOUDFLARE_R2_BUCKET_NAME="snap-form-uploads"
   CLOUDFLARE_R2_PUBLIC_URL="https://uploads.yourdomain.com"  # Optional
   ```

4. **Setup database:**
   ```bash
   # Generate Prisma client
   bunx prisma generate

   # Run migrations
   bunx prisma migrate dev
   ```

5. **Configure super admin (optional):**

   Edit `lib/admin.ts` and add your Google account email:
   ```typescript
   export const SUPER_ADMINS: string[] = [
     "your-email@gmail.com",
   ]
   ```

6. **Run the development server:**
   ```bash
   bun dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Google Cloud Setup Guide

1. **Enable APIs:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable "Google Sheets API" and "Google Drive API"

2. **Create OAuth 2.0 Credentials:**
   - Navigate to APIs & Services > Credentials
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Copy Client ID and Secret to `.env`

3. **Create Service Account:**
   - Navigate to IAM & Admin > Service Accounts
   - Create service account
   - Generate JSON key
   - Copy email and private key to `.env`

### Cloudflare R2 Setup Guide

1. **Create R2 Bucket:**
   - Go to Cloudflare Dashboard > R2
   - Create bucket named `snap-form-uploads`

2. **Generate API Token:**
   - In R2 dashboard, click "Manage R2 API Tokens"
   - Create token with "Edit" permissions
   - Copy credentials to `.env`

3. **Configure Public Access (optional):**
   - Set up custom domain for R2 bucket
   - Add domain to `CLOUDFLARE_R2_PUBLIC_URL`

### Troubleshooting

#### Database Connection Issues

**Problem:** `Error: P1001: Can't reach database server`
**Solution:**
```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Verify DATABASE_URL format
# Should be: postgresql://username:password@localhost:5432/database_name

# Test connection
psql -h localhost -U your_username -d snapform
```

#### Prisma Migration Errors

**Problem:** `Environment variable not found: DATABASE_URL`
**Solution:**
```bash
# Ensure .env file exists in project root
ls -la .env

# If missing, copy from example
cp .env.example .env

# Fill in DATABASE_URL before running migrations
```

**Problem:** `Migration failed: column already exists`
**Solution:**
```bash
# Reset database (WARNING: deletes all data)
bunx prisma migrate reset

# Or manually drop and recreate database
dropdb snapform
createdb snapform
bunx prisma migrate dev
```

#### Authentication Not Working

**Problem:** OAuth redirect fails
**Solution:**
- Verify `BETTER_AUTH_URL` matches your local development URL
- Check Google OAuth redirect URI is exactly: `http://localhost:3000/api/auth/callback/google`
- Ensure both `BETTER_AUTH_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` are set

**Problem:** "Invalid credentials" error
**Solution:**
- Regenerate `BETTER_AUTH_SECRET`: `openssl rand -base64 32`
- Clear browser cookies and try again
- Check that Google Client ID and Secret are correct

#### Google Sheets Integration Issues

**Problem:** "Failed to create Google Sheet" error
**Solution:**
- Verify service account JSON key is correctly formatted in `.env`
- Ensure `GOOGLE_PRIVATE_KEY` has `\n` preserved (not actual newlines)
- Check that Google Sheets API and Drive API are enabled in Google Cloud Console
- Verify service account has necessary permissions

**Problem:** Spreadsheet created but not visible
**Solution:**
- The sheet is auto-shared with the form owner's email
- Check spam/trash folder for share notification
- Manually add your email to service account permissions

#### File Upload Errors

**Problem:** "R2 bucket not configured" warning
**Solution:**
- This is expected if Cloudflare R2 is not set up
- Add all `CLOUDFLARE_R2_*` environment variables
- Verify R2 bucket exists and API token has write permissions

**Problem:** "File upload failed" error
**Solution:**
- Check file size is under 10MB limit
- Verify file type is allowed (images and PDFs only)
- Ensure R2 credentials are correct

#### Port Already in Use

**Problem:** `Port 3000 is already in use`
**Solution:**
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 bun dev
```

#### Module Not Found Errors

**Problem:** `Cannot find module '@/...'`
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
rm bun.lockb  # or package-lock.json/pnpm-lock.yaml
bun install

# Ensure TypeScript paths are configured correctly in tsconfig.json
```

### Development Tips

1. **Use Prisma Studio** for database inspection:
   ```bash
   bunx prisma studio
   # Opens at http://localhost:5555
   ```

2. **View console warnings** - The app logs helpful warnings when optional services aren't configured

3. **Test with multiple users** - Use Chrome/Firefox incognito for different Google accounts

4. **Monitor API calls** - Check Network tab in browser DevTools for API errors

5. **Hot reload** - Changes to files automatically reload the dev server

6. **Type checking**:
   ```bash
   bunx tsc --noEmit
   ```

7. **Format code**:
   ```bash
   bunx prettier --write .
   ```

8. **Reset plan limits for testing**:
   ```sql
   -- Connect to database
   psql snapform

   -- Update user plan
   UPDATE users SET plan = 'PREMIUM' WHERE email = 'your-email@gmail.com';
   ```

---

## Project Structure

```
snap-form/
├── app/
│   ├── (routes)
│   │   ├── page.tsx                    # Landing page
│   │   ├── auth/page.tsx               # Authentication
│   │   ├── dashboard/page.tsx          # User dashboard
│   │   ├── create/page.tsx             # Form builder
│   │   ├── edit/[id]/page.tsx          # Edit form
│   │   ├── form/[id]/
│   │   │   ├── page.tsx                # Public form submission
│   │   │   └── analytics/page.tsx      # Form analytics
│   │   ├── profile/page.tsx            # User profile/pricing
│   │   └── admin/                      # Admin dashboard (protected)
│   │       ├── page.tsx                # Admin overview
│   │       ├── users/page.tsx          # User management
│   │       └── forms/page.tsx          # Form management
│   └── api/
│       ├── auth/[...all]/route.ts      # BetterAuth handler
│       ├── upload/route.ts             # File upload to R2
│       ├── forms/
│       │   ├── route.ts                # List/create forms
│       │   └── [id]/
│       │       ├── route.ts            # Get/update/delete form
│       │       ├── responses/route.ts  # Form responses + Google Sheets sync
│       │       └── analytics/route.ts  # Form analytics data
│       ├── templates/route.ts          # Form templates
│       └── admin/
│           ├── users/route.ts          # Admin: user management
│           ├── users/[id]/route.ts     # Admin: update user
│           ├── forms/route.ts          # Admin: all forms
│           └── stats/route.ts          # Admin: system stats
├── components/
│   ├── ui/                             # shadcn/ui components (49 files)
│   └── nav-bar.tsx                     # Navigation component
├── lib/
│   ├── prisma.ts                       # Prisma client singleton
│   ├── auth.ts                         # BetterAuth server config
│   ├── auth-client.ts                  # BetterAuth client hooks
│   ├── admin.ts                        # Super admin config & helpers
│   ├── storage.ts                      # Cloudflare R2 client
│   ├── google-sheets.ts                # Google Sheets API integration
│   ├── validation.ts                   # Zod schemas
│   ├── types.ts                        # Shared TypeScript types
│   └── utils.ts                        # Utility functions
├── prisma/
│   └── schema.prisma                   # Database schema
├── middleware.ts                       # Route protection middleware
├── .env.example                        # Environment variables template
└── package.json
```

### Key Directories

- **`/app`** - Next.js 14 App Router pages and API routes
- **`/lib`** - Core backend logic, integrations, and utilities
- **`/components/ui`** - Reusable UI components from shadcn/ui
- **`/prisma`** - Database schema and migrations

---

## API Endpoints

### Public Routes
- `POST /api/forms/[id]/responses` - Submit form response (public)
- `GET /api/forms/[id]` - Get published form (public)

### Authenticated Routes
- `GET /api/forms` - List user's forms
- `POST /api/forms` - Create new form
- `GET /api/forms/[id]` - Get form details
- `PATCH /api/forms/[id]` - Update form
- `DELETE /api/forms/[id]` - Delete form
- `GET /api/forms/[id]/responses` - Get form responses
- `GET /api/forms/[id]/analytics` - Get form analytics
- `POST /api/upload` - Upload file to R2
- `GET /api/upload` - Get presigned upload URL
- `GET /api/templates` - Get form templates

### Admin Routes (Admin/Super Admin only)
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/[id]` - Update user role/plan
- `GET /api/admin/forms` - List all forms
- `GET /api/admin/stats` - System statistics
- `POST /api/templates` - Create template (admin only)

---

## Admin System

### Super Admin Configuration

Super admins are configured in code via `lib/admin.ts`:

```typescript
export const SUPER_ADMINS: string[] = [
  "admin@example.com",
]
```

Users with emails in this array automatically receive `SUPER_ADMIN` role upon sign-in.

### Role Hierarchy

1. **USER** (default)
   - Create and manage own forms
   - View own form responses
   - Access own Google Sheets exports

2. **ADMIN**
   - All USER permissions
   - View all forms in system
   - View all users
   - Access system statistics
   - Cannot manage other admins

3. **SUPER_ADMIN**
   - All ADMIN permissions
   - Promote/demote users to ADMIN
   - Manage other admins
   - Full system access

### Admin Dashboard Features

Access `/admin` after being promoted to admin:

- **Overview**: System-wide statistics, top forms, recent activity
- **User Management**: View all users, manage roles and plans
- **Form Management**: View all forms across all users
- **Statistics**: Platform metrics, trends, active users

---

## Contribution Guidelines

1. **Fork** the project repository.
2. Do **not** push directly to `main` or `dev` branches.
3. Create a new branch using the format:

   ```
   feature/<username>-<feature>
   ```

   Example: `feature/jane-drag-drop`
4. Commit changes to your branch and push to your fork.
5. Submit a Pull Request for review.

---

## License

All rights reserved © [github.com/openlabsdevs](https://github.com/openlabsdevs)
