import pg from 'pg';

// FIXED: Clean configuration keys containing the isolated connection profiles with zero URL strings or typos
const pool = new pg.Pool({
  user: 'postgres.ucoktkheabwfkrgdwtfk',
  password: 'N1lvee_Cyber_Agency_Prod_2026_Secure_Key',
  host: 'aws-0-eu-central-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

const agencyServices = [
  { name: 'Web Development', slug: 'web-development', description: 'High-performance, accessible, and responsive modern web applications optimized for speed and semantic structural layout.' },
  { name: 'Backend Development', slug: 'backend-development', description: 'Robust, production-ready RESTful and event-driven microservices engineered with strict data integrity profiles and optimized connection layers.' },
  { name: 'Mobile Development', slug: 'mobile-development', description: 'Cross-platform and native high-fidelity application development delivering seamless interfaces and low-latency offline synchronization.' },
  { name: 'Cloud Engineering', slug: 'cloud-engineering', description: 'Secure, resilient cloud-native infrastructure automation leveraging optimized architectures, dynamic auto-scaling networks, and immutable infrastructure patterns.' },
  { name: 'DevOps', slug: 'devops', description: 'Streamlined continuous integration and automated deployment topologies built to drive deployment velocity while maintaining container runtime isolation constraints.' },
  { name: 'DevSecOps', slug: 'devsecops', description: 'Automated continuous vulnerability analysis and compliance scanning engine configurations hardcoded directly throughout delivery lifecycles.' },
  { name: 'Cybersecurity', slug: 'cybersecurity', description: 'Comprehensive static analysis threat modeling, structural perimeter defense auditing, cryptographic validation configurations, and server hardening controls.' },
  { name: 'Custom Software Development', slug: 'custom-software-development', description: 'Bespoke, enterprise-grade application software frameworks tailored carefully to solve intricate organizational workflows with zero technical bloat.' }
];

async function seed() {
  console.log('🌱 Initializing safe configuration data seeding sequence...');
  let client;
  try {
    client = await pool.connect();
    console.log('📡 Connected directly to Supabase cloud cluster securely over port 5432.');

    for (const service of agencyServices) {
      await client.query(`
        INSERT INTO services (id, name, slug, description, "isActive", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, true, NOW(), NOW())
        ON CONFLICT (slug) 
        DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, "updatedAt" = NOW();
      `, [service.name, service.slug, service.description]);
      
      console.log(`  ✅ Synchronized service entry: [${service.slug}]`);
    }
    
    console.log('🏁 Data seeding phase concluded successfully.');
  } catch (error) {
    console.error('❌ Data seeding operation encountered an exception:', error);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

seed();
