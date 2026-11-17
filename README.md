# OneJobKits — Merchant Center product feed

Generated product feed for the OneJobKits catalogue (onejobkits.com), used as a
scheduled-fetch data source for Google Merchant Center **free listings**.

- `onejobkits-feed.tsv` — the full feed (one row per product variant).
- `pilot-feed.tsv` — a 10-product pilot subset of the same feed.

Both files are generated from the live Shopify catalogue by
`generate_feed.py` (kept with the store's feed tooling) and contain only
already-public catalogue data: product titles, prices, product-page links and
cover-image URLs. Free ($0) products, services / done-for-you offers and
subscription products are excluded by the generator, per Google's product
data rules for free listings.

Raw URLs (these are what Merchant Center fetches):

- https://raw.githubusercontent.com/gchkodrov-debug/onejobkits-feed/main/onejobkits-feed.tsv
- https://raw.githubusercontent.com/gchkodrov-debug/onejobkits-feed/main/pilot-feed.tsv
