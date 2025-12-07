const express = require('express');
const { v4: uuid } = require('uuid');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const dataPath = path.join(__dirname, '..', 'data', 'sessions.json');
const mockResponsePath = path.join(__dirname, '..', 'data', 'mockResponse.json');

// helper to read/write sessions
function readSessions() {
  try {
    const raw = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}
function writeSessions(sessions) {
  fs.writeFileSync(dataPath, JSON.stringify(sessions, null, 2));
}
const mockResponse = require(mockResponsePath);

// Start new chat -> returns session id
router.post('/new-chat', (req, res) => {
  const sessions = readSessions();
  const id = uuid();
  const title = req.body?.title || `Session ${sessions.length + 1}`;
  const newSession = { id, title, history: [] };
  sessions.unshift(newSession); // newest first
  writeSessions(sessions);
  res.json({ sessionId: id, title });
});

// Ask question -> returns mock table + description and stores in session history
router.post('/ask-question', (req, res) => {
  const { sessionId, question } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

  const sessions = readSessions();
  const session = sessions.find(s => s.id === sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const answer = {
    id: uuid(),
    question,
    response: mockResponse,
    createdAt: new Date().toISOString()
  };
  session.history.push(answer);
  writeSessions(sessions);
  res.json(answer);
});

// Fetch all sessions (ids + titles)
router.get('/sessions', (req, res) => {
  const sessions = readSessions();
  res.json(sessions.map(s => ({ id: s.id, title: s.title })));
});

// Fetch session history
router.get('/session/:id', (req, res) => {
  const sessions = readSessions();
  const s = sessions.find(x => x.id === req.params.id);
  if (!s) return res.status(404).json({ error: 'Not found' });
  res.json(s);
});

module.exports = router;