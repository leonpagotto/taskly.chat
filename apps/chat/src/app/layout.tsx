import React from 'react';
import { ToastProvider } from '../components/Toast';
import './globals.css';

export const metadata = {
  title: 'Taskly Chat',
  description: 'AI-assisted task & memory management'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
