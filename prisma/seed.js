import pg from 'pg';

// Using your confirmed, live production direct database URL
const connectionString = "postgresql://postgres.ucoktkheabwfkrgdwtfk:N1lvee_Cyber_Agency_Prod_2026_Secure_Key@://supabase.com";

const pool = new pg.Pool({ connectionString });

const agencyServices = [
  { name: 'Web Development', slug: 'web-development', description: 'High-performance, accessible, and responsive modern web applications.' },
  { name: 'Backend Development', slug: 'backend-development', description: 'Robust, production-ready RESTful and event-driven microservices.' },
  { name: 'Mobile Development', slug: 'mobile-development', description: 'Cross-platform and native high-fidelity application development.' },
  { name: 'Cloud Engineering', slug: 'cloud-engineering', description: 'Secure, resilient cloud-native infrastructure automation.' },
  { name: 'DevOps', slug: 'devops', description: 'Streamlined continuous integration and automated deployment topologies.' },
  { name: 'DevSecOps', slug: 'devsecops', description: 'Automated continuous vulnerability analysis and compliance scanning.' },
  { name: 'Cybersecurity', slug: 'cybersecurity', description: 'Comprehensive threat modeling, auditing, and server hardening.' },
  { name: 'Custom Software Development', slug: 'custom-software-development', description: 'Bespoke, enterprise-grade application software frameworks.' }
];

async function seed() {
  console.log('🌱 Initializing safe database data seeding sequence...');
  const client = await pool.connect();
  
  try {
    // Basic test to verify communication with the Supabase cluster
    await client.query('SELECT 1');
    console.log('📡 Connected to Supabase securely.');

    for (const service of agencyServices) {
      // Direct PostgreSQL UPSERT syntax to safely handle existing data idempotently
      await client.query(`
        INSERT INTO services (id, name, slug, description, "isActive", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, true, NOW(), NOW())
        ON CONFLICT (slug) 
        DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, "updatedAt" = NOW();
      `, [service.name, service.slug, service.description]);
      
      console.log(` ✅ Synchronized service entry: [${service.slug}]`);
    }
    
    console.log('🏁 Data seeding phase concluded successfully.');
  } catch (error) {
    console.error('❌ Data seeding operation encountered an exception:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
