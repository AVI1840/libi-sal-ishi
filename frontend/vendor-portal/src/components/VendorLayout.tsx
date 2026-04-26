import { ReactNode } from "react";

interface VendorLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function VendorLayout({ children, title, subtitle, actions }: VendorLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {title && (
        <header className="px-8 pt-7 pb-5 flex items-end justify-between gap-4 border-b border-border bg-background sticky top-0 z-20">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="p-8 animate-fade-in">{children}</div>
    </div>
  );
}
