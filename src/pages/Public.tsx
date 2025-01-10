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
  user_id: string;
  user_settings: {
    username: string | null;
  } | null;
}

export default function Public() {
  const [links, setLinks] = useState<Link[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const fetchPublicLinks = useCallback(async () => {
    if (!user) return;
    
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
  }, [toast, user]);

  useEffect(() => {
    if (user) {
      fetchPublicLinks();
    }
  }, [user, fetchPublicLinks]);

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