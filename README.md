# NASA: Keep It Alive

A standalone single-player strategy game for GitHub Pages. Open `index.html` to play locally or upload all files to a GitHub repository and enable Pages (Settings → Pages → Deploy from branch → main / root).

## Rules
Each turn represents a year. Starting resources: 10 MD cash, 0 MG fuel, 1.5 MD/MG fuel price, 75% happiness, and 5 MD annual funding (equivalent to 2.5% on the # track). One starting card. Draw up to one card and play up to one card each year, then choose one action: launch, gain 3 MD, draw 2 cards, or buy fuel. Completing a mission gives its reward and counts as one successful launch. Win with 6 successful launches and 90% happiness; lose at 10% or lower.

## Notes and assumptions
- The 10 launch types and costs/rewards are the values approved in chat; they are fictional game values.
- The 13 card types and approximate duplicate counts were transcribed from the supplied screenshots. Some small text/icons were unclear, so check against the original cards before treating this as a perfect transcription.
- Funding is stored as MD/year, with each 0.5% on the # track corresponding to 1 MD/year. Starting 5 MD thus corresponds to 2.5%.
- Happiness is limited to 0–100%, and cards adjust it in 5% steps.
- Multiple missions can run concurrently. A one-year mission completes at the end of its starting year.
- Employee effects not fully specified in the supplied rules are marked provisional or left for future cards; Astronaut grants a provisional 1 MD launch discount.
- '1 on 1 With Worker' draws one card as a placeholder for the card's unspecified worker-deck mechanic; Orbital Research marks a status flag for future implementation.
- Game progress is stored locally in the browser; no account or server is required.
