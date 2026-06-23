document.addEventListener('DOMContentLoaded', () => {
    
    // --- Dark Mode Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle.querySelector('i');
    
    // Check local storage
    if (localStorage.getItem('theme') === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        icon.classList.replace('fa-moon', 'fa-sun');
    }

    themeToggle.addEventListener('click', () => {
        if (document.body.getAttribute('data-theme') === 'dark') {
            document.body.removeAttribute('data-theme');
            icon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            icon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark');
        }
    });

    // --- Hamburger Menu ---
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // --- Sticky Navbar & Active Link Update ---
    const header = document.querySelector('.header');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        // Sticky Header
        if (window.scrollY > 50) {
            header.style.boxShadow = 'var(--shadow-md)';
        } else {
            header.style.boxShadow = 'var(--shadow-sm)';
        }

        // Active Link Update
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // --- Typing Text Effect ---
    const typingElement = document.querySelector('.typing-text');
    const phrases = ["Empowering Women", "Building Futures", "Creating Impact", "Inspiring Change"];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
        const currentPhrase = phrases[phraseIndex];
        
        if (isDeleting) {
            typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }

        let typingSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentPhrase.length) {
            typingSpeed = 2000; // Pause at end of word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 500; // Pause before typing new word
        }

        setTimeout(typeEffect, typingSpeed);
    }
    
    // Start typing effect
    if(typingElement) {
        setTimeout(typeEffect, 1000);
    }

    // --- Animated Counters ---
    const counters = document.querySelectorAll('.stat-number');
    let hasCounted = false;

    function startCounters() {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000; // ms
            const increment = target / (duration / 16); // 60fps
            
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.innerText = Math.ceil(current) + (target > 1000 ? '+' : '');
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.innerText = target + (target > 1000 ? '+' : '');
                }
            };
            
            updateCounter();
        });
    }

    // --- Scroll Animations & Scroll Progress & Back to Top ---
    const fadeElements = document.querySelectorAll('.fade-in');
    const statsSection = document.querySelector('.stats-section');
    const progressBar = document.getElementById('scroll-progress-bar');
    const backToTopBtn = document.getElementById('back-to-top');

    function checkScroll() {
        // Scroll Progress
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if(progressBar) progressBar.style.width = scrolled + "%";

        // Back to top button visibility
        if (backToTopBtn) {
            if (winScroll > 500) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }

        // Fade in elements
        const triggerBottom = window.innerHeight * 0.85;

        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < triggerBottom) {
                element.classList.add('appear');
            }
        });

        // Trigger counters
        if (statsSection && !hasCounted) {
            const sectionTop = statsSection.getBoundingClientRect().top;
            if (sectionTop < triggerBottom) {
                startCounters();
                hasCounted = true;
            }
        }
    }

    window.addEventListener('scroll', checkScroll);
    checkScroll(); // Check on load

    // Back to top click event
    if(backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- Form Validation ---
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const subject = document.getElementById('subject');
            const message = document.getElementById('message');
            const alertBox = document.getElementById('form-alert');
            
            // Helper function to show error
            const showError = (input) => {
                input.parentElement.classList.add('error');
                isValid = false;
            };
            
            // Helper function to remove error
            const removeError = (input) => {
                input.parentElement.classList.remove('error');
            };

            // Validate Name
            if (name.value.trim() === '') {
                showError(name);
            } else {
                removeError(name);
            }

            // Validate Email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value.trim())) {
                showError(email);
            } else {
                removeError(email);
            }

            // Validate Subject
            if (subject.value === '') {
                showError(subject);
            } else {
                removeError(subject);
            }

            // Validate Message
            if (message.value.trim() === '') {
                showError(message);
            } else {
                removeError(message);
            }

            // On Success
            if (isValid) {
                // Simulate form submission
                const btn = contactForm.querySelector('button[type="submit"]');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                btn.disabled = true;

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    contactForm.reset();
                    
                    alertBox.textContent = 'Thank you! Your message has been sent successfully.';
                    alertBox.className = 'alert success';
                    
                    setTimeout(() => {
                        alertBox.classList.add('hidden');
                    }, 5000);
                }, 1500);
            }
        });
    }
});
