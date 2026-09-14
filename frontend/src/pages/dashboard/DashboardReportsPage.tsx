import { useEffect, useRef, useState } from 'react'
import { embedDashboard } from '@superset-ui/embedded-sdk'
import { getSupersetGuestToken } from '../../services/superset'

const SUPERSET_DOMAIN = 'http://localhost:8088'
const DASHBOARD_ID = '15f9c8a1-b6fc-4cca-85c4-695c0b7b8e31'

export function DashboardReportsPage() {
  const pageRef = useRef<HTMLDivElement | null>(null)
  const mountRef = useRef<HTMLDivElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      if (!mountRef.current) {
        return
      }

      try {
        setLoading(true)
        setError(null)

        await embedDashboard({
          id: DASHBOARD_ID,
          supersetDomain: SUPERSET_DOMAIN,
          mountPoint: mountRef.current,
          fetchGuestToken: async () => getSupersetGuestToken(DASHBOARD_ID),
        })

        const iframe = mountRef.current.querySelector('iframe')

        if (iframe) {
          iframe.style.width = '100%'
          iframe.style.height = '100%'
          iframe.style.border = 'none'
        }

        if (!cancelled) {
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load dashboard.')
          setLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === pageRef.current)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  async function handleToggleFullscreen() {
    if (!pageRef.current) {
      return
    }

    try {
      if (document.fullscreenElement === pageRef.current) {
        await document.exitFullscreen()
      } else {
        await pageRef.current.requestFullscreen()
      }
    } catch {
      setError('Fullscreen mode is not available.')
    }
  }

  return (
    <section
      ref={pageRef}
      className={`reports-page ${isFullscreen ? 'reports-page--fullscreen' : ''}`}
    >
      <div className="reports-page__toolbar">
        <button
          type="button"
          className="reports-page__fullscreen-btn"
          onClick={handleToggleFullscreen}
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>

      {loading ? <p className="reports-page__message">Loading dashboard...</p> : null}
      {error ? <p className="reports-page__message">{error}</p> : null}

      <div
        ref={mountRef}
        className={`reports-page__dashboard ${
          isFullscreen ? 'reports-page__dashboard--fullscreen' : ''
        }`}
      />
    </section>
  )
}
