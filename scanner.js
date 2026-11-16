import fs from 'fs';
import { PineTS } from 'pinets';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TIMEFRAME = '15m'; // '15m', '1h', లేదా '1d' మార్చుకోవచ్చు

const STOCKS = [
  'ADANIENT.NS', 'ADANIPORTS.NS', 'APOLLOHOSP.NS', 'ASIANPAINT.NS', 'AXISBANK.NS',
  'BAJAJ-AUTO.NS', 'BAJFINANCE.NS', 'BAJAJFINSV.NS', 'BEL.NS', 'BPCL.NS',
  'BHARTIARTL.NS', 'BRITANNIA.NS', 'CIPLA.NS', 'COALINDIA.NS', 'DRREDDY.NS',
  'EICHERMOT.NS', 'GRASIM.NS', 'HCLTECH.NS', 'HDFCBANK.NS', 'HDFCLIFE.NS',
  'HEROMOTOCO.NS', 'HINDALCO.NS', 'HINDUNILVR.NS', 'ICICIBANK.NS', 'ITC.NS',
  'INDUSINDBK.NS', 'INFY.NS', 'JSWSTEEL.NS', 'KOTAKBANK.NS', 'LT.NS',
  'M&M.NS', 'MARUTI.NS', 'NTPC.NS', 'NESTLEIND.NS', 'ONGC.NS',
  'POWERGRID.NS', 'RELIANCE.NS', 'SBILIFE.NS', 'SHRIRAMFIN.NS', 'SBIN.NS',
  'SUNPHARMA.NS', 'TCS.NS', 'TATACONSUM.NS', 'TATAMOTORS.NS', 'TATASTEEL.NS',
  'TECHM.NS', 'TITAN.NS', 'TRENT.NS', 'ULTRACEMCO.NS', 'WIPRO.NS'
];

// ఒరిజినల్ ఇండికేటర్ + కండిషన్స్ ఫైల్ రెంటినీ ఆటోమేటిక్‌గా కలపడం
const baseIndicator = fs.readFileSync('./advstoch.pine', 'utf-8');
const customConditions = fs.readFileSync('./conditions.pine', 'utf-8');
const fullPineCode = `${baseIndicator}\n\n${customConditions}`;

async function sendTelegramAlert(message) {
  const url = `https://telegram.org{TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    })
  });
}

async function fetchCandles(symbol, interval) {
  const period1 = new Date();
  period1.setDate(period1.getDate() - (interval === '1d' ? 400 : 30));

  const result = await yahooFinance.chart(symbol, {
    period1: period1.toISOString().split('T'),
    interval: interval
  });

  return result.quotes
    .filter(q => q.open && q.high && q.low && q.close)
    .map(q => ({
      time: new Date(q.date).getTime(),
      open: q.open,
      high: q.high,
      low: q.low,
      close: q.close,
      volume: q.volume || 0
    }));
}

async function runScanner() {
  console.log(`Scanning ${STOCKS.length} stocks on ${TIMEFRAME}...`);

  for (const symbol of STOCKS) {
    try {
      const candles = await fetchCandles(symbol, TIMEFRAME);
      if (candles.length < 260) continue;

      const pineTS = new PineTS(candles);
      const result = await pineTS.run(fullPineCode);

      const signals = result.plots['BuySignal'].data;
      const kVals   = result.plots['K_Val'].data;
      const dVals   = result.plots['D_Val'].data;

      const lastIdx = signals.length - 2; 
      if (signals[lastIdx] === 1) {
        const cleanName = symbol.replace('.NS', '');
        const price = candles[lastIdx].close.toFixed(2);
        const kVal = kVals[lastIdx].toFixed(3);
        const dVal = dVals[lastIdx].toFixed(3);

        const msg = `🟢 <b>AdvStoch Oversold Crossover!</b>\n\n` +
                    `📈 <b>Stock:</b> ${cleanName}\n` +
                    `⏱ <b>Timeframe:</b> ${TIMEFRAME}\n` +
                    `💰 <b>Price:</b> ₹${price}\n` +
                    `📊 <b>K:</b> ${kVal} | <b>D:</b> ${dVal} (&lt; -0.6)`;

        await sendTelegramAlert(msg);
        console.log(`✅ Alert sent for ${cleanName}`);
      }
    } catch (err) {
      console.error(`❌ Error scanning ${symbol}:`, err.message);
    }
  }
  console.log('Scan finished.');
}

runScanner();
