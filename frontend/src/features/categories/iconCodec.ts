import type { IconPackId } from './iconCatalog'
import { DEFAULT_ICON_NAME, DEFAULT_ICON_PACK } from './iconCatalog'

const PACK_IDS = new Set<string>(['fa', 'md', 'bi', 'hi', 'io5'])

/** Backend stores a single `icon` string: `pack:ExportName` or legacy `ExportName` (implies fa). */
export function encodeIconForApi(pack: IconPackId, name: string): string {
  return `${pack}:${name}`
}

export function decodeIconFromApi(raw: string | undefined | null): { pack: IconPackId; name: string } {
  const s = typeof raw === 'string' ? raw.trim() : ''
  if (!s) return { pack: DEFAULT_ICON_PACK, name: DEFAULT_ICON_NAME }
  const colon = s.indexOf(':')
  if (colon <= 0 || colon >= s.length - 1) {
    return { pack: DEFAULT_ICON_PACK, name: s }
  }
  const pack = s.slice(0, colon).toLowerCase()
  const name = s.slice(colon + 1)
  if (PACK_IDS.has(pack) && name.length > 0) {
    return { pack: pack as IconPackId, name }
  }
  return { pack: DEFAULT_ICON_PACK, name: s }
}
