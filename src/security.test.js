import { mediaUrl, isTokenValid, errorMessage, api } from './api';
import { validatePassword, validateImageFile } from './utils/validation';

// Build an unsigned JWT with the given payload (signature isn't checked client-side).
const b64 = (obj) => btoa(JSON.stringify(obj)).replace(/=+$/, '');
const jwt = (payload) => `${b64({ alg: 'HS256' })}.${b64(payload)}.sig`;
const now = () => Math.floor(Date.now() / 1000);

describe('isTokenValid', () => {
  it('accepts an unexpired token', () => {
    expect(isTokenValid(jwt({ exp: now() + 60 }))).toBe(true);
  });
  it('rejects expired, missing-exp, malformed and empty tokens', () => {
    expect(isTokenValid(jwt({ exp: now() - 60 }))).toBe(false);
    expect(isTokenValid(jwt({ user_id: 1 }))).toBe(false);
    expect(isTokenValid('not-a-jwt')).toBe(false);
    expect(isTokenValid(null)).toBe(false);
  });
});

describe('mediaUrl', () => {
  it('resolves server-relative paths against the API origin', () => {
    expect(mediaUrl('/media/a.png')).toBe('http://127.0.0.1:8000/media/a.png');
  });
  it('falls back for non-http schemes and empty values', () => {
    expect(mediaUrl('javascript:alert(1)')).toBe('/default-profile.png');
    expect(mediaUrl('data:image/png;base64,AAAA')).toBe('/default-profile.png');
    expect(mediaUrl('')).toBe('/default-profile.png');
    expect(mediaUrl(null, '/default-group.png')).toBe('/default-group.png');
  });
});

describe('errorMessage', () => {
  it('extracts DRF-style messages', () => {
    expect(errorMessage({ response: { data: { detail: 'Nope' } } }, 'x')).toBe('Nope');
    expect(errorMessage({ response: { data: { email: ['Taken'] } } }, 'x')).toBe('Taken');
  });
  it('never returns non-strings (e.g. HTML error pages or nested objects)', () => {
    expect(errorMessage({ response: { data: '<html>500</html>' } }, 'fallback')).toBe('fallback');
    expect(errorMessage({ response: { data: { detail: { a: 1 } } } }, 'fallback')).toBe('fallback');
    expect(errorMessage({}, 'fallback')).toBe('fallback');
  });
});

describe('auth header', () => {
  const run = (config) => api.interceptors.request.handlers[0].fulfilled({ headers: {}, ...config });

  beforeEach(() => localStorage.setItem('access_token', 'tok'));
  afterEach(() => localStorage.clear());

  it('attaches the token for API requests', () => {
    expect(run({ url: 'chatrooms/' }).headers.Authorization).toBe('Bearer tok');
  });
  it('never sends the token to another origin', () => {
    expect(run({ url: 'https://evil.example/steal' }).headers.Authorization).toBeUndefined();
  });
  it('omits the token on public endpoints', () => {
    expect(run({ url: 'login/', skipAuth: true }).headers.Authorization).toBeUndefined();
  });
});

describe('validation', () => {
  it('enforces password rules', () => {
    expect(validatePassword('short1')).not.toBe('');
    expect(validatePassword('12345678')).not.toBe('');
    expect(validatePassword('abcdefgh')).not.toBe('');
    expect(validatePassword('abcd1234')).toBe('');
  });
  it('rejects disguised or oversized images', () => {
    expect(validateImageFile({ type: 'image/png', name: 'x.html', size: 10 })).not.toBe('');
    expect(validateImageFile({ type: 'image/png', name: 'x.png', size: 6 * 1024 * 1024 })).not.toBe('');
    expect(validateImageFile({ type: 'image/png', name: 'x.png', size: 10 })).toBe('');
  });
});
