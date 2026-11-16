import fs from 'fs';
import { PineTS } from 'pinets';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TIMEFRAME = '15m';

const STOCKS = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS']; // టెస్టింగ్ కోసం 3 స్టాక్స్ మాత్రమే

const baseIndicator = fs.readFileSync('./advstoch.pine', 'utf-8');
const customConditions = fs.readFileSync('./conditions.pine', 'utf-8');
const fullPineCode = `${baseIndicator}\n\n${customConditions}`;

async function sendTelegramAlert(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('❌ ERROR: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing in GitHub Secrets!');
    return;
  }

  const url = `https://telegram.org{TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'HTML'
    })
  });

  const data = await res.json();
  if (!data.ok) {
    console.error('❌ Telegram API Error:', JSON.stringify(data));
  } else {
    console.log('✅ Telegram Message Delivered Successfully!');
  }
}

async function fetchCandles(symbol, interval) {
  const period1 = new Date();
  period1.setDate(period1.getDate() - 30);

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
  console.log('--- Starting Diagnostic Test ---');
  // 1. ముందుగా Telegram కనెక్షన్ డైరెక్ట్ టెస్ట్
  await sendTelegramAlert('🔔 <b>Test Alert:</b> AdvStoch Scanner connected!');

  for (const symbol of STOCKS) {
    try {
      const candles = await fetchCandles(symbol, TIMEFRAME);
      console.log(`${symbol}: Fetched ${candles.length} candles.`);

      const pineTS = new PineTS(candles);
      const result = await pineTS.run(fullPineCode);

      console.log('Available Plots:', Object.keys(result.plots));
      const signals = result.plots['BuySignal']?.data;
      const kVals   = result.plots['K_Val']?.data;
      const dVals   = result.plots['D_Val']?.data;

      const lastIdx = signals.length - 2;
      console.log(`${symbol} -> Signal: ${signals[lastIdx]}, K: ${kVals[lastIdx]}, D: ${dVals[lastIdx]}`);

      if (Number(signals[lastIdx]) === 1 || signals[lastIdx] === true) {
        const cleanName = symbol.replace('.NS', '');
        const msg = `🟢 <b>${cleanName}</b> | K: ${Number(kVals[lastIdx]).toFixed(3)} | D: ${Number(dVals[lastIdx]).toFixed(3)}`;
        await sendTelegramAlert(msg);
      }
    } catch (err) {
      console.error(`❌ Error in ${symbol}:`, err);
    }
  }
}

runScanner();
