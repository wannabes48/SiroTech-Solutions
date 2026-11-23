import { mainUrl, portalUrl } from "@/lib/hosts";
import React from "react";

interface EmailLayoutProps {
  previewText?: string;
  heading?: string;
  subheading?: string;
  badge?: string;
  badgeColor?: "emerald" | "amber" | "blue" | "rose";
  children: React.ReactNode;
  actionUrl?: string;
  actionLabel?: string;
  footerNote?: string;
}

export function EmailLayout({
  previewText,
  heading,
  subheading,
  badge,
  badgeColor = "emerald",
  children,
  actionUrl,
  actionLabel,
  footerNote,
}: EmailLayoutProps) {
  const badgeStyles = {
    emerald: { bg: "#EBF5EE", text: "#1B4D2E", border: "#C2E2CC" },
    amber: { bg: "#FEF7E6", text: "#8A5800", border: "#FDE29A" },
    blue: { bg: "#EBF3FE", text: "#124B91", border: "#C5DCFA" },
    rose: { bg: "#FDECEE", text: "#981B28", border: "#F9B8BF" },
  }[badgeColor];

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{heading || "SiroTech Solutions Notification"}</title>
        {previewText && (
          <div
            style={{
              display: "none",
              maxHeight: 0,
              maxWidth: 0,
              opacity: 0,
              overflow: "hidden",
            }}
          >
            {previewText}
          </div>
        )}
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#F4F7F5",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          color: "#1F2E24",
          lineHeight: "1.6",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <table
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          role="presentation"
          style={{ backgroundColor: "#F4F7F5", padding: "36px 12px" }}
        >
          <tr>
            <td align="center">
              {/* Outer Centered Container */}
              <table
                width="100%"
                cellPadding="0"
                cellSpacing="0"
                role="presentation"
                style={{
                  maxWidth: "580px",
                  margin: "0 auto",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "20px",
                  border: "1px solid #E1E8E3",
                  overflow: "hidden",
                  boxShadow: "0 4px 18px rgba(15, 29, 21, 0.05)",
                }}
              >
                {/* Brand Header */}
                <tr>
                  <td
                    style={{
                      padding: "32px 36px 24px",
                      borderBottom: "1px solid #EDF2EE",
                      backgroundColor: "#FCFDFC",
                    }}
                  >
                    <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                      <tr>
                        <td>
                          <div
                            style={{
                              display: "inline-block",
                              width: "36px",
                              height: "36px",
                              lineHeight: "36px",
                              backgroundColor: "#1B2E24",
                              borderRadius: "10px",
                              color: "#FFFFFF",
                              fontWeight: 800,
                              fontSize: "18px",
                              textAlign: "center",
                              verticalAlign: "middle",
                              marginRight: "12px",
                            }}
                          >
                            S
                          </div>
                          <div style={{ display: "inline-block", verticalAlign: "middle" }}>
                            <div
                              style={{
                                fontSize: "14px",
                                fontWeight: 800,
                                letterSpacing: "0.08em",
                                color: "#1B2E24",
                                textTransform: "uppercase",
                              }}
                            >
                              SiroTech Solutions
                            </div>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#6B7C71",
                                fontWeight: 500,
                                letterSpacing: "0.02em",
                              }}
                            >
                              Engineering Studio &amp; Cloud Architecture
                            </div>
                          </div>
                        </td>
                        {badge && (
                          <td align="right">
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 10px",
                                borderRadius: "9999px",
                                fontSize: "11px",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                backgroundColor: badgeStyles.bg,
                                color: badgeStyles.text,
                                border: `1px solid ${badgeStyles.border}`,
                              }}
                            >
                              {badge}
                            </span>
                          </td>
                        )}
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* Main Body Content */}
                <tr>
                  <td style={{ padding: "36px" }}>
                    {heading && (
                      <h1
                        style={{
                          margin: "0 0 10px 0",
                          fontSize: "22px",
                          fontWeight: 700,
                          color: "#1B2E24",
                          lineHeight: "1.3",
                        }}
                      >
                        {heading}
                      </h1>
                    )}

                    {subheading && (
                      <p
                        style={{
                          margin: "0 0 24px 0",
                          fontSize: "14px",
                          color: "#5C6F62",
                          lineHeight: "1.5",
                        }}
                      >
                        {subheading}
                      </p>
                    )}

                    <div style={{ fontSize: "14px", color: "#2E3E33", lineHeight: "1.65" }}>
                      {children}
                    </div>

                    {/* Primary Call to Action Button */}
                    {actionUrl && actionLabel && (
                      <div style={{ margin: "32px 0 24px", textAlign: "left" }}>
                        <a
                          href={actionUrl}
                          style={{
                            display: "inline-block",
                            padding: "14px 32px",
                            backgroundColor: "#1B2E24",
                            color: "#FFFFFF",
                            borderRadius: "9999px",
                            fontWeight: 700,
                            fontSize: "13px",
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            textDecoration: "none",
                            boxShadow: "0 2px 8px rgba(27, 46, 36, 0.18)",
                          }}
                        >
                          {actionLabel} &rarr;
                        </a>
                        <div
                          style={{
                            marginTop: "14px",
                            fontSize: "11px",
                            color: "#839589",
                            wordBreak: "break-all",
                          }}
                        >
                          Button not working? Copy and paste:{" "}
                          <span style={{ color: "#3B6948", textDecoration: "underline" }}>
                            {actionUrl}
                          </span>
                        </div>
                      </div>
                    )}

                    {footerNote && (
                      <div
                        style={{
                          marginTop: "28px",
                          padding: "14px 18px",
                          backgroundColor: "#F7FAF8",
                          borderRadius: "12px",
                          border: "1px solid #E5ECE7",
                          fontSize: "12px",
                          color: "#5C6F62",
                        }}
                      >
                        {footerNote}
                      </div>
                    )}
                  </td>
                </tr>

                {/* Brand Footer */}
                <tr>
                  <td
                    style={{
                      padding: "24px 36px 30px",
                      backgroundColor: "#F9FAF9",
                      borderTop: "1px solid #EDF2EE",
                      fontSize: "11px",
                      color: "#6B7C71",
                      lineHeight: "1.6",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 10px 0",
                        fontWeight: 600,
                        color: "#3F5245",
                      }}
                    >
                      You received this because you have a SiroTech portal account.
                    </p>
                    <p style={{ margin: "0 0 8px 0" }}>
                      SiroTech Solutions &bull; The Mirage, Chiromo Road, Westlands, Nairobi, Kenya
                    </p>
                    <p style={{ margin: 0 }}>
                      <a
                        href={portalUrl()}
                        style={{ color: "#285736", textDecoration: "underline", marginRight: "12px" }}
                      >
                        Client Portal
                      </a>
                      <a
                        href={mainUrl("/legal/privacy")}
                        style={{ color: "#285736", textDecoration: "underline", marginRight: "12px" }}
                      >
                        Privacy Policy
                      </a>
                      <a
                        href="mailto:support@sirotech.co.ke"
                        style={{ color: "#285736", textDecoration: "underline" }}
                      >
                        Support Desk
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}

/**
 * Shared Plain-Text Layout Wrapper
 */
export function renderPlainTextLayout({
  title,
  body,
  actionLabel,
  actionUrl,
  metadata = [],
}: {
  title: string;
  body: string;
  actionLabel?: string;
  actionUrl?: string;
  metadata?: { label: string; value: string }[];
}): string {
  const metaBlock =
    metadata.length > 0
      ? "\n" + metadata.map((m) => `[ ${m.label.toUpperCase()}: ${m.value} ]`).join("\n") + "\n"
      : "";

  const actionBlock =
    actionUrl && actionLabel
      ? `\n>>> ${actionLabel.toUpperCase()} <<<\n${actionUrl}\n`
      : "";

  return `============================================================
SIROTECH SOLUTIONS | Engineering Studio & Cloud Architecture
============================================================

${title.toUpperCase()}
------------------------------------------------------------
${body.trim()}
${metaBlock}${actionBlock}
------------------------------------------------------------
You received this because you have a SiroTech portal account.
SiroTech Solutions • The Mirage, Chiromo Road, Westlands, Nairobi, Kenya
Client Portal: ${portalUrl()}
Support Desk: support@sirotech.co.ke
============================================================`;
}
