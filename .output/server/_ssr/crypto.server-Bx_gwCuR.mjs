import processModule from "node:process";
//#region node_modules/.nitro/vite/services/ssr/assets/crypto.server-Bx_gwCuR.js
/**
* Envelope encryption for sensitive free-text stored in the database
* (currently the candidate dossier).
*
* Values are stored as `enc.v1.<base64(iv|ciphertext)>` using AES-256-GCM with
* a server-only key derived from DOSSIER_ENCRYPTION_KEY. Even with database
* access the raw text is unreadable without that key.
*/
var PREFIX = "enc.v1.";
function bytesToBase64(bytes) {
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary);
}
function base64ToBytes(value) {
	const binary = atob(value);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
	return bytes;
}
async function getKey() {
	const raw = processModule.env["DOSSIER_ENCRYPTION_KEY"];
	if (!raw) return null;
	const material = new TextEncoder().encode(raw);
	const digest = await crypto.subtle.digest("SHA-256", material);
	return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}
function isEncrypted(value) {
	return typeof value === "string" && value.startsWith(PREFIX);
}
/** Encrypt plaintext. Returns the plaintext unchanged when no key is configured. */
async function encryptText(plaintext) {
	if (!plaintext) return "";
	const key = await getKey();
	if (!key) return plaintext;
	const iv = crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(12));
	const cipher = new Uint8Array(await crypto.subtle.encrypt({
		name: "AES-GCM",
		iv
	}, key, new TextEncoder().encode(plaintext)));
	const packed = new Uint8Array(iv.length + cipher.length);
	packed.set(iv, 0);
	packed.set(cipher, iv.length);
	return PREFIX + bytesToBase64(packed);
}
/** Decrypt a stored value; plaintext (legacy) values pass straight through. */
async function decryptText(stored) {
	if (typeof stored !== "string" || !stored) return "";
	if (!isEncrypted(stored)) return stored;
	const key = await getKey();
	if (!key) return "";
	try {
		const packed = base64ToBytes(stored.slice(7));
		const iv = packed.slice(0, 12);
		const cipher = packed.slice(12);
		const plain = await crypto.subtle.decrypt({
			name: "AES-GCM",
			iv
		}, key, cipher);
		return new TextDecoder().decode(plain);
	} catch (error) {
		console.error("[crypto] failed to decrypt stored value", error);
		return "";
	}
}
//#endregion
export { decryptText, encryptText };
