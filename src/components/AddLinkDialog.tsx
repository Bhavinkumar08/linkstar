import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddLinkDialogProps {
  onAdd: (link: {
    name: string;
    url: string;
    description: string;
    tags: string[];
    isPublic: boolean;
  }) => void;
}

export function AddLinkDialog({ onAdd }: AddLinkDialogProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const { toast } = useToast();

  const fetchMetadata = async (url: string) => {
    if (!url || isFetchingMetadata) return;
    
    setIsFetchingMetadata(true);
    try {
      const response = await fetch(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        if (!name && data.data.title) {
          setName(data.data.title);
        }
        if (!description && data.data.description) {
          setDescription(data.data.description);
        }
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
      toast({
        title: "Error fetching metadata",
        description: "Could not automatically fetch website information.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (url) {
        fetchMetadata(url);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      onAdd({
        name,
        url,
        description,
        tags: tags.split(",").map(tag => tag.trim()).filter(Boolean),
        isPublic,
      });

      setOpen(false);
      resetForm();
      toast({
        title: "Link added successfully",
        description: "Your new link has been added to your collection.",
      });
    } catch (error) {
      toast({
        title: "Error adding link",
        description: "There was a problem adding your link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUrl("");
    setName("");
    setDescription("");
    setTags("");
    setIsPublic(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Link</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <div className="relative">
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              {isFetchingMetadata && (
                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="productivity, work, research"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="public">Make Public</Label>
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Link"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}