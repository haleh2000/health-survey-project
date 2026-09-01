import type { PropsWithChildren, ReactNode } from 'react'
import { useState, useRef } from 'react'
import type { AuthUser } from '../auth/types'
import { DaydarLogo } from './DaydarLogo'
import { getProfileAvatarSrc } from '../utils/avatar'
import { toEnglishDigits } from '../utils/digits'

declare global {
  interface Window {
    Raychat: {
      openWidget: () => void
      hideWidget: () => void
      showWidget: () => void
    }
  }
}

const WIDGET_IFRAME_URL = '/widget.html'

type DashboardLayoutProps = PropsWithChildren<{
  user: AuthUser | null
  onLogout: () => void
  onToggleSidebar: () => void
  isSidebarCollapsed: boolean
  dateLabel?: string
  content?: ReactNode
}>

export function DashboardLayout({
  children,
  content,
  dateLabel,
  isSidebarCollapsed,
  user,
  onLogout,
  onToggleSidebar,
}: DashboardLayoutProps) {
  const displayName = toEnglishDigits(
    user?.displayName ?? user?.username ?? 'کاربر دی‌دار',
  )
  const avatarSrc = getProfileAvatarSrc(user?.avatar)
  const [isWidgetOpen, setIsWidgetOpen] = useState(false)
  const [widgetSize, setWidgetSize] = useState({ width: 380, height: 500 })
  const [widgetPosition, setWidgetPosition] = useState({ bottom: 32, left: 32 })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const startWidth = widgetSize.width
    const startHeight = widgetSize.height
    const startRight = window.innerWidth - widgetPosition.left - widgetSize.width
    const startBottom = widgetPosition.bottom

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY

      const newWidth = Math.max(300, Math.min(startWidth + deltaX, window.innerWidth * 0.9))
      const newHeight = Math.max(300, Math.min(startHeight + deltaY, window.innerHeight * 0.9))
      const newRight = Math.max(16, startRight - (newWidth - startWidth))
      const newBottom = Math.max(16, startBottom - (newHeight - startHeight))

      const newLeft = window.innerWidth - newRight - newWidth
      setWidgetSize({ width: newWidth, height: newHeight })
      setWidgetPosition({ left: newLeft, bottom: newBottom })
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('widget-resize-handle')) return
    if ((e.target as HTMLElement).classList.contains('widget-close-button')) return

    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const startLeft = widgetPosition.left
    const startBottom = widgetPosition.bottom

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = startY - moveEvent.clientY

      const newLeft = Math.max(16, Math.min(startLeft + deltaX, window.innerWidth - widgetSize.width - 16))
      const newBottom = Math.max(16, Math.min(startBottom + deltaY, window.innerHeight - widgetSize.height - 16))

      setWidgetPosition({ left: newLeft, bottom: newBottom })
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return (
    <main
      className={`dashboard-page ${
        isSidebarCollapsed ? 'dashboard-page--sidebar-collapsed' : ''
      }`}
    >
      <aside
        className={`dashboard-panel ${
          isSidebarCollapsed ? 'dashboard-panel--collapsed' : ''
        }`}
        aria-label="پنل کاربری"
      >
        <div className="panel-glow" aria-hidden="true" />

        <header className="dashboard-panel__header">
          <DaydarLogo compact />
        </header>

        <div className="dashboard-panel__body">
          <section className="profile-card">
            <div className="profile-avatar">
              {avatarSrc ? (
                <img src={avatarSrc} alt={`${displayName} avatar`} />
              ) : (
                <span aria-hidden="true">{displayName.charAt(0)}</span>
              )}
            </div>
            <h1>{displayName}</h1>
            {dateLabel ? (
              <p className="profile-date">{toEnglishDigits(dateLabel)}</p>
            ) : null}
          </section>

          <div className="panel-divider" />

          <div className="dashboard-panel__menu">{children}</div>

          <button
            className="widget-toggle-button"
            type="button"
            onClick={() => setIsWidgetOpen(!isWidgetOpen)}
          >
            ابزارک
          </button>

          <button className="logout-button" type="button" onClick={onLogout}>
            خروج از حساب
          </button>
        </div>
      </aside>

      <button
        className="dashboard-panel__toggle"
        type="button"
        onClick={onToggleSidebar}
        aria-expanded={!isSidebarCollapsed}
        aria-label={
          isSidebarCollapsed ? 'نمایش پنل کناری' : 'پنهان کردن پنل کناری'
        }
      >
        <span aria-hidden="true">{isSidebarCollapsed ? '▶' : '◀'}</span>
        <span>{isSidebarCollapsed ? 'نمایش پنل' : 'پنهان کردن'}</span>
      </button>

      {content ? <section className="dashboard-content">{content}</section> : null}

      {isWidgetOpen && (
        <div
          ref={containerRef}
          className="widget-iframe-container"
          style={{
            width: widgetSize.width,
            height: widgetSize.height,
            bottom: widgetPosition.bottom,
            left: widgetPosition.left,
          }}
          onMouseDown={handleDragStart}
        >
          <div className="widget-resize-handle" onMouseDown={handleResizeStart} aria-label="تغییر اندازه" />
          <div className="widget-iframe-header">
            <span>پشتیابی آنلاین</span>
            <button
              type="button"
              className="widget-close-button"
              onClick={() => setIsWidgetOpen(false)}
              aria-label="بستن ابزارک"
            >
              ×
            </button>
          </div>
          <iframe
            src={WIDGET_IFRAME_URL}
            className="widget-iframe"
            title="پشتیابی آنلاین"
            allow="camera; microphone"
          />
        </div>
      )}
    </main>
  )
}
