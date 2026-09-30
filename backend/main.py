"""
Student Tech Hub - Backend API
A beginner-friendly FastAPI application providing endpoints for events and registrations.
"""

from typing import List, Optional
from datetime import datetime
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Initialize FastAPI application
app = FastAPI(
    title="Student Tech Hub API",
    description="A lightweight, beginner-friendly REST API for student tech events and registrations.",
    version="1.0.0",
)

# Configure CORS (Cross-Origin Resource Sharing)
# This allows our frontend running on any port (e.g. 5500, 3000, 8080 or file://)
# to make requests to this FastAPI backend running on port 8000.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all HTTP headers
)

# ---------------------------------------------------------
# Pydantic Data Models
# ---------------------------------------------------------

class Event(BaseModel):
    id: int
    title: str
    category: str
    date: str
    time: str
    location: str
    speaker: str
    description: str
    seats_left: int


class RegistrationRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full name of the student")
    email: str = Field(..., min_length=5, max_length=120, description="Valid email address of the student")
    event_title: Optional[str] = Field(default="General Registration", description="Event name (optional)")


class RegistrationResponse(BaseModel):
    success: bool
    message: str
    registration_id: int
    registered_at: str
    student_name: str
    student_email: str
    event_title: str


# ---------------------------------------------------------
# In-Memory Sample Data Store
# ---------------------------------------------------------

SAMPLE_EVENTS: List[dict] = [
    {
        "id": 1,
        "title": "Introduction to Web Development: HTML, CSS & JS",
        "category": "Frontend Workshop",
        "date": "October 15, 2026",
        "time": "4:00 PM - 6:00 PM",
        "location": "Tech Lab 3 / Zoom Hybrid",
        "speaker": "Sarah Jenkins (Frontend Lead)",
        "description": "Learn how the modern web works from scratch. Build and style your very first interactive web application.",
        "seats_left": 28,
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
        "seats_left": 15,
    },
    {
        "id": 3,
        "title": "Hands-On Generative AI & LLM Workshop",
        "category": "AI / ML Special",
        "date": "November 05, 2026",
        "time": "3:30 PM - 6:00 PM",
        "location": "Innovation Hub, Room 102",
        "speaker": "Dr. Elena Rostova (AI Researcher)",
        "description": "Explore practical prompt engineering, embeddings, and integrating intelligent AI assistants into student projects.",
        "seats_left": 10,
    },
    {
        "id": 4,
        "title": "Open Source 101: Making Your First Pull Request",
        "category": "Community Meetup",
        "date": "November 12, 2026",
        "time": "4:30 PM - 6:30 PM",
        "location": "Student Commons Lounge",
        "speaker": "Marcus Vance (Open Source Maintainer)",
        "description": "A beginner-guided session on Git, GitHub workflows, fork & PR etiquette, and finding beginner-friendly issues.",
        "seats_left": 35,
    },
    {
        "id": 5,
        "title": "Annual 24-Hour Student Hackathon 2026",
        "category": "Hackathon",
        "date": "November 28-29, 2026",
        "time": "Kickoff 10:00 AM",
        "location": "Campus Engineering Quad & Online",
        "speaker": "Hackathon Organizing Committee",
        "description": "Form teams of up to 4, build innovative hardware or software solutions, and compete for exciting prizes and mentorship.",
        "seats_left": 50,
    },
    {
        "id": 6,
        "title": "Cloud Computing Essentials with Docker & Kubernetes",
        "category": "DevOps & Cloud",
        "date": "December 03, 2026",
        "time": "5:00 PM - 7:00 PM",
        "location": "Computer Lab 5",
        "speaker": "Priya Patel (DevOps Engineer)",
        "description": "Containerize your applications with Docker, understand cloud deployments, and demystify container orchestration.",
        "seats_left": 22,
    },
]

# In-memory registrations store for tracking submissions during runtime
registrations_db: List[dict] = []

# ---------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------

@app.get("/", tags=["Root"])
def root_endpoint():
    """Welcome endpoint with quick links to interactive docs."""
    return {
        "status": "online",
        "app": "Student Tech Hub API",
        "version": "1.0.0",
        "endpoints": {
            "get_events": "/api/events",
            "register_student": "/api/register (POST)",
            "documentation": "/docs",
        },
        "message": "Welcome to Student Tech Hub backend API! Visit /docs to test endpoints interactively.",
    }


@app.get("/api/events", response_model=List[Event], tags=["Events"])
def get_events():
    """
    GET /api/events
    Returns a list of all upcoming technical events.
    """
    return SAMPLE_EVENTS


@app.post("/api/register", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED, tags=["Registration"])
def register_student(payload: RegistrationRequest):
    """
    POST /api/register
    Accepts student's name and email, validates them, and registers the student.
    """
    name = payload.name.strip()
    email = payload.email.strip().lower()

    # Basic email format check
    if "@" not in email or "." not in email:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please provide a valid email address.",
        )

    # Simple name validation
    if len(name) < 2:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Student name must be at least 2 characters long.",
        )

    # Check for duplicate registration for the same event
    for reg in registrations_db:
        if reg["student_email"] == email and reg["event_title"] == payload.event_title:
            return RegistrationResponse(
                success=True,
                message=f"Welcome back, {name}! You are already registered for '{payload.event_title}'.",
                registration_id=reg["registration_id"],
                registered_at=reg["registered_at"],
                student_name=name,
                student_email=email,
                event_title=payload.event_title,
            )

    registration_record = {
        "registration_id": len(registrations_db) + 1,
        "registered_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "student_name": name,
        "student_email": email,
        "event_title": payload.event_title or "General Registration",
    }

    registrations_db.append(registration_record)

    return RegistrationResponse(
        success=True,
        message=f"Congratulations {name}! You have been successfully registered for {payload.event_title or 'Student Tech Hub'}.",
        registration_id=registration_record["registration_id"],
        registered_at=registration_record["registered_at"],
        student_name=name,
        student_email=email,
        event_title=registration_record["event_title"],
    )


@app.get("/api/registrations", tags=["Registration"])
def list_registrations():
    """
    GET /api/registrations
    Helper endpoint to view current registrations in memory.
    """
    return {
        "total_registrations": len(registrations_db),
        "registrations": registrations_db,
    }


@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint to test backend connectivity."""
    return {"status": "ok", "timestamp": datetime.now().isoformat()}


if __name__ == "__main__":
    import uvicorn
    # Allows running directly via `python main.py` or `python backend/main.py`
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
