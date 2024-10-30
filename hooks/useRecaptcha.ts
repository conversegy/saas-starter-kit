import { useCallback } from 'react';
import env from '@/lib/env';

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export const useRecaptcha = () => {
  const executeRecaptcha = useCallback(async () => {
    // If recaptcha is not configured, return null
    if (!env.recaptcha.siteKey) {
      return null;
    }

    try {
      return await new Promise<string>((resolve) => {
        window.grecaptcha.ready(async () => {
          const token = await window.grecaptcha.execute(
            env.recaptcha.siteKey as string,
            {
              action: 'submit',
            }
          );
          resolve(token);
        });
      });
    } catch (error) {
      console.error('reCAPTCHA error:', error);
      return null;
    }
  }, []);

  return { executeRecaptcha };
}; 