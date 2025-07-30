import express from 'express';
import cors from 'cors';
import stocksRouter from './routes/stocks';

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/stock', stocksRouter);

app.get('/api', (req, res) => {
  res.json({ message: 'Delphi Server API is running!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});