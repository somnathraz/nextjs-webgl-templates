export const services = [
  {
    name: 'The signature cut',
    category: 'Cut & style',
    price: 1800,
    minutes: 60,
    description:
      'A proper conversation, a considered cut, and a finish that feels like you.',
  },
  {
    name: 'Colour, your way',
    category: 'Colour',
    price: 4500,
    minutes: 150,
    description:
      'Dimensional colour, soft highlights, or something a little unexpected. Consultation included.',
  },
  {
    name: 'The good-hair blowout',
    category: 'Cut & style',
    price: 1200,
    minutes: 45,
    description:
      'Soft movement, a little volume, and somewhere good to go afterwards.',
  },
  {
    name: 'The reset ritual',
    category: 'Care',
    price: 2200,
    minutes: 75,
    description:
      'Scalp care, a restorative mask, and an unhurried moment just for you.',
  },
];
export const stylists = [
  { name: 'Any stylist', role: 'First available', photo: '' },
  {
    name: 'Anya',
    role: 'Cuts & natural texture',
    photo: 'photo-1580618672591-eb180b1a973f',
  },
  {
    name: 'Rhea',
    role: 'Colour & lived-in blondes',
    photo: 'photo-1524504388940-b1c1722653e1',
  },
  {
    name: 'Dev',
    role: 'Short cuts & precision',
    photo: 'photo-1500648767791-00dcc994a43e',
  },
];
export const photo = (id: string, width = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
export const money = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
