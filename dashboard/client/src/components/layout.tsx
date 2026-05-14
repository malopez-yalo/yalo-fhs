import { Link, useLocation } from "wouter";
import { LayoutDashboard, CheckSquare, FolderKanban, Settings, Menu, X, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const NAVIGATION_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Projects", icon: FolderKanban, href: "/projects" },
  { label: "Tasks", icon: CheckSquare, href: "/tasks" },
  { label: "Team", icon: Users, href: "/team" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-sm border-r border-border/50">
      <div className="p-6 border-b border-border/50">
        <h1 className="text-xl font-display font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          ProjectFlow
        </h1>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-2">
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
                  group hover:shadow-md hover:translate-x-1
                  ${isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-medium" 
                    : "text-muted-foreground hover:bg-white hover:text-foreground"
                  }
                `}
                onClick={() => setIsMobileOpen(false)}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "" : "group-hover:text-primary transition-colors"}`} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border/50">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">Product Manager</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 fixed h-full z-30">
        <NavContent />
      </aside>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-display font-bold text-primary">ProjectFlow</h1>
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 border-r-0 w-72">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
