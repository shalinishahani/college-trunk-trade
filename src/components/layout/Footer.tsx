import { Link } from "@tanstack/react-router";
import { Package } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="gradient-brand grid size-9 place-items-center rounded-xl text-primary-foreground">
              <Package className="size-5" />
            </span>
            <span className="font-display text-lg font-extrabold">
              Campus<span className="gradient-text">Xchange</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            The student-only marketplace to buy, sell and exchange books, gadgets, hostel gear and
            everything else you need on campus.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Marketplace</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/products" className="hover:text-foreground">
                Browse listings
              </Link>
            </li>
            <li>
              <Link to="/sell" className="hover:text-foreground">
                Sell an item
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="hover:text-foreground">
                Wishlist
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Company</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/about" className="hover:text-foreground">
                About
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-foreground">
                Privacy policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} CampusXchange. Built for students, by students.
      </div>
    </footer>
  );
}
