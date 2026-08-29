import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { generateCards } from './api'
import Flashcard from './Flashcard'
import SmoothFollower from './Cursor'
import { FlickeringGrid } from './FlickeringGrid'
import InteractiveHoverButton from './InteractiveHoverButton'
import ComicView from './ComicView'
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

  const ThemeToggleBtn = (
    <button
      ref={toggleBtnRef}
      onClick={() => switchTheme(isComic ? 'modern' : 'comic')}
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
        cursor: 'pointer',
        letterSpacing: isComic ? '0.08em' : '0.02em',
        transition: 'all 0.2s ease',
        boxShadow: isComic ? '-3px 3px 0 #fff' : 'none',
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
        {ThemeToggleBtn}
        <ComicView
          topic={topic} setTopic={setTopic} cards={cards} loading={loading} error={error} 
          handleGenerate={handleGenerate} view={view} setView={setView} 
          currentIndex={currentIndex} nextCard={nextCard} prevCard={prevCard} 
          flippedCards={flippedCards} toggleFlip={toggleFlip} 
          startQuiz={startQuiz} quizDone={quizDone} 
          correctCount={quizCards.length - Object.values(quizAnswers).filter(a => a === 'wrong').length} 
          wrongCards={quizCards.filter(c => quizAnswers[c.id] === 'wrong')} 
          quizIndex={quizIndex} quizCards={quizCards} 
          showAnswer={showAnswer} setShowAnswer={setShowAnswer} handleAnswer={handleAnswer}
        />
      </>
    )
  }

  return (
    <>
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
              <h1>StudyFlow</h1>
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
            <div className="header">
              <h1 className="text-purple-100">{topic}</h1>
            </div>
            <p className="text-white/60">{currentIndex + 1} / {cards.length}</p>

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
              >
                ← Prev
              </button>
              <button
                onClick={() => { setSlideDirection(1); nextCard() }}
                disabled={currentIndex === cards.length - 1}
              >
                Next →
              </button>
            </div>
            <div className="action-buttons">
              <button className="quiz-btn" onClick={() => startQuiz(cards)}>
                Take Quiz
              </button>
              <button className="secondary-btn" onClick={() => setView('input')}>
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
                        {quizCards.length - Object.values(quizAnswers).filter(a => a === 'wrong').length}
                      </div>
                      <div className="text-white/60">Correct</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-red-400">
                        {Object.values(quizAnswers).filter(a => a === 'wrong').length}
                      </div>
                      <div className="text-white/60">Wrong</div>
                    </div>
                  </div>
                  <div className="action-buttons">
                    <button className="quiz-btn" onClick={() => startQuiz(cards)}>
                      Retake Quiz
                    </button>
                    <button className="secondary-btn" onClick={() => setView('study')}>
                      Back to Cards
                    </button>
                  </div>
                </motion.div>
              </>
            ) : (
              <>
                <div className="header">
                  <h1 className="text-2xl font-bold text-purple-100">Quiz</h1>
                  <p className="text-white/60">{quizIndex + 1} / {quizCards.length}</p>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={quizIndex}
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -30, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="modern-quiz-card"
                  >
                    <p className="text-xl text-white mb-6 text-center">{quizCards[quizIndex].question}</p>
                    {showAnswer ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <p className="text-lg text-purple-200 bg-white/10 rounded-lg p-4 text-center">{quizCards[quizIndex].answer}</p>
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
                <div className="quiz-nav">
                  <button
                    className="quiz-nav-btn"
                    onClick={() => { setShowAnswer(false); if (quizIndex > 0) setQuizIndex(i => i - 1) }}
                    disabled={quizIndex === 0}
                  >
                    ← Prev
                  </button>
                  <button
                    className="quiz-nav-btn quiz-nav-btn-next"
                    onClick={() => { setShowAnswer(false); if (quizIndex < quizCards.length - 1) setQuizIndex(i => i + 1) }}
                    disabled={quizIndex === quizCards.length - 1}
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