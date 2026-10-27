'use client';
import { useRef } from 'react';
import { X, ArrowUpRight } from 'lucide-react';

export function ExperienceNotes() {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()}>
        About this concept <ArrowUpRight size={13} />
      </button>
      <dialog
        ref={dialog}
        className="vela-notes"
        aria-labelledby="vela-notes-title"
      >
        <button
          className="vela-notes-close"
          type="button"
          aria-label="Close concept notes"
          onClick={() => dialog.current?.close()}
        >
          <X size={22} />
        </button>
        <p className="vela-eyebrow">VELA / DESIGN NOTES</p>
        <h2 id="vela-notes-title">
          A new way
          <br />
          to see possibility.
        </h2>
        <p>
          Vela is an original spatial-computing product concept. It explores how
          a wearable can be introduced through light, materials, and a
          continuous change of perspective.
        </p>
        <dl>
          <div>
            <dt>A real 3D object</dt>
            <dd>
              The visor, frame, woven bands, dial, and optical layers are
              generated in Three.js. The model responds to scroll and your
              finish selections.
            </dd>
          </div>
          <div>
            <dt>A connected journey</dt>
            <dd>
              The camera moves from the exterior to an exploded view, then
              passes through the visor into an original AI-generated alpine
              environment.
            </dd>
          </div>
          <div>
            <dt>A thoughtful fallback</dt>
            <dd>
              Native scroll, keyboard controls, reduced-motion support, and an
              optional quiet view keep the experience approachable.
            </dd>
          </div>
        </dl>
        <p className="vela-notes-footnote">
          This is a frontend showcase, not a device for sale. No product
          specifications or availability claims are implied.
        </p>
      </dialog>
    </>
  );
}
