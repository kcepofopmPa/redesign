import { Car } from './types';

export const MOCK_CARS: Car[] = [
  {
    id: '1',
    make: 'Porsche',
    model: 'Taycan Turbo S',
    year: 2024,
    price: 185000,
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1000',
    specs: {
      acceleration: '2.4s 0-60',
      power: '750 hp',
      range: '222 mi',
      drive: 'AWD',
      miles: '1,200 km'
    },
    tags: ['New Arrival', 'Electric'],
    featured: true
  },
  {
    id: '2',
    make: 'Audi',
    model: 'RS7 Sportback',
    year: 2023,
    price: 124500,
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=1000',
    specs: {
      miles: '12,400 km',
      engine: 'Gasoline',
      drive: 'Quattro'
    },
    tags: []
  },
  {
    id: '3',
    make: 'Tesla',
    model: 'Model X Plaid',
    year: 2024,
    price: 108000,
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1000',
    specs: {
      miles: '5,000 km',
      engine: 'Electric',
      drive: 'AWD'
    },
    tags: ['Price Drop']
  },
  {
    id: '4',
    make: 'Lumina',
    model: 'GTS',
    year: 2024,
    price: 124900,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000',
    specs: {
      range: '420 mi',
      acceleration: '2.4s',
      power: '780 hp'
    },
    tags: ['New Arrival']
  },
  {
    id: '5',
    make: 'Phantom',
    model: 'X',
    year: 2023,
    price: 89000,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1000',
    specs: {
      miles: '12k mi',
      engine: 'Hybrid V6'
    },
    tags: ['Price Drop']
  }
];
