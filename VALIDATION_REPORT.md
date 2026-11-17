# Merchant Center Feed — Validation Report

**Regenerate everything (feed + pilot + stats) with one command:**

```bash
cd ~/workspace/goals/gumroad-store-build-all-7-digital-products/hidden_files/merchant-feed && python3 generate_feed.py
```

Built 2026-11-17 following `MERCHANT_FEED_SCOPING_2026-11-17.md` §1/§2/§7 (Route A, steps 1–2). Data source: the live Shopify catalogue read through the Shopify connector (GraphQL `products` query, cursor-paginated); the generator's `--from-csv <products_export.csv>` fallback was not needed. Merchant Center was not touched.

## Fixes applied 2026-11-17 — pilot-fetch findings

The 10-product pilot was fetched by Merchant Center and every row came back **Not approved**, for two reasons. Both are fixed in the generator, so every regeneration inherits them:

1. **"Mismatched online store URL" (all 20 pilot rows).** The Merchant Center account's verified store domain is **onejobkits.com**. Every row's `link` is the product's own `https://onejobkits.com/products/<shopify-handle>` URL, and **no gumroad.com link appears anywhere in either TSV**. The actual defect the pilot exposed: several Shopify product descriptions embed a `jobkit08.gumroad.com/l/...` buy URL in their text. The generator now rewrites any gumroad.com URL found in a description to that product's own onejobkits.com URL at build time (every rewrite is listed under "Description link rewrites" below), and a hard guard in the generator refuses to write a feed if any link is off-domain or any cell contains `gumroad.com`. The bare word "Gumroad" in prose (a fee table naming sales channels, a "website + Gumroad only" distribution note) is not a link and is left exactly as the landing page has it.

2. **"Healthcare and medicine: Prescription drugs" (4 rows).** Google disapproves any product whose title contains **ADHD**, reading it as prescription-drug content. New shape-based exclusion: any product whose title contains "ADHD" (case-insensitive) is excluded with reason `google-healthcare-flag`. **Rationale:** we do NOT alter titles — feed data must stay identical to the landing pages — so the honest fix is exclusion. The products keep selling on onejobkits.com and every other door; they simply don't ride the Google feed. The excluded products are named by SKU/id in their own section below.

## Totals

- Products read from Shopify: **350** (was 349 in the first build — the live catalogue has grown by one product since; the Client Document Chase Starter Guide went ACTIVE today and is the new 13th price-0 exclusion below)
- Products included in the feed: **330**
- Products excluded: **20** — inactive/draft 0, google-healthcare-flag 2, subscription/recurring 0, service/DFY 5, price-0 13
- Variant rows dropped for price 0 inside otherwise-included products: **13** (in this run they are exactly the excluded free products' single variants — no included product lost a variant)
- Rows written — full feed `onejobkits-feed.tsv`: **661** (2,763,453 bytes — larger than the scoping doc's sub-1 MB estimate because descriptions run to the 5,000-char cap; still far under Google's 4 GB file limit)
- Rows written — pilot feed `pilot-feed.tsv`: **20** rows covering **10 products**
- Title truncations (150-char cap, cut at a word boundary): **391** rows
- Flags (missing SKU / over-long id / missing image): **46**

Feed constants on every row: brand `OneJobKits`, identifier_exists `no`, condition `new`, availability `in_stock`, and **no per-item shipping column** (the account-level 'Digital Delivery (Instant Download)' service covers it, per the scoping doc). google_product_category is `8022` (Document Templates) for kits and `543542` (e-books) for books — the book category lands on `garden-planner-journal`, `shea-butter-body-butter-recipes-ebook-handmade-skincare-makers-recipe-batch-system-30-original-recipes-printable-batch-binder-costing-label-templates`.

**Link verification (this build):** all 661 full-feed rows and all 20 pilot rows carry an `https://onejobkits.com/products/<handle>` link — 0 gumroad.com links in either file (grep-verified), 0 ADHD rows in either file (grep-verified).

## Exclusions — every product, with reason

### Inactive status (draft / archived) — 0

None in this run.

### Google healthcare flag — title contains 'ADHD' — 2

Google disapproves these as prescription-drug content. Titles are never altered (feed data stays identical to the landing pages), so the products are excluded from the feed only — they keep selling on onejobkits.com and every other door. Named by the SKU / feed id each variant would have carried:

- `adhd-digital-planner` — google-healthcare-flag: title contains 'ADHD' — ADHD Digital Planner — Hyperlinked Tablet Planner + Printable Twin for Brains That Lose Tasks & Time (Undated, GoodNotes & Notability Ready) — variant ids: `adhd-digital-planner-67927026237576`, `adhd-digital-planner-67927026270344`
- `adhd-planner-restart-anywhere-life-binder-2027-undated-adhd-life-binder-printable-with-restart-pages-brain-dump-to-top-3-funnel-dopamine-menu-filled-example` — google-healthcare-flag: title contains 'ADHD' — ADHD Planner — Restart-Anywhere Life Binder 2027: Undated ADHD Life Binder Printable with Restart Pages, Brain Dump to Top-3 Funnel, Dopamine Menu & Filled Example — variant ids: `OJK-455-STANDARD`, `OJK-455-PRO`

### Subscription / recurring billing shape — 0

None in this run.

### Service / done-for-you shape — 5

- `budget-planner-debt-payoff-system-set-up-for-you` — product type 'Service' — Budget Planner & Debt Payoff System — Set Up For You
- `contractor-bookkeeping-freelancer-admin-systems-set-up-for-you` — product type 'Service' — Contractor Bookkeeping + Freelancer Admin Systems — Set Up For You
- `landlord-rent-tracker-portfolio-operating-system-set-up-for-you` — product type 'Service' — Landlord Rent Tracker & Portfolio Operating System — Set Up For You
- `med-spa-compliance-system-done-for-you-install` — product type 'Service' — Med Spa Compliance System — Done-For-You Install
- `flagship-bookkeeping-system-done-for-you-install` — product type 'Service' — Flagship Bookkeeping System — Done-For-You Install

### Price 0 (Google disapproves price-0 items in free listings) — 13

- `the-48-hour-document-checklist-free` — every variant is priced 0 — The 48-Hour Document Checklist (Free)
- `drawdown-guardian-one-page-limit-tracker-free` — every variant is priced 0 — Drawdown Guardian — One-Page Limit Tracker (Free)
- `the-sba-buyers-first-30-days-checklist-sde-quick-calculator-free` — every variant is priced 0 — The SBA Buyer's First-30-Days Checklist + SDE Quick Calculator (Free)
- `did-that-job-make-money-free-1-job-cost-calculator` — every variant is priced 0 — Did That Job Make Money? — Free 1-Job Cost Calculator
- `free-realtor-social-starter-just-listed-just-sold-open-house-posts-png-editable-svg` — every variant is priced 0 — FREE Realtor Social Starter — Just Listed, Just Sold & Open House Posts (PNG + Editable SVG)
- `free-contract-to-close-mini-checklist-the-15-moves-from-signed-to-closed-fillable-pdf` — every variant is priced 0 — FREE Contract-to-Close Mini Checklist — The 15 Moves From Signed to Closed (Fillable PDF)
- `free-pricing-calculation-starter-price-one-product-with-the-fees-worked-out-fillable-pdf` — every variant is priced 0 — FREE Pricing Calculation Starter — Price One Product With the Fees Worked Out (Fillable PDF)
- `free-deal-quick-check-the-5-number-first-pass-on-any-rental-deal-fillable-pdf` — every variant is priced 0 — FREE Deal Quick-Check — The 5-Number First Pass on Any Rental Deal (Fillable PDF)
- `free-workshop-session-mini-planner-plan-one-session-on-one-page-fillable-pdf` — every variant is priced 0 — FREE Workshop Session Mini Planner — Plan One Session on One Page (Fillable PDF)
- `free-teacher-cut-file-starter-6-layered-designs-svg-dxf-png` — every variant is priced 0 — FREE Teacher Cut-File Starter — 6 Layered Designs (SVG + DXF + PNG)
- `drawdown-guardian-the-funded-traders-records-field-manual-free-flagship-edition` — every variant is priced 0 — Drawdown Guardian — The Funded Trader's Records Field Manual (FREE Flagship Edition)
- `home-care-agency-compliance-starter-guide-licensing-steps-caregiver-credential-expiry-the-tracking-method-free` — every variant is priced 0 — Home Care Agency Compliance Starter Guide — Licensing Steps, Caregiver Credential Expiry & the Tracking Method (FREE)
- `client-document-chase-starter-guide-why-documents-stall-the-chase-sequence-the-log-that-keeps-it-honest-free` — every variant is priced 0 — Client Document Chase Starter Guide — Why Documents Stall, the Chase Sequence & the Log That Keeps It Honest (FREE)

Exclusion filters key off product **shape** only (status, `requiresSellingPlan`, product type, tags, title patterns, variant prices) — there is no hand-maintained SKU list, so future products are excluded by default shape (scoping doc §9 risk 3). Two judgement calls worth knowing: (1) a bare 'install' mid-title does **not** mark a service — the HVAC forms kit (install/repair pricing calculator) and the LUT preset library (install guides) are products and are included; only type-'Service' products, done-for-you / set-up-for-you titles, and titles ending in 'Install' count as service-shaped. (2) A spreadsheet kit *about* books whose title advertises Excel/Google Sheets is categorised as a template (8022), not a book, even if a tier adds an audiobook module.

## Description link rewrites — gumroad.com → onejobkits.com

Shopify descriptions that embedded a `jobkit08.gumroad.com/l/...` buy URL now carry the product's own onejobkits.com URL in the feed. Every rewrite the generator made this run:

- `free-realtor-social-starter-just-listed-just-sold-open-house-posts-png-editable-svg` — https://jobkit08.gumroad.com/l/yqqmn → https://onejobkits.com/products/free-realtor-social-starter-just-listed-just-sold-open-house-posts-png-editable-svg
- `free-contract-to-close-mini-checklist-the-15-moves-from-signed-to-closed-fillable-pdf` — https://jobkit08.gumroad.com/l/ekafv → https://onejobkits.com/products/free-contract-to-close-mini-checklist-the-15-moves-from-signed-to-closed-fillable-pdf
- `free-pricing-calculation-starter-price-one-product-with-the-fees-worked-out-fillable-pdf` — https://jobkit08.gumroad.com/l/qkbjl → https://onejobkits.com/products/free-pricing-calculation-starter-price-one-product-with-the-fees-worked-out-fillable-pdf
- `free-deal-quick-check-the-5-number-first-pass-on-any-rental-deal-fillable-pdf` — https://jobkit08.gumroad.com/l/tbqlhl → https://onejobkits.com/products/free-deal-quick-check-the-5-number-first-pass-on-any-rental-deal-fillable-pdf
- `free-workshop-session-mini-planner-plan-one-session-on-one-page-fillable-pdf` — https://jobkit08.gumroad.com/l/fgdzrv → https://onejobkits.com/products/free-workshop-session-mini-planner-plan-one-session-on-one-page-fillable-pdf
- `free-teacher-cut-file-starter-6-layered-designs-svg-dxf-png` — https://jobkit08.gumroad.com/l/raacdi → https://onejobkits.com/products/free-teacher-cut-file-starter-6-layered-designs-svg-dxf-png
- `caregiver-planner-stickers-225-medical-planner-stickers-for-goodnotes-medication-appointment-vitals-stickers-elements-png` — https://jobkit08.gumroad.com/l/qdmmz → https://onejobkits.com/products/caregiver-planner-stickers-225-medical-planner-stickers-for-goodnotes-medication-appointment-vitals-stickers-elements-png
- `wedding-planner-stickers-225-stickers-for-goodnotes-desi-south-asian-wedding-events-planning-countdown-elements-png` — https://jobkit08.gumroad.com/l/ylesga → https://onejobkits.com/products/wedding-planner-stickers-225-stickers-for-goodnotes-desi-south-asian-wedding-events-planning-countdown-elements-png
- `baby-milestone-stickers-225-babys-first-year-stickers-for-goodnotes-milestones-feeding-sleep-checkup-trackers-elements-png` — https://jobkit08.gumroad.com/l/zixotq → https://onejobkits.com/products/baby-milestone-stickers-225-babys-first-year-stickers-for-goodnotes-milestones-feeding-sleep-checkup-trackers-elements-png

Three of these products (the three sticker packs) are in the feed, so their rewrites are what the pilot fetch exposed; the rest are price-0-excluded free products whose descriptions never reach Google — the normalisation is applied uniformly at build time regardless.

## Flags — missing SKU / id / image

- `teacher-classroom-bundle` — missing SKU — fallback id used (variant: Standard / Standard, id used: `teacher-classroom-bundle-67913023193224`)
- `teacher-classroom-bundle` — missing SKU — fallback id used (variant: Standard / Bundle, id used: `teacher-classroom-bundle-67913023225992`)
- `teacher-classroom-bundle` — missing SKU — fallback id used (variant: Bundle / Standard, id used: `teacher-classroom-bundle-67913023258760`)
- `teacher-classroom-bundle` — missing SKU — fallback id used (variant: Bundle / Bundle, id used: `teacher-classroom-bundle-67913023291528`)
- `rental-property-bundle` — missing SKU — fallback id used (variant: Standard / Standard / Standard, id used: `rental-property-bundle-67913049243784`)
- `rental-property-bundle` — missing SKU — fallback id used (variant: Standard / Standard / Pro, id used: `rental-property-bundle-67913049276552`)
- `rental-property-bundle` — missing SKU — fallback id used (variant: Standard / Pro / Standard, id used: `rental-property-bundle-67913049309320`)
- `rental-property-bundle` — missing SKU — fallback id used (variant: Standard / Pro / Pro, id used: `rental-property-bundle-67913049342088`)
- `rental-property-bundle` — missing SKU — fallback id used (variant: Pro / Standard / Standard, id used: `rental-property-bundle-67913049374856`)
- `rental-property-bundle` — missing SKU — fallback id used (variant: Pro / Standard / Pro, id used: `rental-property-bundle-67913049407624`)
- `rental-property-bundle` — missing SKU — fallback id used (variant: Pro / Pro / Standard, id used: `rental-property-bundle-67913049440392`)
- `rental-property-bundle` — missing SKU — fallback id used (variant: Pro / Pro / Pro, id used: `rental-property-bundle-67913049473160`)
- `family-admin-bundle` — missing SKU — fallback id used (variant: Standard / Standard, id used: `family-admin-bundle-67913066414216`)
- `family-admin-bundle` — missing SKU — fallback id used (variant: Standard / Bundle, id used: `family-admin-bundle-67913066446984`)
- `family-admin-bundle` — missing SKU — fallback id used (variant: Bundle / Standard, id used: `family-admin-bundle-67913066479752`)
- `family-admin-bundle` — missing SKU — fallback id used (variant: Bundle / Bundle, id used: `family-admin-bundle-67913066512520`)
- `airbnb-welcome-book-guest-guide-kit` — missing SKU — fallback id used (variant: Standard, id used: `airbnb-welcome-book-guest-guide-kit-67927026401416`)
- `airbnb-welcome-book-guest-guide-kit` — missing SKU — fallback id used (variant: Pro, id used: `airbnb-welcome-book-guest-guide-kit-67927026434184`)
- `beauty-business-forms-booking-kit` — missing SKU — fallback id used (variant: Standard, id used: `beauty-business-forms-booking-kit-67927026598024`)
- `beauty-business-forms-booking-kit` — missing SKU — fallback id used (variant: Pro, id used: `beauty-business-forms-booking-kit-67927026630792`)
- `social-media-manager-client-system` — missing SKU — fallback id used (variant: Standard, id used: `social-media-manager-client-system-67927026729096`)
- `social-media-manager-client-system` — missing SKU — fallback id used (variant: Pro, id used: `social-media-manager-client-system-67927026761864`)
- `photographer-client-experience-kit` — missing SKU — fallback id used (variant: Standard, id used: `photographer-client-experience-kit-67942883033224`)
- `photographer-client-experience-kit` — missing SKU — fallback id used (variant: Pro, id used: `photographer-client-experience-kit-67942883065992`)
- `funeral-celebration-of-life-program-set` — missing SKU — fallback id used (variant: Standard, id used: `funeral-celebration-of-life-program-set-67942883098760`)
- `funeral-celebration-of-life-program-set` — id 'funeral-celebration-of-life-program-set-67942883098760' exceeds 50 chars — fallback id used (variant: Standard, id used: `OJKV-67942883098760`)
- `funeral-celebration-of-life-program-set` — missing SKU — fallback id used (variant: Keepsake Edition, id used: `funeral-celebration-of-life-program-set-67942883131528`)
- `funeral-celebration-of-life-program-set` — id 'funeral-celebration-of-life-program-set-67942883131528' exceeds 50 chars — fallback id used (variant: Keepsake Edition, id used: `OJKV-67942883131528`)
- `homeschool-planner-records-kit` — missing SKU — fallback id used (variant: Standard, id used: `homeschool-planner-records-kit-67942883164296`)
- `homeschool-planner-records-kit` — missing SKU — fallback id used (variant: Pro, id used: `homeschool-planner-records-kit-67942883197064`)
- `wedding-invitation-stationery-suite` — missing SKU — fallback id used (variant: Standard, id used: `wedding-invitation-stationery-suite-67942883229832`)
- `wedding-invitation-stationery-suite` — missing SKU — fallback id used (variant: Pro, id used: `wedding-invitation-stationery-suite-67942883262600`)
- `junk-journal-themed-kits` — missing SKU — fallback id used (variant: Standard, id used: `junk-journal-themed-kits-67942883623048`)
- `junk-journal-themed-kits` — missing SKU — fallback id used (variant: Bundle, id used: `junk-journal-themed-kits-67942883655816`)
- `tumbler-wrap-bundles` — missing SKU — fallback id used (variant: Standard, id used: `tumbler-wrap-bundles-67942883688584`)
- `tumbler-wrap-bundles` — missing SKU — fallback id used (variant: Bundle, id used: `tumbler-wrap-bundles-67942883721352`)
- `career-switch-resume-system` — missing SKU — fallback id used (variant: Standard, id used: `career-switch-resume-system-67942883754120`)
- `career-switch-resume-system` — missing SKU — fallback id used (variant: Pro, id used: `career-switch-resume-system-67942883786888`)
- `ai-prompt-pack-for-teachers` — missing SKU — fallback id used (variant: Standard, id used: `ai-prompt-pack-for-teachers-67942883819656`)
- `ai-prompt-pack-for-teachers` — missing SKU — fallback id used (variant: Pro, id used: `ai-prompt-pack-for-teachers-67942883852424`)
- `notion-client-portal-business-os` — missing SKU — fallback id used (variant: Standard, id used: `notion-client-portal-business-os-67942883885192`)
- `notion-client-portal-business-os` — missing SKU — fallback id used (variant: Pro, id used: `notion-client-portal-business-os-67942883917960`)
- `service-business-website-packs` — missing SKU — fallback id used (variant: Standard, id used: `service-business-website-packs-67942883950728`)
- `service-business-website-packs` — missing SKU — fallback id used (variant: Pro, id used: `service-business-website-packs-67942883983496`)
- `home-family-complete-binder-system-bundle-caregiver-binder-executor-binder-iep-binder-babys-first-year-tracker-garden-planner-home-renovation-kit-6-complete-systems-excel-google-sheets-printable-pdfs` — missing SKU — fallback id used (variant: Default, id used: `home-family-complete-binder-system-bundle-caregiver-binder-executor-binder-iep-binder-babys-first-year-tracker-garden-planner-home-renovation-kit-6-complete-systems-excel-google-sheets-printable-pdfs-67954857509000`)
- `home-family-complete-binder-system-bundle-caregiver-binder-executor-binder-iep-binder-babys-first-year-tracker-garden-planner-home-renovation-kit-6-complete-systems-excel-google-sheets-printable-pdfs` — id 'home-family-complete-binder-system-bundle-caregiver-binder-executor-binder-iep-binder-babys-first-year-tracker-garden-planner-home-renovation-kit-6-complete-systems-excel-google-sheets-printable-pdfs-67954857509000' exceeds 50 chars — fallback id used (variant: Default, id used: `OJKV-67954857509000`)

All 43 missing-SKU flags sit on Shopify bundle-component variants whose variants genuinely carry no SKU; the fallback id `handle-variant_id` is stable across regenerations. Missing-image flags: 0.

## Title truncations — every one, with before/after lengths

| Feed id | Before (chars) | After (chars) | Truncated title written to the feed |
|---|---:|---:|---|
| `OJK-7-STANDARD` | 218 | 148 | Desi Wedding Planner Spreadsheet — 34 Tabs, Excel + Google Sheets · Mehndi, Haldi, Sangeet, Nikkah, Anand Karaj, Ceremony & Reception Budgets, Guest |
| `OJK-7-BUNDLE` | 216 | 148 | Desi Wedding Planner Spreadsheet — 34 Tabs, Excel + Google Sheets · Mehndi, Haldi, Sangeet, Nikkah, Anand Karaj, Ceremony & Reception Budgets, Guest |
| `OJK-ART01-PERSONAL` | 169 | 148 | 120 Vintage French Country Prints | Botanical, Landscape & Still Life Gallery Wall Art Set, Cottagecore Farmhouse Decor, Printable Wall Art (Digital |
| `OJK-ART01-COMMERCIAL` | 171 | 148 | 120 Vintage French Country Prints | Botanical, Landscape & Still Life Gallery Wall Art Set, Cottagecore Farmhouse Decor, Printable Wall Art (Digital |
| `OJKV-67954857509000` | 217 | 141 | Home & Family Complete Binder System Bundle — Caregiver Binder, Executor Binder, IEP Binder, Baby's First Year Tracker, Garden Planner & Home |
| `OJK-147-BASE` | 182 | 147 | Homeschool Record Keeper — Records & Transcript System: Attendance & Hours Log, Grades, Reading Log, Portfolio + Homeschool Transcript Builder with |
| `OJK-147-PRO` | 181 | 147 | Homeschool Record Keeper — Records & Transcript System: Attendance & Hours Log, Grades, Reading Log, Portfolio + Homeschool Transcript Builder with |
| `OJK-133-BASE` | 216 | 143 | PTO President Binder — PTA/PTO President System: Meetings & Minutes Log, Board Roster, Events, Volunteers & Membership Workbook (Excel + Google |
| `OJK-133-PRO` | 209 | 143 | PTO President Binder — PTA/PTO President System: Meetings & Minutes Log, Board Roster, Events, Volunteers & Membership Workbook (Excel + Google |
| `OJK-134-BASE` | 205 | 144 | School Fundraising Kit — Sponsorship Packet, Sponsor & Fundraiser Trackers, Silent Auction System & Donor Thank-You Pack (Excel + Google Sheets) |
| `OJK-134-PRO` | 198 | 144 | School Fundraising Kit — Sponsorship Packet, Sponsor & Fundraiser Trackers, Silent Auction System & Donor Thank-You Pack (Excel + Google Sheets) |
| `OJK-88-STANDARD` | 242 | 142 | College + Scholarship Deadline Control Kit — One Merged Deadline List, 48-Hour Buffers, Recommender Deadlines, Time-Zone Handling & $-Per-Hour |
| `OJK-88-PRO` | 231 | 142 | College + Scholarship Deadline Control Kit — One Merged Deadline List, 48-Hour Buffers, Recommender Deadlines, Time-Zone Handling & $-Per-Hour |
| `OJK-75-STANDARD` | 222 | 143 | Business Owner Money Systems Complete Bundle — SBA Business Acquisition Deal System, Trucking Authority & Profit System, Contractor Job Costing |
| `OJK-62-BASE` | 193 | 143 | IEP / SPED Teacher Data System — Caseload Tracker With Days-Left Formulas, Goal Progress Data & % of Target, Service Minutes Log, Fillable Data |
| `OJK-62-PRO` | 186 | 143 | IEP / SPED Teacher Data System — Caseload Tracker With Days-Left Formulas, Goal Progress Data & % of Target, Service Minutes Log, Fillable Data |
| `OJK-104-STANDARD` | 250 | 148 | Brag Sheet Tracker — Promotion Evidence System with Formula Roll-Ups, Review Packager (Assembles Your Self-Review), Kudos Inbox & Raise Case Tracker |
| `OJK-104-PRO` | 239 | 148 | Brag Sheet Tracker — Promotion Evidence System with Formula Roll-Ups, Review Packager (Assembles Your Self-Review), Kudos Inbox & Raise Case Tracker |
| `OJK-135-BASE` | 232 | 143 | Dance Studio Planner — Dance Studio Admin System: Class Schedule Template, Enrolment Tracker, Parent Handbook & Studio Policies (Excel + Google |
| `OJK-135-PRO` | 225 | 143 | Dance Studio Planner — Dance Studio Admin System: Class Schedule Template, Enrolment Tracker, Parent Handbook & Studio Policies (Excel + Google |
| `OJK-149-BASE` | 177 | 146 | Florida Homeschool Portfolio & Evaluation Tracker — Records & Transcript System with Florida State Pack: Portfolio Log + Annual Evaluation Tracker |
| `OJK-149-PRO` | 176 | 146 | Florida Homeschool Portfolio & Evaluation Tracker — Records & Transcript System with Florida State Pack: Portfolio Log + Annual Evaluation Tracker |
| `OJK-76-STANDARD` | 212 | 148 | Property Money Complete System Bundle — Landlord Portfolio System, Short-Term Rental Operations, Transaction Coordination Kit, Seller Profit Tracker |
| `OJK-136-BASE` | 235 | 146 | Doula Business Forms — Doula Business Kit for Birth & Postpartum Doulas: Birth Doula Contract Template, Client Intake, Birth Preferences Worksheet |
| `OJK-136-PRO` | 228 | 146 | Doula Business Forms — Doula Business Kit for Birth & Postpartum Doulas: Birth Doula Contract Template, Client Intake, Birth Preferences Worksheet |
| `OJK-107-STANDARD` | 266 | 149 | PCS Move Command System for Military Families — Move Dashboard with Countdown, Entitlements & Claims Tracker, Room-by-Room HHG Inventory, Budget That |
| `OJK-107-PRO` | 255 | 149 | PCS Move Command System for Military Families — Move Dashboard with Countdown, Entitlements & Claims Tracker, Room-by-Room HHG Inventory, Budget That |
| `OJK-50-STANDARD` | 157 | 148 | STR Host Starter — Turnover Checklists & One-Property P&L (LITE): Airbnb Cleaning Checklist Template + Booking & Expense Tracker Spreadsheet for One |
| `OJK-64-BASE` | 181 | 142 | Maker Inventory + Pricing / COGS System — Materials Inventory, Product Builder / BOM, Pricing Calculator & Price List for Candle, Soap & Craft |
| `OJK-64-PRO` | 174 | 142 | Maker Inventory + Pricing / COGS System — Materials Inventory, Product Builder / BOM, Pricing Calculator & Price List for Candle, Soap & Craft |
| `OJK-137-BASE` | 234 | 147 | Death Doula Paperwork — End of Life Doula Contract, Intake & Evaluation Forms, Welcome Packet & Price List: The Complete Paperwork System (Pro Adds |
| `OJK-137-PRO` | 227 | 147 | Death Doula Paperwork — End of Life Doula Contract, Intake & Evaluation Forms, Welcome Packet & Price List: The Complete Paperwork System (Pro Adds |
| `OJK-151-BASE` | 155 | 148 | Pennsylvania Homeschool Portfolio, Affidavit & Evaluation Tracker — Records & Transcript System with Pennsylvania State Pack (Excel + Google Sheets) |
| `OJK-151-PRO` | 154 | 148 | Pennsylvania Homeschool Portfolio, Affidavit & Evaluation Tracker — Records & Transcript System with Pennsylvania State Pack (Excel + Google Sheets) |
| `OJK-51-STANDARD` | 160 | 143 | Landlord Rent & Expense Tracker — Up to 4 Units (LITE): Landlord Spreadsheet Template With Rent Roll, Payment & Arrears Log, Expense Register & |
| `OJK-65-BASE` | 198 | 148 | Small-Employer HR Pack (1–50 Employees) — Employee Handbook Template, Fillable HR Forms & Onboarding Pack, HR Tracker With Review Countdowns, Hiring |
| `OJK-65-PRO` | 191 | 148 | Small-Employer HR Pack (1–50 Employees) — Employee Handbook Template, Fillable HR Forms & Onboarding Pack, HR Tracker With Review Countdowns, Hiring |
| `OJK-66-BASE` | 176 | 142 | Downsizing / Swedish Death-Cleaning Planner — Large-Print 20-Page Planner & 8-Page Move Organiser, 12-Week Room-by-Room Plan, Papers Locator & |
| `OJK-66-PRO` | 169 | 142 | Downsizing / Swedish Death-Cleaning Planner — Large-Print 20-Page Planner & 8-Page Move Organiser, 12-Week Room-by-Room Plan, Papers Locator & |
| `OJK-49-STANDARD` | 171 | 149 | College Tracker — Deadlines & Scholarships (LITE): College Application Tracker Spreadsheet With Live Deadline Countdowns & Value-Per-Hour Scholarship |
| `OJK-153-BASE` | 247 | 145 | IVF Planner / Fertility Tracker — Cycle Calendar, Medication & Injection Schedule and Appointment & Scan Log with a Worked Example Cycle (Excel + |
| `OJK-153-PRO` | 240 | 145 | IVF Planner / Fertility Tracker — Cycle Calendar, Medication & Injection Schedule and Appointment & Scan Log with a Worked Example Cycle (Excel + |
| `OJK-52-BASE` | 190 | 143 | College Application + Scholarship Tracker — Spreadsheet With Live Deadline Countdowns, College List, Essay & Recommendation Trackers, Printable |
| `OJK-52-PRO` | 183 | 143 | College Application + Scholarship Tracker — Spreadsheet With Live Deadline Countdowns, College List, Essay & Recommendation Trackers, Printable |
| `OJK-89-STANDARD` | 255 | 149 | Offline After 9: 30-Day Scroll & Sleep Reset — Phone-Park Tracker With Streak-Repair Rule, Hours-Reclaimed Counter & 60+ Analog Evening Menu (Excel + |
| `OJK-89-PRO` | 244 | 149 | Offline After 9: 30-Day Scroll & Sleep Reset — Phone-Park Tracker With Streak-Repair Rule, Hours-Reclaimed Counter & 60+ Analog Evening Menu (Excel + |
| `OJK-154-BASE` | 225 | 146 | Bible Study Journal & Prayer Journal System — SOAP Bible Study, Verse Mapping, ACTS Prayer Journal & Sermon Notes, 101-Page Printable Binder — Pro |
| `OJK-154-PRO` | 218 | 146 | Bible Study Journal & Prayer Journal System — SOAP Bible Study, Verse Mapping, ACTS Prayer Journal & Sermon Notes, 101-Page Printable Binder — Pro |
| `OJK-138-BASE` | 196 | 141 | Diabetes Tracker / Blood Sugar Log — Chronic Illness Tracker with Carb Log, A1C Record & Monthly Dashboard (Excel + Google Sheets) — Pro Adds |
| `OJK-138-PRO` | 189 | 141 | Diabetes Tracker / Blood Sugar Log — Chronic Illness Tracker with Carb Log, A1C Record & Monthly Dashboard (Excel + Google Sheets) — Pro Adds |
| `OJK-108-BASE` | 222 | 146 | SLP / OT / PT Minutes & Caseload System — Speech Therapy Caseload Tracker With Minutes vs Mandate Tracker, Session Log & Progress Report Generator |
| `OJK-108-PRO` | 215 | 146 | SLP / OT / PT Minutes & Caseload System — Speech Therapy Caseload Tracker With Minutes vs Mandate Tracker, Session Log & Progress Report Generator |
| `OJK-53-BASE` | 187 | 148 | Marketplace-Seller Bookkeeping System — Sales Log, Monthly Profit & Loss, Fees, Inventory & COGS, Tax Summary & Mileage Log for Etsy, Shopify & eBay |
| `OJK-53-PRO` | 180 | 148 | Marketplace-Seller Bookkeeping System — Sales Log, Monthly Profit & Loss, Fees, Inventory & COGS, Tax Summary & Mileage Log for Etsy, Shopify & eBay |
| `OJK-139-BASE` | 224 | 145 | Hashimoto's Thyroid Tracker — Chronic Illness Tracker with Lab Tracker (TSH / Free T4 / Free T3), Dose-Change Log & Food-Mood-Symptom Correlation |
| `OJK-139-PRO` | 217 | 145 | Hashimoto's Thyroid Tracker — Chronic Illness Tracker with Lab Tracker (TSH / Free T4 / Free T3), Dose-Change Log & Food-Mood-Symptom Correlation |
| `OJK-54-BASE` | 164 | 146 | No-Prep Emergency Sub Plans + Sub Binder — 5 Full Days for Grades 3–5 (30 Pages + Answer Keys), Fillable 10-Page Sub Binder; Pro Adds 5 K–2 Days + |
| `OJK-54-PRO` | 157 | 146 | No-Prep Emergency Sub Plans + Sub Binder — 5 Full Days for Grades 3–5 (30 Pages + Answer Keys), Fillable 10-Page Sub Binder; Pro Adds 5 K–2 Days + |
| `OJK-91-STANDARD` | 246 | 147 | Before You Sign Them Up: Activities Decision & Transport Planner — True Season Cost Calculator, Collision Checker, Carpool Credits & Priority Rules |
| `OJK-91-PRO` | 235 | 147 | Before You Sign Them Up: Activities Decision & Transport Planner — True Season Cost Calculator, Collision Checker, Carpool Credits & Priority Rules |
| `OJK-112-BASE` | 242 | 147 | Pet Rescue & Foster Admin Pro Kit — Dog & Cat Rescue Paperwork Bundle with Intake Register, Foster Tracker, Adoption Pipeline, Vet Log & Per-Animal |
| `OJK-112-PRO` | 235 | 147 | Pet Rescue & Foster Admin Pro Kit — Dog & Cat Rescue Paperwork Bundle with Intake Register, Foster Tracker, Adoption Pipeline, Vet Log & Per-Animal |
| `OJK-140-BASE` | 242 | 149 | Migraine Tracker — Chronic Illness Tracker with Attack Log (Onset, Duration, Intensity, Aura, Triggers, Rescue Medication Record) & Monthly Frequency |
| `OJK-140-PRO` | 235 | 149 | Migraine Tracker — Chronic Illness Tracker with Attack Log (Onset, Duration, Intensity, Aura, Triggers, Rescue Medication Record) & Monthly Frequency |
| `OJK-71-BASE` | 152 | 145 | Calm-Corner Cards Kit | 52 Calming Strategy Cards, 24 Feelings Cards & 12 Breathing Cards — Posters, Routine Charts & Parent Guide (Home Version) |
| `OJK-71-PRO` | 151 | 145 | Calm-Corner Cards Kit | 52 Calming Strategy Cards, 24 Feelings Cards & 12 Breathing Cards — Posters, Routine Charts & Parent Guide (Home Version) |
| `OJK-92-STANDARD` | 255 | 149 | One Dinner, Every Eater: Picky-Eater Matrix & Exposure Tracker — Per-Child Food Matrix by Form & Texture, Exposure Ladder Log, One-Meal-One-Swap Week |
| `OJK-92-PRO` | 244 | 149 | One Dinner, Every Eater: Picky-Eater Matrix & Exposure Tracker — Per-Child Food Matrix by Form & Texture, Exposure Ladder Log, One-Meal-One-Swap Week |
| `OJK-55-STANDARD` | 172 | 148 | Baby Shower Games Bundles — 64 Printable Games & Cards in 3 Original Themes (Woodland, Berry Sweet, Gingham Picnic), Unique Bingo Cards, Answer Keys |
| `OJK-55-PRO` | 167 | 148 | Baby Shower Games Bundles — 64 Printable Games & Cards in 3 Original Themes (Woodland, Berry Sweet, Gingham Picnic), Unique Bingo Cards, Answer Keys |
| `OJK-141-BASE` | 193 | 145 | PCOS Tracker — Chronic Illness Tracker with Cycle Tracker, Symptom & Signs Log and Food & Activity Correlation (Excel + Google Sheets) — Pro Adds |
| `OJK-141-PRO` | 186 | 145 | PCOS Tracker — Chronic Illness Tracker with Cycle Tracker, Symptom & Signs Log and Food & Activity Correlation (Excel + Google Sheets) — Pro Adds |
| `OJK-114-BASE` | 222 | 146 | Newsletter Operating System — Editorial Calendar, Sponsorship Pipeline, Rate Card, Growth & Revenue Tracker for Newsletter Writers (Excel + Google |
| `OJK-114-PRO` | 215 | 146 | Newsletter Operating System — Editorial Calendar, Sponsorship Pipeline, Rate Card, Growth & Revenue Tracker for Newsletter Writers (Excel + Google |
| `OJK-77-STANDARD` | 249 | 148 | School Admin Command Centre — Parent-Side School Portal & Deadline System for Up to 4 Children (Excel + Google Sheets Workbook, Printable Desk Set & |
| `OJK-77-PRO` | 238 | 148 | School Admin Command Centre — Parent-Side School Portal & Deadline System for Up to 4 Children (Excel + Google Sheets Workbook, Printable Desk Set & |
| `OJK-93-STANDARD` | 257 | 141 | IEP Evidence & Meeting Kit — Track IEP Minutes Promised, Recorded and Missing: Mandated vs Delivered Workbook With Service Log Requests, Home |
| `OJK-93-PRO` | 246 | 141 | IEP Evidence & Meeting Kit — Track IEP Minutes Promised, Recorded and Missing: Mandated vs Delivered Workbook With Service Log Requests, Home |
| `OJK-56-BASE` | 172 | 148 | Food-Business Costing System — Recipe Cost Cards, Price Book, Menu Pricing, Inventory & Waste Logs for Cottage Bakers & Small Food Businesses (Excel |
| `OJK-56-PRO` | 171 | 148 | Food-Business Costing System — Recipe Cost Cards, Price Book, Menu Pricing, Inventory & Waste Logs for Cottage Bakers & Small Food Businesses (Excel |
| `OJK-142-BASE` | 211 | 147 | Insurance Claim Tracker — EOB Reconciler, Deductible & Out-of-Pocket Accumulator, Medical Bills Organizer (Excel + Google Sheets) — Pro Adds Appeal |
| `OJK-142-PRO` | 204 | 147 | Insurance Claim Tracker — EOB Reconciler, Deductible & Out-of-Pocket Accumulator, Medical Bills Organizer (Excel + Google Sheets) — Pro Adds Appeal |
| `OJK-155-BASE` | 179 | 148 | Electrician Business Kit / Invoice Templates — Estimate, Service Agreement, Per-Point & Panel Pricing Calculator, Job & Money Tracker and Permit Log |
| `OJK-155-PRO` | 178 | 148 | Electrician Business Kit / Invoice Templates — Estimate, Service Agreement, Per-Point & Panel Pricing Calculator, Job & Money Tracker and Permit Log |
| `OJK-78-STANDARD` | 265 | 139 | The CYA File — Teacher Defensive Documentation System: 5 Period-Based Logs, Meeting Pack & Counts Dashboard (Excel + Google Sheets Workbook |
| `OJK-78-PRO` | 254 | 139 | The CYA File — Teacher Defensive Documentation System: 5 Period-Based Logs, Meeting Pack & Counts Dashboard (Excel + Google Sheets Workbook |
| `OJK-156-BASE` | 183 | 144 | Plumbing Business Forms — Business Kit: Estimate, Invoice, Service Agreement, Flat-Rate Pricing Calculator, Job & Money Tracker and Parts Markup |
| `OJK-156-PRO` | 182 | 144 | Plumbing Business Forms — Business Kit: Estimate, Invoice, Service Agreement, Flat-Rate Pricing Calculator, Job & Money Tracker and Parts Markup |
| `OJK-79-TEEN-EDITION` | 214 | 147 | Leave Home, Ready — First 90 Days Away Guide, Roommate Agreement, 10 No-Recipe Meals & Checklists (Teen Edition) / Family Bundle With Parent Skills |
| `OJK-79-FAMILY-BUNDLE` | 214 | 147 | Leave Home, Ready — First 90 Days Away Guide, Roommate Agreement, 10 No-Recipe Meals & Checklists (Teen Edition) / Family Bundle With Parent Skills |
| `OJK-143-BASE` | 231 | 149 | Horse Records & Barn Management System — Equine Records, Vet / Farrier / Dental / Worming Schedule Tracker, Feed Chart & Printable Stall Cards (Excel |
| `OJK-143-PRO` | 224 | 149 | Horse Records & Barn Management System — Equine Records, Vet / Farrier / Dental / Worming Schedule Tracker, Feed Chart & Printable Stall Cards (Excel |
| `OJK-ART-E1-PERSONAL` | 155 | 144 | 120 Bulgaria Wall Art Prints | Black Sea Beaches, Old Towns, Mountains & Rose Valley Gallery Wall Set, Printable Travel Decor (Digital Download) |
| `OJK-ART-E1-COMMERCIAL` | 157 | 144 | 120 Bulgaria Wall Art Prints | Black Sea Beaches, Old Towns, Mountains & Rose Valley Gallery Wall Set, Printable Travel Decor (Digital Download) |
| `OJK-57-STANDARD` | 184 | 145 | Kids Chore / Routine / Reward Chart System — Printable Charts by Age Band (3–5, 6–8, Pro 9–12), Morning & Evening Routines, 20/50/100 Star Reward |
| `OJK-57-PRO` | 173 | 145 | Kids Chore / Routine / Reward Chart System — Printable Charts by Age Band (3–5, 6–8, Pro 9–12), Morning & Evening Routines, 20/50/100 Star Reward |
| `OJK-97-STANDARD` | 230 | 145 | Report Cards in One Evening — Capture Log + Comment Builder + Comment Banks for K-1, 2-3 & 4-6 With Repetition & Character-Limit Checker (Excel + |
| `OJK-97-PRO` | 219 | 145 | Report Cards in One Evening — Capture Log + Comment Builder + Comment Banks for K-1, 2-3 & 4-6 With Repetition & Character-Limit Checker (Excel + |
| `OJK-157-BASE` | 191 | 142 | HVAC Business Forms — Business Kit: Estimate, Invoice, Service Agreement, Install & Repair Pricing Calculator, Refrigerant Log and Maintenance |
| `OJK-157-PRO` | 190 | 142 | HVAC Business Forms — Business Kit: Estimate, Invoice, Service Agreement, Install & Repair Pricing Calculator, Refrigerant Log and Maintenance |
| `OJK-144-BASE` | 248 | 145 | Farm Records Template & Livestock Records System — Herd & Flock Records, Breeding Due-Date Tracker, Egg & Milk Production Log, Feed & Expense Log |
| `OJK-144-PRO` | 241 | 145 | Farm Records Template & Livestock Records System — Herd & Flock Records, Breeding Due-Date Tracker, Egg & Milk Production Log, Feed & Expense Log |
| `OJK-58-BASE` | 163 | 144 | Genealogy Research Binder — 20-Page Printable Binder With Pedigree Charts, Family Group Sheets & Ancestor Worksheets, Plus Research Guide (Large |
| `OJK-58-PRO` | 162 | 144 | Genealogy Research Binder — 20-Page Printable Binder With Pedigree Charts, Family Group Sheets & Ancestor Worksheets, Plus Research Guide (Large |
| `OJK-145-BASE` | 195 | 145 | Dog Breeder Records & Whelping System — Litter Records, Whelping Chart, Puppy Weight Tracker Spreadsheet (Excel + Google Sheets) — Pro Adds Buyer |
| `OJK-145-PRO` | 188 | 145 | Dog Breeder Records & Whelping System — Litter Records, Whelping Chart, Puppy Weight Tracker Spreadsheet (Excel + Google Sheets) — Pro Adds Buyer |
| `OJK-158-BASE` | 174 | 143 | Auto Detailing Business Kit — Intake & Condition Forms, Package Pricing Calculator by Vehicle Size, Job & Money Tracker and Upsell Menu Builder |
| `OJK-158-PRO` | 173 | 143 | Auto Detailing Business Kit — Intake & Condition Forms, Package Pricing Calculator by Vehicle Size, Job & Money Tracker and Upsell Menu Builder |
| `OJK-100-STANDARD` | 218 | 138 | Brand Deal Control Kit for Creators — Deal Pipeline, Rights & Exclusivity Calendar with Conflict Check, Invoice Chase to the Paying Entity |
| `OJK-100-PRO` | 213 | 138 | Brand Deal Control Kit for Creators — Deal Pipeline, Rights & Exclusivity Calendar with Conflict Check, Invoice Chase to the Paying Entity |
| `OJK-83-STANDARD` | 223 | 146 | Covered Summer: Camp & Break Coverage Planner 2027 — Coverage Grid, Camp Database, Registration Countdowns & Plan A-B-C Domino Tracker for Up to 3 |
| `OJK-159-BASE` | 183 | 143 | Lawn Care Business Kit — Estimate & Invoice Forms, Per-Visit and Per-Season Pricing Calculator by Lot Size, Route Tracker and Seasonal Services |
| `OJK-159-PRO` | 182 | 143 | Lawn Care Business Kit — Estimate & Invoice Forms, Per-Visit and Per-Season Pricing Calculator by Lot Size, Route Tracker and Seasonal Services |
| `OJK-59-BASE` | 187 | 146 | Screen-Free "I'm Bored" Activity Packs — Ages 4-7 Pack (24 Pages, 30 Boredom Jar Strips, 3 Scavenger Hunts, 10 Activity Pages) + Parent Guide; Pro |
| `OJK-59-PRO` | 180 | 146 | Screen-Free "I'm Bored" Activity Packs — Ages 4-7 Pack (24 Pages, 30 Boredom Jar Strips, 3 Scavenger Hunts, 10 Activity Pages) + Parent Guide; Pro |
| `OJK-130-BASE` | 211 | 142 | Vending Machine Business Spreadsheet — Vending Machine Business System: Route Tracker, Restock & Inventory Log, Per-Machine Profit Sheet, Host |
| `OJK-130-PRO` | 204 | 142 | Vending Machine Business Spreadsheet — Vending Machine Business System: Route Tracker, Restock & Inventory Log, Per-Machine Profit Sheet, Host |
| `OJK-101-STANDARD` | 230 | 149 | Session Pack Ledger for Personal Trainers & Tutors — Sessions Remaining, Deferred Revenue, Expiry Flags & the Weekly Review (Low / Owes / Gone-Quiet) |
| `OJK-101-PRO` | 219 | 149 | Session Pack Ledger for Personal Trainers & Tutors — Sessions Remaining, Deferred Revenue, Expiry Flags & the Weekly Review (Low / Owes / Gone-Quiet) |
| `OJK-84-STANDARD` | 243 | 146 | Two Homes, One Plan: Co-Parenting Logistics Kit — Rotation Calendar With Overnights Maths, Shared-Cost Ledger, Handover Checklists & Communication |
| `OJK-84-PRO` | 232 | 146 | Two Homes, One Plan: Co-Parenting Logistics Kit — Rotation Calendar With Overnights Maths, Shared-Cost Ledger, Handover Checklists & Communication |
| `OJK-160-BASE` | 208 | 146 | Tattoo Client Forms & Tattoo Studio System — Consent, Medical History & Aftercare Forms Pack + Appointment & Deposit Log + Studio Bookkeeping with |
| `OJK-160-PRO` | 207 | 146 | Tattoo Client Forms & Tattoo Studio System — Consent, Medical History & Aftercare Forms Pack + Appointment & Deposit Log + Studio Bookkeeping with |
| `OJK-60-BASE` | 230 | 145 | Nursing Exam Study System — 12-Week Plan Workbook, 40 Pharmacology Cards (21 Pages), 50 Original Practice Questions With Rationales + Study Guide |
| `OJK-60-PRO` | 223 | 145 | Nursing Exam Study System — 12-Week Plan Workbook, 40 Pharmacology Cards (21 Pages), 50 Original Practice Questions With Rationales + Study Guide |
| `OJK-131-BASE` | 222 | 145 | School Nurse Planner & Health Office System — Student Visit Log, Screening Tracker, Medication Record Log & Incident Log Workbook (Excel + Google |
| `OJK-131-PRO` | 215 | 145 | School Nurse Planner & Health Office System — Student Visit Log, Screening Tracker, Medication Record Log & Incident Log Workbook (Excel + Google |
| `OJK-102-STANDARD` | 260 | 149 | Pet Services Business Kit for Solo & Small-Salon Groomers — Pet Tracker with Vaccination-Expiry Flags, Rebook Due Dashboard (No Horizon Cap), No-Show |
| `OJK-102-PRO` | 249 | 149 | Pet Services Business Kit for Solo & Small-Salon Groomers — Pet Tracker with Vaccination-Expiry Flags, Rebook Due Dashboard (No Horizon Cap), No-Show |
| `OJK-161-BASE` | 201 | 143 | Coaching Client Onboarding Kit — Coach & Consultant Client System: Welcome Packet, Intake Form, Agreement Template, Session Notes Log, Progress |
| `OJK-161-PRO` | 194 | 143 | Coaching Client Onboarding Kit — Coach & Consultant Client System: Welcome Packet, Intake Form, Agreement Template, Session Notes Log, Progress |
| `OJK-132-BASE` | 225 | 148 | Principal Binder — School Leadership Binder: Walkthrough & Observation Trackers, Meeting & Incident Log, School-Year Planner (Excel + Google Sheets) |
| `OJK-132-PRO` | 218 | 148 | Principal Binder — School Leadership Binder: Walkthrough & Observation Trackers, Meeting & Incident Log, School-Year Planner (Excel + Google Sheets) |
| `OJK-61-BASE` | 228 | 146 | SAT / ACT / GCSE Exam-Prep System — Study Plan Workbook With 12-Week Countdown (COUNTIF Completion), Maths Formula Sheets (6 Pages), Grammar Rules |
| `OJK-61-PRO` | 227 | 146 | SAT / ACT / GCSE Exam-Prep System — Study Plan Workbook With 12-Week Countdown (COUNTIF Completion), Maths Formula Sheets (6 Pages), Grammar Rules |
| `OJK-ART-E12-COMMERCIAL` | 152 | 139 | UK & Ireland Vintage Wall Art Set of 120 Prints, Cornwall Coasts & Wild Atlantic Way, Scottish Highlands, Lake District, Printable Download |
| `OJK-146-BASE` | 211 | 148 | Move Abroad Planner — Expat / Move-Abroad System: Relocation Budget Tracker, Document Organiser & Countdown Checklists (Excel + Google Sheets) — Pro |
| `OJK-146-PRO` | 204 | 148 | Move Abroad Planner — Expat / Move-Abroad System: Relocation Budget Tracker, Document Organiser & Countdown Checklists (Excel + Google Sheets) — Pro |
| `OJK-103-STANDARD` | 256 | 139 | Medical Records Binder & Health Organizer — Health Records Tracker with Medication Refill Flags, Next-30-Days Appointment Pulls & Dashboard |
| `OJK-103-PRO` | 245 | 139 | Medical Records Binder & Health Organizer — Health Records Tracker with Medication Refill Flags, Next-30-Days Appointment Pulls & Dashboard |
| `OJK-105-STANDARD` | 262 | 146 | 1099 Schedule C Tax Organizer — Self Employed Tax Organizer for Freelancers & Independent Contractors: Income Log with Missing-1099 Count, Expense |
| `OJK-105-PRO` | 257 | 146 | 1099 Schedule C Tax Organizer — Self Employed Tax Organizer for Freelancers & Independent Contractors: Income Log with Missing-1099 Count, Expense |
| `OJK-106-STANDARD` | 258 | 147 | Home Care Agency Forms System for Non-Medical Agencies — Operations Tracker with Credential-Expiry & Service-Plan Review Flags, Forms Pack (Excel + |
| `OJK-106-PRO` | 247 | 147 | Home Care Agency Forms System for Non-Medical Agencies — Operations Tracker with Credential-Expiry & Service-Plan Review Flags, Forms Pack (Excel + |
| `OJK-109-BASE` | 245 | 146 | Insurance Agent Book of Business Tracker — Policy, Renewal & Commission System: Next-90-Days Renewal Pipeline, Commission Tracker & Cross-Sell Log |
| `OJK-109-PRO` | 238 | 146 | Insurance Agent Book of Business Tracker — Policy, Renewal & Commission System: Next-90-Days Renewal Pipeline, Commission Tracker & Cross-Sell Log |
| `OJK-110-BASE` | 255 | 145 | Mortgage Loan Officer Pipeline Tracker — Pipeline, Rate-Lock, Referral Partner & Commission System: Pipeline Board, Pre-Approval Tracker, Closing |
| `OJK-110-PRO` | 248 | 145 | Mortgage Loan Officer Pipeline Tracker — Pipeline, Rate-Lock, Referral Partner & Commission System: Pipeline Board, Pre-Approval Tracker, Closing |
| `OJK-111-BASE` | 221 | 145 | Wedding Planner Spreadsheet & Guest List Tracker — Wedding Planner System: Budget, Seating Chart, Vendor Payments & Day-Of Binder (Excel + Google |
| `OJK-111-PRO` | 214 | 145 | Wedding Planner Spreadsheet & Guest List Tracker — Wedding Planner System: Budget, Seating Chart, Vendor Payments & Day-Of Binder (Excel + Google |
| `OJK-113-BASE` | 261 | 146 | Home Management Binder & Family Command Center — Home Management / Family Command System: Household Organiser Workbook With Family Dashboard, Meal |
| `OJK-113-PRO` | 260 | 146 | Home Management Binder & Family Command Center — Home Management / Family Command System: Household Organiser Workbook With Family Dashboard, Meal |
| `OJK-80-STANDARD` | 262 | 145 | Maker Margin-Drift COGS Kit — Recipe Costing & Margin-Drift Alert System for Handmade Sellers (Excel + Google Sheets Workbooks & Setup Guide, 500 |
| `OJK-80-PRO` | 251 | 145 | Maker Margin-Drift COGS Kit — Recipe Costing & Margin-Drift Alert System for Handmade Sellers (Excel + Google Sheets Workbooks & Setup Guide, 500 |
| `OJK-81-STANDARD` | 264 | 149 | Restart: The Fall-Behind-Proof Study System for Teens 13–18 — Today's-3 Printable Pack, Missed-Day Reset & Learn-to-Study-From-Zero Guide with Parent |
| `OJK-81-PRO` | 253 | 149 | Restart: The Fall-Behind-Proof Study System for Teens 13–18 — Today's-3 Printable Pack, Missed-Day Reset & Learn-to-Study-From-Zero Guide with Parent |
| `OJK-82-STANDARD` | 259 | 145 | Get-Paid Protection Kit for Freelancers — Deposit Gate, Invoice Aging Tracker, Late-Fee Calculator, Change-Order Log & Milestone Tracker (Excel + |
| `OJK-82-PRO` | 248 | 145 | Get-Paid Protection Kit for Freelancers — Deposit Gate, Invoice Aging Tracker, Late-Fee Calculator, Change-Order Log & Milestone Tracker (Excel + |
| `OJK-85-STANDARD` | 264 | 145 | Say It Once — Difficult-Parent Scripts for Middle & High School Teachers (Grades 5–12): 62 Word-for-Word Fill-in-the-Blank Scripts + 97-Situation |
| `OJK-85-PRO` | 259 | 145 | Say It Once — Difficult-Parent Scripts for Middle & High School Teachers (Grades 5–12): 62 Word-for-Word Fill-in-the-Blank Scripts + 97-Situation |
| `OJK-86-STANDARD` | 256 | 146 | My First Cycle: Paper Period Tracker for Ages 10–14 — No Account, No App, No Data Collected — Cycle Log, Ready-By Window (Earliest–Latest) & First |
| `OJK-86-PRO` | 245 | 146 | My First Cycle: Paper Period Tracker for Ages 10–14 — No Account, No App, No Data Collected — Cycle Log, Ready-By Window (Earliest–Latest) & First |
| `OJK-175-STANDARD` | 258 | 147 | Online Course Creator System — Plan, Record, Launch & Sell Your Online Course with Curriculum Planner, Production Tracker, Launch Calendar, Pricing |
| `OJK-175-PRO` | 247 | 147 | Online Course Creator System — Plan, Record, Launch & Sell Your Online Course with Curriculum Planner, Production Tracker, Launch Calendar, Pricing |
| `OJK-176-STANDARD` | 263 | 148 | Church Admin Binder — Church Administration & Ministry Operations System: Membership Directory, Giving Log by Fund, Volunteer Rota, Ministry Budgets |
| `OJK-176-PRO` | 252 | 148 | Church Admin Binder — Church Administration & Ministry Operations System: Membership Directory, Giving Log by Fund, Volunteer Rota, Ministry Budgets |
| `OJK-177-STANDARD` | 259 | 143 | Ramadan Planner & Islamic Life System — 30-Day Planner with Prayer & Quran Trackers for All 30 Juz & 114-Surah Checklist, Hifz Tracker (Excel + |
| `OJK-177-PRO` | 248 | 143 | Ramadan Planner & Islamic Life System — 30-Day Planner with Prayer & Quran Trackers for All 30 Juz & 114-Surah Checklist, Hifz Tracker (Excel + |
| `OJK-87-STANDARD` | 261 | 145 | First Job Launch Kit for Teens 14–18 — Application Tracker, Experience Translator, Editable Resume + Cover Letter (Word), Interview Scripts & Pay |
| `OJK-87-PRO` | 250 | 145 | First Job Launch Kit for Teens 14–18 — Application Tracker, Experience Translator, Editable Resume + Cover Letter (Word), Interview Scripts & Pay |
| `OJK-90-STANDARD` | 260 | 135 | First Car, Real Price — The Full True-Cost Workbook: True Savings Target, 4-Car True-Monthly-Cost Comparison, Insurance Quote Worksheet |
| `OJK-90-PRO` | 249 | 135 | First Car, Real Price — The Full True-Cost Workbook: True Savings Target, 4-Car True-Monthly-Cost Comparison, Insurance Quote Worksheet |
| `OJK-178-STANDARD` | 236 | 147 | Notary Journal & Loan Signing Agent Kit — Notary Log Book, Appointment Tracker & Income Log with Paid-vs-Outstanding by Signing Company and Mileage |
| `OJK-178-PRO` | 225 | 147 | Notary Journal & Loan Signing Agent Kit — Notary Log Book, Appointment Tracker & Income Log with Paid-vs-Outstanding by Signing Company and Mileage |
| `OJK-94-STANDARD` | 257 | 142 | No More Chasing — Late & Missing Recovery System for Teachers (Grades 6–12): Slips + Regrade Queue, Overdue Flags + 3+ Missing Alerts + Parent |
| `OJK-94-PRO` | 246 | 142 | No More Chasing — Late & Missing Recovery System for Teachers (Grades 6–12): Slips + Regrade Queue, Overdue Flags + 3+ Missing Alerts + Parent |
| `OJK-95-STANDARD` | 254 | 145 | Sick Day Sub Binder for Teachers (Grades 6–12 ONLY) — Sub Plans for 5–7 Classes a Day + Report-Back Sheet & Handover Log (Excel & Google Sheets + |
| `OJK-95-PRO` | 243 | 145 | Sick Day Sub Binder for Teachers (Grades 6–12 ONLY) — Sub Plans for 5–7 Classes a Day + Report-Back Sheet & Handover Log (Excel & Google Sheets + |
| `OJK-179-STANDARD` | 237 | 145 | Laundromat Business Tracker — Laundromat Business Spreadsheet with Machine Revenue & Collections Log, Wash & Fold Orders, Repair-Cost Flags & P&L |
| `OJK-179-PRO` | 226 | 145 | Laundromat Business Tracker — Laundromat Business Spreadsheet with Machine Revenue & Collections Log, Wash & Fold Orders, Repair-Cost Flags & P&L |
| `OJK-96-STANDARD` | 260 | 144 | Proof, Not Impressions — Anecdotal-to-Evidence Converter: Behaviour Ratings, ABC Log & Support-Call Log With Lost-Instruction Minutes, Automatic |
| `OJK-96-PRO` | 249 | 144 | Proof, Not Impressions — Anecdotal-to-Evidence Converter: Behaviour Ratings, ABC Log & Support-Call Log With Lost-Instruction Minutes, Automatic |
| `OJK-180-STANDARD` | 242 | 147 | Travel Agent Kit — Travel Agent Business Kit with Client Proposal & Itinerary Templates, Commission Tracker Spreadsheet, Client Payments & Balances |
| `OJK-180-PRO` | 231 | 147 | Travel Agent Kit — Travel Agent Business Kit with Client Proposal & Itinerary Templates, Commission Tracker Spreadsheet, Client Payments & Balances |
| `OJK-98-STANDARD` | 263 | 141 | Quote to Paid — Quote-Ghosting Follow-Up System for Handymen, Lawn, Cleaning & Small Contractors: Quote Tracker with Due Today Queue, Day 2 / |
| `OJK-98-PRO` | 258 | 141 | Quote to Paid — Quote-Ghosting Follow-Up System for Handymen, Lawn, Cleaning & Small Contractors: Quote Tracker with Due Today Queue, Day 2 / |
| `OJK-99-STANDARD` | 262 | 147 | Sub Paperwork Shield — Subcontractor COI Compliance Pack for Small GCs: COI Tracker with Auto COMPLIANT / INCOMPLETE / EXPIRED Status, Sub Register |
| `OJK-99-PRO` | 257 | 147 | Sub Paperwork Shield — Subcontractor COI Compliance Pack for Small GCs: COI Tracker with Auto COMPLIANT / INCOMPLETE / EXPIRED Status, Sub Register |
| `OJK-181-STANDARD` | 242 | 149 | Guided Life Story Book — 300-Prompt Memory & Life-Story System for Parents & Grandparents, with Family Interview Method and Life Story Tracker (Print |
| `OJK-181-PRO` | 231 | 149 | Guided Life Story Book — 300-Prompt Memory & Life-Story System for Parents & Grandparents, with Family Interview Method and Life Story Tracker (Print |
| `OJK-182-STANDARD` | 261 | 148 | Youth Sports Team Manager Spreadsheet — Youth Sports Team Admin OS for Coaches & Team Moms: Roster & Contacts, Dues Tracker with OWES Flags, Snack & |
| `OJK-182-PRO` | 250 | 148 | Youth Sports Team Manager Spreadsheet — Youth Sports Team Admin OS for Coaches & Team Moms: Roster & Contacts, Dues Tracker with OWES Flags, Snack & |
| `OJK-183-STANDARD` | 261 | 144 | Videographer Business Kit for Freelance Videographers & Wedding Content Creators — Pricing Calculator, Project Pipeline, Shot List, Call Sheet & |
| `OJK-183-PRO` | 250 | 144 | Videographer Business Kit for Freelance Videographers & Wedding Content Creators — Pricing Calculator, Project Pipeline, Shot List, Call Sheet & |
| `OJK-184-STANDARD` | 205 | 145 | First Apartment Kit — Renter Evidence Kit with Move-In Condition Log, Apartment Budget & Roommate Split Spreadsheet (Excel + Google Sheets) — Pro |
| `OJK-184-PRO` | 194 | 145 | First Apartment Kit — Renter Evidence Kit with Move-In Condition Log, Apartment Budget & Roommate Split Spreadsheet (Excel + Google Sheets) — Pro |
| `OJK-225-STANDARD` | 182 | 149 | Snow Removal Business Kit — Season Contracts, Route Planner, Per-Event Service Log, Salt Tracker & Season P&L (Excel + Google Sheets) — Pro Adds Crew |
| `OJK-225-PRO` | 171 | 149 | Snow Removal Business Kit — Season Contracts, Route Planner, Per-Event Service Log, Salt Tracker & Season P&L (Excel + Google Sheets) — Pro Adds Crew |
| `OJK-185-STANDARD` | 258 | 144 | Martial Arts Dojo Admin Kit — Student Onboarding & Roster Tracker, Belt Test Tracker with Ready-to-Test Flags, Attendance Log, Tuition Tracker & |
| `OJK-185-PRO` | 247 | 144 | Martial Arts Dojo Admin Kit — Student Onboarding & Roster Tracker, Belt Test Tracker with Ready-to-Test Flags, Attendance Log, Tuition Tracker & |
| `OJK-226-STANDARD` | 205 | 148 | Dog Grooming Business Kit — Pet Grooming Business Forms Bundle with Client Tracker, Vaccination-Expiry Flags, Rebook-Due Dashboard, Appointment Book |
| `OJK-226-PRO` | 200 | 148 | Dog Grooming Business Kit — Pet Grooming Business Forms Bundle with Client Tracker, Vaccination-Expiry Flags, Rebook-Due Dashboard, Appointment Book |
| `OJK-227-STANDARD` | 214 | 140 | Doggy Daycare & Boarding Forms Kit — Dog Boarding Forms & Daycare Forms Bundle with Reservation Math (Rate × Nights), Package-Credit Tracker |
| `OJK-227-PRO` | 209 | 140 | Doggy Daycare & Boarding Forms Kit — Dog Boarding Forms & Daycare Forms Bundle with Reservation Math (Rate × Nights), Package-Credit Tracker |
| `OJK-275-STANDARD` | 256 | 145 | Fillable PDF Form & E-Sign System for Small Business — Intake, Service Agreement & Onboarding Forms with DocuSign, PandaDoc & SignNow & Paperwork |
| `OJK-275-PRO` | 245 | 145 | Fillable PDF Form & E-Sign System for Small Business — Intake, Service Agreement & Onboarding Forms with DocuSign, PandaDoc & SignNow & Paperwork |
| `OJK-186-STANDARD` | 260 | 146 | Homestead Planner — Whole-Property Homestead Operating System: Seasonal Calendar, Garden Plan, Livestock Log with Check Flags, Preserving & Pantry |
| `OJK-186-PRO` | 249 | 146 | Homestead Planner — Whole-Property Homestead Operating System: Seasonal Calendar, Garden Plan, Livestock Log with Check Flags, Preserving & Pantry |
| `OJK-246-STANDARD` | 173 | 147 | Driving School Admin Spreadsheet — Student Register, Lesson & Progress Log, Instructor & Car Register, Package Balances + Test-Day Tracker (Excel + |
| `OJK-246-PRO` | 162 | 147 | Driving School Admin Spreadsheet — Student Register, Lesson & Progress Log, Instructor & Car Register, Package Balances + Test-Day Tracker (Excel + |
| `OJK-228-STANDARD` | 157 | 146 | Backyard Chicken Log Book, Beekeeping Log Book, Canning Planner & Farmers Market Vendor Kit — Farm & Homestead Logs Bundle (Excel + Google Sheets) |
| `OJK-228-PRO` | 152 | 146 | Backyard Chicken Log Book, Beekeeping Log Book, Canning Planner & Farmers Market Vendor Kit — Farm & Homestead Logs Bundle (Excel + Google Sheets) |
| `OJK-276-STANDARD` | 262 | 148 | Klaviyo Email Flows — E-Commerce Email Flow Pack: Setup Klaviyo Email Flows for Welcome, Abandoned Cart, Browse Abandonment, Post-Purchase, Win-Back |
| `OJK-276-PRO` | 257 | 148 | Klaviyo Email Flows — E-Commerce Email Flow Pack: Setup Klaviyo Email Flows for Welcome, Abandoned Cart, Browse Abandonment, Post-Purchase, Win-Back |
| `OJK-247-STANDARD` | 197 | 149 | Dog Trainer Professional Kit — Dog Trainer Client Forms, Training Session Log, Behaviour Progress Tracker & Package Sessions Tracker for Professional |
| `OJK-247-PRO` | 186 | 149 | Dog Trainer Professional Kit — Dog Trainer Client Forms, Training Session Log, Behaviour Progress Tracker & Package Sessions Tracker for Professional |
| `OJK-277-STANDARD` | 262 | 142 | Author Publishing System — Book Formatting Amazon KDP Workbook with Royalty Calculator, KDP Formatting Checklist & SOP, Cover Spec & 3D Mockup |
| `OJK-277-PRO` | 251 | 142 | Author Publishing System — Book Formatting Amazon KDP Workbook with Royalty Calculator, KDP Formatting Checklist & SOP, Cover Spec & 3D Mockup |
| `OJK-260-STANDARD` | 203 | 144 | Co-Parenting Documentation Spreadsheet — Incident & Communication Log, Shared Expense Split Tracker, Custody Schedule & Swap Log, Document Vault |
| `OJK-260-PRO` | 198 | 144 | Co-Parenting Documentation Spreadsheet — Incident & Communication Log, Shared Expense Split Tracker, Custody Schedule & Swap Log, Document Vault |
| `OJK-248-STANDARD` | 182 | 147 | Centers Rotation System — Group Builder, Stations × Rounds Rotation Schedule, Timer & Transition Checklist (Excel + Google Sheets) — Pro Adds Group |
| `OJK-248-PRO` | 171 | 147 | Centers Rotation System — Group Builder, Stations × Rounds Rotation Schedule, Timer & Transition Checklist (Excel + Google Sheets) — Pro Adds Group |
| `OJK-187-STANDARD` | 263 | 148 | Bar Bat Mitzvah Planner Spreadsheet — Budget, Guest List & Seating, Honors & Service Roles, Torah-Prep Practice Tracker and Vendor Balances with Due |
| `OJK-187-PRO` | 252 | 148 | Bar Bat Mitzvah Planner Spreadsheet — Budget, Guest List & Seating, Honors & Service Roles, Torah-Prep Practice Tracker and Vendor Balances with Due |
| `OJK-278-STANDARD` | 216 | 149 | Book Trailer Template System — Cinematic Book Trailer Kit with 14-Scene Script Templates, Genre Scene Packs, Caption Files & Timing Workbook (Excel + |
| `OJK-278-PRO` | 205 | 149 | Book Trailer Template System — Cinematic Book Trailer Kit with 14-Scene Script Templates, Genre Scene Packs, Caption Files & Timing Workbook (Excel + |
| `OJK-261-STANDARD` | 160 | 149 | Weekly Meal Planner Spreadsheet + Holiday Hosting Planner — Thanksgiving & Christmas Hosting System with Grocery List Builder (Excel + Google Sheets) |
| `OJK-261-PRO` | 155 | 149 | Weekly Meal Planner Spreadsheet + Holiday Hosting Planner — Thanksgiving & Christmas Hosting System with Grocery List Builder (Excel + Google Sheets) |
| `OJK-231-STANDARD` | 158 | 147 | SURGERY RECOVERY PLANNER — Surgery Prep Organiser: Countdown Checklist, Paperwork & Insurance Log, Rides & Helpers Schedule (Excel + Google Sheets) |
| `OJK-231-PRO` | 153 | 147 | SURGERY RECOVERY PLANNER — Surgery Prep Organiser: Countdown Checklist, Paperwork & Insurance Log, Rides & Helpers Schedule (Excel + Google Sheets) |
| `OJK-249-STANDARD` | 200 | 145 | Handyman Business Kit — Job Intake & Estimate, Materials Markup Calculator, Punch-List Tracker & Profit-per-Job Dashboard (Excel + Google Sheets) |
| `OJK-249-PRO` | 189 | 145 | Handyman Business Kit — Job Intake & Estimate, Materials Markup Calculator, Punch-List Tracker & Profit-per-Job Dashboard (Excel + Google Sheets) |
| `OJK-279-STANDARD` | 259 | 149 | On Page SEO & Local Visibility System — SEO Audit Binder (63 On-Page + Technical Checks), Keyword Research Tracker, Google Business Profile Pack with |
| `OJK-279-PRO` | 248 | 149 | On Page SEO & Local Visibility System — SEO Audit Binder (63 On-Page + Technical Checks), Keyword Research Tracker, Google Business Profile Pack with |
| `OJK-250-STANDARD` | 163 | 144 | Client Onboarding Kit for Service Businesses — Client Welcome Packet, Intake Questionnaire & Onboarding Checklist Tracker System (Excel + Google |
| `OJK-250-PRO` | 158 | 144 | Client Onboarding Kit for Service Businesses — Client Welcome Packet, Intake Questionnaire & Onboarding Checklist Tracker System (Excel + Google |
| `OJK-232-STANDARD` | 214 | 147 | Pet Grief Journal — Pet Loss Grief Journal & Guided Memorial Journal with Keepsake Records Workbook: Arrangements Log, Sympathy Thank-You Tracker & |
| `OJK-232-PRO` | 209 | 147 | Pet Grief Journal — Pet Loss Grief Journal & Guided Memorial Journal with Keepsake Records Workbook: Arrangements Log, Sympathy Thank-You Tracker & |
| `OJK-262-STANDARD` | 204 | 146 | Nikah Wedding Planner — Muslim Nikah-to-Walima Planner with Dual-Event Run Sheets, Mahr Record Budget, Guest List & Vendor Tracker (Excel + Google |
| `OJK-262-PRO` | 193 | 146 | Nikah Wedding Planner — Muslim Nikah-to-Walima Planner with Dual-Event Run Sheets, Mahr Record Budget, Guest List & Vendor Tracker (Excel + Google |
| `OJK-188-STANDARD` | 255 | 149 | VA Records Organizer — Veteran Records Binder & Personal Deadline Tracker for DD214, Service Records & Your Own VA Letters, with Records Completeness |
| `OJK-188-PRO` | 244 | 149 | VA Records Organizer — Veteran Records Binder & Personal Deadline Tracker for DD214, Service Records & Your Own VA Letters, with Records Completeness |
| `OJK-280-STANDARD` | 262 | 141 | Business Plan with Financial Projections — Business Plan & Financial Model Kit with 5-Year Forecast Excel Model, Break-Even, ROI & Payback by |
| `OJK-280-PRO` | 251 | 141 | Business Plan with Financial Projections — Business Plan & Financial Model Kit with 5-Year Forecast Excel Model, Break-Even, ROI & Payback by |
| `OJK-251-STANDARD` | 152 | 141 | Small Business Bookkeeping Spreadsheet — Income & Expense Tracker, Monthly P&L, Receipt Register & CPA Handoff System (Excel + Google Sheets) |
| `OJK-233-STANDARD` | 210 | 149 | Reptile Care Planner — Reptile & Exotic Pet Logs with Feeding Log & Refusal Flags, Shed & Weight Growth Tracker, Enclosure Temperature/Humidity Log & |
| `OJK-233-PRO` | 205 | 149 | Reptile Care Planner — Reptile & Exotic Pet Logs with Feeding Log & Refusal Flags, Shed & Weight Growth Tracker, Enclosure Temperature/Humidity Log & |
| `OJK-263-STANDARD` | 234 | 143 | Nonprofit Event Fundraiser — Fundraiser Event Planner Spreadsheet for Galas & Auctions: Budget, Ticket & Table Sales, Auction Register, Sponsor |
| `OJK-263-PRO` | 223 | 143 | Nonprofit Event Fundraiser — Fundraiser Event Planner Spreadsheet for Galas & Auctions: Budget, Ticket & Table Sales, Auction Register, Sponsor |
| `OJK-281-STANDARD` | 259 | 145 | Shopify Store Setup System — Step-by-Step SOP Guide, 56-Task Setup Checklist & Launch-Readiness Score, Policy Templates & Pre-Launch QA Checklist |
| `OJK-281-PRO` | 248 | 145 | Shopify Store Setup System — Step-by-Step SOP Guide, 56-Task Setup Checklist & Launch-Readiness Score, Policy Templates & Pre-Launch QA Checklist |
| `OJK-234-STANDARD` | 196 | 146 | Boat Captain's Logs — Boat Logbook with Voyage Log, Engine-Hours Maintenance Tracker, Fuel Log & Safety-Gear Expiry Flags (Excel + Google Sheets + |
| `OJK-234-PRO` | 185 | 146 | Boat Captain's Logs — Boat Logbook with Voyage Log, Engine-Hours Maintenance Tracker, Fuel Log & Safety-Gear Expiry Flags (Excel + Google Sheets + |
| `OJK-189-STANDARD` | 252 | 144 | Deployment Binder for Military Spouses — Family Readiness Binder: Family Countdown, 36-Item Readiness Checklist, Household Systems with Due-Date |
| `OJK-189-PRO` | 241 | 144 | Deployment Binder for Military Spouses — Family Readiness Binder: Family Countdown, 36-Item Readiness Checklist, Household Systems with Due-Date |
| `OJK-400-STANDARD` | 258 | 148 | Food Storage Inventory Tracker — Emergency Food & Water Storage System: Pantry Inventory with Expiry Dates, Water Storage Calculator & Stock Targets |
| `OJK-400-PRO` | 247 | 148 | Food Storage Inventory Tracker — Emergency Food & Water Storage System: Pantry Inventory with Expiry Dates, Water Storage Calculator & Stock Targets |
| `OJK-282-STANDARD` | 260 | 147 | Amazon Product Research & Profit System — FBA Profit Calculator with Platform Fees for Amazon, Etsy, Shopify & eBay, Weighted Scorecards & Supplier |
| `OJK-282-PRO` | 249 | 147 | Amazon Product Research & Profit System — FBA Profit Calculator with Platform Fees for Amazon, Etsy, Shopify & eBay, Weighted Scorecards & Supplier |
| `OJK-264-STANDARD` | 258 | 149 | Resume Templates by Profession — Nurse, Teacher, Trades, Admin, Sales, Customer Service, Warehouse & Graduates: Resume + Cover Letter Layouts, Bullet |
| `OJK-264-PRO` | 247 | 149 | Resume Templates by Profession — Nurse, Teacher, Trades, Admin, Sales, Customer Service, Warehouse & Graduates: Resume + Cover Letter Layouts, Bullet |
| `OJK-253-STANDARD` | 174 | 148 | Food Truck Business Spreadsheet & Bakery Business Spreadsheet — Event Sales, Menu Costing, Permits Tracker, Production Planner & Order Book (Excel + |
| `OJK-253-PRO` | 163 | 148 | Food Truck Business Spreadsheet & Bakery Business Spreadsheet — Event Sales, Menu Costing, Permits Tracker, Production Planner & Order Book (Excel + |
| `OJK-265-STANDARD` | 261 | 141 | Interview Prep & Job Tracker Bundle — Interview Prep Workbook with STAR Story Bank, Negotiation Prep Worksheet & Three Niched Job Application |
| `OJK-265-PRO` | 250 | 141 | Interview Prep & Job Tracker Bundle — Interview Prep Workbook with STAR Story Bank, Negotiation Prep Worksheet & Three Niched Job Application |
| `OJK-190-STANDARD` | 261 | 149 | Nurse Worker OS — Nurse Shift Planner Spreadsheet: Rota & Shifts with Hours by Formula, Pay Tracker with ⚠ Payslip Check Flags, Leave & TOIL Log, CPD |
| `OJK-190-PRO` | 250 | 149 | Nurse Worker OS — Nurse Shift Planner Spreadsheet: Rota & Shifts with Hours by Formula, Pay Tracker with ⚠ Payslip Check Flags, Leave & TOIL Log, CPD |
| `OJK-236-STANDARD` | 195 | 145 | RV Living System — RV Maintenance Binder & Tracker with Campground Log, Mileage & Fuel, Monthly Cost-of-RV-Life Dashboard (Excel + Google Sheets) |
| `OJK-236-PRO` | 184 | 145 | RV Living System — RV Maintenance Binder & Tracker with Campground Log, Mileage & Fuel, Monthly Cost-of-RV-Life Dashboard (Excel + Google Sheets) |
| `OJK-402-STANDARD` | 255 | 142 | Language Learning Planner — Organiser: Vocabulary Tracker with Spaced-Review Dates, Speaking & Listening Logs, Grammar Log & Phrase Bank for 5 |
| `OJK-402-PRO` | 244 | 142 | Language Learning Planner — Organiser: Vocabulary Tracker with Spaced-Review Dates, Speaking & Listening Logs, Grammar Log & Phrase Bank for 5 |
| `OJK-255-STANDARD` | 204 | 147 | Property Documents Forms Pack for Landlords — Rental Application Form, Tenant Welcome Packet, Move-In/Move-Out Inspection Checklists, Rent Ledger + |
| `OJK-255-PRO` | 193 | 147 | Property Documents Forms Pack for Landlords — Rental Application Form, Tenant Welcome Packet, Move-In/Move-Out Inspection Checklists, Rent Ledger + |
| `OJK-501-STANDARD` | 163 | 144 | Reseller Spreadsheet — Multi-Platform Profit Tracker for eBay, Poshmark, Mercari & Depop: Fees, Shipping, COGS & Profit per Flip (Excel + Google |
| `OJK-501-PRO` | 152 | 144 | Reseller Spreadsheet — Multi-Platform Profit Tracker for eBay, Poshmark, Mercari & Depop: Fees, Shipping, COGS & Profit per Flip (Excel + Google |
| `OJK-266-STANDARD` | 244 | 148 | Lash & Nail Record Books — Lash Tech Client Record Book & Nail Tech Records System with Refill-Due Formulas, Lash Map Records, Patch-Test Register & |
| `OJK-266-PRO` | 233 | 148 | Lash & Nail Record Books — Lash Tech Client Record Book & Nail Tech Records System with Refill-Due Formulas, Lash Map Records, Patch-Test Register & |
| `OJK-237-STANDARD` | 198 | 144 | Homeschool Co-op Admin System — Member Register, Class Enrolment, Fees & Payments Log with Paid/Unpaid Flags, Forms Pack (Excel + Google Sheets) |
| `OJK-237-PRO` | 187 | 144 | Homeschool Co-op Admin System — Member Register, Class Enrolment, Fees & Payments Log with Paid/Unpaid Flags, Forms Pack (Excel + Google Sheets) |
| `OJK-191-STANDARD` | 244 | 143 | Music Studio Admin Spreadsheet for Private Music Teachers — Student Enrolment, Lesson Schedule & Attendance Tracker, Recital Planner, Term Fees |
| `OJK-191-PRO` | 233 | 143 | Music Studio Admin Spreadsheet for Private Music Teachers — Student Enrolment, Lesson Schedule & Attendance Tracker, Recital Planner, Term Fees |
| `OJK-403-STANDARD` | 256 | 148 | Puppy Training Tracker — Puppy & Dog Training Progress System: Session Log & Cue Progress Workbook with Success % by Formula (Excel + Google Sheets) |
| `OJK-403-PRO` | 245 | 148 | Puppy Training Tracker — Puppy & Dog Training Progress System: Session Log & Cue Progress Workbook with Success % by Formula (Excel + Google Sheets) |
| `OJK-256-STANDARD` | 210 | 143 | Financial Aid Comparison System — Award Letter Comparison with True Net Price by Formula, Four-Year Cost Projector, Loan Totals (Excel + Google |
| `OJK-256-PRO` | 199 | 143 | Financial Aid Comparison System — Award Letter Comparison with True Net Price by Formula, Four-Year Cost Projector, Loan Totals (Excel + Google |
| `OJK-238-STANDARD` | 194 | 145 | Yearbook Advisor Kit — Page Ladder & Deadline Tracker, Ad & Book Sales Tracker with Running Totals, Budget Log (Excel + Google Sheets) — Pro Adds |
| `OJK-238-PRO` | 183 | 145 | Yearbook Advisor Kit — Page Ladder & Deadline Tracker, Ad & Book Sales Tracker with Running Totals, Budget Log (Excel + Google Sheets) — Pro Adds |
| `OJK-267-STANDARD` | 221 | 145 | Painting Contractor Kit — Painting Estimate Calculator (Room-by-Room, Gallons & Labour by Formula), Job Tracker, Materials Log & Margin Dashboard |
| `OJK-267-PRO` | 210 | 145 | Painting Contractor Kit — Painting Estimate Calculator (Room-by-Room, Gallons & Labour by Formula), Job Tracker, Materials Log & Margin Dashboard |
| `OJK-404-STANDARD` | 260 | 149 | Novel Planning Workbook — Genre Novel Planner with Character Bible Template for Writers, Chapter Outline Cards, Continuity Ledger & Drafting Log (PDF |
| `OJK-404-PRO` | 249 | 149 | Novel Planning Workbook — Genre Novel Planner with Character Bible Template for Writers, Chapter Outline Cards, Continuity Ledger & Drafting Log (PDF |
| `OJK-192-STANDARD` | 251 | 148 | Tutoring Forms Bundle for Private Tutors — Enrolment Forms, Policies Acknowledgement, Session Notes & Parent Progress Reports + Enquiries Pipeline & |
| `OJK-192-PRO` | 240 | 148 | Tutoring Forms Bundle for Private Tutors — Enrolment Forms, Policies Acknowledgement, Session Notes & Parent Progress Reports + Enquiries Pipeline & |
| `OJK-503-STANDARD` | 159 | 148 | Foster Care Binder — Foster & Kinship Caregiver Binder: Court, Caseworker, Visits, School & Medical Organizer (Fillable + Printable, US Letter & A4) |
| `OJK-503-PRO` | 154 | 148 | Foster Care Binder — Foster & Kinship Caregiver Binder: Court, Caseworker, Visits, School & Medical Organizer (Fillable + Printable, US Letter & A4) |
| `OJK-239-STANDARD` | 182 | 147 | Process Server Case Log Spreadsheet — Case Register with Diligence Deadline Tracker, Service Attempts Log, Mileage Log + Per-Client Invoice Summary |
| `OJK-239-PRO` | 171 | 147 | Process Server Case Log Spreadsheet — Case Register with Diligence Deadline Tracker, Service Attempts Log, Mileage Log + Per-Client Invoice Summary |
| `OJK-268-STANDARD` | 193 | 148 | Towing Business Forms — Dispatch Log, Tow Ticket Register, Impound & Storage Lot Log with Fees by Formula, Insurance Billing (Excel + Google Sheets) |
| `OJK-268-PRO` | 182 | 148 | Towing Business Forms — Dispatch Log, Tow Ticket Register, Impound & Storage Lot Log with Fees by Formula, Insurance Billing (Excel + Google Sheets) |
| `OJK-257-STANDARD` | 163 | 144 | PREGNANCY JOURNAL PLANNER — Pregnancy & Postpartum System: Appointment Log, Registry & Cost Tracker, Birth Preferences Worksheet (Excel + Google |
| `OJK-257-PRO` | 158 | 144 | PREGNANCY JOURNAL PLANNER — Pregnancy & Postpartum System: Appointment Log, Registry & Cost Tracker, Birth Preferences Worksheet (Excel + Google |
| `OJK-405-STANDARD` | 262 | 146 | Client Recipe Pack for Nutrition Coaches — Nutrition Coach Client Recipe Pack System: 4 Themed Recipe Books (48 Original Recipes) to Brand As Your |
| `OJK-405-PRO` | 251 | 146 | Client Recipe Pack for Nutrition Coaches — Nutrition Coach Client Recipe Pack System: 4 Themed Recipe Books (48 Original Recipes) to Brand As Your |
| `OJK-504-STANDARD` | 260 | 145 | DAC7 Tracker — EU Platform Threshold Spreadsheet for Vinted, Kleinanzeigen, Wallapop, Leboncoin & eBay: Traffic-Light Counters for the 30-Sales / |
| `OJK-504-PRO` | 255 | 145 | DAC7 Tracker — EU Platform Threshold Spreadsheet for Vinted, Kleinanzeigen, Wallapop, Leboncoin & eBay: Traffic-Light Counters for the 30-Sales / |
| `OJK-240-STANDARD` | 192 | 144 | Citizenship Test Prep Study Organiser — 100 Civics Questions Tracker, Mock Test Score Log, English Vocabulary Practice + Interview-Day Checklist |
| `OJK-240-PRO` | 187 | 144 | Citizenship Test Prep Study Organiser — 100 Civics Questions Tracker, Mock Test Score Log, English Vocabulary Practice + Interview-Day Checklist |
| `OJK-258-STANDARD` | 196 | 148 | SPECIAL NEEDS CARE BINDER — Special-Needs Adult Lifelong Binder + Dementia Caregiver Binder Edition: Communication Passport, Document Location Log & |
| `OJK-258-PRO` | 191 | 148 | SPECIAL NEEDS CARE BINDER — Special-Needs Adult Lifelong Binder + Dementia Caregiver Binder Edition: Communication Passport, Document Location Log & |
| `OJK-269-STANDARD` | 172 | 146 | SOP Template Library & Business Formation Checklist Organiser — SOP Register with Review Flags, 12 Fill-In SOP Templates & Filing Tracker (Excel + |
| `OJK-269-PRO` | 167 | 146 | SOP Template Library & Business Formation Checklist Organiser — SOP Register with Review Flags, 12 Fill-In SOP Templates & Filing Tracker (Excel + |
| `OJK-193-STANDARD` | 250 | 145 | Classroom Decor Bundle — Theme Library: 378 Printable Pieces in 3 Coordinated Themes (Boho, Calm & Modern) — Bunting, Calendar Set, Borders, Name |
| `OJK-193-PRO` | 239 | 145 | Classroom Decor Bundle — Theme Library: 378 Printable Pieces in 3 Coordinated Themes (Boho, Calm & Modern) — Bunting, Calendar Set, Borders, Name |
| `OJK-505-STANDARD` | 216 | 145 | Emergency Preparedness Binder — The Offline Binder: Family Emergency Binder with Hurricane Preparedness Checklist Modules, Go Bag Planner Pages & |
| `OJK-505-PRO` | 211 | 145 | Emergency Preparedness Binder — The Offline Binder: Family Emergency Binder with Hurricane Preparedness Checklist Modules, Go Bag Planner Pages & |
| `OJK-241-STANDARD` | 203 | 144 | First Responder Shift Planner — Firefighter Shift Planner with 24/48 & Kelly Rotations, Overtime & Swap Log, Cert Expiry Tracker (Excel + Google |
| `OJK-241-PRO` | 192 | 144 | First Responder Shift Planner — Firefighter Shift Planner with 24/48 & Kelly Rotations, Overtime & Swap Log, Cert Expiry Tracker (Excel + Google |
| `OJK-259-STANDARD` | 177 | 149 | EMERGENCY BINDER — Just in Case Binder & Crisis Organiser: Home Inventory for Claims, Go-Bag Tracker, Insurance Register & Recovery Checklists (Excel |
| `OJK-259-PRO` | 172 | 149 | EMERGENCY BINDER — Just in Case Binder & Crisis Organiser: Home Inventory for Claims, Go-Bag Tracker, Insurance Register & Recovery Checklists (Excel |
| `OJK-270-STANDARD` | 161 | 142 | Equipment Rental Manager & Self-Storage Unit Tracker — Rental Booking Tracker with Conflict Flags, Occupancy & Overdue Engines (Excel + Google |
| `OJK-270-PRO` | 156 | 142 | Equipment Rental Manager & Self-Storage Unit Tracker — Rental Booking Tracker with Conflict Flags, Occupancy & Overdue Engines (Excel + Google |
| `OJK-407-STANDARD` | 262 | 149 | Niche Preset & LUT Library — newborn Lightroom presets, real estate photography presets & wedding LUTs: 3 Niche Packs of XMP Presets + Matching .cube |
| `OJK-407-PRO` | 251 | 149 | Niche Preset & LUT Library — newborn Lightroom presets, real estate photography presets & wedding LUTs: 3 Niche Packs of XMP Presets + Matching .cube |
| `OJK-506-STANDARD` | 211 | 146 | Christmas Planner Printable — Holiday Season Planner Binder with Thanksgiving Meal Planner, Christmas Budget Tracker & Holiday Gift List Organizer |
| `OJK-506-PRO` | 206 | 146 | Christmas Planner Printable — Holiday Season Planner Binder with Thanksgiving Meal Planner, Christmas Budget Tracker & Holiday Gift List Organizer |
| `OJK-194-STANDARD` | 231 | 148 | Small Group Counseling Curriculum for Elementary School Counselors — Friendship, Big Feelings & Growth Mindset Small Group Lessons (Grades 2–5) with |
| `OJK-194-PRO` | 220 | 148 | Small Group Counseling Curriculum for Elementary School Counselors — Friendship, Big Feelings & Growth Mindset Small Group Lessons (Grades 2–5) with |
| `OJK-242-STANDARD` | 221 | 146 | ELL Newcomer Teacher System — Newcomer Student Register, Language-Level Tracker, Family Communication & Interpreter Log, Intake Checklist (Excel + |
| `OJK-242-PRO` | 210 | 146 | ELL Newcomer Teacher System — Newcomer Student Register, Language-Level Tracker, Family Communication & Interpreter Log, Intake Checklist (Excel + |
| `OJK-271-STANDARD` | 213 | 147 | School Choice Admissions Organiser — Multi-School Comparison Register, Application Checklist with Overdue Flags, Deadline Dashboard (Excel + Google |
| `OJK-271-PRO` | 202 | 147 | School Choice Admissions Organiser — Multi-School Comparison Register, Application Checklist with Overdue Flags, Deadline Dashboard (Excel + Google |
| `OJK-244-STANDARD` | 162 | 143 | Quinceañera Planner Spreadsheet — Mis Quince Budget Planner with Padrinos List Tracker, Court Register, Guest List & Vendor Log (Excel + Google |
| `OJK-244-PRO` | 157 | 143 | Quinceañera Planner Spreadsheet — Mis Quince Budget Planner with Padrinos List Tracker, Court Register, Guest List & Vendor Log (Excel + Google |
| `OJK-409-STANDARD` | 170 | 149 | Shea Butter Body Butter Recipes Ebook — Handmade Skincare Maker's Recipe & Batch System: 30 Original Recipes, Printable Batch Binder, Costing & Label |
| `OJK-409-PRO` | 165 | 149 | Shea Butter Body Butter Recipes Ebook — Handmade Skincare Maker's Recipe & Batch System: 30 Original Recipes, Printable Batch Binder, Costing & Label |
| `OJK-272-STANDARD` | 159 | 148 | Babysitter Binder Planner & Nanny Binder Kit — Family Instruction Binder + Sitter Client Register, Booking Log & Pay Tracker (Excel + Google Sheets) |
| `OJK-272-PRO` | 154 | 148 | Babysitter Binder Planner & Nanny Binder Kit — Family Instruction Binder + Sitter Client Register, Booking Log & Pay Tracker (Excel + Google Sheets) |
| `OJK-410-STANDARD` | 219 | 141 | Golf Score Tracker Printable + Spreadsheet System — Athlete Training Log System: Golf Round Log, Handicap Estimate Tracker & Practice Planner |
| `OJK-410-PRO` | 219 | 141 | Golf Score Tracker Printable + Spreadsheet System — Athlete Training Log System: Golf Round Log, Handicap Estimate Tracker & Practice Planner |
| `OJK-508-STANDARD` | 153 | 142 | Shagun Ledger — Lena-Dena Record & Indian Wedding Gift Tracker for Shagun Envelopes, Guest Subsets and Vendor Advances (Excel + Google Sheets) |
| `OJK-273-STANDARD` | 226 | 141 | Podcast Production Kit — Podcast Production Planner & Episode Pipeline Tracker with Guest Booking, Release Records, Sponsorship Log & Content |
| `OJK-273-PRO` | 215 | 141 | Podcast Production Kit — Podcast Production Planner & Episode Pipeline Tracker with Guest Booking, Release Records, Sponsorship Log & Content |
| `OJK-411-STANDARD` | 157 | 148 | Sleep Diary Printable — Sleep Diary & Night-Routine Tracker System: 90-Day Sleep Diary, Sleep Tracker Log Book & Appointment Summary (Standard $19 / |
| `OJK-411-PRO` | 157 | 148 | Sleep Diary Printable — Sleep Diary & Night-Routine Tracker System: 90-Day Sleep Diary, Sleep Tracker Log Book & Appointment Summary (Standard $19 / |
| `OJK-450-STANDARD` | 168 | 146 | If I'm Not Here Binder — The Handover Binder: In Case of Emergency Binder, First 48 Hours Plan, Who-To-Call Tree & Stand-In Role Cards (Fillable + |
| `OJK-450-PRO` | 163 | 146 | If I'm Not Here Binder — The Handover Binder: In Case of Emergency Binder, First 48 Hours Plan, Who-To-Call Tree & Stand-In Role Cards (Fillable + |
| `OJK-274-STANDARD` | 221 | 147 | Christian & Catholic Wedding Planner — Catholic Wedding Planner with Ceremony Planner, Rehearsal Sheet, Reception Run Sheet, Budget & Guest Tracker |
| `OJK-274-PRO` | 210 | 147 | Christian & Catholic Wedding Planner — Catholic Wedding Planner with Ceremony Planner, Rehearsal Sheet, Reception Run Sheet, Budget & Guest Tracker |
| `OJK-412-STANDARD` | 247 | 147 | Craft Pattern Designer's System — Crochet Pattern Templates: Drafting Templates, Sizing & Yardage Calculator, Pattern Testing Log & Tester Feedback |
| `OJK-412-PRO` | 236 | 147 | Craft Pattern Designer's System — Crochet Pattern Templates: Drafting Templates, Sizing & Yardage Calculator, Pattern Testing Log & Tester Feedback |
| `OJK-451-STANDARD` | 174 | 149 | Editable Symptom Tracker — Write-Your-Own-Symptoms Chronic Illness System: Multi-Condition Daily Tracker for Up to 4 Conditions, Fillable + Printable |
| `OJK-451-PRO` | 174 | 149 | Editable Symptom Tracker — Write-Your-Own-Symptoms Chronic Illness System: Multi-Condition Daily Tracker for Up to 4 Conditions, Fillable + Printable |
| `OJK-452-STANDARD` | 165 | 149 | Etsy Pricing Calculator — Margin-Drift Alert Sheet for Makers: Excel + Google Sheets Profit Tracker That Flags Unprofitable SKUs When Supplier Prices |
| `OJK-452-PRO` | 154 | 149 | Etsy Pricing Calculator — Margin-Drift Alert Sheet for Makers: Excel + Google Sheets Profit Tracker That Flags Unprofitable SKUs When Supplier Prices |
| `OJK-453-STANDARD` | 200 | 142 | Construction WIP Schedule Template — Construction WIP Month-End Close Packet: Percent-Complete, Earned Revenue & Over/Underbilling Tracker for |
| `OJK-453-PRO` | 195 | 142 | Construction WIP Schedule Template — Construction WIP Month-End Close Packet: Percent-Complete, Earned Revenue & Over/Underbilling Tracker for |
| `OJK-454-STANDARD` | 247 | 146 | IEP Tracker — IEP Minutes Evidence Kit, Parent Edition: Weekly Promised vs Received Minutes Log, Communication Log & Filled Example Term (Fillable |
| `OJK-454-PRO` | 236 | 146 | IEP Tracker — IEP Minutes Evidence Kit, Parent Edition: Weekly Promised vs Received Minutes Log, Communication Log & Filled Example Term (Fillable |
| `OJK-415-STANDARD` | 260 | 145 | Car Maintenance Log Book Printable — Multi-Vehicle Service History & Records System: Vehicle Service History Tracker, Car Maintenance Spreadsheet |
| `OJK-415-PRO` | 249 | 145 | Car Maintenance Log Book Printable — Multi-Vehicle Service History & Records System: Vehicle Service History Tracker, Car Maintenance Spreadsheet |
| `OJK-457-STANDARD` | 258 | 146 | Mistake Notebook System — Error Log & Wrong-Answer Log: Mistake Log + Cause Tags, 3/7/30 Re-Solve Schedule, Revision Bank & Tracker, Auto Re-Solve |
| `OJK-457-PRO` | 247 | 146 | Mistake Notebook System — Error Log & Wrong-Answer Log: Mistake Log + Cause Tags, 3/7/30 Re-Solve Schedule, Revision Bank & Tracker, Auto Re-Solve |
| `OJK-416-STANDARD` | 193 | 147 | Aesthetic Phone Wallpaper Pack — Digital Wallpaper & Icon Pack Library: 12 Vintage Travel Poster Sets for iPhone, Android, 4K Desktop & Tablet (Pro |
| `OJK-416-PRO` | 182 | 147 | Aesthetic Phone Wallpaper Pack — Digital Wallpaper & Icon Pack Library: 12 Vintage Travel Poster Sets for iPhone, Android, 4K Desktop & Tablet (Pro |
| `OJK-458-STANDARD` | 256 | 147 | OFW Planner — Family System: Remittance Tracker, Ipon Challenge & Savings, Documents Organiser, Balikbayan Box System with ₱150,000 Cap Tally, HAWB |
| `OJK-458-PRO` | 251 | 147 | OFW Planner — Family System: Remittance Tracker, Ipon Challenge & Savings, Documents Organiser, Balikbayan Box System with ₱150,000 Cap Tally, HAWB |
| `OJK-417-STANDARD` | 258 | 148 | Printable Colouring Book for Adults — 612 Original Pages in 3 Volumes (Cosy Home & Garden · Vintage Travel · Animals & Nature), Print-Ready Letter + |
| `OJK-417-PRO` | 247 | 148 | Printable Colouring Book for Adults — 612 Original Pages in 3 Volumes (Cosy Home & Garden · Vintage Travel · Animals & Nature), Print-Ready Letter + |
| `OJK-456-STANDARD` | 225 | 143 | FIFO Planner — Rotational Household Planner: Swing Roster Calendar for Fly In Fly Out, Offshore, Maritime, Mining & Long-Haul Families (Excel + |
| `OJK-456-PRO` | 214 | 143 | FIFO Planner — Rotational Household Planner: Swing Roster Calendar for Fly In Fly Out, Offshore, Maritime, Mining & Long-Haul Families (Excel + |
| `OJK-509-LICENCE` | 156 | 148 | Local Marketing Agency Kit — Agency Operator System: Pipeline Tracker, Cool Calling Scripts, Package Builder, MRR & Churn Dashboard — Multi-Location |
| `OJK-510-STANDARD` | 161 | 140 | Community Operator Kit — Free Community System: Launch Planner, Member Pipeline Tracker, Intent Poll Templates, Offer Stack Builder & Health |
| `OJK-510-PRO` | 156 | 140 | Community Operator Kit — Free Community System: Launch Planner, Member Pipeline Tracker, Intent Poll Templates, Offer Stack Builder & Health |
| `OJK-510-LICENCE` | 175 | 140 | Community Operator Kit — Free Community System: Launch Planner, Member Pipeline Tracker, Intent Poll Templates, Offer Stack Builder & Health |
| `OJK-511-STANDARD` | 185 | 148 | AI Agent Fleet Command Center — Agent Roster & Roles Register, Task & Output Log, Cost Tracker with Caps, QA Scorecard, Runbook Library, Failure Log |
| `OJK-511-PRO` | 180 | 148 | AI Agent Fleet Command Center — Agent Roster & Roles Register, Task & Output Log, Cost Tracker with Caps, QA Scorecard, Runbook Library, Failure Log |
| `OJK-511-LICENCE` | 199 | 148 | AI Agent Fleet Command Center — Agent Roster & Roles Register, Task & Output Log, Cost Tracker with Caps, QA Scorecard, Runbook Library, Failure Log |
| `OJK-512-STANDARD` | 164 | 145 | Creator IP Empire OS — Royalty Tracker Spreadsheet for Creators: Asset Inventory, Licence Register, Renewal Calendar & Rights Log (Excel + Google |
| `OJK-512-PRO` | 159 | 145 | Creator IP Empire OS — Royalty Tracker Spreadsheet for Creators: Asset Inventory, Licence Register, Renewal Calendar & Rights Log (Excel + Google |
| `OJK-512-LICENCE` | 178 | 145 | Creator IP Empire OS — Royalty Tracker Spreadsheet for Creators: Asset Inventory, Licence Register, Renewal Calendar & Rights Log (Excel + Google |
| `OJK-513-STANDARD` | 160 | 149 | Client Document Chase & Onboarding Control Kit — Missing Document Tracker Spreadsheet for Agencies, Bookkeepers & Consultants (Excel + Google Sheets) |
| `OJK-513-PRO` | 155 | 149 | Client Document Chase & Onboarding Control Kit — Missing Document Tracker Spreadsheet for Agencies, Bookkeepers & Consultants (Excel + Google Sheets) |
| `OJK-513-LICENCE` | 174 | 149 | Client Document Chase & Onboarding Control Kit — Missing Document Tracker Spreadsheet for Agencies, Bookkeepers & Consultants (Excel + Google Sheets) |
| `OJK-514-STANDARD` | 177 | 149 | Home Care Agency Startup & Compliance OS — Licensing Steps Tracker, Caregiver Credential Expiry & Service Plan System for Non-Medical Agencies (Excel |
| `OJK-514-PRO` | 172 | 149 | Home Care Agency Startup & Compliance OS — Licensing Steps Tracker, Caregiver Credential Expiry & Service Plan System for Non-Medical Agencies (Excel |
| `OJK-514-LICENCE` | 191 | 149 | Home Care Agency Startup & Compliance OS — Licensing Steps Tracker, Caregiver Credential Expiry & Service Plan System for Non-Medical Agencies (Excel |
| `OJK-515-STANDARD` | 154 | 143 | Insurance Agency Operator OS — Renewal Chase, Producer Pipeline & Commission Tracker Spreadsheet for Insurance Agencies (Excel + Google Sheets) |
| `OJK-516-STANDARD` | 208 | 146 | Prop Firm Multi Account Tracker Spreadsheet — Multi-Account Command Center for Every Challenge & Funded Account: Rules Register, Drawdown Distance |
| `OJK-516-PRO` | 197 | 146 | Prop Firm Multi Account Tracker Spreadsheet — Multi-Account Command Center for Every Challenge & Funded Account: Rules Register, Drawdown Distance |
| `OJK-ART-E19-PERSONAL` | 151 | 140 | Balkans Wall Art Set of 120 Prints, Montenegro Bosnia Serbia Albania, Bay of Kotor, Mostar Old Bridge, Lake Bled & Ohrid, Printable Download |
| `OJK-ART-E19-COMMERCIAL` | 153 | 140 | Balkans Wall Art Set of 120 Prints, Montenegro Bosnia Serbia Albania, Bay of Kotor, Mostar Old Bridge, Lake Bled & Ohrid, Printable Download |

## Cross-check — 10 random rows vs the live store (re-run for this build)

Method: 10 rows drawn from the regenerated full feed with a fixed random seed (20261117); for each row, the feed `link` was fetched (HTTP status recorded), and the live product data was read from `https://onejobkits.com/products/<handle>.json` and compared field by field — title (feed title must equal the live product title, plus variant suffix where applicable, cut only at the 150-char word boundary), price by SKU (including the compare-at → price / sale_price split), and image (feed `image_link` must be one of the live product's images). Result: **10/10 rows match on every field, and 10/10 links return HTTP 200.** (None of the 10 sampled rows happened to carry a sale_price split this draw; the split logic is unchanged from the first build, whose sample exercised it.)

| Feed id | Link HTTP | Price (feed) | Live price / compare-at | Title | Image |
|---|---:|---|---|---|---|
| `OJK-64-BASE` | 200 | 12.00 USD | 12.00 / — | match | match |
| `OJK-12-STANDARD` | 200 | 149.00 USD | 149.00 / — | match | match |
| `OJK-145-BASE` | 200 | 19.00 USD | 19.00 / — | match | match |
| `OJK-93-STANDARD` | 200 | 34.00 USD | 34.00 / — | match | match |
| `OJK-126-STANDARD` | 200 | 19.00 USD | 19.00 / — | match | match |
| `OJK-180-STANDARD` | 200 | 29.00 USD | 29.00 / — | match | match |
| `OJK-113-BASE` | 200 | 29.00 USD | 29.00 / — | match | match |
| `OJK-79-TEEN-EDITION` | 200 | 29.00 USD | 29.00 / — | match | match |
| `OJK-180-PRO` | 200 | 49.00 USD | 49.00 / — | match | match |
| `OJK-501-PRO` | 200 | 29.00 USD | 29.00 / — | match | match |

## Pilot composition (this build)

- `prop-firm-challenge-journal-drawdown-guardian` (kit_1)
- `aging-parent-caregiver-binder-system` (ordinary_kit_5)
- `garden-planner-journal` (book)
- `baby-shower-games-bundles-64-printable-games-cards-in-3-original-themes-woodland-berry-sweet-gingham-picnic-unique-bingo-cards-answer-keys-host-guide` (bundle)
- `120-bulgaria-wall-art-prints-black-sea-beaches-old-towns-mountains-rose-valley-gallery-wall-set-printable-travel-decor-digital-download` (wall_art_set)
- `1099-schedule-c-tax-organizer-self-employed-tax-organizer-for-freelancers-independent-contractors-income-log-with-missing-1099-count-expense-log-in-the-forms-own-categories-ask-cpa-flags-mileage-log-quarterly-payment-organizer-cpa-hand-off` (ordinary_kit_1)
- `affiliate-program-setup-pack-launch-recruit-manage-your-own-affiliate-programme` (ordinary_kit_4)
- `30-day-social-media-content-calendar-for-coaches-captions-hashtags-content-briefs-system` (ordinary_kit_2)
- `aesthetic-phone-wallpaper-pack-digital-wallpaper-icon-pack-library-12-vintage-travel-poster-sets-for-iphone-android-4k-desktop-tablet-pro-matching-icon-packs-widget-art` (ordinary_kit_3)
- `ai-agent-fleet-command-center-agent-roster-roles-register-task-output-log-cost-tracker-with-caps-qa-scorecard-runbook-library-failure-log-weekly-kill-keep-review` (multi_variant_kit)

The two ADHD products that sat in the first pilot (ordinary-kit slots) are now excluded under google-healthcare-flag; the pilot re-picked replacements automatically and still covers Kit #1, a multi-variant kit, a book, a bundle, a wall-art set and five diversified ordinary kits.
