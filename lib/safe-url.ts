export function isSafeUrl(value: string) {
  return !value || (/^(?:\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i.test(value) && !/[\u0000-\u001f\\]/.test(value));
}
