# Côte d’Azur Agency — first ChatGPT Ads test

Status: no advertising spend authorized by this change. No analytics subscription or pixel enabled.

## Campaign link
https://www.cotedazuragency.com/fr/vente?utm_source=chatgpt&utm_medium=cpc&utm_campaign=caa_acquereurs_test&utm_content=annonce_01

Use the exact four UTM values. The client retains only these four allowlisted values in memory for up to 30 minutes after the last recognized campaign URL. Internal Next.js navigation preserves attribution; a full reload, a new tab or leaving the site can lose it. No cookie, localStorage, sessionStorage, user identifier, full URL or referrer is saved.

Contact and property-alert requests include this attribution. The API validates the allowlist again and includes the source and request type in the existing agency notification email only after normal form validation. Attribution is self-reported, not evidence of an OpenAI-billed click; copied campaign links can also generate attributed requests.

## Operational reconciliation
For the same date range and Paris timezone, record:
- Ads Manager: billed valid clicks, ad spend excluding taxes and credits, average CPC.
- Agency inbox: attributed contact requests and alert requests separately. Deduplicate by prospect and qualify manually; an alert request is not a visit or a sale.
- Cost per qualified prospect = ad spend / deduplicated qualified prospects; undefined when zero.
- Billing: reconcile spend, credits, taxes and payment thresholds against invoices.

Independent visitor counting is NOT activated by this patch. Google Analytics is not connected to the available GSC Wizard account. The installed Vercel Analytics dependency is not mounted. Activation needs verification of the account's analytics settings and costs. No OpenAI conversion pixel or conversion reporting is connected.

Do not launch until independent visit measurement is verified, real form delivery is tested with authorization to send a test message, a total ad budget/date range is confirmed in Ads Manager, and billing/tax details are checked. Proposed test: EUR 210 total, subject to the minimum allowed by the interface. This is a proposal, not an approved spend.

## Verification
node scripts/check-campaign-attribution.mjs
Production build and preview smoke checks run in the campaign-attribution GitHub workflow. No real email is sent by automated checks.
