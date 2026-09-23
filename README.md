# Basepath â€” baseball roster location reports

A Next.js app prepared for GitHub and Vercel. Search a player, review a draft roster timeline and injured-list periods, and export team game locations to Excel. Or enter exact team assignment ranges manually. The default year is **2026**, January 1 through December 31; completed games appear as they become available.

## Upload to GitHub, then Vercel

1. Create an empty GitHub repository. Upload the **contents of this folder**, so `package.json` and `app` are at the repository root. Keep personal player exports out of the repository.
2. In Vercel, choose **Add New â†’ Project**, then import that repository.
3. Select **Next.js**, root directory `./`, Node.js **22.x**. The build command is `npm run build`; installation is `npm install`. Leave the output directory at the Next.js default.
4. Deploy. **No API keys, database, or environment variables are required.** The server must be able to reach `statsapi.mlb.com`.

A GitHub Actions workflow runs type checks, date/roster tests, and a production build after upload. See [Vercel?s Next.js guide](https://vercel.com/docs/frameworks/full-stack/nextjs) for hosting details.

Nothing has been uploaded or deployed for you. Access controls are managed through your Vercel project; this app does not include authentication.

## Run locally ? no Node.js, npm, or downloads

This folder includes a local Python version using only Python's built-in standard library. Python is already installed on this computer.

1. Double-click **Start Basepath.cmd**.
2. Open **http://127.0.0.1:8765** in your browser.
3. Keep the terminal open. Use the **Player** tab for roster and IL workpapers, or the **Team** tab for a team’s full-year game schedule. Click **Prepare workpaper** or **View team schedule**.
4. Click **Refresh to latest** to fetch current records again. The default season is 2026, through the date the report is run. Nothing updates on a schedule.

Or run from PowerShell:

```powershell
cd "C:\Users\hclevenger\Desktop\Baseball\Active Players Schedule"
python local_server.py
```

Press Ctrl+C in the server window to stop. If port 8765 is already in use, open the existing app or run `python local_server.py --port 8766` and use that address.

An internet connection is needed to fetch MLB records. No API keys or software downloads are required. Reports are kept in memory, with the last 20 available for export until the app stops. Export Excel files before closing if you want to keep them.

The Next.js source remains ready for GitHub/Vercel; it is separate from the local Python server. Vercel runs the Next.js version. The local version includes the same roster/IL research workflow and a real .xlsx writer with no package dependencies.

Local verification: 13 Python tests passed, including roster date logic, retroactive IL, report refresh, local HTTP endpoints, and Excel file structure. A live 2026 MLB player report and workbook generation also passed. These checks verify the app mechanics, not the completeness of MLB roster history.

```powershell
python -m unittest discover -s tests -p test_local.py -v
```

## What the report means

- **Roster membership, not appearances:** team games during the roster intervals are included whether or not the player entered the game.
- **Automatic player lookup is a draft.** It combines dated `rosterEntries` with assignment transactions. Provider roster entries can span organizational or 40-man membership; movement descriptions can be ambiguous. It does not guarantee a complete daily active-roster history. Read the transaction list and correct assignments using manual team periods before relying on the report.
- **IL / IR:** injured-list placements and activations use effective dates, including retroactive changes. Activation ends an IL interval the previous day. Transfers between IL types preserve the start. An unresolved IL interval ends at the report cutoff and is labeled open; it is not a prediction of future status. The app fetches two prior years of transactions to help identify carry-in IL periods, but still requires review for incomplete histories.
- **Rehab / inactive periods:** manual assignments support separate rehab and inactive statuses. Automatic rehab and overlapping parent-team records require review.
- **Locations are the teamâ€™s ballpark locations, not confirmed player locations.** In particular, a player on IL may be elsewhere. Do not use team game totals as actual presence or taxable duty-day totals.
- Off-days, practices, travel, and rehabilitation-facility locations are not inferred. Location periods merge only consecutive game dates with the same team, location, and roster status. Doubleheaders count as two games and one unique game date.
- MLB, Triple-A, Double-A, High-A, Single-A, and Rookie teams are requested separately. Historical and rookie coverage varies; empty results are not proof of no roster membership or games. Winter, independent, and international national teams are outside this versionâ€™s supported leagues, but international venues used by supported teams are preserved.
- Only provider-final games are included. Future, postponed, cancelled, and in-progress games are excluded. Resumed and rescheduled games are flagged where source fields identify them. Official game dates may not represent every day a suspended game was played.
- State/province and country come from the venue, not the home teamâ€™s name. Missing fields remain `Unknown`.

## Excel export

The `.xlsx` workbook includes report notes, location periods, jurisdiction totals, individual games with roster status, assignment periods, injured-list periods, transactions, and source URLs with retrieval time. Jurisdiction totals include IL team locations; review the status columns and IL sheet. The export uses text cells for source strings and does not turn names into spreadsheet formulas.

## Next.js / Vercel developer checks

```powershell
npm install
npm run typecheck
npm test
npm run build
```

Node.js was unavailable in the creation environment and its download was declined, so the Next.js build and JavaScript tests have **not been executed here** (the separate local Python version has been tested). Live MLB player, roster, venue, and transaction responses were inspected. Run the checks above before relying on deployment. The first `npm install` creates a lockfile; commit that file afterward for reproducible installs.

Data source: [MLB Stats API](https://statsapi.mlb.com/api/v1/sports). MLB data responses link to [MLB data terms](https://gdx.mlb.com/components/copyright.txt). This is an independent research tool, not an MLB product.

## CPA workspace

Player and Team are separate top-level views. Player exports contain exactly three sheets: **Summary**, **Location periods**, and **Transactions**. The Summary sheet includes the player name, tax year, completed-game total, and jurisdiction summary. Location-period statuses are limited to **Transaction**, **Roster entry**, and **Injured list**. Team exports contain one **Summary** sheet with start date, end date, city, state or province, country, and number of games.
