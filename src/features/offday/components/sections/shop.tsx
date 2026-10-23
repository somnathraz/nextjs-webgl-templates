'use client';
import { JourneyAnchor } from '@/features/offday/components/experience/product-journey';
import { useState } from 'react';
import { ArrowUpRight, Minus, Plus, Rotate3D } from 'lucide-react';
import { FLAVORS, PACK_PRICE, formatPrice } from '@/features/offday/lib/products';
import { useShop } from '@/features/offday/components/ui/shop-provider';
export function Shop() {
  const [flavor, setFlavor] = useState(FLAVORS[0]);
  const [packs, setPacks] = useState(1);
  const { add } = useShop();
  return (
    <section className="shop" id="shop">
      <div className="shop-heading">
        <p className="eyebrow">PICK YOUR PERSONALITY.</p>
        <h2>
          THREE FLAVORS.
          <br />
          <span>ZERO BORING DAYS.</span>
        </h2>
      </div>
      <div className="shop-grid">
        <div className="shop-visual" style={{ background: flavor.background }}>
          <span className="shop-index">N° {flavor.number}</span>
          <span className="shop-backtext">
            OFF
            <br />
            DAY
          </span>
          <JourneyAnchor
            className="can-scene can-interactive"
            stage="shop"
            flavor={flavor}
          />
          <span className="rotate-hint">
            <Rotate3D size={15} /> A GOOD LOOK FROM EVERY ANGLE
          </span>
        </div>
        <div className="shop-options">
          <div className="shop-title">
            <h3>{flavor.name}</h3>
            <span>{formatPrice(PACK_PRICE)}</span>
          </div>
          <p className="shop-note">
            {flavor.note}
            <br />
            Six little reasons to get out there.
          </p>
          <div
            className="flavor-options"
            role="group"
            aria-label="Choose your flavor"
          >
            {FLAVORS.map((item) => (
              <button
                key={item.id}
                onClick={() => setFlavor(item)}
                aria-pressed={flavor.id === item.id}
              >
                <i style={{ background: item.background }} />
                <span>{item.name}</span>
                <span>{item.number}</span>
              </button>
            ))}
          </div>
          <div className="shop-pack">
            <div>
              <strong>The good-energy six-pack</strong>
              <span>6 × 250 mL cans · Single flavor</span>
            </div>
            <div className="quantity">
              <button
                aria-label="Decrease packs"
                disabled={packs === 1}
                onClick={() => setPacks(packs - 1)}
              >
                <Minus size={14} />
              </button>
              <span aria-live="polite">{packs}</span>
              <button
                aria-label="Increase packs"
                disabled={packs === 12}
                onClick={() => setPacks(packs + 1)}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
          <button
            className="button button-ink add-button"
            onClick={() => add(flavor.id, packs)}
          >
            Add a little good energy — {formatPrice(packs * PACK_PRICE)}{' '}
            <ArrowUpRight size={18} />
          </button>
          <p className="shop-caption">
            Build a sample box. This concept store doesn’t take payments.
          </p>
          <details className="product-details">
            <summary>What’s the idea?</summary>
            <p>
              OFFDAY is a fictional sparkling energy-drink concept. Packaging,
              flavors, and prices demonstrate this template. Replace these with
              verified product details before launching a real store.
            </p>
          </details>
          <details className="product-details">
            <summary>How do I save my selection?</summary>
            <p>
              Add a six-pack, then choose “Save my sample box” in your bag. Your
              selection is stored on this device. No order is submitted.
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}
