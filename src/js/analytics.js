// ================================
// ANALYTICS & TRACKING SYSTEM
// Privacy-first, self-hosted analytics
// ================================

class AnalyticsSystem {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.events = [];
        this.sessionData = {
            startTime: Date.now(),
            pageViews: 0,
            events: [],
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
        this.init();
    }

    init() {
        this.trackPageView();
        this.setupEventListeners();
        this.setupBeforeUnload();
        this.loadSessionData();
    }

    // Generate unique session ID
    generateSessionId() {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Track page view
    trackPageView() {
        this.sessionData.pageViews++;
        
        const pageData = {
            type: 'pageview',
            timestamp: Date.now(),
            url: window.location.href,
            path: window.location.pathname,
            title: document.title,
            referrer: document.referrer
        };

        this.events.push(pageData);
        this.saveToStorage();

        // Send to backend if available
        if (window.APP_CONFIG?.isDevelopment()) {
            console.log('📊 Page view:', pageData);
        }
    }

    // Track custom event
    track(eventName, properties = {}) {
        const event = {
            type: 'event',
            name: eventName,
            timestamp: Date.now(),
            properties: properties,
            page: window.location.pathname
        };

        this.events.push(event);
        this.sessionData.events.push(event);
        this.saveToStorage();

        if (window.APP_CONFIG?.isDevelopment()) {
            console.log('📊 Event:', eventName, properties);
        }

        return event;
    }

    // Track user interactions
    setupEventListeners() {
        // Track clicks on important elements
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a, button, .trackable');
            if (!target) return;

            const eventData = {
                element: target.tagName.toLowerCase(),
                text: target.textContent?.trim().substring(0, 50),
                href: target.href || null,
                classList: Array.from(target.classList)
            };

            this.track('click', eventData);
        }, { passive: true });

        // Track scroll depth
        let maxScroll = 0;
        let scrollTimeout;

        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            
            scrollTimeout = setTimeout(() => {
                const scrollPercent = Math.round(
                    (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
                );

                if (scrollPercent > maxScroll) {
                    maxScroll = scrollPercent;
                    
                    // Track milestones
                    if ([25, 50, 75, 100].includes(scrollPercent)) {
                        this.track('scroll_depth', { percent: scrollPercent });
                    }
                }
            }, 500);
        }, { passive: true });

        // Track time on page
        this.trackTimeOnPage();

        // Track errors
        window.addEventListener('error', (e) => {
            this.track('error', {
                message: e.message,
                filename: e.filename,
                line: e.lineno,
                column: e.colno
            });
        });

        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.track('unhandled_rejection', {
                reason: e.reason?.toString()
            });
        });
    }

    // Track time spent on page
    trackTimeOnPage() {
        let startTime = Date.now();
        let isVisible = !document.hidden;

        // Track visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Tab became hidden
                const timeSpent = Date.now() - startTime;
                this.track('time_on_page', {
                    duration: timeSpent,
                    visible: false
                });
                isVisible = false;
            } else {
                // Tab became visible
                startTime = Date.now();
                isVisible = true;
            }
        });

        // Track on page unload
        window.addEventListener('beforeunload', () => {
            if (isVisible) {
                const timeSpent = Date.now() - startTime;
                this.track('time_on_page', {
                    duration: timeSpent,
                    visible: true
                });
            }
        });
    }

    // Setup beforeunload handler
    setupBeforeUnload() {
        window.addEventListener('beforeunload', () => {
            this.sessionData.endTime = Date.now();
            this.sessionData.duration = this.sessionData.endTime - this.sessionData.startTime;
            
            // Send final analytics
            this.sendBeacon();
        });
    }

    // Send analytics using sendBeacon
    sendBeacon() {
        if (!navigator.sendBeacon) return;

        const data = {
            sessionId: this.sessionId,
            session: this.sessionData,
            events: this.events
        };

        // Send to backend endpoint if available
        const endpoint = window.APP_CONFIG?.getFullApiUrl('/analytics') || '/api/analytics';
        
        try {
            navigator.sendBeacon(endpoint, JSON.stringify(data));
        } catch (error) {
            console.error('Analytics: Failed to send beacon', error);
        }
    }

    // Save to localStorage
    saveToStorage() {
        try {
            const data = {
                sessionId: this.sessionId,
                sessionData: this.sessionData,
                events: this.events.slice(-100) // Keep last 100 events
            };
            localStorage.setItem('analytics_session', JSON.stringify(data));
        } catch (error) {
            console.error('Analytics: Failed to save to storage', error);
        }
    }

    // Load from localStorage
    loadSessionData() {
        try {
            const stored = localStorage.getItem('analytics_session');
            if (stored) {
                const data = JSON.parse(stored);
                
                // Check if it's the same session (within 30 minutes)
                if (Date.now() - data.sessionData.startTime < 30 * 60 * 1000) {
                    this.sessionId = data.sessionId;
                    this.sessionData = data.sessionData;
                    this.events = data.events || [];
                }
            }
        } catch (error) {
            console.error('Analytics: Failed to load from storage', error);
        }
    }

    // Get session summary
    getSessionSummary() {
        return {
            sessionId: this.sessionId,
            duration: Date.now() - this.sessionData.startTime,
            pageViews: this.sessionData.pageViews,
            eventCount: this.events.length,
            events: this.events
        };
    }

    // Track user properties
    setUserProperties(properties) {
        this.sessionData.userProperties = {
            ...(this.sessionData.userProperties || {}),
            ...properties
        };
        this.saveToStorage();
    }

    // Track conversion
    trackConversion(conversionName, value = null) {
        this.track('conversion', {
            name: conversionName,
            value: value
        });
    }

    // Track performance metrics
    trackPerformance() {
        if (!window.performance) return;

        const perfData = window.performance.getEntriesByType('navigation')[0];
        if (!perfData) return;

        this.track('performance', {
            loadTime: perfData.loadEventEnd - perfData.loadEventStart,
            domReady: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
            transferSize: perfData.transferSize
        });
    }
}

// ================================
// USER BEHAVIOR TRACKING
// ================================

class BehaviorTracker {
    constructor() {
        this.mouseMovements = [];
        this.clicks = [];
        this.setupTracking();
    }

    setupTracking() {
        // Track mouse movements (sampled)
        let lastRecorded = 0;
        document.addEventListener('mousemove', (e) => {
            const now = Date.now();
            if (now - lastRecorded > 100) { // Sample every 100ms
                this.mouseMovements.push({
                    x: e.clientX,
                    y: e.clientY,
                    timestamp: now
                });
                lastRecorded = now;

                // Keep only last 100 movements
                if (this.mouseMovements.length > 100) {
                    this.mouseMovements.shift();
                }
            }
        }, { passive: true });

        // Track clicks
        document.addEventListener('click', (e) => {
            this.clicks.push({
                x: e.clientX,
                y: e.clientY,
                timestamp: Date.now(),
                target: e.target.tagName
            });

            // Keep only last 50 clicks
            if (this.clicks.length > 50) {
                this.clicks.shift();
            }
        }, { passive: true });
    }

    getHeatmapData() {
        return {
            clicks: this.clicks,
            movements: this.mouseMovements
        };
    }
}

// Initialize systems
window.AnalyticsSystem = new AnalyticsSystem();
window.BehaviorTracker = new BehaviorTracker();

// Global analytics function
window.analytics = {
    track: (event, properties) => window.AnalyticsSystem.track(event, properties),
    page: () => window.AnalyticsSystem.trackPageView(),
    setUser: (properties) => window.AnalyticsSystem.setUserProperties(properties),
    conversion: (name, value) => window.AnalyticsSystem.trackConversion(name, value),
    performance: () => window.AnalyticsSystem.trackPerformance(),
    summary: () => window.AnalyticsSystem.getSessionSummary()
};

// Track page performance on load
window.addEventListener('load', () => {
    setTimeout(() => {
        window.AnalyticsSystem.trackPerformance();
    }, 0);
});

console.log('✅ Analytics system initialized');
console.log('📊 Session ID:', window.AnalyticsSystem.sessionId);