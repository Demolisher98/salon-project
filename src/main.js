import './style.css'
import { stylists, models, salons } from './data.js'
import salonHero from './assets/salon_hero.png'

// Application State
const state = {
  activeView: 'landing', // 'landing' | 'salons' | 'stylists' | 'models' | 'bookings' | 'compare'
  salons: JSON.parse(localStorage.getItem('bl_salons')) || salons,
  bookings: JSON.parse(localStorage.getItem('bl_bookings')) || [],
  favorites: JSON.parse(localStorage.getItem('bl_favorites')) || [],
  compareList: JSON.parse(localStorage.getItem('bl_compare')) || [],
  
  // Modal / Detail States
  isModalOpen: false,
  modalType: 'booking', // 'booking' | 'salon-details' | 'stylist-details'
  selectedSalonDetail: null,
  selectedStylistDetail: null,

  // Booking Wizard States
  currentStep: -1, // -1: Select Salon, 0: Select Stylist, 1: Select Services, 2: Date/Time/Form, 3: Success Ticket
  selectedSalon: null,
  selectedStylist: null,
  selectedServices: [],
  selectedDate: null,
  selectedTime: null,
  calendarDate: new Date(),
  latestBooking: null,

  // UI Interactive States
  aiMatchOutput: null,
  chatbotOpen: false,
  chatbotUnread: true,
  isTyping: false,
  chatbotMessages: [
    { sender: 'bot', text: 'Welcome to Bangalore Luxury. I am Aura, your AI beauty concierge. How can I guide your styling journey today? Ask me about face shapes, luxury salons, bridal makeups, or budget recommendations!' }
  ],
  activeFormRating: 5,
  nearMeSearch: ''
}

// Map reference for Leaflet
let leafletMap = null

// Persist state helpers
function saveState(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

function toggleFavorite(salonId) {
  const idx = state.favorites.indexOf(salonId)
  if (idx > -1) {
    state.favorites.splice(idx, 1)
  } else {
    state.favorites.push(salonId)
  }
  saveState('bl_favorites', state.favorites)
  renderApp()
}

function toggleCompare(salonId) {
  const idx = state.compareList.indexOf(salonId)
  if (idx > -1) {
    state.compareList.splice(idx, 1)
  } else {
    if (state.compareList.length >= 3) {
      alert('You can compare a maximum of 3 salons side-by-side.')
      return
    }
    state.compareList.push(salonId)
  }
  saveState('bl_compare', state.compareList)
  renderApp()
}

// Generate booking ticket code
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

// Custom icons
const icons = {
  star: `<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`,
  specialty: `<svg viewBox="0 0 24 24"><path d="M9 11.75c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.34.75.75-.34.75-.75.75zm9 0c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.34.75.75-.34.75-.75.75zm-4.5 0c-.41 0-.75-.34-.75-.75s.34-.75.75-.75.75.34.75.75-.34.75-.75.75zM22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 3h5v5h-5z"/></svg>`,
  clock: `<svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`,
  user: `<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
  trash: `<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
  scissorsLogo: `<svg viewBox="0 0 24 24"><path d="M9.64 7.64c.23-.5.36-1.05.36-1.64C10 3.79 8.21 2 6 2S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l2.36 2.36c-.23.5-.36 1.05-.36 1.64 0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4c-.59 0-1.14.13-1.64.36L14 12l2.36-2.36c.5.23 1.05.36 1.64.36 2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4c0 .59.13 1.14.36 1.64L12 10l-2.36-2.36zM6 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm12 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM6 18c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM18 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/></svg>`,
  sparkles: `<svg viewBox="0 0 24 24"><path d="M12 2L10.5 8.5L4 10L10.5 11.5L12 18L13.5 11.5L20 10L13.5 8.5L12 2Z M19 17l-1 4.5l-3.5-1l3.5-1.5L19 14l1.5 3.5L24 19l-4.5 1L19 17Z M5.5 14L5 17.5L2 19L5 20l0.5 3.5L7 20.5L10 19L7 17.5L5.5 14Z"/></svg>`,
  heart: `<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,
  mapPin: `<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`
}

// ----------------------------------------------------
// Main Render Loop
// ----------------------------------------------------
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
        <li class="nav-link ${state.activeView === 'salons' ? 'active' : ''}" id="nav-salons">Salons</li>
        <li class="nav-link ${state.activeView === 'near-me' ? 'active' : ''}" id="nav-near-me">Near You</li>
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

    <!-- Floating AI Beauty Chatbot FAB -->
    <div class="chatbot-fab" id="chatbot-fab">
      ${state.chatbotUnread ? `<div class="chatbot-badge"></div>` : ''}
      ${icons.sparkles}
    </div>

    <!-- Chatbot Window panel -->
    <div class="chatbot-panel glass-panel ${state.chatbotOpen ? 'open' : ''}" id="chatbot-panel">
      <div class="chatbot-header">
        <div class="chatbot-title-box">
          ${icons.sparkles}
          <div>
            <h3 class="chatbot-title">Aura AI</h3>
            <span class="chatbot-status">Beauty Concierge</span>
          </div>
        </div>
        <button class="chatbot-close" id="chatbot-close">&times;</button>
      </div>
      <div class="chatbot-chat-log" id="chatbot-chat-log">
        ${state.chatbotMessages.map(msg => `
          <div class="chat-bubble ${msg.sender === 'bot' ? 'chat-bubble-bot' : 'chat-bubble-user'}">
            ${msg.text}
          </div>
        `).join('')}
        ${state.isTyping ? `
          <div class="chat-bubble typing-bubble">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        ` : ''}
      </div>
      <div class="chat-shortcuts">
        <button class="chat-shortcut-btn" data-query="Bridal Makeup">Bridal Makeup</button>
        <button class="chat-shortcut-btn" data-query="Hair Spa">Hair Spa</button>
        <button class="chat-shortcut-btn" data-query="Luxury Salons">Luxury Salons</button>
        <button class="chat-shortcut-btn" data-query="Budget Friendly">Budget Friendly</button>
        <button class="chat-shortcut-btn" data-query="Home Service">Home Service</button>
      </div>
      <div class="chatbot-input-bar">
        <input type="text" class="chatbot-input" id="chatbot-input" placeholder="Ask Aura about styling, salons..." autocomplete="off">
        <button class="chatbot-send-btn" id="chatbot-send-btn">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>

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

  // Initialize Leaflet Map if active view is salons or near-me
  if (state.activeView === 'salons') {
    initLeafletMap()
  } else if (state.activeView === 'near-me') {
    initNearMeMap()
  }
}

function renderActiveView() {
  switch (state.activeView) {
    case 'landing':
      return renderLandingView()
    case 'salons':
      return renderSalonsView()
    case 'near-me':
      return renderNearMeView()
    case 'stylists':
      return renderStylistsView()
    case 'models':
      return renderModelsView()
    case 'bookings':
      return renderBookingsView()
    case 'compare':
      return renderCompareView()
    default:
      return renderLandingView()
  }
}

// ----------------------------------------------------
// Landing View (Cover Title Screen)
// ----------------------------------------------------
function renderLandingView() {
  return `
    <section class="landing-view">
      <div class="landing-bg" style="background-image: url('${salonHero}');"></div>
      <div class="landing-overlay"></div>
      <div class="landing-content">
        <h4 class="landing-subtitle">Couture Beauty & Spa Marketplace</h4>
        <h1 class="landing-title">Bangalore Luxury</h1>
        <p class="landing-desc">Discover and secure reservations at Bangalore's finest, ultra-premium salons. Compare prices, explore portfolios, and secure customized sequences with award-winning style craftsmen.</p>
        <div class="landing-actions">
          <button class="btn-primary" id="landing-explore-btn">Browse Marketplace</button>
          <button class="btn-glass" id="landing-book-btn">Book Premium Service</button>
        </div>
      </div>
    </section>
  `
}

// ----------------------------------------------------
// Salons Marketplace View (with filters, map & AI match)
// ----------------------------------------------------
function renderSalonsView() {
  // Check localStorage for filters
  const searchVal = state.filterSearch || ''
  const locVal = state.filterLocation || ''
  const priceVal = state.filterPrice || ''
  const serviceVal = state.filterService || ''
  const homeVal = state.filterHome || ''

  // Filter salons
  const filteredSalons = state.salons.filter(s => {
    // Search match
    if (searchVal && !s.name.toLowerCase().includes(searchVal.toLowerCase()) && !s.location.toLowerCase().includes(searchVal.toLowerCase())) {
      return false
    }
    // Location match
    if (locVal && s.location !== locVal) return false
    // Price match
    if (priceVal && s.priceTier !== priceVal) return false
    // Home Service match
    if (homeVal && String(s.homeService) !== homeVal) return false
    // Service category match
    if (serviceVal) {
      const hasCat = s.services.some(svc => svc.category.toLowerCase() === serviceVal.toLowerCase())
      if (!hasCat) return false
    }
    return true
  })

  // Extract unique locations and categories for filter select options
  const locations = [...new Set(state.salons.map(s => s.location))]
  const categories = ['Haircut', 'Coloring', 'Barbering', 'Skincare', 'Hair Spa', 'Nails', 'Lashes']

  return `
    <div class="section-container" style="padding-top: 30px;">
      <div class="section-header">
        <h4 class="section-subtitle">Elite Salon Network</h4>
        <h2 class="section-title">Luxury Marketplace</h2>
      </div>

      <!-- Compare Selected Salons Floating Bar -->
      ${state.compareList.length > 0 ? `
        <div class="compare-bar glass-panel">
          <span class="compare-bar-text"><strong>${state.compareList.length}</strong> salon(s) selected for comparison (Max 3).</span>
          <button class="btn-primary" style="padding: 10px 24px; font-size: 0.8rem;" id="compare-bar-btn">Compare Salons</button>
        </div>
      ` : ''}

      <!-- AI Recommendation System Panel -->
      <div class="ai-match-box glass-panel">
        <h3 class="ai-match-title">
          ${icons.sparkles}
          <span>AI Salon Matchmaker</span>
        </h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 15px;">Describe your styling requirements (e.g., "Bridal makeup under ₹5000 in Koramangala") and our AI recommends the perfect salon.</p>
        <div class="ai-match-input-group">
          <textarea class="ai-match-textarea" id="ai-match-textarea" placeholder="Describe budget, services, location, home service needs..."></textarea>
          <button class="btn-ai-match" id="ai-match-submit-btn">Match</button>
        </div>
        <div class="ai-recommendations-output" id="ai-match-output-container">
          ${renderAiRecommendations()}
        </div>
      </div>

      <!-- Search & Filters Row -->
      <div class="marketplace-filters glass-panel">
        <div class="filters-row">
          <div class="search-wrapper">
            <input type="text" class="search-input" id="search-input" placeholder="Search salons by name or area..." value="${searchVal}">
            <span class="search-icon">
              <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
            </span>
          </div>
          
          <select class="filter-select" id="filter-location">
            <option value="">All Locations</option>
            ${locations.map(l => `<option value="${l}" ${locVal === l ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
          
          <select class="filter-select" id="filter-price">
            <option value="">All Budgets</option>
            <option value="₹" ${priceVal === '₹' ? 'selected' : ''}>Moderate (₹)</option>
            <option value="₹₹" ${priceVal === '₹₹' ? 'selected' : ''}>Premium (₹₹)</option>
            <option value="₹₹₹" ${priceVal === '₹₹₹' ? 'selected' : ''}>Ultra Luxury (₹₹₹)</option>
          </select>
          
          <select class="filter-select" id="filter-service">
            <option value="">All Services</option>
            ${categories.map(c => `<option value="${c}" ${serviceVal === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
          
          <select class="filter-select" id="filter-home">
            <option value="">Home Service?</option>
            <option value="true" ${homeVal === 'true' ? 'selected' : ''}>Available</option>
            <option value="false" ${homeVal === 'false' ? 'selected' : ''}>Salon Only</option>
          </select>
        </div>
      </div>

      <!-- Main Marketplace Body (Split Grid & Map) -->
      <div style="display: grid; grid-template-columns: 1.8fr 1.2fr; gap: 30px; margin-bottom: 40px;" id="marketplace-grid-layout">
        <!-- Salons Grid List -->
        <div>
          <div class="salon-grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
            ${filteredSalons.length === 0 ? `<div style="grid-column: span 2; text-align: center; padding: 40px;">No salons match your search criteria.</div>` : filteredSalons.map(s => renderSalonCard(s)).join('')}
          </div>
        </div>

        <!-- Sticky Interactive Map Column -->
        <div style="position: sticky; top: 110px; height: 500px;" id="map-sticky-col">
          <div class="map-section">
            <div id="map"></div>
          </div>
        </div>
      </div>
    </div>
  `
}

function renderSalonCard(salon) {
  const isFav = state.favorites.includes(salon.id)
  const isCompareChecked = state.compareList.includes(salon.id)

  return `
    <div class="salon-card glass-panel">
      <!-- Heart Wishlist button -->
      <div class="btn-favorite ${isFav ? 'active' : ''}" data-salon-id="${salon.id}">
        ${icons.heart}
      </div>

      <div class="salon-img-container">
        <!-- Render salon banner or placeholder interior -->
        <img src="${salonHero}" alt="${salon.name}">
        <div class="salon-img-overlay"></div>
        <div class="stylist-rating-badge">
          ${icons.star}
          <span>${salon.rating.toFixed(1)}</span>
        </div>
      </div>

      <div class="salon-info">
        <div>
          <div class="salon-name-row">
            <h3 class="salon-name">${salon.name}</h3>
          </div>
          <p class="salon-area">${salon.location}</p>
          <div class="salon-meta-tags">
            <span class="salon-tag">${salon.luxuryLevel}</span>
            ${salon.homeService ? `<span class="salon-tag-premium">Home Service</span>` : `<span class="salon-tag">Salon Only</span>`}
          </div>
        </div>
        <div>
          <div class="salon-footer-row">
            <span class="salon-price">${salon.priceRange}</span>
            <button class="btn-glass btn-salon-explore" data-salon-id="${salon.id}" style="padding: 8px 16px; font-size: 0.75rem;">Explore</button>
          </div>
          
          <!-- Compare button -->
          <button class="btn-compare-card ${isCompareChecked ? 'active' : ''}" data-salon-compare-id="${salon.id}">
            ${isCompareChecked ? '✓ Comparing' : '+ Compare'}
          </button>
        </div>
      </div>
    </div>
  `
}

// ----------------------------------------------------
// AI Recommendation Output Generator
// ----------------------------------------------------
function renderAiRecommendations() {
  if (!state.aiMatchOutput) return ''

  return state.aiMatchOutput.map(rec => `
    <div class="ai-rec-card glass-panel">
      <div class="ai-rec-header">
        <h4 class="ai-rec-name">${rec.name} (${rec.location})</h4>
        <p class="ai-rec-reason">${rec.reason}</p>
      </div>
      <button class="btn-primary btn-salon-explore" data-salon-id="${rec.id}" style="padding: 10px 18px; font-size: 0.78rem;">Book Salon</button>
    </div>
  `).join('')
}

function processAiMatching(queryText) {
  const norm = queryText.toLowerCase()
  if (!norm.trim()) {
    state.aiMatchOutput = null
    renderApp()
    return
  }

  const results = []

  // Check matching criteria
  state.salons.forEach(s => {
    let score = 0
    let reasonParts = []

    // 1. Location match
    if (norm.includes(s.location.toLowerCase())) {
      score += 3
      reasonParts.push(`Located in ${s.location}.`)
    }

    // 2. Budget/Price Tier match
    // Extract numbers to match budget
    const numbers = norm.match(/\d+/g)
    if (numbers) {
      const budget = Math.max(...numbers.map(Number))
      // Get cheapest service
      const minPrice = Math.min(...s.services.map(svc => svc.price))
      if (minPrice <= budget) {
        score += 2
        reasonParts.push(`Fits your budget (Services start at ₹${minPrice.toLocaleString()}).`)
      } else {
        score -= 2 // Penalize if lowest service is higher than budget
      }
    }

    // 3. Service matches
    const serviceKeywords = {
      'haircut': ['haircut', 'cut', 'trim', 'fringe', 'crop', 'styling'],
      'coloring': ['color', 'dye', 'balayage', 'highlights', 'blonde', 'tint'],
      'barbering': ['shave', 'beard', 'razor', 'hot towel', 'barber'],
      'skincare': ['skincare', 'facial', 'glow', 'hydrate', 'dermal', 'face pack'],
      'hair spa': ['spa', 'scalp', 'detox', 'massage', 'acupressure', 'conditioning'],
      'nails': ['nail', 'manicure', 'pedicure', 'acrylic', 'extensions'],
      'lashes': ['lash', 'eyelash', 'lashes', 'extensions']
    }

    let serviceMatched = false
    Object.keys(serviceKeywords).forEach(cat => {
      const matchedWord = serviceKeywords[cat].find(word => norm.includes(word))
      if (matchedWord) {
        const hasSvc = s.services.some(svc => svc.category.toLowerCase() === cat)
        if (hasSvc) {
          score += 3
          serviceMatched = true
          reasonParts.push(`Provides premium ${cat} treatments.`)
        }
      }
    })

    // 4. Home Service match
    if (norm.includes('home') || norm.includes('visit') || norm.includes('doorstep') || norm.includes('house')) {
      if (s.homeService) {
        score += 4
        reasonParts.push(`Offers certified at-home treatment services!`)
      }
    }

    // 5. Rating/Best match
    if (norm.includes('best') || norm.includes('top') || norm.includes('rating') || norm.includes('star')) {
      if (s.rating >= 4.8) {
        score += 1
        reasonParts.push(`Highly rated (${s.rating} Stars) by verified customers.`)
      }
    }

    // If matches any main keyword, add to recommendations
    if (score > 1) {
      results.push({
        id: s.id,
        name: s.name,
        location: s.location,
        reason: reasonParts.join(' ') || `Provides high-quality premium treatments in ${s.location}.`,
        score: score
      })
    }
  })

  // Sort by score descending
  results.sort((a, b) => b.score - a.score)
  
  // Set results (take top 2)
  state.aiMatchOutput = results.slice(0, 2)
  
  if (state.aiMatchOutput.length === 0) {
    state.aiMatchOutput = [{
      id: state.salons[0].id,
      name: state.salons[0].name,
      location: state.salons[0].location,
      reason: 'No exact matches found. Recommending our flagship Koramangala retreat based on our elite ratings.'
    }]
  }

  renderApp()
}

// ----------------------------------------------------
// Compare Salons View
// ----------------------------------------------------
function renderCompareView() {
  const salonsToCompare = state.salons.filter(s => state.compareList.includes(s.id))

  return `
    <div class="section-container compare-container">
      <div class="section-header">
        <h4 class="section-subtitle">Side-By-Side Comparison</h4>
        <h2 class="section-title">Compare Salon Offerings</h2>
      </div>

      <div style="margin-bottom: 25px; display: flex; gap: 15px;">
        <button class="btn-glass" id="compare-back-btn">&larr; Back to Marketplace</button>
        ${salonsToCompare.length > 0 ? `
          <button class="btn-glass" id="compare-clear-btn" style="border-color: rgba(239, 68, 68, 0.35); color: #f87171;">Clear Comparison</button>
        ` : ''}
      </div>

      ${salonsToCompare.length === 0 ? `
        <div class="no-bookings glass-panel">
          <p>No salons selected for comparison. Return to the marketplace to select salons.</p>
        </div>
      ` : `
        <div class="compare-table-wrapper">
          <table class="compare-table">
            <thead>
              <tr>
                <th class="feature-name">Features</th>
                ${salonsToCompare.map(s => `
                  <th>
                    <div class="compare-header-cell">
                      <button class="remove-compare-btn" data-salon-id="${s.id}">&times;</button>
                      <span class="compare-salon-name">${s.name}</span>
                    </div>
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="feature-name">Location</td>
                ${salonsToCompare.map(s => `<td>${s.location}</td>`).join('')}
              </tr>
              <tr>
                <td class="feature-name">Rating</td>
                ${salonsToCompare.map(s => `
                  <td>
                    <div style="display:flex; align-items:center; gap:5px; color: var(--accent-gold);">
                      ${icons.star}
                      <strong>${s.rating.toFixed(1)}</strong>
                    </div>
                  </td>
                `).join('')}
              </tr>
              <tr>
                <td class="feature-name">Price Range</td>
                ${salonsToCompare.map(s => `<td><strong style="color: var(--accent-gold);">${s.priceTier}</strong> (${s.priceRange})</td>`).join('')}
              </tr>
              <tr>
                <td class="feature-name">Premium Category</td>
                ${salonsToCompare.map(s => `<td><span class="skill-tag" style="font-size:0.75rem; background: rgba(197, 168, 128, 0.08);">${s.luxuryLevel}</span></td>`).join('')}
              </tr>
              <tr>
                <td class="feature-name">Home Service?</td>
                ${salonsToCompare.map(s => `<td>${s.homeService ? '✅ Available' : '❌ Salon Only'}</td>`).join('')}
              </tr>
              <tr>
                <td class="feature-name">Services Offered</td>
                ${salonsToCompare.map(s => `
                  <td>
                    <div style="display:flex; flex-direction:column; gap:6px; max-height:200px; overflow-y:auto; padding-right:5px;">
                      ${s.services.map(ser => `
                        <div style="font-size: 0.8rem; border-bottom: 1px dashed rgba(197,168,128,0.1); padding-bottom: 4px;">
                          <strong>${ser.name}</strong><br>
                          <span style="color: var(--accent-gold); font-size: 0.75rem;">₹${ser.price}</span>
                        </div>
                      `).join('')}
                    </div>
                  </td>
                `).join('')}
              </tr>
              <tr>
                <td class="feature-name">Customer Reviews</td>
                ${salonsToCompare.map(s => `
                  <td>
                    <div style="display:flex; align-items:center; gap:6px;">
                      <strong style="color: var(--text-main); font-size: 0.9rem;">${s.reviews.length}</strong>
                      <span style="font-size:0.75rem; color:var(--text-muted);">verified review(s)</span>
                    </div>
                  </td>
                `).join('')}
              </tr>
              <tr>
                <td class="feature-name">Action</td>
                ${salonsToCompare.map(s => `
                  <td>
                    <button class="btn-primary btn-compare-book" data-salon-id="${s.id}" style="padding: 10px 20px; font-size: 0.8rem;">Book Salon</button>
                  </td>
                `).join('')}
              </tr>
            </tbody>
          </table>
        </div>
      `}
    </div>
  `
}

// ----------------------------------------------------
// Near Me / Salon Finder View
// ----------------------------------------------------
function renderNearMeView() {
  const searchVal = state.nearMeSearch || ''
  
  // Filter salons by search value matching name or location
  const filtered = state.salons.filter(s => 
    s.name.toLowerCase().includes(searchVal.toLowerCase()) || 
    s.location.toLowerCase().includes(searchVal.toLowerCase())
  )

  return `
    <div class="section-container near-me-container">
      <div class="section-header">
        <h4 class="section-subtitle">Interactive Finder</h4>
        <h2 class="section-title">Find Salons Near You</h2>
      </div>

      <!-- Search Bar -->
      <div class="search-bar-wrapper glass-panel" style="margin-bottom: 25px; padding: 15px;">
        <div class="search-wrapper" style="width: 100%; max-width: 600px; margin: 0 auto;">
          <input type="text" class="search-input" id="near-me-search" placeholder="Enter your area (e.g. Koramangala, Indiranagar, Jayanagar) or salon name..." value="${searchVal}">
          <span class="search-icon">
            <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          </span>
        </div>
      </div>

      <!-- Split Layout -->
      <div class="near-me-layout" id="near-me-layout">
        <!-- Location Cards list -->
        <div class="near-me-cards" id="near-me-cards">
          ${filtered.length === 0 ? `
            <div class="no-results glass-panel" style="padding: 40px; text-align: center; color: var(--text-muted);">
              No salons found near "${searchVal}". Try searching "Koramangala", "Indiranagar", or "Whitefield".
            </div>
          ` : filtered.map(s => `
            <div class="near-me-card glass-panel" data-salon-id="${s.id}" data-lat="${s.coordinates[0]}" data-lng="${s.coordinates[1]}">
              <div class="near-me-card-header">
                <div>
                  <h3 class="near-me-salon-name">${s.name}</h3>
                  <p class="near-me-salon-loc">${s.location} Area</p>
                </div>
                <div class="near-me-rating">
                  ${icons.star}
                  <span>${s.rating.toFixed(1)}</span>
                </div>
              </div>
              <div class="near-me-meta">
                <span>Category: <strong>${s.luxuryLevel}</strong></span> • 
                <span>Price: <strong>${s.priceTier}</strong></span>
              </div>
              <div class="near-me-actions">
                <a href="https://www.google.com/maps/dir/?api=1&destination=${s.coordinates[0]},${s.coordinates[1]}" target="_blank" class="btn-glass near-me-action-btn" style="text-align: center; display: flex; align-items: center; justify-content: center; text-decoration: none;">
                  Get Directions
                </a>
                <button class="btn-primary near-me-action-btn btn-near-me-book" data-salon-id="${s.id}">
                  Book Salon
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Sticky Map Column -->
        <div class="near-me-map-container" id="near-me-map-col">
          <div class="map-section" style="height: 100%; margin-bottom: 0;">
            <div id="near-me-map" style="height: 100%; min-height: 450px; border-radius: 16px; border: 1px solid var(--glass-border); box-shadow: var(--shadow-gold);"></div>
          </div>
        </div>
      </div>
    </div>
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
      <p>No active reservations are scheduled. Book an indulgence at our marketplace salons today.</p>
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
          ${icons.mapPin}
          <span>Salon: <strong>${booking.salonName}</strong> (${booking.salonArea})</span>
        </div>
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
// Modal Drawer Selector (Dynamic Wizard vs Salon Details View)
// ----------------------------------------------------
function renderModalContent() {
  if (state.modalType === 'salon-details') {
    return renderSalonDetailsModal()
  }
  
  // Otherwise render Booking Wizard flow
  const stylist = state.selectedStylist
  const isDirectBookingStylistSelection = state.currentStep === 0
  const isDirectBookingSalonSelection = state.currentStep === -1

  return `
    <div class="modal-body">
      <!-- Left Profile Pane (Hide in Step -1, 0, or Success Screen) -->
      ${(state.currentStep !== 3 && stylist && !isDirectBookingStylistSelection && !isDirectBookingSalonSelection) ? `
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
      <div class="modal-details-section" style="${(state.currentStep === 3 || isDirectBookingStylistSelection || isDirectBookingSalonSelection) ? 'grid-column: span 2;' : ''}">
        ${renderWizardStep()}
      </div>
    </div>
  `
}

// ----------------------------------------------------
// Salon Details Modal View (including reviews form & list)
// ----------------------------------------------------
function renderSalonDetailsModal() {
  const salon = state.selectedSalonDetail
  if (!salon) return ''

  // Get associated stylists
  const salonStylists = stylists.filter(s => salon.stylistIds.includes(s.id))

  return `
    <div class="modal-body" style="grid-template-columns: 1fr;">
      <div class="modal-details-section" style="grid-column: span 2; padding: 40px;">
        <div class="modal-details-header" style="margin-bottom: 25px;">
          <h2 style="font-family: var(--font-serif); color: var(--accent-gold); font-size: 2.1rem; margin-bottom: 5px;">${salon.name}</h2>
          <p style="text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.1em; color: var(--accent-gold); margin-bottom: 8px;">${salon.location} Area</p>
          <div style="display:flex; align-items:center; gap: 8px;">
            <div class="stylist-rating-badge" style="position:static; padding: 4px 10px;">
              ${icons.star}
              <span>${salon.rating.toFixed(1)}</span>
            </div>
            <span style="font-size: 0.85rem; color: var(--text-muted);">${salon.luxuryLevel} Grade</span>
            <span style="color: var(--accent-gold);">|</span>
            <span style="font-size: 0.85rem; color: var(--text-muted);">${salon.homeService ? 'Home Service Available' : 'Salon-Only Service'}</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 40px; margin-bottom: 35px;" id="salon-details-layout">
          <!-- Left side details -->
          <div>
            <h3 style="font-size: 1.2rem; color: var(--accent-gold); margin-bottom: 12px; font-family: var(--font-serif);">Premium Amenities Available</h3>
            <div style="display:flex; flex-wrap:wrap; gap: 8px; margin-bottom: 30px;">
              ${salon.amenities.map(a => `<span class="skill-tag" style="font-size: 0.8rem; padding: 6px 12px;">${a}</span>`).join('')}
            </div>

            <h3 style="font-size: 1.2rem; color: var(--accent-gold); margin-bottom: 12px; font-family: var(--font-serif);">Salon Stylist Artisans</h3>
            <div style="display:flex; flex-direction:column; gap: 12px; margin-bottom: 30px;">
              ${salonStylists.map(s => `
                <div class="stylist-select-item glass-panel" style="padding: 12px 18px; pointer-events: none;">
                  <div style="display:flex; align-items:center; gap: 12px;">
                    <img src="${s.image}" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-gold);">
                    <div>
                      <h4 style="font-size: 0.95rem; font-weight: 600;">${s.name}</h4>
                      <p style="font-size: 0.75rem; color: var(--accent-gold);">${s.role}</p>
                    </div>
                  </div>
                  <div class="stylist-select-rating">
                    ${icons.star}
                    <span>${s.rating.toFixed(1)}</span>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Booking CTA -->
            <button class="btn-primary btn-full" id="salon-details-book-btn" data-salon-id="${salon.id}">
              Schedule Experience Here
            </button>
          </div>

          <!-- Right side Map Iframe (or coordinates display) -->
          <div>
            <h3 style="font-size: 1.2rem; color: var(--accent-gold); margin-bottom: 12px; font-family: var(--font-serif);">Google Maps Location</h3>
            <div style="width:100%; height:250px; border-radius:12px; border: 1px solid var(--glass-border); overflow:hidden;">
              <iframe 
                width="100%" 
                height="100%" 
                frameborder="0" 
                style="border:0;" 
                src="https://www.google.com/maps/embed/v1/place?key=MOCK_MAP_API_KEY&q=${encodeURIComponent(salon.name + ' ' + salon.location + ' Bangalore')}&zoom=14" 
                allowfullscreen>
              </iframe>
              <!-- Since it is a mock key, it displays a fallback message, which is perfect and realistic -->
            </div>
            <p style="font-size:0.75rem; color: var(--text-muted); margin-top:8px; text-align:center;">Coordinates: ${salon.coordinates[0]}, ${salon.coordinates[1]}</p>
          </div>
        </div>

        <!-- Verified Reviews/Testimonials Sub-Module -->
        <div class="reviews-container">
          <div class="reviews-header">
            <h3 style="font-family: var(--font-serif); color: var(--accent-gold); font-size: 1.4rem;">Verified Customer Reviews</h3>
          </div>
          
          <div class="reviews-list">
            ${salon.reviews.map(r => `
              <div class="review-card">
                <div class="review-meta">
                  <div>
                    <span class="review-author">${r.author}</span>
                    <span class="review-date" style="margin-left: 10px;">${r.date}</span>
                  </div>
                  <div class="review-stars">
                    ${Array.from({ length: 5 }).map((_, i) => `
                      <svg viewBox="0 0 24 24" style="fill: ${i < r.rating ? 'var(--accent-gold)' : 'transparent'}; stroke: var(--accent-gold); stroke-width: 1.5; width:12px; height:12px;">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                    `).join('')}
                  </div>
                </div>
                <p class="review-text">"${r.text}"</p>
              </div>
            `).join('')}
          </div>

          <!-- Add Review Form -->
          <div class="review-form glass-panel">
            <h4 class="review-form-title">Leave a Verified Review</h4>
            <div class="form-group">
              <label class="form-label">Reviewer Name</label>
              <input type="text" id="review-author-input" class="form-input" placeholder="Rohan Sharma" required>
            </div>
            <div class="form-group">
              <label class="form-label">Service Rating</label>
              <div class="rating-select-group" id="rating-select-group">
                ${[1, 2, 3, 4, 5].map(star => `
                  <svg class="rating-select-star ${star <= state.activeFormRating ? 'active' : ''}" data-value="${star}" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                `).join('')}
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Testimonial Comment</label>
              <textarea id="review-comment-input" class="form-input" style="height:80px; resize:none;" placeholder="Detail your grooming experience..."></textarea>
            </div>
            <button class="btn-primary" id="review-submit-btn" data-salon-id="${salon.id}">Submit Review</button>
          </div>
        </div>
      </div>
    </div>
  `
}

function renderWizardStep() {
  const salon = state.selectedSalon
  const stylist = state.selectedStylist
  
  if (state.currentStep !== -1 && state.currentStep !== 0 && !stylist) return ''

  if (state.currentStep === -1) {
    // Booking Step -1: Select Salon
    return `
      <div class="modal-details-header">
        <h3>Choose Salon Location</h3>
        <p>Select a luxury salon area to start your experience reservation.</p>
      </div>
      <div class="salon-select-list">
        ${state.salons.map(s => `
          <div class="salon-select-item glass-panel" data-select-salon-id="${s.id}">
            <div class="salon-select-info">
              <h4 class="salon-select-name">${s.name}</h4>
              <p class="salon-select-details">${s.location} Area <span>•</span> ${s.luxuryLevel}</p>
            </div>
            <div class="stylist-select-rating">
              ${icons.star}
              <span>${s.rating.toFixed(1)}</span>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="wizard-footer">
        <button class="btn-glass" id="wizard-step-1-cancel">Cancel</button>
        <div></div>
      </div>
    `
  } else if (state.currentStep === 0) {
    // Booking Step 0: Select Stylist (filtered by salon selection)
    const salonStylists = stylists.filter(s => salon.stylistIds.includes(s.id))
    return `
      <div class="modal-details-header">
        <h3>Choose Your Artisan</h3>
        <p>Select a master stylist associated with ${salon.name}.</p>
      </div>
      <div class="stylist-select-list">
        ${salonStylists.map(s => `
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
        <button class="btn-glass" id="wizard-step0-back">Back</button>
        <div></div>
      </div>
    `
  } else if (state.currentStep === 1) {
    // Booking Step 1: Select Services (linked to salon catalog)
    const availableServices = salon.services
    return `
      <div class="modal-details-header">
        <h3>Select Indulgences</h3>
        <p>Curated services provided by ${stylist.name} at ${salon.name}.</p>
      </div>
      <div class="services-list">
        ${availableServices.map(service => {
          const isChecked = state.selectedServices.some(s => s.id === service.id)
          return `
            <div class="service-item glass-panel ${isChecked ? 'selected' : ''}" data-service-id="${service.id}" style="${isChecked ? 'background: rgba(197, 168, 128, 0.08); border-color: var(--accent-gold);' : ''}">
              <input type="checkbox" class="service-checkbox" ${isChecked ? 'checked' : ''}>
              <div class="service-info">
                <p class="service-name">${service.name}</p>
                <p class="service-duration">${service.category}</p>
              </div>
              <div class="service-price">Rs. ${service.price.toLocaleString()}</div>
            </div>
          `
        }).join('')}
      </div>
      <div class="wizard-footer">
        <button class="btn-glass" id="wizard-step1-back">Back</button>
        <button class="btn-primary" id="wizard-step1-next" ${state.selectedServices.length === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
          Select Date & Time
        </button>
      </div>
    `
  } else if (state.currentStep === 2) {
    // Booking Step 2: Date, Time & Details
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
    // Booking Step 3: Success Ticket Receipt
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
                <span class="ticket-label">Salon</span>
                <span class="ticket-value" style="font-weight:600;">${booking.salonName} (${booking.salonArea})</span>
              </div>
              <div class="ticket-row">
                <span class="ticket-label">Stylist</span>
                <span class="ticket-value">${booking.stylistName}</span>
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
// Leaflet Map Initialization Engine
// ----------------------------------------------------
function initLeafletMap() {
  // Clear map reference if already initialized
  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
  }

  const mapContainer = document.querySelector('#map')
  if (!mapContainer) return

  // 1. Initialize Map centered on Bangalore
  leafletMap = L.map('map', {
    scrollWheelZoom: false
  }).setView([12.964, 77.635], 11)

  // 2. Add CartoDB Dark Matter tile layer for premium look
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  }).addTo(leafletMap)

  // 3. Define custom gold circle markers
  const goldIcon = L.divIcon({
    className: 'custom-gold-marker',
    html: `<div style="background-color: var(--accent-gold); width: 14px; height: 14px; border: 2.5px solid #000; border-radius: 50%; box-shadow: 0 0 12px var(--accent-gold);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  })

  // 4. Drop pins for each active salon
  state.salons.forEach(s => {
    if (s.coordinates) {
      const marker = L.marker(s.coordinates, { icon: goldIcon }).addTo(leafletMap)
      
      const popupHtml = `
        <div style="padding: 5px;">
          <h3>${s.name}</h3>
          <p>${s.location} Area • ⭐ ${s.rating.toFixed(1)}</p>
          <button class="btn-primary btn-map-explore" data-salon-id="${s.id}" style="width: 100%; border-radius: 20px; font-size: 0.7rem; padding: 5px 0; border: none; cursor: pointer; background: var(--accent-gold); color: #000; font-weight: bold;">Explore & Book</button>
        </div>
      `
      
      marker.bindPopup(popupHtml)
    }
  })
}

let nearMeMarkers = {}

function initNearMeMap() {
  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
  }

  const mapContainer = document.querySelector('#near-me-map')
  if (!mapContainer) return

  leafletMap = L.map('near-me-map', {
    scrollWheelZoom: false
  }).setView([12.964, 77.635], 11)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  }).addTo(leafletMap)

  const goldIcon = L.divIcon({
    className: 'custom-gold-marker',
    html: `<div style="background-color: var(--accent-gold); width: 14px; height: 14px; border: 2.5px solid #000; border-radius: 50%; box-shadow: 0 0 12px var(--accent-gold);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  })

  nearMeMarkers = {}

  const searchVal = state.nearMeSearch || ''
  const filtered = state.salons.filter(s => 
    s.name.toLowerCase().includes(searchVal.toLowerCase()) || 
    s.location.toLowerCase().includes(searchVal.toLowerCase())
  )

  filtered.forEach(s => {
    if (s.coordinates) {
      const marker = L.marker(s.coordinates, { icon: goldIcon }).addTo(leafletMap)
      
      const popupHtml = `
        <div style="padding: 5px;">
          <h3>${s.name}</h3>
          <p>${s.location} Area • ⭐ ${s.rating.toFixed(1)}</p>
          <button class="btn-primary btn-map-explore" data-salon-id="${s.id}" style="width: 100%; border-radius: 20px; font-size: 0.7rem; padding: 5px 0; border: none; cursor: pointer; background: var(--accent-gold); color: #000; font-weight: bold;">Explore & Book</button>
        </div>
      `
      
      marker.bindPopup(popupHtml)
      nearMeMarkers[s.id] = marker
    }
  })
}

// ----------------------------------------------------
// Glassy grow-out-of-card animation implementation
// ----------------------------------------------------
function openGlassyModal(clickedCardElement = null) {
  const overlay = document.querySelector('#modal-overlay')
  const container = document.querySelector('.modal-container')
  const contentBody = document.querySelector('#modal-content-body')

  if (!overlay || !container || !contentBody) return

  overlay.classList.add('open')
  contentBody.style.opacity = '0'
  container.style.overflowY = 'hidden'

  let startRect
  if (clickedCardElement) {
    startRect = clickedCardElement.getBoundingClientRect()
  } else {
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

  container.style.position = 'fixed'
  container.style.top = `${startRect.top}px`
  container.style.left = `${startRect.left}px`
  container.style.width = `${startRect.width}px`
  container.style.height = `${startRect.height}px`
  container.style.borderRadius = '16px'
  container.style.transition = 'none'

  container.offsetHeight // force reflow

  const isDesktop = window.innerWidth > 992
  const targetWidth = Math.min(window.innerWidth * 0.9, 900)
  // Expand height based on content type
  const isSalonDetails = state.modalType === 'salon-details'
  const targetHeight = Math.min(window.innerHeight * 0.9, isDesktop ? (isSalonDetails ? 750 : 650) : 850)
  const targetTop = (window.innerHeight - targetHeight) / 2
  const targetLeft = (window.innerWidth - targetWidth) / 2

  container.style.transition = 'top 0.6s cubic-bezier(0.16, 1, 0.3, 1), left 0.6s cubic-bezier(0.16, 1, 0.3, 1), width 0.6s cubic-bezier(0.16, 1, 0.3, 1), height 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
  container.style.top = `${targetTop}px`
  container.style.left = `${targetLeft}px`
  container.style.width = `${targetWidth}px`
  container.style.height = `${targetHeight}px`
  container.style.borderRadius = '20px'

  setTimeout(() => {
    contentBody.style.opacity = '1'
    container.style.overflowY = 'hidden'
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

  contentBody.style.opacity = '0'

  setTimeout(() => {
    let endRect
    // Shrink back to respective card if applicable
    if (state.modalType === 'salon-details' && state.selectedSalonDetail) {
      const card = document.querySelector(`.salon-card[data-salon-id="${state.selectedSalonDetail.id}"]`)
      if (card) endRect = card.getBoundingClientRect()
    } else if (state.selectedStylist) {
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

    container.style.top = `${endRect.top}px`
    container.style.left = `${endRect.left}px`
    container.style.width = `${endRect.width}px`
    container.style.height = `${endRect.height}px`
    container.style.borderRadius = '16px'

    overlay.classList.remove('open')

    setTimeout(() => {
      state.isModalOpen = false
      state.selectedSalonDetail = null
      state.selectedStylistDetail = null
      state.selectedSalon = null
      state.selectedStylist = null
      state.selectedServices = []
      state.selectedDate = null
      state.selectedTime = null
      state.latestBooking = null
      state.currentStep = -1
      renderApp()
    }, 600)
  }, 200)
}

// ----------------------------------------------------
// Chatbot Bot Processing Engine
// ----------------------------------------------------
function processChatbotQuery(query) {
  const norm = query.toLowerCase().trim()
  let reply = ''

  // Add User message and set typing state
  state.chatbotMessages.push({ sender: 'user', text: query })
  state.isTyping = true
  renderApp()
  scrollChatToBottom()

  // Match AI Response after simulated typing delay
  setTimeout(() => {
    // 1. Bridal Makeup Recommendations
    if (norm.includes('bridal') || norm.includes('wedding') || norm.includes('makeup') || norm.includes('bride')) {
      reply = `For bridal couture and elaborate wedding makeup, we highly recommend our master stylist and colorist <strong>Priya Sharma</strong>. Priya is trained in Paris and treats hair as a canvas to design breathtaking red carpet looks.<br><br>
      <strong>Available Services:</strong><br>
      • <em>Red Carpet / Bridal Hair Design</em> — ₹2,500 (60 mins)<br>
      • <em>Couture Balayage & Styling</em> — ₹6,500 (150 mins)<br>
      • <em>Luxury Global Hair Color</em> — ₹4,500 (90 mins)<br><br>
      Priya operates out of <strong>Aura Salon & Spa</strong> (Koramangala) and <strong>Vogue Artistry</strong> (Indiranagar).<br><br>
      👉 <span class="chat-link" data-action="view-stylist" data-id="priya-sharma">View Priya's Profile</span> or <span class="chat-link" data-action="view-salon" data-id="aura-koramangala">Book Aura Salon & Spa</span>.`
    }
    // 2. Hairstyles for Round, Oval, and Square Face Shapes
    else if (norm.includes('face') || norm.includes('shape') || norm.includes('round') || norm.includes('oval') || norm.includes('square') || norm.includes('hairstyle') || norm.includes('haircut')) {
      reply = `Hairstyles should always highlight your natural bone structure and soften angles:<br><br>
      • <strong>Round Face Shapes</strong>: Long textured layers, deep side parts, textured shags, or a high-volume undercut by <strong>Aarav Mehta</strong>. These styles elongate the face and add visual structure.<br>
      • <strong>Oval Face Shapes</strong>: The most versatile shape! You can carry off almost anything—try side-swept bangs, a blunt textured bob, or <strong>Priya Sharma's</strong> multi-dimensional <em>Couture Balayage</em> to perfectly frame your face.<br>
      • <strong>Square Face Shapes</strong>: Soft wispy side fringes, long layers with soft waves, or textured bobs. These help soften the strong angles of the jawline.<br><br>
      👉 <span class="chat-link" data-action="view-stylist" data-id="aarav-mehta">Book Aarav Mehta</span> or <span class="chat-link" data-action="view-stylist" data-id="priya-sharma">Book Priya Sharma</span>.`
    }
    // 3. Salon Suggestions Based on Budget
    else if (norm.includes('budget') || norm.includes('under') || norm.includes('₹') || norm.includes('price') || norm.includes('cost') || norm.includes('cheap') || norm.includes('affordable')) {
      const numbers = norm.match(/\d+/g)
      const maxVal = numbers ? Math.max(...numbers.map(Number)) : null
      
      if (maxVal !== null) {
        if (maxVal < 1000) {
          reply = `With a budget under ₹${maxVal.toLocaleString()}, we recommend:<br>
          • <strong>Luxury Beard Grooming & Trim</strong> (₹600) or <strong>Classic Hot Towel Shave</strong> (₹700) by master barber <strong>Kabir Malhotra</strong> at <em>The Royale Grooming</em> (Whitefield).<br><br>
          👉 <span class="chat-link" data-action="view-salon" data-id="royale-whitefield">Book The Royale Grooming</span>.`
        } else if (maxVal <= 2500) {
          reply = `For a budget under ₹${maxVal.toLocaleString()}, you can experience:<br>
          • <strong>Bespoke Handpainted Gel Art</strong> (₹2,200) or <strong>Luxurious Paraffin Hand & Arm Spa</strong> (₹1,500) by <strong>Ananya Sen</strong> at <em>Nail Couture & Lash Studio</em> (Jayanagar).<br>
          • <strong>Royal Signature Haircut</strong> (₹1,500) by <strong>Aarav Mehta</strong> at <em>Aura Salon & Spa</em> (Koramangala).<br><br>
          👉 <span class="chat-link" data-action="view-salon" data-id="nail-jayanagar">Book Nail Couture</span>.`
        } else if (maxVal <= 4000) {
          reply = `With a budget under ₹${maxVal.toLocaleString()}, we highly recommend:<br>
          • <strong>Organic Essential Oil Hair Spa</strong> (₹2,800) or <strong>Anti-Hairfall Treatment Ritual</strong> (₹3,200) by <strong>Meera Iyer</strong> at <em>Elixir Wellness</em> (Sadashivanagar).<br>
          • <strong>Gold Dust Dermal Glow Facial</strong> (₹4,000) or <strong>Hydra-Boost Intense Therapy</strong> (₹3,500) by skin specialist <strong>Vikram Singh</strong> at <em>Vogue Artistry</em> (Indiranagar).<br><br>
          👉 <span class="chat-link" data-action="view-salon" data-id="vogue-indiranagar">Book Vogue Artistry</span> or <span class="chat-link" data-action="view-salon" data-id="elixir-sadashivanagar">Book Elixir Wellness</span>.`
        } else {
          reply = `For a budget of ₹${maxVal.toLocaleString()} and above, pamper yourself with ultra-luxury services:<br>
          • <strong>Couture Balayage & Styling</strong> (₹6,500) or <strong>Luxury Global Hair Color</strong> (₹4,500) by <strong>Priya Sharma</strong> at <em>Aura Salon & Spa</em>.<br>
          • <strong>Premium Russian Lash Extensions</strong> (₹4,500) by <strong>Ananya Sen</strong> at <em>Nail Couture & Lash Studio</em>.<br><br>
          👉 <span class="chat-link" data-action="view-salon" data-id="aura-koramangala">Book Aura Salon & Spa</span>.`
        }
      } else {
        reply = `We offer services across all pricing tiers to suit your budget:<br><br>
        • <strong>Budget Friendly (₹)</strong>: <em>Nail Couture & Lash Studio</em> (Jayanagar). Gel nail art and hand spas starting at ₹1,500.<br>
        • <strong>Premium (₹₹)</strong>: <em>Vogue Artistry</em> (Indiranagar). Skincare and bespoke coloring from ₹2,000 - ₹5,000.<br>
        • <strong>Ultra Luxury (₹₹₹)</strong>: <em>Aura Salon & Spa</em> (Koramangala) & <em>The Royale Grooming</em> (Whitefield). Complete red carpet hair designs, private VIP cabins, valet parking, and complimentary champagne.<br><br>
        👉 <span class="chat-link" data-action="view-view" data-id="salons">View All Salons</span>.`
      }
    }
    // 4. Luxury Salon Recommendations by Location
    else if (norm.includes('luxury') || norm.includes('salon') || norm.includes('locations') || norm.includes('location') || norm.includes('suggest') || norm.includes('place') || norm.includes('koramangala') || norm.includes('indiranagar') || norm.includes('whitefield') || norm.includes('jayanagar') || norm.includes('sadashivanagar')) {
      reply = `Here are our elite luxury salon recommendations in Bangalore:<br><br>
      • <strong>Koramangala</strong>: <em>Aura Salon & Spa</em> (4.9 ★). Focuses on couture haircuts and balayage by Aarav and Priya. Amenities: Valet parking, VIP Lounge, Complimentary Champagne.<br>
      • <strong>Whitefield</strong>: <em>The Royale Grooming</em> (4.7 ★). Ultimate sanctuary for gentlemen. Highlights: Private cabins, therapeutic head massages, hot towel shaves by Kabir Malhotra. Amenities: Massage chairs.<br>
      • <strong>Sadashivanagar</strong>: <em>Elixir Wellness</em> (4.9 ★). Known for organic scalp treatments and precision haircuts. Amenities: Steam & sauna access, Organic Tea Service.<br>
      • <strong>Indiranagar</strong>: <em>Vogue Artistry</em> (4.8 ★). Skincare, balayage, and dermal glows. Amenities: Aroma therapy rooms, premium beverage bar.<br>
      • <strong>Jayanagar</strong>: <em>Nail Couture & Lash Studio</em> (4.9 ★). The premier spot for nail art and Russian lashes. Amenities: Nail Bar Lounge.<br><br>
      👉 Click a link above to book, or <span class="chat-link" data-action="view-view" data-id="salons">Explore All Locations on the Map</span>.`
    }
    // 5. Skin and Hair Care Suggestions
    else if (norm.includes('skin') || norm.includes('hair') || norm.includes('spa') || norm.includes('care') || norm.includes('facial') || norm.includes('glow') || norm.includes('massage') || norm.includes('dandruff') || norm.includes('hairfall')) {
      reply = `Revitalize your skin and hair with our specialized dermal and therapeutic rituals:<br><br>
      <strong>Premium Skincare:</strong><br>
      • <em>Gold Dust Dermal Glow Facial</em> (₹4,000) - 75 mins of intensive dermal sculpting by <strong>Vikram Singh</strong>.<br>
      • <em>Hydra-Boost Intense Therapy</em> (₹3,500) - 60 mins of deep hydration.<br><br>
      <strong>Premium Hair & Scalp Care:</strong><br>
      • <em>Organic Essential Oil Hair Spa</em> (₹2,800) - 60 mins of deep conditioning and scalp massage by <strong>Meera Iyer</strong>.<br>
      • <em>Anti-Hairfall Treatment Ritual</em> (₹3,200) - 75 mins targeted rebalancing.<br><br>
      👉 <span class="chat-link" data-action="view-stylist" data-id="vikram-singh">Book Skincare (Vikram)</span> or <span class="chat-link" data-action="view-stylist" data-id="meera-iyer">Book Hair Spa (Meera)</span>.`
    }
    // 6. Home Service Recommendations
    else if (norm.includes('home') || norm.includes('doorstep') || norm.includes('service') || norm.includes('at-home')) {
      reply = `Yes, we offer premium at-home styling and grooming services! You can enjoy the elite salon experience in the comfort of your home.<br><br>
      <strong>Home Service Providers:</strong><br>
      • <strong>Aura Salon & Spa</strong> (Koramangala) - Hair sculpting, blowouts, styling.<br>
      • <strong>The Royale Grooming</strong> (Whitefield) - Men's grooming, shaves, skin facials.<br>
      • <strong>Elixir Wellness</strong> (Sadashivanagar) - Hair spas, therapeutic treatments.<br><br>
      👉 <span class="chat-link" data-action="view-view" data-id="salons">Go to Salons and filter by Home Service</span>.`
    }
    // Default fallback
    else {
      reply = `Hello! I am Aura, your AI beauty concierge. I can assist you with:<br>
      • <strong>Bridal Makeup</strong>: Discover elite wedding styling packages.<br>
      • <strong>Hair Spa & Skincare</strong>: Custom therapies for hair and skin health.<br>
      • <strong>Face Shape Cuts</strong>: Best hair silhouettes for your bone structure.<br>
      • <strong>Luxury Salons</strong>: Explore locations, ratings, and exclusive amenities.<br>
      • <strong>Budget friendly</strong> or <strong>Home Services</strong>.<br><br>
      Feel free to ask a question, or use the quick suggestion buttons below!`
    }

    state.chatbotMessages.push({ sender: 'bot', text: reply })
    state.chatbotUnread = false
    state.isTyping = false
    renderApp()
    scrollChatToBottom()
  }, 1200)
}

function scrollChatToBottom() {
  const log = document.querySelector('#chatbot-chat-log')
  if (log) log.scrollTop = log.scrollHeight
}

// ----------------------------------------------------
// Calendar Engine Logic
// ----------------------------------------------------
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

// ----------------------------------------------------
// Global Event Listeners Configuration
// ----------------------------------------------------
function attachGlobalEventListeners() {
  // Mobile Hamburger menu toggle
  const menuBtn = document.querySelector('#menu-btn')
  const navLinks = document.querySelector('#nav-links')
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open')
    })
  }

  // Navigation Links click routing
  const logoBtn = document.querySelector('#logo-btn')
  if (logoBtn) {
    logoBtn.addEventListener('click', () => {
      state.activeView = 'landing'
      renderApp()
    })
  }

  const navHome = document.querySelector('#nav-home')
  if (navHome) {
    navHome.addEventListener('click', () => {
      state.activeView = 'landing'
      renderApp()
      if (navLinks.classList.contains('open')) navLinks.classList.remove('open')
    })
  }

  const navSalons = document.querySelector('#nav-salons')
  if (navSalons) {
    navSalons.addEventListener('click', () => {
      state.activeView = 'salons'
      renderApp()
      if (navLinks.classList.contains('open')) navLinks.classList.remove('open')
    })
  }

  const navNearMe = document.querySelector('#nav-near-me')
  if (navNearMe) {
    navNearMe.addEventListener('click', () => {
      state.activeView = 'near-me'
      renderApp()
      if (navLinks.classList.contains('open')) navLinks.classList.remove('open')
    })
  }

  const navStylists = document.querySelector('#nav-stylists')
  if (navStylists) {
    navStylists.addEventListener('click', () => {
      state.activeView = 'stylists'
      renderApp()
      if (navLinks.classList.contains('open')) navLinks.classList.remove('open')
    })
  }

  const navModels = document.querySelector('#nav-models')
  if (navModels) {
    navModels.addEventListener('click', () => {
      state.activeView = 'models'
      renderApp()
      if (navLinks.classList.contains('open')) navLinks.classList.remove('open')
    })
  }

  const navBookings = document.querySelector('#nav-bookings')
  if (navBookings) {
    navBookings.addEventListener('click', () => {
      state.activeView = 'bookings'
      renderApp()
      if (navLinks.classList.contains('open')) navLinks.classList.remove('open')
    })
  }

  // Direct Booking Wizard shortcut from navbar
  const navBookShortcut = document.querySelector('#nav-book-shortcut')
  if (navBookShortcut) {
    navBookShortcut.addEventListener('click', () => {
      state.selectedSalonDetail = null
      state.selectedSalon = null
      state.selectedStylist = null
      state.selectedServices = []
      state.selectedDate = null
      state.selectedTime = null
      state.currentStep = -1 // Start at select salon
      state.modalType = 'booking'
      state.isModalOpen = true
      
      if (navLinks.classList.contains('open')) navLinks.classList.remove('open')
      renderApp()
      openGlassyModal(null)
    })
  }

  // Landing page CTA buttons
  const landingExploreBtn = document.querySelector('#landing-explore-btn')
  if (landingExploreBtn) {
    landingExploreBtn.addEventListener('click', () => {
      state.activeView = 'salons'
      renderApp()
    })
  }

  const landingBookBtn = document.querySelector('#landing-book-btn')
  if (landingBookBtn) {
    landingBookBtn.addEventListener('click', () => {
      state.selectedSalon = null
      state.selectedStylist = null
      state.selectedServices = []
      state.selectedDate = null
      state.selectedTime = null
      state.currentStep = -1 // Choose salon first
      state.modalType = 'booking'
      state.isModalOpen = true
      renderApp()
      openGlassyModal(null)
    })
  }

  // Bookings empty page CTA
  const bookingsBookBtn = document.querySelector('#bookings-book-btn')
  if (bookingsBookBtn) {
    bookingsBookBtn.addEventListener('click', () => {
      state.activeView = 'salons'
      renderApp()
    })
  }

  // Floating Compare bar action
  const compareBarBtn = document.querySelector('#compare-bar-btn')
  if (compareBarBtn) {
    compareBarBtn.addEventListener('click', () => {
      state.activeView = 'compare'
      renderApp()
    })
  }

  const compareBackBtn = document.querySelector('#compare-back-btn')
  if (compareBackBtn) {
    compareBackBtn.addEventListener('click', () => {
      state.activeView = 'salons'
      renderApp()
    })
  }

  const compareBookBtns = document.querySelectorAll('.btn-compare-book')
  compareBookBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const salonId = btn.getAttribute('data-salon-id')
      const salon = state.salons.find(s => s.id === salonId)
      if (salon) {
        state.selectedSalon = salon
        state.selectedStylist = null
        state.selectedServices = []
        state.currentStep = 0 // Skip select salon, choose stylist next
        state.modalType = 'booking'
        state.isModalOpen = true
        renderApp()
        openGlassyModal(btn)
      }
    })
  })

  // Marketplace filter inputs listeners
  const searchInput = document.querySelector('#search-input')
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      state.filterSearch = searchInput.value
      // Debounce or instant render (since dataset is tiny, instant is highly responsive!)
      renderApp()
      // Put cursor back to end of search input
      const inputEl = document.querySelector('#search-input')
      if (inputEl) {
        inputEl.focus()
        inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length)
      }
    })
  }

  const selectLoc = document.querySelector('#filter-location')
  if (selectLoc) {
    selectLoc.addEventListener('change', () => {
      state.filterLocation = selectLoc.value
      renderApp()
    })
  }

  const selectPrice = document.querySelector('#filter-price')
  if (selectPrice) {
    selectPrice.addEventListener('change', () => {
      state.filterPrice = selectPrice.value
      renderApp()
    })
  }

  const selectService = document.querySelector('#filter-service')
  if (selectService) {
    selectService.addEventListener('change', () => {
      state.filterService = selectService.value
      renderApp()
    })
  }

  const selectHome = document.querySelector('#filter-home')
  if (selectHome) {
    selectHome.addEventListener('change', () => {
      state.filterHome = selectHome.value
      renderApp()
    })
  }

  // AI Recommendation matchmaking submission
  const matchSubmitBtn = document.querySelector('#ai-match-submit-btn')
  if (matchSubmitBtn) {
    matchSubmitBtn.addEventListener('click', () => {
      const text = document.querySelector('#ai-match-textarea').value
      processAiMatching(text)
    })
  }

  // Favorite ❤️ Toggle
  const favBtns = document.querySelectorAll('.btn-favorite')
  favBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const salonId = btn.getAttribute('data-salon-id')
      toggleFavorite(salonId)
    })
  })

  // Compare buttons on salon cards
  const compareBtns = document.querySelectorAll('.btn-compare-card')
  compareBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const salonId = btn.getAttribute('data-salon-compare-id')
      toggleCompare(salonId)
    })
  })

  // Clear all salons from comparison
  const compareClearBtn = document.querySelector('#compare-clear-btn')
  if (compareClearBtn) {
    compareClearBtn.addEventListener('click', () => {
      state.compareList = []
      saveState('bl_compare', state.compareList)
      renderApp()
    })
  }

  // Remove individual salon from comparison
  const removeCompareBtns = document.querySelectorAll('.remove-compare-btn')
  removeCompareBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const salonId = btn.getAttribute('data-salon-id')
      toggleCompare(salonId)
    })
  })

  // Explore Salon details click
  const exploreSalonBtns = document.querySelectorAll('.btn-salon-explore')
  exploreSalonBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const salonId = btn.getAttribute('data-salon-id')
      const salon = state.salons.find(s => s.id === salonId)
      if (salon) {
        state.selectedSalonDetail = salon
        state.modalType = 'salon-details'
        state.isModalOpen = true
        state.activeFormRating = 5 // reset form rating
        renderApp()
        openGlassyModal(btn)
      }
    })
  })

  // Stylist Card Click -> Open Stylist detail/booking direct
  const stylistCards = document.querySelectorAll('.stylist-card')
  stylistCards.forEach(card => {
    card.addEventListener('click', () => {
      const stylistId = card.getAttribute('data-id')
      const stylist = stylists.find(s => s.id === stylistId)
      if (stylist) {
        // Find salon associated with stylist
        const salon = state.salons.find(s => s.stylistIds.includes(stylist.id))
        state.selectedSalon = salon
        state.selectedStylist = stylist
        state.selectedServices = []
        state.selectedDate = null
        state.selectedTime = null
        state.currentStep = 1 // Start directly at service list
        state.modalType = 'booking'
        state.isModalOpen = true
        renderApp()
        openGlassyModal(card)
      }
    })
  })

  // Model Card book look action click
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
          const salon = state.salons.find(s => s.stylistIds.includes(model.stylistId))
          
          if (stylist && salon) {
            state.selectedSalon = salon
            state.selectedStylist = stylist
            state.selectedServices = []

            // Auto-check corresponding serviceId
            let serviceId = ''
            if (model.id === 'model-1') serviceId = 'by-bespoke'
            else if (model.id === 'model-2') serviceId = 'hc-royal'
            else if (model.id === 'model-3') serviceId = 'st-bridal'
            else if (model.id === 'model-4') serviceId = 'hc-royal'

            const service = salon.services.find(s => s.id === serviceId)
            if (service) {
              state.selectedServices.push(service)
            }

            state.selectedDate = null
            state.selectedTime = null
            state.currentStep = 1
            state.modalType = 'booking'
            state.isModalOpen = true

            renderApp()
            openGlassyModal(card)
          }
        }
      })
    }
  })

  // Modal Close trigger
  const modalCloseBtn = document.querySelector('#modal-close-btn')
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      closeGlassyModal()
    })
  }

  // Floating Chatbot UI triggers
  const chatbotFab = document.querySelector('#chatbot-fab')
  if (chatbotFab) {
    chatbotFab.addEventListener('click', () => {
      state.chatbotOpen = !state.chatbotOpen
      state.chatbotUnread = false
      renderApp()
      scrollChatToBottom()
    })
  }

  const chatbotClose = document.querySelector('#chatbot-close')
  if (chatbotClose) {
    chatbotClose.addEventListener('click', () => {
      state.chatbotOpen = false
      renderApp()
    })
  }

  const chatbotSendBtn = document.querySelector('#chatbot-send-btn')
  const chatbotInput = document.querySelector('#chatbot-input')
  
  if (chatbotSendBtn && chatbotInput) {
    chatbotSendBtn.addEventListener('click', () => {
      const q = chatbotInput.value.trim()
      if (q) {
        chatbotInput.value = ''
        processChatbotQuery(q)
      }
    })
    
    chatbotInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const q = chatbotInput.value.trim()
        if (q) {
          chatbotInput.value = ''
          processChatbotQuery(q)
        }
      }
    })
  }

  // Chatbot question shortcuts clicking
  const shortcutBtns = document.querySelectorAll('.chat-shortcut-btn')
  shortcutBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-query')
      processChatbotQuery(q)
    })
  })

  // Chatbot event delegation for inline actions inside messages
  const chatLog = document.querySelector('#chatbot-chat-log')
  if (chatLog) {
    chatLog.addEventListener('click', (e) => {
      const link = e.target.closest('.chat-link')
      if (!link) return
      
      const action = link.getAttribute('data-action')
      const id = link.getAttribute('data-id')
      
      // Close the chatbot panel first for a smooth transition
      state.chatbotOpen = false
      
      if (action === 'view-stylist') {
        const stylist = stylists.find(s => s.id === id)
        const salon = state.salons.find(s => s.stylistIds.includes(id))
        if (stylist && salon) {
          state.selectedSalon = salon
          state.selectedStylist = stylist
          state.selectedServices = []
          state.currentStep = 1 // Service selection step
          state.modalType = 'booking'
          state.isModalOpen = true
          renderApp()
          openGlassyModal(null)
        }
      } else if (action === 'view-salon') {
        const salon = state.salons.find(s => s.id === id)
        if (salon) {
          state.selectedSalon = salon
          state.selectedStylist = null
          state.selectedServices = []
          state.currentStep = 0 // Stylist selection step
          state.modalType = 'booking'
          state.isModalOpen = true
          renderApp()
          openGlassyModal(null)
        }
      } else if (action === 'view-view') {
        state.activeView = id // e.g. 'salons'
        if (id === 'salons') {
          state.filterHome = 'false'
        }
        renderApp()
      }
    })
  }

  // Reviews Submission logic inside Salon details modal
  const starBtns = document.querySelectorAll('.rating-select-star')
  starBtns.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.getAttribute('data-value'))
      state.activeFormRating = val
      
      // Update star classes instantly
      starBtns.forEach(s => {
        const starVal = parseInt(s.getAttribute('data-value'))
        if (starVal <= val) {
          s.classList.add('active')
        } else {
          s.classList.remove('active')
        }
      })
    })
  })

  const reviewSubmitBtn = document.querySelector('#review-submit-btn')
  if (reviewSubmitBtn) {
    reviewSubmitBtn.addEventListener('click', () => {
      const salonId = reviewSubmitBtn.getAttribute('data-salon-id')
      const authorVal = document.querySelector('#review-author-input').value.trim()
      const commentVal = document.querySelector('#review-comment-input').value.trim()

      if (!authorVal || !commentVal) {
        alert('Please complete both name and testimonial fields to submit your verified review.')
        return
      }

      const salon = state.salons.find(s => s.id === salonId)
      if (salon) {
        // Add new review
        const newReview = {
          author: authorVal,
          text: commentVal,
          rating: state.activeFormRating,
          date: new Date().toISOString().split('T')[0]
        }
        
        salon.reviews.unshift(newReview)
        
        // Recalculate average rating of salon
        const sumRating = salon.reviews.reduce((sum, r) => sum + r.rating, 0)
        salon.rating = sumRating / salon.reviews.length
        
        saveState('bl_salons', state.salons)
        
        alert('Thank you! Your verified customer review has been added.')
        
        // Rerender Modal
        const detailsBody = document.querySelector('#modal-content-body')
        if (detailsBody) {
          detailsBody.innerHTML = renderSalonDetailsModal()
          attachGlobalEventListeners()
        }
      }
    })
  }

  // Booking details CTA inside Salon Details Modal
  const detailsBookBtn = document.querySelector('#salon-details-book-btn')
  if (detailsBookBtn) {
    detailsBookBtn.addEventListener('click', () => {
      const salonId = detailsBookBtn.getAttribute('data-salon-id')
      const salon = state.salons.find(s => s.id === salonId)
      if (salon) {
        // Switch modal view from details to booking wizard
        state.selectedSalon = salon
        state.selectedStylist = null
        state.selectedServices = []
        state.currentStep = 0 // Advance directly to choose stylist
        state.modalType = 'booking'
        
        const detailsBody = document.querySelector('#modal-content-body')
        if (detailsBody) {
          detailsBody.innerHTML = renderModalContent()
          attachGlobalEventListeners()
        }
      }
    })
  }

  // Step-wizard booking navigation events
  if (state.isModalOpen && state.modalType === 'booking') {
    if (state.currentStep === -1) {
      attachStepMinus1EventListeners()
    } else if (state.currentStep === 0) {
      attachStep0EventListeners()
    } else if (state.currentStep === 1) {
      attachStep1EventListeners()
    } else if (state.currentStep === 2) {
      attachStep2EventListeners()
    } else if (state.currentStep === 3) {
      attachStep3EventListeners()
    }
  }

  // Booking Cancel Action
  const cancelBtns = document.querySelectorAll('.btn-cancel')
  cancelBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(btn.getAttribute('data-index'))
      if (confirm('Are you sure you want to cancel this reservation?')) {
        state.bookings.splice(index, 1)
        saveState('bl_bookings', state.bookings)
        renderApp()
      }
    })
  })

  // Near Me section listeners
  const nearMeSearch = document.querySelector('#near-me-search')
  if (nearMeSearch) {
    nearMeSearch.addEventListener('input', () => {
      state.nearMeSearch = nearMeSearch.value
      renderApp()
      const inputEl = document.querySelector('#near-me-search')
      if (inputEl) {
        inputEl.focus()
        inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length)
      }
    })
  }

  const nearMeCards = document.querySelectorAll('.near-me-card')
  nearMeCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a') || e.target.closest('button')) return

      const salonId = card.getAttribute('data-salon-id')
      const lat = parseFloat(card.getAttribute('data-lat'))
      const lng = parseFloat(card.getAttribute('data-lng'))

      if (leafletMap && lat && lng) {
        leafletMap.setView([lat, lng], 14, { animate: true })
      }

      const marker = nearMeMarkers[salonId]
      if (marker) {
        marker.openPopup()
      }

      nearMeCards.forEach(c => c.classList.remove('active'))
      card.classList.add('active')
    })
  })

  const nearMeBookBtns = document.querySelectorAll('.btn-near-me-book')
  nearMeBookBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const salonId = btn.getAttribute('data-salon-id')
      const salon = state.salons.find(s => s.id === salonId)
      if (salon) {
        state.selectedSalon = salon
        state.selectedStylist = null
        state.selectedServices = []
        state.currentStep = 0
        state.modalType = 'booking'
        state.isModalOpen = true
        renderApp()
        openGlassyModal(btn)
      }
    })
  })
}

// ----------------------------------------------------
// Wizard Step Navigators
// ----------------------------------------------------
function attachStepMinus1EventListeners() {
  const items = document.querySelectorAll('.salon-select-item')
  items.forEach(item => {
    item.addEventListener('click', () => {
      const salonId = item.getAttribute('data-select-salon-id')
      const salon = state.salons.find(s => s.id === salonId)
      if (salon) {
        state.selectedSalon = salon
        state.currentStep = 0 // Proceed to Stylists selector
        
        const modalBody = document.querySelector('#modal-content-body')
        if (modalBody) {
          modalBody.innerHTML = renderModalContent()
          attachStep0EventListeners()
        }
      }
    })
  })

  const cancelBtn = document.querySelector('#wizard-step-1-cancel')
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      closeGlassyModal()
    })
  }
}

function attachStep0EventListeners() {
  const items = document.querySelectorAll('.stylist-select-item')
  items.forEach(item => {
    item.addEventListener('click', () => {
      const stylistId = item.getAttribute('data-select-stylist-id')
      const stylist = stylists.find(s => s.id === stylistId)
      if (stylist) {
        state.selectedStylist = stylist
        state.currentStep = 1 // Proceed to Services checklist
        
        const modalBody = document.querySelector('#modal-content-body')
        if (modalBody) {
          modalBody.innerHTML = renderModalContent()
          attachStep1EventListeners()
        }
      }
    })
  })

  const backBtn = document.querySelector('#wizard-step0-back')
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      state.selectedSalon = null
      state.currentStep = -1 // Go back to salon selection
      const modalBody = document.querySelector('#modal-content-body')
      if (modalBody) {
        modalBody.innerHTML = renderModalContent()
        attachStepMinus1EventListeners()
      }
    })
  }
}

function attachStep1EventListeners() {
  const items = document.querySelectorAll('.service-item')
  items.forEach(item => {
    item.addEventListener('click', () => {
      const serviceId = item.getAttribute('data-service-id')
      const salon = state.selectedSalon
      const service = salon.services.find(s => s.id === serviceId)
      
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
      state.calendarDate = new Date()
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
        salonId: state.selectedSalon.id,
        salonName: state.selectedSalon.name,
        salonArea: state.selectedSalon.location,
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
      saveState('bl_bookings', state.bookings)
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

// Helper to center active Leaflet marker popups exploring via external links
window.exploreSalonFromMap = function(salonId) {
  const salon = state.salons.find(s => s.id === salonId)
  if (salon) {
    state.selectedSalonDetail = salon
    state.modalType = 'salon-details'
    state.isModalOpen = true
    renderApp()
    openGlassyModal(null)
  }
}

// Delegate button explore clicks inside Leaflet popup elements
document.addEventListener('click', (e) => {
  if (e.target && e.target.classList.contains('btn-map-explore')) {
    const salonId = e.target.getAttribute('data-salon-id')
    window.exploreSalonFromMap(salonId)
  }
})

// ----------------------------------------------------
// Initial Bootstrapping
// ----------------------------------------------------
renderApp()
