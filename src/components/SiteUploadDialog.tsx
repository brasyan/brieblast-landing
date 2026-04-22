import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { siteUploadSchema, type SiteUploadFormData } from "@/lib/validations";
import { uploadSite, BriehostApiError } from "@/lib/briehostApi";

interface SiteUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => void;
}

export default function SiteUploadDialog({ open, onOpenChange, onUploaded }: SiteUploadDialogProps) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SiteUploadFormData>({
    resolver: zodResolver(siteUploadSchema),
  });

  const resetAndClose = () => {
    reset();
    setProgress(0);
    setServerError(null);
    setUploading(false);
    onOpenChange(false);
  };

  const close = () => {
    if (uploading) return;
    resetAndClose();
  };

  const onSubmit = async (data: SiteUploadFormData) => {
    setServerError(null);
    setUploading(true);
    setProgress(0);
    try {
      await uploadSite(data.file, (f) => setProgress(Math.round(f * 100)));
      toast.success("Site uploaded — provisioning will begin shortly.");
      onUploaded();
      resetAndClose();
    } catch (e) {
      const msg = e instanceof BriehostApiError ? e.message : "Upload failed";
      setServerError(msg);
      setUploading(false);
    }
  };

  // RHF + native file inputs: register("file") gives a FileList; we need the first File.
  const fileReg = register("file", {
    setValueAs: (v: FileList | File | null) =>
      v instanceof FileList ? v[0] : v,
  });

  return (
    <Dialog open={open} onOpenChange={(o) => (o || uploading ? onOpenChange(true) : close())}>
      <DialogContent
        className="sm:max-w-md"
        onEscapeKeyDown={(event) => {
          if (uploading) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (uploading) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Upload a site</DialogTitle>
          <DialogDescription>
            Upload a .zip of your PHP site (max 100 MB). It will be deployed to a fresh container.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          {uploading && (
            <div className="space-y-1">
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground">{progress}%</p>
            </div>
          )}

          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={close} disabled={uploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? "Uploading…" : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
