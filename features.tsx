import React from 'react';
import ReactDOM from 'react-dom/client';
import FeaturesPage from './components/marketing/FeaturesPage';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Could not find root element for features page');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <FeaturesPage />
  </React.StrictMode>
);
