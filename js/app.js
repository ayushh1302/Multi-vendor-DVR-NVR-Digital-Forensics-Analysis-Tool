/**
 * BRUCH.DFA - Main Application Orchestrator
 * Controls Azure-style scroll slide-up animations, fluid accordion disclosures,
 * mobile drawer controls, and evidentiary intake tickets.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Submodules
  if (window.ForensicDemoEngine) window.ForensicDemoEngine.init();
  if (window.ForensicDocs) window.ForensicDocs.init();

  // 1b. Light / Dark Theme Switcher
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeToggleLabel = document.getElementById('theme-toggle-label');
  const themeToggleIcon = document.getElementById('theme-toggle-icon');

  function updateThemeUI(theme) {
    if (!themeToggleBtn) return;
    if (theme === 'light') {
      if (themeToggleLabel) themeToggleLabel.innerText = 'Dark';
      if (themeToggleIcon) {
        themeToggleIcon.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        `;
      }
    } else {
      if (themeToggleLabel) themeToggleLabel.innerText = 'Light';
      if (themeToggleIcon) {
        themeToggleIcon.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        `;
      }
    }
  }

  const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  updateThemeUI(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('dvr_forensics_theme', newTheme);
      updateThemeUI(newTheme);
    });
  }

  // 2. Azure-Style Intersection Observer for Scroll Slide-Up Animations
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.1
  };

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, observerOptions);

  function observeRevealElements() {
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => scrollObserver.observe(el));
  }

  // Initial observe
  observeRevealElements();

  // Re-trigger scroll animations whenever the SPA route changes
  window.addEventListener('routeChanged', () => {
    setTimeout(() => {
      // Find all reveals inside the newly visible section
      const activeSection = document.querySelector('.view-section:not([style*="display: none"])');
      if (activeSection) {
        const reveals = activeSection.querySelectorAll('.reveal');
        reveals.forEach((el, index) => {
          el.classList.remove('is-visible');
          // Stagger slightly if in viewport
          setTimeout(() => {
            el.classList.add('is-visible');
          }, index * 40);
        });
      }
    }, 50);
  });

  // 3. Features Page - Fluid Accordion Disclosure Rows
  const featureRows = document.querySelectorAll('.feature-disclosure-row');
  featureRows.forEach(row => {
    row.addEventListener('click', () => {
      const isOpen = row.classList.contains('is-open');
      // Optional: keep others open or accordion style
      // Let's toggle smoothly
      if (isOpen) {
        row.classList.remove('is-open');
      } else {
        row.classList.add('is-open');
      }
    });
  });

  // 4. Mobile Navigation Toggle
  const navToggleBtn = document.getElementById('nav-toggle-btn');
  const navLinksContainer = document.getElementById('nav-links');

  if (navToggleBtn && navLinksContainer) {
    navToggleBtn.addEventListener('click', () => {
      navLinksContainer.classList.toggle('is-open');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinksContainer.classList.remove('is-open');
      });
    });
  }

  // 5. Contact Form Submission Handling
  const contactForm = document.getElementById('contact-form');
  const contactModal = document.getElementById('contact-success-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('contact-name').value.trim();
      const org = document.getElementById('contact-org').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      if (!name || !email || !message) {
        alert('Please complete all required fields (Name, Email, Message).');
        return;
      }

      const ticketId = `INTAKE-LE-${Math.floor(100000 + Math.random() * 900000)}`;
      const timestamp = new Date().toUTCString();

      const ticketEl = document.getElementById('modal-ticket-id');
      const timeEl = document.getElementById('modal-ticket-time');
      const orgEl = document.getElementById('modal-ticket-org');

      if (ticketEl) ticketEl.innerText = ticketId;
      if (timeEl) timeEl.innerText = timestamp;
      if (orgEl) orgEl.innerText = org || 'Verified Entity';

      if (contactModal) {
        contactModal.style.display = 'flex';
      }

      contactForm.reset();
    });
  }

  if (modalCloseBtn && contactModal) {
    modalCloseBtn.addEventListener('click', () => {
      contactModal.style.display = 'none';
    });

    contactModal.addEventListener('click', (e) => {
      if (e.target === contactModal) {
        contactModal.style.display = 'none';
      }
    });
  }

  // 6. Evidentiary & Essential Cookie Consent Banner
  const cookieBanner = document.getElementById('cookie-consent-banner');
  const btnCookieAccept = document.getElementById('btn-cookie-accept');
  const btnCookieEssential = document.getElementById('btn-cookie-essential');

  function triggerCookieBanner() {
    if (cookieBanner) {
      setTimeout(() => {
        cookieBanner.classList.add('is-active');
      }, 400);
    }
  }

  if (cookieBanner) {
    // If already logged in and hasn't consented yet, pop up banner
    const isLoggedIn = sessionStorage.getItem('dvr_active_examiner');
    const consentStored = localStorage.getItem('dvr_forensics_cookie_consent');
    if (isLoggedIn && !consentStored) {
      triggerCookieBanner();
    }

    if (btnCookieAccept) {
      btnCookieAccept.addEventListener('click', () => {
        localStorage.setItem('dvr_forensics_cookie_consent', 'accepted_all');
        cookieBanner.classList.remove('is-active');
      });
    }

    if (btnCookieEssential) {
      btnCookieEssential.addEventListener('click', () => {
        localStorage.setItem('dvr_forensics_cookie_consent', 'essential_only');
        cookieBanner.classList.remove('is-active');
      });
    }
  }

  // 7. Forensic Authentication (Login & Register) Handlers
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const authStatusEl = document.getElementById('header-auth-status');
  const guestLoginBtn = document.getElementById('btn-guest-login');

  function checkAuthSession() {
    const activeUser = sessionStorage.getItem('dvr_active_examiner');
    if (activeUser && authStatusEl) {
      authStatusEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="width: 6px; height: 6px; border-radius: 50%; background-color: var(--status-verified);"></span>
          <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-primary);">${activeUser}</span>
          <button class="btn btn-outline btn-sm" id="btn-logout" style="padding: 2px 8px; font-size: 10px;">Sign Out</button>
        </div>
      `;
      const logoutBtn = document.getElementById('btn-logout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          sessionStorage.removeItem('dvr_active_examiner');
          checkAuthSession();
          window.location.hash = '#login';
        });
      }
    } else if (authStatusEl) {
      authStatusEl.innerHTML = `
        <a href="#login" class="btn btn-outline btn-sm">Sign In</a>
      `;
    }
  }

  checkAuthSession();

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const idVal = document.getElementById('login-id').value.trim();
      const passVal = document.getElementById('login-pass').value.trim();

      if (!idVal || !passVal) {
        alert('Please enter your Investigator Badge ID / Official Email and Password.');
        return;
      }

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.innerText = 'Authenticating Cryptographic Credentials...';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        sessionStorage.setItem('dvr_active_examiner', idVal.includes('@') ? idVal.split('@')[0] : idVal);
        checkAuthSession();
        if (submitBtn) {
          submitBtn.innerText = 'Access Granted';
          submitBtn.disabled = false;
        }
        window.location.hash = '#home';
        // Pop up the cookies banner as we logged in
        triggerCookieBanner();
      }, 500);
    });
  }

  if (guestLoginBtn) {
    guestLoginBtn.addEventListener('click', () => {
      sessionStorage.setItem('dvr_active_examiner', 'Guest Examiner');
      checkAuthSession();
      window.location.hash = '#home';
      // Pop up the cookies banner as we logged in
      triggerCookieBanner();
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const agency = document.getElementById('reg-agency').value.trim();
      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const badge = document.getElementById('reg-badge').value.trim();
      const pass = document.getElementById('reg-pass').value.trim();

      if (!agency || !name || !email || !badge || !pass) {
        alert('Please complete all agency registration fields.');
        return;
      }

      const submitBtn = registerForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.innerText = 'Issuing Public Key Certificate...';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        alert(`Agency registration credentials generated for ${agency}. Proceeding to Examiner Sign-In.`);
        if (submitBtn) {
          submitBtn.innerText = 'Register Agency Account';
          submitBtn.disabled = false;
        }
        window.location.hash = '#login';
      }, 700);
    });
  }
});
