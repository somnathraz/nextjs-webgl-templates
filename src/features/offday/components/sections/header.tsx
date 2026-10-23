'use client';
import { ArrowUpRight, ShoppingBag } from 'lucide-react';
import { useShop } from '@/features/offday/components/ui/shop-provider';
export function Header() {
  const { count, open } = useShop();
  return (
    <header className="site-header">
      <a className="wordmark" href="/offday" aria-label="Offday home">
        offday<span>®</span>
      </a>
      <nav aria-label="Main navigation">
        <a href="#flavor-flight">The flavors</a>
        <a href="#flavors">The good stuff</a>
        <a href="#our-way">Our kind of day</a>
      </nav>
      <div className="header-actions">
        <a href="#shop" className="header-shop">
          Find your flavor <ArrowUpRight size={14} />
        </a>
        <button
          className="bag-button"
          onClick={open}
          aria-label={`Open sample bag, ${count} packs`}
        >
          <ShoppingBag size={17} />
          <span>{count}</span>
        </button>
      </div>
    </header>
  );
}
