# Supabase Auth email templates

Paste each file into **Supabase Dashboard → Authentication → Emails → Templates** and set the subject.
Do the same in the staging project. Inline styles only; the logo is a PNG at
`https://sirotech.co.ke/email/logo.png` (`public/email/logo.png`) because many mail apps don't render SVG.

| Supabase template      | File                | Subject                           | Link → `/auth/confirm?…`                    |
|------------------------|---------------------|-----------------------------------|---------------------------------------------|
| Invite user            | `invite.html`       | `You're invited to SiroTech`      | `type=invite&next=/welcome`                 |
| Magic Link             | `magic_link.html`   | `Your SiroTech sign-in link`      | `type=email&next=/` (+ `{{ .Token }}` code) |
| Reset Password         | `recovery.html`     | `Reset your SiroTech password`    | `type=recovery&next=/reset-password`        |
| Confirm signup         | `confirmation.html` | `Confirm your SiroTech email`     | `type=email&next=/welcome` (+ code)         |
| Change Email Address   | `email_change.html` | `Confirm your new SiroTech email` | `type=email_change&next=/account`           |

The app only ever passes the **host origin** as the redirect (`https://portal.sirotech.co.ke` or
`https://admin.sirotech.co.ke`); the templates append `/auth/confirm`. That page does nothing on load
(mail scanners can't burn the token) and exchanges the token only when the person presses **Continue**.

If a template renders blank on staging, remove the `{{ if .Data.full_name }}…{{ end }}` conditional in
`invite.html`. Always test in Gmail, Outlook and on a phone.

## Dashboard settings

- **Authentication → URL Configuration → Redirect URLs** (otherwise Supabase falls back to the Site URL):
  `https://portal.sirotech.co.ke`, `https://admin.sirotech.co.ke`, the staging equivalents, and for local dev
  `http://portal.localhost:3000`, `http://admin.localhost:3000`.
- **Site URL**: `https://portal.sirotech.co.ke`.
- **Authentication → Emails → SMTP**: use Resend's SMTP (`smtp.resend.com`, user `resend`, password = a Resend
  API key, sender `notifications@mail.sirotech.co.ke`). Supabase's built-in mailer is heavily rate-limited.
- **Email OTP length**: the sign-in page accepts 6–10 digits; check what your project sends.
- **Email OTP expiration** (and invite expiry): keep `NEXT_PUBLIC_AUTH_LINK_TTL_HOURS` in the app (default 24)
  in step so the admin "Expired / link not used" status is accurate.
- **Confirm email**: keep enabled. Accounts created by invites, links and the admin are pre-confirmed.
- **Rate limits**: the per-address resend interval is 60 s; the admin UI shows a matching cooldown.
