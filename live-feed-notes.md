# Live Feed Notes

Feed URL:

```text
https://feed.bewise.dk/feed/generate?id=d4e695ee-4ccb-4f5a-9224-2a983ca7cc26&siteId=26&type=google
```

Verified product row:

- Title: Epson Cyan T44J2 - 700 ml blaekpatron
- Product URL: https://www.grafisk-handel.dk/shop/epson-cyan-t44j2-9732p.html
- EAN / GTIN: 8715946668031
- SKU / MPN: C13T44J240
- Price: 2039,68 DKK
- Shipping: 43,75 DKK
- Availability: in stock
- Brand in feed: Epsonblaek
- Product type: Epson SureColor P7500
- Compatibility label: Epson SureColor P7500, Epson SureColor P9500

Import mapping:

| Google feed field | Internal field |
| --- | --- |
| `g:gtin` | `ean` |
| `title` | `product_title` |
| `g:price` | `price` + `currency` |
| `link` | `product_url` |
| `g:image_link` | `image_url` |
| `g:availability` | `stock_status` |
| `g:shipping/g:price` | `shipping_cost` |
| `g:custom_label_2` | `delivery_time` |
| `g:mpn` | optional metadata only, never matching |

Important:

`g:mpn` / SKU `C13T44J240` is stored only as metadata. It must never be used to match products.

