# ☁️ WeatherMan AI
**Personalized Weather Briefings powered by LLMs**

WeatherMan is a full-stack web application designed to move beyond raw data. Instead of just showing temperatures, it uses Artificial Intelligence to provide actionable "Daily Briefings" and "Sudden Change" alerts, helping users plan their outfits and commutes in real-time.

---

## 🚀 Key Features
* **AI-Generated Insights:** Integrates Gemini/Groq LLMs to provide context-aware weather advice (e.g., "It's humid in Cainta today; wear breathable cotton").
* **Dynamic Dashboard:** Real-time weather fetching with a clean, responsive UI built with Tailwind CSS.
* **User Preference System:** Personalized settings for "Home City," GPS toggle, and scheduled briefing windows (Morning/Evening).
* **Automated Cron Jobs:** Backend services that monitor weather patterns and trigger briefings without user intervention.
* **Secure Authentication:** JWT-based auth flow to protect user data and preferences.

---

## 🛠️ Tech Stack
**Frontend:** * React 19 (Vite)
* Tailwind CSS (v4)
* Lucide React (Icons)
* Axios

**Backend:**
* Node.js & Express
* PostgreSQL (Database)
* Sequelize (ORM)
* Node-Cron (Scheduling)

**AI Integration:**
* Google Gemini API (Primary)
* Groq Cloud / Llama 3 (Failover/Backup)

---

## 🏗️ System Architecture
[Image of a full-stack web architecture diagram showing React, Express, PostgreSQL, and AI API interactions]

1. **Client:** React Frontend communicates with a RESTful Express API.
2. **Server:** Express handles authentication and business logic.
3. **Database:** PostgreSQL stores user credentials and notification preferences via Sequelize.
4. **Services:** * **Weather Service:** Fetches live data from OpenWeatherMap.
    * **AI Service:** Processes weather data through LLMs with a built-in failover mechanism.
    * **Cron Service:** Runs scheduled tasks to scan the database and trigger briefings.

---

## ⚙️ Getting Started

### Prerequisites
* Node.js (v18+)
* PostgreSQL
* OpenWeatherMap API Key
* Gemini or Groq API Key

### Installation
1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/weatherman-ai.git](https://github.com/YOUR_USERNAME/weatherman-ai.git)
   cd weatherman-ai

2. **Setup Backend**
    ```bash
    cd server
    npm install
    # Create a .env file based on the provided .env.example
    npm run dev

3. **Frontend**
    ```bash
    cd client
    npm install
    npm run dev

📈 Future Roadmap

    [ ] Email/SMS Integration: Sending briefings directly to the user's phone.
    [ ] Historical Analytics: Visualizing weather trends for the user's home city.
    [ ] Reverse Geocoding: Automatically identifying city names from GPS coordinates.

👤 Author
Johnlex Sambile

Computer Science Graduate

LinkedIn | Portfolio