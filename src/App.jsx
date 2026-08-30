import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { generateCards } from './api'
import Flashcard, { GlowBorder } from './Flashcard'
import SmoothFollower from './Cursor'
import { FlickeringGrid } from './FlickeringGrid'
import InteractiveHoverButton from './InteractiveHoverButton'
import ComicView from './ComicView'
import ProfileModal from './components/ProfileModal'
import TargetCursor from './TargetCursor'
import EchoText from './EchoText'
import './InteractiveHoverButton.css'
import './App.css'

function App() {
  const [themeMode, setThemeMode] = useState('comic')
  const [view, setView] = useState('input')
  const [topic, setTopic] = useState('')
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [flippedCards, setFlippedCards] = useState({})

  const [quizCards, setQuizCards] = useState([])
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [showAnswer, setShowAnswer] = useState(false)
  const [quizDone, setQuizDone] = useState(false)
  const [slideDirection, setSlideDirection] = useState(1)
  const [btnHovered, setBtnHovered] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const toggleBtnRef = useRef(null)

  const switchTheme = useCallback((nextMode) => {
    const btn = toggleBtnRef.current
    const x = btn ? btn.getBoundingClientRect().left + btn.offsetWidth / 2 : window.innerWidth / 2
    const y = btn ? btn.getBoundingClientRect().top + btn.offsetHeight / 2 : window.innerHeight / 2
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${endRadius}px at ${x}px ${y}px)`
    ]
    if (!document.startViewTransition) {
      setThemeMode(nextMode)
      return
    }
    document.startViewTransition(() => {
      setThemeMode(nextMode)
    }).ready.then(() => {
      document.documentElement.animate(
        { clipPath },
        { duration: 600, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
      )
    })
  }, [])

  const isComic = themeMode === 'comic'
  const wrongCards = quizCards.filter(c => quizAnswers[c.id] === 'wrong')

  const ThemeToggleBtn = (
    <button
      ref={toggleBtnRef}
      onClick={() => switchTheme(isComic ? 'modern' : 'comic')}
      onMouseEnter={() => setBtnHovered(true)}
      onMouseLeave={() => setBtnHovered(false)}
      className="cursor-target"
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        background: isComic ? '#000' : '#fff',
        color: isComic ? '#fff' : '#000',
        border: isComic ? '2px solid #fff' : '2px solid #000',
        borderRadius: isComic ? '0px' : '999px',
        fontFamily: 'monospace',
        fontWeight: 'bold',
        fontSize: '0.85rem',
        cursor: 'none',
        letterSpacing: isComic ? '0.08em' : '0.02em',
        transition: 'all 0.2s ease',
        boxShadow: isComic
          ? btnHovered ? '-5px 5px 0 #fff' : '-3px 3px 0 #fff'
          : btnHovered ? '0 4px 16px rgba(0,0,0,0.18)' : 'none',
        transform: btnHovered ? 'scale(1.07)' : 'scale(1)',
      }}
    >
      <span style={{ fontSize: '1rem' }}>{isComic ? '⚡' : '💥'}</span>
      {isComic ? 'MODERN MODE' : 'Comic Mode'}
    </button>
  )

  async function handleGenerate() {
    if (!topic.trim()) return
    setLoading(true)
    setError(null)

    try {
      const result = await generateCards(topic.trim())
      if (result.stale) return
      setCards(result.cards)
      setCurrentIndex(0)
      setFlippedCards({})
      setView('study')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function toggleFlip(id) {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  function nextCard() {
    setSlideDirection(1)
    setCurrentIndex(i => i + 1)
  }

  function prevCard() {
    setSlideDirection(-1)
    setCurrentIndex(i => i - 1)
  }

  function startQuiz(cardsToUse) {
    setQuizCards(cardsToUse)
    setQuizIndex(0)
    setQuizAnswers({})
    setShowAnswer(false)
    setQuizDone(false)
    setView('quiz')
  }

  function handleAnswer(cardId, result) {
    setQuizAnswers(prev => ({
      ...prev,
      [cardId]: result
    }))
    if (result === 'wrong') {
      console.log('Card marked wrong:', cardId)
    }
    if (quizIndex < quizCards.length - 1) {
      setQuizIndex(i => i + 1)
      setShowAnswer(false)
    } else {
      setQuizDone(true)
    }
  }

  const pageVariants = {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 }
  }

  const cardSlideVariants = {
    initial: (d) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    animate: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: (d) => ({ x: d > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.2 } })
  }

  if (themeMode === 'comic') {
    return (
      <>
        <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        <div className="fixed top-5 left-5 z-40 flex items-center gap-4">
          <button 
            onClick={() => setView('input')}
            className="bg-yellow-300 text-black border-4 border-black font-black uppercase shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] transition-all flex items-center justify-center cursor-target"
            style={{ padding: '10px' }}
            title="Home"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </button>
          <button 
            onClick={() => setIsProfileOpen(true)}
            className="bg-yellow-300 text-black border-4 border-black font-black uppercase shadow-[4px_4px_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#000] transition-all flex items-center gap-2 cursor-target whitespace-nowrap flex-shrink-0"
            style={{ padding: '10px 20px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>Author Profile</span>
          </button>
        </div>
        {ThemeToggleBtn}
        <TargetCursor spinDuration={2} hideDefaultCursor={true} parallaxOn={true} cursorColor="#ff0000" targetSelector=".cursor-target" />
        <ComicView
          topic={topic} setTopic={setTopic} cards={cards} loading={loading} error={error} 
          handleGenerate={handleGenerate} view={view} setView={setView} 
          currentIndex={currentIndex} nextCard={nextCard} prevCard={prevCard} 
          flippedCards={flippedCards} toggleFlip={toggleFlip} 
          startQuiz={startQuiz} quizDone={quizDone} 
          correctCount={quizCards.length - wrongCards.length} 
          wrongCards={wrongCards} 
          quizIndex={quizIndex} quizCards={quizCards} 
          showAnswer={showAnswer} setShowAnswer={setShowAnswer} handleAnswer={handleAnswer}
        />
      </>
    )
  }

  return (
    <>
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <div className="fixed top-5 left-5 z-40 flex items-center gap-4">
        <button 
          onClick={() => setView('input')}
          className="bg-white hover:bg-gray-200 border-2 border-black text-black rounded-full font-bold shadow-[0_4px_16px_rgba(255,255,255,0.1)] transition-all hover:scale-105 flex items-center justify-center cursor-target"
          style={{ padding: '10px' }}
          title="Home"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </button>
        <button 
          onClick={() => setIsProfileOpen(true)}
          className="bg-white hover:bg-gray-200 border-2 border-black text-black rounded-full font-bold shadow-[0_4px_16px_rgba(255,255,255,0.1)] transition-all hover:scale-105 flex items-center gap-2 cursor-target whitespace-nowrap flex-shrink-0"
          style={{ padding: '10px 24px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Author Profile</span>
        </button>
      </div>
      {ThemeToggleBtn}
      <FlickeringGrid
        className="fixed inset-0 z-[-1]"
        squareSize={4}
        gridGap={6}
        color="rgba(255, 255, 255, 0.1)"
        maxOpacity={0.08}
        flickerChance={0.05}
      />
      <SmoothFollower />
      <AnimatePresence mode="wait">
        {view === 'input' && (
          <motion.div key="input" className="container" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <div className="header">
              <h1>
                <EchoText
                  text="StudyFlow"
                  echoes={10}
                  lag={0.2}
                  offset={32}
                  direction="right"
                  fade={0.7}
                  blur={3}
                  tint="#c084fc"
                  mode="both"
                  cursorRadius={350}
                  duration={900}
                  ease="ease-out"
                  fontSize="clamp(4.5rem, 9vw, 7.5rem)"
                  fontWeight={800}
                  color="#f3e8ff"
                />
              </h1>
              <p className="text-purple-200/80">Enter any topic to generate AI-powered flashcards</p>
            </div>
            <div className="input-box">
              <textarea
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="Enter topic (e.g., React hooks, Photosynthesis, World War 2)..."
                className="w-full bg-black/30 border border-white/20 rounded-12px p-4 text-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                rows={3}
              />
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="bg-red-500/20 border border-red-400 rounded-12px p-3 flex justify-between items-center"
                >
                  <p className="text-red-300">{error}</p>
                  <button onClick={handleGenerate} className="ml-3 px-3 py-1 bg-red-500 text-white rounded text-sm">Retry</button>
                </motion.div>
              )}
              <InteractiveHoverButton
                onClick={handleGenerate}
                disabled={loading || !topic.trim()}
              >
                {loading ? 'Generating...' : 'Generate Flashcards'}
              </InteractiveHoverButton>
            </div>
          </motion.div>
        )}

        {view === 'study' && cards.length > 0 && (
          <motion.div key="study" className="container" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <div className="header" style={{ marginBottom: '16px' }}>
              <h1 className="text-purple-100">{topic}</h1>
            </div>
            
            <div className="w-full max-w-[640px] flex justify-end mb-4 px-2">
              <div 
                className="flex items-center justify-center text-white/40 text-xs font-mono tracking-widest bg-white/5 rounded-full border border-white/10"
                style={{ padding: '6px 16px 8px 16px', lineHeight: '1' }}
              >
                {currentIndex + 1} OF {cards.length}
              </div>
            </div>

            <AnimatePresence mode="wait" custom={slideDirection}>
              <motion.div
                key={currentIndex}
                custom={slideDirection}
                variants={cardSlideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="w-full"
                style={{ width: '100%' }}
              >
                <Flashcard
                  card={{
                    ...cards[currentIndex],
                    flipped: !!flippedCards[cards[currentIndex].id],
                    onFlip: toggleFlip
                  }}
                />
              </motion.div>
            </AnimatePresence>

            <div className="nav-buttons">
              <button
                onClick={() => { setSlideDirection(-1); prevCard() }}
                disabled={currentIndex === 0}
                className="cursor-target"
              >
                ← Prev
              </button>
              <div className="divider" />
              <button
                onClick={() => { setSlideDirection(1); nextCard() }}
                disabled={currentIndex === cards.length - 1}
                className="cursor-target"
              >
                Next →
              </button>
            </div>
            <div className="action-buttons">
              <button className="quiz-btn cursor-target" onClick={() => startQuiz(cards)}>
                Take Quiz
              </button>
              <button className="secondary-btn cursor-target" onClick={() => setView('input')}>
                New Topic
              </button>
            </div>
          </motion.div>
        )}

        {view === 'quiz' && (
          <motion.div key="quiz" className="container" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            {quizDone ? (
              <>
                <div className="header">
                  <h1 className="text-2xl font-bold text-purple-100">Quiz Results</h1>
                </div>
                <motion.div
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                >
                  <div className="grid grid-cols-2 gap-6 text-center mb-6">
                    <div>
                      <div className="text-3xl font-bold text-green-400">
                        {quizCards.length - wrongCards.length}
                      </div>
                      <div className="text-white/60">Correct</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-red-400">
                        {wrongCards.length}
                      </div>
                      <div className="text-white/60">Wrong</div>
                    </div>
                  </div>
                  <div className="action-buttons">
                    {wrongCards.length > 0 && (
                      <button className="quiz-btn" onClick={() => startQuiz(wrongCards)}>
                        Re-test Wrong ({wrongCards.length})
                      </button>
                    )}
                    <button className={wrongCards.length > 0 ? "secondary-btn" : "quiz-btn"} onClick={() => startQuiz(cards)}>
                      Retake Full Quiz
                    </button>
                    <button className="secondary-btn" onClick={() => setView('study')}>
                      Back to Cards
                    </button>
                  </div>
                </motion.div>
              </>
            ) : (
              <>
                <div className="header" style={{ marginBottom: '16px' }}>
                  <h1 className="text-2xl font-bold text-purple-100">Quiz</h1>
                </div>
                
                <div className="w-full max-w-[640px] flex justify-end mb-4 px-2">
                  <div 
                    className="flex items-center justify-center text-white/40 text-xs font-mono tracking-widest bg-white/5 rounded-full border border-white/10"
                    style={{ padding: '6px 16px 8px 16px', lineHeight: '1' }}
                  >
                    {quizIndex + 1} OF {quizCards.length}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={quizIndex}
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -30, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="quiz-card"
                  >
                    <GlowBorder />
                    <p className="text-xl text-white mb-6 text-center relative z-10">{quizCards[quizIndex].question}</p>
                    {showAnswer ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="w-full min-h-[160px] flex items-center justify-center bg-white/5 border border-white/10 rounded-xl p-8 relative z-10">
                          <p className="text-xl text-purple-100 text-center leading-relaxed m-0">{quizCards[quizIndex].answer}</p>
                        </div>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleAnswer(quizCards[quizIndex].id, 'correct')}
                            className="quiz-btn"
                          >
                            Got It!
                          </button>
                          <button
                            onClick={() => handleAnswer(quizCards[quizIndex].id, 'wrong')}
                            className="secondary-btn"
                          >
                            Missed It
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <button
                        onClick={() => setShowAnswer(true)}
                        className="quiz-btn"
                        style={{ margin: '0 auto', display: 'block', marginTop: '1rem' }}
                      >
                        Reveal Answer
                      </button>
                    )}
                  </motion.div>
                </AnimatePresence>
                <div className="nav-buttons" style={{ marginTop: '24px' }}>
                  <button
                    onClick={() => { setShowAnswer(false); if (quizIndex > 0) setQuizIndex(i => i - 1) }}
                    disabled={quizIndex === 0}
                    className="cursor-target"
                  >
                    ← Prev
                  </button>
                  <div className="divider" />
                  <button
                    onClick={() => { setShowAnswer(false); if (quizIndex < quizCards.length - 1) setQuizIndex(i => i + 1) }}
                    disabled={quizIndex === quizCards.length - 1}
                    className="cursor-target"
                  >
                    Next →
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default App