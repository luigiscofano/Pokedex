// Símbolos vetoriais locais: permanecem nítidos em qualquer densidade de tela.
// Os nomes visíveis em presentation.js continuam sendo o texto acessível.
const TYPE_ICONS = {
  1: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="4"/>',
  2: '<path d="M4 11V7a2 2 0 0 1 4 0V6a2 2 0 0 1 4 0v1a2 2 0 0 1 4 0v1a2 2 0 0 1 4 0v5c0 3-1.5 5-4 6v2H8v-3l-5-4a2 2 0 0 1 1-3Z"/><path d="M8 8v2m4-3v3m4-2v2M4 11l5 3h4" fill="none" stroke="var(--badge-color)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  3: '<path d="M3 18C4 9 11 4 22 3l-5 6-8 3 7-1-4 4-5 1 4 1-3 4H3Z"/>',
  4: '<path d="M4 10a8 8 0 1 1 16 0c0 4-3 5-4 7v3H8v-3c-1-2-4-3-4-7Z"/><circle cx="9" cy="10" r="2" fill="var(--badge-color)"/><circle cx="15" cy="10" r="2" fill="var(--badge-color)"/><path d="M10 20v-3m4 3v-3" stroke="var(--badge-color)" stroke-width="1.5"/>',
  5: '<path d="m2 20 7-16h8l5 16h-4L14 9l-5 11Zm8 0 4-8 3 8Z"/>',
  6: '<path d="m2 15 7-11 9 1 4 10-8 6Z"/><path d="m9 4 3 9-10 2m10-2 6-8m-6 8 2 8" fill="none" stroke="var(--badge-color)" stroke-width="1.3"/>',
  7: '<path d="m8 7-3-4 2-1 3 4h4l3-4 2 1-3 4 3 4v6l-5 5V10h-4v12l-5-5v-6Z"/>',
  8: '<path d="M3 13a9 9 0 0 1 18 0v7l-4-2-3 3-3-2-4 2-1-3-3 1Z"/><circle cx="8" cy="12" r="2" fill="var(--badge-color)"/><circle cx="16" cy="12" r="2" fill="var(--badge-color)"/>',
  9: '<path d="M7 3h10l5 9-5 9H7l-5-9Z M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" fill-rule="evenodd"/>',
  10: '<path d="M13 1c2 6-2 7 1 11 2-1 3-3 3-5 7 7 6 16-5 16C2 23 0 15 6 9c-1 4 1 5 2 5C6 8 11 6 13 1Zm0 13c-5 4-5 7-1 7 4 0 4-3 1-7" fill-rule="evenodd"/>',
  11: '<path d="M12 1C9 6 3 12 3 16a9 9 0 0 0 18 0c0-4-6-10-9-15Z"/><path d="M7 15c-1 3 1 5 4 5" fill="none" stroke="var(--badge-color)" stroke-width="2" stroke-linecap="round"/>',
  12: '<path d="M21 2C8 1 1 7 4 16c4 7 17 7 17-14Z"/><path d="M3 22 17 7M9 16l-1-6m5 2 5 1" fill="none" stroke="var(--badge-color)" stroke-width="1.7"/>',
  13: '<path d="m13 1-9 12h7l-1 10 10-14h-7l3-8Z"/>',
  14: '<path d="M21 12C20.6 7.29 16.08 3.8 12 4.2C7.92 4.6 5 8.54 5.4 12C5.8 15.46 9.17 17.8 12 17.4C14.83 17 16.6 14.2 16.2 12C15.8 9.8 13.57 8.6 12 9C10.43 9.4 9.8 11.06 10.2 12C10.6 12.94 11.69 13 12 12.6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  15: '<path d="M12 2v20M3 7l18 10M3 17 21 7M9 3l3 3 3-3M9 21l3-3 3 3M3 10l4-1-1-4m15 9-4 1 1 4M6 19l1-4-4-1m15-9-1 4 4 1" fill="none" stroke="currentColor" stroke-width="2"/>',
  16: '<path d="m14 1-1 6 6-3-1 5 5 4-4 5-6-2 3-3-4-2-5 5 6 7C1 23-1 13 5 8l6-5-1 5Z"/><circle cx="17" cy="11" r="1" fill="var(--badge-color)"/>',
  17: '<path d="M16.5 3.6a9.5 9.5 0 1 0 3.9 12.9A8 8 0 0 1 16.5 3.6Z"/>',
  18: '<path d="m12 1 3 7 7-3-3 7 4 3-8 1-3 7-3-7-8-1 4-3-3-7 7 3Z"/><path d="m12 8 4 4-4 4-4-4Z" fill="var(--badge-color)"/>',
};

export function typeIcon(type) {
  const shape = TYPE_ICONS[type] || '<path d="m12 2 10 10-10 10L2 12Z"/><path d="M12 7v7m0 2v2" stroke="var(--badge-color)" stroke-width="2"/>';
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">${shape}</svg>`;
}
