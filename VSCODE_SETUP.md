# VSCode Development Setup

This guide helps you set up the CoachWillTumbles application for development in Visual Studio Code and deployment on Render.

## Prerequisites

- Node.js 18+ installed
- VSCode with recommended extensions
- Git configured for GitHub
- Supabase account and project
- Stripe account (test mode)
- Resend account for emails

## Initial Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd coach-will-gymnastics-clean
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Edit `.env` with your specific values:

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Server
PORT=5001
NODE_ENV=development
SESSION_SECRET=your-secure-session-secret
BASE_URL=http://localhost:5173

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (use test keys for development)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...
FROM_EMAIL=coach@coachwilltumbles.com

# Admin
ADMIN_EMAIL=admin@coachwilltumbles.com
ADMIN_PASSWORD=your-secure-password
```

### 3. Database Setup

Push your database schema to Supabase:

```bash
npm run db:push
```

## Development Workflow

### Starting the Development Server

Use VSCode's integrated terminal or the Command Palette:

1. **Full Stack Development**: Press `Ctrl+Shift+P` → "Tasks: Run Task" → "Start Development Server"
   - Or run: `npm run dev`
   - This starts both frontend (Vite) and backend (Express) concurrently

2. **Frontend Only**: Run the "Start Frontend Only" task
   - Or run: `npm run dev:client`

3. **Backend Only**: Run the "Start Backend Only" task
   - Or run: `npm run dev:server`

### Development URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001/api
- **Admin Panel**: http://localhost:5173/admin

### Available VSCode Tasks

Access via `Ctrl+Shift+P` → "Tasks: Run Task":

- **Start Development Server**: Full stack development
- **Start Frontend Only**: Vite dev server only
- **Start Backend Only**: Express server only
- **Build Production**: Create production build
- **Type Check**: TypeScript validation
- **Database Push**: Update Supabase schema

## Debugging

### Backend Debugging

1. Open VSCode debugger panel (`Ctrl+Shift+D`)
2. Select "Launch Server" configuration
3. Set breakpoints in your server code
4. Press F5 to start debugging

### Frontend Debugging

1. Start the development server
2. Open browser DevTools
3. Use browser debugging features
4. VSCode can also debug in Chrome with the appropriate extension

## Building and Testing

### Type Checking

```bash
npm run check
```

### Building for Production

```bash
npm run build
```

This creates:
- `dist/` - Built frontend assets
- `dist/index.js` - Compiled server

### Testing the Production Build

```bash
npm run build
npm start
```

## Database Management

### Schema Changes

1. Modify schema in `shared/schema.ts`
2. Push changes: `npm run db:push`
3. Generate migrations: `npm run db:generate`

### Database Operations

- **Push schema**: `npm run db:push`
- **Generate migrations**: `npm run db:generate`
- **Run migrations**: `npm run db:migrate`

## Common Development Issues

### Port Conflicts

If port 5001 is in use:
1. Change `PORT` in `.env`
2. Update `BASE_URL` accordingly
3. Restart the development server

### Environment Variables

- Always restart the server after changing `.env`
- Never commit `.env` to version control
- Use `.env.example` as a template

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check Supabase project status
3. Ensure database exists and is accessible

## Next Steps

- [Render Deployment Guide](./RENDER_DEPLOYMENT.md)
- [Environment Variables Reference](./ENVIRONMENT_VARIABLES.md)
- [API Documentation](./API_DOCS.md)
