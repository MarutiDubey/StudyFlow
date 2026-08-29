# StudyFlow - AI Flashcard Generator

A React app that takes any topic as input, sends it to Google Gemini AI, and generates interactive flashcards with a built-in quiz mode.

## Setup

1. Clone the repository
   ```
   git clone <your-repo-url>
   cd flow
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

4. Create a `.env` file in the root of the project
   ```
   GEMINI_API_KEY=your_key_here
   ```

5. Run the app
   ```
   npm start
   ```

The frontend runs at `http://localhost:5173` and the backend proxy runs at `http://localhost:3001`.

## How to Use

1. Type any topic in the text box (e.g., "React hooks", "Photosynthesis", "World War 2")
2. Click **Generate Flashcards**
3. Use **Prev / Next** to browse through cards, and tap any card to flip it and see the answer
4. Click **Take Quiz** to test yourself — you reveal the answer and self-grade each card
5. After the quiz, click **Re-test Wrong Answers** to practice only the ones you missed

## AI Usage Note

I used Google Gemini AI as the data source — it generates the flashcard content (questions and answers) based on the topic the user enters. The application structure, component design, error handling, and all React code were written by me. I also used AI assistance (this tool) to help brainstorm the architecture approach, which I then implemented myself.

## Known Limitations

- Requires an active internet connection and a valid Gemini API key
- The AI occasionally wraps its JSON in markdown code blocks — the app strips this automatically, but very unusual responses may still fail (a clear error message is shown)
- Content quality depends on how specific the topic description is — more specific topics produce better flashcards
- The app does not save session data between page refreshes

## Time Spent

| Task | Time |
|---|---|
| Planning and setup | ~1 hr |
| Backend proxy server | ~0.5 hr |
| AI integration and error handling | ~2 hr |
| Flashcard UI and flip animation | ~1.5 hr |
| Quiz mode and re-test logic | ~1.5 hr |
| Styling and mobile responsiveness | ~1 hr |
| Testing and README | ~0.5 hr |
| **Total** | **~8 hrs** |
