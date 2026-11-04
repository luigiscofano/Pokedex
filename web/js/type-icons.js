// Símbolos vetoriais locais: permanecem nítidos em qualquer densidade de tela.
// Os nomes visíveis em presentation.js continuam sendo o texto acessível.
const TYPE_ICONS = {
  1: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="4"/>',
  2: '<path d="M5 12V7a1.5 1.5 0 0 1 3 0v4V5a1.5 1.5 0 0 1 3 0v6V4a1.5 1.5 0 0 1 3 0v7V6a1.5 1.5 0 0 1 3 0v6l2-2a2 2 0 0 1 3 2l-4 8H7l-4-6a2 2 0 0 1 2-2Z"/>',
  3: '<path d="M3 18C4 9 11 4 22 3l-5 6-8 3 7-1-4 4-5 1 4 1-3 4H3Z"/>',
  4: '<path d="M4 10a8 8 0 1 1 16 0c0 4-3 5-4 7v3H8v-3c-1-2-4-3-4-7Z"/><circle cx="9" cy="10" r="2" fill="var(--badge-color)"/><circle cx="15" cy="10" r="2" fill="var(--badge-color)"/><path d="M10 20v-3m4 3v-3" stroke="var(--badge-color)" stroke-width="1.5"/>',
  5: '<path d="m2 20 7-16h8l5 16h-4L14 9l-5 11Zm8 0 4-8 3 8Z"/>',
  6: '<path d="m2 15 7-11 9 1 4 10-8 6Z"/><path d="m9 4 3 9-10 2m10-2 6-8m-6 8 2 8" fill="none" stroke="var(--badge-color)" stroke-width="1.3"/>',
  7: '<path d="m8 7-3-4 2-1 3 4h4l3-4 2 1-3 4 3 4v6l-5 5V10h-4v12l-5-5v-6Z"/>',
  8: '<path d="M3 13a9 9 0 0 1 18 0v7l-4-2-3 3-3-2-4 2-1-3-3 1Z"/><circle cx="8" cy="12" r="2" fill="var(--badge-color)"/><circle cx="16" cy="12" r="2" fill="var(--badge-color)"/>',
  9: '<path d="m7 3 11 1 5 9-7 9H5L1 12Zm5 4a5 5 0 1 0 0 10 5 5 0 0 0 0-10" fill-rule="evenodd"/>',
  10: '<path d="M13 1c2 6-2 7 1 11 2-1 3-3 3-5 7 7 6 16-5 16C2 23 0 15 6 9c-1 4 1 5 2 5C6 8 11 6 13 1Zm0 13c-5 4-5 7-1 7 4 0 4-3 1-7" fill-rule="evenodd"/>',
  11: '<path d="M12 1C9 6 3 12 3 16a9 9 0 0 0 18 0c0-4-6-10-9-15Z"/><path d="M7 15c-1 3 1 5 4 5" fill="none" stroke="var(--badge-color)" stroke-width="2" stroke-linecap="round"/>',
  12: '<path d="M21 2C8 1 1 7 4 16c4 7 17 7 17-14Z"/><path d="M3 22 17 7M9 16l-1-6m5 2 5 1" fill="none" stroke="var(--badge-color)" stroke-width="1.7"/>',
  13: '<path d="m13 1-9 12h7l-1 10 10-14h-7l3-8Z"/>',
  14: '<path d="M20 14a8 8 0 1 1-8-9c8 0 9 11 2 12-5 1-7-6-3-7 3-1 5 3 2 4" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  15: '<path d="M12 2v20M3 7l18 10M3 17 21 7M9 3l3 3 3-3M9 21l3-3 3 3M3 10l4-1-1-4m15 9-4 1 1 4M6 19l1-4-4-1m15-9-1 4 4 1" fill="none" stroke="currentColor" stroke-width="2"/>',
  16: '<path d="m14 1-1 6 6-3-1 5 5 4-4 5-6-2 3-3-4-2-5 5 6 7C1 23-1 13 5 8l6-5-1 5Z"/><circle cx="17" cy="11" r="1" fill="var(--badge-color)"/>',
  17: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-3 2c8 1 9 15 0 16 5-5 5-11 0-16Z" fill-rule="evenodd"/>',
  18: '<path d="m12 1 3 7 7-3-3 7 4 3-8 1-3 7-3-7-8-1 4-3-3-7 7 3Z"/><path d="m12 8 4 4-4 4-4-4Z" fill="var(--badge-color)"/>',
};

export function typeIcon(type) {
  const shape = TYPE_ICONS[type] || '<path d="m12 2 10 10-10 10L2 12Z"/><path d="M12 7v7m0 2v2" stroke="var(--badge-color)" stroke-width="2"/>';
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">${shape}</svg>`;
}
