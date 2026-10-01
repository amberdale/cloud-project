// Replaces Base44's hosted login screen. Copy into the app's src/pages and add
// a /login route. Styling uses plain Tailwind classes (Base44 apps ship with Tailwind).
import { useState } from 'react';
import { base44 } from '@/api/base44Client';

const GOOGLE_ENABLED = import.meta.env.VITE_GOOGLE_LOGIN === 'true';

export default function LoginPage() {
  const params = new URLSearchParams(window.location.search);
  const next = params.get('next') || window.location.origin;
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  async function sendLink(e) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      await base44.auth.signInWithEmailLink(email, next);
      setStatus('sent');
    } catch (err) {
      setError(err.message);
      setStatus('idle');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-sm border border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Sign in</h1>

        {GOOGLE_ENABLED && (
          <>
            <button
              type="button"
              onClick={() => base44.auth.signInWithGoogle(next).catch((err) => setError(err.message))}
              className="w-full rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              Continue with Google
            </button>
            <div className="my-5 text-center text-xs text-gray-400">or</div>
          </>
        )}

        {status === 'sent' ? (
          <p className="text-sm text-gray-700">Check {email} for a sign-in link.</p>
        ) : (
          <form onSubmit={sendLink} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {status === 'sending' ? 'Sending…' : 'Email me a sign-in link'}
            </button>
          </form>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
