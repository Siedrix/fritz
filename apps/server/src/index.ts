import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

// In-memory storage for counters
const counters: Record<string, { count: number; lastClick: string }> = {};

app.get('/api', (req, res) => {
  res.json({ message: 'Delphi Server API is running!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/counters', (req, res) => {
  const countersList = Object.entries(counters).map(([uuid, data]) => ({
    uuid,
    ...data
  }));
  res.json(countersList);
});

app.get('/api/counter/:uuid', (req, res) => {
  const { uuid } = req.params;
  
  if (!counters[uuid]) {
    counters[uuid] = { count: 0, lastClick: new Date().toISOString() };
  }
  
  res.json(counters[uuid]);
});

app.post('/api/counter/:uuid', (req, res) => {
  const { uuid } = req.params;
  
  if (!counters[uuid]) {
    counters[uuid] = { count: 0, lastClick: new Date().toISOString() };
  }
  
  counters[uuid].count += 1;
  counters[uuid].lastClick = new Date().toISOString();
  
  res.json(counters[uuid]);
});

app.delete('/api/counter/:uuid', (req, res) => {
  const { uuid } = req.params;
  
  if (counters[uuid]) {
    delete counters[uuid];
    res.json({ success: true, message: 'Counter deleted' });
  } else {
    res.status(404).json({ success: false, message: 'Counter not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});