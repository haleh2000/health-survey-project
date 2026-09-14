export type RoleLike =
  | number
  | string
  | null
  | undefined

export function normalizeRoleId(role: RoleLike): number | null {
  const candidate = role

  if (candidate === null || candidate === undefined || candidate === '') {
    return null
  }

  if (typeof candidate === 'number' && Number.isFinite(candidate)) {
    return candidate
  }

  if (typeof candidate === 'string') {
    const normalized = candidate.trim().toLowerCase()

    if (!normalized) {
      return null
    }

    const parsed = Number(normalized)

    if (!Number.isNaN(parsed)) {
      return parsed
    }

    if (normalized.includes('admin')) {
      return 0
    }

    if (normalized.includes('eval')) {
      return 1
    }

    if (normalized.includes('super')) {
      return 2
    }
  }

  return null
}
