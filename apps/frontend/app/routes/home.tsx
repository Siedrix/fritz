import type { Route } from "./+types/home";
import { Form } from "react-router";
import { useState, useEffect } from "react";
import { fetchTickerPrice, type TickerData } from "../actions/ticker";

interface TrackedTicker {
  uuid: string;
  ticker: string;
  price: number | null;
  lastUpdated: string | null;
  error: string | null;
  addedAt: string;
}

interface ActionData {
  success?: boolean;
  ticker?: string;
  priceData?: {
    ticker: string;
    price: number;
    date: string;
  };
  error?: string;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Fritz - Stock Ticker Tracker" },
    { name: "description", content: "Track stock prices using ForgeHive tasks" },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method === "POST") {
    const formData = await request.formData();
    const action = formData.get("action");

    if (action === "fetchTickerPrice") {
      const ticker = formData.get("ticker") as string;
      if (ticker) {
        try {
          const priceData = await fetchTickerPrice(ticker.toUpperCase());
          return { success: true, ticker: ticker.toUpperCase(), priceData };
        } catch (error) {
          return { success: false, ticker: ticker.toUpperCase(), error: error instanceof Error ? error.message : 'Unknown error occurred' };
        }
      }
    }
  }
}

export async function loader() {
  return {};
}

export default function Home({ actionData }: Route.ComponentProps) {
  const typedActionData = actionData as ActionData | undefined;
  const [tickers, setTickers] = useState<TrackedTicker[]>([]);
  const [isLoadingTicker, setIsLoadingTicker] = useState(false);

  // Handle ticker price fetch response
  useEffect(() => {
    if (typedActionData?.ticker) {
      if (typedActionData.success && typedActionData.priceData) {
        // Add ticker to list with price data
        const newTicker: TrackedTicker = {
          uuid: crypto.randomUUID(),
          ticker: typedActionData.ticker,
          price: typedActionData.priceData.price,
          lastUpdated: typedActionData.priceData.date,
          error: null,
          addedAt: new Date().toISOString()
        };
        setTickers(prev => [...prev, newTicker]);
      } else {
        // Add ticker to list with error state
        const newTicker: TrackedTicker = {
          uuid: crypto.randomUUID(),
          ticker: typedActionData.ticker,
          price: null,
          lastUpdated: null,
          error: typedActionData.error || 'Unknown error',
          addedAt: new Date().toISOString()
        };
        setTickers(prev => [...prev, newTicker]);
      }
      setIsLoadingTicker(false);

      // Clear the input field
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) {
        form.reset();
      }
    }
  }, [typedActionData]);

  // Reset loading state when actionData changes or is cleared
  useEffect(() => {
    if (typedActionData === undefined) {
      setIsLoadingTicker(false);
    }
  }, [typedActionData]);

  const checkDuplicateTicker = (tickerSymbol: string) => {
    const upperTicker = tickerSymbol.toUpperCase();
    // Check if ticker already exists
    return tickers.some(t => t.ticker === upperTicker);
  };

  const removeTicker = (uuid: string) => {
    setTickers(prev => prev.filter(t => t.uuid !== uuid));
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-100">
            Stock Ticker Tracker
          </h1>

          <div className="mb-8 space-y-4">
            <Form
              method="post"
              className="flex gap-4 justify-center items-end"
              onSubmit={(e) => {
                const formData = new FormData(e.currentTarget);
                const ticker = formData.get('ticker') as string;
                if (ticker && checkDuplicateTicker(ticker)) {
                  e.preventDefault();
                  alert(`${ticker.toUpperCase()} is already being tracked`);
                } else if (ticker) {
                  setIsLoadingTicker(true);
                  // Let the form submit naturally to React Router

                  // Safety timeout to reset loading state
                  setTimeout(() => {
                    setIsLoadingTicker(false);
                  }, 10000); // 10 second timeout
                }
              }}
            >
              <div className="flex flex-col">
                <label htmlFor="ticker" className="text-sm text-gray-300 mb-1">
                  Stock Ticker
                </label>
                <input
                  type="text"
                  name="ticker"
                  id="ticker"
                  placeholder="e.g., AAPL, TSLA"
                  required
                  className="px-3 py-2 bg-navy-700 border border-navy-500 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                />
              </div>
              <input type="hidden" name="action" value="fetchTickerPrice" />
              <button
                type="submit"
                disabled={isLoadingTicker}
                className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-navy-900 font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                {isLoadingTicker ? 'Adding...' : 'Track Ticker'}
              </button>
            </Form>
          </div>

          {tickers.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Tracked Tickers</h2>
              <div className="grid gap-4">
                {tickers.map((ticker) => (
                  <div
                    key={ticker.uuid}
                    className="bg-navy-700 rounded-lg shadow-lg p-4 border border-navy-500"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-100 mb-1">
                          {ticker.ticker}
                        </h3>
                        {ticker.price !== null ? (
                          <div>
                            <p className="text-2xl font-bold text-yellow-400">
                              ${ticker.price.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-300">
                              Updated: {new Date(ticker.lastUpdated!).toLocaleString()}
                            </p>
                          </div>
                        ) : ticker.error ? (
                          <p className="text-red-400 text-sm">
                            Error: {ticker.error}
                          </p>
                        ) : (
                          <p className="text-gray-400 text-sm">
                            Loading price...
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Remove ${ticker.ticker} from tracking?`)) {
                            removeTicker(ticker.uuid);
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded transition duration-200 ml-4"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>

        </div>
      </div>
  );
}
