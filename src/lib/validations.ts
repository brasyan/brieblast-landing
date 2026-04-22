import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const accountProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .max(80, "Display name must be 80 characters or less")
    .optional(),
});

export const changeEmailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const changePasswordSchema = resetPasswordSchema;

const MAX_SITE_UPLOAD_SIZE_BYTES = 100 * 1024 * 1024;

// Native <input type="file"> registered with react-hook-form yields a FileList,
// not a File. Validate the FileList directly and read [0] in the submit handler.
const isNonEmptyFileList = (v: unknown): v is FileList =>
  typeof FileList !== "undefined" && v instanceof FileList && v.length > 0;

export const siteUploadSchema = z.object({
  // Each .refine runs even if the previous one failed (zod marks the parse "dirty"
  // rather than aborting). Guard inside every refine so we never dereference [0]
  // on something that isn't a non-empty FileList.
  file: z
    .custom<FileList>(isNonEmptyFileList, { message: "Please select a .zip file" })
    .refine(
      (files) => !isNonEmptyFileList(files) || files[0].name.toLowerCase().endsWith(".zip"),
      { message: "Only .zip files are supported" },
    )
    .refine(
      (files) => !isNonEmptyFileList(files) || files[0].size <= MAX_SITE_UPLOAD_SIZE_BYTES,
      { message: "File must be 100 MB or smaller" },
    ),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type AccountProfileFormData = z.infer<typeof accountProfileSchema>;
export type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type SiteUploadFormData = z.infer<typeof siteUploadSchema>;
