'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, X, CalendarDays } from 'lucide-react';
import { services, stylists, money } from './data';

type Appointment = {
  service: number;
  stylist: string;
  date: string;
  time: string;
  reference: string;
};
const storageKey = 'morrow-demo-appointments';
function saved(): Appointment[] {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return Array.isArray(data)
      ? data.filter(
          (a) =>
            a &&
            typeof a.date === 'string' &&
            typeof a.time === 'string' &&
            typeof a.stylist === 'string' &&
            Number.isInteger(a.service) &&
            services[a.service],
        )
      : [];
  } catch {
    return [];
  }
}
function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
const times = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];
function overlaps(
  a: Appointment,
  service: number,
  date: string,
  time: string,
  stylist: string,
) {
  if (
    a.date !== date ||
    (a.stylist !== stylist &&
      a.stylist !== 'Any stylist' &&
      stylist !== 'Any stylist')
  )
    return false;
  const minutes = (v: string) =>
    Number(v.slice(0, 2)) * 60 + Number(v.slice(3));
  return (
    minutes(a.time) < minutes(time) + services[service].minutes &&
    minutes(time) < minutes(a.time) + services[a.service].minutes
  );
}
export function Booking({
  open,
  selected,
  onClose,
}: {
  open: boolean;
  selected: number;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState(0);
  const [service, setService] = useState(selected);
  const [stylist, setStylist] = useState('Any stylist');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [booked, setBooked] = useState<Appointment | null>(null);
  const [error, setError] = useState('');
  const [existing, setExisting] = useState<Appointment[]>(saved);
  const [now] = useState(() => new Date());
  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    element?.showModal();
    const before = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      element?.close();
      document.body.style.overflow = before;
    };
  }, [open]);
  function close() {
    dialog.current?.close();
    onClose();
  }
  const today = localDate(now);
  const maxDate = localDate(new Date(now.getTime() + 60 * 86400000));
  function unavailable(slot: string) {
    return (
      !date ||
      new Date(`${date}T12:00:00`).getDay() === 1 ||
      new Date(`${date}T${slot}:00`) <= new Date() ||
      existing.some((a) => overlaps(a, service, date, slot, stylist))
    );
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 2) {
      if (step === 1 && (!date || !time || unavailable(time))) {
        setError('Choose an available date and time.');
        return;
      }
      setError('');
      setStep(step + 1);
      return;
    }
    const latest = saved();
    if (
      new Date(`${date}T${time}:00`) <= new Date() ||
      latest.some((a) => overlaps(a, service, date, time, stylist))
    ) {
      setExisting(latest);
      setError('That time is no longer available. Please choose another.');
      setTime('');
      setStep(1);
      return;
    }
    const appointment = {
      service,
      stylist,
      date,
      time,
      reference: `MR-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
    };
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify([...latest, appointment]),
      );
      setBooked(appointment);
    } catch {
      setError(
        'Your browser could not save this demo appointment. Please enable local storage and try again.',
      );
    }
  }
  function calendar() {
    if (!booked) return;
    const start = new Date(`${booked.date}T${booked.time}:00`);
    const format = (d: Date) =>
      d
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '');
    const text = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Morrow//Demo booking//EN',
      'BEGIN:VEVENT',
      `UID:${booked.reference}@morrow.example`,
      `DTSTAMP:${format(new Date())}`,
      `DTSTART:${format(start)}`,
      `DTEND:${format(new Date(start.getTime() + services[service].minutes * 60000))}`,
      `SUMMARY:Morrow demo - ${services[service].name}`,
      'DESCRIPTION:Demo appointment only. No real salon reservation.',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const url = URL.createObjectURL(
      new Blob([text], { type: 'text/calendar' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'morrow-demo.ics';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <dialog
      ref={dialog}
      className="mw-booking"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      aria-labelledby="mw-book-title"
    >
      <div className="mw-book-inner">
        <header>
          <span className="mw-eyebrow">MORROW / YOUR NEXT CHAPTER</span>
          <button
            type="button"
            className="mw-icon"
            aria-label="Close booking"
            title="Close booking"
            onClick={close}
          >
            <X />
          </button>
        </header>
        {booked ? (
          <div className="mw-confirm">
            <Check size={38} />
            <h2 id="mw-book-title">
              A little time
              <br />
              for yourself.
            </h2>
            <p>Your demo appointment is saved on this device.</p>
            <dl>
              <div>
                <dt>Service</dt>
                <dd>{services[service].name}</dd>
              </div>
              <div>
                <dt>When</dt>
                <dd>
                  {booked.date} at {booked.time}
                </dd>
              </div>
              <div>
                <dt>With</dt>
                <dd>{stylist}</dd>
              </div>
              <div>
                <dt>Reference</dt>
                <dd>{booked.reference}</dd>
              </div>
            </dl>
            <button className="mw-button" onClick={calendar}>
              Add to calendar <CalendarDays size={17} />
            </button>
            <button className="mw-text-button" onClick={close}>
              Back to the studio <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="mw-book-steps" aria-label="Booking progress">
              {['Your service', 'Your time', 'Your details'].map((s, i) => (
                <span
                  key={s}
                  aria-current={step === i ? 'step' : undefined}
                  className={step === i ? 'active' : ''}
                >
                  {i + 1}. {s}
                </span>
              ))}
            </div>
            <h2 id="mw-book-title">
              {
                [
                  'What feels right?',
                  'Make it your time.',
                  'Lovely to meet you.',
                ][step]
              }
            </h2>
            {step === 0 && (
              <>
                <fieldset>
                  <legend>Choose your service</legend>
                  {services.map((s, i) => (
                    <label className="mw-service-option" key={s.name}>
                      <input
                        type="radio"
                        name="service"
                        checked={service === i}
                        onChange={() => {
                          setService(i);
                          setTime('');
                        }}
                      />
                      <span>
                        {s.name}
                        <small>{s.minutes} minutes</small>
                      </span>
                      <strong>{money(s.price)}</strong>
                    </label>
                  ))}
                </fieldset>
                <label className="mw-field">
                  Your stylist
                  <select
                    value={stylist}
                    onChange={(e) => {
                      setStylist(e.target.value);
                      setTime('');
                    }}
                  >
                    {stylists.map((s) => (
                      <option key={s.name}>{s.name}</option>
                    ))}
                  </select>
                </label>
              </>
            )}
            {step === 1 && (
              <>
                <label className="mw-field">
                  Date
                  <input
                    type="date"
                    min={today}
                    max={maxDate}
                    required
                    value={date}
                    onInput={(e) => {
                      setDate(e.currentTarget.value);
                      setTime('');
                    }}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setTime('');
                    }}
                  />
                </label>
                <fieldset>
                  <legend>Available times · your local time</legend>
                  <div className="mw-times">
                    {times.map((t) => (
                      <button
                        key={t}
                        type="button"
                        disabled={unavailable(t)}
                        aria-pressed={t === time}
                        onClick={() => {
                          setTime(t);
                          setError('');
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <p className="mw-book-note">
                  {services[service].minutes} minutes with{' '}
                  {stylist.toLowerCase()}. Finish times vary by service.
                </p>
              </>
            )}
            {step === 2 && (
              <>
                <div className="mw-book-summary">
                  {services[service].name} · {money(services[service].price)}
                  <br />
                  {date} at {time} · {stylist}
                </div>
                <label className="mw-field">
                  Your name
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={80}
                  />
                </label>
                <label className="mw-field">
                  Email
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    maxLength={150}
                  />
                </label>
                <label className="mw-field">
                  Anything we should know?
                  <textarea
                    name="notes"
                    maxLength={500}
                    rows={2}
                    placeholder="Hair goals, access needs, or a question"
                  />
                </label>
                <label className="mw-consent">
                  <input type="checkbox" required /> I understand this is a
                  demo, not a real reservation.
                </label>
              </>
            )}
            {error && (
              <p className="mw-error" role="alert">
                {error}
              </p>
            )}
            <div className="mw-book-actions">
              {step > 0 && (
                <button
                  type="button"
                  className="mw-icon"
                  aria-label="Previous step"
                  title="Previous step"
                  onClick={() => {
                    setStep(step - 1);
                    setError('');
                  }}
                >
                  <ArrowLeft />
                </button>
              )}
              <button className="mw-button" type="submit">
                {step === 2 ? 'Save demo appointment' : 'Continue'}
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        )}
        <p className="mw-book-disclaimer">
          Demo booking. Availability is simulated; no email is sent. Contact
          details are not stored or transmitted.
        </p>
      </div>
    </dialog>
  );
}
