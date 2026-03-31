import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  ImageIcon,
  Loader2,
  LogOut,
  Pencil,
  Shield,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { AnimeEntry, SiteSettings } from "../backend.d";
import {
  uploadFileWithProgress,
  useAddAnime,
  useDeleteAnime,
  useUpdateAnime,
  useUpdateSettings,
} from "../hooks/useQueries";

const ADMIN_PASSWORD = "ayanbhai07682";

interface UploadFieldProps {
  label: string;
  accept: string;
  currentUrl?: string;
  onUploaded: (url: string) => void;
  type?: "image" | "video";
}

function UploadField({
  label,
  accept,
  currentUrl,
  onUploaded,
  type = "image",
}: UploadFieldProps) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [localUrl, setLocalUrl] = useState(currentUrl || "");
  const inputId = `upload-${label.replace(/\s+/g, "-").toLowerCase()}`;

  async function handleFile(file: File) {
    setUploading(true);
    setProgress(0);
    try {
      const url = await uploadFileWithProgress(file, (pct) => setProgress(pct));
      setLocalUrl(url);
      onUploaded(url);
      toast.success(`${label} uploaded successfully!`);
    } catch (err) {
      toast.error("Upload failed. Please try again.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <label
        htmlFor={inputId}
        className="block border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer"
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onDragOver={(e) => e.preventDefault()}
        data-ocid="upload.dropzone"
      >
        <input
          id={inputId}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Uploading... {progress}%</span>
            </div>
            <Progress
              value={progress}
              className="h-2"
              data-ocid="upload.loading_state"
            />
          </div>
        ) : localUrl ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-green-500">
                <CheckCircle2 className="h-4 w-4" />
                <span>Uploaded successfully</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setLocalUrl("");
                  onUploaded("");
                }}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {type === "image" ? (
              <img
                src={localUrl}
                alt="preview"
                className="h-24 w-auto rounded object-cover"
              />
            ) : (
              // biome-ignore lint/a11y/useMediaCaption: short preview clip
              <video src={localUrl} className="h-24 w-auto rounded" controls />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-4 text-muted-foreground">
            {type === "video" ? (
              <Video className="h-8 w-8" />
            ) : (
              <ImageIcon className="h-8 w-8" />
            )}
            <p className="text-sm font-medium">Click or drag to upload</p>
            <p className="text-xs">
              {type === "video"
                ? "All video formats supported (including 1-hour+ videos)"
                : "PNG, JPG, WebP"}
            </p>
          </div>
        )}
      </label>
    </div>
  );
}

function AddAnimeForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const addAnime = useAddAnime();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!videoUrl) {
      toast.error("Please upload a video first");
      return;
    }
    try {
      await addAnime.mutateAsync({
        title,
        description,
        thumbnailUrl,
        videoUrl,
      });
      toast.success("Anime added successfully!");
      setTitle("");
      setDescription("");
      setThumbnailUrl("");
      setVideoUrl("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to add anime: ${msg}`);
      console.error(err);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="add-title">Title *</Label>
        <Input
          id="add-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Attack on Titan"
          data-ocid="add_anime.input"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="add-desc">Description</Label>
        <Textarea
          id="add-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief synopsis..."
          rows={3}
          data-ocid="add_anime.textarea"
        />
      </div>
      <UploadField
        label="Thumbnail Image"
        accept="image/*"
        onUploaded={setThumbnailUrl}
        type="image"
      />
      <UploadField
        label="Video File (supports 1-hour+ videos)"
        accept="video/*"
        onUploaded={setVideoUrl}
        type="video"
      />
      {videoUrl && (
        <div className="flex items-center gap-2 text-sm text-green-500">
          <CheckCircle2 className="h-4 w-4" /> Video ready to save
        </div>
      )}
      <Button
        type="submit"
        disabled={addAnime.isPending || !videoUrl}
        data-ocid="add_anime.submit_button"
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {addAnime.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Adding...
          </>
        ) : (
          "Add Anime"
        )}
      </Button>
    </form>
  );
}

interface EditFormProps {
  anime: AnimeEntry;
  onDone: () => void;
}

function EditAnimeForm({ anime, onDone }: EditFormProps) {
  const [title, setTitle] = useState(anime.title);
  const [description, setDescription] = useState(anime.description);
  const [thumbnailUrl, setThumbnailUrl] = useState(anime.thumbnailBlobId);
  const [videoUrl, setVideoUrl] = useState(anime.videoBlobId);
  const updateAnime = useUpdateAnime();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateAnime.mutateAsync({
        id: anime.id,
        title,
        description,
        thumbnailUrl,
        videoUrl,
      });
      toast.success("Anime updated!");
      onDone();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Update failed: ${msg}`);
      console.error(err);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          data-ocid="edit_anime.input"
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          data-ocid="edit_anime.textarea"
        />
      </div>
      <UploadField
        label="Replace Thumbnail"
        accept="image/*"
        currentUrl={thumbnailUrl}
        onUploaded={setThumbnailUrl}
        type="image"
      />
      <UploadField
        label="Replace Video (supports 1-hour+ videos)"
        accept="video/*"
        currentUrl={videoUrl}
        onUploaded={setVideoUrl}
        type="video"
      />
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={updateAnime.isPending}
          data-ocid="edit_anime.save_button"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {updateAnime.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onDone}
          data-ocid="edit_anime.cancel_button"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ManageAnimeTab({ animeList }: { animeList: AnimeEntry[] }) {
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const deleteAnime = useDeleteAnime();

  return (
    <div className="space-y-3">
      {animeList.length === 0 && (
        <p
          data-ocid="manage.empty_state"
          className="text-muted-foreground py-8 text-center"
        >
          No anime added yet.
        </p>
      )}
      {animeList.map((anime, idx) => (
        <div
          key={String(anime.id)}
          data-ocid={`manage.item.${idx + 1}`}
          className="border border-border rounded-lg p-4 bg-card"
        >
          <div className="flex items-start gap-4">
            {anime.thumbnailBlobId && (
              <img
                src={anime.thumbnailBlobId}
                alt={anime.title}
                className="w-16 h-24 object-cover rounded flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-foreground truncate">
                  {anime.title}
                </h3>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setEditingId(editingId === anime.id ? null : anime.id)
                    }
                    data-ocid={`manage.edit_button.${idx + 1}`}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        data-ocid={`manage.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent data-ocid="manage.dialog">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Anime?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{anime.title}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-ocid="manage.cancel_button">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          data-ocid="manage.confirm_button"
                          onClick={() => deleteAnime.mutate(anime.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {anime.description}
              </p>
              {anime.videoBlobId && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  <Video className="h-3 w-3 mr-1" />
                  Video uploaded
                </Badge>
              )}
            </div>
          </div>
          <AnimatePresence>
            {editingId === anime.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <EditAnimeForm
                  anime={anime}
                  onDone={() => setEditingId(null)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

function SiteSettingsTab({ settings }: { settings?: SiteSettings }) {
  const [siteName, setSiteName] = useState(settings?.siteName || "AnimeStream");
  const [logoUrl, setLogoUrl] = useState(settings?.logoUrl || "");
  const [heroBlobId, setHeroBlobId] = useState(settings?.heroBlobId || "");
  const [bgBlobId, setBgBlobId] = useState(settings?.bgBlobId || "");
  const [bgType, setBgType] = useState(settings?.bgType || "color");
  const [bgColor, setBgColor] = useState(settings?.bgColor || "#0a0a0a");
  const updateSettings = useUpdateSettings();

  function handleBgTypeChange(newType: string) {
    setBgType(newType);
    // Reset bgBlobId when switching types so old file doesn't carry over
    setBgBlobId("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateSettings.mutateAsync({
        siteName,
        logoUrl,
        heroBlobId,
        bgBlobId,
        bgType,
        bgColor,
      });
      toast.success("Settings saved!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(`Failed to save settings: ${msg}`);
      console.error(err);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="site-name">Site Name</Label>
        <Input
          id="site-name"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          data-ocid="settings.input"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="logo-url">Logo URL</Label>
        <Input
          id="logo-url"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://..."
          data-ocid="settings.logo_input"
        />
      </div>
      <div className="space-y-3">
        <Label>Hero Banner Background</Label>
        <UploadField
          label="Hero Image/Video"
          accept="image/*,video/*"
          currentUrl={heroBlobId}
          onUploaded={setHeroBlobId}
          type="image"
        />
      </div>
      <div className="space-y-3">
        <Label>Website Background Type</Label>
        <div className="flex gap-3">
          {(["color", "image", "video"] as const).map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="bgType"
                value={t}
                checked={bgType === t}
                onChange={() => handleBgTypeChange(t)}
                className="accent-primary"
              />
              <span className="capitalize text-sm">{t}</span>
            </label>
          ))}
        </div>
        {bgType === "color" && (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="h-10 w-14 rounded cursor-pointer border border-border bg-transparent"
              data-ocid="settings.color_input"
            />
            <span className="text-sm text-muted-foreground">{bgColor}</span>
          </div>
        )}
        {bgType === "image" && (
          <UploadField
            label="Background Image"
            accept="image/*"
            currentUrl={bgBlobId}
            onUploaded={setBgBlobId}
            type="image"
          />
        )}
        {bgType === "video" && (
          <UploadField
            label="Background Video (supports large files)"
            accept="video/*"
            currentUrl={bgBlobId}
            onUploaded={setBgBlobId}
            type="video"
          />
        )}
      </div>
      <Button
        type="submit"
        disabled={updateSettings.isPending}
        data-ocid="settings.submit_button"
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {updateSettings.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Saving...
          </>
        ) : (
          "Save Settings"
        )}
      </Button>
    </form>
  );
}

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("adminLoggedIn", "true");
      onLogin();
    } else {
      setError(true);
      setPassword("");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm p-8 bg-card rounded-2xl border border-border shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-foreground">
              Admin Access
            </h2>
            <p className="text-xs text-muted-foreground">
              Enter your password to continue
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-pass">Password</Label>
            <Input
              id="admin-pass"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Enter admin password"
              data-ocid="admin.input"
            />
            {error && (
              <p
                data-ocid="admin.error_state"
                className="text-sm text-destructive"
              >
                Incorrect password
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground"
            data-ocid="admin.submit_button"
          >
            Login
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

interface AdminPanelProps {
  animeList: AnimeEntry[];
  settings?: SiteSettings;
  onClose: () => void;
}

export function AdminPanel({ animeList, settings, onClose }: AdminPanelProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("adminLoggedIn") === "true",
  );

  function handleLogout() {
    localStorage.removeItem("adminLoggedIn");
    setIsLoggedIn(false);
    onClose();
  }

  if (!isLoggedIn) return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-foreground">
                Admin Panel
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage your anime site
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              data-ocid="admin.close_button"
              size="sm"
            >
              ← Back to Site
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              data-ocid="admin.logout_button"
              size="sm"
            >
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="add" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="add" data-ocid="admin.add_tab">
              Add Anime
            </TabsTrigger>
            <TabsTrigger value="manage" data-ocid="admin.manage_tab">
              Manage
              {animeList.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {animeList.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" data-ocid="admin.settings_tab">
              Site Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="add">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-5 text-foreground">
                Add New Anime
              </h2>
              <AddAnimeForm />
            </div>
          </TabsContent>

          <TabsContent value="manage">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-5 text-foreground">
                Manage Anime
              </h2>
              <ManageAnimeTab animeList={animeList} />
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-5 text-foreground">
                Site Settings
              </h2>
              <SiteSettingsTab settings={settings} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
