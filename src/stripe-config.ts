export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
  price: number;
  currency: string;
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1TCO3mFF8IeKPbPgapdbhoy7',
    name: 'Starter',
    description: 'Perfect for freelancers just getting started',
    mode: 'subscription',
    price: 9.00,
    currency: 'usd'
  },
  {
    priceId: 'price_1TCO4GFF8IeKPbPganzhGOa7',
    name: 'Pro',
    description: 'For active freelancers managing multiple clients',
    mode: 'subscription',
    price: 19.00,
    currency: 'usd'
  },
  {
    priceId: 'price_1TCO4pFF8IeKPbPgaJurFTxh',
    name: 'Agency',
    description: 'For growing agencies with large client rosters',
    mode: 'subscription',
    price: 39.00,
    currency: 'usd'
  }
];