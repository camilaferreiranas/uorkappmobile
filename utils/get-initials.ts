export function getInitials(nome?: string, sobrenome?: string): string {
  const first = nome?.trim()?.[0] ?? '';
  const last = sobrenome?.trim()?.[0] ?? '';
  return (`${first}${last}`.toUpperCase()) || '?';
}
