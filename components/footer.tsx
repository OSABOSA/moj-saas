import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">C</span>
              </div>
              <span className="font-display text-lg font-bold">ClickBot</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Professional Discord automation for modern teams.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Product</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/#features">
                  <span className="cursor-pointer text-sm text-muted-foreground hover:text-primary" data-testid="link-footer-features">
                    Features
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/pricing">
                  <span className="cursor-pointer text-sm text-muted-foreground hover:text-primary" data-testid="link-footer-pricing">
                    Pricing
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Support</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary" data-testid="link-footer-docs">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary" data-testid="link-footer-contact">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary" data-testid="link-footer-privacy">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary" data-testid="link-footer-terms">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © 2024 ClickBot. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
