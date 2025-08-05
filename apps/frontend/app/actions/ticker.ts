import { getPrice } from '@fritz/forge-sample';
import { taskToAction, type ActionResult } from '~/lib/taskToAction';

export interface TickerData {
  ticker: string;
  price: number;
  date: string;
}

// Convert the ForgeHive task to an action
const getPriceAction = taskToAction<TickerData>(getPrice);

export async function fetchTickerPrice(ticker: string): Promise<TickerData> {
  const result: ActionResult<TickerData> = await getPriceAction({ ticker });
  
  if (!result.success) {
    throw new Error(result.error || result.message);
  }
  
  return result.data!;
}