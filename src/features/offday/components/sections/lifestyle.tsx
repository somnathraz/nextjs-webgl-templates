import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/features/offday/components/ui/reveal';
import { Sun } from '@/features/offday/components/ui/sun';
export function Lifestyle() {
  return (
    <section id="our-way" className="lifestyle">
      <div className="lifestyle-image">
        <Image
          src="/offday/images/offday-court.png"
          alt="A sunlit terracotta tennis court, with an orange ball in the foreground and a player heading toward the net"
          fill
          sizes="(max-width: 700px) 100vw, 60vw"
        />
        <div
          className="lifestyle-can"
          data-can-stage="lifestyle"
          data-can-flavor="orange"
        />
        <span>LESS AUTOPILOT. MORE AFTERNOONS LIKE THIS.</span>
      </div>
      <div className="lifestyle-copy">
        <Sun />
        <p className="eyebrow">THIS IS YOUR OFFDAY.</p>
        <Reveal>
          <h2>
            Life’s too good
            <br />
            to stay on
            <br />
            <em>autopilot.</em>
          </h2>
          <p>
            We’re here for the side quests. The spontaneous yes. The match that
            turns into an all-day thing.
          </p>
          <p>
            Because good energy isn’t just what’s in your can. It’s what you do
            with it.
          </p>
        </Reveal>
        <a href="#shop" className="text-link">
          Find your kind of good <ArrowUpRight size={17} />
        </a>
      </div>
    </section>
  );
}
