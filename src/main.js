import './style.css'
import { stylists, models } from './data.js'
import salonHero from './assets/salon_hero.png'

// Application State
const state = {
  activeView: 'landing', // 'landing' | 'stylists' | 'models' | 'bookings'
  bookings: JSON.parse(localStorage.getItem('bl_bookings')) || [],
  selectedStylist: null,
  isModalOpen: false,
  currentStep: 1, // 0: Select Stylist (Direct Booking), 1: Select Services, 2: Date/Time/Form, 3: Success Ticket
  selectedServices: [],
  selectedDate: null,
  selectedTime: null,
  calendarDate: new Date(),
  latestBooking: null
}

// Save bookings to localStorage
function saveBookings() {
  localStorage.setItem('bl_bookings', JSON.stringify(state.bookings))
}

// Generate a random ticket code
function generateTicketCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'BL-'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// DOM Elements
const app = document.querySelector('#app')

// Helper for UI icons
const icons = {
  star: `<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`,
  specialty: `<svg viewBox="0 0 24 24"><path d="M9 11.75c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.34.75.75-.34.75-.75.75zm9 0c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.34.75.75-.34.75-.75.75zm-4.5 0c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.34.75.75-.34.75-.75.75zM22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 3h5v5h-5z"/></svg>`,
  clock: `<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`,
  user: `<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
  trash: `<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
  scissorsLogo: `<svg viewBox="0 0 24 24"><path d="M9.64 7.64c.23-.5.36-1.05.36-1.64C10 3.79 8.21 2 6 2S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l2.36 2.36c-.23.5-.36 1.05-.36 1.64 0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4c-.59 0-1.14.13-1.64.36L14 12l2.36-2.36c.5.23 1.05.36 1.64.36 2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4c0 .59.13 1.14.36 1.64L12 10l-2.36-2.36zM6 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm12 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM6 18c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM18 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/></svg>`
}

// Main Render Loop
function renderApp() {
  app.innerHTML = `
    <!-- Glow Blobs for Liquid Design -->
    <div class="glow-blob glow-blob-1"></div>
    <div class="glow-blob glow-blob-2"></div>

    <!-- Sticky Glass Navbar -->
    <nav class="navbar">
      <div class="nav-logo" style="cursor: pointer;" id="logo-btn">
        ${icons.scissorsLogo}
        <span>Bangalore Luxury</span>
      </div>
      <button class="menu-btn" id="menu-btn" aria-label="Toggle Menu">&#9776;</button>
      <ul class="nav-links" id="nav-links">
        <li class="nav-link ${state.activeView === 'landing' ? 'active' : ''}" id="nav-home">Home</li>
        <li class="nav-link ${state.activeView === 'stylists' ? 'active' : ''}" id="nav-stylists">Stylists</li>
        <li class="nav-link ${state.activeView === 'models' ? 'active' : ''}" id="nav-models">Models</li>
        <li class="nav-link" id="nav-book-shortcut">Book Experience</li>
        <li class="nav-link ${state.activeView === 'bookings' ? 'active' : ''}" id="nav-bookings">My Bookings</li>
      </ul>
    </nav>

    <!-- Main Content Area -->
    <main>
      ${renderActiveView()}
    </main>

    <!-- Dynamic Modal Drawer for details and booking -->
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal-container">
        <button class="modal-close-btn" id="modal-close-btn">&times;</button>
        <div id="modal-content-body">
          ${state.isModalOpen ? renderModalContent() : ''}
        </div>
      </div>
    </div>
  `

  attachGlobalEventListeners()
}

function renderActiveView() {
  switch (state.activeView) {
    case 'landing':
      return renderLandingView()
    case 'stylists':
      return renderStylistsView()
    case 'models':
      return renderModelsView()
    case 'bookings':
      return renderBookingsView()
    default:
      return renderLandingView()
  }
}

// ----------------------------------------------------
// Landing View (Entire page dedicated to title showing)
// ----------------------------------------------------
function renderLandingView() {
  return `
    <section class="landing-view">
      <div class="landing-bg" style="background-image: url('${salonHero}');"></div>
      <div class="landing-overlay"></div>
      <div class="landing-content">
        <h4 class="landing-subtitle">Couture Beauty House</h4>
        <h1 class="landing-title">Bangalore Luxury</h1>
        <p class="landing-desc">Step into Bangalore's premier salon sanctuary. Experience unparalleled hair sculpting, custom color formulations, and rejuvenating dermal therapies curated by our award-winning artisans.</p>
        <div class="landing-actions">
          <button class="btn-primary" id="landing-explore-btn">Meet Our Stylists</button>
          <button class="btn-glass" id="landing-book-btn">Reserve Appointment</button>
        </div>
      </div>
    </section>
  `
}

// ----------------------------------------------------
// Stylists Grid View
// ----------------------------------------------------
function renderStylistsView() {
  return `
    <section class="section-container stylists-view">
      <div class="section-header">
        <h4 class="section-subtitle">Our Elite Artisans</h4>
        <h2 class="section-title">Master Stylists & Therapists</h2>
      </div>
      <div class="stylist-grid">
        ${stylists.map(stylist => renderStylistCard(stylist)).join('')}
      </div>
    </section>
  `
}

function renderStylistCard(stylist) {
  return `
    <div class="stylist-card glass-panel" data-id="${stylist.id}">
      <div class="stylist-img-container">
        <img src="${stylist.image}" alt="${stylist.name}" loading="lazy">
        <div class="stylist-img-overlay"></div>
        <div class="stylist-rating-badge">
          ${icons.star}
          <span>${stylist.rating.toFixed(1)}</span>
        </div>
      </div>
      <div class="stylist-info">
        <div>
          <h3 class="stylist-name">${stylist.name}</h3>
          <p class="stylist-role">${stylist.role}</p>
        </div>
        <div class="stylist-specialty">
          ${icons.specialty}
          <span>${stylist.specialization}</span>
        </div>
      </div>
    </div>
  `
}

// ----------------------------------------------------
// Models View (Showcase gallery)
// ----------------------------------------------------
function renderModelsView() {
  return `
    <section class="section-container stylists-view">
      <div class="section-header">
        <h4 class="section-subtitle">Luxury Hair Portfolio</h4>
        <h2 class="section-title">Serviced Masterpieces</h2>
      </div>
      <div class="models-grid">
        ${models.map(model => renderModelCard(model)).join('')}
      </div>
    </section>
  `
}

function renderModelCard(model) {
  return `
    <div class="model-card" data-model-id="${model.id}">
      <span class="model-ethnicity-badge">${model.ethnicity}</span>
      <div class="model-img-container">
        <img src="${model.image}" alt="${model.style}" loading="lazy">
      </div>
      <div class="model-overlay-hover">
        <h3 class="model-style-title">${model.style}</h3>
        <p class="model-stylist-tag">Serviced by ${model.stylistName}</p>
        <p class="model-desc-text">${model.desc}</p>
        <button class="btn-primary btn-model-book" data-model-id="${model.id}">Get This Look</button>
      </div>
    </div>
  `
}

// ----------------------------------------------------
// Bookings History Dashboard Component
// ----------------------------------------------------
function renderBookingsView() {
  const activeBookings = state.bookings

  return `
    <div class="section-container bookings-section">
      <div class="section-header">
        <h4 class="section-subtitle">Your Schedule</h4>
        <h2 class="section-title">Luxury Engagements</h2>
      </div>
      <div class="bookings-grid">
        ${activeBookings.length === 0 ? renderNoBookings() : activeBookings.map((b, index) => renderBookingCard(b, index)).join('')}
      </div>
    </div>
  `
}

function renderNoBookings() {
  return `
    <div class="no-bookings glass-panel">
      <div class="no-bookings-icon">
        <svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 3h5v5h-5z"/></svg>
      </div>
      <h3>No Engagements Found</h3>
      <p>No active reservations are scheduled. Book an indulgence with our master stylists today.</p>
      <button class="btn-primary" id="bookings-book-btn">Schedule Appointment</button>
    </div>
  `
}

function renderBookingCard(booking, index) {
  const dateObj = new Date(booking.date)
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const totalPrice = booking.services.reduce((sum, s) => sum + s.price, 0)

  return `
    <div class="booking-card glass-panel">
      <div class="booking-card-header">
        <div>
          <h3 class="booking-card-stylist">${booking.stylistName}</h3>
          <p class="booking-card-service">${booking.services.map(s => s.name).join(', ')}</p>
        </div>
        <span class="booking-card-status">Confirmed</span>
      </div>
      <div class="booking-card-details">
        <div class="booking-card-detail">
          ${icons.calendar}
          <span>${formattedDate}</span>
        </div>
        <div class="booking-card-detail">
          ${icons.clock}
          <span>${booking.time}</span>
        </div>
        <div class="booking-card-detail">
          ${icons.user}
          <span>Guest: ${booking.guestName} (${booking.guestPhone})</span>
        </div>
        <div class="booking-card-detail" style="margin-top: 5px;">
          <span style="font-weight: 600; color: var(--accent-gold);">Total Amount: Rs. ${totalPrice.toLocaleString()}</span>
        </div>
      </div>
      <div class="booking-card-actions">
        <button class="btn-cancel" data-index="${index}">Cancel Booking</button>
      </div>
    </div>
  `
}

// ----------------------------------------------------
// Modal Drawer Rendering (Details & Scheduling Wizard)
// ----------------------------------------------------
function renderModalContent() {
  const stylist = state.selectedStylist
  const isDirectBookingStylistSelection = state.currentStep === 0

  return `
    <div class="modal-body">
      <!-- Left Profile Pane (Hide in Step 0 or Success Screen) -->
      ${(state.currentStep !== 3 && stylist) ? `
        <div class="modal-profile-section">
          <div class="modal-profile-img">
            <img src="${stylist.image}" alt="${stylist.name}">
          </div>
          <h3 class="modal-profile-name">${stylist.name}</h3>
          <p class="modal-profile-role">${stylist.role}</p>
          
          <div class="modal-rating-stats">
            ${icons.star}
            <strong>${stylist.rating.toFixed(1)}</strong>
            <span>(${stylist.reviews} reviews)</span>
          </div>

          <p class="modal-bio">${stylist.bio}</p>

          <div class="modal-skills-box">
            <h4 class="modal-section-title">Specialties</h4>
            <div class="skills-tags">
              ${stylist.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Right Selection/Details Pane -->
      <div class="modal-details-section" style="${(state.currentStep === 3 || isDirectBookingStylistSelection) ? 'grid-column: span 2;' : ''}">
        ${renderWizardStep()}
      </div>
    </div>
  `
}

function renderWizardStep() {
  const stylist = state.selectedStylist
  if (state.currentStep !== 0 && !stylist) return ''
  
  if (state.currentStep === 0) {
    // Direct booking stylist selector (Step 0)
    return `
      <div class="modal-details-header">
        <h3>Choose Your Artisan</h3>
        <p>Select a master stylist or therapist to start scheduling your experience.</p>
      </div>
      <div class="stylist-select-list">
        ${stylists.map(s => `
          <div class="stylist-select-item glass-panel" data-select-stylist-id="${s.id}">
            <div class="stylist-select-avatar">
              <img src="${s.image}" alt="${s.name}">
            </div>
            <div class="stylist-select-info">
              <h4 class="stylist-select-name">${s.name}</h4>
              <p class="stylist-select-role">${s.role}</p>
            </div>
            <div class="stylist-select-rating">
              ${icons.star}
              <span>${s.rating.toFixed(1)}</span>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="wizard-footer">
        <button class="btn-glass" id="wizard-step0-cancel">Cancel</button>
        <div></div>
      </div>
    `
  } else if (state.currentStep === 1) {
    // Step 1: Select Services
    return `
      <div class="modal-details-header">
        <h3>Select Indulgences</h3>
        <p>Curated services provided by ${stylist.name}. Choose one or more.</p>
      </div>
      <div class="services-list">
        ${stylist.services.map(service => {
          const isChecked = state.selectedServices.some(s => s.id === service.id)
          return `
            <div class="service-item glass-panel ${isChecked ? 'selected' : ''}" data-service-id="${service.id}" style="${isChecked ? 'background: rgba(197, 168, 128, 0.08); border-color: var(--accent-gold);' : ''}">
              <input type="checkbox" class="service-checkbox" ${isChecked ? 'checked' : ''}>
              <div class="service-info">
                <p class="service-name">${service.name}</p>
                <p class="service-duration">${service.duration}</p>
              </div>
              <div class="service-price">Rs. ${service.price.toLocaleString()}</div>
            </div>
          `
        }).join('')}
      </div>
      <div class="wizard-footer">
        ${state.bookings.length > 0 || state.selectedStylist ? `<button class="btn-glass" id="wizard-step1-back">Back</button>` : '<div></div>'}
        <button class="btn-primary" id="wizard-step1-next" ${state.selectedServices.length === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
          Select Date & Time
        </button>
      </div>
    `
  } else if (state.currentStep === 2) {
    // Step 2: Date, Time & Details
    const totalPrice = state.selectedServices.reduce((sum, s) => sum + s.price, 0)
    return `
      <div class="modal-details-header">
        <h3>Schedule Indulgence</h3>
        <p>${state.selectedServices.map(s => s.name).join(', ')} (Rs. ${totalPrice.toLocaleString()})</p>
      </div>

      <!-- Custom Interactive Calendar -->
      <div class="calendar-widget">
        <div class="calendar-header">
          <span class="calendar-title" id="calendar-title-text"></span>
          <div style="display: flex; gap: 8px;">
            <button class="calendar-nav-btn" id="cal-prev" type="button">&lt;</button>
            <button class="calendar-nav-btn" id="cal-next" type="button">&gt;</button>
          </div>
        </div>
        <div class="calendar-weekdays">
          <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
        </div>
        <div class="calendar-days" id="calendar-days-container">
          <!-- Populated Dynamically -->
        </div>
      </div>

      <!-- Time Slots Grid -->
      <div class="timeslots-container">
        <h4 class="timeslots-title">Available Hours</h4>
        <div class="timeslots-grid">
          ${stylist.availableHours.map(hour => {
            const isSelected = state.selectedTime === hour
            const isToday = state.selectedDate === getTodayString()
            const isPast = isToday && isTimeHourPast(hour)
            return `
              <button type="button" class="timeslot-btn ${isSelected ? 'selected' : ''} ${isPast ? 'disabled' : ''}" 
                data-time="${hour}" 
                ${isPast ? 'disabled style="opacity: 0.25; cursor: not-allowed;"' : ''}>
                ${hour}
              </button>
            `
          }).join('')}
        </div>
      </div>

      <!-- Contact Details Form -->
      <div class="guest-details-form">
        <h4 class="timeslots-title">Guest Credentials</h4>
        <div class="form-group">
          <label class="form-label" for="guest-name">Full Name</label>
          <input type="text" id="guest-name" class="form-input" placeholder="Aarav Sharma" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="guest-phone">Contact Number</label>
          <input type="tel" id="guest-phone" class="form-input" placeholder="+91 98765 43210" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="guest-email">Email (Optional)</label>
          <input type="email" id="guest-email" class="form-input" placeholder="aarav@luxury.in">
        </div>
      </div>

      <div class="wizard-footer">
        <button class="btn-glass" id="wizard-step2-back">Back</button>
        <button class="btn-primary" id="wizard-confirm-booking" disabled style="opacity: 0.5; cursor: not-allowed;">
          Confirm Booking
        </button>
      </div>
    `
  } else if (state.currentStep === 3) {
    // Step 3: Success Ticket Receipt
    const booking = state.latestBooking
    if (!booking) return ''

    const dateObj = new Date(booking.date)
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })

    const totalPrice = booking.services.reduce((sum, s) => sum + s.price, 0)

    return `
      <div style="text-align: center; max-width: 450px; margin: 0 auto; padding: 10px 0;">
        <h2 style="color: var(--accent-gold); margin-bottom: 8px;">Reservations Secured</h2>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 25px;">Your luxurious grooming sequence has been locked in. Show this receipt upon arrival.</p>
        
        <!-- Luxury Glass Ticket -->
        <div class="ticket-container">
          <div class="ticket">
            <div class="ticket-header">
              <div class="ticket-salon-name">Bangalore Luxury</div>
              <div class="ticket-title">SPA & SALON TICKET</div>
            </div>
            
            <div class="ticket-details">
              <div class="ticket-row">
                <span class="ticket-label">Stylist</span>
                <span class="ticket-value" style="font-weight: 600;">${booking.stylistName}</span>
              </div>
              <div class="ticket-row">
                <span class="ticket-label">Date</span>
                <span class="ticket-value">${formattedDate}</span>
              </div>
              <div class="ticket-row">
                <span class="ticket-label">Time Slot</span>
                <span class="ticket-value">${booking.time}</span>
              </div>
              <div class="ticket-row">
                <span class="ticket-label">Services</span>
                <span class="ticket-value">${booking.services.map(s => s.name).join(', ')}</span>
              </div>
              <div class="ticket-row" style="border-top: 1px solid rgba(197, 168, 128, 0.15); padding-top: 10px; margin-top: 5px;">
                <span class="ticket-label" style="font-weight: 600;">Grand Total</span>
                <span class="ticket-value ticket-value-highlight">Rs. ${totalPrice.toLocaleString()}</span>
              </div>
            </div>
            
            <div class="ticket-barcode">
              <div class="ticket-barcode-lines"></div>
              <div class="ticket-code">${booking.ticketCode}</div>
            </div>
          </div>
        </div>

        <button class="btn-primary btn-full" id="success-view-bookings-btn" style="margin-top: 25px;">
          View My Schedule
        </button>
      </div>
    `
  }
  return ''
}

// ----------------------------------------------------
// Glassy grow-out-of-card animation implementation
// ----------------------------------------------------
function openGlassyModal(clickedCardElement = null, isDirectSelection = false) {
  const overlay = document.querySelector('#modal-overlay')
  const container = document.querySelector('.modal-container')
  const contentBody = document.querySelector('#modal-content-body')

  if (!overlay || !container || !contentBody) return

  // 1. Prepare overlay background fade in
  overlay.classList.add('open')
  contentBody.style.opacity = '0'
  container.style.overflowY = 'hidden'

  // 2. Compute starting rect
  let startRect
  if (clickedCardElement) {
    startRect = clickedCardElement.getBoundingClientRect()
  } else {
    // If no card (direct booking clicked from navbar), grow from the navbar button or screen center
    const navBtn = document.querySelector('#nav-book-shortcut')
    if (navBtn) {
      startRect = navBtn.getBoundingClientRect()
    } else {
      startRect = {
        top: window.innerHeight / 2 - 50,
        left: window.innerWidth / 2 - 50,
        width: 100,
        height: 100
      }
    }
  }

  // 3. Set container dimensions instantly to match source card coordinates
  container.style.position = 'fixed'
  container.style.top = `${startRect.top}px`
  container.style.left = `${startRect.left}px`
  container.style.width = `${startRect.width}px`
  container.style.height = `${startRect.height}px`
  container.style.borderRadius = '16px'
  container.style.transition = 'none'

  // Force reflow/repaint
  container.offsetHeight

  // 4. Calculate target landing dimensions
  const isDesktop = window.innerWidth > 992
  const targetWidth = Math.min(window.innerWidth * 0.9, 900)
  const targetHeight = Math.min(window.innerHeight * 0.9, isDesktop ? 650 : (isDirectSelection ? 450 : 850))
  const targetTop = (window.innerHeight - targetHeight) / 2
  const targetLeft = (window.innerWidth - targetWidth) / 2

  // 5. Expand container smoothly
  container.style.transition = 'top 0.6s cubic-bezier(0.16, 1, 0.3, 1), left 0.6s cubic-bezier(0.16, 1, 0.3, 1), width 0.6s cubic-bezier(0.16, 1, 0.3, 1), height 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
  container.style.top = `${targetTop}px`
  container.style.left = `${targetLeft}px`
  container.style.width = `${targetWidth}px`
  container.style.height = `${targetHeight}px`
  container.style.borderRadius = '20px'

  // 6. Fade in inner content once transition completes
  setTimeout(() => {
    contentBody.style.opacity = '1'
    container.style.overflowY = 'hidden' // Scrolling handled inside content-body wrapper
  }, 450)
}

function closeGlassyModal() {
  const overlay = document.querySelector('#modal-overlay')
  const container = document.querySelector('.modal-container')
  const contentBody = document.querySelector('#modal-content-body')

  if (!overlay || !container || !contentBody) {
    state.isModalOpen = false
    renderApp()
    return
  }

  // 1. Fade out content body
  contentBody.style.opacity = '0'

  setTimeout(() => {
    // 2. Compute shrinking destination coordinates
    let endRect
    if (state.selectedStylist) {
      const card = document.querySelector(`.stylist-card[data-id="${state.selectedStylist.id}"]`)
      if (card) endRect = card.getBoundingClientRect()
    }

    if (!endRect) {
      const navBtn = document.querySelector('#nav-book-shortcut')
      if (navBtn) {
        endRect = navBtn.getBoundingClientRect()
      } else {
        endRect = {
          top: window.innerHeight / 2 - 50,
          left: window.innerWidth / 2 - 50,
          width: 100,
          height: 100
        }
      }
    }

    // 3. Shrink container back to start rect coordinates
    container.style.top = `${endRect.top}px`
    container.style.left = `${endRect.left}px`
    container.style.width = `${endRect.width}px`
    container.style.height = `${endRect.height}px`
    container.style.borderRadius = '16px'

    // 4. Remove overlay background colors/blur
    overlay.classList.remove('open')

    // 5. Clean state and refresh DOM
    setTimeout(() => {
      state.isModalOpen = false
      state.selectedStylist = null
      state.selectedServices = []
      state.selectedDate = null
      state.selectedTime = null
      state.latestBooking = null
      state.currentStep = 1
      renderApp()
    }, 600)
  }, 200)
}

// ----------------------------------------------------
// Calendar Engine Logic
// ----------------------------------------------------
function getTodayString() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const date = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${date}`
}

function isTimeHourPast(timeStr) {
  const now = new Date()
  const [time, modifier] = timeStr.split(' ')
  let [hours, minutes] = time.split(':').map(Number)
  if (modifier === 'PM' && hours < 12) hours += 12
  if (modifier === 'AM' && hours === 12) hours = 0
  const slotDate = new Date()
  slotDate.setHours(hours, minutes, 0, 0)
  return slotDate.getTime() < now.getTime()
}

function renderCalendarDays() {
  const container = document.querySelector('#calendar-days-container')
  const titleText = document.querySelector('#calendar-title-text')
  if (!container || !titleText) return

  const year = state.calendarDate.getFullYear()
  const month = state.calendarDate.getMonth()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  titleText.innerText = `${monthNames[month]} ${year}`

  const firstDayIndex = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()
  const prevMonthTotalDays = new Date(year, month, 0).getDate()

  container.innerHTML = ''

  for (let i = firstDayIndex; i > 0; i--) {
    const dayBtn = document.createElement('div')
    dayBtn.classList.add('calendar-day', 'disabled')
    dayBtn.innerText = prevMonthTotalDays - i + 1
    container.appendChild(dayBtn)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let d = 1; d <= totalDays; d++) {
    const dayBtn = document.createElement('div')
    dayBtn.classList.add('calendar-day')
    dayBtn.innerText = d

    const thisDate = new Date(year, month, d)
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

    if (thisDate.getTime() < today.getTime()) {
      dayBtn.classList.add('disabled')
    } else {
      if (state.selectedDate === dateStr) {
        dayBtn.classList.add('selected')
      }

      dayBtn.addEventListener('click', () => {
        state.selectedDate = dateStr
        state.selectedTime = null
        
        const detailsSec = document.querySelector('.modal-details-section')
        if (detailsSec) {
          detailsSec.innerHTML = renderWizardStep()
          renderCalendarDays()
          attachStep2EventListeners()
        }
      })
    }
    container.appendChild(dayBtn)
  }

  const totalCellsSoFar = firstDayIndex + totalDays
  const remainingCells = 42 - totalCellsSoFar
  for (let d = 1; d <= remainingCells; d++) {
    const dayBtn = document.createElement('div')
    dayBtn.classList.add('calendar-day', 'disabled')
    dayBtn.innerText = d
    container.appendChild(dayBtn)
  }
}

// ----------------------------------------------------
// Event Listeners Configuration
// ----------------------------------------------------
function attachGlobalEventListeners() {
  // Mobile Hamburger Navigation
  const menuBtn = document.querySelector('#menu-btn')
  const navLinks = document.querySelector('#nav-links')
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open')
    })
  }

  // Logo navigation click (Back to Landing Cover page)
  const logoBtn = document.querySelector('#logo-btn')
  if (logoBtn) {
    logoBtn.addEventListener('click', () => {
      state.activeView = 'landing'
      renderApp()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  // Home link
  const navHome = document.querySelector('#nav-home')
  if (navHome) {
    navHome.addEventListener('click', () => {
      state.activeView = 'landing'
      renderApp()
      if (navLinks.classList.contains('open')) navLinks.classList.remove('open')
    })
  }

  // Stylists list link
  const navStylists = document.querySelector('#nav-stylists')
  if (navStylists) {
    navStylists.addEventListener('click', () => {
      state.activeView = 'stylists'
      renderApp()
      if (navLinks.classList.contains('open')) navLinks.classList.remove('open')
    })
  }

  // Models showcase gallery link
  const navModels = document.querySelector('#nav-models')
  if (navModels) {
    navModels.addEventListener('click', () => {
      state.activeView = 'models'
      renderApp()
      if (navLinks.classList.contains('open')) navLinks.classList.remove('open')
    })
  }

  // Direct Book Experience link (Opens modal directly starting with Stylist Selection Step 0)
  const navBookShortcut = document.querySelector('#nav-book-shortcut')
  if (navBookShortcut) {
    navBookShortcut.addEventListener('click', () => {
      state.selectedStylist = null
      state.selectedServices = []
      state.selectedDate = null
      state.selectedTime = null
      state.currentStep = 0 // Stylist selection first
      state.isModalOpen = true
      
      if (navLinks.classList.contains('open')) navLinks.classList.remove('open')
      
      renderApp()
      openGlassyModal(null, true)
    })
  }

  // Bookings link
  const navBookings = document.querySelector('#nav-bookings')
  if (navBookings) {
    navBookings.addEventListener('click', () => {
      state.activeView = 'bookings'
      renderApp()
      if (navLinks.classList.contains('open')) navLinks.classList.remove('open')
    })
  }

  // Landing page CTA button events
  const landingExploreBtn = document.querySelector('#landing-explore-btn')
  if (landingExploreBtn) {
    landingExploreBtn.addEventListener('click', () => {
      state.activeView = 'stylists'
      renderApp()
    })
  }

  const landingBookBtn = document.querySelector('#landing-book-btn')
  if (landingBookBtn) {
    landingBookBtn.addEventListener('click', () => {
      state.selectedStylist = null
      state.selectedServices = []
      state.selectedDate = null
      state.selectedTime = null
      state.currentStep = 0 // Stylist selection first
      state.isModalOpen = true
      renderApp()
      openGlassyModal(null, true)
    })
  }

  // Bookings dashboard CTA button event
  const bookingsBookBtn = document.querySelector('#bookings-book-btn')
  if (bookingsBookBtn) {
    bookingsBookBtn.addEventListener('click', () => {
      state.activeView = 'stylists'
      renderApp()
    })
  }

  // Stylist Cards Click - Open Modal with Grow Transition
  const cards = document.querySelectorAll('.stylist-card')
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id')
      const stylist = stylists.find(s => s.id === id)
      if (stylist) {
        state.selectedStylist = stylist
        state.selectedServices = []
        state.selectedDate = null
        state.selectedTime = null
        state.currentStep = 1 // Start at service selection directly
        state.isModalOpen = true
        
        renderApp()
        openGlassyModal(card, false)
      }
    })
  })

  // Model Card Buttons Click - Open Modal with corresponding stylist & service pre-selected
  const modelCards = document.querySelectorAll('.model-card')
  modelCards.forEach(card => {
    const bookBtn = card.querySelector('.btn-model-book')
    if (bookBtn) {
      bookBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        const modelId = bookBtn.getAttribute('data-model-id')
        const model = models.find(m => m.id === modelId)
        if (model) {
          const stylist = stylists.find(s => s.id === model.stylistId)
          if (stylist) {
            state.selectedStylist = stylist
            state.selectedServices = []
            
            // Auto-select corresponding serviceId
            let serviceId = ''
            if (model.id === 'model-1') serviceId = 'by-bespoke'
            else if (model.id === 'model-2') serviceId = 'hc-royal'
            else if (model.id === 'model-3') serviceId = 'st-bridal'
            else if (model.id === 'model-4') serviceId = 'hc-royal'

            const service = stylist.services.find(s => s.id === serviceId)
            if (service) {
              state.selectedServices.push(service)
            }

            state.selectedDate = null
            state.selectedTime = null
            state.currentStep = 1 // Go directly to services (with item auto-selected)
            state.isModalOpen = true

            renderApp()
            openGlassyModal(card, false)
          }
        }
      })
    }
  })

  // Modal Overlay Close button
  const modalCloseBtn = document.querySelector('#modal-close-btn')
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      closeGlassyModal()
    })
  }

  // Wizard Step-specific event binding
  if (state.isModalOpen) {
    if (state.currentStep === 0) {
      attachStep0EventListeners()
    } else if (state.currentStep === 1) {
      attachStep1EventListeners()
    } else if (state.currentStep === 2) {
      attachStep2EventListeners()
    } else if (state.currentStep === 3) {
      attachStep3EventListeners()
    }
  }

  // Booking Cancellation
  const cancelBtns = document.querySelectorAll('.btn-cancel')
  cancelBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(btn.getAttribute('data-index'))
      if (confirm('Are you sure you want to cancel this reservation?')) {
        state.bookings.splice(index, 1)
        saveBookings()
        renderApp()
      }
    })
  })
}

function attachStep0EventListeners() {
  const items = document.querySelectorAll('.stylist-select-item')
  items.forEach(item => {
    item.addEventListener('click', () => {
      const stylistId = item.getAttribute('data-select-stylist-id')
      const stylist = stylists.find(s => s.id === stylistId)
      if (stylist) {
        state.selectedStylist = stylist
        state.currentStep = 1 // Proceed to Services selector
        
        const modalBody = document.querySelector('#modal-content-body')
        if (modalBody) {
          modalBody.innerHTML = renderModalContent()
          attachStep1EventListeners()
        }
      }
    })
  })

  const cancelBtn = document.querySelector('#wizard-step0-cancel')
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      closeGlassyModal()
    })
  }
}

function attachStep1EventListeners() {
  const items = document.querySelectorAll('.service-item')
  items.forEach(item => {
    item.addEventListener('click', () => {
      const serviceId = item.getAttribute('data-service-id')
      const stylist = state.selectedStylist
      const service = stylist.services.find(s => s.id === serviceId)
      
      const foundIdx = state.selectedServices.findIndex(s => s.id === serviceId)
      if (foundIdx > -1) {
        state.selectedServices.splice(foundIdx, 1)
      } else {
        state.selectedServices.push(service)
      }

      const modalBody = document.querySelector('#modal-content-body')
      if (modalBody) {
        modalBody.innerHTML = renderModalContent()
        attachStep1EventListeners()
      }
    })
  })

  const backBtn = document.querySelector('#wizard-step1-back')
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      state.selectedStylist = null
      state.selectedServices = []
      state.currentStep = 0 // Go back to stylist selection
      const modalBody = document.querySelector('#modal-content-body')
      if (modalBody) {
        modalBody.innerHTML = renderModalContent()
        attachStep0EventListeners()
      }
    })
  }

  const nextBtn = document.querySelector('#wizard-step1-next')
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      state.currentStep = 2
      state.calendarDate = new Date() // Reset to current month
      const modalBody = document.querySelector('#modal-content-body')
      if (modalBody) {
        modalBody.innerHTML = renderModalContent()
        renderCalendarDays()
        attachStep2EventListeners()
      }
    })
  }
}

function attachStep2EventListeners() {
  const prevBtn = document.querySelector('#cal-prev')
  const nextBtn = document.querySelector('#cal-next')
  
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      state.calendarDate.setMonth(state.calendarDate.getMonth() - 1)
      renderCalendarDays()
    })
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      state.calendarDate.setMonth(state.calendarDate.getMonth() + 1)
      renderCalendarDays()
    })
  }

  const timeBtns = document.querySelectorAll('.timeslot-btn')
  timeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('disabled')) return
      state.selectedTime = btn.getAttribute('data-time')
      
      timeBtns.forEach(b => b.classList.remove('selected'))
      btn.classList.add('selected')
      validateStep2Form()
    })
  })

  const nameInput = document.querySelector('#guest-name')
  const phoneInput = document.querySelector('#guest-phone')
  
  if (nameInput && phoneInput) {
    nameInput.addEventListener('input', () => validateStep2Form())
    phoneInput.addEventListener('input', () => validateStep2Form())
  }

  const backBtn = document.querySelector('#wizard-step2-back')
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      state.currentStep = 1
      const modalBody = document.querySelector('#modal-content-body')
      if (modalBody) {
        modalBody.innerHTML = renderModalContent()
        attachStep1EventListeners()
      }
    })
  }

  const confirmBtn = document.querySelector('#wizard-confirm-booking')
  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      const name = document.querySelector('#guest-name').value.trim()
      const phone = document.querySelector('#guest-phone').value.trim()
      const email = document.querySelector('#guest-email').value.trim()

      const newBooking = {
        stylistId: state.selectedStylist.id,
        stylistName: state.selectedStylist.name,
        services: [...state.selectedServices],
        date: state.selectedDate,
        time: state.selectedTime,
        guestName: name,
        guestPhone: phone,
        guestEmail: email,
        ticketCode: generateTicketCode()
      }

      state.bookings.push(newBooking)
      saveBookings()
      state.latestBooking = newBooking
      state.currentStep = 3

      const modalBody = document.querySelector('#modal-content-body')
      if (modalBody) {
        modalBody.innerHTML = renderModalContent()
        attachStep3EventListeners()
      }
    })
  }
}

function validateStep2Form() {
  const confirmBtn = document.querySelector('#wizard-confirm-booking')
  if (!confirmBtn) return

  const nameVal = document.querySelector('#guest-name')?.value.trim() || ''
  const phoneVal = document.querySelector('#guest-phone')?.value.trim() || ''

  const isValid = state.selectedDate && state.selectedTime && nameVal.length >= 2 && phoneVal.length >= 7
  
  if (isValid) {
    confirmBtn.disabled = false
    confirmBtn.style.opacity = '1'
    confirmBtn.style.cursor = 'pointer'
  } else {
    confirmBtn.disabled = true
    confirmBtn.style.opacity = '0.5'
    confirmBtn.style.cursor = 'not-allowed'
  }
}

function attachStep3EventListeners() {
  const successBtn = document.querySelector('#success-view-bookings-btn')
  if (successBtn) {
    successBtn.addEventListener('click', () => {
      state.isModalOpen = false
      state.activeView = 'bookings'
      renderApp()
    })
  }
}

// ----------------------------------------------------
// Initial Bootstrapping
// ----------------------------------------------------
renderApp()
