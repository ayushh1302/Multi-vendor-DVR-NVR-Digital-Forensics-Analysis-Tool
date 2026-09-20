/**
 * BRUCH.DFA - Single Page Application Router
 * Controls view switching between the 7 primary pages/sections:
 * #home, #features, #how-it-works, #vendors, #demo, #docs, #contact
 */

class ForensicRouter {
  constructor() {
    this.validRoutes = [
      'home',
      'features',
      'how-it-works',
      'vendors',
      'demo',
      'ai-analysis',
      'ai-chatbot',
      'reports',
      'docs',
      'contact',
      'login',
      'register',
      'privacy',
      'terms'
    ];
    this.defaultRoute = 'home';
    this.init();
  }

  init() {
    window.addEventListener('hashchange', () => this.handleHashChange());
    window.addEventListener('DOMContentLoaded', () => this.handleHashChange());
  }

  handleHashChange() {
    let hash = window.location.hash.replace('#', '').trim();
    
    // Support sub-hashes like #docs/sop-01
    let routeParts = hash.split('/');
    let primaryRoute = routeParts[0];

    if (!this.validRoutes.includes(primaryRoute)) {
      primaryRoute = this.defaultRoute;
    }

    this.navigate(primaryRoute, routeParts[1]);
  }

  navigate(route, subRoute = null) {
    // Hide all view containers
    document.querySelectorAll('.view-section').forEach(section => {
      section.style.display = 'none';
    });

    // Show active view container
    const activeSection = document.getElementById(`view-${route}`);
    if (activeSection) {
      activeSection.style.display = 'block';
    }

    // Update global navigation active link
    document.querySelectorAll('.nav-link').forEach(link => {
      const linkTarget = link.getAttribute('href').replace('#', '').split('/')[0];
      if (linkTarget === route) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Broadcast route change event
    const event = new CustomEvent('routeChanged', { detail: { route, subRoute } });
    window.dispatchEvent(event);
  }
}

window.ForensicRouter = new ForensicRouter();
