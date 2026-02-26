// Slideshow Data - Write your caption in each text field
const slides = [
    {
        image: "KUKU/Img1.jpeg",
        text: "To the beautiful soul who lights up every room💕"
    },
    {
        image: "KUKU/img2.jpeg",
        text: "The Nakhrali Chori who stole our hearts from the moment we met her"
    },
    {
        image: "KUKU/img3.jpeg",
        text: "The most beautiful girl in the world"
    },
    {
        image: "KUKU/img4.jpeg",
        text: "The one who fills our lives with love and laughter"
    },
    {
        image: "KUKU/img5.jpeg",
        text: "The one who makes every moment special just by being there."
    },
    {
        image: "KUKU/img6.jpeg",
        text: "The one who makes everything better with her smile (Meri aankhon se dekho..)"
    }
];

// Configuration
const config = {
    birthdayName: "KUKU", // Change this to her name
    finalImage: "KUKU/img7.jpeg", // Change to her photo
    autoPlay: false,
    clickToAdvance: true
};

// State
let currentSlideIndex = 0;
let isTransitioning = false;
let hasStarted = false;
let hasPlayedLastSlideMusic = false;

// DOM Elements
const welcomeScreen = document.getElementById('welcomeScreen');
const slideshowScreen = document.getElementById('slideshowScreen');
const birthdayScreen = document.getElementById('birthdayScreen');
const slideImage = document.getElementById('slideImage');
const slideText = document.getElementById('slideText');
const progressBar = document.getElementById('progressBar');
const currentSlideEl = document.getElementById('currentSlide');
const totalSlidesEl = document.getElementById('totalSlides');
const navDotsContainer = document.getElementById('navDots');
const clickHint = document.getElementById('clickHint');
const birthdayNameEl = document.getElementById('birthdayName');
const finalImageEl = document.getElementById('finalImage');
const bgMusic = document.getElementById('bgMusic');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeSlideshow();
    createFloatingHearts();
    
    // Set birthday name
    if (config.birthdayName) {
        birthdayNameEl.textContent = config.birthdayName;
    }
    
    // Set final image
    if (config.finalImage) {
        finalImageEl.src = config.finalImage;
    }
    
    // Start button click - stop propagation to prevent double triggering
    const startBtn = document.getElementById('startBtn');
    startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        startJourney();
    });
    
    // Welcome screen click (only works if clicking outside the button)
    welcomeScreen.addEventListener('click', (e) => {
        if (e.target !== startBtn && !startBtn.contains(e.target)) {
            startJourney();
        }
    });
    
    // Slideshow click
    slideshowScreen.addEventListener('click', handleSlideshowClick);
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ') {
            if (!slideshowScreen.classList.contains('hidden')) {
                nextSlide();
            }
        }
        if (e.key === 'ArrowLeft') {
            if (!slideshowScreen.classList.contains('hidden')) {
                prevSlide();
            }
        }
        if (e.key === 'Escape' && !birthdayScreen.classList.contains('hidden')) {
            restartSlideshow();
        }
    });
});

function initializeSlideshow() {
    totalSlidesEl.textContent = slides.length;
    
    // Create navigation dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `nav-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            goToSlide(index);
        });
        navDotsContainer.appendChild(dot);
    });
}

function startJourney() {
    // Prevent double-clicking or starting if already started
    if (hasStarted) return;
    hasStarted = true;
    
    // Ensure welcome screen has opacity 1 before fading out (for first load)
    welcomeScreen.style.opacity = '1';
    
    // Small delay to ensure display is block before fading
    requestAnimationFrame(() => {
        // Fade out welcome screen
        welcomeScreen.style.opacity = '0';
        welcomeScreen.style.transition = 'opacity 1s ease-out';
        
        setTimeout(() => {
            welcomeScreen.classList.add('hidden');
            slideshowScreen.classList.remove('hidden');
            slideshowScreen.style.display = 'flex';
            
            // Small delay to ensure slideshow is visible before loading slide
            setTimeout(() => {
                loadSlide(0);
            }, 100);
        }, 1000);
    });
}

function loadSlide(index) {
    if (isTransitioning && index !== 0) return;
    isTransitioning = true;
    
    const slide = slides[index];
    
    // Update back button visibility
    const backBtn = document.getElementById('backBtn');
    if (index > 0) {
        backBtn.style.opacity = '1';
        backBtn.style.pointerEvents = 'auto';
    } else {
        backBtn.style.opacity = '0';
        backBtn.style.pointerEvents = 'none';
    }
    
    // Fade out current content
    slideImage.style.opacity = '0';
    slideImage.style.transform = 'scale(0.95)';
    slideText.style.opacity = '0';
    slideText.style.transform = 'translateY(20px)';
    clickHint.style.opacity = '0';
    
    setTimeout(() => {
        // Update content
        slideImage.src = slide.image;
        slideText.textContent = slide.text;
        currentSlideEl.textContent = index + 1;
        
        // Update progress bar
        const progress = ((index + 1) / slides.length) * 100;
        progressBar.style.width = `${progress}%`;
        
        // Update dots
        document.querySelectorAll('.nav-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        if (index === slides.length - 1 && bgMusic && !hasPlayedLastSlideMusic) {
            hasPlayedLastSlideMusic = true;
            bgMusic.volume = 0.3;
            bgMusic.play().catch(() => console.log('Audio autoplay prevented'));
        }
        
        let loaded = false;

        const finishSlideTransition = () => {
            slideImage.style.opacity = '1';
            slideImage.style.transform = 'scale(1)';

            setTimeout(() => {
                slideText.style.opacity = '1';
                slideText.style.transform = 'translateY(0)';
                clickHint.style.opacity = '1';
                isTransitioning = false;
            }, 300);
        };
        
        // Fade in new content after image loads
        slideImage.onload = () => {
            if (loaded) return;
            loaded = true;
            finishSlideTransition();
        };
        
        // Error handling for image load
        slideImage.onerror = () => {
            if (loaded) return;
            loaded = true;
            console.log('Image failed to load, continuing anyway');
            finishSlideTransition();
        };
        
        // Fallback if image is cached or loads instantly
        setTimeout(() => {
            if (!loaded && slideImage.complete) {
                loaded = true;
                finishSlideTransition();
            }
        }, 100);

        // Guaranteed fallback: if browser keeps image in pending state, don't lock slideshow
        setTimeout(() => {
            if (!loaded) {
                loaded = true;
                console.log('Image load timeout, continuing slideshow');
                finishSlideTransition();
            }
        }, 2500);
    }, 500);
    
    currentSlideIndex = index;
}

function nextSlide() {
    if (currentSlideIndex < slides.length - 1) {
        loadSlide(currentSlideIndex + 1);
    } else {
        showBirthdayScreen();
    }
}

function prevSlide() {
    if (currentSlideIndex > 0 && !isTransitioning) {
        loadSlide(currentSlideIndex - 1);
    }
}

function goToSlide(index) {
    if (index !== currentSlideIndex && !isTransitioning) {
        loadSlide(index);
    }
}

function handleSlideshowClick() {
    if (!isTransitioning) {
        nextSlide();
    }
}

function showBirthdayScreen() {
    slideshowScreen.style.opacity = '0';
    setTimeout(() => {
        slideshowScreen.classList.add('hidden');
        slideshowScreen.style.display = 'none';
        birthdayScreen.classList.remove('hidden');
        birthdayScreen.classList.add('animate-fade-in');
        startConfetti();
        launchFireworks();
    }, 500);
}

function restartSlideshow() {
    birthdayScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
    welcomeScreen.style.opacity = '1';
    welcomeScreen.style.display = 'flex';
    
    // Reset all state
    currentSlideIndex = 0;
    isTransitioning = false;
    hasStarted = false;
    hasPlayedLastSlideMusic = false;
    progressBar.style.width = '0%';
    document.querySelectorAll('.nav-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === 0);
    });
    
    // Reset slideshow screen
    slideshowScreen.classList.add('hidden');
    slideshowScreen.style.display = 'none';
    slideshowScreen.style.opacity = '1';
    
    // Clear images
    slideImage.src = '';
    slideText.textContent = '';

    if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
    }
}

// Confetti Effect
function startConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const confettiCount = 200;
    const confetti = [];
    const colors = ['#f43f5e', '#8b5cf6', '#ec4899', '#fbbf24', '#60a5fa'];
    
    for (let i = 0; i < confettiCount; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 10 + 5,
            speedY: Math.random() * 3 + 2,
            speedX: Math.random() * 2 - 1,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5
        });
    }
    
    let animationId;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        confetti.forEach((particle, index) => {
            particle.y += particle.speedY;
            particle.x += particle.speedX;
            particle.rotation += particle.rotationSpeed;
            
            if (particle.y > canvas.height) {
                particle.y = -20;
                particle.x = Math.random() * canvas.width;
            }
            
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate((particle.rotation * Math.PI) / 180);
            ctx.fillStyle = particle.color;
            ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
            ctx.restore();
        });
        
        animationId = requestAnimationFrame(animate);
    }
    
    animate();
    
    // Stop after 10 seconds to save performance
    setTimeout(() => {
        cancelAnimationFrame(animationId);
    }, 10000);
}

// Floating Hearts Background
function createFloatingHearts() {
    const container = document.getElementById('floatingHearts');
    const heartSymbols = ['💕', '💖', '💗', '💓', '💝', '🎂', '🎉', '✨'];
    
    setInterval(() => {
        if (birthdayScreen.classList.contains('hidden')) return;
        
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = (Math.random() * 3 + 4) + 's';
        heart.style.fontSize = (Math.random() * 20 + 15) + 'px';
        
        container.appendChild(heart);
        
        setTimeout(() => {
            heart.remove();
        }, 7000);
    }, 800);
}

// Heart Burst Effect on Click
function createHeartBurst(e) {
    const x = e.clientX;
    const y = e.clientY;
    
    for (let i = 0; i < 12; i++) {
        const heart = document.createElement('div');
        heart.textContent = '💖';
        heart.style.position = 'fixed';
        heart.style.left = x + 'px';
        heart.style.top = y + 'px';
        heart.style.fontSize = '24px';
        heart.style.pointerEvents = 'none';
        heart.style.zIndex = '100';
        heart.style.transition = 'all 1s ease-out';
        
        document.body.appendChild(heart);
        
        const angle = (i / 12) * Math.PI * 2;
        const velocity = 100;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        setTimeout(() => {
            heart.style.transform = `translate(${vx}px, ${vy}px) scale(0)`;
            heart.style.opacity = '0';
        }, 50);
        
        setTimeout(() => {
            heart.remove();
        }, 1000);
    }
}

// Firework Effect
function launchFireworks() {
    const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'];
    
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createFirework(
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight / 2,
                colors[Math.floor(Math.random() * colors.length)]
            );
        }, i * 600);
    }
}

function createFirework(x, y, color) {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    for (let i = 0; i < 30; i++) {
        const angle = (Math.PI * 2 * i) / 30;
        const velocity = Math.random() * 5 + 3;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            alpha: 1,
            color: color
        });
    }
    
    function animateFirework() {
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // gravity
            p.alpha -= 0.02;
            
            if (p.alpha > 0) {
                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });
        
        particles = particles.filter(p => p.alpha > 0);
        
        if (particles.length > 0) {
            requestAnimationFrame(animateFirework);
        }
    }
    
    animateFirework();
}

// Handle window resize
window.addEventListener('resize', () => {
    const canvas = document.getElementById('confettiCanvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});