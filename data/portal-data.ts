import { portalPath } from "@/lib/hosts";
/**
 * Portal Datasets & Type Definitions for SiroTech Client Portal.
 * Organization-centric, project-centric data model adhering to Truvista standards:
 * 1. Project-centric: One hub with tabs (Overview, Approvals, Files, Messages, Invoices).
 * 2. "Needs your attention" first on Home: List of actions only client can do.
 * 3. One primary action per screen: Emerald pill button.
 * 4. Plain-language statuses: "Waiting for you", "In progress", "Done", "Overdue".
 * 5. Two levels of navigation maximum: Sidebar + tabs.
 * 6. Same components everywhere: Card, table, status pill, empty state, thread.
 */

export type OrgRole = "OWNER" | "MEMBER";
export type UserRole = "CLIENT" | "STAFF" | "ADMIN";
export type PlainStatus = "Waiting for you" | "In progress" | "Done" | "Overdue";

export interface Organization {
  id: string;
  name: string;
  billingEmail: string;
  taxPin: string;
  address: string;
  country: string;
  currency: "KES" | "USD";
}

export interface PortalUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  orgId: string;
  company: string;
  orgRole: OrgRole;
  phone?: string;
  avatarUrl?: string;
  timezone: string;
}

export interface AttentionItem {
  id: string;
  type: "approve" | "pay" | "reply" | "review";
  title: string;
  description: string;
  status: PlainStatus;
  actionLabel: string;
  actionHref: string;
  dueDate?: string;
  projectId?: string;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  phase: string;
  dueDate: string;
  completedDate?: string;
  status: PlainStatus;
  rawStatus: "UPCOMING" | "IN_PROGRESS" | "AWAITING_APPROVAL" | "APPROVED" | "CHANGES_REQUESTED";
  order: number;
  deliverables: string[];
  feedback?: string;
}

export interface ProjectUpdate {
  id: string;
  date: string;
  authorName: string;
  title: string;
  body: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  size: string;
  kind: "DELIVERABLE" | "DOCUMENT" | "ASSET" | "CONTRACT";
  category?: "DELIVERABLE" | "DOCUMENT" | "ASSET" | "CONTRACT" | "ARCHITECTURE" | "SECURITY" | "SPEC";
  uploadedAt: string;
  downloadUrl: string;
}

export type SharedFile = ProjectFile;
export type TeamMessage = ProjectMessage;

export interface ProjectMessage {
  id: string;
  projectId?: string;
  authorName: string;
  authorRole: string;
  senderName?: string;
  senderRole?: string;
  isStaff: boolean;
  content: string;
  timestamp: string;
  attachment?: {
    name: string;
    size: string;
  };
}

export interface PortalInvoice {
  id: string;
  orgId: string;
  projectId: string;
  projectTitle: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amountKES: number;
  amountUSD: number;
  status: PlainStatus;
  rawStatus: "DRAFT" | "SENT" | "PAID" | "OVERDUE";
  items: {
    description: string;
    quantity: number;
    unitPriceKES: number;
    unitPriceUSD: number;
  }[];
  paidAt?: string;
}

export interface SupportTicket {
  id: string;
  orgId: string;
  projectId?: string;
  projectTitle?: string;
  ticketNumber: string;
  subject: string;
  category: "BUG" | "FEATURE" | "DEVOPS" | "BILLING" | "GENERAL";
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: PlainStatus;
  rawStatus: "OPEN" | "WAITING_ON_CLIENT" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  assigneeName: string;
  messages: {
    id: string;
    sender: string;
    role: "CLIENT" | "STAFF";
    content: string;
    timestamp: string;
  }[];
}

export interface PortalProject {
  id: string;
  orgId: string;
  title: string;
  summary: string;
  status: PlainStatus;
  rawStatus: "PLANNING" | "DESIGN" | "BUILD" | "TESTING" | "LIVE" | "ON_HOLD" | "COMPLETE";
  progress: number;
  startDate: string;
  targetLaunch: string;
  techStack: string[];
  stagingUrl: string;
  repoUrl?: string;
  leadEngineer: {
    name: string;
    role: string;
    email: string;
  };
  milestones: ProjectMilestone[];
  updates: ProjectUpdate[];
  files: ProjectFile[];
  messages: ProjectMessage[];
  invoices: PortalInvoice[];
}

// -------------------------------------------------------------
// SEED & DEFAULT DATA
// -------------------------------------------------------------

export const defaultOrganization: Organization = {
  id: "org_coastlane_01",
  name: "CoastLane Logistics & Motors Ltd",
  billingEmail: "finance@coastlane.co.ke",
  taxPin: "P051982344A",
  address: "Port Cargo Terminal, Moi Avenue, Mombasa",
  country: "Kenya",
  currency: "KES",
};

export const defaultPortalUser: PortalUser = {
  id: "usr_client_01",
  name: "Account Owner",
  email: "owner@coastlane.co.ke",
  role: "CLIENT",
  orgId: "org_coastlane_01",
  company: "CoastLane Logistics & Motors Ltd",
  orgRole: "OWNER",
  phone: "+254 712 345 678",
  timezone: "Africa/Nairobi",
};

// Urgent items only the client can do
export const initialAttentionItems: AttentionItem[] = [
  {
    id: "att_01",
    type: "approve",
    title: "Phase 2 Driver Sync Acceptance Sign-Off",
    description: "Acceptance criteria verified in staging. Client sign-off required to unlock production deployment pipeline.",
    status: "Waiting for you",
    actionLabel: "Review & Approve",
    actionHref: portalPath("/projects/coastlane-core-v2?tab=approvals"),
    dueDate: "Today, 5:00 PM EAT",
    projectId: "coastlane-core-v2",
  },
  {
    id: "att_02",
    type: "pay",
    title: "Milestone Invoice INV-2026-089 (KES 285,000)",
    description: "Phase 3 M-Pesa automated fuel disbursement & real-time telemetry integration milestone.",
    status: "Waiting for you",
    actionLabel: "Pay Now",
    actionHref: portalPath("/invoices/inv_89"),
    dueDate: "October 30, 2026",
    projectId: "coastlane-core-v2",
  },
  {
    id: "att_03",
    type: "reply",
    title: "Ticket #ST-104: M-Pesa Callback Retry Sandbox Clarification",
    description: "Lead architect Daniel Siro posted a reply asking for your preferred retry backoff window.",
    status: "Waiting for you",
    actionLabel: "Reply to Ticket",
    actionHref: portalPath("/support/st_104"),
    dueDate: "October 15, 2026",
    projectId: "coastlane-core-v2",
  },
];

export const portalInvoices: PortalInvoice[] = [
  {
    id: "inv_89",
    orgId: "org_coastlane_01",
    projectId: "coastlane-core-v2",
    projectTitle: "CoastLane Fleet & Logistics Platform",
    invoiceNumber: "INV-2026-089",
    date: "October 10, 2026",
    dueDate: "October 30, 2026",
    amountKES: 285000,
    amountUSD: 2200,
    status: "Waiting for you",
    rawStatus: "SENT",
    items: [
      {
        description: "Phase 3: Real-Time Telemetry & M-Pesa Fuel Disbursement API Integration",
        quantity: 1,
        unitPriceKES: 285000,
        unitPriceUSD: 2200,
      },
    ],
  },
  {
    id: "inv_74",
    orgId: "org_coastlane_01",
    projectId: "coastlane-core-v2",
    projectTitle: "CoastLane Fleet & Logistics Platform",
    invoiceNumber: "INV-2026-074",
    date: "September 15, 2026",
    dueDate: "September 25, 2026",
    amountKES: 350000,
    amountUSD: 2700,
    status: "Done",
    rawStatus: "PAID",
    paidAt: "September 20, 2026",
    items: [
      {
        description: "Phase 2: React Native Driver Mobile App & SQLite Offline Sync Engine",
        quantity: 1,
        unitPriceKES: 350000,
        unitPriceUSD: 2700,
      },
    ],
  },
  {
    id: "inv_61",
    orgId: "org_coastlane_01",
    projectId: "coastlane-core-v2",
    projectTitle: "CoastLane Fleet & Logistics Platform",
    invoiceNumber: "INV-2026-061",
    date: "August 1, 2026",
    dueDate: "August 10, 2026",
    amountKES: 180000,
    amountUSD: 1400,
    status: "Done",
    rawStatus: "PAID",
    paidAt: "August 5, 2026",
    items: [
      {
        description: "Phase 1: Architecture Blueprint & PostgreSQL Multi-Tenant Database Setup",
        quantity: 1,
        unitPriceKES: 180000,
        unitPriceUSD: 1400,
      },
    ],
  },
];

export const supportTickets: SupportTicket[] = [
  {
    id: "st_104",
    orgId: "org_coastlane_01",
    projectId: "coastlane-core-v2",
    projectTitle: "CoastLane Fleet & Logistics Platform",
    ticketNumber: "ST-104",
    subject: "M-Pesa callback retry handling in staging",
    category: "DEVOPS",
    priority: "HIGH",
    status: "Waiting for you",
    rawStatus: "WAITING_ON_CLIENT",
    createdAt: "October 11, 2026, 11:20 AM",
    updatedAt: "October 12, 2026, 03:45 PM",
    assigneeName: "Daniel Siro",
    messages: [
      {
        id: "msg_1",
        sender: "Faith Wanjiku",
        role: "CLIENT",
        content:
          "Hi team, when testing driver fuel disbursements with network timeouts in the staging environment, does the callback listener retry automatically or wait for our cron job?",
        timestamp: "October 11, 2026, 11:20 AM",
      },
      {
        id: "msg_2",
        sender: "Daniel Siro",
        role: "STAFF",
        content:
          "Hello Faith! We've implemented an exponential backoff queue via Redis (BullMQ). If Safaricom's webhook listener is unreachable, it retries after 30s, 2m, and 10m before falling back to manual reconciliation. Does this retry interval meet your operations team's SLA?",
        timestamp: "October 12, 2026, 03:45 PM",
      },
    ],
  },
  {
    id: "st_098",
    orgId: "org_coastlane_01",
    projectId: "coastlane-core-v2",
    projectTitle: "CoastLane Fleet & Logistics Platform",
    ticketNumber: "ST-098",
    subject: "Driver offline SQLite sync conflict resolution test",
    category: "FEATURE",
    priority: "MEDIUM",
    status: "Done",
    rawStatus: "RESOLVED",
    createdAt: "September 22, 2026",
    updatedAt: "September 24, 2026",
    assigneeName: "Kevin Mutua",
    messages: [
      {
        id: "msg_3",
        sender: "Account Owner",
        role: "CLIENT",
        content: "Please clarify how the mobile app handles two drivers updating the same cargo item while offline.",
        timestamp: "September 22, 2026, 09:15 AM",
      },
      {
        id: "msg_4",
        sender: "Kevin Mutua",
        role: "STAFF",
        content: "We use Last-Write-Wins (LWW) with client-timestamp vector clocks on the SQLite table. We verified this during the Phase 2 test suite.",
        timestamp: "September 24, 2026, 02:10 PM",
      },
    ],
  },
  {
    id: "st_091",
    orgId: "org_coastlane_01",
    projectId: "coastlane-core-v2",
    projectTitle: "CoastLane Fleet & Logistics Platform",
    ticketNumber: "ST-091",
    subject: "S3 bucket lifecycle configuration for inspection photos",
    category: "DEVOPS",
    priority: "LOW",
    status: "Done",
    rawStatus: "RESOLVED",
    createdAt: "September 10, 2026",
    updatedAt: "September 12, 2026",
    assigneeName: "Daniel Siro",
    messages: [
      {
        id: "msg_5",
        sender: "Faith Wanjiku",
        role: "CLIENT",
        content: "Can we move vehicle inspection photos older than 6 months to Glacier Deep Archive to save storage costs?",
        timestamp: "September 10, 2026, 04:30 PM",
      },
      {
        id: "msg_6",
        sender: "Daniel Siro",
        role: "STAFF",
        content: "Implemented! Any inspection media older than 180 days is now transitioned automatically via AWS S3 Lifecycle policies.",
        timestamp: "September 12, 2026, 10:00 AM",
      },
    ],
  },
];

export const sharedFiles: ProjectFile[] = [
  {
    id: "f_01",
    projectId: "coastlane-core-v2",
    name: "CoastLane Architecture Blueprint v2.1.pdf",
    size: "3.4 MB",
    kind: "DOCUMENT",
    category: "ARCHITECTURE",
    uploadedAt: "August 15, 2026",
    downloadUrl: "#",
  },
  {
    id: "f_02",
    projectId: "coastlane-core-v2",
    name: "Master Services Agreement (MSA) - Signed.pdf",
    size: "1.8 MB",
    kind: "CONTRACT",
    category: "CONTRACT",
    uploadedAt: "August 1, 2026",
    downloadUrl: "#",
  },
  {
    id: "f_03",
    projectId: "coastlane-core-v2",
    name: "Staging API Credentials & OpenAPI Spec.json",
    size: "420 KB",
    kind: "DELIVERABLE",
    category: "SPEC",
    uploadedAt: "October 10, 2026",
    downloadUrl: "#",
  },
  {
    id: "f_04",
    projectId: "coastlane-core-v2",
    name: "ISO 27001 & Kenya DPA Audit Report.pdf",
    size: "2.1 MB",
    kind: "DOCUMENT",
    category: "SECURITY",
    uploadedAt: "September 15, 2026",
    downloadUrl: "#",
  },
];

export const teamChatMessages: ProjectMessage[] = [
  {
    id: "tm_1",
    projectId: "coastlane-core-v2",
    authorName: "Daniel Siro",
    authorRole: "Lead Architect",
    senderName: "Daniel Siro",
    senderRole: "Lead Architect",
    isStaff: true,
    content: "Welcome to your CoastLane project workspace, Faith! Our team is focused on delivering the Phase 3 telemetry & M-Pesa automated fuel disbursement sprint.",
    timestamp: "Oct 10, 10:00 AM",
  },
  {
    id: "tm_2",
    projectId: "coastlane-core-v2",
    authorName: "Account Owner",
    authorRole: "Client Owner",
    senderName: "Account Owner",
    senderRole: "Client Owner",
    isStaff: false,
    content: "Thanks Daniel. Looking forward to testing the staging build on Monday with our operations team in Mombasa.",
    timestamp: "Oct 10, 10:45 AM",
  },
  {
    id: "tm_3",
    projectId: "coastlane-core-v2",
    authorName: "Kevin Mutua",
    authorRole: "Systems Engineer",
    senderName: "Kevin Mutua",
    senderRole: "Systems Engineer",
    isStaff: true,
    content: "The driver app APK has been uploaded to the shared files section. Let us know if you need test M-Pesa sandbox numbers.",
    timestamp: "Yesterday, 3:15 PM",
  },
  {
    id: "tm_4",
    projectId: "coastlane-core-v2",
    authorName: "Account Owner",
    authorRole: "Client Owner",
    senderName: "Account Owner",
    senderRole: "Client Owner",
    isStaff: false,
    content: "Received! We are running tests on 3 devices today.",
    timestamp: "Today, 9:20 AM",
  },
];

export const portalProjects: PortalProject[] = [
  {
    id: "coastlane-core-v2",
    orgId: "org_coastlane_01",
    title: "CoastLane Fleet & Logistics Platform",
    summary:
      "High-concurrency fleet management platform, driver offline-first mobile app, and automated M-Pesa B2B fuel disbursement pipeline.",
    status: "In progress",
    rawStatus: "BUILD",
    progress: 72,
    startDate: "August 1, 2026",
    targetLaunch: "November 15, 2026",
    techStack: ["Next.js 16", "PostgreSQL", "React Native", "M-Pesa Daraja", "Docker", "AWS"],
    stagingUrl: "https://staging.coastlane.co.ke",
    repoUrl: "https://github.com/sirotech-studios/coastlane-core",
    leadEngineer: {
      name: "Daniel Siro",
      role: "Lead Solutions Architect",
      email: "daniel@sirotech.com",
    },
    milestones: [
      {
        id: "m-01",
        projectId: "coastlane-core-v2",
        phase: "Phase 1",
        title: "Database Architecture & Multi-Tenant Schema",
        dueDate: "August 20, 2026",
        completedDate: "August 18, 2026",
        status: "Done",
        rawStatus: "APPROVED",
        order: 1,
        deliverables: [
          "PostgreSQL schema with Row-Level Security",
          "Automated DB migration scripts",
          "Fleet telemetry data ingestion models",
        ],
      },
      {
        id: "m-02",
        projectId: "coastlane-core-v2",
        phase: "Phase 2",
        title: "Driver Mobile App & Offline SQLite Sync",
        dueDate: "September 25, 2026",
        completedDate: "September 24, 2026",
        status: "Waiting for you",
        rawStatus: "AWAITING_APPROVAL",
        order: 2,
        deliverables: [
          "React Native driver workflow app",
          "Local SQLite sync engine with automatic conflict resolution",
          "Waybill digital signature & PDF upload",
        ],
        feedback: "Awaiting formal client sign-off on driver check-in offline test suite.",
      },
      {
        id: "m-03",
        projectId: "coastlane-core-v2",
        phase: "Phase 3",
        title: "Real-Time Telemetry & M-Pesa Fuel Disbursement",
        dueDate: "October 28, 2026",
        status: "In progress",
        rawStatus: "IN_PROGRESS",
        order: 3,
        deliverables: [
          "M-Pesa B2B automated driver fuel disbursement pipeline",
          "Real-time GPS vehicle tracking dashboard with WebSockets",
          "Automated fuel expense reconciliation engine",
        ],
      },
      {
        id: "m-04",
        projectId: "coastlane-core-v2",
        phase: "Phase 4",
        title: "Production Hardening, Uptime SLA & Go-Live",
        dueDate: "November 15, 2026",
        status: "In progress",
        rawStatus: "UPCOMING",
        order: 4,
        deliverables: [
          "Load testing under 10,000 concurrent driver check-ins",
          "Multi-AZ AWS failover configuration",
          "30-day dedicated Hypercare engineering support",
        ],
      },
    ],
    updates: [
      {
        id: "up_1",
        date: "October 12, 2026",
        authorName: "Daniel Siro",
        title: "M-Pesa B2B Callback Handling Validated",
        body: "Successfully executed end-to-end sandbox tests with Safaricom Daraja API. Automated instant reconciliation is now live on staging.",
      },
      {
        id: "up_2",
        date: "October 6, 2026",
        authorName: "Kevin Mutua",
        title: "Driver SQLite Sync Benchmarked",
        body: "Verified seamless offline operation in low-connectivity highway corridors. Offline queue syncs cleanly upon reconnecting.",
      },
      {
        id: "up_3",
        date: "September 28, 2026",
        authorName: "Daniel Siro",
        title: "Phase 2 Driver Workflow Acceptance Staged",
        body: "Client review of driver check-in workflows concluded with 100% acceptance criteria passed. Ready for approval.",
      },
    ],
    files: sharedFiles,
    messages: teamChatMessages,
    invoices: portalInvoices,
  },
  {
    id: "trav-tatz-portal",
    orgId: "org_coastlane_01",
    title: "TravTatz African Safaris ERP",
    summary:
      "Multi-currency booking engine, custom safari itinerary generator, and live wildlife tracker for East African travel operations.",
    status: "Done",
    rawStatus: "LIVE",
    progress: 100,
    startDate: "May 10, 2026",
    targetLaunch: "September 1, 2026",
    techStack: ["Next.js", "Tailwind CSS", "Paystack", "PostgreSQL", "Vercel"],
    stagingUrl: "https://travtatz.com",
    leadEngineer: {
      name: "Kevin Mutua",
      role: "Senior Full-Stack Engineer",
      email: "kevin@sirotech.com",
    },
    milestones: [
      {
        id: "tt-01",
        projectId: "trav-tatz-portal",
        phase: "Phase 4",
        title: "Production Deployment & 30-Day Hypercare Warranty",
        dueDate: "September 30, 2026",
        completedDate: "September 30, 2026",
        status: "Done",
        rawStatus: "APPROVED",
        order: 1,
        deliverables: [
          "Zero-downtime production cutover",
          "Paystack unified multi-channel checkout (Card & M-Pesa)",
          "Daily automated database backups (PITR)",
        ],
      },
    ],
    updates: [
      {
        id: "tt_up_1",
        date: "October 2, 2026",
        authorName: "Kevin Mutua",
        title: "Hypercare Week 4 Status: Zero Sev-1 Incidents",
        body: "System has maintained 99.99% uptime with over $120,000 in bookings processed.",
      },
    ],
    files: [],
    messages: [],
    invoices: [],
  },
];

// -------------------------------------------------------------
// NOTIFICATIONS DATASET (Top bar bell & /portal/notifications)
// Types: new update, new message, milestone awaiting approval, invoice issued,
// payment received, ticket reply, file shared, invite accepted
// -------------------------------------------------------------
export type NotificationType =
  | "update"
  | "message"
  | "milestone"
  | "invoice"
  | "payment"
  | "ticket"
  | "file"
  | "invite";

export interface PortalNotification {
  id: string;
  orgId: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  targetHref: string;
}

export const initialNotifications: PortalNotification[] = [
  {
    id: "notif_01",
    orgId: "org_coastlane_01",
    type: "milestone",
    title: "Phase 2 Milestone Awaiting Sign-Off",
    description: "Driver Mobile App & Offline SQLite sync acceptance test suite is ready for your formal review.",
    timestamp: "10 mins ago",
    read: false,
    targetHref: portalPath("/projects/coastlane-core-v2?tab=overview"),
  },
  {
    id: "notif_02",
    orgId: "org_coastlane_01",
    type: "message",
    title: "New Team Message from Daniel Siro",
    description: "We've staged the automated M-Pesa B2B callback endpoints in our sandbox environment.",
    timestamp: "45 mins ago",
    read: false,
    targetHref: portalPath("/messages"),
  },
  {
    id: "notif_03",
    orgId: "org_coastlane_01",
    type: "invoice",
    title: "Milestone Invoice INV-2026-089 Issued",
    description: "Phase 3 Real-time telemetry invoice (KES 285,000) has been generated.",
    timestamp: "2 hours ago",
    read: false,
    targetHref: portalPath("/invoices/inv_89"),
  },
  {
    id: "notif_04",
    orgId: "org_coastlane_01",
    type: "ticket",
    title: "Support Reply on #ST-104",
    description: "Kevin Mutua updated ticket #ST-104 regarding retry backoff windows.",
    timestamp: "Yesterday",
    read: true,
    targetHref: portalPath("/support/st_104"),
  },
  {
    id: "notif_05",
    orgId: "org_coastlane_01",
    type: "update",
    title: "Engineering Sprint Update Posted",
    description: "M-Pesa B2B Callback Handling Validated in Staging across 5 test vehicles.",
    timestamp: "2 days ago",
    read: true,
    targetHref: portalPath("/projects/coastlane-core-v2?tab=updates"),
  },
  {
    id: "notif_06",
    orgId: "org_coastlane_01",
    type: "file",
    title: "New Deliverable Shared",
    description: "Daniel Siro uploaded 'Staging API Credentials & OpenAPI Spec.json'.",
    timestamp: "3 days ago",
    read: true,
    targetHref: portalPath("/projects/coastlane-core-v2?tab=files"),
  },
  {
    id: "notif_07",
    orgId: "org_coastlane_01",
    type: "payment",
    title: "Payment Receipt Confirmed",
    description: "KES 350,000 for Invoice INV-2026-074 settled via M-Pesa Paybill.",
    timestamp: "September 20, 2026",
    read: true,
    targetHref: portalPath("/invoices/inv_74"),
  },
  {
    id: "notif_08",
    orgId: "org_coastlane_01",
    type: "invite",
    title: "Team Invite Accepted",
    description: "Kariuki Mwangi joined CoastLane Logistics as Member.",
    timestamp: "August 12, 2026",
    read: true,
    targetHref: portalPath("/account?tab=team"),
  },
];

// -------------------------------------------------------------
// RECENT ACTIVITY DATASET (Last 8 events across projects)
// -------------------------------------------------------------
export interface PortalActivity {
  id: string;
  orgId: string;
  projectId: string;
  projectTitle: string;
  type: "update" | "file" | "message" | "payment" | "milestone";
  title: string;
  description: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
}

export const recentActivities: PortalActivity[] = [
  {
    id: "act_01",
    orgId: "org_coastlane_01",
    projectId: "coastlane-core-v2",
    projectTitle: "CoastLane Fleet & Logistics Platform",
    type: "update",
    title: "Sprint Update Posted",
    description: "M-Pesa B2B Callback Handling Validated with automated retry backoffs.",
    timestamp: "Today, 10:15 AM",
    actorName: "Daniel Siro",
    actorRole: "Lead Solutions Architect",
  },
  {
    id: "act_02",
    orgId: "org_coastlane_01",
    projectId: "coastlane-core-v2",
    projectTitle: "CoastLane Fleet & Logistics Platform",
    type: "milestone",
    title: "Milestone Submitted for Approval",
    description: "Phase 2 Driver Mobile App & SQLite Sync submitted for formal sign-off.",
    timestamp: "Today, 09:00 AM",
    actorName: "Kevin Mutua",
    actorRole: "Systems Engineer",
  },
  {
    id: "act_03",
    orgId: "org_coastlane_01",
    projectId: "coastlane-core-v2",
    projectTitle: "CoastLane Fleet & Logistics Platform",
    type: "message",
    title: "Team Chat Message",
    description: "Account Owner posted test feedback regarding multi-device testing.",
    timestamp: "Yesterday, 3:15 PM",
    actorName: "Account Owner",
    actorRole: "Client Owner",
  },
  {
    id: "act_04",
    orgId: "org_coastlane_01",
    projectId: "coastlane-core-v2",
    projectTitle: "CoastLane Fleet & Logistics Platform",
    type: "file",
    title: "Specification Shared",
    description: "Staging API Credentials & OpenAPI Spec.json uploaded to shared deliverables.",
    timestamp: "October 10, 2026",
    actorName: "Daniel Siro",
    actorRole: "Lead Solutions Architect",
  },
  {
    id: "act_05",
    orgId: "org_coastlane_01",
    projectId: "coastlane-core-v2",
    projectTitle: "CoastLane Fleet & Logistics Platform",
    type: "payment",
    title: "Milestone Invoice Settled",
    description: "Invoice INV-2026-074 (KES 350,000) marked as paid via M-Pesa.",
    timestamp: "September 20, 2026",
    actorName: "Safaricom Daraja",
    actorRole: "Payment Gateway",
  },
  {
    id: "act_06",
    orgId: "org_coastlane_01",
    projectId: "coastlane-core-v2",
    projectTitle: "CoastLane Fleet & Logistics Platform",
    type: "file",
    title: "Compliance Audit Uploaded",
    description: "ISO 27001 & Kenya DPA Audit Report.pdf certified by security team.",
    timestamp: "September 15, 2026",
    actorName: "Daniel Siro",
    actorRole: "Lead Solutions Architect",
  },
  {
    id: "act_07",
    orgId: "org_coastlane_01",
    projectId: "coastlane-core-v2",
    projectTitle: "CoastLane Fleet & Logistics Platform",
    type: "milestone",
    title: "Phase 1 Approved",
    description: "Database Architecture & Multi-Tenant Schema formally signed off.",
    timestamp: "August 18, 2026",
    actorName: "Account Owner",
    actorRole: "Client Owner",
  },
  {
    id: "act_08",
    orgId: "org_coastlane_01",
    projectId: "trav-tatz-portal",
    projectTitle: "TravTatz African Safaris ERP",
    type: "update",
    title: "Production Cutover Complete",
    description: "ERP live in production with 99.99% uptime SLA warranty active.",
    timestamp: "August 1, 2026",
    actorName: "Kevin Mutua",
    actorRole: "Systems Engineer",
  },
];

// -------------------------------------------------------------
// PROPOSALS & CONTRACTS TO REVIEW
// -------------------------------------------------------------
export interface ProposalDoc {
  id: string;
  title: string;
  version: string;
  date: string;
  status: "AWAITING_REVIEW" | "ACCEPTED";
  fileUrl: string;
  summary: string;
}

export const initialProposals: ProposalDoc[] = [
  {
    id: "prop_01",
    title: "CoastLane AI Driver Fatigue Detection Addendum",
    version: "v1.2",
    date: "October 8, 2026",
    status: "AWAITING_REVIEW",
    fileUrl: "#",
    summary: "Computer-vision edge model deployment to detect driver drowsiness and dispatch SMS alerts to Mombasa HQ.",
  },
  {
    id: "prop_02",
    title: "Master Services Agreement (MSA) & SLA Guarantee",
    version: "v2.0",
    date: "August 1, 2026",
    status: "ACCEPTED",
    fileUrl: "#",
    summary: "Guaranteed 99.9% uptime SLA, 2-hour sev-1 engineering response, Kenya DPA compliance guarantee.",
  },
];

// -------------------------------------------------------------
// TEAM MEMBERS LIST (Account -> Team tab)
// -------------------------------------------------------------
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: OrgRole;
  title: string;
  status: "ACTIVE" | "INVITED" | "EXPIRED" | "DISABLED";
  joinedAt: string;
  avatarUrl?: string;
}

export const initialTeamMembers: TeamMember[] = [
  {
    id: "tm_01",
    name: "Account Owner",
    email: "owner@coastlane.co.ke",
    role: "OWNER",
    title: "Managing Director & Operations Head",
    status: "ACTIVE",
    joinedAt: "August 1, 2026",
  },
  {
    id: "tm_02",
    name: "Kariuki Mwangi",
    email: "kariuki.m@coastlane.co.ke",
    role: "MEMBER",
    title: "Fleet Logistics Dispatcher",
    status: "ACTIVE",
    joinedAt: "August 12, 2026",
  },
  {
    id: "tm_03",
    name: "Amina Mohammed",
    email: "amina.m@coastlane.co.ke",
    role: "MEMBER",
    title: "Finance & Accounts Specialist",
    status: "INVITED",
    joinedAt: "October 10, 2026",
  },
];

