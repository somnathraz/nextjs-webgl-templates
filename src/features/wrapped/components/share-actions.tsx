'use client';
import { useState } from 'react';
import { Check, Download, Link2, Share2 } from 'lucide-react';
import { M, rise } from './motion';

/** Read the display font next/font registered on the theme root. */
export function cardFont() {
  const root = document.querySelector('.theme-gw');
  return (
    (root && getComputedStyle(root).getPropertyValue('--font-gw').trim()) ||
    'system-ui, sans-serif'
  );
}

/**
 * Share / save / copy for any card. Phones get the native share sheet with
 * the PNG attached; desktop falls back to a pre-written X post.
 */
export function ShareActions({
  card,
  fileName,
  text,
  path,
}: {
  card: () => Promise<Blob | null>;
  fileName: string;
  text: string;
  path: string;
}) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = () => `${location.origin}${path}`;

  const download = async () => {
    setBusy(true);
    try {
      const blob = await card();
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    try {
      const blob = 'canShare' in navigator ? await card() : null;
      const file = blob && new File([blob], fileName, { type: 'image/png' });
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text, url: url() });
        return;
      }
    } catch {
      /* cancelled or unsupported — fall through */
    }
    window.open(
      `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url())}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <M variants={rise} className="gw-actions" data-nav-ignore>
      <button className="gw-btn gw-btn--primary" onClick={share}>
        <Share2 size={16} /> Share
      </button>
      <button className="gw-btn" onClick={download} disabled={busy}>
        <Download size={16} /> {busy ? 'Rendering…' : 'Save card'}
      </button>
      <button className="gw-btn" onClick={copy}>
        {copied ? <Check size={16} /> : <Link2 size={16} />}{' '}
        {copied ? 'Copied' : 'Copy link'}
      </button>
    </M>
  );
}
