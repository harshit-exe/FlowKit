<div align="center">

# FlowKit 🚀

### The Ultimate n8n Workflow Library Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/harshit-exe/FlowKit?style=social)](https://github.com/harshit-exe/FlowKit/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/harshit-exe/FlowKit)](https://github.com/harshit-exe/FlowKit/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

**Discover, share, and deploy 150+ curated n8n automation workflows.** <br/>
Built with ❤️ in India 🇮🇳

[**Live Demo**](https://flowkit.in) · [**Documentation**](https://github.com/harshit-exe/FlowKit/wiki) · [**Report Bug**](https://github.com/harshit-exe/FlowKit/issues) · [**Request Feature**](https://github.com/harshit-exe/FlowKit/issues)

</div>

## ⭐ Star History

<a href="https://www.star-history.com/#harshit-exe/FlowKit&type=timeline&legend=bottom-right">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=harshit-exe/FlowKit&type=timeline&theme=dark&legend=bottom-right" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=harshit-exe/FlowKit&type=timeline&legend=bottom-right" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=harshit-exe/FlowKit&type=timeline&legend=bottom-right" />
 </picture>
</a>

---


## ✨ Features

<table>
<tr>
<td>

### 🔍 For Users
- **150+ Curated Workflows** - Hand-picked and tested
- **AI Workflow Builder** - Generate workflows with Gemini AI
- **Advanced Search & Filters** - Find exactly what you need
- **Instant Copy/Download** - Get workflows in one click
- **Community Features** - Comments, votes, and saves

</td>
<td>

### ⚡ For Developers
- **Modern Stack** - Next.js 14, TypeScript, Prisma
- **Production Ready** - Secure, scalable, optimized
- **Admin Panel** - Full CRUD operations
- **API Routes** - RESTful endpoints included
- **Open Source** - MIT licensed, contribute freely

</td>
</tr>
</table>

## 🚀 Quick Start

Get FlowKit running locally in under 5 minutes!

### Prerequisites

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **MySQL** 8.x or compatible database provider
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/harshit-exe/FlowKit.git
   cd FlowKit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure your database and API keys (see [Environment Variables](#environment-variables) below)

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   
   # Seed with sample data (super admin + workflows)
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser** 🎉
   - **Public site**: [http://localhost:3000](http://localhost:3000)
   - **Admin panel**: [http://localhost:3000/admin](http://localhost:3000/admin)
   
   **Default Admin Credentials:**
   - Email: `admin@flowkit.in`
   - Password: `Admin@123!`
   
   ⚠️ **Change these credentials immediately after first login!**

## 📋 Environment Variables

Create a `.env` file in the root directory with the following variables:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | MySQL connection string | `mysql://user:pass@host:3306/flowkit` |
| `NEXTAUTH_URL` | ✅ Yes | Your app's base URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | ✅ Yes | Secret for JWT encryption | Generate with `openssl rand -base64 32` |
| `GEMINI_API_KEY` | ✅ Yes | Google Gemini API key | Get from [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `RESEND_API_KEY` | ✅ Yes | Email service API key | Get from [Resend](https://resend.com/api-keys) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | ✅ Yes | Cloudinary cloud name | From [Cloudinary Console](https://cloudinary.com/console) |
| `CLOUDINARY_API_KEY` | ✅ Yes | Cloudinary API key | From Cloudinary Console |
| `CLOUDINARY_API_SECRET` | ✅ Yes | Cloudinary API secret | From Cloudinary Console |
| `GROQ_API_KEY` | ⚠️ Optional | Groq AI for thumbnails | Get from [Groq Console](https://console.groq.com/) |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | ⚠️ Optional | Microsoft Clarity analytics | From [Clarity](https://clarity.microsoft.com/) |
| `NEXT_PUBLIC_ENABLE_ACCESS_GATE` | ⚠️ Optional | Enable waitlist feature | `true` or `false` (default: `false`) |

> 💡 **Tip**: Check [`.env.example`](.env.example) for detailed descriptions and instructions for each variable.

## 🗄️ Database Setup

FlowKit supports any MySQL-compatible database. Here are some recommended providers:

### Option 1: Local MySQL
```bash
# Install MySQL locally
brew install mysql  # macOS
# or download from https://dev.mysql.com/downloads/

# Create database
mysql -u root -p
CREATE DATABASE flowkit;
```

### Option 2: Cloud Providers (Recommended for Production)

- **[Aiven](https://aiven.io/)** - Free tier available, excellent performance
- **[PlanetScale](https://planetscale.com/)** - Serverless MySQL, generous free tier
- **[Railway](https://railway.app/)** - Easy setup, good for development

### SSL/TLS Connection

If your database requires SSL, append to your `DATABASE_URL`:
```
?sslaccept=strict
```

### Database Commands

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Push schema changes to database (development)
npx prisma db push

# Run migrations (production)
npx prisma migrate deploy

# Seed database with sample data
npx prisma db seed

# Open Prisma Studio (visual database editor)
npx prisma studio
```

## 📁 Project Structure

```
flowkit/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seeding script
├── src/
│   ├── app/
│   │   ├── (public)/          # Public-facing pages
│   │   │   ├── page.tsx       # Homepage
│   │   │   ├── workflows/     # Workflow listings & details
│   │   │   └── ai-builder/    # AI workflow generator
│   │   ├── admin/             # Admin panel
│   │   │   ├── dashboard/     # Admin dashboard
│   │   │   ├── workflows/     # Workflow management
│   │   │   └── categories/    # Category management
│   │   └── api/               # API routes
│   │       ├── workflows/     # Workflow CRUD APIs
│   │       ├── search/        # Search API
│   │       └── ai/            # AI generation API
│   ├── components/
│   │   ├── admin/             # Admin-specific components
│   │   ├── layout/            # Layout components (navbar, footer)
│   │   ├── workflow/          # Workflow display components
│   │   └── ui/                # shadcn/ui components
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client instance
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── gemini.ts          # Google Gemini AI client
│   │   └── utils.ts           # Utility functions
│   └── types/                 # TypeScript type definitions
├── public/
│   ├── thumbnails/            # Workflow thumbnail images
│   └── assets/                # Static assets
└── package.json
```

## 🌐 API Endpoints

FlowKit provides a RESTful API for managing workflows:

### Workflows
- `GET /api/workflows` - List all workflows (with pagination & filters)
- `POST /api/workflows` - Create a new workflow
- `GET /api/workflows/[id]` - Get workflow by ID
- `PUT /api/workflows/[id]` - Update workflow
- `DELETE /api/workflows/[id]` - Delete workflow
- `GET /api/workflows/[id]/stats` - Get workflow statistics

### Search & Discovery
- `GET /api/search` - Search workflows by keywords, tags, categories
- `GET /api/categories` - List all categories
- `GET /api/tags` - List all tags

### AI Generation
- `POST /api/ai/generate` - Generate workflow using AI (Gemini)

### Community
- `POST /api/workflows/[id]/vote` - Upvote/downvote workflow
- `POST /api/workflows/[id]/save` - Save workflow to collection
- `GET /api/workflows/[id]/comments` - Get workflow comments

> 📖 For detailed API documentation, visit our [API Reference](https://github.com/harshit-exe/FlowKit/wiki/API-Reference).

## 🚢 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/harshit-exe/FlowKit)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   - Add all variables from your `.env` file
   - Update `NEXTAUTH_URL` to your production domain

4. **Deploy**
   - Click "Deploy"
   - Your app will be live in ~2 minutes!

### Production Checklist

Before deploying to production:

- [ ] Change default admin password
- [ ] Use strong `NEXTAUTH_SECRET` (generate new one)
- [ ] Configure production database with SSL
- [ ] Set up proper email service (Resend recommended)
- [ ] Enable Cloudinary for image uploads
- [ ] Configure domain for `NEXTAUTH_URL`
- [ ] Set up analytics (optional but recommended)
- [ ] Review and update `robots.txt` and `sitemap.xml`
- [ ] Test all workflows and admin features
- [ ] Set up database backups

### Other Deployment Options

<details>
<summary><b>Docker Deployment</b></summary>

```dockerfile
# Coming soon - Dockerfile in progress
```
</details>

<details>
<summary><b>Traditional Hosting (PM2)</b></summary>

```bash
# Build the application
npm run build

# Start with PM2
pm2 start npm --name "flowkit" -- start
```
</details>

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MySQL](https://www.mysql.com/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **AI**: [Google Gemini 2.0 Flash](https://ai.google.dev/)
- **Email**: [Resend](https://resend.com/) / [Nodemailer](https://nodemailer.com/)
- **Image Upload**: [Cloudinary](https://cloudinary.com/)
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics), [Microsoft Clarity](https://clarity.microsoft.com/)

## 🤝 Contributing

We love contributions! FlowKit is better because of developers like you. 🙌

### Ways to Contribute

- 🐛 **Report bugs** - Found an issue? [Open a bug report](https://github.com/harshit-exe/FlowKit/issues/new)
- ✨ **Suggest features** - Have ideas? [Request a feature](https://github.com/harshit-exe/FlowKit/issues/new)
- 📝 **Improve documentation** - Help others understand FlowKit better
- 🔧 **Submit PRs** - Fix bugs or add features
- 📦 **Share workflows** - Contribute your n8n workflows

### Contribution Process

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

> 📖 Read our [Contributing Guide](CONTRIBUTING.md) for detailed guidelines and coding standards.

## ❓ Troubleshooting

<details>
<summary><b>Database connection issues</b></summary>

**Error**: `PrismaClientInitializationError: Can't reach database server`

**Solutions**:
- Verify your `DATABASE_URL` is correct
- Check if MySQL is running: `mysql -u root -p`
- For cloud databases, ensure your IP is whitelisted
- Try appending `?sslaccept=strict` for SSL connections
</details>

<details>
<summary><b>Prisma Client errors</b></summary>

**Error**: `@prisma/client did not initialize yet`

**Solutions**:
- Run `npx prisma generate` to generate the client
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Restart your dev server
</details>

<details>
<summary><b>Authentication not working</b></summary>

**Issue**: Can't login to admin panel

**Solutions**:
- Ensure `NEXTAUTH_SECRET` is set in `.env`
- Check `NEXTAUTH_URL` matches your current URL (including port)
- Verify database has seeded users: `npx prisma studio`
- Clear browser cookies and try again
</details>

<details>
<summary><b>Email sending fails</b></summary>

**Error**: Email notifications not being sent

**Solutions**:
- Verify `RESEND_API_KEY` is valid
- Check your Resend domain is verified
- Ensure sender email is configured in Resend
- Check API rate limits haven't been exceeded
</details>

<details>
<summary><b>Build errors</b></summary>

**Error**: Type errors or build failures

**Solutions**:
- Run `npx prisma generate` first
- Check TypeScript version: `npm list typescript`
- Clear Next.js cache: `rm -rf .next`
- Verify all required environment variables are set
</details>

> 💡 Still stuck? [Open an issue](https://github.com/harshit-exe/FlowKit/issues) and we'll help!

## 📸 Screenshots

> Coming soon! Check out the [live demo](https://flowkit.in) in the meantime.

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

FlowKit wouldn't be possible without these amazing projects:

- [**n8n**](https://n8n.io/) - The powerful workflow automation tool that inspired this project
- [**shadcn/ui**](https://ui.shadcn.com/) - Beautiful and accessible UI components
- [**Google Gemini**](https://ai.google.dev/) - AI-powered workflow generation
- [**Vercel**](https://vercel.com/) - Hosting and deployment platform
- All our [contributors](https://github.com/harshit-exe/FlowKit/graphs/contributors) ❤️

## 📧 Contact & Community

- 🌐 **Website**: [flowkit.in](https://flowkit.in)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/harshit-exe/FlowKit/discussions)
- 🐛 **Issues**: [GitHub Issues](https://github.com/harshit-exe/FlowKit/issues)
- 👤 **Author**: [@harshit-exe](https://github.com/harshit-exe)


<div align="center">

**Built with ❤️ in India 🇮🇳**

If FlowKit helped you, consider giving it a ⭐ on GitHub!

</div>
