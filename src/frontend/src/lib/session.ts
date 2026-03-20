/**
 * Session storage utilities for GhostChat
 */

const KEYS = {
  chatId: "ghostchat_chatId",
  username: "ghostchat_username",
  encKey: "ghostchat_key",
} as const;

export function saveSession(
  chatId: string,
  username: string,
  keyBase64: string,
) {
  sessionStorage.setItem(KEYS.chatId, chatId);
  sessionStorage.setItem(KEYS.username, username);
  sessionStorage.setItem(KEYS.encKey, keyBase64);
}

export function loadSession() {
  return {
    chatId: sessionStorage.getItem(KEYS.chatId),
    username: sessionStorage.getItem(KEYS.username),
    keyBase64: sessionStorage.getItem(KEYS.encKey),
  };
}

export function clearSession() {
  sessionStorage.removeItem(KEYS.chatId);
  sessionStorage.removeItem(KEYS.username);
  sessionStorage.removeItem(KEYS.encKey);
}
