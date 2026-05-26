import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  redeploySiteFromZip,
  redeploySiteFromRepo,
  BriehostApiError,
} from "@/lib/briehostApi";
import type { Site } from "@/hooks/useSites";

interface SiteUpdateDialogProps {
  site: Site | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

type Source = "zip" | "repo";

// Mirrors app/repo._ALLOWED_HOSTS on the server. See SiteUploadDialog.tsx.
const ALLOWED_REPO_HOSTS = ["github.com", "gitlab.com", "git.gay"] as const;

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
  const host = parsed.host.toLowerCase();
  if (!ALLOWED_REPO_HOSTS.includes(host as (typeof ALLOWED_REPO_HOSTS)[number])) {
    return `Only public repos on ${ALLOWED_REPO_HOSTS.join(", ")} are supported.`;
  }
  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length < 2) {
    return `Use the full repo URL, e.g. https://${host}/owner/repo`;
  }
  return null;
}

export default function SiteUpdateDialog({
  site,
  open,
  onOpenChange,
  onUpdated,
}: SiteUpdateDialogProps) {
  // For zip-uploaded sites default to the zip tab; for repo-uploaded sites
  // default to the repo tab and prefill the URL so it's still one click.
  const [source, setSource] = useState<Source>("zip");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [repoUrl, setRepoUrl] = useState("");
  const [repoBranch, setRepoBranch] = useState("");
  const [repoUrlInvalid, setRepoUrlInvalid] = useState<string | null>(null);

  // Sync defaults when a new site is loaded into the dialog.
  useEffect(() => {
    if (!open) return;
    setSource(site?.repo_url ? "repo" : "zip");
    setRepoUrl(site?.repo_url ?? "");
    setRepoBranch(site?.repo_branch ?? "");
    setFile(null);
    setProgress(0);
    setServerError(null);
    setRepoUrlInvalid(null);
  }, [open, site]);

  const close = () => {
    if (submitting) return;
    onOpenChange(false);
  };

  const handleApiError = (e: unknown, fallback: string) => {
    console.error("Update error:", e);
    if (e instanceof BriehostApiError) {
      setServerError(e.message || fallback);
    } else {
      setServerError(fallback);
    }
  };

  const onZipSubmit = async () => {
    if (!site || !file) {
      setServerError("Pick a .zip file first.");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".zip")) {
      setServerError("File must be a .zip");
      return;
    }
    setServerError(null);
    setSubmitting(true);
    setProgress(0);
    try {
      await redeploySiteFromZip(site.id, file, (f) => setProgress(Math.round(f * 100)));
      toast.success("Update queued — your site will refresh shortly.");
      onUpdated();
      onOpenChange(false);
    } catch (e) {
      handleApiError(e, "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onRepoSubmit = async () => {
    if (!site) return;
    const v = repoUrlError(repoUrl);
    if (v) {
      setRepoUrlInvalid(v);
      return;
    }
    setRepoUrlInvalid(null);
    setServerError(null);
    setSubmitting(true);
    try {
      await redeploySiteFromRepo(site.id, repoUrl.trim(), repoBranch.trim() || undefined);
      toast.success("Update queued — pulling from repo now.");
      onUpdated();
      onOpenChange(false);
    } catch (e) {
      handleApiError(e, "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) close();
        else onOpenChange(true);
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        onEscapeKeyDown={(e) => {
          if (submitting) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          if (submitting) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Update site</DialogTitle>
          <DialogDescription>
            Push new contents into{" "}
            <span className="font-mono">{site?.subdomain ?? site?.name}</span>. The
            container, subdomain, and gateway route stay put — only the files change.
            Uploaded zips go through the same malware scan as a fresh upload.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={source} onValueChange={(v) => !submitting && setSource(v as Source)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="zip" disabled={submitting}>Upload zip</TabsTrigger>
            <TabsTrigger value="repo" disabled={submitting}>From repo</TabsTrigger>
          </TabsList>

          <TabsContent value="zip" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="update-zip">New zip file</Label>
                <Input
                  id="update-zip"
                  type="file"
                  accept=".zip,application/zip"
                  disabled={submitting}
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setServerError(null);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Max 100 MB. Replaces the previous bundle in the same CT.
                </p>
              </div>

              {submitting && source === "zip" && (
                <div className="space-y-1">
                  <Progress value={progress} />
                  <p className="text-xs text-muted-foreground">{progress}%</p>
                </div>
              )}

              {serverError && <p className="text-sm text-destructive">{serverError}</p>}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={close} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => void onZipSubmit()} disabled={submitting || !file}>
                  {submitting ? "Uploading…" : "Update site"}
                </Button>
              </DialogFooter>
            </div>
          </TabsContent>

          <TabsContent value="repo" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="update-repo-url">Repository URL</Label>
                <Input
                  id="update-repo-url"
                  type="url"
                  placeholder="https://github.com/owner/repo"
                  value={repoUrl}
                  onChange={(e) => {
                    setRepoUrl(e.target.value);
                    setRepoUrlInvalid(null);
                  }}
                  disabled={submitting}
                  autoComplete="off"
                />
                {repoUrlInvalid && <p className="text-sm text-destructive">{repoUrlInvalid}</p>}
                <p className="text-xs text-muted-foreground">
                  {site?.repo_url
                    ? "Re-pull the current repo, or paste a different URL to switch sources."
                    : "Switch this site to a public git repo. Future updates become one-click."}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="update-repo-branch">
                  Branch <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="update-repo-branch"
                  type="text"
                  placeholder="main"
                  value={repoBranch}
                  onChange={(e) => setRepoBranch(e.target.value)}
                  disabled={submitting}
                  autoComplete="off"
                />
              </div>

              {submitting && source === "repo" && (
                <p className="text-xs text-muted-foreground">Cloning repository…</p>
              )}

              {serverError && <p className="text-sm text-destructive">{serverError}</p>}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={close} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => void onRepoSubmit()} disabled={submitting}>
                  {submitting ? "Updating…" : "Update site"}
                </Button>
              </DialogFooter>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
