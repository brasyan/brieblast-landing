# BrieHosting Email Templates

This directory contains HTML email templates for use with Supabase Authentication.

## Templates

### 1. `confirm_signup.html`
**Purpose:** Email confirmation for new account signups
**Supabase Variable:** `{{.ConfirmationURL}}`, `{{.Email}}`
**Usage:** Automatically sent by Supabase when a user signs up
**Expiration:** 24 hours

### 2. `reset_password.html`
**Purpose:** Password reset request
**Supabase Variable:** `{{.ConfirmationURL}}`, `{{.Email}}`
**Usage:** Automatically sent by Supabase when user requests password reset
**Expiration:** 1 hour

### 3. `password_changed.html`
**Purpose:** Confirmation that password has been successfully changed
**Supabase Variable:** `{{.Email}}`
**Usage:** Custom template (requires custom email trigger via webhook/function)
**Note:** Requires backend implementation

### 4. `mfa_added.html`
**Purpose:** Notification that MFA method has been added to the account
**Supabase Variable:** `{{.Email}}`, `{{.BackupCodes}}`
**Usage:** Custom template (requires custom email trigger via webhook/function)
**Note:** Requires backend implementation with backup codes generation

### 5. `invite_user.html`
**Purpose:** Invite someone to join BrieHosting
**Variables:** `{{.InviteLink}}`, `{{.InviterName}}`, `{{.InviterEmail}}`, `{{.InviteMessage}}`
**Usage:** Custom template (requires backend implementation)
**Expiration:** 30 days
**Note:** Requires custom invitation system implementation

## Design Features

- **Responsive Design:** Mobile-first design that works on all screen sizes
- **Dark Theme:** Matches BrieHosting brand (dark background with yellow/cyan accents)
- **Accessibility:** Proper heading hierarchy, readable text sizes, sufficient contrast
- **Brand Consistency:** Uses BrieHosting colors and branding throughout
- **Security Focus:** Includes security warnings and account information
Invite (Pink):** `#ec4899` / `#db2777` (gradient)
- **
## Brand Colors

- **Primary (Yellow):** `#fef08a` / `#fbbf24` (gradient)
- **Success (Green):** `#10b981` / `#059669`
- **Warning (Orange):** `#fb923c` / `#7c2d12`
- **Info (Cyan):** `#06b6d4` / `#0891b2`
- **Background:** `#0f0f0f` (almost black)
- **Card Background:** `#1a1a1a`
- **Border:** `#27272a`
- **Text Primary:** `#e4e4e7`
- **Text Muted:** `#d4d4d8`, `#a1a1aa`, `#71717a`

## How to Use with Supabase

### Setup in Supabase Dashboard

1. Go to **Authentication > Email Templates**
2. For each template type:
   - Click the template you want to customize
   - Copy the HTML from the corresponding file
   - Paste into Supabase template editor
   - Test the template
   - Save

### Custom Templates (Password Changed, MFA Added)

These templates require custom implementation:

1. **Option A: Supabase Functions**
   - Create an Edge Function to send custom emails
   - Call it from your application after the action completes

2. **Option B: Backend Service**
   - Use the `MailTemplates` files as reference
   - Implement custom email sending in your API

3. **Option C: Third-party Service**
   - Export templates to SendGrid, Mailgun, etc.
   - Configure the service to send on specific events

## Customization

To modify templates:

1. Edit the HTML file
2. Update color values, text, or links as needed
3. Keep Supabase variables (`{{.VariableName}}`) intact
4. Test in email client before deploying
5. Re-upload to Supabase

## Variables Available

| Variable | Template | Description |
|----------|----------|-------------|
| `{{.Email}}` | All | User's email address |
| `{{.ConfirmationURL}}` | Signup, Password Reset | Link for user to c
| `{{.InviteLink}}` | Invite User | Unique invitation signup link |
| `{{.InviterName}}` | Invite User | Name of person sending invitation |
| `{{.InviterEmail}}` | Invite User | Email of person sending invitation |
| `{{.InviteMessage}}` | Invite User | Personal message from inviter |onfirm action |
| `{{.BackupCodes}}` | MFA Added | Backup codes for account recovery |

## Notes

- Always test emails in different email clients (Gmail, Outlook, Apple Mail, etc.)
- Ensure all links point to correct production domains
- Keep sensitive information out of email headers
- Monitor email delivery rates and bounce rates
- Update templates if branding changes

## Support

For issues or template improvements, contact BrieHosting support.

---

Made with 🧀 in Belgium
