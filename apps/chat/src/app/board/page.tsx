import React from 'react';
import { Board } from '../../components/Board/Board';

export const dynamic = 'force-dynamic';

export default function BoardPage() {
  return (
    <div className="h-screen flex flex-col">
      <Board />
    </div>
  );
}
