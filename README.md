# Pad: Professional-Grade, Block-Based Content Platform

_Unleash Your Content, Own Your Audience, Master Your Insights._

[![GitHub stars](https://img.shields.io/github/stars/eleven-am/pad.svg?style=social)](https://github.com/eleven-am/pad/stargazers)
[![License](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](https://opensource.org/licenses/GPL-3.0)
[![Docker](https://img.shields.io/badge/Docker-Ready-brightgreen.svg)](https://github.com/eleven-am/pad)

![Pad Platform Hero](docs/images/hero-dashboard.png)
*The complete content creation and analytics platform designed for professionals*

---

## The Content Creator's Dilemma

Tired of platforms dictating your content, limiting your creativity, or holding your data hostage? Struggling to gain deep insights into your audience while juggling multiple tools for SEO, analytics, and collaboration?

**You need a platform that empowers rich content creation, provides actionable insights, and ensures complete ownership—without compromise.**

## Enter Pad: Your Complete Content Solution

Pad is the professional-grade, self-hosted content management platform that puts you in complete control. Create stunning content with 13 versatile block types, gain deep audience insights with comprehensive analytics, and own your entire digital presence.

### 🎨 Powerful Block-Based Content Creation

Transform your ideas into compelling content with our intuitive block editor:

![Block Editor in Action](docs/images/editor-blocks-demo.gif)
*Create rich, interactive content with 13 specialized block types*

**13 Block Types at Your Disposal:**
- **Rich Text & Headings** - Professional typography with drop caps
- **Interactive Charts** - Data visualization with customizable styling  
- **Code Blocks** - Syntax highlighting for 50+ languages
- **Media Galleries** - Multi-image layouts with captions
- **Social Embeds** - Twitter and Instagram post simulations
- **Interactive Polls** - Engage your audience with voting
- **Tables & Lists** - Structured data presentation
- **Callouts & Quotes** - Emphasize key information
- **Videos** - Rich media with poster images

### 📊 Built-in Analytics & Insights

Track your content performance with Pad's integrated analytics dashboard:

![Comprehensive Analytics Dashboard](docs/images/analytics-dashboard.png)
*Track engagement, performance, and user behavior with detailed analytics*

**Analytics That Actually Matter:**
- **Audience Insights** - Demographics, behavior patterns, engagement metrics
- **Content Performance** - Reading time, completion rates, popular sections
- **Block-Level Analytics** - Which content types drive the most engagement
- **SEO Tracking** - Keyword performance and search visibility
- **Revenue Attribution** - Connect content to business outcomes
- **Planning Tools** - Content calendar and strategy insights

### 🚀 Professional Publishing Features

**SEO Optimization** - Built-in tools for meta descriptions, focus keywords, and open graph
**Scheduled Publishing** - Plan your content calendar with precision
**Series Support** - Organize multi-part content for better reader experience
**Role-Based Collaboration** - Granular permissions for teams of any size

---

## Why Choose Pad Over Alternatives?

![Pad vs Alternatives Comparison](docs/images/comparison-table.png)

| Feature | Pad | Medium | Ghost (SaaS) | Notion | WordPress |
|---------|-----|--------|--------------|--------|-----------|
| **Data Ownership** | ✅ Full Control | ❌ Platform Owned | ❌ Vendor Lock-in | ❌ Platform Owned | ⚠️ Self-hosted Only |
| **Advanced Analytics** | ✅ 6 Dashboard Sections | ❌ Basic Stats | ⚠️ Limited | ❌ None | ⚠️ Plugin Required |
| **Block Variety** | ✅ 13 Specialized Blocks | ❌ Basic Text | ⚠️ Limited | ⚠️ Generic Blocks | ⚠️ Gutenberg Only |
| **Team Collaboration** | ✅ Real-time + Permissions | ❌ Publications Only | ✅ Good | ✅ Excellent | ⚠️ Plugin Required |
| **Self-Hosted** | ✅ Docker Ready | ❌ No Option | ⚠️ Expensive | ❌ No Option | ✅ Complex Setup |
| **Professional SEO** | ✅ Built-in | ❌ Limited | ✅ Good | ❌ Poor | ⚠️ Plugin Required |

**Pad gives you everything you need in one professional package—no plugins, no vendor lock-in, no compromises.**

---

## Perfect For These Professionals

### 📝 Technical Writers & Documentation Teams
Create precise, code-rich articles with dedicated syntax highlighting, version control, and team collaboration features.

### 📈 Marketing Agencies & Brands  
Build compelling campaigns with social embeds, interactive polls, and detailed analytics to prove ROI to clients.

### 🏢 Publishers & Media Organizations
Manage multiple authors, schedule releases across series, and track performance with built-in SEO optimization.

### 🎯 Independent Creators & Bloggers
Gain complete control over your platform, audience data, and monetization without platform restrictions.

---

## Get Started in Minutes

Pad is designed for effortless deployment with Docker:

![Docker Installation Flow](docs/images/docker-setup-flow.png)
*Deploy Pad in minutes with our Docker-ready setup*

### 🐳 Quick Start with Docker

```bash
# Pull and run - that's it!
docker run -d \
  -p 3000:3000 \
  -v pad_data:/app/data \
  -e DATABASE_URL=file:/app/data/pad.db \
  -e SECRET=your-secret-key-here \
  ghcr.io/eleven-am/pad:latest

# Open http://localhost:3000 and start creating!
```

### 📋 Docker Compose (Recommended)

```bash
# Download and start
curl -O https://raw.githubusercontent.com/eleven-am/pad/main/docker-compose.example.yml
docker-compose up -d
```

### 🛠 Development Setup

```bash
git clone https://github.com/eleven-am/pad.git
cd pad
npm install

# Initialize database  
npm run db:generate && npm run db:push && npm run db:init

# Start development
npm run dev
```


---

## Frequently Asked Questions

<details>
<summary><strong>Is Pad completely open source?</strong></summary>
Yes! Pad is licensed under GPL-3.0, giving you full access to the source code and the freedom to modify it for your needs.
</details>

<details>
<summary><strong>What are the minimum system requirements?</strong></summary>
Pad runs efficiently with 1GB RAM and 2GB storage. Any system capable of running Docker can host Pad.
</details>

<details>
<summary><strong>Can I import content from other platforms?</strong></summary>
We're building import tools for major platforms. Currently, you can migrate content manually through our intuitive editor.
</details>

<details>
<summary><strong>Is there a hosted version available?</strong></summary>
Pad is designed to be self-hosted to ensure you maintain complete control over your content and data. This approach eliminates vendor lock-in and recurring fees.
</details>

<details>
<summary><strong>How do I update Pad?</strong></summary>
Updates are simple with Docker: `docker pull ghcr.io/eleven-am/pad:latest` followed by restarting your container.
</details>

---

## Contributing

Pad thrives on community contributions! Whether you're fixing bugs, adding features, improving documentation, or suggesting new block types—your help makes Pad better for everyone.

**🚀 [Contribution Guidelines](./CONTRIBUTING.md)** | **💡 [Feature Requests](https://github.com/eleven-am/pad/issues/new?template=feature_request.md)**

---

## License & Credits

This project is licensed under the **GPL-3.0 License** - see the [LICENSE](LICENSE) file for details.

**Built with ❤️ by [Roy OSSAI](https://github.com/eleven-am)**

---

<div align="center">

![Pad Platform Features](docs/images/features-overview.png)

**Ready to revolutionize your content creation?**

⭐ **Star this project** and take control of your digital narrative!

[🚀 **Get Started**](#get-started-in-minutes) • [🐛 **Issues**](https://github.com/eleven-am/pad/issues) • [💬 **Community**](https://github.com/eleven-am/pad/discussions)

</div>