import { siteStats } from "@/data/site-stats";
import { StatBlock } from "@/components/shared/stat-block";

export default function StatsSection() {
  return (
    <section className="bg-bg border-t border-rule">
      <div className="max-w-[1248px] mx-auto py-24 px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-rule">
          {siteStats.map((item, index) => (
            <div
              key={item.label}
              className={`py-8 md:py-0 ${
                index === 0
                  ? "md:pr-12 lg:pr-16"
                  : index === 1
                  ? "md:px-12 lg:px-16"
                  : "md:pl-12 lg:pl-16"
              }`}
            >
              <StatBlock
                value={item.value}
                suffix={item.suffix}
                label={item.label}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
