function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function importKey(encryptionKeyBase64: string): Promise<CryptoKey> {
  const keyBytes = base64ToBytes(encryptionKeyBase64);
  return crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function encrypt(
  plaintext: string,
  encryptionKeyBase64: string
): Promise<{ ciphertext: string; iv: string }> {
  const key = await importKey(encryptionKeyBase64);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  return {
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
    iv: bytesToBase64(iv),
  };
}

export async function decrypt(
  ciphertext: string,
  iv: string,
  encryptionKeyBase64: string
): Promise<string> {
  const key = await importKey(encryptionKeyBase64);
  const ciphertextBytes = base64ToBytes(ciphertext);
  const ivBytes = base64ToBytes(iv);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes },
    key,
    ciphertextBytes
  );

  return new TextDecoder().decode(decrypted);
}
