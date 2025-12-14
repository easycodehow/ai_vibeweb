// Main JavaScript file for AI바이브웹

// Supabase configuration (will be added when integrated)
// const SUPABASE_URL = 'your-supabase-url';
// const SUPABASE_KEY = 'your-supabase-key';
// const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('AI바이브웹 loaded successfully');

// Smooth scroll for anchor links
document.addEventListener('DOMContentLoaded', function() {
    // Handle smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Skip if href is just "#"
            if (href === '#') return;

            e.preventDefault();

            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Calculate position accounting for fixed header
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active navigation state
    updateActiveNav();
    window.addEventListener('scroll', updateActiveNav);

    // Header scroll effect
    updateHeaderScroll();
    window.addEventListener('scroll', updateHeaderScroll);
});

// Update active navigation item based on scroll position
function updateActiveNav() {
    const sections = document.querySelectorAll('.section[id]');
    const navLinks = document.querySelectorAll('.gnb a[href^="#"]');

    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;

        if (window.pageYOffset >= sectionTop - headerHeight - 100) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');

        if (href === '#' + current) {
            link.classList.add('active');
        }
    });
}

// Update header style based on scroll position
function updateHeaderScroll() {
    const header = document.querySelector('.header');
    const heroSection = document.querySelector('.hero-section');

    if (!header || !heroSection) return;

    const heroHeight = heroSection.offsetHeight;
    const scrollPosition = window.pageYOffset;

    // Add 'scrolled' class when past the hero section
    if (scrollPosition > heroHeight - 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

// Intersection Observer for fade-in animations (optional enhancement)
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const elements = document.querySelectorAll('.section');
    elements.forEach(el => observer.observe(el));
}

// Initialize animations if needed
// Uncomment when ready to add animations
// document.addEventListener('DOMContentLoaded', initScrollAnimations);

// Threads Background Animation
function initWavyBackground() {
    const canvas = document.getElementById('wavy-background');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    // Set canvas size
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Thread configuration
    const spacing = 80;
    const verticalLines = [];
    const horizontalLines = [];
    const color = '#0891B2';

    let time = 0;

    // Initialize vertical lines
    for (let x = 0; x < canvas.width + spacing; x += spacing) {
        verticalLines.push({
            baseX: x,
            offset: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 0.3
        });
    }

    // Initialize horizontal lines
    for (let y = 0; y < canvas.height + spacing; y += spacing) {
        horizontalLines.push({
            baseY: y,
            offset: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 0.3
        });
    }

    // Draw vertical thread
    function drawVerticalThread(thread) {
        const points = [];
        const segments = 50;

        for (let i = 0; i <= segments; i++) {
            const progress = i / segments;
            const y = canvas.height * progress;

            // Add wave motion
            const wave = Math.sin(progress * Math.PI * 2 + time * thread.speed + thread.offset) * 20;
            const x = thread.baseX + wave;

            points.push({ x, y });
        }

        // Draw line
        if (points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);

            for (let i = 1; i < points.length - 1; i++) {
                const xc = (points[i].x + points[i + 1].x) / 2;
                const yc = (points[i].y + points[i + 1].y) / 2;
                ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }

            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }

    // Draw horizontal thread
    function drawHorizontalThread(thread) {
        const points = [];
        const segments = 50;

        for (let i = 0; i <= segments; i++) {
            const progress = i / segments;
            const x = canvas.width * progress;

            // Add wave motion
            const wave = Math.sin(progress * Math.PI * 2 + time * thread.speed + thread.offset) * 20;
            const y = thread.baseY + wave;

            points.push({ x, y });
        }

        // Draw line
        if (points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);

            for (let i = 1; i < points.length - 1; i++) {
                const xc = (points[i].x + points[i + 1].x) / 2;
                const yc = (points[i].y + points[i + 1].y) / 2;
                ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }

            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw all vertical threads
        verticalLines.forEach(thread => drawVerticalThread(thread));

        // Draw all horizontal threads
        horizontalLines.forEach(thread => drawHorizontalThread(thread));

        time += 0.01;
        animationId = requestAnimationFrame(animate);
    }

    animate();

    // Cleanup
    return () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        window.removeEventListener('resize', resizeCanvas);
    };
}

// Initialize wavy background on page load
document.addEventListener('DOMContentLoaded', initWavyBackground);

// Scroll to Top Button Functionality
document.addEventListener('DOMContentLoaded', function() {
    const scrollToTopBtn = document.getElementById('scroll-to-top');

    if (!scrollToTopBtn) return;

    // Show/hide button based on scroll position
    function toggleScrollButton() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    }

    // Scroll to top when button is clicked
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Listen for scroll events
    window.addEventListener('scroll', toggleScrollButton);

    // Initial check
    toggleScrollButton();
});
