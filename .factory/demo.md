# Pronunciation Cards demo

Open `/demo/` directly or select **Try it with sample data** on the landing
page. The demo immediately shows four pronunciation cards for Kubernetes,
OAuth, PostgreSQL, and ngrok. It also shows a technical sentence after the
sample aliases are applied.

The demo uses only the `demo:pronunciation-cards:cards` localStorage key. It
never reads or writes the extension's `browser.storage.local` glossary. The
banner stays visible throughout the demo. **Reset demo** puts the four shipped
cards back. **Start for real** discards that demo key and returns to the
installation steps.

The service worker caches `/demo/` after the first visit, so the sample can be
reloaded while offline. Each public demo claim has an outcome check in
`.factory/claims.json` and `tests/e2e/claims.spec.ts`.
