// Main JavaScript for leapp.studio Landing Page
// Handles interactions, form submissions, and conversion optimization

document.addEventListener('DOMContentLoaded', function() {
    
    // Navigation Color Change on Scroll
    const navbar = document.getElementById('navbar');
    const navLinks = navbar.querySelectorAll('a:not(.bg-leapp-primary)');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    
    function updateNavbarColors() {
        const scrollY = window.scrollY;
        const heroSection = document.querySelector('.hero-bg');
        const heroHeight = heroSection ? heroSection.offsetHeight : 0;
        
        // Check if we're in the hero section (dark background)
        if (scrollY < heroHeight - 100) {
            // In hero section - use dark theme
            navbar.classList.remove('nav-light');
            navbar.classList.add('nav-dark');
        } else {
            // In white sections - use light theme
            navbar.classList.remove('nav-dark');
            navbar.classList.add('nav-light');
        }
    }
    
    // Initial call and scroll listener - start with dark theme for hero
    navbar.classList.add('nav-dark');
    updateNavbarColors();
    
    window.addEventListener('scroll', function() {
        updateNavbarColors();
    });
    
    // Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
        const scrollY = window.scrollY;
        const heroSection = document.querySelector('.hero-bg');
        const heroHeight = heroSection ? heroSection.offsetHeight : 0;
        

    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            

            
            // Update icon
            const icon = mobileMenuBtn.querySelector('i');
            if (mobileMenu.classList.contains('hidden')) {
                icon.className = 'fas fa-bars text-2xl';
            } else {
                icon.className = 'fas fa-times text-2xl';
            }
        });
    }
    
    // Smooth Scrolling for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    const icon = mobileMenuBtn.querySelector('i');
                    icon.className = 'fas fa-bars text-2xl';
                }
            }
        });
    });
    
    // Audit Form Submission
    const auditForm = document.getElementById('audit-form');
    if (auditForm) {
        auditForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(auditForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                company: formData.get('company'),
                revenue: formData.get('revenue'),
                challenge: formData.get('challenge'),
                privacy: formData.get('privacy'),
                timestamp: new Date().toISOString(),
                source: 'leapp-studio-landing'
            };
            
            // Validate required fields
            if (!data.name || !data.email || !data.revenue || !data.challenge || !data.privacy) {
                showNotification('Bitte fülle alle Pflichtfelder aus.', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = auditForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Wird versendet...';
            submitBtn.disabled = true;
            
            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                // Success simulation
                showNotification(
                    'Perfekt! Dein Audit-Antrag wurde erfolgreich versendet. Du erhältst innerhalb von 24h eine Rückmeldung.',
                    'success'
                );
                
                // Reset form
                auditForm.reset();
                
                // Track conversion event
                trackConversion('audit_form_submission', data);
                
                // Restore button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                // Optional: Redirect to thank you page or show thank you modal
                showThankYouModal();
                
            }, 2000);
        });
    }
    
    // CTA Button Tracking
    document.querySelectorAll('[href="#audit"], [href="#contact"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('href') === '#audit' ? 'audit_cta_click' : 'contact_cta_click';
            trackConversion(action, {
                button_text: this.textContent.trim(),
                button_location: getButtonLocation(this)
            });
        });
    });
    
    // Scroll-based CTA visibility tracking
    let ctaVisible = false;
    const observeCallToAction = () => {
        const auditSection = document.getElementById('audit');
        if (!auditSection) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !ctaVisible) {
                    ctaVisible = true;
                    trackConversion('audit_section_viewed', {
                        scroll_depth: getScrollDepth()
                    });
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(auditSection);
    };
    
    // Service Card Interactions
    document.querySelectorAll('.shadow-lg').forEach(card => {
        card.addEventListener('mouseenter', function() {
            const serviceTitle = this.querySelector('h4')?.textContent || 'Unknown Service';
            trackConversion('service_card_hover', {
                service: serviceTitle
            });
        });
    });
    
    // Testimonial Interaction Tracking
    document.querySelectorAll('.bg-gray-800').forEach(testimonial => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const testimonialAuthor = entry.target.querySelector('.font-semibold')?.textContent || 'Unknown';
                    trackConversion('testimonial_viewed', {
                        author: testimonialAuthor,
                        scroll_depth: getScrollDepth()
                    });
                }
            });
        }, { threshold: 0.7 });
        
        observer.observe(testimonial);
    });
    
    // Revenue Calculator (Interactive Feature)
    createRevenueCalculator();
    
    // Initialize scroll-based tracking
    observeCallToAction();
    
    // Page load tracking
    trackConversion('page_loaded', {
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        timestamp: new Date().toISOString()
    });
});

// Utility Functions

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification fixed top-20 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white',
        warning: 'bg-yellow-500 text-black'
    };
    
    notification.className += ` ${colors[type]}`;
    
    const icon = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle',
        warning: 'fas fa-exclamation-triangle'
    };
    
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="${icon[type]} mr-3"></i>
            <span>${message}</span>
            <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function showThankYouModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
    
    modal.innerHTML = `
        <div class="bg-white p-8 rounded-2xl shadow-2xl max-w-md mx-4 transform transition-all duration-300 scale-95">
            <div class="text-center">
                <div class="text-green-500 text-6xl mb-4">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3 class="text-2xl font-bold mb-4">Vielen Dank!</h3>
                <p class="text-gray-600 mb-6">
                    Dein Audit-Antrag wurde erfolgreich versendet. 
                    Du erhältst innerhalb von 24h eine detaillierte Analyse per E-Mail.
                </p>
                <div class="space-y-3">
                    <button onclick="this.closest('.fixed').remove()" 
                            class="w-full bg-leapp-blue text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                        Perfekt!
                    </button>
                    <p class="text-sm text-gray-500">
                        <i class="fas fa-calendar mr-1"></i>
                        Terminbuchung für ein Strategiegespräch folgt in der E-Mail
                    </p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => {
        modal.querySelector('.transform').classList.remove('scale-95');
        modal.querySelector('.transform').classList.add('scale-100');
    }, 100);
    
    // Close on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function trackConversion(event, data = {}) {
    // Conversion tracking for analytics
    console.log('Conversion Event:', event, data);
    
    // Google Analytics 4 (if implemented)
    if (typeof gtag !== 'undefined') {
        gtag('event', event, {
            event_category: 'leapp_studio',
            event_label: data.service || data.button_text || '',
            value: data.revenue || 0,
            custom_parameters: data
        });
    }
    
    // Facebook Pixel (if implemented)
    if (typeof fbq !== 'undefined') {
        fbq('track', 'CustomEvent', {
            event_name: event,
            content_name: 'leapp.studio Landing Page',
            ...data
        });
    }
    
    // Custom analytics or CRM integration
    // This is where you'd send data to your CRM or analytics service
    
    // Store locally for analytics
    const events = JSON.parse(localStorage.getItem('leapp_events') || '[]');
    events.push({
        event,
        data,
        timestamp: new Date().toISOString(),
        url: window.location.href
    });
    localStorage.setItem('leapp_events', JSON.stringify(events.slice(-50))); // Keep last 50 events
}

function getButtonLocation(button) {
    const rect = button.getBoundingClientRect();
    const sections = ['hero', 'services', 'case-studies', 'audit', 'about'];
    
    for (let section of sections) {
        const sectionEl = document.getElementById(section);
        if (sectionEl) {
            const sectionRect = sectionEl.getBoundingClientRect();
            if (rect.top >= sectionRect.top && rect.bottom <= sectionRect.bottom) {
                return section;
            }
        }
    }
    return 'other';
}

function getScrollDepth() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    return Math.round((scrollTop / docHeight) * 100);
}

function createRevenueCalculator() {
    // Add interactive revenue calculator to the page
    const calculatorHTML = `
        <div id="revenue-calculator" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div class="bg-white p-8 rounded-2xl shadow-2xl max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold">ROI-Rechner</h3>
                    <button onclick="document.getElementById('revenue-calculator').classList.add('hidden')" 
                            class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">Aktueller Monatsumsatz (€)</label>
                        <input type="range" id="calc-revenue" min="1000" max="50000" step="1000" value="10000" 
                               class="w-full" onchange="updateCalculation()">
                        <div class="text-center text-leapp-blue font-bold text-lg">
                            <span id="calc-revenue-display">10.000€</span>/Monat
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-2">Zeitaufwand für Marketing pro Woche (Stunden)</label>
                        <input type="range" id="calc-time" min="5" max="40" step="5" value="15" 
                               class="w-full" onchange="updateCalculation()">
                        <div class="text-center text-leapp-blue font-bold text-lg">
                            <span id="calc-time-display">15</span> Stunden/Woche
                        </div>
                    </div>
                    
                    <div class="bg-leapp-gray p-4 rounded-lg">
                        <h4 class="font-bold mb-3">Deine Einsparungen mit Marketing-Automation:</h4>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span>Zeit-Einsparung pro Monat:</span>
                                <span class="font-bold text-green-600" id="calc-time-saved">30h</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Wert der gesparten Zeit:</span>
                                <span class="font-bold text-green-600" id="calc-time-value">1.800€</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Zusätzliche Leads (geschätzt):</span>
                                <span class="font-bold text-green-600" id="calc-leads">+40%</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Zusätzlicher Umsatz/Monat:</span>
                                <span class="font-bold text-green-600" id="calc-additional-revenue">+4.000€</span>
                            </div>
                            <hr class="my-2">
                            <div class="flex justify-between text-lg font-bold">
                                <span>Gesamt-ROI pro Monat:</span>
                                <span class="text-green-600" id="calc-total-roi">5.800€</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="text-center">
                        <button onclick="document.getElementById('revenue-calculator').classList.add('hidden'); document.getElementById('audit').scrollIntoView({behavior: 'smooth'});" 
                                class="bg-leapp-blue text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                            Kostenloses Audit anfordern
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', calculatorHTML);
    
    // Add calculator trigger button to hero section
    const heroButtons = document.querySelector('.flex.flex-col.sm\\:flex-row.gap-4');
    if (heroButtons) {
        const calcButton = document.createElement('a');
        calcButton.href = '#';
        calcButton.className = 'inline-flex items-center justify-center px-6 py-3 border border-leapp-blue text-leapp-blue rounded-lg hover:bg-leapp-blue hover:text-white transition-colors text-sm font-medium';
        calcButton.innerHTML = '<i class="fas fa-calculator mr-2"></i>ROI-Rechner';
        calcButton.onclick = (e) => {
            e.preventDefault();
            document.getElementById('revenue-calculator').classList.remove('hidden');
            trackConversion('roi_calculator_opened');
        };
        heroButtons.appendChild(calcButton);
    }
}

function updateCalculation() {
    const revenue = parseInt(document.getElementById('calc-revenue').value);
    const timeWeekly = parseInt(document.getElementById('calc-time').value);
    
    // Update display values
    document.getElementById('calc-revenue-display').textContent = revenue.toLocaleString('de-DE');
    document.getElementById('calc-time-display').textContent = timeWeekly;
    
    // Calculate savings (realistic assumptions based on automation)
    const timeSavedWeekly = Math.round(timeWeekly * 0.5); // 50% time saving through automation
    const timeSavedMonthly = timeSavedWeekly * 4;
    const hourlyRate = revenue / (timeWeekly * 4); // Current hourly rate based on time spent
    const timeValue = Math.round(timeSavedMonthly * hourlyRate);
    const additionalLeads = 40; // 40% average increase in leads
    const additionalRevenue = Math.round(revenue * 0.4); // 40% revenue increase
    const totalROI = timeValue + additionalRevenue;
    
    // Update calculated values
    document.getElementById('calc-time-saved').textContent = `${timeSavedMonthly}h`;
    document.getElementById('calc-time-value').textContent = `${timeValue.toLocaleString('de-DE')}€`;
    document.getElementById('calc-additional-revenue').textContent = `+${additionalRevenue.toLocaleString('de-DE')}€`;
    document.getElementById('calc-total-roi').textContent = `${totalROI.toLocaleString('de-DE')}€`;
}

// Exit Intent Detection
let exitIntentShown = false;
document.addEventListener('mouseleave', function(e) {
    if (e.clientY <= 0 && !exitIntentShown) {
        exitIntentShown = true;
        showExitIntentPopup();
        trackConversion('exit_intent_popup_shown');
    }
});

// Alternative: Exit Intent on Tab Switch (Mobile-friendly)
document.addEventListener('visibilitychange', function() {
    if (document.hidden && !exitIntentShown) {
        exitIntentShown = true;
        showExitIntentPopup();
        trackConversion('exit_intent_tab_switch');
    }
});

function showExitIntentPopup() {
    const popup = document.createElement('div');
    popup.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
    
    popup.innerHTML = `
        <div class="bg-leapp-dark p-8 rounded-2xl shadow-2xl max-w-md mx-4 border border-leapp-neon/30">
            <div class="text-center">
                <div class="text-leapp-neon text-4xl mb-4">
                    <i class="fas fa-hand-paper"></i>
                </div>
                <h3 class="text-2xl font-bold mb-4 text-white">Warte kurz!</h3>
                <p class="text-gray-300 mb-6 leading-relaxed">
                    Bevor du gehst: Sichere dir die <strong class="text-leapp-neon">kostenlose Marketing-Infrastruktur-Analyse</strong> 
                    (Wert: 1.500€) und erkenne dein Automatisierungspotenzial!
                </p>
                <div class="space-y-3">
                    <button onclick="this.closest('.fixed').remove(); document.getElementById('contact').scrollIntoView({behavior: 'smooth'});" 
                            class="w-full bg-leapp-neon text-leapp-dark py-4 px-6 rounded-lg hover:bg-white transition-colors font-bold">
                        <i class="fas fa-gift mr-2"></i>
                        Ja, kostenlose Analyse sichern!
                    </button>
                    <button onclick="this.closest('.fixed').remove()" 
                            class="w-full text-gray-400 hover:text-white transition-colors py-2">
                        Nein, danke
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    trackConversion('exit_intent_popup_shown');
    
    // Close on background click
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            popup.remove();
        }
    });
    
    // Auto-remove after 30 seconds
    setTimeout(() => {
        if (document.body.contains(popup)) {
            popup.remove();
        }
    }, 30000);
}

// Scroll Progress Indicator
function addScrollProgressIndicator() {
    const progressBar = document.createElement('div');
    progressBar.className = 'fixed top-0 left-0 w-full h-1 bg-leapp-blue transform scale-x-0 origin-left transition-transform z-50';
    progressBar.id = 'scroll-progress';
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', function() {
        const scrolled = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.transform = `scaleX(${scrolled / 100})`;
    });
}

// Initialize scroll progress on load
document.addEventListener('DOMContentLoaded', addScrollProgressIndicator);