# Contributing to FlowKit 🚀

First off, thank you for considering contributing to FlowKit! It's people like you that make FlowKit such a great tool for the n8n community.

## 🌟 How Can I Contribute?

### Reporting Bugs 🐛

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (screenshots, code snippets)
- **Describe the behavior you observed** and what you expected
- **Include your environment details** (OS, browser, Node version)

### Suggesting Enhancements 💡

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful** to most FlowKit users
- **List some examples** of how it would be used

### Adding New Workflows 📦

We're always looking for high-quality n8n workflows! To contribute a workflow:

1. **Ensure your workflow is tested and working**
2. **Include clear documentation** (description, use cases, setup steps)
3. **Add relevant tags and categories**
4. **Provide a thumbnail** (optional but recommended)
5. **Submit via Pull Request** with the workflow JSON

### Pull Requests 🔄

1. **Fork the repository** and create your branch from `main`
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes** following our coding standards:
   - Use TypeScript for type safety
   - Follow the existing code style
   - Write meaningful commit messages
   - Add comments for complex logic

3. **Test your changes thoroughly**:
   ```bash
   npm run build
   npm run lint
   ```

4. **Update documentation** if needed (README, comments, etc.)

5. **Commit your changes**:
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
   
   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

6. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request** with a clear title and description

## 🏗️ Development Setup

1. **Clone your fork**:
   ```bash
   git clone https://github.com/harshit-exe/flowkit.git
   cd flowkit
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Fill in your environment variables
   ```

4. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

## 📝 Coding Standards

- **TypeScript**: Use proper types, avoid `any` when possible
- **Components**: Keep components small and focused
- **Naming**: Use descriptive names for variables and functions
- **Comments**: Add comments for complex logic
- **Formatting**: Code will be automatically formatted (we use Prettier)

## 🧪 Testing

Before submitting a PR:

1. **Build the project** to ensure no TypeScript errors:
   ```bash
   npm run build
   ```

2. **Run the linter**:
   ```bash
   npm run lint
   ```

3. **Test manually** in the browser to ensure everything works

## 📚 Project Structure

```
flowkit/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── (public)/     # Public pages
│   │   ├── admin/        # Admin panel
│   │   └── api/          # API routes
│   ├── components/       # React components
│   ├── lib/              # Utility functions
│   └── types/            # TypeScript types
├── prisma/               # Database schema and seeds
└── public/               # Static assets
```

## 🤝 Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 💬 Questions?

Feel free to:
- Open an issue for questions
- Join our community discussions
- Reach out via [GitHub Discussions](https://github.com/harshit-exe/flowkit/discussions)

## 🎉 Recognition

Contributors will be recognized in our README and release notes. Thank you for making FlowKit better!

---

**Happy Contributing! 🚀**
