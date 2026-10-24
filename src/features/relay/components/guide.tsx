'use client';
import { useRef } from 'react';
import { X, ArrowUpRight } from 'lucide-react';
export function Guide() {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        className="relay-guide-trigger"
        onClick={() => ref.current?.showModal()}
      >
        How it works <ArrowUpRight size={14} />
      </button>
      <dialog
        className="relay-guide"
        ref={ref}
        aria-labelledby="relay-guide-title"
      >
        <button
          aria-label="Close guide"
          className="relay-guide-close"
          onClick={() => ref.current?.close()}
        >
          <X size={20} />
        </button>
        <span className="relay-eyebrow">RELAY / FIELD NOTES</span>
        <h2 id="relay-guide-title">
          From intent
          <br />
          to outcome.
        </h2>
        <p>
          Relay is an interactive frontend template for an agent orchestration
          product. The playground runs a deterministic simulation in your
          browser. It does not call an AI model or connect to your accounts.
        </p>
        <ol>
          <li>
            <strong>Choose a mission.</strong> Try research, release review, or
            support. Each has a different trace and result.
          </li>
          <li>
            <strong>Watch the handoffs.</strong> Pause, resume, and inspect any
            node while the team progresses.
          </li>
          <li>
            <strong>Review the result.</strong> Read the sample artifact or copy
            it locally. No email or publication happens.
          </li>
        </ol>
        <p>
          To adapt this template, replace the example workflows and connect the
          execution states to your own agent backend. Keep human review explicit
          for actions that change external systems.
        </p>
        <button className="relay-button" onClick={() => ref.current?.close()}>
          Got it <ArrowUpRight size={16} />
        </button>
      </dialog>
    </>
  );
}
