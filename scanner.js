// ==============================================================================
// ADVSTOCH AUTOMATED SCREENER ENGINE (DO NOT EDIT | ఈ ఫైల్ మార్చవద్దు)
// [ENG] Reads settings from timeframe.txt, stocks.txt, advstoch.pine & conditions.pine
// [TEL] timeframe.txt, stocks.txt, advstoch.pine & conditions.pine ఫైల్స్ నుండి డేటా తీసుకుంటుంది
// ==============================================================================

import fs from 'fs';
import { PineTS } from 'pinets';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

// [ENG] Telegram Credentials from GitHub Secrets | [TEL] GitHub Secrets నుండి టెలిగ్రామ్ వివరాలు
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// [ENG] Load Timeframe from timeframe.txt | [TEL] timeframe.txt నుండి టైమ్‌ఫ్రేమ్ తీసుకోవడం
const TIMEFRAME = fs.readFileSync('./timeframe.txt', 'utf-8')
  .split('\n')
  .map(line => line.trim())
  .find(line => line && !line.startsWith('#')) || '15m';

// [ENG] Load Stocks List from stocks.txt | [TEL] stocks.txt నుండి స్టాక్స్ లిస్ట్ తీసుకోవడం
const STOCKS = fs.readFileSync('./stocks.txt', 'utf-8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#'))
  .map(sym => sym.endsWith('.NS') ? sym : sym + '.NS');

// [ENG] Combine Base Indicator + Custom Conditions | [TEL] ఒరిజినల్ ఇండికేటర్ + కండిషన్స్ కలపడం
const baseIndicator = fs.readFileSync('./advstoch.pine', 'utf-8');
const customConditions = fs.readFileSync('./conditions.pine', 'utf-8');
const fullPineCode = baseIndicator + '\n\n' + customConditions;

// [ENG] Send Telegram Notification | [TEL] టెలిగ్రామ్ అలర్ట్ పంపే ఫంక్షన్
async function sendTelegramAlert(message) {
  const url = 'https://telegram.org' + '/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';
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

// [ENG] Fetch Historical Candles | [TEL] క్యాండిల్ డేటా తీసుకురావడం
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

// [ENG] Main Scanner Loop | [TEL] ప్రధాన స్కానింగ్ ప్రక్రియ
async function runScanner() {
  console.log('Scanning ' + STOCKS.length + ' stocks on ' + TIMEFRAME + '...');

  for (const symbol of STOCKS) {
    try {
      const candles = await fetchCandles(symbol, TIMEFRAME);
      if (candles.length < 260) continue;

      const pineTS = new PineTS(candles);
      const result = await pineTS.run(fullPineCode);

      const buySignals  = result.plots['BuySignal']?.data || [];
      const sellSignals = result.plots['SellSignal']?.data || [];
      const kVals       = result.plots['K_Val']?.data || [];
      const dVals       = result.plots['D_Val']?.data || [];

      // [ENG] Check last closed candle (-2) | [TEL] అప్పుడే పూర్తయిన క్యాండిల్ (-2) చెక్ చేయడం
      const lastIdx = buySignals.length - 2;
      const cleanName = symbol.replace('.NS', '');
      const price = candles[lastIdx].close.toFixed(2);
      const kVal = Number(kVals[lastIdx]).toFixed(3);
      const dVal = Number(dVals[lastIdx]).toFixed(3);

      // BUY ALERT
      if (Number(buySignals[lastIdx]) === 1 || buySignals[lastIdx] === true) {
        const msg = '🟢 <b>BUY: AdvStoch Signal Alert!</b>\n\n' +
                    '📈 <b>Stock:</b> ' + cleanName + '\n' +
                    '⏱ <b>Timeframe:</b> ' + TIMEFRAME + '\n' +
                    '💰 <b>Price:</b> ₹' + price + '\n' +
                    '📊 <b>K:</b> ' + kVal + ' | <b>D:</b> ' + dVal;
        await sendTelegramAlert(msg);
        console.log('✅ BUY Alert sent for ' + cleanName);
      }

      // SELL ALERT
      if (Number(sellSignals[lastIdx]) === 1 || sellSignals[lastIdx] === true) {
        const msg = '🔴 <b>SELL: AdvStoch Signal Alert!</b>\n\n' +
                    '📉 <b>Stock:</b> ' + cleanName + '\n' +
                    '⏱ <b>Timeframe:</b> ' + TIMEFRAME + '\n' +
                    '💰 <b>Price:</b> ₹' + price + '\n' +
                    '📊 <b>K:</b> ' + kVal + ' | <b>D:</b> ' + dVal;
        await sendTelegramAlert(msg);
        console.log('✅ SELL Alert sent for ' + cleanName);
      }
    } catch (err) {
      console.error('❌ Error scanning ' + symbol + ':', err.message);
    }
  }
  console.log('Scan finished.');
}

runScanner();
