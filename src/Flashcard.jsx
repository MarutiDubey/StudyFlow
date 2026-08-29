import { motion } from 'motion/react'

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
          <span className="card-label">Question</span>
          <p>{card.question}</p>
          <span className="card-hint">Tap to flip</span>
        </div>
        <div className="card-back" onClick={() => card.onFlip(card.id)}>
          <span className="card-label">Answer</span>
          <p>{card.answer}</p>
        </div>
      </motion.div>
    </div>
  )
}

export default Flashcard
