import { faker } from '@faker-js/faker';
import { User, makeUserId } from './User.type';

// Set a fixed seed to ensure consistent generation between server and client
// This prevents hydration errors in Next.js
faker.seed(123);

/**
 * Generates a random user ID with the specified prefix
 */
export function generateUserId(): ReturnType<typeof makeUserId> {
  return makeUserId(`usr_${faker.string.alphanumeric(10)}`);
}

/**
 * Generate a single random user with realistic data
 */
export function generateUser(): User {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  
  return {
    id: generateUserId(),
    name: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    status: faker.helpers.arrayElement(['active', 'inactive', 'pending']),
    role: faker.helpers.arrayElement(['admin', 'user', 'editor']),
    lastLogin: faker.date.recent({ days: 30 }).toISOString(),
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    notes: faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.7 }),
    subscribed: faker.datatype.boolean(),
  };
}

/**
 * Generate multiple users with realistic data
 * @param count Number of users to generate
 */
export function generateUsers(count: number = 10): User[] {
  return Array.from({ length: count }, () => generateUser());
}

/**
 * Sample users for testing and demonstration
 * Fixed set for consistent server/client rendering
 */
export const sampleUsers: User[] = [
  {
    id: makeUserId('usr_abcde12345'),
    name: 'John Doe',
    email: 'john.doe@example.com',
    status: 'active',
    role: 'admin',
    lastLogin: '2023-10-15T08:30:00.000Z',
    createdAt: '2022-05-10T12:00:00.000Z',
    notes: 'Lead developer and administrator',
    subscribed: true,
  },
  {
    id: makeUserId('usr_fghij67890'),
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    status: 'active',
    role: 'user',
    lastLogin: '2023-10-14T15:45:00.000Z',
    createdAt: '2022-06-22T09:15:00.000Z',
    notes: 'Marketing specialist',
    subscribed: true,
  },
  {
    id: makeUserId('usr_klmno12345'),
    name: 'Robert Johnson',
    email: 'robert.j@example.com',
    status: 'inactive',
    role: 'editor',
    lastLogin: '2023-09-05T11:20:00.000Z',
    createdAt: '2022-04-18T14:30:00.000Z',
    notes: undefined,
    subscribed: false,
  },
  {
    id: makeUserId('usr_pqrst67890'),
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    status: 'pending',
    role: 'user',
    lastLogin: '2023-10-10T09:00:00.000Z',
    createdAt: '2023-01-05T16:45:00.000Z',
    notes: 'New hire in the design department',
    subscribed: true,
  },
  {
    id: makeUserId('usr_uvwxy12345'),
    name: 'Michael Wilson',
    email: 'michael.w@example.com',
    status: 'active',
    role: 'editor',
    lastLogin: '2023-10-16T14:10:00.000Z',
    createdAt: '2022-08-30T10:20:00.000Z',
    notes: 'Content editor for the blog section',
    subscribed: true,
  }
]; 