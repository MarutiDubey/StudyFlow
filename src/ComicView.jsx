import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ComicText } from './components/ui/ComicText'

const spring = { type: 'spring', stiffness: 400, damping: 28 }
const snappy = { type: 'spring', stiffness: 600, damping: 30 }

function BurstWord({ word, color = '#facc15', visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={word}
          initial={{ scale: 0, rotate: -15, opacity: 0 }}
          animate={{ scale: 1.2, rotate: -8, opacity: 1 }}
          exit={{ scale: 2, opacity: 0, rotate: -4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          style={{
            position: 'fixed',
            top: '35%',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9000,
            fontFamily: "'Bangers', 'Comic Sans MS', Impact, sans-serif",
            fontSize: '6rem',
            fontWeight: 900,
            color,
            WebkitTextStroke: '4px #000',
            filter: 'drop-shadow(6px 6px 0 #000)',
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {word}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function SpeedLines() {
  const lines = Array.from({ length: 12 }, (_, i) => i)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {lines.map(i => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '200%',
            height: '2px',
            background: 'linear-gradient(to right, transparent, #00000018)',
            transformOrigin: 'left center',
            transform: `rotate(${i * 30}deg)`,
          }}
        />
      ))}
    </motion.div>
  )
}

function ComicCard({ children, className = '', onClick, style = {}, shake = false }) {
  return (
    <motion.div
      onClick={onClick}
      style={{ ...style, cursor: onClick ? 'pointer' : 'default' }}
      className={`border-4 border-black bg-white shadow-[-6px_6px_0_#000] ${className}`}
      animate={shake ? { x: [0, -8, 8, -6, 6, -4, 4, 0] } : {}}
      transition={shake ? { duration: 0.4, ease: 'easeOut' } : {}}
      whileHover={onClick ? { y: -3, boxShadow: '-8px 10px 0 #000', transition: snappy } : {}}
      whileTap={onClick ? { scale: 0.97, y: 1, boxShadow: '-3px 3px 0 #000', transition: snappy } : {}}
    >
      {children}
    </motion.div>
  )
}

function ComicButton({ children, onClick, className = '', disabled = false, variant = 'default' }) {
  const colors = {
    default: { bg: '#000', text: '#fff', shadow: '#555' },
    success: { bg: '#22c55e', text: '#000', shadow: '#15803d' },
    danger: { bg: '#ef4444', text: '#000', shadow: '#b91c1c' },
    yellow: { bg: '#facc15', text: '#000', shadow: '#a16207' },
    outline: { bg: '#fff', text: '#000', shadow: '#000' },
  }
  const c = colors[variant] || colors.default

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`cursor-target font-black uppercase border-4 border-black font-mono ${className}`}
      style={{ background: c.bg, color: c.text, boxShadow: `-4px 4px 0 ${c.shadow}` }}
      whileHover={!disabled ? {
        y: -3,
        x: -2,
        boxShadow: `-6px 6px 0 ${c.shadow}`,
        transition: snappy
      } : {}}
      whileTap={!disabled ? {
        y: 4,
        x: 4,
        boxShadow: `0px 0px 0 ${c.shadow}`,
        transition: { duration: 0.08 }
      } : {}}
      animate={disabled ? { opacity: 0.35 } : { opacity: 1 }}
    >
      {children}
    </motion.button>
  )
}

export default function ComicView({
  topic, setTopic, cards, loading, error,
  handleGenerate, view, setView,
  currentIndex, nextCard, prevCard,
  flippedCards, toggleFlip,
  startQuiz, quizDone, correctCount, wrongCards,
  quizIndex, quizCards, showAnswer, setShowAnswer, handleAnswer
}) {
  const [slideDir, setSlideDir] = useState(1)
  const [burst, setBurst] = useState(null)
  const [shakeCard, setShakeCard] = useState(false)
  const [isSliding, setIsSliding] = useState(false)

  const flipWords = ['FLIP!', 'WHOOSH!', 'ZAP!', 'POW!']
  const correctWords = ['NICE! ✓', 'BOOM! ✓', 'YES! ✓', 'GOT IT!']
  const wrongWords = ['MISSED!', 'NOPE!', 'OOPS!', 'TRY AGAIN!']

  const showBurst = useCallback((word, color, duration = 800) => {
    setBurst({ word, color })
    setTimeout(() => setBurst(null), duration)
  }, [])

  const onCorrect = useCallback((id) => {
    showBurst(correctWords[Math.floor(Math.random() * correctWords.length)], '#4ade80')
    handleAnswer(id, 'correct')
  }, [handleAnswer, showBurst])

  const onWrong = useCallback((id) => {
    showBurst(wrongWords[Math.floor(Math.random() * wrongWords.length)], '#f87171')
    setShakeCard(true)
    setTimeout(() => setShakeCard(false), 500)
    handleAnswer(id, 'wrong')
  }, [handleAnswer, showBurst])

  const goNext = useCallback(() => {
    setSlideDir(1)
    setIsSliding(true)
    setTimeout(() => setIsSliding(false), 300)
    nextCard()
  }, [nextCard])

  const goPrev = useCallback(() => {
    setSlideDir(-1)
    setIsSliding(true)
    setTimeout(() => setIsSliding(false), 300)
    prevCard()
  }, [prevCard])

  useEffect(() => {
    const handleKey = (e) => {
      if (view === 'study' && cards.length > 0) {
        if (e.key === 'ArrowRight' && currentIndex < cards.length - 1) goNext()
        if (e.key === 'ArrowLeft' && currentIndex > 0) goPrev()
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          showBurst(flipWords[Math.floor(Math.random() * flipWords.length)], '#facc15', 500)
          toggleFlip(cards[currentIndex].id)
        }
      }
      if (view === 'quiz' && !quizDone) {
        if (e.key === ' ' && !showAnswer) { e.preventDefault(); setShowAnswer(true) }
        if (showAnswer) {
          if (e.key === 'ArrowRight' || e.key === 'Enter') onCorrect(quizCards[quizIndex].id)
          if (e.key === 'ArrowLeft') onWrong(quizCards[quizIndex].id)
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [view, cards, currentIndex, quizDone, showAnswer, quizCards, quizIndex, goNext, goPrev, toggleFlip, onCorrect, onWrong, showBurst, setShowAnswer])

  const cardVariants = {
    initial: d => ({ x: d > 0 ? 80 : -80, opacity: 0, scale: 0.95 }),
    animate: { x: 0, opacity: 1, scale: 1, transition: spring },
    exit: d => ({ x: d > 0 ? -80 : 80, opacity: 0, scale: 0.95, transition: { duration: 0.18 } })
  }

  const progressPct = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0

  return (
    <div className="min-h-screen w-full bg-white text-black font-mono flex flex-col items-center relative overflow-hidden" style={{ zoom: 1.15 }}>

      {/* Halftone bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #00000040 1.5px, transparent 1.5px)',
          backgroundSize: '18px 18px',
          zIndex: 0,
        }}
      />

      {/* Burst word overlay */}
      {burst && <BurstWord word={burst.word} color={burst.color} visible={!!burst} />}

      <div className="z-10 w-full max-w-3xl px-7 pt-14 pb-10 flex flex-col items-center">

        {/* ──── INPUT VIEW ──── */}
        {view === 'input' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="w-full flex flex-col gap-7 items-center"
          >
            <div className="text-center space-y-3">
              <ComicText fontSize={5}>StudyFlow</ComicText>
              <motion.p
                initial={{ rotate: 0 }}
                animate={{ rotate: [-2, 2, -2] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="text-lg font-black bg-yellow-300 text-black px-5 py-1.5 inline-block border-4 border-black shadow-[-3px_3px_0_#000]"
              >
                💥 POW! Flashcards Instantly!
              </motion.p>
            </div>

            <ComicCard className="w-full flex flex-col gap-5 p-6">
              <div className="relative">
                <span className="absolute -top-3 left-3 bg-white px-2 text-xs font-black border-2 border-black uppercase tracking-widest">Topic</span>
                <textarea
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!loading && topic.trim()) handleGenerate() } }}
                  placeholder="Enter any topic here..."
                  className="cursor-target w-full bg-transparent outline-none resize-none text-xl font-bold p-3 pt-4 font-mono placeholder:text-gray-400 text-black border-b-4 border-black"
                  rows={3}
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-red-500 text-white p-3 font-bold border-2 border-black shadow-[-3px_3px_0_#000] overflow-hidden"
                  >
                    ⚠ {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <ComicButton
                onClick={handleGenerate}
                disabled={loading || !topic.trim()}
                className="w-full py-4 text-lg"
                variant="default"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>⚙</motion.span>
                    GENERATING...
                    <motion.span animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>⚙</motion.span>
                  </span>
                ) : '⚡ GENERATE FLASHCARDS!'}
              </ComicButton>
            </ComicCard>
          </motion.div>
        )}

        {/* ──── STUDY VIEW ──── */}
        {view === 'study' && cards.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col items-center gap-5"
          >
            {/* Header bar */}
            <div className="w-full flex justify-between items-center bg-black text-white border-4 border-black p-3 shadow-[-4px_4px_0_#555]">
              <h2 className="text-lg font-black uppercase truncate max-w-[55%]">{topic}</h2>
              <motion.span
                key={currentIndex}
                initial={{ scale: 1.4, color: '#000' }}
                animate={{ scale: 1, color: '#000' }}
                transition={snappy}
                className="font-black text-xl bg-yellow-300 text-black px-3 py-1 border-2 border-white"
              >
                {currentIndex + 1}/{cards.length}
              </motion.span>
            </div>

            {/* Comic progress bar */}
            <div className="w-full border-4 border-black h-5 bg-white overflow-hidden shadow-[-3px_3px_0_#000]">
              <motion.div
                className="h-full bg-yellow-300 border-r-4 border-black"
                animate={{ width: `${progressPct}%` }}
                transition={spring}
              />
            </div>

            {/* Flashcard */}
            <div className="w-full relative" style={{ height: '320px', perspective: '1000px' }}>
              <AnimatePresence>
                {isSliding && <SpeedLines key="speedlines" />}
              </AnimatePresence>

              <AnimatePresence mode="wait" custom={slideDir}>
                <motion.div
                  key={currentIndex}
                  custom={slideDir}
                  variants={cardVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute inset-0"
                >
                  <ComicCard shake={shakeCard} className="w-full h-full" style={{ perspective: '1000px' }}>
                    <motion.div
                      className="w-full h-full relative"
                      initial={false}
                      animate={{ rotateY: flippedCards[cards[currentIndex].id] ? 180 : 0 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                      style={{ transformStyle: 'preserve-3d' }}
                      onClick={() => {
                        if (!flippedCards[cards[currentIndex].id]) showBurst('FLIP!', '#facc15', 500)
                        toggleFlip(cards[currentIndex].id)
                      }}
                    >
                      {/* Front */}
                      <div
                        className="absolute inset-0 flex flex-col justify-center items-center text-center p-8 bg-white"
                        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                      >
                        <span className="absolute top-3 left-4 font-black text-xs text-gray-400 uppercase tracking-widest">Question</span>
                        <h3 className="text-2xl font-bold text-black leading-snug">{cards[currentIndex].question}</h3>
                        <motion.span
                          animate={{ scale: [1, 1.08, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute bottom-3 right-4 text-xs font-black bg-black text-white px-2 py-1 uppercase"
                        >
                          Tap to flip →
                        </motion.span>
                      </div>

                      {/* Back */}
                      <div
                        className="absolute inset-0 flex flex-col justify-center items-center text-center p-8 bg-yellow-100"
                        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                      >
                        <span className="absolute top-3 left-4 font-black text-xs text-gray-400 uppercase tracking-widest">Answer</span>
                        <p className="text-xl font-medium text-black leading-relaxed">{cards[currentIndex].answer}</p>
                      </div>
                    </motion.div>
                  </ComicCard>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Nav buttons */}
            <div className="flex gap-3 w-full items-stretch">
              <ComicButton onClick={goPrev} disabled={currentIndex === 0} className="py-6 px-4 text-2xl flex-1 whitespace-nowrap" variant="outline">
                ← PREV
              </ComicButton>
              <div className="flex gap-2">
                <ComicButton onClick={() => startQuiz(cards)} className="py-6 px-5 text-2xl whitespace-nowrap" variant="success">
                  🎯 QUIZ
                </ComicButton>
                <ComicButton onClick={() => setView('input')} className="py-6 px-5 text-2xl whitespace-nowrap" variant="outline">
                  NEW
                </ComicButton>
              </div>
              <ComicButton onClick={goNext} disabled={currentIndex === cards.length - 1} className="py-6 px-4 text-2xl flex-1 whitespace-nowrap" variant="outline">
                NEXT →
              </ComicButton>
            </div>

            <p className="text-xs text-gray-400 font-mono text-center mt-1">
              ← → to navigate &nbsp;·&nbsp; Space / Enter to flip
            </p>
          </motion.div>
        )}

        {/* ──── QUIZ VIEW ──── */}
        {view === 'quiz' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring}
            className="w-full flex flex-col items-center gap-5"
          >
            {quizDone ? (
              <>
                <motion.div
                  initial={{ scale: 0.7, rotate: -5 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  <ComicText fontSize={4}>QUIZ DONE!</ComicText>
                </motion.div>

                <ComicCard className="w-full flex flex-col gap-5 items-center p-8 bg-blue-50">
                  <div className="flex gap-5 font-black text-2xl">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, ...spring }}
                      className="bg-green-400 text-black px-5 py-3 border-4 border-black shadow-[-4px_4px_0_#000]"
                    >
                      {correctCount} ✓
                    </motion.span>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, ...spring }}
                      className="bg-red-400 text-black px-5 py-3 border-4 border-black shadow-[-4px_4px_0_#000]"
                    >
                      {wrongCards.length} ✗
                    </motion.span>
                  </div>

                  <p className="font-black text-lg text-center">
                    {correctCount === quizCards.length ? '🏆 PERFECT SCORE!' :
                      correctCount > quizCards.length / 2 ? '🔥 GREAT JOB!' : '💪 KEEP PRACTICING!'}
                  </p>

                  {wrongCards.length > 0 && (
                    <ComicButton onClick={() => startQuiz(wrongCards)} className="w-full py-4 text-lg" variant="yellow">
                      RE-TEST {wrongCards.length} WRONG
                    </ComicButton>
                  )}
                  <div className="flex gap-3 w-full">
                    <ComicButton onClick={() => startQuiz(cards)} className="flex-1 py-3" variant="default">
                      RETAKE ALL
                    </ComicButton>
                    <ComicButton onClick={() => setView('study')} className="flex-1 py-3" variant="outline">
                      BACK TO CARDS
                    </ComicButton>
                  </div>
                </ComicCard>
              </>
            ) : (
              <>
                <div className="w-full flex justify-between items-center bg-black text-white border-4 border-black p-3 shadow-[-4px_4px_0_#555]">
                  <h2 className="text-xl font-black uppercase">QUIZ TIME</h2>
                  <motion.span
                    key={quizIndex}
                    initial={{ scale: 1.5, y: -5 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={snappy}
                    className="font-black text-lg bg-red-400 text-black px-3 py-1 border-2 border-white"
                  >
                    {quizIndex + 1}/{quizCards.length}
                  </motion.span>
                </div>

                {/* Quiz progress */}
                <div className="w-full border-4 border-black h-4 bg-white overflow-hidden shadow-[-3px_3px_0_#000]">
                  <motion.div
                    className="h-full bg-red-400 border-r-4 border-black"
                    animate={{ width: `${((quizIndex) / quizCards.length) * 100}%` }}
                    transition={spring}
                  />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={quizIndex}
                    initial={{ x: 60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1, transition: spring }}
                    exit={{ x: -60, opacity: 0, transition: { duration: 0.15 } }}
                    className="w-full"
                  >
                    <ComicCard className="w-full flex flex-col gap-6 items-center text-center p-7">
                      <h3 className="text-2xl font-bold text-black leading-snug">{quizCards[quizIndex].question}</h3>

                      <AnimatePresence mode="wait">
                        {showAnswer ? (
                          <motion.div
                            key="answer"
                            initial={{ scale: 0.85, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={spring}
                            className="flex flex-col gap-5 w-full items-center"
                          >
                            <div className="p-5 bg-yellow-100 border-4 border-black shadow-[-4px_4px_0_#000] w-full relative">
                              <span className="absolute -top-3 left-3 bg-yellow-300 px-2 text-xs font-black border-2 border-black uppercase">Answer</span>
                              <p className="text-lg font-medium text-black">{quizCards[quizIndex].answer}</p>
                            </div>
                            <div className="flex gap-3 w-full">
                              <ComicButton
                                onClick={() => onCorrect(quizCards[quizIndex].id)}
                                className="flex-1 py-4 text-lg"
                                variant="success"
                              >
                                ✓ GOT IT!
                              </ComicButton>
                              <ComicButton
                                onClick={() => onWrong(quizCards[quizIndex].id)}
                                className="flex-1 py-4 text-lg"
                                variant="danger"
                              >
                                ✗ MISSED
                              </ComicButton>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div key="reveal" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <ComicButton
                              onClick={() => setShowAnswer(true)}
                              className="w-full py-5 text-xl"
                              variant="default"
                            >
                              REVEAL ANSWER
                              <span className="block text-xs font-mono font-normal opacity-60 mt-1">[ Space ]</span>
                            </ComicButton>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </ComicCard>
                  </motion.div>
                </AnimatePresence>

                <ComicButton onClick={() => setView('study')} className="w-full py-3" variant="outline">
                  EXIT QUIZ
                </ComicButton>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
