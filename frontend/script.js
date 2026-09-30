/**
 * Student Tech Hub - Frontend Logic (Vanilla JavaScript)
 * Communicates with FastAPI backend running at http://127.0.0.1:8000
 */

// Configuration: Backend API Base URL
const API_BASE_URL = 'http://127.0.0.1:8000';

// Global state
let currentEvents = [];
let backendOnline = false;

// DOM Elements
const eventsGrid = document.getElementById('events-grid');
const btnLoadEvents = document.getElementById('btn-load-events');
const btnHeroLoad = document.getElementById('btn-hero-load');
const eventSearchInput = document.getElementById('event-search-input');
const eventSelect = document.getElementById('event-select');
const registrationForm = document.getElementById('registration-form');
const studentNameInput = document.getElementById('student-name');
const studentEmailInput = document.getElementById('student-email');
const nameError = document.getElementById('name-error');
const emailError = document.getElementById('email-error');
const btnSubmitRegistration = document.getElementById('btn-submit-registration');
const formAlert = document.getElementById('form-alert');
const eventsNotification = document.getElementById('events-notification');
const sessionRegistrations = document.getElementById('session-registrations');
const confirmedList = document.getElementById('confirmed-list');
const backendStatus = document.getElementById('backend-status');
const backendStatusText = document.getElementById('backend-status-text');

// ---------------------------------------------------------------------------
// 1. Backend Connectivity & Health Check
// ---------------------------------------------------------------------------

/**
 * Checks if the FastAPI backend is running and updates UI pill indicator.
 */
async function checkBackendHealth() {
  const dot = backendStatus.querySelector('.status-dot');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      backendOnline = true;
      dot.className = 'status-dot status-online';
      backendStatusText.textContent = 'Backend: Online';
      backendStatus.title = 'FastAPI backend is connected at ' + API_BASE_URL;
      return true;
    }
  } catch (err) {
    backendOnline = false;
    dot.className = 'status-dot status-offline';
    backendStatusText.textContent = 'Backend: Offline';
    backendStatus.title = `Cannot reach ${API_BASE_URL}. Click to recheck.`;
    return false;
  }
}

// ---------------------------------------------------------------------------
// 2. Fetch Events (GET /api/events)
// ---------------------------------------------------------------------------

/**
 * Renders skeleton placeholder cards while events are loading.
 */
function renderSkeletonLoading() {
  eventsGrid.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton-card';
    skeleton.innerHTML = `
      <div style="display: flex; justify-content: space-between;">
        <div class="skeleton-box" style="width: 100px; height: 24px;"></div>
        <div class="skeleton-box" style="width: 60px; height: 24px;"></div>
      </div>
      <div class="skeleton-box" style="width: 80%; height: 28px; margin-top: 8px;"></div>
      <div class="skeleton-box" style="width: 60%; height: 16px;"></div>
      <div class="skeleton-box" style="width: 100%; height: 50px;"></div>
      <div class="skeleton-box" style="width: 100%; height: 36px; margin-top: 10px;"></div>
    `;
    eventsGrid.appendChild(skeleton);
  }
}

/**
 * Fetches events list from GET /api/events on the backend.
 */
async function loadEvents(isUserAction = false) {
  // Start button spin animation if clicked manually
  const spinIcon = btnLoadEvents.querySelector('.spin-icon');
  if (spinIcon) spinIcon.classList.add('spinning');
  renderSkeletonLoading();
  hideNotification();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${API_BASE_URL}/api/events`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
    }

    const events = await response.json();
    currentEvents = events;
    backendOnline = true;

    // Update connection status
    checkBackendHealth();

    // Render events cards
    renderEvents(currentEvents);

    // Populate registration dropdown with event titles
    updateEventDropdown(currentEvents);

    if (isUserAction) {
      showNotification(`Successfully loaded ${events.length} upcoming events from FastAPI backend!`, 'success');
    }
  } catch (error) {
    console.warn('Could not load events from live backend:', error.message);
    backendOnline = false;
    checkBackendHealth();

    showOfflineFallback(error.message);
  } finally {
    if (spinIcon) spinIcon.classList.remove('spinning');
  }
}

/**
 * Renders event cards into the events grid.
 */
function renderEvents(events) {
  eventsGrid.innerHTML = '';

  if (!events || events.length === 0) {
    eventsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: white; border-radius: 12px; border: 1px dashed var(--border);">
        <p style="font-size: 1.1rem; color: var(--text-muted); font-weight: 600;">No events match your search.</p>
        <button onclick="document.getElementById('event-search-input').value = ''; renderEvents(currentEvents);" class="btn btn-outline btn-sm" style="margin-top: 1rem;">
          Reset Filter
        </button>
      </div>
    `;
    return;
  }

  events.forEach(event => {
    const card = document.createElement('article');
    card.className = 'event-card';

    // Map category to CSS class badge
    const catClass = getCategoryClass(event.category);

    card.innerHTML = `
      <div class="card-top">
        <span class="category-badge ${catClass}">${escapeHtml(event.category)}</span>
        <span class="seats-badge">${event.seats_left} seats open</span>
      </div>

      <h3 class="event-title">${escapeHtml(event.title)}</h3>

      <div class="event-meta">
        <div class="meta-row">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span><strong>${escapeHtml(event.date)}</strong> &bull; ${escapeHtml(event.time)}</span>
        </div>
        <div class="meta-row">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>${escapeHtml(event.location)}</span>
        </div>
      </div>

      <p class="event-desc">${escapeHtml(event.description)}</p>

      <div class="card-footer">
        <span class="speaker-info" title="Lead / Speaker: ${escapeHtml(event.speaker)}">
          🎤 ${escapeHtml(event.speaker)}
        </span>
        <button 
          class="btn btn-primary btn-sm btn-register-card" 
          data-title="${escapeHtml(event.title)}"
        >
          Register &rarr;
        </button>
      </div>
    `;

    // Hook up card register button to scroll and select event
    const regBtn = card.querySelector('.btn-register-card');
    regBtn.addEventListener('click', () => {
      selectEventAndScroll(event.title);
    });

    eventsGrid.appendChild(card);
  });
}

/**
 * Handles offline / error state when backend is not running.
 */
function showOfflineFallback(errorMessage) {
  eventsGrid.innerHTML = `
    <div style="grid-column: 1 / -1; background: white; border: 1.5px solid var(--danger-border); border-radius: 16px; padding: 2.5rem; text-align: center; box-shadow: var(--shadow-sm);">
      <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">⚡</div>
      <h3 style="font-size: 1.35rem; color: var(--text-main); margin-bottom: 0.75rem;">FastAPI Backend Not Reachable</h3>
      <p style="color: var(--text-muted); max-width: 600px; margin: 0 auto 1.5rem; font-size: 0.95rem;">
        The frontend is looking for the backend server at <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${API_BASE_URL}</code>.
      </p>
      
      <div style="background: #0f172a; color: #f8fafc; border-radius: 8px; padding: 1rem; max-width: 520px; margin: 0 auto 1.5rem; text-align: left; font-family: monospace; font-size: 0.88rem;">
        <span style="color: #94a3b8;"># In your terminal, run:</span><br>
        <span style="color: #38bdf8;">cd</span> backend<br>
        <span style="color: #38bdf8;">pip</span> install -r requirements.txt<br>
        <span style="color: #4ade80;">uvicorn</span> main:app --reload
      </div>

      <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
        <button id="btn-retry-backend" class="btn btn-primary">
          🔄 Retry Backend Connection
        </button>
        <button id="btn-load-sample-offline" class="btn btn-secondary">
          View Demo Events Offline
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-retry-backend')?.addEventListener('click', () => loadEvents(true));
  document.getElementById('btn-load-sample-offline')?.addEventListener('click', loadSampleOfflineEvents);
}

/**
 * Fallback to display mock events if backend is not yet started,
 * allowing instant exploration of the UI.
 */
function loadSampleOfflineEvents() {
  const offlineSample = [
    {
      id: 1,
      title: "Introduction to Web Development: HTML, CSS & JS",
      category: "Frontend Workshop",
      date: "October 15, 2026",
      time: "4:00 PM - 6:00 PM",
      location: "Tech Lab 3 / Hybrid",
      speaker: "Sarah Jenkins",
      description: "Learn how the modern web works from scratch. Build and style your very first interactive web application.",
      seats_left: 28,
    },
    {
      id: 2,
      title: "Python & FastAPI: Building Your First Microservice",
      category: "Backend Bootcamp",
      date: "October 22, 2026",
      time: "5:00 PM - 7:00 PM",
      location: "Auditorium Hall B",
      speaker: "David Chen",
      description: "Discover why FastAPI is one of the fastest growing web frameworks. Learn REST APIs, Pydantic, and async Python.",
      seats_left: 15,
    },
    {
      id: 3,
      title: "Hands-On Generative AI & LLM Workshop",
      category: "AI / ML Special",
      date: "November 05, 2026",
      time: "3:30 PM - 6:00 PM",
      location: "Innovation Hub Room 102",
      speaker: "Dr. Elena Rostova",
      description: "Explore practical prompt engineering, embeddings, and integrating intelligent AI assistants into student projects.",
      seats_left: 10,
    }
  ];

  currentEvents = offlineSample;
  renderEvents(offlineSample);
  updateEventDropdown(offlineSample);
  showNotification('Showing offline demo events. Start your FastAPI server to sync live backend data.', 'info');
}

/**
 * Updates the registration dropdown with event titles.
 */
function updateEventDropdown(events) {
  eventSelect.innerHTML = '<option value="General Tech Hub Membership">General Tech Hub Membership</option>';
  events.forEach(event => {
    const opt = document.createElement('option');
    opt.value = event.title;
    opt.textContent = `${event.title} (${event.date})`;
    eventSelect.appendChild(opt);
  });
}

/**
 * Pre-selects an event and smoothly scrolls to the registration form.
 */
function selectEventAndScroll(eventTitle) {
  let matched = false;
  for (let i = 0; i < eventSelect.options.length; i++) {
    if (eventSelect.options[i].value === eventTitle) {
      eventSelect.selectedIndex = i;
      matched = true;
      break;
    }
  }

  // If not found in dropdown, add it dynamically
  if (!matched) {
    const newOpt = document.createElement('option');
    newOpt.value = eventTitle;
    newOpt.textContent = eventTitle;
    eventSelect.appendChild(newOpt);
    eventSelect.value = eventTitle;
  }

  // Smooth scroll to form
  const registerSection = document.getElementById('register');
  registerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Focus student name input
  setTimeout(() => studentNameInput.focus(), 400);
}

// ---------------------------------------------------------------------------
// 3. Search & Filter Events
// ---------------------------------------------------------------------------

eventSearchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  if (!query) {
    renderEvents(currentEvents);
    return;
  }

  const filtered = currentEvents.filter(ev => 
    ev.title.toLowerCase().includes(query) ||
    ev.category.toLowerCase().includes(query) ||
    ev.description.toLowerCase().includes(query) ||
    ev.speaker.toLowerCase().includes(query)
  );

  renderEvents(filtered);
});

// ---------------------------------------------------------------------------
// 4. Registration Form (POST /api/register)
// ---------------------------------------------------------------------------

/**
 * Validates inputs client-side before sending HTTP request.
 */
function validateRegistrationForm(name, email) {
  let isValid = true;
  nameError.textContent = '';
  emailError.textContent = '';
  studentNameInput.classList.remove('input-error');
  studentEmailInput.classList.remove('input-error');

  if (!name || name.trim().length < 2) {
    nameError.textContent = 'Please enter a student name (at least 2 characters).';
    studentNameInput.classList.add('input-error');
    isValid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    emailError.textContent = 'Please enter a valid email address (e.g., student@domain.com).';
    studentEmailInput.classList.add('input-error');
    isValid = false;
  }

  return isValid;
}

/**
 * Handles form submission: sends POST /api/register to FastAPI backend.
 */
registrationForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = studentNameInput.value.trim();
  const email = studentEmailInput.value.trim();
  const eventTitle = eventSelect.value;

  if (!validateRegistrationForm(name, email)) {
    return;
  }

  // Set loading state on submit button
  setSubmitting(true);
  hideFormAlert();

  const payload = {
    name: name,
    email: email,
    event_title: eventTitle,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Show success alert
      showFormAlert(
        `🎉 <strong>Success!</strong> ${escapeHtml(data.message)}<br>` +
        `<small style="opacity: 0.85;">Confirmation ID: #${data.registration_id} &bull; Registered at: ${data.registered_at}</small>`,
        'success'
      );

      // Add to session confirmed registrations list
      addConfirmedRegistration(name, eventTitle, data.registered_at);

      // Reset form
      registrationForm.reset();
      eventSelect.value = "General Tech Hub Membership";
    } else {
      // Server returned validation error (422) or detail
      const errorMsg = data.detail || data.message || 'Registration failed. Please check your information.';
      showFormAlert(`⚠️ <strong>Registration Error:</strong> ${escapeHtml(errorMsg)}`, 'error');
    }
  } catch (error) {
    console.error('Registration network error:', error);
    showFormAlert(
      `❌ <strong>Could not reach the backend API at ${API_BASE_URL}.</strong><br>` +
      `Make sure your FastAPI server is running with: <code style="background: rgba(0,0,0,0.1); padding: 2px 4px; border-radius: 3px;">uvicorn backend.main:app --reload</code>`,
      'error'
    );
  } finally {
    setSubmitting(false);
  }
});

function setSubmitting(isSubmitting) {
  const btnText = btnSubmitRegistration.querySelector('.btn-text');
  const btnSpinner = btnSubmitRegistration.querySelector('.btn-spinner');

  if (isSubmitting) {
    btnSubmitRegistration.disabled = true;
    btnText.textContent = 'Registering...';
    btnSpinner.style.display = 'inline-block';
  } else {
    btnSubmitRegistration.disabled = false;
    btnText.textContent = 'Complete Registration';
    btnSpinner.style.display = 'none';
  }
}

function showFormAlert(htmlMessage, type = 'success') {
  formAlert.innerHTML = htmlMessage;
  formAlert.className = `alert-box alert-${type}`;
  formAlert.style.display = 'block';
}

function hideFormAlert() {
  formAlert.style.display = 'none';
  formAlert.innerHTML = '';
}

function addConfirmedRegistration(name, eventTitle, time) {
  sessionRegistrations.style.display = 'block';
  const li = document.createElement('li');
  li.innerHTML = `
    <div>
      <span class="reg-name">${escapeHtml(name)}</span>
      <div style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(time || 'Just now')}</div>
    </div>
    <span class="reg-event">${escapeHtml(eventTitle)}</span>
  `;
  confirmedList.prepend(li);
}

// ---------------------------------------------------------------------------
// 5. Notification & Helpers
// ---------------------------------------------------------------------------

function showNotification(message, type = 'info') {
  eventsNotification.innerHTML = `
    <span>${message}</span>
    <button onclick="document.getElementById('events-notification').style.display='none'" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: inherit;">&times;</button>
  `;
  eventsNotification.className = `notification-banner ${type}`;
  eventsNotification.style.display = 'flex';
}

function hideNotification() {
  eventsNotification.style.display = 'none';
}

function getCategoryClass(category) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('workshop')) return 'category-workshop';
  if (cat.includes('bootcamp')) return 'category-bootcamp';
  if (cat.includes('ai') || cat.includes('ml')) return 'category-ai';
  if (cat.includes('hackathon')) return 'category-hackathon';
  if (cat.includes('community')) return 'category-community';
  if (cat.includes('cloud') || cat.includes('devops')) return 'category-devops';
  return 'category-default';
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---------------------------------------------------------------------------
// 6. Initialization
// ---------------------------------------------------------------------------

// Event listeners for action buttons
btnLoadEvents.addEventListener('click', () => loadEvents(true));
btnHeroLoad.addEventListener('click', () => {
  const eventsSec = document.getElementById('events');
  eventsSec.scrollIntoView({ behavior: 'smooth' });
  loadEvents(true);
});

backendStatus.addEventListener('click', () => {
  checkBackendHealth().then(online => {
    if (online) {
      loadEvents(true);
    } else {
      showOfflineFallback('Backend is offline.');
    }
  });
});

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
  checkBackendHealth();
  loadEvents(false);
});
