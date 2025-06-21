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

const SocialLinks = React.memo(() => (
  <div className="flex justify-center sm:justify-start items-center gap-3">
    <Link href="#" aria-label="Twitter profile">
      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
        <Twitter className="h-5 w-5" />
      </Button>
    </Link>
    <Link href="#" aria-label="LinkedIn profile">
      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
        <Linkedin className="h-5 w-5" />
      </Button>
    </Link>
    <Link href="#" aria-label="GitHub profile">
      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
        <Github className="h-5 w-5" />
      </Button>
    </Link>
  </div>
));

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
        <SocialLinks />
      </div>
    </div>
  </section>
));

AuthorBio.displayName = 'AuthorBio';