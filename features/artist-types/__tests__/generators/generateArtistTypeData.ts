import { faker } from '@faker-js/faker';
import { ArtistTypeId, ArtistTypeType, NewArtistTypeType, BlogType } from '@/features/artist-types/types/artist-type.type';

// Set a fixed seed to ensure consistent generation between server and client
// This prevents hydration errors in Next.js
faker.seed(789);

/**
 * Generate a random artist type ID with a given prefix
 */
export function generateArtistTypeId(): string & typeof ArtistTypeId.Type {
  return `art_${faker.string.alphanumeric(10)}` as string & typeof ArtistTypeId.Type;
}

/**
 * Generate a random blog for an artist type
 */
export function generateBlog(): BlogType {
  const publishDate = faker.helpers.maybe(() => faker.date.past(), { probability: 0.8 });
  
  return {
    title: faker.helpers.maybe(() => faker.lorem.sentence({ min: 3, max: 8 }), { probability: 0.9 }) || null,
    content: faker.helpers.maybe(() => faker.lorem.paragraphs({ min: 1, max: 3 }), { probability: 0.8 }) || null,
    author: faker.helpers.maybe(() => faker.person.fullName(), { probability: 0.75 }) || null,
    publishDate: publishDate || null,
    tags: faker.helpers.maybe(() => faker.helpers.arrayElements(
      ['tutorial', 'showcase', 'interview', 'tips', 'history', 'technique', 'resources'], 
      faker.number.int({ min: 1, max: 4 })
    ), { probability: 0.6 }) || null,
  };
}

/**
 * Generate a single random artist type with realistic data
 */
export function generateArtistType(): ArtistTypeType {
  // Generate timestamps in chronological order
  const createdAt = faker.date.past();
  const updatedAt = faker.date.between({ from: createdAt, to: new Date() });
  const deletedAt = faker.helpers.maybe(() => faker.date.between({ from: updatedAt, to: new Date() }), { probability: 0.2 }) || null;
  
  // Generate blog content
  const blog = faker.helpers.maybe(() => generateBlog(), { probability: 0.6 }) || null;
  
  // Generate a random array of tags
  const tags = faker.helpers.maybe(() => faker.helpers.arrayElements(
    ['traditional', 'digital', 'mixed-media', 'illustration', 'animation', 'sculpture', 'photography', 'performance', 'conceptual', 'abstract', 'realistic', 'commercial', 'fine-art'], 
    faker.number.int({ min: 1, max: 5 })
  ), { probability: 0.8 }) || null;
  
  // Generate metadata (simple object with example properties)
  const metadata = faker.helpers.maybe(() => ({
    difficulty: faker.helpers.arrayElement(['beginner', 'intermediate', 'advanced']),
    popularity: faker.number.int({ min: 1, max: 100 }),
    avgSalary: faker.number.int({ min: 30000, max: 120000 }),
    keyFigures: faker.helpers.arrayElements(
      ['Leonardo da Vinci', 'Frida Kahlo', 'Pablo Picasso', 'Georgia O\'Keeffe', 'Andy Warhol', 'Salvador Dalí', 'Yayoi Kusama', 'Jean-Michel Basquiat', 'Banksy', 'Ai Weiwei'],
      faker.number.int({ min: 0, max: 4 })
    )
  }), { probability: 0.7 }) || null;
  
  return {
    id: generateArtistTypeId(),
    title: faker.commerce.productName(),
    subtitle: faker.helpers.maybe(() => faker.company.catchPhrase(), { probability: 0.9 }) || null,
    elevatorPitch: faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.8 }) || null,
    description: faker.helpers.maybe(() => faker.lorem.paragraphs(3), { probability: 0.8 }) || null,
    blog,
    tags,
    icon: faker.helpers.maybe(() => `/icons/${faker.helpers.slugify(faker.word.noun())}.svg`, { probability: 0.6 }) || null,
    metadata,
    notes: faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.5 }) || null,
    version: faker.helpers.maybe(() => faker.number.float({ min: 1.0, max: 5.0, fractionDigits: 1 }), { probability: 0.75 }) || null,
    createdAt,
    updatedAt,
    deletedAt,
  };
}

/**
 * Generate a new artist type (without id and timestamps)
 */
export function generateNewArtistType(): NewArtistTypeType {
  // Generate blog content
  const blog = faker.helpers.maybe(() => generateBlog(), { probability: 0.6 }) || null;
  
  // Generate a random array of tags
  const tags = faker.helpers.maybe(() => faker.helpers.arrayElements(
    ['traditional', 'digital', 'mixed-media', 'illustration', 'animation', 'sculpture', 'photography', 'performance', 'conceptual', 'abstract', 'realistic', 'commercial', 'fine-art'], 
    faker.number.int({ min: 1, max: 5 })
  ), { probability: 0.8 }) || null;
  
  // Generate metadata (simple object with example properties)
  const metadata = faker.helpers.maybe(() => ({
    difficulty: faker.helpers.arrayElement(['beginner', 'intermediate', 'advanced']),
    popularity: faker.number.int({ min: 1, max: 100 }),
    avgSalary: faker.number.int({ min: 30000, max: 120000 }),
    keyFigures: faker.helpers.arrayElements(
      ['Leonardo da Vinci', 'Frida Kahlo', 'Pablo Picasso', 'Georgia O\'Keeffe', 'Andy Warhol', 'Salvador Dalí', 'Yayoi Kusama', 'Jean-Michel Basquiat', 'Banksy', 'Ai Weiwei'],
      faker.number.int({ min: 0, max: 4 })
    )
  }), { probability: 0.7 }) || null;
  
  return {
    title: faker.commerce.productName(),
    subtitle: faker.helpers.maybe(() => faker.company.catchPhrase(), { probability: 0.9 }) || null,
    elevatorPitch: faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.8 }) || null,
    description: faker.helpers.maybe(() => faker.lorem.paragraphs(3), { probability: 0.8 }) || null,
    blog,
    tags,
    icon: faker.helpers.maybe(() => `/icons/${faker.helpers.slugify(faker.word.noun())}.svg`, { probability: 0.6 }) || null,
    metadata,
    notes: faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.5 }) || null,
    version: faker.helpers.maybe(() => faker.number.float({ min: 1.0, max: 5.0, fractionDigits: 1 }), { probability: 0.75 }) || null,
  };
}

/**
 * Generate multiple artist types
 */
export function generateArtistTypes(count: number = 10): ArtistTypeType[] {
  return Array.from({ length: count }, () => generateArtistType());
}

/**
 * Provide a fixed set of sample artist types (for testing and demos)
 * This ensures consistent server/client rendering
 */
export const sampleArtistTypes: ArtistTypeType[] = [
  {
    id: 'art_abcde12345' as string & typeof ArtistTypeId.Type,
    title: 'Digital Concept Artist',
    subtitle: 'Visionaries of Imaginary Worlds',
    elevatorPitch: 'Digital concept artists create visual representations of ideas, characters, and environments for films, video games, and other media, bringing imaginative worlds to life before they\'re produced.',
    description: 'Concept artists develop the visual language for films, games, and other media productions. They visualize characters, environments, props, and key moments, establishing the aesthetic foundation that guides other production artists. Working primarily in digital media, they combine technical skill with creative vision to translate written descriptions into compelling visuals that inform the entire production process.',
    blog: null,
    tags: ['digital', 'concept-art', 'entertainment'],
    icon: '/icons/digital-concept.svg',
    metadata: {
      difficulty: 'intermediate',
      popularity: 85,
      avgSalary: 75000,
      keyFigures: ['Craig Mullins', 'Feng Zhu', 'Sparth']
    },
    notes: 'High demand field with strong growth projection in entertainment industries. Consider focused workshops on industry software.',
    version: 2.4,
    createdAt: new Date('2023-05-12T09:30:00.000Z'),
    updatedAt: new Date('2023-08-28T14:15:00.000Z'),
    deletedAt: null
  },
  {
    id: 'art_fghij67890' as string & typeof ArtistTypeId.Type,
    title: 'Ceramic Sculptor',
    subtitle: 'Masters of Form and Fire',
    elevatorPitch: 'Ceramic sculptors transform clay into artistic expressions through hand-building, wheel-throwing, and firing techniques, creating both functional and purely aesthetic pieces.',
    description: 'Ceramic sculpture encompasses a wide range of practices that manipulate clay to create three-dimensional artworks. Artists may use hand-building techniques like coiling, slab construction, and pinching, or utilize the potter\'s wheel for components. The transformation of clay through firing, glazing, and surface treatments is integral to the process, requiring technical knowledge of materials and chemical reactions.',
    blog: {
      title: 'Understanding Clay Bodies for Sculptural Work',
      content: 'The choice of clay body significantly impacts both the working properties and final appearance of ceramic sculptures. This guide examines different types of clay bodies—from porcelain to stoneware to raku—and discusses their suitability for various sculptural applications.',
      author: 'Michael Chen',
      publishDate: new Date('2023-04-18T12:00:00.000Z'),
      tags: ['ceramics', 'materials', 'technical-guide']
    },
    tags: ['sculpture', 'ceramics', 'traditional'],
    icon: '/icons/ceramic-sculptor.svg',
    metadata: {
      difficulty: 'intermediate',
      popularity: 68,
      avgSalary: 54000,
      keyFigures: ['Peter Voulkos', 'Akiko Hirai', 'Beate Kuhn']
    },
    notes: 'Growing interest in workshops and community studio access. Consider developing beginner-friendly programs.',
    version: 1.7,
    createdAt: new Date('2022-11-20T13:10:00.000Z'),
    updatedAt: new Date('2023-06-05T09:50:00.000Z'),
    deletedAt: null
  },
  {
    id: 'art_pqrst67890' as string & typeof ArtistTypeId.Type,
    title: 'Performance Artist',
    subtitle: 'Embodied Expressions',
    elevatorPitch: 'Performance artists use their bodies, actions, and presence as artistic media, creating time-based works that often challenge conventions and engage directly with audiences.',
    description: null,
    blog: null,
    tags: ['performance', 'conceptual', 'political'],
    icon: null,
    metadata: null,
    notes: 'Need more research on market potential and audience development strategies.',
    version: 1.0,
    createdAt: new Date('2023-01-15T17:30:00.000Z'),
    updatedAt: new Date('2023-01-15T17:30:00.000Z'),
    deletedAt: null
  },
  {
    id: 'art_uvwxy12345' as string & typeof ArtistTypeId.Type,
    title: 'Textile Artist',
    subtitle: 'Creators in Fiber and Fabric',
    elevatorPitch: 'Textile artists work with fabrics, fibers, and related materials to create artworks that may be functional, decorative, or conceptual, employing techniques such as weaving, embroidery, quilting, and dyeing.',
    description: 'Textile art encompasses a diverse range of practices involving the manipulation of fabrics, fibers, yarns, and related materials. Techniques include weaving, knitting, embroidery, quilting, felting, dyeing, and printing, among others. Contemporary textile artists often blur the boundaries between craft, design, and fine art, addressing social, political, and environmental themes through their work while engaging with traditional techniques from global textile histories.',
    blog: {
      title: 'Sustainable Practices in Contemporary Textile Art',
      content: 'As environmental concerns become increasingly urgent, textile artists are pioneering innovative approaches to sustainable creation. This article explores eco-friendly fiber sources, natural dyeing processes, upcycling, and zero-waste design methods employed by leading textile artists today.',
      author: 'Sarah Goldstein',
      publishDate: new Date('2023-08-22T10:00:00.000Z'),
      tags: ['sustainability', 'textiles', 'eco-art']
    },
    tags: ['textile', 'fiber-art', 'mixed-media'],
    icon: '/icons/textile-artist.svg',
    metadata: {
      difficulty: 'beginner',
      popularity: 72,
      avgSalary: 48000,
      keyFigures: ['Anni Albers', 'Sheila Hicks', 'El Anatsui']
    },
    notes: null,
    version: 2.1,
    createdAt: new Date('2022-03-18T11:25:00.000Z'),
    updatedAt: new Date('2023-09-30T15:40:00.000Z'),
    deletedAt: null
  }
]; 