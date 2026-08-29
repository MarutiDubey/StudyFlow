function InteractiveHoverButton({ children, disabled, onClick, type }) {
  return (
    <button
      type={type || 'button'}
      className={`ihb ${disabled ? 'ihb-disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="ihb-default">
        <div className="ihb-dot" />
        <span className="ihb-text">{children}</span>
      </div>
      <div className="ihb-hover">
        <span>{children}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}

export default InteractiveHoverButton
