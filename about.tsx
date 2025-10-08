import React from 'react';
import ReactDOM from 'react-dom/client';
import LandingPage from './components/LandingPage';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element for about page');
}

const redirectToAppAuth = () => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.origin + '/');
  url.searchParams.set('login', 'open');
  window.location.href = url.toString();
};

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <LandingPage onSignIn={redirectToAppAuth} />
  </React.StrictMode>
);
