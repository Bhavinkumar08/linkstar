import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LinkCard } from "@/components/LinkCard";
import { AddLinkDialog } from "@/components/AddLinkDialog";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Moon, Sun, Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const handleAddLink = (newLink: Omit<Link, "id" | "isStarred">) => {
    const link: Link = {
      ...newLink,
      id: crypto.randomUUID(),
      isStarred: false,
    };
    setLinks((prev) => [link, ...prev]);
  };

  const handleDeleteLink = (id: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
    toast({
      title: "Link deleted",
      description: "The link has been removed from your collection.",
    });
  };

  const handleEditLink = (id: string) => {
    toast({
      title: "Edit functionality",
      description: "Edit functionality will be implemented in the next version.",
    });
  };

  const handleToggleStar = (id: string) => {
    setLinks((prev) =>
      prev.map((link) =>
        link.id === id ? { ...link, isStarred: !link.isStarred } : link
      )
    );
  };

  const handleToggleVisibility = (id: string) => {
    setLinks((prev) =>
      prev.map((link) =>
        link.id === id ? { ...link, isPublic: !link.isPublic } : link
      )
    );
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
                  {...link}
                  onDelete={handleDeleteLink}
                  onEdit={handleEditLink}
                  onToggleStar={handleToggleStar}
                  onToggleVisibility={handleToggleVisibility}
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
