'use client';

import { useRef } from 'react';
import { ArrowUpRight, X } from 'lucide-react';

export function FieldNotes() {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        className="hel-text-button"
        onClick={() => dialog.current?.showModal()}
      >
        Field notes <ArrowUpRight size={12} />
      </button>
      <dialog
        ref={dialog}
        className="hel-notes"
        aria-labelledby="hel-notes-title"
      >
        <button
          type="button"
          className="hel-notes-close"
          aria-label="Close field notes"
          onClick={() => dialog.current?.close()}
        >
          <X size={22} />
        </button>
        <span className="hel-kicker">HELIOS / STUDIO NOTES / 001</span>
        <h2 id="hel-notes-title">
          An impossible object.
          <br />
          <em>A real-time world.</em>
        </h2>
        <p>
          HELIOS is an original interactive art study about structure, energy,
          and the moment one becomes the other.
        </p>
        <dl>
          <div>
            <dt>The form</dt>
            <dd>
              72 individually choreographed metal blades, constructed from a
              mathematical surface. No model downloads.
            </dd>
          </div>
          <div>
            <dt>The light</dt>
            <dd>
              A custom molten-surface shader, reflected studio light, and a
              restrained bloom pass. Every frame renders in your browser.
            </dd>
          </div>
          <div>
            <dt>The journey</dt>
            <dd>
              Scroll controls the sculpture, camera, and particle field. The
              instrument gives you direct control of aperture, energy, and
              material.
            </dd>
          </div>
          <div>
            <dt>The sound</dt>
            <dd>
              Three synthesized tones form a quiet harmonic bed. Sound is
              optional and only starts when you enable it.
            </dd>
          </div>
        </dl>
        <p className="hel-notes-small">
          Built with Next.js, React Three Fiber, Three.js, GLSL, and Motion.
          Reduced-motion preferences are respected. No accounts, external
          services, or tracking.
        </p>
      </dialog>
    </>
  );
}
