# 🚀 Asteroid Shooter with AI Survival Tips

A classic retro-style arcade game built with vanilla JavaScript, HTML5 Canvas, and Tailwind CSS. This project features a unique integration with Google's Gemini API to provide witty, sarcastic, and helpful "Survival Tips" whenever the player loses.

---

## 🌐 Live Demo

- **Live URL:** [https://asteroid-shooter-gamee.vercel.app](https://asteroid-shooter-gamee.vercel.app)

---

![Project Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🎮 Features

- **Classic Arcade Physics:** Smooth thrust, rotation, and friction mechanics simulating zero-gravity inertia.
- **Infinite Gameplay:** Progressive difficulty; as you clear levels, asteroid counts increase.
- **AI Integration:** Uses Google's **Gemini API** to analyze your final score and level to generate unique, context-aware game-over advice.
- **Responsive Design:** The game canvas scales automatically to fit different screen sizes.
- **Retro Aesthetic:** Vector-style neon graphics, CRT-inspired visuals, and "Press Start 2P" typography.

## 🛠️ Technologies Used

- **HTML5 Canvas** - For high-performance 2D rendering.
- **Vanilla JavaScript (ES6+)** - Handles the game loop, physics engine, and API logic.
- **Tailwind CSS** - Used for the UI overlay and responsive layout.
- **Google Gemini API** - Powers the generative AI "Survival Tips".

## 📂 Project Structure

```text
.
├── index.html    # Main entry point; loads CSS and JS
├── style.css     # Visual styles, fonts, and responsive rules
└── script.js     # Core game logic, physics, and AI integration
```

## 🚀 Getting Started

### Prerequisites

To run this game, you need:

1.  A modern web browser (Chrome, Firefox, Edge, Safari).
2.  A text editor (VS Code, Notepad++, etc.) if you wish to edit the code.
3.  A **Google Gemini API Key** (Get one for free at [Google AI Studio](https://aistudio.google.com/)).

### Installation & Setup

1.  **Clone or Download** this repository to your local machine.
2.  **Open the project folder**.
3.  **Configure the API Key** (Crucial Step):
    - Open `script.js` in your text editor.
    - Locate the `getSurvivalTip()` function (approx. line 350).
    - Find the line: `const apiKey = "";`
    - Paste your actual Gemini API key inside the quotes.
    - _Example:_ `const apiKey = "AIzaSyD-Your-Actual-Key-Here";`
    - _Note:_ Without this key, the "Survival Tip" feature will return a simulated error message.
4.  **Run the Game**:
    - Simply double-click `index.html` to launch the game in your browser.

## 🕹️ Controls

| Key                          | Action                                            |
| :--------------------------- | :------------------------------------------------ |
| **⬆️ Up Arrow**              | Thrust / Move Forward                             |
| **⬅️ Left Arrow**            | Rotate Ship Left                                  |
| **➡️ Right Arrow**           | Rotate Ship Right                                 |
| **Spacebar**                 | Shoot Laser                                       |
| **Click "Get Survival Tip"** | Ask AI for advice (Available on Game Over screen) |

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the game (e.g., add sound effects, mobile touch controls, or local high scores), feel free to fork the repository and submit a pull request.

## 📄 License

This project is open-source and available for personal and educational use.
