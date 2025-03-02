import { faker } from '@faker-js/faker';
import { ExampleType, ExampleId, NewExampleType } from '@/features/example/types/example.type';

// Set a fixed seed to ensure consistent generation between server and client
// This prevents hydration errors in Next.js
faker.seed(456);

/**
 * Generates a random example ID with a specified prefix
 */
export function generateExampleId(): string & typeof ExampleId.Type {
  return `ex_${faker.string.alphanumeric(10)}` as string & typeof ExampleId.Type;
}

/**
 * Generate a single random example with realistic data
 */
export function generateExample(): ExampleType {
  const createdAt = faker.date.past({ years: 1 });
  const updatedAt = faker.date.between({ from: createdAt, to: new Date() });
  
  // 20% chance of having a deletedAt date
  const deletedAt = faker.helpers.maybe(
    () => faker.date.between({ from: updatedAt, to: new Date() }),
    { probability: 0.2 }
  ) || null;
  
  return {
    id: generateExampleId(),
    title: faker.helpers.maybe(() => faker.lorem.sentence({ min: 3, max: 8 }), { probability: 0.9 }) || null,
    subtitle: faker.helpers.maybe(() => faker.lorem.sentence({ min: 5, max: 15 }), { probability: 0.7 }) || null,
    content: faker.helpers.maybe(() => faker.lorem.paragraphs({ min: 1, max: 5 }), { probability: 0.8 }) || null,
    createdAt,
    updatedAt,
    deletedAt,
  };
}

/**
 * Generate a single new example (without id and timestamps)
 */
export function generateNewExample(): NewExampleType {
  return {
    title: faker.helpers.maybe(() => faker.lorem.sentence({ min: 3, max: 8 }), { probability: 0.9 }) || null,
    subtitle: faker.helpers.maybe(() => faker.lorem.sentence({ min: 5, max: 15 }), { probability: 0.7 }) || null,
    content: faker.helpers.maybe(() => faker.lorem.paragraphs({ min: 1, max: 5 }), { probability: 0.8 }) || null,
  };
}

/**
 * Generate multiple examples with realistic data
 * @param count Number of examples to generate
 */
export function generateExamples(count: number = 10): ExampleType[] {
  return Array.from({ length: count }, () => generateExample());
}

/**
 * Sample examples for testing and demonstration
 * Fixed set for consistent server/client rendering
 */
export const sampleExamples: ExampleType[] = [
  {
    id: 'ex_abcde12345' as string & typeof ExampleId.Type,
    title: 'Getting Started with Effect TS',
    subtitle: 'A beginner-friendly introduction to Effect TS and its ecosystem',
    content: 'Effect TS is a powerful functional programming library for TypeScript that provides a unified way to handle synchronous and asynchronous computations, along with error handling and resource management. This guide will walk you through the basics...',
    createdAt: new Date('2023-08-15T09:30:00.000Z'),
    updatedAt: new Date('2023-09-05T14:15:00.000Z'),
    deletedAt: null,
  },
  {
    id: 'ex_fghij67890' as string & typeof ExampleId.Type,
    title: 'Building CRUD Applications',
    subtitle: 'Best practices for creating data-driven applications',
    content: 'Creating robust CRUD (Create, Read, Update, Delete) applications requires careful planning and proper architecture. In this article, we explore patterns for building maintainable and scalable data-driven applications...',
    createdAt: new Date('2023-06-22T11:45:00.000Z'),
    updatedAt: new Date('2023-07-10T16:20:00.000Z'),
    deletedAt: null,
  },
  {
    id: 'ex_klmno12345' as string & typeof ExampleId.Type,
    title: 'Advanced Form Validation',
    subtitle: null,
    content: 'Form validation is a critical aspect of any web application. This guide covers advanced techniques for client-side and server-side validation, including schema-based approaches and real-time feedback...',
    createdAt: new Date('2023-04-18T08:00:00.000Z'),
    updatedAt: new Date('2023-05-02T10:30:00.000Z'),
    deletedAt: new Date('2023-09-15T12:00:00.000Z'),
  },
  {
    id: 'ex_pqrst67890' as string & typeof ExampleId.Type,
    title: null,
    subtitle: 'Draft article about React performance optimization',
    content: null,
    createdAt: new Date('2023-10-01T15:25:00.000Z'),
    updatedAt: new Date('2023-10-01T15:25:00.000Z'),
    deletedAt: null,
  },
  {
    id: 'ex_uvwxy12345' as string & typeof ExampleId.Type,
    title: 'UI Design Principles',
    subtitle: 'Creating intuitive and accessible example interfaces',
    content: 'Good UI design follows certain principles that enhance example experience and accessibility. This article explores key design principles including consistency, hierarchy, feedback, and accessibility compliance...',
    createdAt: new Date('2023-05-10T13:40:00.000Z'),
    updatedAt: new Date('2023-08-23T09:15:00.000Z'),
    deletedAt: null,
  }
];
