import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Twitter } from "lucide-react";
import { PostWithDetails } from "@/services/postService";

interface AuthorBioProps {
  author: PostWithDetails['author'];
  avatarUrl: string | null;
}

interface SocialLinksProps {
  author: PostWithDetails['author'];
}

const SocialLinks = React.memo<SocialLinksProps>(({ author }) => {
  const hasSocialLinks = author.twitter || author.linkedin || author.github;
  
  if (!hasSocialLinks) {
    return null;
  }
  
  return (
    <div className="flex justify-center sm:justify-start items-center gap-3">
      {author.twitter && (
        <Link 
          href={author.twitter.startsWith('http') ? author.twitter : `https://twitter.com/${author.twitter}`} 
          aria-label="Twitter profile"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Twitter className="h-5 w-5" />
          </Button>
        </Link>
      )}
      {author.linkedin && (
        <Link 
          href={author.linkedin.startsWith('http') ? author.linkedin : `https://linkedin.com/in/${author.linkedin}`} 
          aria-label="LinkedIn profile"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Linkedin className="h-5 w-5" />
          </Button>
        </Link>
      )}
      {author.github && (
        <Link 
          href={author.github.startsWith('http') ? author.github : `https://github.com/${author.github}`} 
          aria-label="GitHub profile"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Github className="h-5 w-5" />
          </Button>
        </Link>
      )}
    </div>
  );
});

SocialLinks.displayName = 'SocialLinks';

export const AuthorBio = React.memo<AuthorBioProps>(({ author, avatarUrl }) => (
  <section className="my-12 py-8 border-t border-b border-muted-foreground/20">
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="flex-shrink-0">
        <Image
          src={avatarUrl || ''}
          alt={author.name || ''}
          width={96}
          height={96}
          className="rounded-full"
        />
      </div>
      <div className="text-center sm:text-left">
        <h3 className="text-xl font-semibold mb-1">{author.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-4">
          {author.bio}
        </p>
        <SocialLinks author={author} />
      </div>
    </div>
  </section>
));

AuthorBio.displayName = 'AuthorBio';