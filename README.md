# StudyFlow - AI Flashcard Generator

A React app that takes a free-form text input, sends it to an LLM API, and generates an interactive flashcard and quiz tool.

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd flow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the environment variables:
   - Obtain your Tokenin API key.
   - Create a `.env` file in the root of the project.
   - Add your key:
     ```env
     TOKENIN_API_KEY=your_key_here
     ```

4. Start the application:
   ```bash
   npm start
   ```

The frontend runs on `http://localhost:5173` and the backend proxy runs on `http://localhost:3001`.

## Usage

1. Enter a topic in the main text input (e.g., "React Hooks", "World War 2").
2. Click "Generate Flashcards" to trigger the API call.
3. Browse the generated cards. Click on a card to reveal the answer.
4. Select "Take Quiz" to enter self-grading mode.
5. After the quiz, select "Retry Wrong" to filter and re-test only the incorrect answers.

## Architecture and Stretch Goals

- **Secure API Routing**: The model call is routed through a small Express.js backend (`server.js`) to ensure the API key is never shipped to the browser client.
- **Error Handling**: The application gracefully handles malformed JSON, empty outputs, or API failures by showing a clear error state and offering a retry option without crashing.
- **Dual Themes**: Includes two distinct UI themes (Modern and Comic) built with standard CSS and Tailwind.
- **Animations**: Uses Framer Motion for card flipping and layout transitions.
- **Accessibility**: Supports keyboard navigation (Arrow keys to navigate, Space/Enter to flip cards).
- **Responsive Design**: Fully optimized for mobile screens.

## AI Usage Note

I used AI assistants to help scaffold boilerplate UI components and to troubleshoot CSS for the 3D card flip animations and responsive layouts. The core application logic, API integration, data parsing, error handling strategies, and backend proxy setup were written manually by me to ensure full control over the application's stability.

## Known Limitations

- The application requires a valid API key and internet access to function.
- In rare cases, the LLM may return a heavily malformed JSON string that cannot be recovered by the built-in parser. When this happens, a fallback error UI is displayed.
- Session data is kept in memory and is not persisted to a database.

## Time Spent

| Task | Time |
|---|---|
| Initial setup and planning | ~1.0 hr |
| Backend proxy configuration | ~0.5 hr |
| LLM integration and error handling | ~2.0 hr |
| Flashcard UI and flip logic | ~1.5 hr |
| Quiz logic and re-test functionality | ~1.5 hr |
| Styling and mobile responsiveness | ~1.0 hr |
| Testing and documentation | ~0.5 hr |
| **Total** | **~8.0 hrs** |
