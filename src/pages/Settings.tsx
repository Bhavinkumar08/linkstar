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

interface UserSettings {
  default_visibility: boolean;
  auto_fetch_metadata: boolean;
  default_tags: string[];
  username?: string;
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [defaultVisibility, setDefaultVisibility] = useState(false);
  const [autoFetchMetadata, setAutoFetchMetadata] = useState(true);
  const [defaultTags, setDefaultTags] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserSettings();
      setUsername(user.user_metadata?.username || "");
    }
  }, [user]);

  const fetchUserSettings = async () => {
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

  const saveAllSettings = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      // Update username and settings in a single transaction
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          username,
          default_visibility: defaultVisibility,
          auto_fetch_metadata: autoFetchMetadata,
          default_tags: defaultTags.split(',').map(tag => tag.trim()).filter(Boolean),
          updated_at: new Date().toISOString()
        });

      if (settingsError) throw settingsError;

      // Update user metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: { username }
      });

      if (userError) throw userError;

      toast.success("All settings saved successfully");
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/login");
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error("Failed to sign out");
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      // Delete the user using Supabase admin API
      const { error: deleteError } = await supabase.rpc('delete_user');
      
      if (deleteError) throw deleteError;

      await signOut();
      toast.success("Account deleted successfully");
      navigate("/login");
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error("Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Settings</h1>
              <Button
                size="lg"
                onClick={saveAllSettings}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete Account"}
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Link Preferences</CardTitle>
                <CardDescription>Configure default settings for new links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Default Visibility</Label>
                    <p className="text-sm text-muted-foreground">
                      Set new links as public by default
                    </p>
                  </div>
                  <Switch
                    checked={defaultVisibility}
                    onCheckedChange={setDefaultVisibility}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-fetch Metadata</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically fetch title and description from URLs
                    </p>
                  </div>
                  <Switch
                    checked={autoFetchMetadata}
                    onCheckedChange={setAutoFetchMetadata}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Default Tags</Label>
                  <Input
                    placeholder="Enter default tags, separated by commas"
                    value={defaultTags}
                    onChange={(e) => setDefaultTags(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    These tags will be automatically added to new links
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle between light and dark theme
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sun className="h-4 w-4" />
                    <Switch
                      checked={theme === "dark"}
                      onCheckedChange={(checked) =>
                        setTheme(checked ? "dark" : "light")
                      }
                    />
                    <Moon className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}