import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LinkCard } from "@/components/LinkCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useNavigate } from "react-router-dom";

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

export default function Starred() {
  const [links, setLinks] = useState<Link[]>([]);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchStarredLinks();
    }
  }, [user]);

  const fetchStarredLinks = async () => {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_starred', true)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch starred links",
        variant: "destructive",
      });
    } else {
      setLinks(data);
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
      fetchStarredLinks();
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
      setLinks((prev) =>
        prev.map((link) =>
          link.id === id ? { ...link, is_public: !link.is_public } : link
        )
      );
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Starred Links</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {links.map((link) => (
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
              {links.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No starred links yet.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}