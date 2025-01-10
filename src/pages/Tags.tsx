import { useState, useEffect, useCallback } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { LinkCard } from "@/components/LinkCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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

export default function Tags() {
  const [links, setLinks] = useState<Link[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const fetchLinks = useCallback(async () => {
    if (!user) return;

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

  // ... rest of the component code remains the same ...

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SidebarProvider>
      {/* Rest of the JSX remains the same */}
    </SidebarProvider>
  );
}