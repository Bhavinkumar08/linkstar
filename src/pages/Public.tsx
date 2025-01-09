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
  user_id: string;
  user_settings: {
    username: string | null;
  } | null;
}

export default function Public() {
  const [links, setLinks] = useState<Link[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPublicLinks = useCallback(async () => {
    const { data: linksData, error: linksError } = await supabase
      .from('links')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (linksError) {
      console.error('Error fetching public links:', linksError);
      toast({
        title: "Error",
        description: "Failed to fetch public links",
        variant: "destructive",
      });
      return;
    }

    setLinks(linksData || []);
  }, [toast]);

  useEffect(() => {
    fetchPublicLinks();
  }, [fetchPublicLinks]);

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
      await fetchPublicLinks();
      toast({
        title: "Success",
        description: "Link deleted successfully",
      });
    }
  };

  const handleToggleStar = async (id: string) => {
    const link = links.find(l => l.id === id);

    const { error } = await supabase
      .from('links')
      .update({ is_starred: !link.is_starred })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update link",
        variant: "destructive",
      });
    } else {
      await fetchPublicLinks();
    }
  };

  const handleToggleVisibility = async (id: string) => {
    const link = links.find(l => l.id === id);

    const { error } = await supabase
      .from('links')
      .update({ is_public: !link.is_public })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update link",
        variant: "destructive",
      });
    } else {
      await fetchPublicLinks();
    }
  };

  const filteredLinks = links.filter((link) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      link.name.toLowerCase().includes(searchLower) ||
      link.description.toLowerCase().includes(searchLower) ||
      link.url.toLowerCase().includes(searchLower) ||
      link.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
      'Anonymous'.toLowerCase().includes(searchLower)
    );
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <h1 className="text-3xl font-bold">Public Links</h1>
              <div className="relative w-full md:w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search public links..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  {...link}
                  name={`${link.name} (by Anonymous)`}
                  isPublic={link.is_public}
                  isStarred={link.is_starred}
                  createdAt={new Date(link.created_at)}
                  onDelete={handleDeleteLink}
                  onEdit={() => {}}
                  onToggleStar={handleToggleStar}
                  onToggleVisibility={handleToggleVisibility}
                  isOwner={link.user_id === user.id}
                />
              ))}
              {filteredLinks.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  {searchQuery
                    ? "No public links found matching your search."
                    : "No public links available."}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}