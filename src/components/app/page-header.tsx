import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-[18px] mt-1 flex items-end justify-between gap-3">
      <div>
        <h1 className="text-[34px] font-bold leading-[1.06] tracking-[-.028em] text-white">{title}</h1>
        <p className="mt-1 text-[15px] text-[var(--label-2)]">{description ?? eyebrow}</p>
      </div>
      {action}
    </header>
  );
}
