import type { ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUiStrings } from "@/lib/ui-strings";
import { SupportButton } from "@/components/support-button";
import { getAdminStatus } from "@/lib/admin.functions";

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const t = useUiStrings();

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const adminStatus = useServerFn(getAdminStatus);
  const { data: admin } = useQuery({
    queryKey: ["admin-status"],
    queryFn: () => adminStatus({}),
    staleTime: 5 * 60 * 1000,
  });

  const links = [
    { to: "/dashboard", label: t.navApplications },
    { to: "/targets", label: t.navTargets },
    { to: "/profile", label: t.navProfile },
    { to: "/settings", label: t.navSettings },
    ...(admin?.isAdmin ? [{ to: "/admin", label: "Admin" } as const] : []),
  ] as Array<{ to: string; label: string }>;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6">
          <Link to="/dashboard" className="font-display text-base font-bold">
            Tailor<span className="text-primary">CV</span>
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  pathname.startsWith(link.to)
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-muted-foreground"
            onClick={signOut}
          >
            <LogOut className="size-4" /> {t.signOut}
          </Button>
        </div>
      </header>
      {children}
      <SupportButton />
    </div>
  );
}
