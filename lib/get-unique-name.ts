export default function getUniqueName(name: string, existing: string[]) {
  const dot = name.lastIndexOf('.');
  const base = dot !== -1 ? name.slice(0, dot) : name;
  const ext = dot !== -1 ? name.slice(dot) : '';

  let candidate = name;
  let i = 1;

  while (existing.includes(candidate)) {
    candidate = `${base} (${i})${ext}`;
    i++;
  }

  return candidate;
}