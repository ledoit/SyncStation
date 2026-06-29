# DNS — menhir-holdings.com + Vercel

How to wire **Menhir SyncStation** (`syncstation.menhir-holdings.com`) and future Menhir subdomains through Cloudflare to Vercel.

## What you already have (do not change)

These records are for **Zoho Mail**. Leave them exactly as they are — **DNS only (grey cloud), never proxied**:

| Name | Type | Value | Proxy |
|------|------|-------|-------|
| `menhir-holdings.com` | MX | `mx.zoho.com` (10), `mx2` (20), `mx3` (50) | DNS only |
| `menhir-holdings.com` | TXT | `v=spf1 include:zohomail.com -all` | DNS only |
| `zmail._domainkey` | TXT | DKIM key | DNS only |
| `zb04905990` | CNAME | `zmverify.zoho.com` | DNS only |

**Do not proxy MX, SPF, DKIM, or Zoho verification.** Orange-cloud on mail records breaks delivery.

You do **not** need to share these values with Vercel or paste them anywhere — they stay in Cloudflare only.

---

## What to add for SyncStation

### Step 1 — Add domain in Vercel

```bash
cd "Menhir Holdings/Website/SyncStation"
vercel domains add syncstation.menhir-holdings.com
```

Vercel will show the required DNS record (usually a **CNAME** to `cname.vercel-dns.com`).

**Add in Cloudflare** (do not touch your Zoho mail records):

| Name | Type | Target | Proxy |
|------|------|--------|-------|
| `syncstation` | CNAME | `cname.vercel-dns.com` | **DNS only** (grey cloud) first |

After Vercel shows the domain as verified, you can optionally enable orange-cloud proxy with SSL mode **Full (strict)**.

### Should you proxy (orange cloud)?

| Approach | Cloudflare proxy | When to use |
|----------|------------------|-------------|
| **Recommended first** | **DNS only (grey)** | Simplest. Vercel issues SSL directly. Use until everything works. |
| **Optional later** | **Proxied (orange)** | Cloudflare CDN/WAF in front of Vercel. Requires Cloudflare SSL mode **Full (strict)**. |

**Practical sequence:**

1. Add CNAME as **DNS only**.
2. Wait for Vercel to show the domain as verified (green).
3. Optionally enable proxy after SSL works end-to-end.

If you proxy too early, you may see SSL handshake errors until Cloudflare SSL is set to Full (strict) and Vercel has issued a cert.

### Step 3 — Vercel project aliases (fallbacks)

In the Vercel project **SyncStation**, add domains:

- `syncstation.vercel.app` (primary Vercel subdomain — set in project name)
- `menhir-syncstation.vercel.app`
- `menhirsyncstation.vercel.app`

These use Vercel’s `*.vercel.app` zone — **no Cloudflare records needed**.

---

## Future Menhir subdomains

Same pattern for each product:

| Subdomain | Example target | Cloudflare |
|-----------|----------------|------------|
| `syncstation` | `cname.vercel-dns.com` | CNAME, DNS only first |
| `eido` | `cname.vercel-dns.com` | same |
| `jobjeeves` | `cname.vercel-dns.com` | same |

**Apex** (`menhir-holdings.com` itself for a marketing site):

- Vercel: add `menhir-holdings.com` + `www.menhir-holdings.com`
- Cloudflare apex: **A** `76.76.21.21` or **CNAME flattening** to `cname.vercel-dns.com` (if your plan supports CNAME at apex)
- `www` → CNAME `cname.vercel-dns.com`

Only add apex when you have a landing page project — not required for SyncStation.

---

## What to give Vercel vs what stays in Cloudflare

| Give Vercel | Stays in Cloudflare only |
|--------------|--------------------------|
| Nothing from your mail records | MX, SPF, DKIM, Zoho verify |
| Add domain via CLI/dashboard | You create the CNAME they ask for |
| Env vars in project settings | — |

Vercel never needs your Zoho DKIM private key or MX priorities.

---

## Cutover from legacy URLs (when greenlit)

On the **old** Strob and Vecchio Vercel projects, add redirects:

| From | To |
|------|-----|
| `https://strob.vercel.app/*` | `https://syncstation.menhir-holdings.com/strob/*` |
| `https://vecchi.vercel.app/*` | `https://syncstation.menhir-holdings.com/vecchio/*` |

Then archive GitHub repos `ledoit/Strob` and `ledoit/Vecchio`.

---

## Spotify OAuth (Strob)

In Spotify Developer Dashboard, add redirect URI:

```
https://syncstation.menhir-holdings.com/strob/api/spotify/callback
```

Remove or keep old `strob.vercel.app` callback until cutover is complete.
