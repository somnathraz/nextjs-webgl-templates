'use client';
import { createContext, useContext, useRef, useState } from 'react';
import { Minus, Plus, X, ArrowUpRight, ShoppingBag } from 'lucide-react';
import { FLAVORS, PACK_PRICE, formatPrice } from '@/features/offday/lib/products';
import type { BagItem } from '@/features/offday/types/product';
const ShopContext = createContext<{
  count: number;
  open: () => void;
  add: (flavorId: string, packs: number) => void;
} | null>(null);
export function useShop() {
  const shop = useContext(ShopContext);
  if (!shop) throw new Error('ShopProvider is required');
  return shop;
}
export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BagItem[]>([]);
  const [message, setMessage] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const count = items.reduce((sum, item) => sum + item.packs, 0);
  function open() {
    setMessage('');
    dialog.current?.showModal();
  }
  function add(flavorId: string, packs: number) {
    setItems((previous) => {
      const existing = previous.find((item) => item.flavorId === flavorId);
      return existing
        ? previous.map((item) =>
            item.flavorId === flavorId
              ? { ...item, packs: Math.min(12, item.packs + packs) }
              : item,
          )
        : [...previous, { flavorId, packs }];
    });
    open();
  }
  function change(flavorId: string, delta: number) {
    setMessage('');
    setItems((previous) =>
      previous
        .map((item) =>
          item.flavorId === flavorId
            ? { ...item, packs: Math.min(12, item.packs + delta) }
            : item,
        )
        .filter((item) => item.packs > 0),
    );
  }
  function save() {
    try {
      localStorage.setItem(
        'offday-sample-box',
        JSON.stringify({ version: 1, items }),
      );
      setMessage('Your sample box is saved on this device. Good taste.');
    } catch {
      setMessage(
        'Your browser could not save this box. Your selection is still available while this page stays open.',
      );
    }
  }
  return (
    <ShopContext.Provider value={{ count, open, add }}>
      {children}
      <dialog
        ref={dialog}
        className="bag-dialog"
        aria-labelledby="bag-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <div className="bag-top">
          <span className="eyebrow">A LITTLE BOX OF POSSIBILITY</span>
          <button
            className="icon-button"
            aria-label="Close bag"
            onClick={() => dialog.current?.close()}
          >
            <X size={23} />
          </button>
        </div>
        <h2 id="bag-title">
          Your good
          <br />
          energy.
        </h2>
        {items.length === 0 ? (
          <div className="empty-bag">
            <ShoppingBag size={32} />
            <p>Your box is waiting for a little flavor.</p>
            <button
              className="button button-ink"
              onClick={() => dialog.current?.close()}
            >
              Keep exploring <ArrowUpRight size={17} />
            </button>
          </div>
        ) : (
          <>
            <div className="bag-items">
              {items.map((item) => {
                const flavor = FLAVORS.find((f) => f.id === item.flavorId)!;
                return (
                  <div className="bag-item" key={item.flavorId}>
                    <span
                      className="mini-can"
                      style={{ background: flavor.label, color: flavor.ink }}
                    >
                      OFFDAY
                    </span>
                    <div>
                      <h3>{flavor.name}</h3>
                      <p>6 × 250 mL · {formatPrice(PACK_PRICE)} / pack</p>
                      <div className="quantity small">
                        <button
                          aria-label={`Remove one ${flavor.name} pack`}
                          onClick={() => change(flavor.id, -1)}
                        >
                          <Minus size={12} />
                        </button>
                        <span>{item.packs}</span>
                        <button
                          aria-label={`Add one ${flavor.name} pack`}
                          disabled={item.packs >= 12}
                          onClick={() => change(flavor.id, 1)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                    <strong>{formatPrice(item.packs * PACK_PRICE)}</strong>
                  </div>
                );
              })}
            </div>
            <div className="bag-total">
              <span>Concept total</span>
              <strong>{formatPrice(count * PACK_PRICE)}</strong>
            </div>
            <button className="button button-ink" onClick={save}>
              Save my sample box <ArrowUpRight size={18} />
            </button>
          </>
        )}
        <p className="bag-message" role="status">
          {message}
        </p>
        <p className="fine-print">
          A brand concept, made to explore. No order is placed or payment taken.
        </p>
      </dialog>
    </ShopContext.Provider>
  );
}
