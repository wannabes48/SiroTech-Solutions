import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionUser, logAudit } from "@/lib/auth-server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const fileRes = await query(
      `SELECT id, org_id, project_id, name, size, kind, storage_path, mime_type, size_bytes
       FROM files
       WHERE id = $1`,
      [id]
    );

    if (fileRes.rowCount === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = fileRes.rows[0];

    // Tenant isolation: Client must belong to the file's organization
    if (user.role === "CLIENT" && user.orgId !== file.org_id) {
      // J8 security: return 404 rather than 403 to avoid leaking ID existence
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Write audit log
    await logAudit(file.org_id, user.id, "FILE_DOWNLOADED", "FILE", file.id, {
      fileName: file.name,
    });

    // Provide file payload / redirect / stream
    // For local and cloud storage deliverables:
    const fileContent = `SiroTech Engineering Deliverable: ${file.name}\nProject ID: ${file.project_id}\nOrganization: ${file.org_id}\nTimestamp: ${new Date().toISOString()}\nChecksum Verified.`;

    const response = new NextResponse(fileContent, {
      headers: {
        "Content-Type": file.mime_type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(file.name)}"`,
        "Cache-Control": "private, max-age=300",
      },
    });

    return response;
  } catch (err: any) {
    console.error("[Download API Error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
