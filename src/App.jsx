import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import entryOnePage from './assets/entry-one-page.png'
import entryTwoBase from './assets/entry-two-base.png'
import entryTwoCloud from './assets/entry-two-cloud.png'
import entryTwoRain from './assets/entry-two-rain.png'
import entryTwoUmbrella from './assets/entry-two-umbrella.png'
import entryTwoUx from './assets/entry-two-ux.png'
import entryThreeBase from './assets/entry-three-base.png'
import entryThreeNote from './assets/entry-three-note.png'
import entryThreeWriting01 from './assets/entry-three-writing-01.png'
import entryThreeWriting02 from './assets/entry-three-writing-02.png'
import entryThreeWriting03 from './assets/entry-three-writing-03.png'
import entryThreeWriting04 from './assets/entry-three-writing-04.png'
import entryThreeWriting05 from './assets/entry-three-writing-05.png'
import entryThreeWriting06 from './assets/entry-three-writing-06.png'
import entryThreeWriting07 from './assets/entry-three-writing-07.png'
import entryThreeWriting08 from './assets/entry-three-writing-08.png'
import entryThreeWriting09 from './assets/entry-three-writing-09.png'
import entryThreeWriting10 from './assets/entry-three-writing-10.png'
import entryThreeMyProjects from './assets/my-projects.png'
import entryFiveBase from './assets/Tool Kit (2).png'
import entryFiveDoodle from './assets/doodle.png'
import myWorkTab from './assets/Vintage Leather Tab with Botanical Flourishes.png'
import heroImg from './assets/hero.png'
import portfolioDesk from './assets/portfolio.png'
import pressedPurpleFlower from './assets/entry-one.png'
import pressedYellowFlower from './assets/pressed-yellow-flower.png'
import featherBookmark from './assets/feather bookmark.png'
import contactPage from './assets/contact-page.png'
import finalPageBase from './assets/final-page-base.png'
import finalPagePostcards from './assets/final-page-postcards.png'
import finalPageComplete from './assets/final-page-complete.png'
import './App.css'

const journalEntries = ['one', 'two', 'three', 'five']
const MY_WORK_ENTRY_INDEX = 2
const TOOLKIT_ENTRY_INDEX = 3
const CONTACT_PAGE_INDEX = journalEntries.length
const FINAL_PAGE_INDEX = CONTACT_PAGE_INDEX + 1
const journalPages = [...journalEntries, 'contact', 'final']
const PAGE_TURN_DURATION = 900
const MOBILE_BREAKPOINT = 1024
const PORTRAIT_JOURNAL_VIEW_WIDTH = 900
const RESUME_URL = 'https://drive.google.com/file/d/1av9zVsfiep3CFyuZ2SXoGoot1w4TaPt_/view?usp=drivesdk'

const entryThreeWriting = [
  entryThreeWriting01,
  entryThreeWriting02,
  entryThreeWriting03,
  entryThreeWriting04,
  entryThreeWriting05,
  entryThreeWriting06,
  entryThreeWriting07,
  entryThreeWriting08,
  entryThreeWriting09,
  entryThreeWriting10,
]

function JournalNavigation({ currentIndex, onNavigate, onClose }) {
  const isContactPage = currentIndex === CONTACT_PAGE_INDEX
  const isFinalPage = currentIndex === FINAL_PAGE_INDEX
  const previousIndex = isFinalPage
    ? CONTACT_PAGE_INDEX
    : (isContactPage ? journalEntries.length - 1 : (currentIndex > 0 ? currentIndex - 1 : null))
  const nextIndex = isFinalPage
    ? null
    : (isContactPage ? FINAL_PAGE_INDEX : (currentIndex < journalEntries.length - 1 ? currentIndex + 1 : CONTACT_PAGE_INDEX))

  return (
    <div className="journal-navigation" aria-label="Journal entry navigation">
      {previousIndex !== null && (
        <button
          type="button"
          className="entry-navigation-zone previous-entry-zone"
          aria-label={isFinalPage ? 'Return to Contact' : (isContactPage ? 'Return to Entry Three' : `Return to Entry ${currentIndex}`)}
          onClick={() => onNavigate(previousIndex, 'backward')}
        />
      )}
      <button
        type="button"
        className={`entry-navigation-zone next-entry-zone${isContactPage ? ' contact-next-entry-zone' : ''}`}
        aria-label={isFinalPage ? 'Close journal and return to desk' : (isContactPage ? 'Continue to the Final Page' : (currentIndex === journalEntries.length - 1 ? 'Continue to Contact' : `Continue to Entry ${currentIndex + 2}`))}
        onClick={isFinalPage ? onClose : () => onNavigate(nextIndex, 'forward')}
      />
    </div>
  )
}

/* Journal-opening sequence — persistent states:
   closed → clasp-open (the leather clasp unsnaps and swings slightly outward
          to the right, hanging at a slight downward angle, ~520ms)
          → brief pause with the clasp resting open (~200ms)
          → opening (cover lifts toward the viewer, then swings on the left spine, ~1200ms)
          → open (two-page spread; the loosened clasp remains attached at the
             outer right edge — still rendered, still clickable, never unmounted) */
function App() {
  const viewportRef = useRef(null)
  const sceneRef = useRef(null)
  const [sceneScale, setSceneScale] = useState(1)

  const fitScene = useCallback(() => {
    const viewport = viewportRef.current
    const scene = sceneRef.current
    if (!viewport || !scene) return
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT
    const isPortrait = window.matchMedia('(orientation: portrait)').matches
    // On portrait mobile, fit the journal with a little space around it.
    // Landscape mobile fits the desk width and allows vertical scrolling.
    const nextScale = isMobile
      ? Math.min(viewport.offsetWidth / (isPortrait ? PORTRAIT_JOURNAL_VIEW_WIDTH : scene.offsetWidth), 1)
      : Math.min(viewport.offsetWidth / scene.offsetWidth, viewport.offsetHeight / scene.offsetHeight, 1)
    setSceneScale(nextScale)
  }, [])

  useLayoutEffect(() => {
    fitScene()
    const observer = new ResizeObserver(fitScene)
    observer.observe(viewportRef.current)
    window.visualViewport?.addEventListener('resize', fitScene)
    return () => {
      observer.disconnect()
      window.visualViewport?.removeEventListener('resize', fitScene)
    }
  }, [fitScene])

  const [phase, setPhase] = useState('closed')
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0)
  const [bookmarkedEntryIndex, setBookmarkedEntryIndex] = useState(0)
  const [outgoingEntryIndex, setOutgoingEntryIndex] = useState(null)
  const [turningEntryIndex, setTurningEntryIndex] = useState(null)
  const [pageTurnDirection, setPageTurnDirection] = useState(null)
  const [isEntrySettled, setIsEntrySettled] = useState(true)
  const pageTurnTimer = useRef(null)
  const timers = useRef([])

  const openBook = (entryIndex = 0) => {
    if (phase !== 'closed') return
    setCurrentEntryIndex(entryIndex)
    /* Sequence: the clasp unsnaps and pivots clear first (600ms) and
       holds that position briefly BEFORE the cover starts
       moving. The clasp-open state then persists through 'opening' into
       'open' — it is never reset, hidden, or unmounted. */
    setPhase('clasp-open')
    timers.current.push(
      setTimeout(() => {
        setPhase('opening')
        timers.current.push(setTimeout(() => setPhase('open'), 1200))
      }, 680),
    )
  }

  const closeBook = () => {
    if (phase !== 'open') return
    setBookmarkedEntryIndex(currentEntryIndex)
    if (pageTurnTimer.current) clearTimeout(pageTurnTimer.current)
    pageTurnTimer.current = null
    setOutgoingEntryIndex(null)
    setTurningEntryIndex(null)
    setPageTurnDirection(null)
    setIsEntrySettled(true)
    setPhase('closing')
    timers.current.push(setTimeout(() => {
      setPhase('clasp-closing')
      timers.current.push(setTimeout(() => setPhase('closed'), 600))
    }, 1200))
  }

  const navigateToEntry = (nextEntryIndex, directionOverride = null) => {
    if (
      phase !== 'open'
      || outgoingEntryIndex !== null
      || nextEntryIndex < 0
      || nextEntryIndex >= journalPages.length
      || nextEntryIndex === currentEntryIndex
    ) return

    const direction = directionOverride || (nextEntryIndex > currentEntryIndex ? 'forward' : 'backward')
    setOutgoingEntryIndex(currentEntryIndex)
    setTurningEntryIndex(direction === 'forward' ? currentEntryIndex : nextEntryIndex)
    setPageTurnDirection(direction)
    setIsEntrySettled(false)
    setCurrentEntryIndex(nextEntryIndex)

    pageTurnTimer.current = setTimeout(() => {
      setOutgoingEntryIndex(null)
      setTurningEntryIndex(null)
      setPageTurnDirection(null)
      setIsEntrySettled(true)
      pageTurnTimer.current = null
    }, PAGE_TURN_DURATION)
  }

  const handleAboutMeClick = (event) => {
    event.currentTarget.blur()
    /* If journal is closed, open it to Entry One.
       If journal is open on a different entry, navigate to Entry One.
       If already on Entry One, do nothing. */
    if (phase === 'closed') {
      setCurrentEntryIndex(0)
      openBook()
    } else if (phase === 'open' && currentEntryIndex !== 0) {
      navigateToEntry(0)
    }
  }

  const openBookmarkedEntry = () => {
    openBook(bookmarkedEntryIndex)
  }

  const handleContactClick = (event) => {
    event.currentTarget.blur()
    if (phase === 'closed') {
      openBook(CONTACT_PAGE_INDEX)
    } else if (phase === 'open' && currentEntryIndex !== CONTACT_PAGE_INDEX) {
      navigateToEntry(CONTACT_PAGE_INDEX)
    }
  }

  const handleJourneyClick = (event) => {
    event.currentTarget.blur()
    if (phase === 'closed') {
      openBook(1)
    } else if (phase === 'open' && currentEntryIndex !== 1) {
      navigateToEntry(1)
    }
  }

  const handleSkillsClick = (event) => {
    event.currentTarget.blur()
  }

  const handleMyWorkTabClick = (event) => {
    event.currentTarget.blur()
    if (phase === 'closed') {
      openBook(MY_WORK_ENTRY_INDEX)
    } else if (phase === 'open' && currentEntryIndex !== MY_WORK_ENTRY_INDEX) {
      navigateToEntry(MY_WORK_ENTRY_INDEX)
    }
  }

  const handleToolkitKeyClick = (event) => {
    event.currentTarget.blur()
    if (phase === 'closed') {
      openBook(TOOLKIT_ENTRY_INDEX)
    } else if (phase === 'open' && currentEntryIndex !== TOOLKIT_ENTRY_INDEX) {
      navigateToEntry(TOOLKIT_ENTRY_INDEX)
    }
  }

  const handleStandardOpen = () => {
    if (phase !== 'closed') return
    setCurrentEntryIndex(0)
    setOutgoingEntryIndex(null)
    setTurningEntryIndex(null)
    setPageTurnDirection(null)
    setIsEntrySettled(true)
    openBook(0)
  }

  const isOpen = phase === 'open'
  const isContactInteractive = isOpen
    && currentEntryIndex === CONTACT_PAGE_INDEX
    && outgoingEntryIndex === null
    && isEntrySettled
  const isDecorativeBookmarkVisible = isOpen && (
    currentEntryIndex === bookmarkedEntryIndex
    || outgoingEntryIndex === bookmarkedEntryIndex
  )
  const isEntryVisible = (entryIndex) => (
    currentEntryIndex === entryIndex || outgoingEntryIndex === entryIndex
  )
  const entryClassName = (baseClass, entryIndex) => [
    baseClass,
    isEntryVisible(entryIndex) ? 'is-active' : '',
    turningEntryIndex === entryIndex ? `is-turning-out turn-${pageTurnDirection}` : '',
    currentEntryIndex === entryIndex && isEntrySettled ? 'is-settled' : '',
  ].filter(Boolean).join(' ')

  const renderPageClose = (entryIndex) => (
    isOpen && currentEntryIndex === entryIndex && isEntrySettled ? (
      <button type="button" className="close-journal page-close" onClick={closeBook}>
        Close Book
      </button>
    ) : null
  )

  return (
    <main className="landing" ref={viewportRef} style={{ '--scene-scale': sceneScale }}>
      <div className="scene-size" style={{ '--scene-scale': sceneScale }}>
      <div className="desk-stage" ref={sceneRef}>
        <img className="desk-background" src={portfolioDesk} alt="" aria-hidden="true" />
        <nav className="mobile-index" aria-label="Journal navigation">
          <button type="button" className={currentEntryIndex === 0 ? 'is-active' : ''} aria-current={currentEntryIndex === 0 ? 'page' : undefined} onClick={handleAboutMeClick}>About</button>
          <button type="button" className={currentEntryIndex === 1 ? 'is-active' : ''} aria-current={currentEntryIndex === 1 ? 'page' : undefined} onClick={handleJourneyClick}>Journey</button>
          <button type="button" className={currentEntryIndex === MY_WORK_ENTRY_INDEX ? 'is-active' : ''} aria-current={currentEntryIndex === MY_WORK_ENTRY_INDEX ? 'page' : undefined} onClick={handleMyWorkTabClick}>My Work</button>
          <button type="button" disabled aria-label="Skills and Certificates, coming soon">Skills &amp; Certificates <small>Coming Soon</small></button>
          <button type="button" className={currentEntryIndex === TOOLKIT_ENTRY_INDEX ? 'is-active' : ''} aria-current={currentEntryIndex === TOOLKIT_ENTRY_INDEX ? 'page' : undefined} onClick={handleToolkitKeyClick}>My Toolkit</button>
          <button type="button" className={currentEntryIndex >= CONTACT_PAGE_INDEX ? 'is-active' : ''} aria-current={currentEntryIndex >= CONTACT_PAGE_INDEX ? 'page' : undefined} onClick={handleContactClick}>Contact</button>
        </nav>
        <button
          type="button"
          className="desk-object-hitarea about-me-area"
          aria-label="Open About Me"
          onClick={handleAboutMeClick}
        />
        <button
          type="button"
          className="desk-object-hitarea contact-me-area"
          aria-label="Open Contact Me"
          onClick={handleContactClick}
        />
        <button
          type="button"
          className="desk-object-hitarea journey-watch-area journey-watch-upper"
          aria-label="Open Entry Two — My Journey"
          onClick={handleJourneyClick}
        />
        <button
          type="button"
          className="desk-object-hitarea journey-watch-area journey-watch-lower"
          aria-hidden="true"
          tabIndex={-1}
          onClick={handleJourneyClick}
        />
        <button
          type="button"
          className="desk-object-hitarea tools-me-area"
          aria-label="Skills and Certifications — content coming soon"
          onClick={handleSkillsClick}
        />
        <button
          type="button"
          className="desk-object-hitarea toolkit-key-area"
          aria-label="Open My Toolkit and Tools & Resources"
          onClick={handleToolkitKeyClick}
        />

      <section className="hero" aria-label="Amy Astle — UX portfolio">
        <div className={`hero-stage phase-${phase}`}>
          {/* ---- Interior: stationary two-page aged parchment spread ---- */}
          <div className="book-interior">
            <div className="page page-left" />
            <div className="page page-right" />
            <div className={entryClassName('entry-one-content', 0)} aria-hidden={!isEntryVisible(0)}>
              <img
                className="entry-page"
                src={entryOnePage}
                alt="Entry One journal page introducing Amy Astle and her design portfolio"
                draggable="false"
              />
              <img
                className="pressed-flower pressed-flower-purple"
                src={pressedPurpleFlower}
                alt=""
                aria-hidden="true"
                draggable="false"
              />
              <img
                className="pressed-flower pressed-flower-yellow"
                src={pressedYellowFlower}
                alt=""
                aria-hidden="true"
                draggable="false"
              />
              {renderPageClose(0)}
            </div>
            <div className={entryClassName('entry-two-page', 1)} aria-hidden={!isEntryVisible(1)}>
              <img
                className="entry-two-base"
                src={entryTwoBase}
                alt="Entry Two journal page about resilience, growth, creativity, purpose, and UX design"
                draggable="false"
              />
              <img className="entry-two-layer entry-two-cloud" src={entryTwoCloud} alt="" draggable="false" />
              <img className="entry-two-layer entry-two-rain" src={entryTwoRain} alt="" draggable="false" />
              <img className="entry-two-layer entry-two-umbrella" src={entryTwoUmbrella} alt="" draggable="false" />
              <img className="entry-two-layer entry-two-ux" src={entryTwoUx} alt="" draggable="false" />
              {renderPageClose(1)}
            </div>
            <div className={entryClassName('entry-three-page', 2)} aria-hidden={!isEntryVisible(2)}>
              <img
                className="entry-three-base"
                src={entryThreeBase}
                alt="Entry Three journal page with UX sketches, botanical elements, a fountain pen, and a pencil"
                draggable="false"
              />
              <img className="entry-three-note" src={entryThreeNote} alt="" draggable="false" />
              {entryThreeWriting.map((writingLine, index) => (
                <img
                  key={writingLine}
                  className={`entry-three-writing-line writing-line-${index + 1}`}
                  src={writingLine}
                  alt=""
                  draggable="false"
                />
              ))}
              <img
                className="entry-three-my-projects"
                src={entryThreeMyProjects}
                alt=""
                draggable="false"
              />
              {renderPageClose(2)}
            </div>
            <div className={entryClassName('entry-five-page', 3)} aria-hidden={!isEntryVisible(3)}>
              <img
                className="entry-five-base"
                src={entryFiveBase}
                alt="Entry Five journal page showcasing My Toolkit with design and development tools"
                draggable="false"
              />
              {renderPageClose(3)}
            </div>
            <div
              className={entryClassName('contact-page', CONTACT_PAGE_INDEX)}
              aria-hidden={!isEntryVisible(CONTACT_PAGE_INDEX)}
            >
              <img
                className="contact-page-background"
                src={contactPage}
                alt="Contact information for Amy Astle, including phone, email addresses, and resume QR code"
                draggable="false"
              />
              <img className="contact-flower contact-flower-left" src={pressedPurpleFlower} alt="" aria-hidden="true" draggable="false" />
              <img className="contact-flower contact-flower-bottom" src={pressedPurpleFlower} alt="" aria-hidden="true" draggable="false" />
              <img className="contact-flower contact-flower-right" src={pressedPurpleFlower} alt="" aria-hidden="true" draggable="false" />
              {isContactInteractive && (
                <>
                  <a className="contact-link contact-phone-link" href="tel:+17743792675" aria-label="Call 774-379-2675" />
                  <a className="contact-link contact-personal-email-link" href="mailto:Amyea91@gmail.com" aria-label="Email Amyea91@gmail.com" />
                  <a className="contact-link contact-school-email-link" href="mailto:aastle3@wgu.edu" aria-label="Email aastle3@wgu.edu" />
                  <a
                    className="contact-link contact-resume-link"
                    href={RESUME_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open Amy Astle's resume"
                  />
                </>
              )}
              {renderPageClose(CONTACT_PAGE_INDEX)}
            </div>
            <div
              className={entryClassName('final-page', FINAL_PAGE_INDEX)}
              aria-hidden={!isEntryVisible(FINAL_PAGE_INDEX)}
            >
              <img
                className="final-page-base"
                src={finalPageBase}
                alt="Blank aged parchment final journal page"
                draggable="false"
              />
              <div className="final-postcard-stack" aria-hidden="true">
                <img src={finalPagePostcards} alt="" draggable="false" />
              </div>
              <div className="final-message-reveal" aria-hidden="true">
                <img src={finalPageComplete} alt="" draggable="false" />
              </div>
              {renderPageClose(FINAL_PAGE_INDEX)}
            </div>
            {isDecorativeBookmarkVisible && (
              <img
                className="decorative-feather-bookmark"
                src={featherBookmark}
                alt=""
                aria-hidden="true"
                draggable="false"
              />
            )}
            {isOpen && outgoingEntryIndex === null && (
              <JournalNavigation
                currentIndex={currentEntryIndex}
                onNavigate={navigateToEntry}
                onClose={closeBook}
              />
            )}
            <button
              type="button"
              className="my-work-tab"
              aria-label="Go to My Work — Entry Three"
              onClick={handleMyWorkTabClick}
            >
              <img
                src={myWorkTab}
                alt=""
                draggable="false"
              />
            </button>
          </div>

          {/* ---- Front cover: the existing artwork, hinged on the left spine ---- */}
          <div className="book-cover" aria-hidden={isOpen}>
            <div className="cover-inside" aria-hidden="true" />
            <img
              className="hero-art"
              src={heroImg}
              alt="Antique leather book cover with a golden feather bookmark and an ornate gold frame surrounding an aged parchment"
              draggable="false"
            />
            <button
              type="button"
              className="feather-bookmark-trigger"
              aria-label="Open bookmarked page"
              tabIndex={phase === 'closed' ? 0 : -1}
              aria-hidden={phase !== 'closed'}
              onClick={openBookmarkedEntry}
            />
            <div className="hero-text">
              <h1 className="hero-name">Amy Astle</h1>
              <p className="hero-subtitle">Designing with Purpose</p>
              <div className="hero-divider" aria-hidden="true">
                <span className="d-line" />
                <span className="d-gem" />
                <span className="d-line" />
              </div>
              <p className="hero-tagline">Every interaction tells a story.</p>
            </div>
          </div>

          {/* soft shadow cast under the lifting cover */}
          <div className="cover-shadow" aria-hidden="true" />

          {/* ---- Leather clasp: PERMANENT journal hardware ----
              Lives OUTSIDE .book-cover so it survives the closed → open
              state change. It unsnaps and swings slightly open on click,
              stays hanging open, and remains a real, clickable button
              beside the open journal (reserved for future navigation). */}
          <button
            type="button"
            className="open-tab"
            aria-label="Open the book"
            aria-pressed={phase !== 'closed'}
            aria-hidden={phase !== 'closed'}
            tabIndex={phase === 'closed' ? 0 : -1}
            onClick={handleStandardOpen}
          >
            <span className="rivet" aria-hidden="true" />
            <span className="open-label">Open</span>
            <span className="open-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </section>
      </div>
      </div>
    </main>
  )
}

export default App
