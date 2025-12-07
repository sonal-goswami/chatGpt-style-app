import React, { useState } from 'react';
import ChatPage from './pages/ChatPage';

export default function App() {
  const [dark, setDark] = useState(false);
  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen">
        <header className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-semibold">Chat Screen</h1>
          <div>
            <button
              onClick={() => setDark(d => !d)}
              className="px-3 py-1 border rounded"
            >
              Toggle {dark ? 'Light' : 'Dark'}
            </button>
          </div>
        </header>

        <main className="p-4">
          <ChatPage />
        </main>
      </div>
    </div>
  );
}