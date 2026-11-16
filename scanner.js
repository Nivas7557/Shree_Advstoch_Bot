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

async function sendTelegramAlert(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('❌ ERROR: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing in GitHub Secrets!');
    return;
  }

  const url = 'https://telegram.org' + TELEGRAM_BOT_TOKEN + '/sendMessage';
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

runScanner();
