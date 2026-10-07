// Expense Storyteller - Cinematic Animations (GSAP + Lenis) & supabaseClient Integration

// --- supabaseClient Setup ---
const supabaseClient = window.supabase.createClient('https://dxzopaxnxoslxrlpopzq.supabase.co','sb_publishable_2r1gj4lUVBlXi6stC_oR0g_7W1aKNhs' );
let currentUser = null;
let currentToken = null;
function openModal() {
    console.log("BUTTON CLICKED");
    alert("Modal is working!");
}
// Helper to fetch data from backend
async function fetchBackend(endpoint, method = 'GET', body = null) {
    if (!currentToken) return null;
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
        }
    };
    if (body) options.body = JSON.stringify(body);

    try {
        // Assuming backend runs on localhost:5000 during dev
        const response = await fetch('https://expense-storyteller.onrender.com/api${endpoint}',options);
        return await response.json();
    } catch (e) {
        console.error('API Error:', e);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize Lenis Smooth Scrolling
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Apple-like easing
        direction: 'vertical', // vertical, horizontal
        gestureDirection: 'vertical', // vertical, horizontal, both
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // Link GSAP ScrollTrigger to Lenis scroll
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // 2. Hero Entrance Animation
    const heroTl = gsap.timeline();

    // Set initial states
    gsap.set('.gsap-nav-item', { y: -20, opacity: 0 });
    gsap.set('.gsap-hero-item', { y: 40, opacity: 0, filter: 'blur(10px)' });
    gsap.set('.gsap-hero-visual', { y: 100, opacity: 0, scale: 0.95, filter: 'blur(20px)' });

    heroTl.to('.gsap-nav-item', {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out'
    })
        .to('.gsap-hero-item', {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1.2,
            stagger: 0.15,
            ease: 'power3.out'
        }, "-=0.5")
        .to('.gsap-hero-visual', {
            y: 0,
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 1.5,
            ease: 'expo.out'
        }, "-=0.8");

    // 3. Parallax Floating Widgets
    const widgets = document.querySelectorAll('.floating-widget');
    widgets.forEach(widget => {
        const speed = parseFloat(widget.getAttribute('data-speed'));

        gsap.to(widget, {
            y: () => -100 * speed,
            ease: "none",
            scrollTrigger: {
                trigger: '.hero-section',
                start: 'top top',
                end: 'bottom top',
                scrub: 1.5 // Smooth scrub lag
            }
        });
    });

    // 4. Background Blobs Continuous Animation
    gsap.to('.blob-1', {
        x: "random(-50, 50)",
        y: "random(-50, 50)",
        duration: 8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
    });

    gsap.to('.blob-2', {
        x: "random(-50, 50)",
        y: "random(-50, 50)",
        duration: 10,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 2
    });

    // 5. General Scroll Reveals
    const fadeUpElements = document.querySelectorAll('.gsap-fade-up, .gsap-feature-card, .gsap-pricing-card, .gsap-logo');

    fadeUpElements.forEach((el, index) => {
        gsap.fromTo(el,
            { y: 50, opacity: 0, filter: 'blur(5px)' },
            {
                y: 0,
                opacity: 1,
                filter: 'blur(0px)',
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                }
            }
        );
    });

    // 6. Sticky Showcase Section
    // Ensure this only runs on desktop where sticky layout makes sense
    if (window.innerWidth > 992) {
        const steps = gsap.utils.toArray('.showcase-step');

        steps.forEach((step, i) => {
            ScrollTrigger.create({
                trigger: step,
                start: "top center",
                end: "bottom center",
                toggleClass: { targets: step, className: "active-step" },
                onEnter: () => {
                    gsap.to(step, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" });
                    // Optional: animate the image or glow based on step
                    gsap.to('.showcase-glass', {
                        scale: 1 + (i * 0.02),
                        rotateX: i * 2,
                        rotateY: i * -2,
                        duration: 1,
                        ease: "power2.out"
                    });
                    gsap.to('.showcase-glow', {
                        opacity: 0.3 + (i * 0.1),
                        scale: 1 + (i * 0.2),
                        duration: 1
                    });
                },
                onLeaveBack: () => {
                    gsap.to(step, { opacity: 0.3, x: -20, duration: 0.5 });
                },
                onEnterBack: () => {
                    gsap.to(step, { opacity: 1, x: 0, duration: 0.5 });
                },
                onLeave: () => {
                    gsap.to(step, { opacity: 0.3, x: -20, duration: 0.5 });
                }
            });

            // Set initial state for steps
            if (i !== 0) gsap.set(step, { opacity: 0.3, x: -20 });
        });
    }

    // 7. Metrics Counters
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));

        ScrollTrigger.create({
            trigger: '.metrics-section',
            start: 'top 75%',
            once: true,
            onEnter: () => {
                gsap.to(counter, {
                    innerHTML: target,
                    duration: 2.5,
                    snap: { innerHTML: 1 },
                    ease: "power3.out",
                    onUpdate: function () {
                        counter.innerHTML = Math.round(this.targets()[0].innerHTML);
                    }
                });
            }
        });
    });

    // 8. 3D Tilt on Feature Cards
    const glassCards = document.querySelectorAll('.glass-card');

    glassCards.forEach(card => {
        // Handle Mouse Move for Glow & Tilt
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const tiltX = ((y - centerY) / centerY) * -5;
            const tiltY = ((x - centerX) / centerX) * 5;

            gsap.to(card, {
                rotateX: tiltX,
                rotateY: tiltY,
                transformPerspective: 1000,
                duration: 0.5,
                ease: "power2.out"
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.8,
                ease: "power2.out"
            });
        });
    });

    // Update Nav shadow on scroll
    ScrollTrigger.create({
        start: 'top -50',
        onUpdate: (self) => {
            const nav = document.querySelector('.glass-nav');
            if (self.direction === 1 || self.scroll() > 50) {
                gsap.to(nav, { boxShadow: '0 10px 30px rgba(0,0,0,0.05)', duration: 0.3 });
            } else {
                gsap.to(nav, { boxShadow: 'none', duration: 0.3 });
            }
        }
    });

    // --- Modal Logic ---
    const modals = {
        auth: document.getElementById('auth-modal'),
        transaction: document.getElementById('transaction-modal'),
        budget: document.getElementById('budget-modal'),
        reset: document.getElementById('reset-modal'),
        newPassword: document.getElementById('new-password-modal'),
        story: document.getElementById('story-modal')
    };

    const openModal = (id) => modals[id]?.classList.add('active');
    const closeModal = (id) => modals[id]?.classList.remove('active');

    // Close on overlay click
    Object.values(modals).forEach(m => {
        m?.addEventListener('click', (e) => {
            if (e.target === m) m.classList.remove('active');
        });
    });

    // Close buttons
    document.getElementById('btn-close-auth')?.addEventListener('click', () => closeModal('auth'));
    document.getElementById('btn-close-transaction')?.addEventListener('click', () => closeModal('transaction'));
    document.getElementById('btn-close-budget')?.addEventListener('click', () => closeModal('budget'));
    document.getElementById('btn-close-reset')?.addEventListener('click', () => closeModal('reset'));
    document.getElementById('btn-close-new-password')?.addEventListener('click', () => closeModal('newPassword'));
    document.getElementById('btn-close-story')?.addEventListener('click', () => closeModal('story'));

    // Dashboard Modal Buttons
    document.getElementById('btn-add-tx-dash')?.addEventListener('click', () => openModal('transaction'));
    document.getElementById('btn-edit-budget')?.addEventListener('click', () => openModal('budget'));

    // Generate Story Logic
    document.getElementById('btn-generate-story')?.addEventListener('click', async () => {
        openModal('story');
        const storyContent = document.getElementById('story-content');
        if (storyContent) {
            storyContent.innerHTML = '<div class="loading-spinner">Analyzing your narrative...</div>';
            const res = await fetchBackend('/insights/story');
            if (res && res.story) {
                const paragraphs = res.story.split('\n').filter(p => p.trim() !== '');
                storyContent.innerHTML = paragraphs.map(p => `<p style="margin-bottom: 1rem;">${p}</p>`).join('');
            } else {
                storyContent.innerHTML = '<div class="empty-state">Could not generate story.</div>';
            }
        }
    });

    // Hero Section Buttons
    document.querySelectorAll('.hero-buttons .btn-primary').forEach(btn => {
        btn.addEventListener('click', () => {
            isLoginMode = false;
            updateAuthUI();
            openModal('auth');
        });
    });

    // Open Reset Modal
    document.getElementById('btn-open-reset')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal('auth');
        openModal('reset');
    });

    // --- Auth UI Flow ---
    let isLoginMode = true;
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const usernameGroup = document.getElementById('username-group');
    const btnAuthSubmit = document.getElementById('btn-auth-submit');
    const authSwitchText = document.getElementById('auth-switch-text');
    const authSwitchLink = document.getElementById('auth-switch-link');
    const authError = document.getElementById('auth-error');

    document.getElementById('btn-open-login')?.addEventListener('click', () => {
        isLoginMode = true;
        updateAuthUI();
        openModal('auth');
    });

    document.getElementById('btn-open-signup')?.addEventListener('click', () => {
        isLoginMode = false;
        updateAuthUI();
        openModal('auth');
    });

    authSwitchLink?.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginMode = !isLoginMode;
        updateAuthUI();
    });

    function updateAuthUI() {
        authError.textContent = '';
        const forgotPasswordBtn = document.getElementById('btn-open-reset');
        if (isLoginMode) {
            authTitle.textContent = 'Welcome Back';
            authSubtitle.textContent = 'Enter your details to access your narrative.';
            usernameGroup.style.display = 'none';
            if (forgotPasswordBtn) forgotPasswordBtn.style.display = '';
            btnAuthSubmit.textContent = 'Log In';
            authSwitchText.innerHTML = `Don't have an account? <a href="#" id="auth-switch-link">Sign Up</a>`;
        } else {
            authTitle.textContent = 'Begin Your Story';
            authSubtitle.textContent = 'Create an account to start tracking.';
            usernameGroup.style.display = 'block';
            if (forgotPasswordBtn) forgotPasswordBtn.style.display = 'none';
            btnAuthSubmit.textContent = 'Sign Up';
            authSwitchText.innerHTML = `Already have an account? <a href="#" id="auth-switch-link">Log In</a>`;
        }

        // Rebind switch link event
        document.getElementById('auth-switch-link').addEventListener('click', (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            updateAuthUI();
        });
    }

    // --- supabaseClient Auth Integration ---
    async function checkUser() {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            currentUser = session.user;
            currentToken = session.access_token;
            updateNavForUser();
            loadDashboardData();
        } else {
            currentUser = null;
            currentToken = null;
            updateNavForGuest();
        }
    }

    function updateNavForUser() {
        const cta = document.getElementById('auth-nav-cta');
        if (cta) cta.innerHTML = `
            <button class="btn btn-outline" id="btn-add-tx">Add Transaction</button>
            <button class="btn btn-primary" id="btn-logout">Log Out</button>
        `;
        document.getElementById('btn-logout')?.addEventListener('click', async () => {
            await supabaseClient.auth.signOut();
            checkUser();
        });
        document.getElementById('btn-add-tx')?.addEventListener('click', () => openModal('transaction'));
        
        // SPA Toggle
        const publicView = document.getElementById('public-view');
        const authView = document.getElementById('authenticated-view');
        if (publicView) publicView.style.display = 'none';
        if (authView) authView.style.display = 'block';
    }

    function updateNavForGuest() {
        const cta = document.getElementById('auth-nav-cta');

        if (cta) {
            cta.innerHTML = `
    <button class="btn btn-outline" id="btn-open-login-2">Log In</button>
    <button class="btn btn-primary" id="btn-open-signup-2">Start Tracking Free</button>
  `;

            document.getElementById('btn-open-login-2')
                ?.addEventListener('click', () => {
                    isLoginMode = true;
                    updateAuthUI();
                    openModal('auth');
                });

            const signupBtn = document.getElementById('btn-open-signup-2');

            if (signupBtn) {
                signupBtn.onclick = function () {
                    isLoginMode = false;
                    updateAuthUI();
                    openModal('auth');
                };
            }
        }

        // SPA Toggle
        const publicView = document.getElementById('public-view');
        const authView = document.getElementById('authenticated-view');
        if (publicView) publicView.style.display = 'block';
        if (authView) authView.style.display = 'none';
    }

    document.getElementById('auth-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        authError.textContent = '';
        btnAuthSubmit.textContent = 'Please wait...';
        btnAuthSubmit.disabled = true;

        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;

        try {
            if (isLoginMode) {
                // Authenticate with Supabase first
                const { error: signInError } = await supabaseClient.auth.signInWithPassword({ email, password });
                
                if (signInError) {
                    if (signInError.message.includes('Invalid login credentials')) {
                        throw new Error('Invalid email or password');
                    }
                    throw new Error(signInError.message);
                }

                // Backend login (optional sync)
                try {
                    const res = await fetch('http://localhost:5000/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });
                    if (!res.ok) {
                        const data = await res.json();
                        console.warn('Backend login sync issue:', data.message);
                    }
                } catch (backendErr) {
                    console.warn('Backend unavailable or CORS issue. Proceeding to dashboard.', backendErr);
                    // Do NOT throw. We are already authenticated with Supabase.
                }
            } else {
                const username = document.getElementById('auth-username').value;
                const res = await fetch('http://localhost:5000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Signup failed');
                
                const { error: signInError } = await supabaseClient.auth.signInWithPassword({ email, password });
                if (signInError && signInError.message.includes('Email not confirmed')) {
                    alert('Registration successful! Please check your email to confirm your account before logging in.');
                    isLoginMode = true;
                    updateAuthUI();
                    return;
                } else if (signInError) {
                    throw new Error(signInError.message);
                }
            }
            closeModal('auth');
            checkUser();
        } catch (err) {
            authError.textContent = err.message;
        } finally {
            btnAuthSubmit.textContent = isLoginMode ? 'Log In' : 'Sign Up';
            btnAuthSubmit.disabled = false;
        }
    });

    // --- Data Fetching & Binding ---
    async function loadDashboardData() {
        const data = await fetchBackend('/dashboard');
        if (data) {
            // Populate Summary
            const dashIncome = document.getElementById('dash-income');
            const dashExpenses = document.getElementById('dash-expenses');
            const dashSavings = document.getElementById('dash-savings');
            if (dashIncome) dashIncome.innerText = `$${data.totalIncome.toFixed(2)}`;
            if (dashExpenses) dashExpenses.innerText = `$${data.totalExpenses.toFixed(2)}`;
            if (dashSavings) dashSavings.innerText = `$${data.savings.toFixed(2)}`;

            // Render Recent Transactions
            const txList = document.getElementById('dash-transactions');
            if (txList) {
                if (data.recentTransactions && data.recentTransactions.length > 0) {
                    txList.innerHTML = data.recentTransactions.map(tx => `
                        <div class="transaction-item">
                            <div class="tx-info">
                                <h4>${tx.title}</h4>
                                <div class="tx-date">${new Date(tx.date).toLocaleDateString()} &bull; ${tx.category}</div>
                            </div>
                            <div class="tx-amount ${tx.type}">${tx.type === 'income' ? '+' : '-'}$${tx.amount.toFixed(2)}</div>
                        </div>
                    `).join('');
                } else {
                    txList.innerHTML = '<div class="empty-state">No transactions yet. Start your story.</div>';
                }
            }
        }

        // Fetch Budget
        const today = new Date();
        const budgetRes = await fetchBackend(`/budget?month=${today.getMonth() + 1}&year=${today.getFullYear()}`);
        const total = (budgetRes && !budgetRes.message) ? budgetRes.total_budget : 0;
        const spent = data ? data.totalExpenses : 0;
        
        const bTotalEl = document.getElementById('budget-total');
        const bSpentEl = document.getElementById('budget-spent');
        const bFillEl = document.getElementById('budget-progress-fill');
        
        if (bTotalEl) bTotalEl.innerText = `of $${total}`;
        if (bSpentEl) bSpentEl.innerText = `$${spent} spent`;
        
        if (bFillEl) {
            let percent = total > 0 ? (spent / total) * 100 : 0;
            if (percent > 100) percent = 100;
            bFillEl.style.width = `${percent}%`;
            bFillEl.style.background = percent > 90 ? '#EF4444' : (percent > 75 ? '#F59E0B' : 'var(--gradient-primary)');
        }

        // Fetch AI Insights
        const insightsList = document.getElementById('dash-insights');
        if (insightsList) {
            insightsList.innerHTML = '<div class="loading-spinner">Generating narrative...</div>';
            const insightsRes = await fetchBackend('/insights');
            if (insightsRes && insightsRes.data && insightsRes.data.length > 0) {
                insightsList.innerHTML = insightsRes.data.map(insight => `
                    <div class="insight-item ${insight.type}">
                        ${insight.text}
                    </div>
                `).join('');
            } else {
                insightsList.innerHTML = '<div class="empty-state">Not enough data to generate insights yet. Add more transactions!</div>';
            }
        }
    }

    // --- Forms Submission ---
    document.getElementById('transaction-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            title: document.getElementById('trans-title').value,
            amount: parseFloat(document.getElementById('trans-amount').value),
            type: document.getElementById('trans-type').value,
            category: document.getElementById('trans-category').value,
        };
        const res = await fetchBackend('/transactions', 'POST', payload);
        if (res) {
            closeModal('transaction');
            e.target.reset();
            loadDashboardData();
        }
    });

    document.getElementById('budget-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            totalBudget: parseFloat(document.getElementById('budget-amount').value)
        };
        const res = await fetchBackend('/budget', 'POST', payload);
        if (res) {
            closeModal('budget');
            e.target.reset();
        }
    });

    // --- Reset Password Logic ---
    document.getElementById('reset-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('reset-email').value;
        const btn = document.getElementById('btn-reset-submit');
        const errorEl = document.getElementById('reset-error');
        const successEl = document.getElementById('reset-success');
        
        btn.disabled = true;
        btn.textContent = 'Sending...';
        errorEl.textContent = '';
        successEl.style.display = 'none';
        
        try {
            const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + window.location.pathname,
            });
            if (error) throw error;
            successEl.style.display = 'block';
            document.getElementById('reset-form').reset();
        } catch (error) {
            errorEl.textContent = error.message;
        } finally {
            btn.disabled = false;
            btn.textContent = 'Send Reset Link';
        }
    });

    // --- New Password Logic ---
    document.getElementById('new-password-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-new-password').value;
        const btn = document.getElementById('btn-new-password-submit');
        const errorEl = document.getElementById('new-password-error');
        const successEl = document.getElementById('new-password-success');
        
        btn.disabled = true;
        btn.textContent = 'Updating...';
        errorEl.textContent = '';
        successEl.style.display = 'none';

        if (!newPassword || !confirmPassword) {
            errorEl.textContent = 'Please enter and confirm your new password.';
            btn.disabled = false;
            btn.textContent = 'Update Password';
            return;
        }

        if (newPassword !== confirmPassword) {
            errorEl.textContent = 'Passwords do not match.';
            btn.disabled = false;
            btn.textContent = 'Update Password';
            return;
        }
        
        try {
            const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
            if (error) throw error;
            successEl.style.display = 'block';
            document.getElementById('new-password-form').reset();
            setTimeout(() => {
                closeModal('newPassword');
                isLoginMode = true;
                updateAuthUI();
                openModal('auth');
            }, 2000);
        } catch (error) {
            errorEl.textContent = 'Failed to update password. Your link may have expired or is invalid.';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Update Password';
        }
    });

    // Listen for Auth events including password recovery
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
            closeModal('auth');
            openModal('newPassword');
        }
    });

    // Initialize Auth state
    checkUser();

});
