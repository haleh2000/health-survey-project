export const PROFILE_AVATARS = [
  'اقدس.png',
  'بتول.png',
  'تقی.png',
  'رمضان.png',
  'زهراخانم.png',
  'سکینه.png',
  'شعبان.png',
  'صغری.png',
  'طاهره.png',
  'غلام.png',
  'فاطمه‌سلطان.png',
  'قربان.png',
  'کبری.png',
  'ماشاءالله.png',
  'نصرت‌الله.png',
  'یدالله.png',
] as const

export type ProfileAvatarName = (typeof PROFILE_AVATARS)[number]

export function getProfileAvatarSrc(avatar?: string | null) {
  if (!avatar) {
    return null
  }

  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar
  }

  if (avatar.startsWith('/')) {
    return avatar
  }

  return `/profiles-avatar/${avatar}`
}

export function getProfileAvatarName(avatar?: string | null) {
  if (!avatar) {
    return null
  }

  const normalizedAvatar = avatar.replaceAll('\\', '/')
  const fileName = normalizedAvatar.split('/').pop()

  return fileName ?? null
}
