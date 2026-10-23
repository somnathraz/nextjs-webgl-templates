'use client';
import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { ArrowUpRight, Check, Rotate3D, Layers2, X } from 'lucide-react';
import { FINISHES, PRODUCT, formatPrice } from '@/features/aura/lib/product';
const ProductScene = dynamic(
  () => import('@/features/aura/components/product/product-scene'),
  { ssr: false },
);
export function Configurator() {
  const [finish, setFinish] = useState(FINISHES[0]);
  const [exploded, setExploded] = useState(false);
  const [saved, setSaved] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  function saveConfiguration() {
    try {
      localStorage.setItem(
        'aura-configuration',
        JSON.stringify({
          version: 1,
          finish: finish.id,
          product: PRODUCT.name,
        }),
      );
      setSaved(true);
    } catch {
      setSaved(false);
    }
    dialog.current?.showModal();
  }
  return (
    <section id="configure" className="configurator">
      <div className="config-preview">
        <div className="preview-heading">
          <p className="eyebrow">03 — YOUR AURA</p>
          <span>
            LIVE 3D PREVIEW <i />
          </span>
        </div>
        <ProductScene finish={finish} exploded={exploded} interactive />
        <div className="preview-toolbar">
          <span>
            <Rotate3D size={16} /> Drag to explore
          </span>
          <button
            onClick={() => setExploded(!exploded)}
            aria-pressed={exploded}
          >
            <Layers2 size={15} />
            {exploded ? 'Assembled view' : 'Exploded view'}
          </button>
        </div>
      </div>
      <div className="config-options">
        <p className="eyebrow">PERSONAL BY DESIGN</p>
        <h2>
          Your sound.
          <br />
          Your signature.
        </h2>
        <p className="config-description">
          A familiar feeling. An unmistakable finish.
          <br />
          Find the Aura that feels like you.
        </p>
        <div className="finish-label">
          <span>01 &nbsp; Select your finish</span>
          <strong aria-live="polite">{finish.name}</strong>
        </div>
        <div className="swatches" role="group" aria-label="Product finish">
          {FINISHES.map((item) => (
            <button
              key={item.id}
              aria-label={item.name}
              aria-pressed={item.id === finish.id}
              title={item.name}
              onClick={() => setFinish(item)}
              style={{ '--swatch': item.swatch } as React.CSSProperties}
            >
              {item.id === finish.id && (
                <Check
                  size={18}
                  color={item.id === 'pearl' ? '#222' : '#fff'}
                />
              )}
            </button>
          ))}
        </div>
        <div className="config-summary">
          <div>
            <h3>Aura One</h3>
            <p>Over-ear wireless headphones</p>
          </div>
          <span>{formatPrice(PRODUCT.price)}</span>
        </div>
        <button
          className="button button-dark configure-button"
          onClick={saveConfiguration}
        >
          Make it yours <ArrowUpRight size={17} />
        </button>
        <p className="demo-note">
          Concept collection · Save your configuration
        </p>
      </div>
      <dialog
        ref={dialog}
        className="configuration-dialog"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <button
          className="dialog-close"
          onClick={() => dialog.current?.close()}
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <p className="eyebrow">YOUR AURA ONE</p>
        <h2>Good choice.</h2>
        <p>{finish.name}. Your own world of sound.</p>
        <div className="dialog-summary">
          <span>
            {PRODUCT.name} · {finish.name}
          </span>
          <strong>{formatPrice(PRODUCT.price)}</strong>
        </div>
        <p className="dialog-note">
          {saved
            ? 'Your configuration is saved on this device.'
            : 'Your configuration is ready.'}{' '}
          This is a concept showcase; no purchase or payment is made.
        </p>
        <button
          className="button button-dark"
          onClick={() => dialog.current?.close()}
        >
          Keep exploring <ArrowUpRight size={16} />
        </button>
      </dialog>
    </section>
  );
}
