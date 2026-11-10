'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValue,
} from 'motion/react';
import {
  ArrowUpRight,
  ArrowDown,
  Plus,
  Minus,
  Scissors,
  MapPin,
  Clock,
  Menu,
  X,
} from 'lucide-react';
import { services, stylists, photo, money } from './data';
import { Booking } from './booking';

function Lookbook() {
  const ref = useRef<HTMLElement>(null);
  const film = useRef<HTMLDivElement>(null);
  const travel = useMotionValue(0);
  const reduced = !!useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  useEffect(() => {
    const element = film.current;
    if (!element) return;
    const measure = () =>
      travel.set(
        Math.max(
          0,
          element.scrollWidth - (element.parentElement?.clientWidth ?? 0),
        ),
      );
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    if (element.parentElement) observer.observe(element.parentElement);
    measure();
    return () => observer.disconnect();
  }, [travel]);
  const x = useTransform(() => -scrollYProgress.get() * travel.get());
  return (
    <section
      ref={ref}
      className={`mw-lookbook ${reduced ? 'is-still' : ''}`}
      id="mw-work"
    >
      <div className="mw-look-sticky">
        <div className="mw-section-heading">
          <div>
            <span className="mw-eyebrow">THE CHAIR DIARIES / 01—04</span>
            <h2>
              Good hair.
              <br />
              <em>Great energy.</em>
            </h2>
          </div>
          <p>
            Real texture. A little attitude.
            <br />
            Find your next chapter.
          </p>
        </div>
        <div className="mw-film-window">
          <motion.div
            ref={film}
            className="mw-film"
            style={reduced ? undefined : { x }}
          >
            {[
              {
                img: 'photo-1524504388940-b1c1722653e1',
                name: 'Soft, lived-in layers',
                tag: 'CUT / MOVEMENT',
              },
              {
                img: 'photo-1524250502761-1ac6f2e30d43',
                name: 'A little more dimension',
                tag: 'COLOUR / EXPRESSION',
              },
              {
                img: 'photo-1534528741775-53994a69daeb',
                name: 'Made for your texture',
                tag: 'CURL / CHARACTER',
              },
              {
                img: 'photo-1517841905240-472988babdf9',
                name: 'Effortless, every day',
                tag: 'STYLE / CONFIDENCE',
              },
            ].map((item, i) => (
              <figure key={item.name}>
                <div className="mw-film-image">
                  <Image
                    unoptimized
                    width={1000}
                    height={1200}
                    src={photo(item.img, 1000)}
                    alt={item.name}
                    loading="lazy"
                  />
                  <span>0{i + 1}</span>
                </div>
                <figcaption>
                  <span>{item.name}</span>
                  <small>{item.tag}</small>
                </figcaption>
              </figure>
            ))}
          </motion.div>
        </div>
        <div className="mw-film-bottom">
          <span>THE LOOK IS YOURS. THE CRAFT IS OURS.</span>
          <motion.div style={{ scaleX: reduced ? 1 : scrollYProgress }} />
        </div>
      </div>
    </section>
  );
}

function SalonFooter({ book }: { book: () => void }) {
  const reduced = !!useReducedMotion();
  return (
    <footer className="mw-footer">
      <div className="mw-footer-invite">
        <span className="mw-eyebrow">A FRESH START LOOKS GOOD ON YOU.</span>
        <button onClick={book}>
          Your chair is waiting.
          <ArrowUpRight />
        </button>
      </div>
      <div className="mw-footer-links">
        <div>
          <span className="mw-eyebrow">COME AS YOU ARE</span>
          <p>
            Indiranagar, Bengaluru
            <br />
            Concept studio · location illustrative
          </p>
        </div>
        <div>
          <span className="mw-eyebrow">MAKE A LITTLE TIME</span>
          <p>
            Tuesday—Sunday / 10 am—7 pm
            <br />
            Monday / taking a breath
          </p>
        </div>
        <nav aria-label="Footer">
          <a href="#mw-services">
            Our services <ArrowUpRight size={14} />
          </a>
          <a href="#mw-team">
            Meet your people <ArrowUpRight size={14} />
          </a>
          <a href="#mw-visit">
            Plan your visit <ArrowUpRight size={14} />
          </a>
        </nav>
      </div>
      <motion.div
        className="mw-footer-name"
        aria-hidden="true"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {'morrow'.split('').map((c, i) => (
          <motion.span
            key={i}
            variants={{
              hidden: { y: reduced ? 0 : '105%', rotate: reduced ? 0 : 8 },
              visible: { y: 0, rotate: 0 },
            }}
            transition={{
              duration: reduced ? 0 : 0.9,
              delay: reduced ? 0 : i * 0.07,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {c}
          </motion.span>
        ))}
        <sup>®</sup>
      </motion.div>
      <div className="mw-footer-bottom">
        <span>© {new Date().getFullYear()} MORROW · SALON CONCEPT</span>
        <Link href="/">
          Back to showcases <ArrowUpRight size={13} />
        </Link>
        <a href="#mw-top">BACK TO TOP ↑</a>
      </div>
    </footer>
  );
}

export function MorrowHome() {
  const [booking, setBooking] = useState(false);
  const [selected, setSelected] = useState(0);
  const [category, setCategory] = useState('All');
  const [faq, setFaq] = useState<number | null>(0);
  const [menu, setMenu] = useState(false);
  const reduced = !!useReducedMotion();
  const hero = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: hero,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const reveal = {
    initial: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 35 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: reduced ? 0 : 0.75 },
  };
  function book(index = 0) {
    setSelected(index);
    setBooking(true);
    setMenu(false);
  }
  return (
    <>
      <a className="mw-skip" href="#mw-main">
        Skip to content
      </a>
      <header className="mw-nav" id="mw-top">
        <a href="#mw-top" className="mw-brand">
          morrow<sup>®</sup>
        </a>
        <nav aria-label="Main navigation">
          <a href="#mw-services">The menu</a>
          <a href="#mw-work">Our work</a>
          <a href="#mw-team">The people</a>
          <a href="#mw-visit">Find us</a>
        </nav>
        <button className="mw-nav-book" onClick={() => book()}>
          Find your good hair day <ArrowUpRight size={17} />
        </button>
        <button
          className="mw-menu-toggle mw-icon"
          aria-label={menu ? 'Close menu' : 'Open menu'}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </header>
      {menu && (
        <nav className="mw-mobile-menu" aria-label="Mobile navigation">
          {[
            ['The menu', 'mw-services'],
            ['Our work', 'mw-work'],
            ['The people', 'mw-team'],
            ['Find us', 'mw-visit'],
          ].map(([label, id]) => (
            <a href={`#${id}`} key={id} onClick={() => setMenu(false)}>
              {label}
              <ArrowUpRight />
            </a>
          ))}
          <button onClick={() => book()}>
            Book your visit <ArrowUpRight />
          </button>
        </nav>
      )}
      <main id="mw-main">
        <section className="mw-hero" ref={hero}>
          <motion.div
            className="mw-hero-photo"
            style={reduced ? undefined : { y: heroY, scale: heroScale }}
          />
          <div className="mw-hero-shade" />
          <div className="mw-hero-top">
            <span>GOOD HAIR. GOOD COMPANY.</span>
            <span>HAIR STUDIO / BENGALURU</span>
          </div>
          <div className="mw-hero-title">
            <motion.h1
              initial={{ opacity: 0, y: reduced ? 0 : 70 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0 : 1 }}
            >
              <span className="mw-hero-letters" aria-label="morrow">
                {'morrow'.split('').map((letter, i) => (
                  <motion.b
                    aria-hidden="true"
                    key={i}
                    initial={{
                      y: reduced ? 0 : '110%',
                      rotateX: reduced ? 0 : 80,
                    }}
                    animate={{ y: 0, rotateX: 0 }}
                    transition={{
                      duration: reduced ? 0 : 1.2,
                      delay: reduced ? 0 : i * 0.1,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {letter}
                  </motion.b>
                ))}
              </span>
              <span>®</span>
            </motion.h1>
            <div className="mw-hero-bottom">
              <motion.p {...reveal}>
                A little change.
                <br />
                <em>A lot more you.</em>
              </motion.p>
              <button className="mw-button mw-lime" onClick={() => book()}>
                Book your visit <ArrowUpRight size={19} />
              </button>
              <a
                className="mw-hero-scroll"
                href="#mw-intro"
                aria-label="Explore the studio"
              >
                <ArrowDown size={22} />
              </a>
            </div>
          </div>
        </section>
        <section className="mw-intro" id="mw-intro">
          <span className="mw-eyebrow">YOUR HAIR. YOUR KIND OF BEAUTIFUL.</span>
          <motion.h2 {...reveal}>
            Not a new you.
            <br />
            Just <em>more you.</em>
            <Scissors aria-hidden="true" />
          </motion.h2>
          <motion.div {...reveal}>
            <p>
              We&apos;re here for the cuts that grow out beautifully. The colour
              that catches the light. And that feeling when you catch yourself
              in the mirror.
            </p>
            <p>
              No rush. No rules about who you should be. Just good people,
              thoughtful craft, and hair that feels like home.
            </p>
            <a href="#mw-services" className="mw-link">
              Find your thing <ArrowDown size={17} />
            </a>
          </motion.div>
        </section>
        <section className="mw-services" id="mw-services">
          <div className="mw-section-heading">
            <div>
              <span className="mw-eyebrow">A LITTLE SOMETHING FOR YOU</span>
              <motion.h2 {...reveal}>The good-hair menu.</motion.h2>
            </div>
            <p>
              Time to slow down.
              <br />
              Leave the rest to us.
            </p>
          </div>
          <div className="mw-filters" role="group" aria-label="Filter services">
            {['All', 'Cut & style', 'Colour', 'Care'].map((c) => (
              <button
                key={c}
                aria-pressed={c === category}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="mw-service-list">
            {services.map(
              (s, i) =>
                (category === 'All' || category === s.category) && (
                  <motion.button
                    layout
                    className="mw-service-row"
                    key={s.name}
                    {...reveal}
                    onClick={() => book(i)}
                  >
                    <span className="mw-service-number">0{i + 1}</span>
                    <span>
                      <strong>{s.name}</strong>
                      <small>{s.description}</small>
                    </span>
                    <span className="mw-service-price">
                      {money(s.price)}
                      <small>{s.minutes} min · from</small>
                    </span>
                    <ArrowUpRight />
                  </motion.button>
                ),
            )}
          </div>
          <p className="mw-service-note">
            Sample prices. Your stylist will confirm the final plan and price
            before starting. Colour appointments include a consultation.
          </p>
        </section>
        <Lookbook />
        <section className="mw-team" id="mw-team">
          <div className="mw-section-heading">
            <div>
              <span className="mw-eyebrow">TALENTED HANDS. LOVELY HUMANS.</span>
              <motion.h2 {...reveal}>Your kind of people.</motion.h2>
            </div>
            <p>
              Different specialties.
              <br />
              The same thoughtful approach.
            </p>
          </div>
          <div className="mw-team-grid">
            {stylists.slice(1).map((s, i) => (
              <motion.article
                key={s.name}
                {...reveal}
                transition={{
                  duration: reduced ? 0 : 0.7,
                  delay: reduced ? 0 : i * 0.12,
                }}
              >
                <div className="mw-person-photo">
                  <Image
                    unoptimized
                    width={750}
                    height={1000}
                    src={photo(s.photo, 750)}
                    alt={`${s.name}, ${s.role}`}
                    loading="lazy"
                  />
                </div>
                <div className="mw-person-info">
                  <h3>{s.name}</h3>
                  <ArrowUpRight size={20} />
                </div>
                <p>{s.role}</p>
              </motion.article>
            ))}
          </div>
          <p className="mw-concept-note">
            Meet the concept team. Portraits are illustrative.
          </p>
        </section>
        <section className="mw-ritual">
          <motion.div {...reveal}>
            <span className="mw-eyebrow">IT&apos;S MORE THAN THE HAIR.</span>
            <h2>
              A deep breath.
              <br />A fresh perspective.
              <br />
              <em>A very good chair.</em>
            </h2>
            <p>
              A proper consultation. Something warm to drink. Space to talk, or
              space to switch off. Your appointment is yours.
            </p>
            <button className="mw-button mw-lime" onClick={() => book()}>
              Make time for yourself <ArrowUpRight size={18} />
            </button>
          </motion.div>
          <div className="mw-ritual-photo">
            <Image
              unoptimized
              width={1200}
              height={1200}
              src={photo('photo-1600948836101-f9ffda59d250', 1200)}
              alt="Bright salon interior with styling chairs and mirrors"
              loading="lazy"
            />
          </div>
        </section>
        <section className="mw-visit" id="mw-visit">
          <div>
            <span className="mw-eyebrow">COME ON OVER</span>
            <motion.h2 {...reveal}>
              Somewhere
              <br />
              <em>to feel good.</em>
            </motion.h2>
            <p>
              <MapPin size={18} /> Indiranagar, Bengaluru
            </p>
            <p>
              <Clock size={18} /> Tue—Sun, 10 am—7 pm
            </p>
            <small>
              Demo salon concept. Exact address and contact details to be
              supplied.
            </small>
            <button className="mw-link" onClick={() => book()}>
              Plan your visit <ArrowUpRight size={17} />
            </button>
          </div>
          <div className="mw-faq">
            <h3>A few things to know.</h3>
            {[
              {
                q: 'Is it your first time here?',
                a: 'Start with the signature cut or a colour appointment. Every service begins with a consultation about your hair, routine, and what you have in mind.',
              },
              {
                q: 'What if I need to reschedule?',
                a: 'For a real appointment, please contact the studio at least 24 hours ahead. This demo saves a local appointment only and does not reserve a salon chair.',
              },
              {
                q: 'Do you work with my hair texture?',
                a: 'The concept service menu welcomes different textures. For a live salon launch, add each stylist’s specific experience and consultation options here.',
              },
              {
                q: 'How does booking work?',
                a: 'Choose a service, stylist, date, and time. This preview simulates availability and saves a demo appointment on your device. No payment is collected and no confirmation email is sent.',
              },
            ].map((f, i) => (
              <div key={f.q}>
                <button
                  aria-expanded={faq === i}
                  aria-controls={`mw-answer-${i}`}
                  onClick={() => setFaq(faq === i ? null : i)}
                >
                  {f.q}
                  {faq === i ? <Minus size={16} /> : <Plus size={16} />}
                </button>
                <motion.div
                  id={`mw-answer-${i}`}
                  initial={false}
                  animate={{
                    height: faq === i ? 'auto' : 0,
                    opacity: faq === i ? 1 : 0,
                  }}
                  transition={{ duration: reduced ? 0 : 0.3 }}
                  inert={faq !== i}
                  aria-hidden={faq !== i}
                  style={{ overflow: 'hidden' }}
                >
                  <p>{f.a}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SalonFooter book={() => book()} />
      {booking && (
        <Booking
          open={booking}
          selected={selected}
          onClose={() => setBooking(false)}
        />
      )}
    </>
  );
}
