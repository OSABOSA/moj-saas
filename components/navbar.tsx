import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function Navbar() {
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/pricing", label: "Pricing" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/">
          <div className="flex cursor-pointer items-center gap-2" data-testid="link-logo">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">C</span>
            </div>
            <span className="font-display text-xl font-bold">ASMO</span>
          </div>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <span
                className={`cursor-pointer text-sm font-medium transition-colors hover:text-primary`}
                data-testid={`link-nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </span>
            </Link>
          ))}
          <SignedIn>
            <Link href="/dashboard">
              <span
                className={`cursor-pointer text-sm font-medium transition-colors hover:text-primary`}
                data-testid={`link-nav-dashboard`}
              >
                Dashboard
              </span>
            </Link>
          </SignedIn>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SignedOut>
            <SignInButton>
              <Button data-testid="button-sign-in">Sign In</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/"/>
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
