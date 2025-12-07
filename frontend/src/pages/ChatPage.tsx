import React, { useEffect, useState } from 'react';
import axios from 'axios';

type Session =  { id : string , title : string};
type Answer = { id: string; question: string; response: any; createdAt?: string; };

export default function ChatPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [activeSession, setActiveSession] = useState<string | null>(null);
    const [error, setError] = useState<String>(""); 
    const [question, setQuestion] = useState('');
    const [history, setHistory] = useState<Answer[]>([]);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    async function fetchSessions() {
        const res = await axios.get(`${apiUrl}/sessions`)
        setSessions(res.data);     
    }   
    useEffect(() => {
        fetchSessions();
    }, []);

    async function startNewChat() {
        try {
          const res = await axios.post(`${apiUrl}/new-chat`, { title: `Chat ${Date.now()}` });
          setSessions(s => [ { id: res.data.sessionId, title: res.data.title }, ...s ]);
          setActiveSession(res.data.sessionId);
          setHistory([]);
        } catch (e) { console.error(e); }
      }
   
    async function loadSession(id : string){
        try {
           const res = await axios.get(`${apiUrl}/session/${id}`);
           setActiveSession(id);
           setHistory(res.data.history || []);     
        } catch(e) { console.error(e)}

    }

    async function askQuestion() {
        if (!question.trim()) {
            setError("Name is required");
            return;
          }
        
        try {
          const res = await axios.post(`${apiUrl}/ask-question`, { sessionId: activeSession, question });
          setHistory(h => [...h, res.data]);
          setQuestion('');
        } catch (e) { console.error(e); }
      }

    return <div className='md:flex gap-4'>
        <aside className="w-full md:w-1/4 border p-3 rounded">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">All chats</h2>
          <button onClick={startNewChat} className="px-2 py-1 border rounded text-sm">Start New Chat</button>
        </div>

        <div className="space-y-2 max-h-[60vh] overflow-auto">
          {sessions.length === 0 && <div className="text-sm text-gray-500">No chats yet</div>}
          {sessions.map(s => (
            <div key={s.id}
              onClick={() => loadSession(s.id)}
              className={`p-2 rounded cursor-pointer ${s.id === activeSession ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <div className="text-sm font-medium">{s.title}</div>
              <div className="text-xs text-gray-500">{s.id}</div>
            </div>
          ))}
        </div>

        </aside>
        <section className="flex-1 border p-3 rounded">
        {!activeSession ? (
          <div className="text-center py-10 text-gray-500">Start a new chat to begin</div>
        ) : (
          <>
            <div className="mb-4">
              <div className="space-y-3">
                {history.length === 0 && <div className="text-sm text-gray-500">No messages yet</div>}
                {history.map(h => (
                  <div key={h.id} className="p-3 border rounded">
                    <div className="text-sm font-medium mb-2">Q: {h.question}</div>
                    <div className="mb-2">
                      <div className="overflow-auto">
                        <table className="min-w-full table-auto border-collapse">
                          <thead>
                            <tr>
                              {Object.keys(h.response.table[0] || {}).map((k,i) => <th key={i} className="border px-2 text-left">{k}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {h.response.table.map((row:any, idx:number) => (
                              <tr key={idx}>
                                {Object.keys(row).map((k, j) => <td key={j} className="border px-2">{row[k]}</td>)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">{h.response.description}</div>
                    <div className="flex gap-2 mt-2">
                      <button className="px-2 py-1 border rounded">👍 Like</button>
                      <button className="px-2 py-1 border rounded">👎 Dislike</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                value={question}
                onChange={e => {
                    setError("");
                    setQuestion(e.target.value)
                }}
                placeholder="Ask a question..."
                className="flex-1 border p-2 rounded"
                style={error ? { border : "1px solid red "} : {}}
              />
              <button onClick={askQuestion} className="px-4 py-2 border rounded">Ask Question</button>
            </div>
          </>
        )}
            
        </section>
    </div>
}