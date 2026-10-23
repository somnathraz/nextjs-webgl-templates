import { ArrowUpRight } from 'lucide-react';
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <p>
          GOOD ENERGY.
          <br />
          GREAT DETOURS.
        </p>
        <a href="#shop">
          GO FIND YOUR FLAVOR <ArrowUpRight size={20} />
        </a>
      </div>
      <a href="#" className="footer-wordmark" aria-label="Offday back to top">
        offday<span>®</span>
      </a>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} OFFDAY STUDIO</span>
        <span>AN ORIGINAL BRAND CONCEPT. MADE FOR THE GOOD DAYS.</span>
        <a href="#">BACK TO THE TOP ↑</a>
      </div>
    </footer>
  );
}
