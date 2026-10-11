export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  alt: string;
  skills: string[];
}

export const teamMembers: TeamMember[] = [
  {
    id: "dorah-siro",
    name: "Dorah Siro",
    role: "Founder & Principal Solutions Architect",
    bio: "Bridging computer science with structural engineering discipline. Dorah founded SiroTech Solutions in Nairobi after leading mission-critical web applications, distributed backend services, and high-concurrency payment integrations for enterprises across Kenya and North America.",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    alt: "Portrait of Dorah Siro, Founder and Principal Solutions Architect at SiroTech",
    skills: ["System Architecture", "Next.js", "TypeScript", "PostgreSQL", "M-Pesa APIs"],
  },
  {
    id: "kevin-mutua",
    name: "Kevin Mutua",
    role: "Senior Full-Stack Engineer",
    bio: "Specializing in high-throughput APIs, database indexing, and offline-first mobile applications. Kevin has engineered scalable fintech routing engines and enterprise inventory management dashboards with sub-second response times.",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800",
    alt: "Portrait of Kevin Mutua, Senior Full-Stack Engineer at SiroTech",
    skills: ["React Native", "Node.js", "GraphQL", "Redis", "Docker"],
  },
  {
    id: "faith-chebet",
    name: "Faith Chebet",
    role: "Product Designer & UI/UX Lead",
    bio: "Obsessed with clean typography, accessible color contrast, and friction-free user flows. Faith conducts user research across African and Western markets to translate complex technical workflows into intuitive, beautiful interfaces.",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
    alt: "Portrait of Faith Chebet, Product Designer and UI/UX Lead at SiroTech",
    skills: ["Design Systems", "Figma", "User Research", "WCAG 2.1 AA", "Prototyping"],
  },
  {
    id: "brian-otieno",
    name: "Brian Otieno",
    role: "Cloud Infrastructure & DevOps Engineer",
    bio: "Dedicated to 99.99% uptime, zero-downtime deployments, and automated CI/CD pipelines. Brian architects containerized Kubernetes clusters, AWS serverless backends, and edge-caching architectures on Cloudflare.",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
    alt: "Portrait of Brian Otieno, Cloud Infrastructure and DevOps Engineer at SiroTech",
    skills: ["AWS", "Terraform", "CI/CD", "Kubernetes", "Cybersecurity"],
  },
];
