import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import TopNav from '../components/TopNav'
import { initGame, destroyGame } from '../game/initGame'

const GamePage = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const handleRefresh = (): void => {
    destroyGame()
    if (containerRef.current) {
      initGame(containerRef.current)
    }
  }

  useEffect(() => {
    if (!containerRef.current) return undefined
    initGame(containerRef.current)

    return () => {
      destroyGame()
    }
  }, [])

  return (
    <div className="page game-page">
      <TopNav />
      <section className="game-shell">
        <div className="game-shell__copy">
          <p className="eyebrow">Offline Mode</p>
          <h2>Play the REAP English Game Launcher</h2>
          <p>
            Everything inside this playground runs on Phaser and bundles with Vite so the
            package keeps working even when opened via <code>file://</code> or on an SD card.
          </p>
          <ul>
            <li>Vocabulary Adventure — review parts of speech</li>
            <li>Grammar Quest — sentence mastery</li>
            <li>Reading Challenge — quick comprehension checks</li>
          </ul>
          <div className="game-shell__actions">
            <Link className="primary-btn" to="/english">
              Back to Academic English Writing class
            </Link>
            <button className="primary-btn ghost" type="button" onClick={handleRefresh}>
              Refresh game
            </button>
          </div>
        </div>
        <div className="game-frame">
          <div ref={containerRef} className="game-frame__canvas" />
        </div>
      </section>
    </div>
  )
}

export default GamePage
