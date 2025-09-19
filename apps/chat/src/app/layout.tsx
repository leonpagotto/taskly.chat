import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Taskly Chat',
  description: 'AI-assisted task & memory management'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
