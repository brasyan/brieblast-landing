import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { siteUploadSchema, type SiteUploadFormData } from "@/lib/validations";
import {
  uploadSite,
  uploadSiteFromRepo,
  provisionSite,
  deleteSite,
  BriehostApiError,
} from "@/lib/briehostApi";

interface SiteUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => void;
}

const PUBLIC_DOMAIN = import.meta.env.VITE_PUBLIC_DOMAIN || "briehosting.be";

// Mirror app/gateway.derive_subdomain: lowercase, non-alnum → '-', trim, cap 40.
function deriveSubdomain(seed: string): string {
  return seed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

type Step = "pick" | "name" | "provisioning";
type Source = "zip" | "repo";

// Mirrors app/repo.validate_repo_url on the server: only public GitHub HTTPS
// URLs. We pre-check on the client so users don't wait for a round-trip just
// to be told they pasted the wrong link.
function repoUrlError(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return "Repository URL is required.";
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return "That doesn't look like a valid URL.";
  }
  if (parsed.protocol !== "https:") return "Only https:// URLs are accepted.";
  if (parsed.username || parsed.password) return "Don't put credentials in the URL.";
  if (parsed.host.toLowerCase() !== "github.com") {
    return "Only public GitHub repositories are supported for now.";
  }
  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length < 2) {
    return "Use the repo URL, e.g. https://github.com/owner/repo";
  }
  return null;
}

export default function SiteUploadDialog({ open, onOpenChange, onUploaded }: SiteUploadDialogProps) {
  const [step, setStep] = useState<Step>("pick");
  const [source, setSource] = useState<Source>("zip");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [scanFailedOpen, setScanFailedOpen] = useState(false);

  const [repoUrl, setRepoUrl] = useState("");
  const [repoBranch, setRepoBranch] = useState("");
  const [repoUrlInvalid, setRepoUrlInvalid] = useState<string | null>(null);

  const [siteId, setSiteId] = useState<string | null>(null);
  const [subdomain, setSubdomain] = useState("");
  const [subdomainError, setSubdomainError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SiteUploadFormData>({
    resolver: zodResolver(siteUploadSchema),
  });

  const resetAll = () => {
    reset();
    setStep("pick");
    setSource("zip");
    setProgress(0);
    setServerError(null);
    setUploading(false);
    setSiteId(null);
    setSubdomain("");
    setSubdomainError(null);
    setRepoUrl("");
    setRepoBranch("");
    setRepoUrlInvalid(null);
  };

  const closeAndReset = () => {
    resetAll();
    onOpenChange(false);
  };

  // If the user cancels after upload but before provisioning, drop the orphan
  // row + zip so it doesn't clutter the dashboard.
  const discardPending = async () => {
    if (!siteId) return;
    try {
      await deleteSite(siteId);
      onUploaded();
    } catch (e) {
      console.error("Failed to discard pending upload:", e);
    }
  };

  const close = async () => {
    if (uploading || step === "provisioning") return;
    if (step === "name" && siteId) {
      await discardPending();
    }
    closeAndReset();
  };

  const handleUploadResult = (result: { siteId: string; suggestedSubdomain?: string }, fallbackSeed: string) => {
    const suggested = result.suggestedSubdomain || deriveSubdomain(fallbackSeed);
    setSiteId(result.siteId);
    setSubdomain(suggested);
    setStep("name");
    setUploading(false);
  };

  const handleUploadError = (e: unknown, fallbackMessage: string) => {
    console.error("Upload error:", e);
    if (e instanceof BriehostApiError) {
      if (e.reason === "scan_failed") {
        setScanFailedOpen(true);
        setUploading(false);
        onOpenChange(false);
      } else {
        setServerError(e.message);
        setUploading(false);
      }
    } else {
      setServerError(fallbackMessage);
      setUploading(false);
    }
  };

  const onUploadSubmit = async (data: SiteUploadFormData) => {
    setServerError(null);
    setUploading(true);
    setProgress(0);
    try {
      const result = await uploadSite(data.file[0], (f) => setProgress(Math.round(f * 100)));
      const fallbackSeed = data.file[0].name.replace(/\.zip$/i, "");
      handleUploadResult(result, fallbackSeed);
    } catch (e) {
      handleUploadError(e, "Upload failed");
    }
  };

  const onRepoSubmit = async () => {
    const validationError = repoUrlError(repoUrl);
    if (validationError) {
      setRepoUrlInvalid(validationError);
      return;
    }
    setRepoUrlInvalid(null);
    setServerError(null);
    setUploading(true);
    // Clone progress isn't reported by the server; show indeterminate state.
    setProgress(0);
    try {
      const result = await uploadSiteFromRepo(repoUrl.trim(), repoBranch.trim() || undefined);
      // Use the repo name as the seed for the suggested subdomain fallback.
      const segments = new URL(repoUrl.trim()).pathname.split("/").filter(Boolean);
      const fallbackSeed = segments[1]?.replace(/\.git$/i, "") || "site";
      handleUploadResult(result, fallbackSeed);
    } catch (e) {
      handleUploadError(e, "Repo import failed");
    }
  };

  const onProvisionSubmit = async () => {
    if (!siteId) return;
    const cleaned = deriveSubdomain(subdomain);
    if (!cleaned) {
      setSubdomainError("Name must contain at least one letter or digit.");
      return;
    }
    setSubdomainError(null);
    setServerError(null);
    setStep("provisioning");
    try {
      await provisionSite(siteId, cleaned);
      toast.success("Provisioning started — your site will be live shortly.");
      onUploaded();
      resetAll();
      onOpenChange(false);
    } catch (e) {
      console.error("Provision error:", e);
      if (e instanceof BriehostApiError) {
        if (e.status === 409) {
          setSubdomainError(e.message || "That name is already taken.");
        } else {
          setServerError(e.message);
        }
      } else {
        setServerError("Provisioning request failed");
      }
      setStep("name");
    }
  };

  const fileReg = register("file");

  // Reset internal state if the dialog is forced closed externally.
  useEffect(() => {
    if (!open) {
      resetAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const cleanedPreview = deriveSubdomain(subdomain);

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (o) {
            onOpenChange(true);
          } else if (uploading || step === "provisioning") {
            onOpenChange(true);
          } else {
            void close();
          }
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          onEscapeKeyDown={(event) => {
            if (uploading || step === "provisioning") event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (uploading || step === "provisioning") event.preventDefault();
          }}
        >
          {step === "pick" && (
            <>
              <DialogHeader>
                <DialogTitle>Upload a site</DialogTitle>
                <DialogDescription>
                  Upload a .zip or import from a public GitHub repo. You'll pick the URL on the next step.
                </DialogDescription>
              </DialogHeader>

              <Tabs value={source} onValueChange={(v) => !uploading && setSource(v as Source)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="zip" disabled={uploading}>Zip file</TabsTrigger>
                  <TabsTrigger value="repo" disabled={uploading}>GitHub repo</TabsTrigger>
                </TabsList>

                <TabsContent value="zip" className="mt-4">
                  <form onSubmit={handleSubmit(onUploadSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="site-zip">Zip file</Label>
                      <Input
                        id="site-zip"
                        type="file"
                        accept=".zip,application/zip"
                        disabled={uploading}
                        {...fileReg}
                      />
                      {errors.file && (
                        <p className="text-sm text-destructive">{errors.file.message as string}</p>
                      )}
                    </div>

                    {uploading && source === "zip" && (
                      <div className="space-y-1">
                        <Progress value={progress} />
                        <p className="text-xs text-muted-foreground">{progress}%</p>
                      </div>
                    )}

                    {serverError && <p className="text-sm text-destructive">{serverError}</p>}

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => void close()} disabled={uploading}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={uploading}>
                        {uploading ? "Uploading…" : "Upload"}
                      </Button>
                    </DialogFooter>
                  </form>
                </TabsContent>

                <TabsContent value="repo" className="mt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="repo-url">Repository URL</Label>
                      <Input
                        id="repo-url"
                        type="url"
                        placeholder="https://github.com/owner/repo"
                        value={repoUrl}
                        onChange={(e) => {
                          setRepoUrl(e.target.value);
                          setRepoUrlInvalid(null);
                        }}
                        disabled={uploading}
                        autoComplete="off"
                      />
                      {repoUrlInvalid && (
                        <p className="text-sm text-destructive">{repoUrlInvalid}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Public repos only for now. We'll clone the default branch unless you pick another.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="repo-branch">Branch <span className="text-muted-foreground">(optional)</span></Label>
                      <Input
                        id="repo-branch"
                        type="text"
                        placeholder="main"
                        value={repoBranch}
                        onChange={(e) => setRepoBranch(e.target.value)}
                        disabled={uploading}
                        autoComplete="off"
                      />
                    </div>

                    {uploading && source === "repo" && (
                      <p className="text-xs text-muted-foreground">Cloning repository…</p>
                    )}

                    {serverError && <p className="text-sm text-destructive">{serverError}</p>}

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => void close()} disabled={uploading}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={() => void onRepoSubmit()} disabled={uploading}>
                        {uploading ? "Importing…" : "Import repo"}
                      </Button>
                    </DialogFooter>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}

          {(step === "name" || step === "provisioning") && (
            <>
              <DialogHeader>
                <DialogTitle>Choose your site URL</DialogTitle>
                <DialogDescription>
                  Pick a name for your site. Letters and digits only — anything else becomes a dash.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subdomain">Site name</Label>
                  <div className="flex items-stretch overflow-hidden rounded-md border border-input bg-background">
                    <Input
                      id="subdomain"
                      value={subdomain}
                      onChange={(e) => {
                        setSubdomain(e.target.value);
                        setSubdomainError(null);
                      }}
                      placeholder="my-site"
                      disabled={step === "provisioning"}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      maxLength={40}
                    />
                    <span className="flex items-center bg-muted px-3 text-sm text-muted-foreground border-l border-input">
                      .{PUBLIC_DOMAIN}
                    </span>
                  </div>
                  {cleanedPreview && cleanedPreview !== subdomain && (
                    <p className="text-xs text-muted-foreground">
                      Will be saved as <span className="font-mono">{cleanedPreview}.{PUBLIC_DOMAIN}</span>
                    </p>
                  )}
                  {subdomainError && (
                    <p className="text-sm text-destructive">{subdomainError}</p>
                  )}
                </div>

                {serverError && <p className="text-sm text-destructive">{serverError}</p>}

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void close()}
                    disabled={step === "provisioning"}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void onProvisionSubmit()}
                    disabled={step === "provisioning" || !cleanedPreview}
                  >
                    {step === "provisioning" ? "Starting…" : "Start Provisioning"}
                  </Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={scanFailedOpen} onOpenChange={setScanFailedOpen}>
        <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Scan Failed</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                We were unable to verify the security of your website. This could indicate potential security issues or violations of our security policies.
              </p>
              <p>
                Please contact <span className="font-semibold text-foreground">info@briehosting.be</span> to discuss this issue and ensure your website meets our security requirements.
              </p>
              <p className="text-xs text-muted-foreground">
                Our security team will be happy to assist you in resolving this matter.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setScanFailedOpen(false)}>
            Understood
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
