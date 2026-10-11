export interface StatItem {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
}

export const siteStats: StatItem[] = [
  {
    value: 24,
    suffix: "+",
    label: "Production projects shipped & deployed",
  },
  {
    value: 6,
    suffix: "+",
    label: "Years building scalable software",
  },
  {
    value: 3,
    suffix: "",
    label: "Countries served (Kenya, US, Canada)",
  },
];
