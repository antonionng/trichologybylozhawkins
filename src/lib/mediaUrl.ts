export function isHttpMediaUrl(value: string) {
  return /^https?:\/\//i.test(value.trim());
}
