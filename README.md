# Rewards UI

Web prototype of the "My Rewards" Figma screen (375 × 812), in its dark and light frames.
Plain HTML, CSS and JavaScript modules with no build step. Springs use [Motion](https://motion.dev),
vendored in `src/vendor/` so nothing is installed or fetched at runtime.

## Run

```
python3 serve.py
```

Then open http://localhost:3000.

On a desktop browser the screen is shown inside an iPhone mockup. On a phone the mockup is dropped and
the screen fills the browser. Add `?view=mobile` or `?view=mockup` to the URL to force either mode,
and `?theme=light` or `?theme=dark` to open in one of the two frames.

## Layout

`src/styles/page.css` holds the Figma frames' own offsets. `src/styles/polish.css` is loaded after it and
puts the page on one 16px side grid with an even rhythm (32px between sections, 16px under a heading),
smooths the corners of the cards where the browser supports `corner-shape: squircle`,
and turns colour and motion up. What's New is a black card with a white stroke in the dark theme, the light theme has its own block of rules there, and the Airtel Insider card is drawn there in CSS (gradient, turning rays, glow) rather than from the exported image.

## What is interactive

- **Header**: turns to glass once the page scrolls; the coin balance opens the coins sheet.
- **Shortcuts**: Spin the wheel's needle spins and settles under a passing shimmer. The OTT disc rolls through Netflix, Prime Video and Xstream Play. OTT, Insider and Advantage Club scroll to their sections; Spin the wheel opens the game.
- **Unclaimed rewards**: the heading animates in a loop while it is on screen (streaks, letter-by-letter REWARDS, spinning badges, a sheen, then out and in again); the count-up and the cards sliding in play once. Claim Now claims a reward, flies a coin to the balance and removes the card.
- **What's New**: the title's letters jump in a wave with emoji popping around it; a snapping carousel; Register and Claim switch state, the banner opens its details.
- **Play and win**: a scratch card and a spin wheel, both of which add coins.
- **Active subscriptions**: the pills filter the list, View all expands it.
- **Included in your plan / Airtel Insider / The Advantage Club**: rows and buttons open detail sheets.
- **Coming soon**: swipe or tap the card stack to cycle it; Notify me toggles.
- **What's New** and **Coming soon** move on by themselves until someone touches them.
- **Claims and wins** throw a burst of confetti.
- **Questions**: cards that open on a spring, one at a time, and scroll themselves into view.

Source: Figma file `rGZTE0UxCKIhtcJ9Em2QNn`, page "rewads" (`81488:10393`), frames `81488:11232` (dark)
and `81488:10721` (light).
