import { useState, useEffect, useCallback } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LinkCard } from "@/components/LinkCard";
import { AddLinkDialog } from "@/components/AddLinkDialog";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Moon, Sun, Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditLinkDialog } from "@/components/EditLinkDialog";

interface Link {
  id: string;
  name: string;
  url: string;
  description: string;
  tags: string[];
  isPublic: boolean;
  isStarred: boolean;
  createdAt: Date;
}

type SortOption = "newest" | "oldest" | "name" | "starred";

export default function Index() {
  const [links, setLinks] = useState<Link[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  const fetchLinks = useCallback(async () => {
    const { data, error } = await supabase
      .from("links")
      .select("id, name, url, description, tags, is_public, is_starred, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch links",
        variant: "destructive",
      });
    } else if (data) {
      const transformed = data.map((d) => ({
        id: d.id,
        name: d.name,
        url: d.url,
        description: d.description,
        tags: d.tags,
        isPublic: d.is_public,
        isStarred: d.is_starred,
        createdAt: d.created_at,
      }));
      setLinks(transformed);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchLinks();
    }
  }, [user, fetchLinks]);

  const handleAddLink = async ({
    name,
    url,
    description,
    tags,
    isPublic,
  }: {
    name: string;
    url: string;
    description: string;
    tags: string[];
    isPublic: boolean;
  }) => {
    const { data, error } = await supabase
      .from("links")
      .insert([{ name, url, description, tags, is_public: isPublic, user_id: user.id, is_starred: false }])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add link",
        variant: "destructive",
      });
    } else if (data) {
      setLinks((prev) => [
        {
          id: data.id,
          name: data.name,
          url: data.url,
          description: data.description,
          tags: data.tags,
          isPublic: data.is_public,
          isStarred: data.is_starred,
          createdAt: data.created_at,
        },
        ...prev,
      ]);
      toast({
        title: "Success",
        description: "Link added successfully",
      });
    }
  };

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

  const handleEditLink = async (id: string, updates: {
    name: string;
    url: string;
    description: string;
    tags: string[];
    isPublic: boolean;
  }) => {
    const { error } = await supabase
      .from('links')
      .update({
        name: updates.name,
        url: updates.url,
        description: updates.description,
        tags: updates.tags,
        is_public: updates.isPublic,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update link",
        variant: "destructive",
      });
    } else {
      await fetchLinks();
      toast({
        title: "Success",
        description: "Link updated successfully",
      });
    }
  };

  const handleToggleStar = async (id: string) => {
    const link = links.find((l) => l.id === id);
    const { error } = await supabase
      .from('links')
      .update({ is_starred: !link?.isStarred })
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
          link.id === id ? { ...link, isStarred: !link.isStarred } : link
        )
      );
    }
  };

  const handleToggleVisibility = async (id: string) => {
    const link = links.find((l) => l.id === id);
    const { error } = await supabase
      .from('links')
      .update({ is_public: !link?.isPublic })
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
          link.id === id ? { ...link, isPublic: !link.isPublic } : link
        )
      );
    }
  };

  const sortLinks = (links: Link[]) => {
    switch (sortOption) {
      case "newest":
        return [...links].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return [...links].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "name":
        return [...links].sort((a, b) => a.name.localeCompare(b.name));
      case "starred":
        return [...links].sort((a, b) => (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0));
      default:
        return links;
    }
  };

  const filteredLinks = sortLinks(
    links.filter((link) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        link.name.toLowerCase().includes(searchLower) ||
        link.description.toLowerCase().includes(searchLower) ||
        link.url.toLowerCase().includes(searchLower) ||
        link.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    })
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <h1 className="text-3xl font-bold">My Links</h1>
              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search links..."
                    className="pl-9 w-full md:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSortOption("newest")}>
                        Newest First
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption("oldest")}>
                        Oldest First
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption("name")}>
                        Sort by Name
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption("starred")}>
                        Starred First
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </Button>
                  <AddLinkDialog onAdd={handleAddLink} />
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  id={link.id}
                  name={link.name}
                  url={link.url}
                  description={link.description}
                  tags={link.tags}
                  isPublic={link.isPublic}
                  isStarred={link.isStarred}
                  createdAt={link.createdAt}
                  onDelete={handleDeleteLink}
                  onEdit={handleEditLink}
                  onToggleStar={handleToggleStar}
                  onToggleVisibility={handleToggleVisibility}
                  EditDialog={EditLinkDialog}
                />
              ))}
              {filteredLinks.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  {searchQuery
                    ? "No links found matching your search."
                    : "No links yet. Click \"Add Link\" to get started!"}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}