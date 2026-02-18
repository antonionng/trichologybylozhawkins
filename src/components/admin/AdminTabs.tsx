"use client";

import { ReactNode } from "react";
import clsx from "clsx";

export interface AdminTab {
  key: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface AdminTabsProps {
  tabs: AdminTab[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

export function AdminTabs({
  tabs,
  activeKey,
  onChange,
  className,
}: AdminTabsProps) {
  return (
    <div
      className={clsx(
        "flex items-center gap-0.5 border-b border-admin-border",
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={clsx(
            "relative px-3 py-2 text-sm font-medium transition-colors duration-150 whitespace-nowrap",
            "focus:outline-none",
            activeKey === tab.key
              ? "text-admin-text"
              : "text-admin-text-muted hover:text-admin-text-secondary"
          )}
        >
          <span className="flex items-center gap-1.5">
            {tab.icon}
            {tab.label}
            {tab.count !== undefined ? (
              <span
                className={clsx(
                  "ml-0.5 rounded-full px-1.5 py-px text-[10px] font-medium",
                  activeKey === tab.key
                    ? "bg-admin-accent/15 text-admin-accent"
                    : "bg-white/5 text-admin-text-muted"
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </span>
          {activeKey === tab.key ? (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-admin-accent rounded-full" />
          ) : null}
        </button>
      ))}
    </div>
  );
}
