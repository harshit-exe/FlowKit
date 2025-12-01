# BUILD FLOWKIT - Complete n8n Workflow Library Platform

## PROJECT OVERVIEW
Build a complete, production-ready n8n workflow library platform called "Flowkit" using Next.js 14, TypeScript, Prisma ORM, and MySQL. This is an open-source project that will be deployed as flowkit.in.

## TECH STACK
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** MySQL (PlanetScale/Railway compatible)
- **AI:** Google Gemini 2.0 Flash API
- **Auth:** NextAuth.js (for admin panel only)
- **File Upload:** Uploadthing or Cloudinary
- **Deployment:** Vercel (frontend) + PlanetScale/Railway (database)

## DATABASE SCHEMA (Prisma)

Create the following Prisma schema with all relationships and proper indexing:
```prisma
// prisma/schema.prisma

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  relationMode = "prisma" // For PlanetScale
}

generator client {
  provider = "prisma-client-js"
}

// WORKFLOWS
model Workflow {
  id                  String     @id @default(cuid())
  slug                String     @unique
  name                String
  description         String     @db.Text
  icon                String?
  thumbnail           String?
  videoUrl            String?
  difficulty          Difficulty @default(BEGINNER)
  featured            Boolean    @default(false)
  indiaBadge          Boolean    @default(false)
  nodeCount           Int        @default(0)
  views               Int        @default(0)
  downloads           Int        @default(0)
  workflowJson        Json       // Stores the complete n8n JSON
  
  // Arrays as JSON
  useCases            Json       // Array of strings
  setupSteps          Json       // Array of strings
  credentialsRequired Json       // Array of strings
  nodes               Json       // Array of node names
  
  // Relationships
  categories          WorkflowCategory[]
  tags                WorkflowTag[]
  
  // Metadata
  published           Boolean    @default(false)
  createdAt           DateTime   @default(now())
  updatedAt           DateTime   @updatedAt
  publishedAt         DateTime?
  
  @@index([slug])
  @@index([featured])
  @@index([difficulty])
  @@index([published])
  @@index([createdAt])
  @@map("workflows")
}

// CATEGORIES
model Category {
  id          String     @id @default(cuid())
  slug        String     @unique
  name        String
  icon        String
  description String?
  color       String     @default("#667eea")
  order       Int        @default(0)
  workflows   WorkflowCategory[]
  
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  @@index([slug])
  @@index([order])
  @@map("categories")
}

// TAGS
model Tag {
  id        String     @id @default(cuid())
  name      String     @unique
  slug      String     @unique
  workflows WorkflowTag[]
  
  createdAt DateTime   @default(now())
  
  @@index([slug])
  @@map("tags")
}

// JUNCTION TABLES
model WorkflowCategory {
  workflow     Workflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  workflowId   String
  category     Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId   String
  
  @@id([workflowId, categoryId])
  @@index([workflowId])
  @@index([categoryId])
  @@map("workflow_categories")
}

model WorkflowTag {
  workflow     Workflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  workflowId   String
  tag          Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
  tagId        String
  
  @@id([workflowId, tagId])
  @@index([workflowId])
  @@index([tagId])
  @@map("workflow_tags")
}

// ADMIN USERS (for admin panel)
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String    // Hashed with bcrypt
  role          Role      @default(ADMIN)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@map("users")
}

// ENUMS
enum Difficulty {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum Role {
  ADMIN
  SUPER_ADMIN
}
```

## PROJECT STRUCTURE

Create this exact folder structure:
```
flowkit/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx                    # Homepage
│   │   │   ├── workflows/
│   │   │   │   ├── page.tsx                # All workflows
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx            # Workflow detail
│   │   │   ├── category/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx            # Category page
│   │   │   ├── search/
│   │   │   │   └── page.tsx                # Search results
│   │   │   ├── ai-builder/
│   │   │   │   └── page.tsx                # AI workflow generator
│   │   │   └── docs/
│   │   │       └── page.tsx                # Documentation
│   │   ├── admin/
│   │   │   ├── layout.tsx                  # Admin layout with auth
│   │   │   ├── page.tsx                    # Admin dashboard
│   │   │   ├── workflows/
│   │   │   │   ├── page.tsx                # List workflows
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx            # Create workflow
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx        # Edit workflow
│   │   │   ├── categories/
│   │   │   │   └── page.tsx                # Manage categories
│   │   │   └── settings/
│   │   │       └── page.tsx                # Admin settings
│   │   ├── api/
│   │   │   ├── workflows/
│   │   │   │   ├── route.ts                # GET all, POST create
│   │   │   │   ├── [id]/
│   │   │   │   │   └── route.ts            # GET, PUT, DELETE
│   │   │   │   ├── trending/
│   │   │   │   │   └── route.ts            # GET trending
│   │   │   │   └── related/
│   │   │   │       └── [id]/
│   │   │   │           └── route.ts        # GET related
│   │   │   ├── categories/
│   │   │   │   └── route.ts                # GET all categories
│   │   │   ├── search/
│   │   │   │   └── route.ts                # GET search
│   │   │   ├── ai/
│   │   │   │   └── generate/
│   │   │   │       └── route.ts            # POST generate workflow
│   │   │   ├── download/
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts            # Track downloads
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts            # NextAuth
│   │   ├── layout.tsx                      # Root layout
│   │   └── globals.css                     # Global styles
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── workflow/
│   │   │   ├── WorkflowCard.tsx
│   │   │   ├── WorkflowGrid.tsx
│   │   │   ├── WorkflowDetail.tsx
│   │   │   └── WorkflowJsonViewer.tsx
│   │   ├── category/
│   │   │   └── CategoryCard.tsx
│   │   ├── search/
│   │   │   ├── SearchBar.tsx
│   │   │   └── FilterSidebar.tsx
│   │   ├── admin/
│   │   │   ├── AdminNav.tsx
│   │   │   ├── WorkflowForm.tsx
│   │   │   ├── CategoryManager.tsx
│   │   │   └── StatsCards.tsx
│   │   ├── ai/
│   │   │   └── ChatInterface.tsx
│   │   └── ui/                             # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       ├── dialog.tsx
│   │       ├── toast.tsx
│   │       └── ... (other shadcn components)
│   ├── lib/
│   │   ├── prisma.ts                       # Prisma client
│   │   ├── auth.ts                         # NextAuth config
│   │   ├── gemini.ts                       # Gemini AI client
│   │   └── utils.ts                        # Utility functions
│   └── types/
│       └── index.ts                        # TypeScript types
├── public/
│   ├── thumbnails/                         # Workflow thumbnails
│   └── workflows/                          # JSON files (optional)
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## IMPLEMENTATION STEPS

### STEP 1: Project Setup & Dependencies

Initialize the project with all necessary packages:
```bash
npx create-next-app@latest flowkit --typescript --tailwind --app --src-dir
cd flowkit

# Core dependencies
npm install prisma @prisma/client
npm install next-auth @auth/prisma-adapter bcryptjs
npm install @google/generative-ai
npm install lucide-react
npm install react-hook-form zod @hookform/resolvers
npm install uploadthing @uploadthing/react
npm install date-fns
npm install sonner  # For toast notifications

# Dev dependencies
npm install -D @types/bcryptjs
npm install -D prisma-erd-generator

# shadcn/ui setup
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card badge dialog toast select textarea label form
```

### STEP 2: Environment Variables

Create `.env` file:
```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/flowkit"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"

# Google Gemini
GEMINI_API_KEY="your-gemini-api-key"

# Uploadthing (for image uploads)
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
```

### STEP 3: Database Setup

After creating the Prisma schema, run:
```bash
npx prisma generate
npx prisma db push
npx prisma studio  # Open Prisma Studio to view data
```

### STEP 4: Seed Data

Create `prisma/seed.ts` with sample categories:
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@flowkit.in' },
    update: {},
    create: {
      email: 'admin@flowkit.in',
      name: 'Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  // Create categories
  const categories = [
    { name: 'Email Automation', slug: 'email', icon: '📧', description: 'Automate email workflows' },
    { name: 'AI & ML', slug: 'ai', icon: '🤖', description: 'AI-powered automations' },
    { name: 'CRM & Sales', slug: 'crm', icon: '💼', description: 'Sales and CRM workflows' },
    { name: 'WhatsApp', slug: 'whatsapp', icon: '💬', description: 'WhatsApp automations', color: '#25D366' },
    { name: 'Database', slug: 'database', icon: '💾', description: 'Database operations' },
    { name: 'Finance', slug: 'finance', icon: '💰', description: 'Financial automations' },
    { name: 'Marketing', slug: 'marketing', icon: '📢', description: 'Marketing workflows' },
    { name: 'Analytics', slug: 'analytics', icon: '📊', description: 'Analytics and reporting' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log('✅ Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.disconnect();
  });
```

Run seed: `npx prisma db seed`

### STEP 5: Core Features to Build

Build in this exact order:

#### A. ADMIN PANEL (Priority 1)

1. **Admin Authentication**
   - Login page with NextAuth
   - Protected admin routes
   - Session management

2. **Workflow Form (Most Important)**
   - Create comprehensive form with ALL fields:
     - Name (required)
     - Slug (auto-generated from name)
     - Description (textarea)
     - Icon (emoji picker or text input)
     - Thumbnail (file upload)
     - Video URL (optional)
     - Difficulty (select: Beginner/Intermediate/Advanced)
     - Categories (multi-select)
     - Tags (multi-select with create new)
     - Node Count (number input)
     - Credentials Required (multi-input array)
     - Nodes Used (multi-input array)
     - Use Cases (dynamic array of text inputs)
     - Setup Steps (dynamic array of text inputs)
     - Workflow JSON (Monaco Editor or textarea)
     - Featured checkbox
     - India Badge checkbox
     - Publish checkbox
   
3. **Workflow Management**
   - List all workflows in table
   - Edit existing workflows
   - Delete workflows
   - Bulk actions
   - Search/filter in admin

4. **Category Management**
   - Create/edit categories
   - Reorder categories
   - Assign colors and icons

5. **Dashboard Stats**
   - Total workflows
   - Total downloads
   - Total views
   - Recent workflows

#### B. PUBLIC PAGES (Priority 2)

1. **Homepage**
   - Hero section with stats (150+ workflows, etc.)
   - "Why only 150?" section
   - Featured workflows grid (6 cards)
   - Category grid with counts
   - "New This Week" section
   - Final CTA

2. **Workflows Listing Page**
   - Grid of workflow cards
   - Sidebar with filters:
     - Category checkboxes
     - Difficulty radio buttons
     - Tags checkboxes
     - Credentials checkboxes
   - Sort dropdown (Popular, Newest, A-Z)
   - Search bar at top
   - Pagination

3. **Workflow Detail Page**
   - Hero with name, description, badges
   - Action buttons:
     - Copy JSON (primary button)
     - Download JSON file
   - Thumbnail/preview
   - Stats: Views, Downloads, Node Count
   - Tags and categories
   - Credentials required section
   - Setup steps (numbered list)
   - Use cases
   - JSON viewer (collapsible)
   - Video embed (if available)
   - Related workflows section (3-6 cards)

4. **Category Page**
   - Category header with icon, name, description
   - Workflow count
   - Grid of workflows in this category
   - Same filtering as main workflows page

5. **Search Results Page**
   - Search query display
   - Results count
   - Same layout as workflows listing
   - Highlight search terms

#### C. AI BUILDER (Priority 3)

1. **Chat Interface**
   - Input textarea
   - "Generate Workflow" button
   - Loading state
   - Example prompts
   - Generated workflow preview
   - Copy/Download buttons

2. **Gemini Integration**
   - API route that calls Gemini
   - System prompt for n8n JSON generation
   - JSON validation
   - Error handling

#### D. SHARED COMPONENTS

1. **Workflow Card**
   - Thumbnail
   - Icon + Name
   - Short description (truncated)
   - Categories badges
   - Difficulty badge
   - Stats (views, downloads)
   - Hover effect
   - Click to detail page

2. **Navbar**
   - Logo/Brand
   - Links: Home, Workflows, AI Builder, Docs
   - Search bar (global)
   - GitHub link
   - Responsive mobile menu

3. **Footer**
   - Links
   - Social media
   - Copyright
   - "Built in India 🇮🇳"

4. **Search Bar**
   - Input with icon
   - Instant search dropdown (optional)
   - Search results link

5. **Filter Sidebar**
   - Collapsible sections
   - Checkboxes for categories
   - Radio for difficulty
   - Clear filters button

## KEY IMPLEMENTATION DETAILS

### Workflow JSON Handling
```typescript
// When copying JSON
const handleCopyJSON = async (workflowJson: any) => {
  const jsonString = JSON.stringify(workflowJson, null, 2);
  await navigator.clipboard.writeText(jsonString);
  toast.success('Workflow JSON copied to clipboard!');
};

// When downloading JSON
const handleDownloadJSON = (workflow: Workflow) => {
  const jsonString = JSON.stringify(workflow.workflowJson, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${workflow.slug}.json`;
  link.click();
  URL.revokeObjectURL(url);
};
```

### Search Implementation
```typescript
// API route for search
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  
  const workflows = await prisma.workflow.findMany({
    where: {
      published: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
    },
  });
  
  return Response.json(workflows);
}
```

### Related Workflows Logic
```typescript
// Get related workflows based on categories and tags
async function getRelatedWorkflows(workflowId: string) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: {
      categories: true,
      tags: true,
    },
  });
  
  if (!workflow) return [];
  
  const categoryIds = workflow.categories.map(c => c.categoryId);
  const tagIds = workflow.tags.map(t => t.tagId);
  
  const related = await prisma.workflow.findMany({
    where: {
      AND: [
        { id: { not: workflowId } },
        { published: true },
        {
          OR: [
            { categories: { some: { categoryId: { in: categoryIds } } } },
            { tags: { some: { tagId: { in: tagIds } } } },
          ],
        },
      ],
    },
    take: 6,
    orderBy: { views: 'desc' },
  });
  
  return related;
}
```

### Track Views & Downloads
```typescript
// Increment views
async function trackView(workflowId: string) {
  await prisma.workflow.update({
    where: { id: workflowId },
    data: { views: { increment: 1 } },
  });
}

// Increment downloads
async function trackDownload(workflowId: string) {
  await prisma.workflow.update({
    where: { id: workflowId },
    data: { downloads: { increment: 1 } },
  });
}
```

## STYLING GUIDELINES

Use Tailwind CSS with these brand colors:
```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        accent: '#fbbf24',
        success: '#10b981',
      },
    },
  },
};
```

## RESPONSIVE DESIGN

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Collapsible sidebar on mobile
- Stacked cards on mobile, grid on desktop

## OPEN SOURCE REQUIREMENTS

1. Add MIT License
2. Create comprehensive README.md
3. Add CONTRIBUTING.md
4. Document setup instructions
5. Add .env.example
6. Create GitHub Actions for CI/CD (optional)

## TESTING CHECKLIST

Before marking complete, test:
- [ ] Admin login works
- [ ] Create workflow form validates properly
- [ ] All workflow fields save correctly
- [ ] Workflow listing shows all workflows
- [ ] Workflow detail page displays correctly
- [ ] Copy JSON works
- [ ] Download JSON works
- [ ] Search returns results
- [ ] Filters work correctly
- [ ] Category pages show correct workflows
- [ ] AI builder generates valid JSON
- [ ] Related workflows show up
- [ ] Views and downloads increment
- [ ] Mobile responsive
- [ ] All links work

## DELIVERABLES

Provide me with:
1. Complete project with all files
2. Instructions to run locally
3. Database schema visualization
4. API documentation (list of all endpoints)
5. Admin credentials (default: admin@flowkit.in / admin123)

## PRIORITY ORDER

Build in this sequence:
1. Database schema & Prisma setup ✅
2. Admin authentication ✅
3. Admin workflow form (most important) ✅
4. Workflow listing in admin ✅
5. Public homepage ✅
6. Public workflow listing ✅
7. Workflow detail page ✅
8. Search & filters ✅
9. Category pages ✅
10. AI builder ✅

## IMPORTANT NOTES

- Use TypeScript strictly (no `any` types unless necessary)
- Add proper error handling everywhere
- Use Prisma transactions where needed
- Add loading states for all async operations
- Use proper SEO meta tags
- Add OpenGraph images for social sharing
- Implement rate limiting on AI endpoint
- Use Zod for form validation
- Add proper error pages (404, 500)
- Use React Server Components where possible
- Client components only when needed (interactive elements)

Start building now! Create the project step by step, and make it production-ready.