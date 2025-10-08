import React, { useEffect, useState } from 'react';
import { microsoftGraphService } from '../services/microsoftGraphService';

interface MicrosoftCallbackProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

/**
 * OAuth Callback Handler for Microsoft Calendar Integration
 * This component handles the OAuth redirect from Microsoft
 */
const MicrosoftCallback: React.FC<MicrosoftCallbackProps> = ({ onSuccess, onError }) => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Connecting to Microsoft...');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Parse the OAuth response from URL
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      if (error) {
        throw new Error(errorDescription || error);
      }

      if (!code) {
        throw new Error('No authorization code received');
      }

      setMessage('Exchanging authorization code...');
      
      // Exchange code for tokens
      const success = await microsoftGraphService.handleCallback(code);
      
      if (!success) {
        throw new Error('Failed to complete authentication');
      }

      setStatus('success');
      setMessage('Successfully connected to Microsoft Calendar!');
      
      // Redirect back to settings after a brief delay
      setTimeout(() => {
        const returnUrl = sessionStorage.getItem('microsoft_oauth_return_url') || '/';
        sessionStorage.removeItem('microsoft_oauth_return_url');
        onSuccess();
        
        // Navigate to settings integrations tab
        window.location.href = returnUrl + '?view=settings&tab=integrations';
      }, 1500);

    } catch (err) {
      console.error('OAuth callback error:', err);
      setStatus('error');
      const errorMsg = err instanceof Error ? err.message : 'Authentication failed';
      setMessage(errorMsg);
      onError(errorMsg);
      
      // Redirect back after delay
      setTimeout(() => {
        const returnUrl = sessionStorage.getItem('microsoft_oauth_return_url') || '/';
        sessionStorage.removeItem('microsoft_oauth_return_url');
        window.location.href = returnUrl + '?view=settings&tab=integrations';
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          {/* Loading/Success/Error Icon */}
          <div className="mb-6">
            {status === 'processing' && (
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-[var(--color-primary-600)]"></div>
            )}
            {status === 'success' && (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>

          {/* Status Message */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {status === 'processing' && 'Connecting...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Connection Failed'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>

          {/* Progress Indicator */}
          {status === 'processing' && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] h-2 animate-pulse" style={{ width: '60%' }}></div>
            </div>
          )}

          {/* Redirect Notice */}
          {(status === 'success' || status === 'error') && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
              Redirecting you back to settings...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MicrosoftCallback;
