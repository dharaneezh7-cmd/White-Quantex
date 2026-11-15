import crypto from "crypto"

// Master salt for conversation key derivation
const PLATFORM_KEY_SALT = process.env.CHAT_ENCRYPTION_SALT || "wq-sovereign-chat-master-salt-2026-v2"

/**
 * Derives a dedicated 256-bit AES-GCM symmetric key for a specific conversation.
 * Uses PBKDF2 with SHA-256 (10,000 iterations) to guarantee high entropy and cryptographic isolation.
 */
export function deriveConversationKey(conversationId) {
  if (!conversationId) {
    throw new Error("conversationId is required for key derivation")
  }
  return crypto.pbkdf2Sync(
    conversationId,
    PLATFORM_KEY_SALT,
    10000,
    32, // 256 bits
    "sha256"
  )
}

/**
 * Computes a SHA-256 visual key fingerprint (truncated hex, e.g. "SHA256:7a9f...3c21")
 */
export function getKeyFingerprint(conversationId) {
  const key = deriveConversationKey(conversationId)
  const hash = crypto.createHash("sha256").update(key).digest("hex")
  return `SHA256:${hash.slice(0, 8)}...${hash.slice(-8)}`
}

/**
 * Encrypts plaintext using AES-256-GCM with a fresh 96-bit IV.
 * Returns an object containing the ciphertext (base64), IV (hex), authTag (hex), algorithm, and key fingerprint.
 */
export function encryptMessage(plaintext, conversationId) {
  if (typeof plaintext !== "string") {
    plaintext = String(plaintext || "")
  }
  const key = deriveConversationKey(conversationId)
  const iv = crypto.randomBytes(12) // 96-bit nonce recommended for GCM

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)
  let ciphertext = cipher.update(plaintext, "utf8", "base64")
  ciphertext += cipher.final("base64")

  const authTag = cipher.getAuthTag().toString("hex")

  return {
    ciphertext,
    iv: iv.toString("hex"),
    authTag,
    algorithm: "AES-256-GCM",
    keyFingerprint: getKeyFingerprint(conversationId),
  }
}

/**
 * Decrypts a ciphertext using AES-256-GCM, verifying the 128-bit authentication tag.
 * Returns { success: true, plaintext } or { success: false, error }.
 */
export function decryptMessage(ciphertext, ivHex, authTagHex, conversationId) {
  try {
    if (!ciphertext || !ivHex || !authTagHex) {
      return { success: false, error: "Missing cipher parameters" }
    }
    const key = deriveConversationKey(conversationId)
    const iv = Buffer.from(ivHex, "hex")
    const authTag = Buffer.from(authTagHex, "hex")

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv)
    decipher.setAuthTag(authTag)

    let plaintext = decipher.update(ciphertext, "base64", "utf8")
    plaintext += decipher.final("utf8")

    return {
      success: true,
      plaintext,
      verified: true,
    }
  } catch (err) {
    return {
      success: false,
      error: `Decryption integrity failed: ${err.message}`,
      verified: false,
    }
  }
}

/**
 * Verifies the integrity of a ciphertext without returning plaintext.
 */
export function verifyMessageIntegrity(ciphertext, ivHex, authTagHex, conversationId) {
  const result = decryptMessage(ciphertext, ivHex, authTagHex, conversationId)
  return {
    isValid: result.success,
    error: result.error || null,
  }
}
