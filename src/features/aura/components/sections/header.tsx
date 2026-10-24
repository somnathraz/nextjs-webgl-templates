import { ArrowUpRight, AudioLines } from 'lucide-react';
import { TemplateDownloadLink } from '@/components/template-download-link';
export function Header() {
  return (
    <header className="header">
      <a href="/aura" className="wordmark" aria-label="Aura home">
        <AudioLines size={23} strokeWidth={1.4} />
        aura<span>®</span>
      </a>
      <nav aria-label="Main navigation">
        <a href="#design">The design</a>
        <a href="#sound">The sound</a>
        <a href="#details">The details</a>
        <TemplateDownloadLink>Download ZIP</TemplateDownloadLink>
      </nav>
      <a href="#configure" className="nav-cta">
        Make it yours <ArrowUpRight size={14} />
      </a>
    </header>
  );
}
