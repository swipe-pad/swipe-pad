function hash32(input: string, seed: number): number {
  let hash = seed;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function fullFingerprint(projectId: string): string {
  const first = hash32(projectId, 2166136261).toString(36);
  const second = hash32(projectId, 374761393).toString(36);
  return `${first}${second}`;
}

export function deriveRouteIdCandidate(projectId: string, length: number): string {
  return fullFingerprint(projectId).slice(0, length);
}

export async function generateUniqueRouteId(
  db: any,
  projectId: string
): Promise<string> {
  const fingerprint = fullFingerprint(projectId);

  for (let length = 6; length <= fingerprint.length; length += 1) {
    const candidate = fingerprint.slice(0, length);
    const existing = await db
      .query("projects")
      .withIndex("by_routeId", (q: any) => q.eq("routeId", candidate))
      .first();

    if (!existing || existing.projectId === projectId) {
      return candidate;
    }
  }

  let counter = 0;
  while (true) {
    const suffix = counter.toString(36);
    const prefixLength = Math.max(6, fingerprint.length - suffix.length);
    const candidate = `${fingerprint.slice(0, prefixLength)}${suffix}`;

    const existing = await db
      .query("projects")
      .withIndex("by_routeId", (q: any) => q.eq("routeId", candidate))
      .first();

    if (!existing || existing.projectId === projectId) {
      return candidate;
    }

    counter += 1;
  }
}
