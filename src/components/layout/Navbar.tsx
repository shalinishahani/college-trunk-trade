import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Bell,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  PlusCircle,
  Search,
  Settings,
  Shield,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { initials } from "@/lib/marketplace";
import { resolveImage } from "@/lib/storage";

const NAV = [
  { to: "/products", label: "Browse" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    void resolveImage(profile?.profile_image).then(setAvatar);
  }, [profile?.profile_image]);

  useEffect(() => setOpen(false), [pathname]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/products", search: { q: query || undefined } });
  };

  return (
    <header className="glass sticky top-0 z-50 w-full border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="gradient-brand grid size-9 place-items-center rounded-xl text-primary-foreground shadow-soft">
            <Package className="size-5" />
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight">
            Campus<span className="gradient-text">Market</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              activeProps={{ className: "text-foreground bg-accent" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="mx-auto hidden max-w-md flex-1 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search books, laptops, cycles…"
              className="rounded-full bg-background/60 pl-9"
              aria-label="Search products"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          {user ? (
            <>
              <Button variant="ghost" size="icon" asChild aria-label="Wishlist">
                <Link to="/wishlist">
                  <Heart className="size-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild aria-label="Messages">
                <Link to="/messages">
                  <MessageSquare className="size-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild aria-label="Notifications">
                <Link to="/notifications">
                  <Bell className="size-5" />
                </Link>
              </Button>
              <Button asChild className="ml-1 hidden rounded-full sm:inline-flex">
                <Link to="/sell">
                  <PlusCircle className="size-4" /> Sell
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-1 rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar className="size-9 border">
                      {avatar ? <AvatarImage src={avatar} alt={profile?.full_name ?? "Profile"} /> : null}
                      <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                        {initials(profile?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">
                    {profile?.full_name || user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">
                      <LayoutDashboard className="size-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-listings">
                      <Package className="size-4" /> My listings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <UserIcon className="size-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">
                      <Settings className="size-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin ? (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <Shield className="size-4" /> Admin panel
                      </Link>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut();
                      navigate({ to: "/", replace: true });
                    }}
                  >
                    <LogOut className="size-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" asChild>
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link to="/auth" search={{ mode: "register" }}>
                  Get started
                </Link>
              </Button>
            </div>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-6">
              <div className="mt-8 flex flex-col gap-1">
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent"
                  >
                    {item.label}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Link to="/dashboard" className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent">
                      Dashboard
                    </Link>
                    <Link to="/sell" className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent">
                      Sell an item
                    </Link>
                  </>
                ) : (
                  <Button asChild className="mt-3 rounded-full">
                    <Link to="/auth">Sign in</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
