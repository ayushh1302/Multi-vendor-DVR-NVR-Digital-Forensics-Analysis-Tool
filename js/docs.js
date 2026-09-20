/**
 * BRUCH.DFA - Documentation Module
 * Handles documentation navigation, SOP switching, terminal snippet copying,
 * and deep-linking into specific SOP sections.
 */

const ForensicDocs = {
  init() {
    this.bindDocLinks();
    this.bindCopyButtons();

    // Listen to route changes to load sub-routes (e.g. #docs/sop-03)
    window.addEventListener('routeChanged', (e) => {
      if (e.detail && e.detail.route === 'docs' && e.detail.subRoute) {
        this.scrollToDocSection(e.detail.subRoute);
      }
    });
  },

  bindDocLinks() {
    const docLinks = document.querySelectorAll('.docs-nav-link');
    docLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-doc-target');
        
        docLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        this.scrollToDocSection(targetId);
      });
    });
  },

  scrollToDocSection(sectionId) {
    const targetEl = document.getElementById(sectionId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  bindCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const wrapper = button.closest('.code-block-wrapper');
        if (!wrapper) return;
        const codeElement = wrapper.querySelector('.code-content');
        if (!codeElement) return;

        const text = codeElement.innerText;
        navigator.clipboard.writeText(text).then(() => {
          const originalText = button.innerText;
          button.innerText = 'Copied';
          button.style.color = '#10B981';
          button.style.borderColor = '#10B981';
          setTimeout(() => {
            button.innerText = originalText;
            button.style.color = '';
            button.style.borderColor = '';
          }, 2000);
        }).catch(err => {
          console.error('Failed to copy: ', err);
        });
      });
    });
  }
};

window.ForensicDocs = ForensicDocs;
