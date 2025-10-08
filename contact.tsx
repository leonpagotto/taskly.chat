import React from 'react';
import ReactDOM from 'react-dom/client';
import ContactPage from './components/marketing/ContactPage';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Could not find root element for contact page');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ContactPage />
  </React.StrictMode>
);
