'use client';
import { useRef } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
export function ProjectDetails() {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        className="forme-project-button"
        onClick={() => dialog.current?.showModal()}
      >
        Read the design notes <ArrowUpRight size={18} />
      </button>
      <dialog
        className="forme-project-dialog"
        ref={dialog}
        aria-labelledby="forme-notes-title"
      >
        <button
          className="forme-dialog-close"
          aria-label="Close design notes"
          onClick={() => dialog.current?.close()}
        >
          <X size={22} />
        </button>
        <span className="forme-eyebrow">COURTYARD HOUSE / DESIGN NOTES</span>
        <h2 id="forme-notes-title">
          A house built
          <br />
          around an absence.
        </h2>
        <p>
          The courtyard is the first room. Everything else follows from it: the
          sheltered entry, the open living space, and the long view across the
          water.
        </p>
        <h3>01 — A floating horizon</h3>
        <p>
          A thin roof plane ties the pavilion together. Its deep overhang
          softens the threshold between the interior and the terrace.
        </p>
        <h3>02 — A material conversation</h3>
        <p>
          Light stone and walnut are the starting palette. The interactive study
          lets you compare limestone, travertine, and basalt in daylight and
          blue hour.
        </p>
        <h3>03 — A readable structure</h3>
        <p>
          Explore the Unfold view to separate the roof and read the columns,
          wall planes, and open floor. The model and generated imagery are
          conceptual interpretations, not construction drawings or a
          commissioned building.
        </p>
        <button
          className="forme-project-button"
          onClick={() => dialog.current?.close()}
        >
          Return to the house ↗
        </button>
      </dialog>
    </>
  );
}
