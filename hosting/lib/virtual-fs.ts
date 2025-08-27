export const VFS = new Set<string>([
  '/',
  '/ctx',
  '/projects',
  '/projects/enterprise-llm-deployment',
  '/projects/computer-vision-pipeline',
  '/projects/ai-training-curriculum',
  '/services',
  '/services/strategy',
  '/services/development',
  '/services/training',
  '/docs',
  '/docs/commands',
  '/docs/api',
  '/docs/tutorials',
  '/docs/examples',
  '/contact',
]);

export function normalizePath(input: string): string {
  if (!input) return '/';
  const raw = input.replace(/\/+/g, '/');
  const parts = raw.split('/').filter(Boolean);
  const stack: string[] = [];
  for (const p of parts) {
    if (p === '.' || p === '') continue;
    if (p === '..') stack.pop();
    else stack.push(p);
  }
  const out = '/' + stack.join('/');
  return out === '' ? '/' : out;
}

export function resolvePath(cwd: string, target?: string): string | null {
  let t = (target ?? '').trim();
  if (!t) t = '/';                // cd with no args -> root
  if (t === '~') t = '/';         // tilde as root
  const candidate = t.startsWith('/')
    ? normalizePath(t)
    : normalizePath(`${cwd}/${t}`);
  return VFS.has(candidate) ? candidate : null;
}

export function listDir(path: string): string[] {
  const prefix = path === '/' ? '/' : `${path}/`;
  const children = new Set<string>();
  VFS.forEach((p) => {
    if (p === path) return;
    if (p.startsWith(prefix)) {
      const rest = p.slice(prefix.length);
      if (!rest) return;
      const first = rest.split('/')[0];
      children.add(first);
    }
  });
  return Array.from(children).sort();
}

export function isValidPath(path: string): boolean {
  return VFS.has(path);
}
