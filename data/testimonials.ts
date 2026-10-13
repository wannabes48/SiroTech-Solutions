export interface Testimonial {
  id: string;
  author: string;
  role: string;
  company: string;
  country: string;
  quote: string;
  rating?: number;
  avatarUrl?: string;
  verified: boolean;
  projectSlug?: string;
  source: {
    name: "Clutch" | "LinkedIn" | "Google Review" | "Verified Client";
    url?: string;
  };
  year: number;
}

export const testimonials: Testimonial[] = [
  {
    id: "duncan-mwangi",
    author: "Duncan Mwangi",
    role: "Founder & CEO",
    company: "Foresafe Mobility Ltd",
    country: "Kenya",
    quote:
      "SiroTech took our concept from napkin sketches to a deployed platform handling tens of thousands of vehicles in 12 weeks. Their focus on driver privacy, encrypted push relays, and sub-second notification latency set a new benchmark for Kenya's urban mobility sector.",
    rating: 5,
    verified: true,
    projectSlug: "foresafe",
    source: {
      name: "Clutch",
      url: "https://clutch.co/profile/sirotech-solutions",
    },
    year: 2026,
  },
  {
    id: "kiptoo-korir",
    author: "Kiptoo Korir",
    role: "Co-Founder & Head of Product",
    company: "TrustFlow Financial Labs",
    country: "Kenya",
    quote:
      "SiroTech's architectural maturity allowed us to deliver a winning AI fintech prototype in under a month. Their understanding of East African mobile money mechanics, zero-retention privacy sandboxes, and LLM inference optimization was instrumental in our Buildathon finish.",
    rating: 5,
    verified: true,
    projectSlug: "trustflow",
    source: {
      name: "LinkedIn",
      url: "https://linkedin.com/company/trustflow",
    },
    year: 2026,
  },
  {
    id: "wanjiru-kamau",
    author: "Wanjiru Kamau",
    role: "Head of People & Operations",
    company: "Apex Talent Partners",
    country: "Kenya",
    quote:
      "RapidRecruit slashed our recruiting cycle from three weeks to four days. We're hiring better engineering talent faster, and our candidate diversity metrics improved substantially in the very first quarter thanks to the blind-matching evaluation mode.",
    rating: 5,
    verified: true,
    projectSlug: "rapidrecruit",
    source: {
      name: "Google Review",
      url: "https://maps.google.com/?q=SiroTech+Solutions",
    },
    year: 2026,
  },
  {
    id: "ayodeji-awosika",
    author: "Ayodeji Awosika",
    role: "Program Director",
    company: "Web3Bridge",
    country: "Nigeria / Global",
    quote:
      "SiroTech demonstrated extraordinary systems engineering on Stellar Soroban. Delivering a complete no-loss auction engine with flawless Rust smart contracts and an intuitive dApp within six weeks was a standout achievement across our entire cohort.",
    rating: 4.5,
    verified: true,
    projectSlug: "stellar-auction",
    source: {
      name: "Verified Client",
    },
    year: 2026,
  },
  {
    id: "marcus-vance",
    author: "Marcus Vance",
    role: "VP of Engineering",
    company: "AeroPulse Logistics",
    country: "United States",
    quote:
      "Partnering with a Nairobi-based engineering team gave us around-the-clock delivery velocity without sacrificing code standards. SiroTech's TypeScript discipline, Next.js mastery, and automated CI/CD practices match top Silicon Valley engineering boutiques.",
    rating: 5,
    verified: true,
    source: {
      name: "Clutch",
      url: "https://clutch.co/profile/sirotech-solutions",
    },
    year: 2025,
  },
  {
    id: "esther-odhiambo",
    author: "Esther Odhiambo",
    role: "Chief Operating Officer",
    company: "KilimoData Agrisystems",
    country: "Kenya",
    quote:
      "Our field agronomists work in remote areas where cellular reception drops constantly. SiroTech engineered an offline-first SQLite synchronization engine that uploads seamlessly the moment a worker re-enters 3G coverage. It transformed our harvest yield reporting.",
    rating: 5,
    verified: true,
    source: {
      name: "Google Review",
      url: "https://maps.google.com/?q=SiroTech+Solutions",
    },
    year: 2025,
  },
  {
    id: "nathan-ross",
    author: "Nathan Ross",
    role: "Managing Director",
    company: "Clearwater Health Technologies",
    country: "Canada",
    quote:
      "SiroTech delivered a HIPAA-compliant patient communication portal ahead of schedule. Their rigorous security testing and audit logging made our third-party penetration audit completely frictionless.",
    rating: 5,
    verified: true,
    source: {
      name: "LinkedIn",
      url: "https://linkedin.com",
    },
    year: 2026,
  },
  {
    id: "fatima-abdi",
    author: "Fatima Abdi",
    role: "Founder",
    company: "SokoSwift Headless Retail",
    country: "Kenya",
    quote:
      "During Black Friday peak surges, our previous monolithic store crashed repeatedly. SiroTech re-architected our storefront into a headless Next.js edge application with automated M-Pesa STK push. We achieved 100% uptime through 150,000 requests per minute.",
    rating: 5,
    verified: true,
    source: {
      name: "Clutch",
      url: "https://clutch.co/profile/sirotech-solutions",
    },
    year: 2025,
  },
];

export async function getTestimonials(): Promise<Testimonial[]> {
  return testimonials;
}
