import express from 'express';
import cors from 'cors';
import { getPrice } from '@fritz/forge-sample';

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());


app.get('/api', (req, res) => {
  res.json({ message: 'Delphi Server API is running!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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