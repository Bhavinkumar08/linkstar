import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LinkCard } from "@/components/LinkCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

export default function Tags() {
  const [links, setLinks] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchLinks();
    }
  }, [user]);

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch links",
        variant: "destructive",
      });
    } else {
      setLinks(data);
      // Extract unique tags
      const allTags = data.reduce((acc, link) => {
        link.tags.forEach(tag => acc.add(tag));
        return acc;
      }, new Set());
      setTags(Array.from(allTags));
    }
  };

  const filteredLinks = selectedTag
    ? links.filter(link => link.tags.includes(selectedTag))
    : links;

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
      await fetchLinks();
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
      .update({ is_starred: !link.is_starred })
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update link",
        variant: "destructive",
      });
    } else {
      await fetchLinks();
    }
  };

  const handleToggleVisibility = async (id: string) => {
    const link = links.find((l) => l.id === id);
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
      await fetchLinks();
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Tags</h1>
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  {...link}
                  onDelete={handleDeleteLink}
                  onEdit={() => {}}
                  onToggleStar={handleToggleStar}
                  onToggleVisibility={handleToggleVisibility}
                />
              ))}
              {filteredLinks.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  {selectedTag ? `No links found with tag "${selectedTag}"` : "No links yet."}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}