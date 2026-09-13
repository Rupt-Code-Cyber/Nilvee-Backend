/// <reference types="node" />
import "dotenv/config";
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// Initialize a native Node-postgres TCP connection pool matching your runtime environment strings
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Map the physical pool socket interface directly over into the Prisma adapter layer
const adapter = new PrismaPg(pool);

// Pass the adapter directly into the isolated client constructor instance for Prisma v7 compatibility
const prisma = new PrismaClient({ adapter });

const agencyServices = [
  {
    name: 'Web Development',
    slug: 'web-development',
    description: 'High-performance, accessible, and responsive modern web applications optimized for speed and semantic structural layout.',
  },
  {
    name: 'Backend Development',
    slug: 'backend-development',
    description: 'Robust, production-ready RESTful and event-driven microservices engineered with strict data integrity profiles and optimized connection layers.',
  },
  {
    name: 'Mobile Development',
    slug: 'mobile-development',
    description: 'Cross-platform and native high-fidelity application development delivering seamless interfaces and low-latency offline synchronization.',
  },
  {
    name: 'Cloud Engineering',
    slug: 'cloud-engineering',
    description: 'Secure, resilient cloud-native infrastructure automation leveraging optimized architectures, dynamic auto-scaling networks, and immutable infrastructure patterns.',
  },
  {
    name: 'DevOps',
    slug: 'devops',
    description: 'Streamlined continuous integration and automated deployment topologies built to drive deployment velocity while maintaining container runtime isolation constraints.',
  },
  {
    name: 'DevSecOps',
    slug: 'devsecops',
    description: 'Automated continuous vulnerability analysis and compliance scanning engine configurations hardcoded directly throughout delivery lifecycles.',
  },
  {
    name: 'Cybersecurity',
    slug: 'cybersecurity',
    description: 'Comprehensive static analysis threat modeling, structural perimeter defense auditing, cryptographic validation configurations, and server hardening controls.',
  },
  {
    name: 'Custom Software Development',
    slug: 'custom-software-development',
    description: 'Bespoke, enterprise-grade application software frameworks tailored carefully to solve intricate organizational workflows with zero technical bloat.',
  },
];

async function main() {
  console.log('🌱 Initializing Nilvee Service data seeding sequence...');

  for (const service of agencyServices) {
    const record = await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        name: service.name,
        description: service.description,
        isActive: true,
      },
      create: {
        name: service.name,
        slug: service.slug,
        description: service.description,
        isActive: true,
      },
    });
    console.log(` ✅ Synchronized service entry: [${record.slug}]`);
  }

  console.log('🏁 Data seeding phase concluded successfully.');
}

main()
  .catch((error) => {
    console.error('❌ Data seeding operation encountered a critical exception:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // Cleanly close the raw database socket pool loops
  });
