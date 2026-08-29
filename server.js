import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.post('/api/generate', async (req, res) => {
  const { topic } = req.body

  if (!topic || !topic.trim()) {
    return res.status(400).json({ error: 'Topic is required' })
  }

  if (!process.env.TOKENIN_API_KEY) {
    return res.status(500).json({ error: 'Server is missing API key configuration' })
  }

  const prompt = `Generate exactly 8 flashcards for the topic: "${topic}".
Return ONLY a raw JSON object. Do not include any markdown, backticks, or extra explanation.
Use this exact format:
{
  "cards": [
    {
      "id": "1",
      "question": "the question",
      "answer": "the answer"
    }
  ]
}`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000)

    const response = await fetch('https://tokenin.my.id/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOKENIN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'myt/gpt-5.6-sol-free',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful study assistant. Always respond with raw JSON only, no markdown, no extra text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }),
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (!response.ok) {
      return res.status(500).json({ error: 'AI provider returned an error. Please try again.' })
    }

    const data = await response.json()
    const text = data?.choices?.[0]?.message?.content ?? ''

    res.json({ result: text })
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'The AI took too long to respond. Please try again.' })
    }
    res.status(500).json({ error: 'Something went wrong on the server.' })
  }
})

app.listen(3001)
