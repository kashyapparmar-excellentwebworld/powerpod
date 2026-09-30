/**
 * Semantic Versioning comparison utility
 */

export function parseSemver(version: string): {
  major: number
  minor: number
  patch: number
  prerelease: string
} {
  const clean = version.trim().replace(/^v/i, '')
  const [main, prerelease = ''] = clean.split('-')
  const parts = main.split('.').map((p) => parseInt(p, 10))

  return {
    major: isNaN(parts[0]) ? 0 : parts[0],
    minor: isNaN(parts[1]) ? 0 : parts[1],
    patch: isNaN(parts[2]) ? 0 : parts[2],
    prerelease,
  }
}

/**
 * Compares v1 and v2.
 * Returns:
 *   1 if v1 > v2
 *  -1 if v1 < v2
 *   0 if v1 === v2
 */
export function compareSemver(v1: string, v2: string): number {
  const p1 = parseSemver(v1)
  const p2 = parseSemver(v2)

  if (p1.major !== p2.major) return p1.major > p2.major ? 1 : -1
  if (p1.minor !== p2.minor) return p1.minor > p2.minor ? 1 : -1
  if (p1.patch !== p2.patch) return p1.patch > p2.patch ? 1 : -1

  if (!p1.prerelease && p2.prerelease) return 1
  if (p1.prerelease && !p2.prerelease) return -1
  if (p1.prerelease && p2.prerelease) {
    return p1.prerelease.localeCompare(p2.prerelease)
  }

  return 0
}

export function isVersionLessThan(current: string, target: string): boolean {
  return compareSemver(current, target) < 0
}

export function isVersionAtLeast(current: string, target: string): boolean {
  return compareSemver(current, target) >= 0
}

export function isValidSemver(version: string): boolean {
  const semverRegex =
    /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
  return semverRegex.test(version.trim())
}
