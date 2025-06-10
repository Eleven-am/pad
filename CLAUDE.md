# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is "Pad"?

**Pad** is a professional-grade, block-based content management and blogging platform - think Notion meets Medium with advanced publishing capabilities. It's designed for content creators, technical writers, publishers, and organizations who need sophisticated content creation tools with comprehensive analytics.

**Core Value Proposition:**
- **Block-Based Editor**: 13 different content block types for rich, interactive content
- **Professional Publishing**: Full-featured blogging platform with SEO, scheduling, series
- **Advanced Analytics**: Deep engagement tracking, user behavior analysis, performance metrics
- **Collaboration Features**: Role-based permissions, real-time editing, command system with undo/redo
- **Enterprise Ready**: API keys, webhooks, rate limiting, user management

**Target Users:**
- Professional bloggers and content creators
- Technical writers and documentation teams  
- Publishers and newsrooms
- Marketing teams and agencies
- Educational content creators
- Anyone needing rich, data-driven content with professional publishing features

**Key Differentiators:**
- Advanced block system with charts, tables, polls, social embeds
- Comprehensive analytics dashboard with 6 main sections
- Command pattern architecture for reliable operations
- Professional-grade permission system and user management
- Built-in SEO optimization and scheduled publishing

## Development Commands

**Core Development:**
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

**Database:**
- `npx prisma generate` - Generate Prisma client (outputs to src/generated/prisma)
- `npx prisma db push` - Push schema changes to database
- `npx prisma migrate dev` - Create and apply new migration
- `npx prisma studio` - Open Prisma Studio database browser

## Architecture Overview

**Block-Based Content System:**
This is a sophisticated CMS built around a block-based editor with 13 different block types. All blocks extend from a base pattern with position-based ordering and are linked to posts via foreign keys. 

**Complete Block Types:**
1. **TextBlock** - Rich text with optional drop cap styling
2. **HeadingBlock** - H1-H6 headings with positioning
3. **QuoteBlock** - Attributed quotes with author and source
4. **ListBlock** - Bullet, numbered, and checklist variants with nested items
5. **ImagesBlock** - Multi-image galleries with captions and alt text
6. **VideoBlock** - Video with poster images and captions
7. **CodeBlock** - Syntax-highlighted code with line numbers, language detection, and highlighted lines
8. **TableBlock** - CSV/JSON data visualization with mobile-responsive layouts
9. **ChartBlock** - Interactive charts (area, bar, line, pie) with extensive customization
10. **Callout** - Alert blocks (warning, info, success, error, tip, danger, note)
11. **TwitterBlock** - Mock Twitter post embeds with engagement metrics
12. **InstagramBlock** - Instagram post simulation with multiple images
13. **PollingBlock** - Interactive polls with voting and results display

Each block supports drag-and-drop reordering, individual configuration, and real-time synchronization.

**Command Pattern Implementation:**
The application uses a command pattern for all operations with undo/redo support. Commands are in `src/commands/` and include CreateCommand, UpdateCommand, DeleteCommand, and specialized commands for different entities. All commands implement the BaseCommand interface and support transaction rollback.

**Service Layer with Dependency Injection:**
Services are organized in `src/services/` with a dependency injection container in `di.ts`. Key services:
- PostService: Manages posts and their blocks
- ContentService: Handles block operations and content analysis  
- MediaService: File upload and management
- UserService: User management with permissions
- TableService/InstagramService: Specialized block services

**Authentication & Permissions:**
Uses Better Auth with role-based access control (ADMIN, EDITOR, AUTHOR, READER). Permission system is implemented with granular controls defined in `src/lib/better-auth/serverPermissions.ts`. API keys supported with rate limiting.

**Database Schema:**
Complex relational schema with 30+ models designed for a professional publishing platform:

**Core Entities:**
- **Users** - Role-based (ADMIN, EDITOR, AUTHOR, READER) with social profiles, banning system
- **Posts** - Full-featured with SEO metadata, scheduling, series support, audio narration
- **Files** - Centralized file management with uploader tracking and type validation
- **Categories** - Hierarchical category system with parent/child relationships
- **Tags** - Flexible tagging with colors and descriptions
- **PostSeries** - Multi-part content organization

**Analytics & Engagement:**
- **PostRead** - Detailed reading analytics (time spent, scroll depth, completion)
- **PostView** - View tracking with anonymous and user-based metrics
- **PostLike/PostBookmark** - User engagement tracking
- **ProgressTracker** - Reading progress indicators per post

**Advanced Features:**
- **WebhookEndpoint/WebhookDelivery** - External integrations with retry logic
- **PostRedirect** - SEO-friendly URL management
- **Apikey** - API access with rate limiting and permissions
- **Session/Account** - Better Auth integration with impersonation support

**Block Storage:**
All 13 block types are stored as separate models with polymorphic relationships to Posts, enabling complex queries and type-specific optimizations.

**Frontend Architecture:**
Next.js 15 with App Router, React 19, TypeScript. Uses shadcn/ui components with Tailwind CSS. Block components are in `src/components/blocks/` with corresponding sidebar components for editing. Drag-and-drop functionality via @dnd-kit.

**State Management:**
- React Query (@tanstack/react-query) for server state
- Command pattern for operations with undo/redo
- Context providers for UI state in `src/components/sidebars/context/`

**Key Patterns:**
- TaskEither functional programming pattern (from @eleven-am/fp)
- Position-based ordering for blocks within posts
- File references through centralized File model
- Webhook system for external integrations
- Real-time analytics with anonymous and user tracking

## Application Features

**Content Creation:**
- WYSIWYG block-based editor with 13 block types
- Drag-and-drop block reordering with position management
- Real-time collaboration with command system (undo/redo)
- Rich media support (images, videos, charts, tables)
- Code syntax highlighting with 50+ languages
- Interactive elements (polls, social embeds)

**Publishing & SEO:**
- Draft/publish workflow with scheduled publishing
- SEO optimization fields (meta title, description, focus keywords)
- Open Graph image support and canonical URLs
- Post series organization for multi-part content
- Hierarchical categories and flexible tagging
- URL slug management with redirect handling

**Analytics Dashboard (6 Main Sections):**
1. **Overview** - Key metrics, recent activity, performance summaries
2. **Content** - Post analytics, content quality scores, block usage
3. **Audience** - Demographics, engagement patterns, user behavior
4. **Blocks** - Block-level performance and usage statistics  
5. **Planning** - Content calendar, scheduling insights, strategy tools
6. **Technical** - Site performance, system health, API usage

**User Management:**
- Role-based access control (Admin, Editor, Author, Reader)
- Social authentication (Google, GitHub)
- User profiles with social links and avatars
- Account banning system with expiration dates
- API key management with rate limiting and permissions
- User impersonation for support scenarios

**Advanced Capabilities:**
- Webhook system for external integrations
- File upload system with type validation and size limits
- Progress tracking for reading completion
- Anonymous and authenticated user analytics
- Mobile-responsive design with theme support
- Real-time synchronization across sessions

The codebase emphasizes type safety, clean architecture, and scalable patterns suitable for a professional publishing platform that could compete with established players like Medium, Ghost, or Notion in the content creation space.