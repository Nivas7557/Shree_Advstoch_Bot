# 📈 AdvStoch Automated NSE Screener & Telegram Bot
### (AdvStoch ఆటోమేటెడ్ NSE స్క్రీనర్ & టెలిగ్రామ్ అలర్ట్ బాట్)

**Created & Maintained by:** © **Shreenivasss**  
**Indicator Engine:** AdvStoch v5.5.3 — Institutional Edition

---

## 🌟 What It Does | ఇది ఏం చేస్తుంది?
* **[ENG]** Scans NSE stocks every **15 minutes** (Mon–Fri, 9:15 AM – 3:30 PM IST) using **AdvStoch v5.5.3** and sends instant **Telegram alerts** when your condition matches.
* **[TEL]** సోమవారం నుండి శుక్రవారం వరకు మార్కెట్ టైమ్‌లో ప్రతి **15 నిమిషాలకు** **AdvStoch v5.5.3** ద్వారా NSE స్టాక్స్ స్కాన్ చేసి, కండిషన్ మ్యాచ్ అయితే వెంటనే మీ **Telegram** కి అలర్ట్ పంపుతుంది.

---

## 📱 How to Use (Step-by-Step) | వాడుక విధానం

### 1. Daily Routine (రోజువారీ వాడుక)
* **Nothing to run manually:** Once set up, GitHub runs this automatically every 15 mins during market hours. *(మీరు ఏమీ రన్ చేయాల్సిన పని లేదు, ఆటోమేటిక్‌గా నడుస్తుంది).*
* **When an alert arrives:** Open that stock on **TradingView (`15m` chart)** -> verify the **AdvStoch** crossover -> take your trade decision. *(Telegram లో మెసేజ్ రాగానే TradingView చార్ట్‌లో కన్ఫర్మ్ చేసుకుని ట్రేడ్ తీసుకోండి).*

### 2. How to Edit Stocks / Timeframe / Rules (మార్పులు చేయడం ఎలా?)
1. Click on the file you want to change:
   * **`stocks.txt`** -> Add or remove NSE stock names (1 per line, no `.NS`).
   * **`timeframe.txt`** -> Change `15m` to `5m`, `1h`, or `1d`.
   * **`conditions.pine`** -> Change `buyCond` or `sellCond` rules.
2. Click the **Pencil icon (✏️ Edit)** on the top right.
3. Make your changes -> click green **Commit changes** button. *(మార్పు సేవ్ అవ్వగానే తర్వాతి స్కాన్ నుండి కొత్త రూల్స్ అమలవుతాయి).*

### 3. Manual Run & Pause Controls (కంట్రోల్స్)
* **Scan Right Now:** Go to **Actions** tab -> **AdvStoch Stock Screener** -> **Run workflow**. *(ఇప్పుడే స్కాన్ చేయడానికి).*
* **Stop / Start Alerts:** Go to **Actions** tab -> **AdvStoch Stock Screener** -> click **`...`** (top right) -> **Disable workflow** (to pause) or **Enable workflow** (to resume). *(అలర్ట్స్ ఆపడానికి / మళ్ళీ ఆన్ చేయడానికి).*

---

## 🚀 First-Time Setup (For New Repo) | కొత్త సెటప్
1. **Telegram:** Get **Bot Token** from `@BotFather` & **Chat ID** from `@userinfobot`. Open your bot and click **Start**.
2. **GitHub Secrets:** Go to **Settings -> Secrets and variables -> Actions** -> add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.
3. **Activate:** Open **Actions** tab -> click **Run workflow**.

*(🔒 **Do Not Edit:** `advstoch.pine`, `scanner.js`, `.github/workflows/scan.yml`)*

---

## 📜 Credits & License | క్రెడిట్స్ & లైసెన్స్
* **Author & Creator:** **Shreenivasss** (Original creator of *AdvStoch v5.5.3* & Screener Architecture)
* **Powered By:** [PineTS](https://github.com) (Pine Script Runtime), [yahoo-finance2](https://github.com) (Market Data), & GitHub Actions.
* **License:** This project is licensed under the **Mozilla Public License 2.0 (MPL-2.0)** — see [mozilla.org/MPL/2.0](https://mozilla.org) for details.
* **Disclaimer:** *For personal technical analysis and educational alerts only. Always verify signals on TradingView before trading.*
