// Import from the package root (not the `/browser` subpath): fflate is
// isomorphic and re-exports deflateSync/inflateSync here, and the root entry
// avoids a tsx + Node ESM named-import interop error on the `/browser` subpath
// (which broke `verify:models:parity`). Vite tree-shakes the sync fns for the browser.
import { deflateSync, inflateSync } from 'fflate';
/** Encode bytes to base64url (no padding). */
function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Decode base64url to bytes. */
function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Compress and base64url-encode a JSON-serializable object. */
export function encode(data: unknown): string {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  const compressed = deflateSync(bytes);
  return toBase64Url(compressed);
}

/** Decode and decompress a base64url string back to an object. */
export function decode(encoded: string): unknown {
  const compressed = fromBase64Url(encoded);
  const bytes = inflateSync(compressed);
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json);
}
