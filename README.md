# Celarox Website

A unified business platform website built with Next.js and Django.

## Tech Stack

### Frontend
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- @dnd-kit (drag and drop)
- Axios

### Backend
- Django 4.2
- Django REST Framework
- PostgreSQL (Neon)
- Cloudinary (media storage)
- SimpleJWT (authentication)
- Gunicorn

## Project Structure

```
.
├── backend/
│   ├── celarox/          # Django project config
│   ├── core/             # Main app (models, views, serializers)
│   ├── env/              # Virtual environment
│   ├── requirements.txt  # Python dependencies
│   └── vercel.json       # Vercel deployment config
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── admin-kenneth-648102/  # Admin page
│   │       ├── page.tsx               # Main landing page
│   │       └── layout.tsx
│   └── package.json
└── LOGO/
    └── CELAROX_LOGO.png
```

## Getting Started

### Backend Setup

1. Go to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv env
   source env/bin/activate  # Linux/Mac
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend directory:
   ```env
   DEBUG=True
   SECRET_KEY=your-secret-key-here
   DATABASE_URL=your-neon-database-url
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

5. Apply migrations:
   ```bash
   python manage.py migrate
   ```

6. Create superuser:
   ```bash
   python manage.py create_superuser
   ```
   Credentials:
   - Username: `jasonkennethn`
   - Email: `jasonkennethn@gmail.com`
   - Password: `Nerellas@123`

7. Run the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Go to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Backend Deployment (Vercel)

- Set environment variables in Vercel dashboard (see `VERCEL_ENV.txt` for required variables)
- Deploy the backend directory

### Frontend Deployment (Cloudflare Pages)

- Deploy the frontend directory
- Set build command to `npm run build`
- Set output directory to `.next`

## Admin Page

The admin page is available at `/admin-kenneth-648102` and requires authentication with the superuser credentials.

## Features

- Premium Apple-style UI
- Responsive design
- Drag and drop section management
- Product showcase
- Features section
- Contact section
- Django admin interface
- REST API
