"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Clock, User } from "lucide-react";
import Link from "next/link";

const mockPosts = [
  {
    id: "1",
    title: "Building Modern Web Applications with Next.js",
    excerpt: "Learn how to build scalable and performant web applications using Next.js and its latest features...",
    author: {
      name: "John Doe",
      avatar: "/placeholder.svg",
    },
    category: "Technology",
    tags: ["Next.js", "React", "Web Development"],
    readTime: "5 min read",
    date: "2024-03-15",
  },
  {
    id: "2",
    title: "The Art of Minimalist Design",
    excerpt: "Exploring the principles of minimalist design and how to apply them in modern web interfaces...",
    author: {
      name: "Jane Smith",
      avatar: "/placeholder.svg",
    },
    category: "Design",
    tags: ["Design", "UI/UX", "Minimalism"],
    readTime: "4 min read",
    date: "2024-03-14",
  },
  {
    id: "3",
    title: "Understanding TypeScript Generics",
    excerpt: "A deep dive into TypeScript generics and how they can improve your code's type safety...",
    author: {
      name: "Mike Johnson",
      avatar: "/placeholder.svg",
    },
    category: "Programming",
    tags: ["TypeScript", "JavaScript", "Programming"],
    readTime: "7 min read",
    date: "2024-03-13",
  },
  {
    id: "4",
    title: "The Future of AI in Web Development",
    excerpt: "Exploring how artificial intelligence is transforming the way we build and maintain web applications...",
    author: {
      name: "Sarah Chen",
      avatar: "/placeholder.svg",
    },
    category: "Technology",
    tags: ["AI", "Web Development", "Future Tech"],
    readTime: "8 min read",
    date: "2024-03-12",
  },
  {
    id: "5",
    title: "Mastering CSS Grid Layout",
    excerpt: "A comprehensive guide to CSS Grid and how to create complex layouts with ease...",
    author: {
      name: "Alex Rivera",
      avatar: "/placeholder.svg",
    },
    category: "CSS",
    tags: ["CSS", "Grid", "Layout"],
    readTime: "6 min read",
    date: "2024-03-11",
  },
  {
    id: "6",
    title: "Building Accessible Web Applications",
    excerpt: "Learn the best practices for creating web applications that are accessible to everyone...",
    author: {
      name: "Emma Wilson",
      avatar: "/placeholder.svg",
    },
    category: "Accessibility",
    tags: ["A11y", "Web Development", "Best Practices"],
    readTime: "9 min read",
    date: "2024-03-10",
  },
  {
    id: "7",
    title: "The Rise of Edge Computing",
    excerpt: "Understanding how edge computing is changing the landscape of web development...",
    author: {
      name: "David Kim",
      avatar: "/placeholder.svg",
    },
    category: "Technology",
    tags: ["Edge Computing", "Cloud", "Performance"],
    readTime: "7 min read",
    date: "2024-03-09",
  },
  {
    id: "8",
    title: "Design Systems: A Complete Guide",
    excerpt: "Everything you need to know about creating and maintaining a successful design system...",
    author: {
      name: "Lisa Wong",
      avatar: "/placeholder.svg",
    },
    category: "Design",
    tags: ["Design Systems", "UI/UX", "Components"],
    readTime: "10 min read",
    date: "2024-03-08",
  },
  {
    id: "9",
    title: "Web Performance Optimization Techniques",
    excerpt: "Advanced techniques for optimizing your web applications for better performance...",
    author: {
      name: "Tom Harris",
      avatar: "/placeholder.svg",
    },
    category: "Performance",
    tags: ["Performance", "Optimization", "Web Development"],
    readTime: "8 min read",
    date: "2024-03-07",
  },
  {
    id: "10",
    title: "The Evolution of JavaScript Frameworks",
    excerpt: "A historical look at how JavaScript frameworks have evolved over the years...",
    author: {
      name: "Rachel Green",
      avatar: "/placeholder.svg",
    },
    category: "JavaScript",
    tags: ["JavaScript", "Frameworks", "History"],
    readTime: "6 min read",
    date: "2024-03-06",
  },
  {
    id: "11",
    title: "Building Real-time Applications with WebSocket",
    excerpt: "Learn how to implement real-time features in your web applications using WebSocket...",
    author: {
      name: "Chris Martinez",
      avatar: "/placeholder.svg",
    },
    category: "Web Development",
    tags: ["WebSocket", "Real-time", "Backend"],
    readTime: "7 min read",
    date: "2024-03-05",
  },
  {
    id: "12",
    title: "The Psychology of Color in Web Design",
    excerpt: "Understanding how color choices affect user behavior and perception...",
    author: {
      name: "Sophie Anderson",
      avatar: "/placeholder.svg",
    },
    category: "Design",
    tags: ["Color Theory", "Psychology", "UI/UX"],
    readTime: "5 min read",
    date: "2024-03-04",
  },
  {
    id: "13",
    title: "Serverless Architecture Best Practices",
    excerpt: "A guide to building scalable applications using serverless architecture...",
    author: {
      name: "James Wilson",
      avatar: "/placeholder.svg",
    },
    category: "Architecture",
    tags: ["Serverless", "Cloud", "Architecture"],
    readTime: "9 min read",
    date: "2024-03-03",
  },
  {
    id: "14",
    title: "Mobile-First Design Principles",
    excerpt: "Essential principles for creating responsive and mobile-friendly web applications...",
    author: {
      name: "Maria Garcia",
      avatar: "/placeholder.svg",
    },
    category: "Design",
    tags: ["Mobile", "Responsive Design", "UI/UX"],
    readTime: "6 min read",
    date: "2024-03-02",
  },
  {
    id: "15",
    title: "Advanced CSS Animation Techniques",
    excerpt: "Learn how to create smooth and performant animations using modern CSS...",
    author: {
      name: "Kevin Lee",
      avatar: "/placeholder.svg",
    },
    category: "CSS",
    tags: ["CSS", "Animations", "Performance"],
    readTime: "8 min read",
    date: "2024-03-01",
  },
  {
    id: "16",
    title: "The Future of Web Development",
    excerpt: "Predictions and trends shaping the future of web development...",
    author: {
      name: "Anna Thompson",
      avatar: "/placeholder.svg",
    },
    category: "Technology",
    tags: ["Future", "Trends", "Web Development"],
    readTime: "7 min read",
    date: "2024-02-29",
  },
  {
    id: "17",
    title: "Building Secure Web Applications",
    excerpt: "Essential security practices for modern web development...",
    author: {
      name: "Michael Brown",
      avatar: "/placeholder.svg",
    },
    category: "Security",
    tags: ["Security", "Web Development", "Best Practices"],
    readTime: "10 min read",
    date: "2024-02-28",
  },
  {
    id: "18",
    title: "The Power of CSS Custom Properties",
    excerpt: "How to leverage CSS custom properties for more maintainable styles...",
    author: {
      name: "Laura Chen",
      avatar: "/placeholder.svg",
    },
    category: "CSS",
    tags: ["CSS", "Custom Properties", "Maintenance"],
    readTime: "5 min read",
    date: "2024-02-27",
  },
  {
    id: "19",
    title: "Progressive Web Apps: A Complete Guide",
    excerpt: "Everything you need to know about building and deploying PWAs...",
    author: {
      name: "Daniel Park",
      avatar: "/placeholder.svg",
    },
    category: "Web Development",
    tags: ["PWA", "Web Development", "Mobile"],
    readTime: "9 min read",
    date: "2024-02-26",
  },
  {
    id: "20",
    title: "The Art of Code Review",
    excerpt: "Best practices for conducting effective code reviews...",
    author: {
      name: "Emily Davis",
      avatar: "/placeholder.svg",
    },
    category: "Development",
    tags: ["Code Review", "Best Practices", "Team Work"],
    readTime: "6 min read",
    date: "2024-02-25",
  },
  {
    id: "21",
    title: "Building Microservices with Node.js",
    excerpt: "A practical guide to creating scalable microservices using Node.js...",
    author: {
      name: "Ryan Clark",
      avatar: "/placeholder.svg",
    },
    category: "Backend",
    tags: ["Node.js", "Microservices", "Architecture"],
    readTime: "11 min read",
    date: "2024-02-24",
  },
  {
    id: "22",
    title: "The Impact of AI on Web Development",
    excerpt: "How artificial intelligence is changing the way we build web applications...",
    author: {
      name: "Nina Patel",
      avatar: "/placeholder.svg",
    },
    category: "Technology",
    tags: ["AI", "Web Development", "Future"],
    readTime: "8 min read",
    date: "2024-02-23",
  },
  {
    id: "23",
    title: "Advanced React Patterns",
    excerpt: "Learn advanced patterns and techniques for building better React applications...",
    author: {
      name: "Carlos Rodriguez",
      avatar: "/placeholder.svg",
    },
    category: "React",
    tags: ["React", "Patterns", "Best Practices"],
    readTime: "10 min read",
    date: "2024-02-22",
  }
];

export function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(mockPosts);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = mockPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
    );
    setSearchResults(filtered);
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 h-[calc(100vh-8rem)] flex flex-col">
      <div className="space-y-8 flex flex-col h-full">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Search</h1>
          <p className="text-muted-foreground">
            Find articles, tutorials, and resources
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for articles..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-4">
            {searchResults.map((post) => (
              <Link href={`/blog/${post.id}`} key={post.id}>
                <Card className="hover:bg-muted/50 transition-colors my-4">
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{post.author.name}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <CardTitle className="line-clamp-1">{post.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {searchResults.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No results found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 