const BLOCKED_WORDS = [
  "fuck",
  "shit",
  "bitch",
  "cunt",
  "nigger",
  "nigga",
  "faggot",
  "kike",
  "spic",
  "chink",
  "tranny",
];

function escapeRegExp(word: string) {
  return word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function filterChatMessage(message: string) {
  let clean = message.trim().slice(0, 600);
  let blocked = false;

  for (const word of BLOCKED_WORDS) {
    const pattern = new RegExp(`\\b${escapeRegExp(word)}\\b`, "gi");
    clean = clean.replace(pattern, (match) => {
      blocked = true;
      return match[0] + "*".repeat(Math.max(0, match.length - 1));
    });
  }

  return { clean, blocked };
}
