import { useState, useEffect, useCallback } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LinkCard } from "@/components/LinkCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Link {
  id: string;
  name: string;
  url: string;
  description: string;
  tags: string[];
  is_public: boolean;
  is_starred: boolean;
  created_at: string;
}

export default function Tags() {
  const [links, setLinks] = useState<Link[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchLinks = useCallback(async () => {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch links",
        variant: "destructive",
      });
    } else if (data) {
      const allTags = data.reduce<string[]>((acc, link) => {
        return [...acc, ...(link.tags || [])];
      }, []);
      setTags([...new Set(allTags)].sort());
      setLinks(data);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchLinks();
    }
  }, [user, fetchLinks]);

  const handleDeleteLink = async (id: string) => {
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive",
      });
    } else {
      setLinks((prev) => prev.filter((link) => link.id !== id));
      toast({
        title: "Success",
        description: "Link deleted successfully",
      });
    }
  };

  const handleToggleStar = async (id: string) => {
    const link = links.find((l) => l.id === id);
    const { error } = await supabase
      .from('links')
      .update({ is_starred: !link?.is_starred })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update link",
        variant: "destructive",
      });
    } else {
      setLinks((prev) =>
        prev.map((link) =>
          link.id === id ? { ...link, is_starred: !link.is_starred } : link
        )
      );
    }
  };

  const handleToggleVisibility = async (id: string) => {
    const link = links.find((l) => l.id === id);
    const { error } = await supabase
      .from('links')
      .update({ is_public: !link?.is_public })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update link",
        variant: "destructive",
      });
    } else {
      setLinks((prev) =>
        prev.map((link) =>
          link.id === id ? { ...link, is_public: !link.is_public } : link
        )
      );
    }
  };

  const filteredLinks = links.filter((link) => {
    const matchesTag = selectedTag ? link.tags.includes(selectedTag) : true;
    const matchesSearch = searchQuery
      ? link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesTag && matchesSearch;
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <h1 className="text-3xl font-bold">Tags</h1>
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search links..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag("")}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTag === ""
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                All
              </button>
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedTag === tag
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  {...link}
                  isPublic={link.is_public}
                  isStarred={link.is_starred}
                  createdAt={new Date(link.created_at)}
                  onDelete={handleDeleteLink}
                  onEdit={() => {}}
                  onToggleStar={handleToggleStar}
                  onToggleVisibility={handleToggleVisibility}
                />
              ))}
              {filteredLinks.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  {selectedTag
                    ? `No links found with tag "${selectedTag}"`
                    : "No links found matching your search."}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}