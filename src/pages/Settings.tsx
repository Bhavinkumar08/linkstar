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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Settings() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [defaultVisibility, setDefaultVisibility] = useState(false);
  const [autoFetchMetadata, setAutoFetchMetadata] = useState(true);
  const [defaultTags, setDefaultTags] = useState("");

  useEffect(() => {
    if (user) {
      fetchUserSettings();
    }
  }, [user]);

  const fetchUserSettings = async () => {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setDefaultVisibility(data.default_visibility);
      setAutoFetchMetadata(data.auto_fetch_metadata);
      setDefaultTags(data.default_tags?.join(', ') || '');
    }
  };

  const saveSettings = async () => {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        default_visibility: defaultVisibility,
        auto_fetch_metadata: autoFetchMetadata,
        default_tags: defaultTags.split(',').map(tag => tag.trim()).filter(Boolean)
      });

    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Settings saved successfully");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>
            
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user?.email}</p>
                    <p className="text-sm text-muted-foreground">Google Account</p>
                  </div>
                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
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

                <Button onClick={saveSettings}>Save Preferences</Button>
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