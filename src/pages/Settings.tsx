import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/use-theme";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Moon, Sun, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface UserSettings {
  default_visibility: boolean;
  auto_fetch_metadata: boolean;
  default_tags: string[];
  username?: string;
}

export default function Settings() {
  const { user, signOut, loading } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [defaultVisibility, setDefaultVisibility] = useState(false);
  const [autoFetchMetadata, setAutoFetchMetadata] = useState(true);
  const [defaultTags, setDefaultTags] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserSettings();
      setUsername(user.user_metadata?.username || "");
    }
  }, [user]);

  const fetchUserSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw error;
      }

      if (data) {
        setDefaultVisibility(data.default_visibility);
        setAutoFetchMetadata(data.auto_fetch_metadata);
        setDefaultTags(data.default_tags?.join(', ') || '');
      }
    } catch (error) {
      toast.error("Failed to load settings");
      console.error('Error fetching settings:', error);
    }
  };

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