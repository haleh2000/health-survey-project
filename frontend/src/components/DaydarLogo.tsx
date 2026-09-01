type DaydarLogoProps = {
  compact?: boolean
}

export function DaydarLogo({ compact = false }: DaydarLogoProps) {
  return (
    <div className={`daydar-logo${compact ? ' daydar-logo--compact' : ''}`}>
      <img src="/didi/daydar-logo.png" alt="دی‌دار" />
    </div>
  )
}
