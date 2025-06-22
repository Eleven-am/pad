# Pad - Professional Block-Based CMS & Blogging Platform

<div align="center">
  <h3>🚀 Create. Publish. Analyze.</h3>
  <p>A modern, self-hosted content management system with advanced analytics</p>
  
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#docker">Docker</a> •
  <a href="#documentation">Docs</a> •
  <a href="#license">License</a>
</div>

---

## What is Pad?

Pad is a professional-grade, block-based content management and blogging platform - think Notion meets Medium with advanced publishing capabilities. It's designed for content creators, technical writers, publishers, and organizations who need sophisticated content creation tools with comprehensive analytics.

### ✨ Key Features

- **🎨 13 Block Types** - Rich content blocks including text, headings, quotes, lists, images, videos, code (with syntax highlighting), tables, charts, callouts, Twitter embeds, Instagram embeds, and polls
- **📊 Advanced Analytics** - 6 dashboard sections tracking engagement, performance, user behavior, and content metrics
- **✏️ Professional Publishing** - SEO optimization, scheduled publishing, series support, categories, tags
- **👥 Collaboration** - Role-based permissions (Admin, Editor, Author, Reader), real-time editing
- **🔄 Command System** - Undo/redo support with transaction rollback
- **🐳 Docker Ready** - Multi-architecture support (AMD64/ARM64), one-command deployment
- **🔒 Security First** - Better Auth integration, API keys, rate limiting, secure by default

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Pull and run
docker run -d \
  -p 3000:3000 \
  -v pad_data:/app/data \
  -e DATABASE_URL=file:/app/data/pad.db \
  ghcr.io/eleven-am/pad:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/eleven-am/pad/main/docker-compose.example.yml
docker-compose up -d
```

### Development Setup

```bash
# Clone the repository
git clone https://github.com/eleven-am/pad.git
cd pad

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Initialize database
npm run db:push
npm run db:init

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see your Pad instance running!

## 📚 Documentation

- [Docker Setup](./DOCKER.md) - Detailed Docker deployment guide
- [Database Guide](./DOCKER-DATABASE.md) - Database configuration and management
- [Development](./CLAUDE.md) - Architecture and development guide
- [Claude Code Guide](./.claude/README.md) - AI assistant configuration

## 🏗️ Architecture

Pad is built with modern web technologies:

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js App Router, Prisma ORM
- **Database**: SQLite (default), PostgreSQL, MySQL supported
- **Auth**: Better Auth with social providers
- **UI**: Shadcn/ui components, Radix UI
- **Analytics**: Built-in comprehensive analytics system

## 🎯 Use Cases

- **Professional Blogging** - Full-featured blogging with SEO and analytics
- **Technical Documentation** - Code blocks, charts, and structured content
- **Content Marketing** - Analytics-driven content creation
- **Team Publishing** - Multi-author support with permissions
- **Knowledge Base** - Organize content with categories and series

## 🐳 Docker Deployment

Pad provides official multi-architecture Docker images:

```yaml
version: '3.8'
services:
  pad:
    image: ghcr.io/eleven-am/pad:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=file:/app/data/pad.db
      - SECRET=your-secret-key-here
    volumes:
      - pad_data:/app/data
    restart: unless-stopped

volumes:
  pad_data:
```

## 🔧 Configuration

Key environment variables:

- `DATABASE_URL` - Database connection string
- `SECRET` - Session encryption key
- `NEXT_PUBLIC_BASE_URL` - Public URL of your instance
- `GOOGLE_CLIENT_ID/SECRET` - Google OAuth (optional)
- `GITHUB_CLIENT_ID/SECRET` - GitHub OAuth (optional)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

**Important**: This software is provided "as is", without warranty of any kind. The authors are not responsible for any data loss or damages arising from the use of this software.

## 🙏 Acknowledgments

Built with ❤️ by [Roy OSSAI](https://github.com/eleven-am)

---

<div align="center">
  <p>If you find Pad useful, please consider giving it a ⭐ on GitHub!</p>
</div>