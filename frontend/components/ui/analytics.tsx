'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface AnalyticsProps {
  // Add any props if needed
}

export function Analytics({}: AnalyticsProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Track page views
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: pathname,
      });
    }

    // Track custom events
    const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, parameters);
      }
    };

    // Track user interactions
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest('button, a');
      
      if (button) {
        const action = button.getAttribute('data-analytics-action');
        const category = button.getAttribute('data-analytics-category');
        const label = button.getAttribute('data-analytics-label');
        
        if (action) {
          trackEvent(action, {
            event_category: category || 'user_interaction',
            event_label: label || button.textContent?.trim(),
          });
        }
      }
    };

    // Track form submissions
    const handleSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement;
      const action = form.getAttribute('data-analytics-action');
      
      if (action) {
        trackEvent(action, {
          event_category: 'form_submission',
          event_label: form.getAttribute('data-analytics-label') || 'form_submit',
        });
      }
    };

    // Track wallet connections
    const handleWalletConnect = () => {
      trackEvent('wallet_connected', {
        event_category: 'wallet',
        event_label: 'wallet_connect',
      });
    };

    // Track investment actions
    const handleInvestmentAction = (action: string, amount?: number) => {
      trackEvent('investment_action', {
        event_category: 'investment',
        event_label: action,
        value: amount,
      });
    };

    // Add event listeners
    document.addEventListener('click', handleClick);
    document.addEventListener('submit', handleSubmit);

    // Track performance metrics
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            trackEvent('page_load_performance', {
              event_category: 'performance',
              event_label: 'page_load',
              value: Math.round(navEntry.loadEventEnd - navEntry.loadEventStart),
            });
          }
        }
      });

      observer.observe({ entryTypes: ['navigation'] });
    }

    // Track errors
    const handleError = (event: ErrorEvent) => {
      trackEvent('error', {
        event_category: 'error',
        event_label: event.error?.message || 'unknown_error',
        value: 1,
      });
    };

    window.addEventListener('error', handleError);

    // Track unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackEvent('unhandled_rejection', {
        event_category: 'error',
        event_label: event.reason?.message || 'unknown_rejection',
        value: 1,
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('submit', handleSubmit);
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [pathname]);

  // Track wallet connection events
  useEffect(() => {
    const handleWalletEvent = (event: CustomEvent) => {
      if (event.detail.type === 'connect') {
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'wallet_connected', {
            event_category: 'wallet',
            event_label: 'wallet_connect',
            wallet_type: event.detail.walletType,
          });
        }
      }
    };

    window.addEventListener('wallet-event', handleWalletEvent as EventListener);

    return () => {
      window.removeEventListener('wallet-event', handleWalletEvent as EventListener);
    };
  }, []);

  // Track investment events
  useEffect(() => {
    const handleInvestmentEvent = (event: CustomEvent) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'investment_action', {
          event_category: 'investment',
          event_label: event.detail.action,
          value: event.detail.amount,
          investment_id: event.detail.investmentId,
        });
      }
    };

    window.addEventListener('investment-event', handleInvestmentEvent as EventListener);

    return () => {
      window.removeEventListener('investment-event', handleInvestmentEvent as EventListener);
    };
  }, []);

  // Track user engagement
  useEffect(() => {
    let startTime = Date.now();
    let isActive = true;

    const trackEngagement = () => {
      if (isActive) {
        const duration = Date.now() - startTime;
        if (duration > 30000) { // Track after 30 seconds
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'user_engagement', {
              event_category: 'engagement',
              event_label: 'session_duration',
              value: Math.round(duration / 1000), // Duration in seconds
            });
          }
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActive = false;
        trackEngagement();
      } else {
        isActive = true;
        startTime = Date.now();
      }
    };

    const handleBeforeUnload = () => {
      isActive = false;
      trackEngagement();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Track engagement every 5 minutes
    const interval = setInterval(() => {
      if (isActive) {
        trackEngagement();
        startTime = Date.now();
      }
    }, 300000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(interval);
    };
  }, []);

  return null; // This component doesn't render anything
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
} 