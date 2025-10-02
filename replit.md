# Tender Management Application

## Overview

This is a comprehensive tender management application built for Alteram, designed to help track briefing dates, submission deadlines, and client information with a calendar-style interface. The application provides a professional solution for managing tender processes with features like calendar views, detailed tender tracking, and deadline management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and component-based development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Radix UI components with custom Tailwind CSS styling following shadcn/ui design system
- **Forms**: React Hook Form with Zod validation for robust form handling
- **Styling**: Tailwind CSS with custom color palette (dark blue primary, orange accent) inspired by productivity tools like Notion and Linear

### Backend Architecture
- **Server**: Express.js with TypeScript for API endpoints
- **Authentication**: Session-based authentication with bcrypt password hashing
- **Session Management**: Express-session with memorystore (development) and secure cookie configuration
- **Authorization**: Role-based access control with admin and regular user roles
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod schemas shared between client and server for consistent data validation
- **API Design**: RESTful endpoints with proper error handling and status codes
- **Development**: Vite for fast development server and hot module replacement

### Data Storage
- **Database**: PostgreSQL with support for multiple providers (Neon, Supabase, PlanetScale)
- **Schema**: Two main entities - users (with admin role) and tenders with proper relationships and constraints
- **Migrations**: Drizzle Kit for database schema management and migrations
- **Connection**: Environment-based configuration supporting both development and production environments

### Authentication & Authorization
- **Login System**: Custom username/password authentication with session management
- **Password Security**: Bcrypt hashing with 10 salt rounds for all stored passwords
- **Session Storage**: Server-side sessions with secure HTTP-only cookies
- **Protected Routes**: All tender management routes require authentication
- **Admin Panel**: Dedicated admin interface for user management (admin users only)
- **User Roles**: Admin users can create, edit, and delete user accounts
- **UI Components**: Login page with Alteram branding and low-opacity background logo

### API Endpoints

#### Authentication Endpoints
- `POST /api/auth/login` - Authenticate user and create session
- `POST /api/auth/logout` - Destroy user session
- `GET /api/auth/me` - Get current authenticated user

#### Tender Management Endpoints (Protected)
- `GET /api/tenders` - List all tenders
- `POST /api/tenders` - Create new tender
- `PUT /api/tenders/:id` - Update tender
- `DELETE /api/tenders/:id` - Delete tender

#### Admin User Management Endpoints (Admin Only)
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### Deployment Architecture
- **Production**: Netlify Functions for serverless deployment
- **API Routes**: Dual environment support - `/api` for development, `/.netlify/functions/api` for production
- **Build Process**: Vite build for client, esbuild for server bundling
- **Environment Variables**: Separate configuration for NETLIFY_DATABASE_URL and DATABASE_URL

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity for serverless environments
- **@netlify/functions**: Serverless function support for Netlify deployment
- **@tanstack/react-query**: Advanced server state management with caching and synchronization
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **zod**: Runtime type validation and schema definition

### UI Component Libraries
- **@radix-ui/***: Comprehensive set of accessible UI primitives (dialogs, dropdowns, calendars, etc.)
- **lucide-react**: Modern icon library for consistent iconography
- **class-variance-authority**: Type-safe CSS class composition
- **tailwindcss**: Utility-first CSS framework with custom design tokens

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development environment integration

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **react-hook-form**: Performant form library with minimal re-renders
- **@hookform/resolvers**: Validation resolver for Zod integration
- **wouter**: Lightweight routing library
- **clsx**: Conditional CSS class composition