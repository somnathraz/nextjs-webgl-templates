import { Reveal } from '@/features/aura/components/ui/reveal';
export function Details() {
  return (
    <section id="details" className="details">
      <div className="details-top">
        <p className="eyebrow">02 — THE FEELING</p>
        <Reveal>
          <h2>
            A little closer
            <br />
            to everything.
          </h2>
        </Reveal>
        <p>
          The texture of a voice. The space between notes.
          <br />
          Listen like you’re hearing it for the first time.
        </p>
      </div>
      <div className="spec-grid">
        <Reveal>
          <span className="spec-number">
            40<span>mm</span>
          </span>
          <h3>Small details. Big emotion.</h3>
          <p>
            Custom dynamic drivers bring warmth, depth, and remarkable clarity
            to every track.
          </p>
        </Reveal>
        <Reveal>
          <span className="spec-number">
            48<span>hrs</span>
          </span>
          <h3>Stay in your world.</h3>
          <p>
            From the first light to the last train. A battery designed to keep
            pace with you.
          </p>
        </Reveal>
        <Reveal>
          <span className="spec-number spec-word">Quiet.</span>
          <h3>Make room for the music.</h3>
          <p>
            Adaptive noise cancellation softens the outside world. Let the good
            stuff in.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
