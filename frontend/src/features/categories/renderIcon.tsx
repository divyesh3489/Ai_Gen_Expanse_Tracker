import type { ReactElement } from 'react'
import type { IconType } from 'react-icons'
import * as BiIcons from 'react-icons/bi'
import * as FaIcons from 'react-icons/fa'
import * as HiIcons from 'react-icons/hi'
import * as Io5Icons from 'react-icons/io5'
import * as MdIcons from 'react-icons/md'
import { decodeIconFromApi } from './iconCodec'

const PACKS: Record<string, Record<string, IconType>> = {
  fa: FaIcons as unknown as Record<string, IconType>,
  md: MdIcons as unknown as Record<string, IconType>,
  bi: BiIcons as unknown as Record<string, IconType>,
  hi: HiIcons as unknown as Record<string, IconType>,
  io5: Io5Icons as unknown as Record<string, IconType>,
}

const FallbackIcon = MdIcons.MdCategory

export function resolveIconComponent(iconName: string, iconPack: string): IconType {
  const trimmedName = iconName?.trim()
  const trimmedPack = iconPack?.trim().toLowerCase()
  if (!trimmedName || !trimmedPack) return FallbackIcon
  const pack = PACKS[trimmedPack]
  if (!pack) return FallbackIcon
  const Icon = pack[trimmedName]
  if (!Icon || typeof Icon !== 'function') return FallbackIcon
  return Icon as IconType
}

export type RenderIconProps = {
  iconName: string
  iconPack: string
  color: string
  size: number
  className?: string
}

function renderGlyphInPack(iconName: string, iconPack: string, color: string, size: number, className?: string) {
  const Icon = resolveIconComponent(iconName, iconPack)
  return <Icon color={color} size={size} className={className} aria-hidden />
}

/** Renders a react-icons glyph dynamically with graceful fallback. */
export function RenderIcon({ iconName, iconPack, color, size, className }: RenderIconProps) {
  return renderGlyphInPack(iconName, iconPack, color, size, className)
}

/** From backend `icon` string (`FaUtensils`, `md:MdWifi`, …): color and pixel size. */
export function renderIcon(iconString: string, color: string, size: number, className?: string): ReactElement
/** Explicit pack + export name (decoded) form. */
export function renderIcon(
  iconName: string,
  iconPack: string,
  color: string,
  size: number,
  className?: string,
): ReactElement
export function renderIcon(
  a: string,
  b: string,
  c: string | number,
  d?: number | string,
  e?: string,
): ReactElement {
  if (typeof c === 'number') {
    return renderStoredIcon(a, b, c, typeof d === 'string' ? d : undefined)
  }
  const color = c as string
  const size = d as number
  return renderGlyphInPack(a, b, color, size, e)
}

/**
 * Renders an icon from a backend `icon` string (`FaUtensils`, `md:MdWifi`, `fa:FaLaptop`, etc.).
 * When the string is missing/empty, shows {@link MdIcons.MdCategory}.
 */
export function renderStoredIcon(
  iconString: string | null | undefined,
  color: string,
  size: number,
  className?: string,
) {
  if (iconString == null || !String(iconString).trim()) {
    return <FallbackIcon color={color} size={size} className={className} aria-hidden />
  }
  const { pack, name } = decodeIconFromApi(iconString)
  return renderGlyphInPack(name, pack, color, size, className)
}
