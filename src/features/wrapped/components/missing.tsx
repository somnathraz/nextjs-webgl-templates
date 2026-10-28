import Link from 'next/link';
import { UsernameForm } from './username-form';
import { EXAMPLES } from '../adapters/examples';

const COPY = {
  'not-found': {
    title: 'No one home.',
    body: (login: string) =>
      `We couldn't find a GitHub user called “${login}”. Check the spelling and try again.`,
  },
  unavailable: {
    title: 'GitHub is busy.',
    body: (login: string) =>
      `We found ${login}, but couldn't load their contribution calendar just now. Give it a minute and try again.`,
  },
};

export function WrappedMissing({
  login,
  reason,
}: {
  login: string;
  reason: keyof typeof COPY;
}) {
  const copy = COPY[reason];
  return (
    <div className="gw-home">
      <div className="gw-bg" aria-hidden="true" />
      <main className="gw-center" id="gw-main">
        <h1>{copy.title}</h1>
        <p>{copy.body(login)}</p>
        <UsernameForm
          initial={reason === 'unavailable' ? login : ''}
          autoFocus
        />
        <Link className="gw-sample" href={`/wrapped/${EXAMPLES.sample}`}>
          Or play the sample year
        </Link>
      </main>
    </div>
  );
}
