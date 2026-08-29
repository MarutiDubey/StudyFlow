let currentRequestId = null

function parseAIResponse(raw) {
  let text = raw.trim()

  text = text.replace(/```json/gi, '').replace(/```/gi, '').trim()

  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')

  if (start === -1 || end === -1) {
    throw new Error('The AI returned an unreadable format. Please try again.')
  }

  text = text.slice(start, end + 1)

  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('The AI returned invalid data. Please try again.')
  }

  if (!Array.isArray(parsed.cards) || parsed.cards.length === 0) {
    throw new Error('The AI did not return any flashcards. Please try a different topic.')
  }

  const valid = parsed.cards
    .map((card, i) => ({
      id: card.id ? String(card.id) : String(i + 1),
      question: String(card.question || '').trim(),
      answer: String(card.answer || '').trim()
    }))
    .filter(card => card.question.length > 0 && card.answer.length > 0)

  if (valid.length === 0) {
    throw new Error('The flashcards generated were empty. Please try again.')
  }

  return valid
}

export async function generateCards(topic) {
  const requestId = Date.now().toString()
  currentRequestId = requestId

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch('http://localhost:3001/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (requestId !== currentRequestId) {
      return { stale: true }
    }

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Server returned an error.')
    }

    const data = await response.json()

    if (requestId !== currentRequestId) {
      return { stale: true }
    }

    const cards = parseAIResponse(data.result)
    return { cards }
  } catch (err) {
    clearTimeout(timeout)

    if (requestId !== currentRequestId) {
      return { stale: true }
    }

    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.')
    }

    throw err
  }
}
