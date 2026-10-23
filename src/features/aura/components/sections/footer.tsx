import { ArrowUpRight, AudioLines } from 'lucide-react';
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <a className="wordmark" href="#">
          <AudioLines size={24} strokeWidth={1.4} />
          aura<span>®</span>
        </a>
        <p>A world of your own.</p>
        <a href="#configure">
          Find your Aura <ArrowUpRight size={15} />
        </a>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} AURA STUDIO</span>
        <span>
          Independent product concept. Specifications are illustrative.
        </span>
        <a href="#">BACK TO TOP ↑</a>
      </div>
    </footer>
  );
}
