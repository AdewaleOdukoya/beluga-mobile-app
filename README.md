# Beluga Store: mobile app

The Expo (React Native) app for Beluga Global Concepts. It uses the same Next.js API and Supabase project as the web store at https://beluga-global-concepts.vercel.app.

- **Tabs:** Home, Shop, Deals, Cart (with badge), Account
- **Screens:** product detail with reviews, checkout (prices come from the server), order confirmation and history, order tracking, wishlist, recently viewed, brands, about, contact, FAQ, delivery details
- **Sign-in:** email and password, or Google through the system browser. The cart and wishlist sync with the web account, like on the website.

## Run on a phone (Expo Go)

```bash
npm install
npx expo start          # scan the QR code with the iPhone Camera (Expo Go must be installed)
```

## Build

```bash
npx eas-cli login
npx eas-cli build -p android --profile preview   # installable APK
npx eas-cli build -p ios --profile production    # needs an Apple Developer account
```

## How the app uses the API

| Endpoint | Used for |
| --- | --- |
| `GET /api/catalog` | categories, brands, delivery/payment methods, store info, Supabase public config |
| `GET /api/products?category=&brand=&q=&sort=&page=` | shop listing, search, filters |
| `GET /api/products?ids=` / `?slugs=` | wishlist, recently viewed |
| `GET /api/products/:slug` | product, reviews, related products |
| `POST /api/orders/quote`, `POST /api/orders` | checkout |
| `GET /api/orders/:id` | order confirmation and detail |
| `POST /api/orders/track`, `/api/reviews`, `/api/contact` | tracking, reviews, contact form |

Signed-in requests send `Authorization: Bearer <supabase access token>`. Google sign-in returns through the web's `/auth/callback?app=<deep link>`, which passes the one-time code back to the app.
