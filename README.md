# Money Manager

A simple personal finance dashboard built with Next.js, Tailwind CSS, and Supabase.

This app helps you track your balance, manage wishlist items, and log transactions with a clean mobile-first interface.

## Features

- Dashboard with current balance and safe threshold tracking
- Wishlist page with:
  - add new wishlist items
  - instant local UI updates after adding an item
  - purchase analytics before buying
  - convert wishlist items into transactions
- Transaction history page with delete confirmation
- Skeleton loading states for better perceived performance

## Tech Stack

- Next.js App Router
- React client components
- Tailwind CSS
- Supabase for authentication and data storage

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- Visit the home dashboard to see your current balance and safe threshold.
- Go to the wishlist page to add or manage wishlist items.
- Select a wishlist item to review purchase impact and complete the purchase.
- Use the transactions page to review history and delete entries safely.

## Important Behavior

- Newly added wishlist items appear immediately in the UI using the same Supabase row id returned from the database.
- This allows purchase actions to work without a manual refresh.
- Purchased wishlist items are marked as `Purchased` and cannot be re-opened.

## Deployment

Deploy to Vercel or any platform that supports Next.js.

For more deployment details, see:

- https://nextjs.org/docs/app/building-your-application/deploying

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
