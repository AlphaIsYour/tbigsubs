"use client";

import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function ClientBreadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 text-xs text-ink-muted mb-4 flex-wrap">
      <Link href="/dashboard" className="hover:text-primary-dark">
        Dashboard
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="mx-1">/</span>
          {item.href ? (
            <Link href={item.href} className="hover:text-primary-dark">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
