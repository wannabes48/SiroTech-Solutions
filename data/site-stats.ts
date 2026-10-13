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
    value: 5,
    suffix: "+",
    label: "Years building scalable software",
  },
  {
    value: 7,
    suffix: "+",
    label: "Countries served (Kenya, East Africa, US & the rest of the world)",
  },
];
