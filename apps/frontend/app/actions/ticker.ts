import { getPrice } from '@fritz/forge-sample';

export interface TickerData {
  ticker: string;
  price: number;
  date: string;
}

export async function fetchTickerPrice(ticker: string): Promise<TickerData> {
  console.log('fetchTickerPrice', ticker);
  try {
    const [result, error, record] = await getPrice.safeRun({ ticker });

    console.log('result', result);
    console.log('record', record);

    if (error) {
      throw new Error(`Failed to fetch price for ${ticker}: ${error.message}`);
    }

    return result as TickerData;
  } catch (error) {
    console.error('Error fetching ticker price:', error);
    throw error;
  }
}