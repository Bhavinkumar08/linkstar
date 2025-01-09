import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Trash2, Globe, Lock, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkCardProps {
  id: string;
  name: string;
  url: string;
  description: string;
  tags: string[];
  isPublic: boolean;
  isStarred: boolean;
  createdAt: Date;
  isOwner?: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: {
    name: string;
    url: string;
    description: string;
    tags: string[];
    isPublic: boolean;
  }) => void;
  onToggleStar: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  EditDialog?: React.ComponentType<{ link: { id: string; name: string; url: string; description: string; tags: string[]; isPublic: boolean; }; onEdit: (id: string, updates: { name: string; url: string; description: string; tags: string[]; isPublic: boolean; }) => void; }>;
}

export function LinkCard({
  id,
  name,
  url,
  description,
  tags,
  isPublic,
  isStarred,
  isOwner = true,
  onDelete,
  onEdit,
  onToggleStar,
  onToggleVisibility,
  EditDialog,
}: LinkCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className="group relative transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold line-clamp-1">{name}</h3>
            <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-muted-foreground hover:text-primary truncate"
            >
              {url}
            </a>
          </div>
          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "transition-opacity",
                isHovered ? "opacity-100" : "opacity-0"
              )}
              onClick={() => onToggleVisibility(id)}
            >
              {isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex justify-between w-full">
          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleStar(id)}
              className={cn(
                "text-muted-foreground",
                isStarred && "text-yellow-400 hover:text-yellow-500"
              )}
            >
              <Star className="h-4 w-4" fill={isStarred ? "currentColor" : "none"} />
            </Button>
          )}
          <div
            className={cn(
              "flex gap-2 transition-opacity",
              isHovered ? "opacity-100" : "opacity-0",
              !isOwner && "ml-auto"
            )}
          >
            {isOwner && (
              <>
                {EditDialog && (
                  <EditDialog
                    link={{
                      id,
                      name,
                      url,
                      description,
                      tags,
                      isPublic,
                    }}
                    onEdit={onEdit}
                  />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}