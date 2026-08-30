import { motion } from 'motion/react'

export const GlowBorder = () => (
  <svg className="glow-border" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" rx="24" pathLength="100" />
  </svg>
)

function Flashcard({ card }) {
  return (
    <div className="card-wrapper">
      <motion.div
        className="card"
        initial={false}
        animate={{ rotateY: card.flipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <div className="card-front" onClick={() => card.onFlip(card.id)}>
          <GlowBorder />
          <span className="card-label">Question</span>
          <p>{card.question}</p>
          <span className="card-hint">Tap to flip</span>
        </div>
        <div className="card-back" onClick={() => card.onFlip(card.id)}>
          <GlowBorder />
          <span className="card-label">Answer</span>
          <p>{card.answer}</p>
        </div>
      </motion.div>
    </div>
  )
}

export default Flashcard
