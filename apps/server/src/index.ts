import express from 'express';
import cors from 'cors';
import { getPrice } from '@fritz/forge-sample';

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

app.get('/api/stock/:ticker', async (req, res) => {
  const { ticker } = req.params;

  if (!ticker) {
    return res.status(400).json({ success: false, message: 'Ticker symbol required' });
  }

  try {
    const [result, error] = await getPrice.safeRun({ ticker: ticker.toUpperCase() });

    if (error || !result) {
      return res.status(500).json({
        success: false,
        message: `Failed to fetch price for ${ticker.toUpperCase()}: ${error?.message || 'Unknown error'}`
      });
    }

    res.json({
      success: true,
      ticker: result.ticker,
      price: result.price,
      date: result.date
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({
      success: false,
      message: `Server error: ${errorMessage}`
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});