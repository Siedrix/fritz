import { Router, type Router as ExpressRouter } from 'express';
import { getPrice } from '@fritz/forge-sample';

const router: ExpressRouter = Router();

router.get('/:ticker', async (req, res) => {
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

export default router;