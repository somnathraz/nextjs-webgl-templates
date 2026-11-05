'use client';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { ArrowRight, LoaderCircle, Swords, X } from 'lucide-react';

const LOGIN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

/** Accepts a bare username, an @handle, or a pasted profile URL. */
export function parseLogin(input: string) {
  return input
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^(www\.)?github\.com\//i, '')
    .replace(/^@/, '')
    .split(/[/?#]/)[0]
    .toLowerCase();
}

const BAD = 'That doesn’t look like a GitHub username.';

export function UsernameForm({
  autoFocus = false,
  initial = '',
  versus = true,
}: {
  autoFocus?: boolean;
  initial?: string;
  versus?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [rival, setRival] = useState('');
  const [vs, setVs] = useState(false);
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseLogin(value);
    const b = parseLogin(rival);
    if (!LOGIN.test(a) || (vs && !LOGIN.test(b))) return setError(BAD);
    if (vs && a === b) return setError('Pick someone other than yourself.');
    setError('');
    start(() => router.push(vs ? `/wrapped/${a}/vs/${b}` : `/wrapped/${a}`));
  };

  return (
    <form className="gw-form" onSubmit={submit} noValidate>
      <label className="gw-field">
        <span className="gw-prefix" aria-hidden="true">
          github.com/
        </span>
        <input
          name="login"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="your-username"
          aria-label="GitHub username"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          autoFocus={autoFocus}
          aria-invalid={!!error}
          aria-describedby={error ? 'gw-form-error' : undefined}
        />
        {!vs && (
          <button
            className="gw-btn gw-btn--primary"
            type="submit"
            disabled={pending}
          >
            {pending ? (
              <LoaderCircle className="gw-spin" size={16} />
            ) : (
              <ArrowRight size={16} />
            )}
            {pending ? 'Wrapping…' : 'Wrap my year'}
          </button>
        )}
      </label>

      {vs && (
        <label className="gw-field gw-field--rival">
          <span className="gw-prefix gw-prefix--vs" aria-hidden="true">
            vs
          </span>
          <input
            name="rival"
            value={rival}
            onChange={(e) => setRival(e.target.value)}
            placeholder="a-friends-username"
            aria-label="Friend's GitHub username"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            autoFocus
          />
          <button
            className="gw-btn gw-btn--rival"
            type="submit"
            disabled={pending}
          >
            {pending ? (
              <LoaderCircle className="gw-spin" size={16} />
            ) : (
              <Swords size={16} />
            )}
            {pending ? 'Matching…' : 'Settle it'}
          </button>
        </label>
      )}

      {versus && (
        <button
          type="button"
          className="gw-vs-toggle"
          onClick={() => setVs((v) => !v)}
          aria-expanded={vs}
        >
          {vs ? <X size={13} /> : <Swords size={13} />}
          {vs ? 'Just me' : 'Or challenge a friend'}
        </button>
      )}

      {error && (
        <p className="gw-form-error" id="gw-form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

/** "Who do you think you'd beat?" — the end-of-story hook into versus. */
export function ChallengeForm({ from }: { from: string }) {
  const router = useRouter();
  const [rival, setRival] = useState('');
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const b = parseLogin(rival);
    if (!LOGIN.test(b)) return setError(BAD);
    if (b === from) return setError('Pick someone other than yourself.');
    setError('');
    start(() => router.push(`/wrapped/${from}/vs/${b}`));
  };

  return (
    <form className="gw-challenge" onSubmit={submit} noValidate data-nav-ignore>
      <label className="gw-field gw-field--rival gw-field--compact">
        <span className="gw-prefix gw-prefix--vs" aria-hidden="true">
          vs
        </span>
        <input
          value={rival}
          onChange={(e) => setRival(e.target.value)}
          placeholder="challenge a friend"
          aria-label="Friend's GitHub username"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <button
          className="gw-btn gw-btn--rival"
          type="submit"
          disabled={pending}
        >
          {pending ? (
            <LoaderCircle className="gw-spin" size={15} />
          ) : (
            <Swords size={15} />
          )}
          {pending ? 'Matching…' : 'Go'}
        </button>
      </label>
      {error && (
        <p className="gw-form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
