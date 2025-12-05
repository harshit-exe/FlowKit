# FlowKit - n8n Workflow Library

> Discover and download 150+ curated n8n workflows. Built for India, by India 🇮🇳

FlowKit is a production-ready, open-source n8n workflow library platform that helps you discover, share, and deploy automation workflows.

## ✨ Features

- **150+ Curated Workflows** - Hand-picked, tested, and documented workflows
- **AI Workflow Builder** - Generate n8n workflows using Google Gemini AI
- **Advanced Search & Filters** - Find workflows by category, difficulty, tags, and more
- **Admin Panel** - Complete CRUD interface for managing workflows
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Production Ready** - Built with Next.js 14, TypeScript, and Prisma ORM

## 🚀 Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** MySQL (Aiven Cloud)
- **AI:** Google Gemini 2.0 Flash API
- **Auth:** NextAuth.js
- **Deployment:** Vercel-ready

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/flowkit.git
   cd flowkit
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Copy `.env.example` to `.env` and fill in your values:
   ```env
   DATABASE_URL="mysql://user:password@host:port/flowkit"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-super-secret-key"
   GEMINI_API_KEY="your-gemini-api-key"
   ```

4. **Set up the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open http://localhost:3000** in your browser

## 🔑 Default Admin Credentials

- **Email:** admin@flowkit.in
- **Password:** admin123

**⚠️ Important:** Change these credentials immediately in production!

## 📁 Project Structure

```
flowkit/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data
├── src/
│   ├── app/
│   │   ├── (public)/       # Public pages
│   │   ├── admin/          # Admin panel
│   │   └── api/            # API routes
│   ├── components/
│   │   ├── admin/          # Admin components
│   │   ├── layout/         # Layout components
│   │   ├── workflow/       # Workflow components
│   │   └── ui/             # shadcn/ui components
│   ├── lib/
│   │   ├── prisma.ts       # Prisma client
│   │   ├── auth.ts         # NextAuth config
│   │   └── gemini.ts       # Gemini AI client
│   └── types/              # TypeScript types
└── public/
    └── thumbnails/         # Workflow thumbnails
```

## 🎯 Key Features

### For Users

- **Browse Workflows**: Explore 150+ curated n8n workflows
- **Search & Filter**: Find workflows by category, difficulty, tags, and credentials
- **Workflow Details**: View comprehensive information including setup steps, use cases, and JSON
- **Copy & Download**: Easily copy workflow JSON or download as file
- **AI Builder**: Generate custom workflows using natural language

### For Admins

- **Dashboard**: View statistics and recent workflows
- **Workflow Management**: Complete CRUD operations for workflows
- **Category Management**: Organize workflows into categories
- **Rich Form**: Comprehensive workflow form with validation
- **Tag Management**: Create and assign tags to workflows

## 🔧 Database Schema

The application uses the following main models:

- **Workflow**: Core workflow data with JSON, metadata, and stats
- **Category**: Workflow categories (Email, AI, CRM, etc.)
- **Tag**: Flexible tagging system
- **User**: Admin users with role-based access
- **Junction Tables**: Many-to-many relationships

## 🌐 API Endpoints

- `GET /api/workflows` - List all workflows
- `POST /api/workflows` - Create new workflow
- `GET /api/workflows/[id]` - Get single workflow
- `PUT /api/workflows/[id]` - Update workflow
- `DELETE /api/workflows/[id]` - Delete workflow
- `GET /api/search` - Search workflows
- `POST /api/ai/generate` - Generate workflow with AI

## 🚢 Deployment

### Vercel Deployment

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel:**
   - Import your repository to Vercel
   - Add environment variables
   - Deploy

3. **Database:**
   - Use Aiven MySQL, PlanetScale, or Railway
   - Update DATABASE_URL in Vercel environment variables

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [n8n](https://n8n.io/) - Powerful workflow automation
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Google Gemini](https://ai.google.dev/) - AI-powered workflow generation

## 📧 Contact

- Website: [flowkit.in](https://flowkit.in)
- GitHub: [@harshit-exe](https://github.com/harshit-exe)

---

**Built with ❤️ in India 🇮🇳**
