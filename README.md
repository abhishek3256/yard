# Multi-Tenant SaaS Notes Application

A secure multi-tenant notes application built with Next.js, TypeScript, and SQLite, deployed on Vercel.

## Features

- **Multi-Tenancy**: Strict tenant isolation with shared schema approach
- **Authentication**: JWT-based authentication with role-based access control
- **Subscription Management**: Free plan (3 notes) and Pro plan (unlimited)
- **Notes CRUD**: Full create, read, update, delete operations
- **Frontend**: Modern React UI with Tailwind CSS

## Multi-Tenancy Approach

This application uses a **shared schema with tenant ID** approach:

- All tables include a `tenant_id` column for data isolation
- Database queries always filter by `tenant_id` to ensure tenant isolation
- Foreign key constraints maintain referential integrity within tenants
- Indexes on `tenant_id` columns optimize query performance

### Database Schema

```sql
-- Tenants table
CREATE TABLE tenants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  tenant_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants (id)
);

-- Notes table
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tenant_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## Test Accounts

The application comes with predefined test accounts (all with password: `password`):

| Email | Role | Tenant | Description |
|-------|------|--------|-------------|
| admin@acme.test | Admin | Acme | Acme admin user |
| user@acme.test | Member | Acme | Acme regular user |
| admin@globex.test | Admin | Globex | Globex admin user |
| user@globex.test | Member | Globex | Globex regular user |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Health Check
- `GET /api/health` - Application health status

### Notes Management
- `GET /api/notes` - List all notes for current tenant
- `POST /api/notes` - Create a new note
- `GET /api/notes/:id` - Retrieve a specific note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

### Tenant Management
- `POST /api/tenants/:slug/upgrade` - Upgrade tenant to Pro plan (Admin only)

## Subscription Plans

### Free Plan
- Maximum 3 notes per tenant
- All CRUD operations available within limit

### Pro Plan
- Unlimited notes
- All CRUD operations available

## Security Features

1. **Tenant Isolation**: All data queries include tenant filtering
2. **JWT Authentication**: Secure token-based authentication
3. **Role-Based Access**: Admin and Member roles with different permissions
4. **Password Hashing**: bcrypt for secure password storage
5. **CORS Enabled**: Cross-origin requests supported for API access

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: SQLite with sqlite3 driver
- **Authentication**: JWT with jsonwebtoken
- **Password Security**: bcryptjs
- **Deployment**: Vercel

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Set environment variables:
```bash
# Create .env.local file
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Deployment

The application is configured for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `JWT_SECRET`: Your production JWT secret
3. Deploy automatically on git push

## API Usage Examples

### Login
```bash
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@acme.test", "password": "password"}'
```

### Create Note
```bash
curl -X POST https://your-app.vercel.app/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title": "My Note", "content": "Note content"}'
```

### List Notes
```bash
curl -X GET https://your-app.vercel.app/api/notes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Upgrade Tenant
```bash
curl -X POST https://your-app.vercel.app/api/tenants/acme/upgrade \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Testing

The application includes automated test validation for:

- ✅ Health endpoint availability
- ✅ Successful login for all predefined accounts
- ✅ Tenant isolation enforcement
- ✅ Role-based access restrictions
- ✅ Free plan note limit enforcement
- ✅ Pro plan upgrade functionality
- ✅ CRUD operations for notes
- ✅ Frontend accessibility

## Architecture Decisions

1. **Database Choice**: SQLite for simplicity and Vercel compatibility
2. **Multi-tenancy**: Shared schema approach for easier maintenance
3. **Authentication**: JWT for stateless authentication
4. **Frontend**: Server-side rendering with Next.js for better SEO
5. **Styling**: Tailwind CSS for rapid UI development
6. **Deployment**: Vercel for seamless Next.js deployment

## Security Considerations

- All database queries include tenant filtering
- JWT tokens expire after 24 hours
- Passwords are hashed with bcrypt
- CORS is properly configured
- Input validation on all API endpoints
- SQL injection protection through parameterized queries
