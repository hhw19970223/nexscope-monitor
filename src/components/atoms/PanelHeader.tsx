import { ReactNode } from "react";
import { LiveBadge } from "./LiveBadge";

interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  live?: boolean;
  children?: ReactNode;
  icon?: ReactNode;
}

export function PanelHeader({ title, subtitle, live = false, children, icon }: PanelHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-3 pb-2 border-b border-white/5">
      <div className="flex items-center gap-2">
        {icon && <span className="text-[#4C88F1]">{icon}</span>}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[11px] font-bold tracking-widest uppercase text-[#e2e8f0]">
              {title}
            </h2>
            {live && <LiveBadge />}
          </div>
          {subtitle && (
            <p className="text-[10px] text-[#64748b] mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
