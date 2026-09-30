# Student Tech Hub 🎓💻

A beginner-friendly full-stack web application designed for university clubs, coding societies, and student developer communities to showcase upcoming technical events and handle student registrations.

Built with a **plain HTML, CSS, and JavaScript frontend** (no complicated frameworks) and a **Python FastAPI backend**.

---

## 🌟 What the Project Does

* **Event Catalog:** Displays upcoming student tech events, workshops, hackathons, and webinars loaded dynamically from the backend.
* **Backend Integration:** Features a **Load Events** button that retrieves real-time JSON event data from a FastAPI `GET /api/events` endpoint.
* **Student Registration:** Includes an interactive registration form accepting a student's name, email, and event of interest, submitted via a `POST /api/register` endpoint.
* **Live Connection Monitor:** The frontend automatically checks backend availability and provides immediate visual feedback (Online/Offline status pill).
* **Search & Filter:** Instant in-browser search to filter events by topic, technology stack, or speaker.
* **Zero Framework Bloat:** Pure, standard HTML5, CSS3, and modern Vanilla ES6+ JavaScript—easy to read, understand, and customize.

---

## 📁 Project Structure

```text
student-tech-hub/
├── frontend/
│   ├── index.html        # Clean, modern semantic HTML structure
│   ├── style.css         # Responsive styles, CSS variables, and modern cards
│   └── script.js         # Vanilla JS logic (fetch API, event handlers, validation)
├── backend/
│   ├── main.py           # FastAPI server with CORS, endpoints & data models
│   └── requirements.txt  # Python package dependencies (FastAPI, Uvicorn, Pydantic)
└── README.md             # Complete documentation and setup guide
```

---

## 🛠️ Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | HTML5, CSS3 (Flexbox & CSS Grid), Vanilla JavaScript (Fetch API, ES6+) |
| **Backend** | Python 3, FastAPI, Uvicorn (ASGI web server), Pydantic (data validation) |
| **Networking** | RESTful JSON API with CORS (Cross-Origin Resource Sharing) enabled |

---

## 🚀 Step-by-Step Installation & Quickstart

### Prerequisites

Make sure you have **Python 3.8+** installed on your system. You can verify your installation by running:
```bash
python --version
# or
python3 --version
```
*(If you do not have Python installed yet, download it from [python.org](https://www.python.org/downloads/) or via Windows Microsoft Store).*

---

### Step 1: Open the Project Directory

Open your terminal or command prompt (PowerShell on Windows, or Bash/Zsh on Mac/Linux) and navigate to the project directory:

```bash
cd "student techhub"
```

---

### Step 2: Set Up a Python Virtual Environment (Recommended)

Creating a virtual environment ensures project packages don't interfere with your global Python setup.

**On Windows (PowerShell / Command Prompt):**
```powershell
python -m venv venv
.\venv\Scripts\activate
```

**On macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

---

### Step 3: Install Backend Dependencies

Install the required Python libraries using `pip`:

```bash
pip install -r backend/requirements.txt
```

This installs:
* `fastapi` — Fast, intuitive modern Python web framework.
* `uvicorn[standard]` — High-performance ASGI server.
* `pydantic` — Data validation and settings management.

---

### Step 4: Run the FastAPI Backend Server

Start the backend server using Uvicorn:

```bash
uvicorn backend.main:app --reload --port 8000
```

*(Alternatively, you can change directory to `backend` and run `uvicorn main:app --reload`)*.

You should see output similar to:
```text
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Application startup complete.
```

Your backend is now live!
* **API Base URL:** `http://127.0.0.1:8000`
* **Interactive Swagger UI (Docs):** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **Alternative ReDoc UI:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

### Step 5: Launch the Frontend

You can run the frontend in any of the following beginner-friendly ways:

#### Option A: Direct Browser Launch (Simplest)
Navigate to the `frontend/` folder in your file explorer and double-click `index.html` to open it in Chrome, Edge, Safari, or Firefox.

#### Option B: VS Code Live Server Extension (Recommended for Development)
1. Open the project folder in **VS Code**.
2. Right-click `frontend/index.html`.
3. Click **"Open with Live Server"** (usually runs at `http://127.0.0.1:5500`).

#### Option C: Python Static HTTP Server
In a new terminal window:
```bash
cd frontend
python -m http.server 3000
```
Then visit [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser.

---

## 📡 API Endpoints Reference

### 1. Welcome Endpoint
* **Method:** `GET`
* **URL:** `http://127.0.0.1:8000/`
* **Description:** Health summary and quick links.

---

### 2. Get Upcoming Events
* **Method:** `GET`
* **URL:** `http://127.0.0.1:8000/api/events`
* **Description:** Returns an array of upcoming technical events.
* **Sample JSON Response:**
```json
[
  {
    "id": 1,
    "title": "Introduction to Web Development: HTML, CSS & JS",
    "category": "Frontend Workshop",
    "date": "October 15, 2026",
    "time": "4:00 PM - 6:00 PM",
    "location": "Tech Lab 3 / Zoom Hybrid",
    "speaker": "Sarah Jenkins (Frontend Lead)",
    "description": "Learn how the modern web works from scratch. Build and style your very first interactive web application.",
    "seats_left": 28
  },
  {
    "id": 2,
    "title": "Python & FastAPI: Building Your First Microservice",
    "category": "Backend Bootcamp",
    "date": "October 22, 2026",
    "time": "5:00 PM - 7:00 PM",
    "location": "Auditorium Hall B",
    "speaker": "David Chen (Cloud Architect)",
    "description": "Discover why FastAPI is one of the fastest growing web frameworks. Learn REST APIs, Pydantic, and async Python.",
    "seats_left": 15
  }
]
```

---

### 3. Register a Student
* **Method:** `POST`
* **URL:** `http://127.0.0.1:8000/api/register`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "name": "Alex Johnson",
  "email": "alex.johnson@university.edu",
  "event_title": "Python & FastAPI: Building Your First Microservice"
}
```
* **Sample JSON Response (201 Created):**
```json
{
  "success": true,
  "message": "Congratulations Alex Johnson! You have been successfully registered for Python & FastAPI: Building Your First Microservice.",
  "registration_id": 1,
  "registered_at": "2026-10-01 10:30:15",
  "student_name": "Alex Johnson",
  "student_email": "alex.johnson@university.edu",
  "event_title": "Python & FastAPI: Building Your First Microservice"
}
```

---

## 🔒 What is CORS and Why is it Enabled?

When the frontend runs on `http://127.0.0.1:5500` or `file:///` and tries to fetch data from `http://127.0.0.1:8000`, the web browser's security model blocks the request unless the backend explicitly permits it.

In `backend/main.py`, CORS is configured with:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],  # Allows GET, POST, OPTIONS, etc.
    allow_headers=["*"],
)
```
This ensures seamless, hassle-free communication between your frontend and backend regardless of port numbers or domains.

---

## 💡 Beginner Troubleshooting

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| **"Backend: Offline" badge in UI** | The FastAPI server is not currently running | Run `uvicorn backend.main:app --reload` in your terminal |
| **`python` command not recognized** | Python is not added to system PATH | Re-run the Python installer and check *"Add Python to PATH"*, or use `py` launcher |
| **Address already in use (port 8000)** | Another service is using port 8000 | Run on a different port: `uvicorn backend.main:app --reload --port 8001`, and update `API_BASE_URL` in `frontend/script.js` |
| **Cannot activate virtual environment on Windows** | PowerShell execution policy restricted | Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` in PowerShell, then activate again |

---

## 📄 License
This project is open-source and free to use for educational purposes. Happy Coding! 🚀
