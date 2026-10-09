const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

const seedData = async () => {
  try {
    console.log('🌱 Starting Database Seeding...');
    await db.initDb();

    // 1. Clear existing sample data
    console.log('🧹 Clearing previous table records...');
    await db.query('DELETE FROM complaint_history');
    await db.query('DELETE FROM complaints');
    await db.query('DELETE FROM notices');
    await db.query('DELETE FROM users');

    // 2. Hash passwords
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const residentPasswordHash = await bcrypt.hash('Resident@123', 10);

    // 3. Create Users
    console.log('👤 Creating Users (1 Admin, 3 Residents)...');
    const adminRes = await db.query(
      `INSERT INTO users (name, email, password_hash, role, phone, flat_number, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id`,
      ['Society Administrator', 'admin@example.com', adminPasswordHash, 'admin', '+1-555-0100', 'Management Office A-101']
    );
    const adminId = adminRes.rows[0].id;

    const resident1Res = await db.query(
      `INSERT INTO users (name, email, password_hash, role, phone, flat_number, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id`,
      ['John Doe', 'john@example.com', residentPasswordHash, 'resident', '+1-555-0101', 'Tower B - Flat 402']
    );
    const resident1Id = resident1Res.rows[0].id;

    const resident2Res = await db.query(
      `INSERT INTO users (name, email, password_hash, role, phone, flat_number, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id`,
      ['Sarah Jenkins', 'sarah@example.com', residentPasswordHash, 'resident', '+1-555-0102', 'Tower A - Flat 701']
    );
    const resident2Id = resident2Res.rows[0].id;

    const resident3Res = await db.query(
      `INSERT INTO users (name, email, password_hash, role, phone, flat_number, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id`,
      ['Rahul Sharma', 'rahul@example.com', residentPasswordHash, 'resident', '+1-555-0103', 'Tower C - Flat 204']
    );
    const resident3Id = resident3Res.rows[0].id;

    console.log('✅ Users created.');

    // 4. Create Complaints with timestamps (including overdue > 3 days old)
    console.log('📋 Creating Diverse Maintenance Complaints...');

    // Helper to calculate past ISO timestamps
    const daysAgo = (days) => {
      const d = new Date();
      d.setDate(d.getDate() - days);
      return d.toISOString();
    };

    const sampleComplaints = [
      {
        resident_id: resident1Id,
        category: 'Plumbing',
        title: 'Severe pipeline leakage in master bathroom',
        description: 'Persistent water seepage from the main line behind the bathroom wall causing dampness and foul smell.',
        photo_url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&auto=format&fit=crop&q=60',
        status: 'Open',
        priority: 'High',
        created_at: daysAgo(5), // OVERDUE (5 days old, threshold is 3)
        history: [
          { prev: null, next: 'Open', note: 'Complaint submitted by resident with urgent photo', actor: resident1Id, days: 5 }
        ]
      },
      {
        resident_id: resident2Id,
        category: 'Lift/Elevator',
        title: 'Tower A Passenger Lift 2 making screeching sound',
        description: 'The lift jerks abruptly before stopping at floors 5 through 8 and emits loud grinding noise.',
        photo_url: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=800&auto=format&fit=crop&q=60',
        status: 'In Progress',
        priority: 'High',
        created_at: daysAgo(4), // OVERDUE (4 days old and unresolved)
        history: [
          { prev: null, next: 'Open', note: 'Complaint raised by resident', actor: resident2Id, days: 4 },
          { prev: 'Open', next: 'In Progress', note: 'Technician dispatched from Otis Elevator team for emergency inspection', actor: adminId, days: 3 }
        ]
      },
      {
        resident_id: resident1Id,
        category: 'Electrical',
        title: 'Corridor lights flickering on 4th floor Tower B',
        description: '3 tube lights in the common hallway are blinking rapidly creating a hazard in the evening.',
        photo_url: null,
        status: 'In Progress',
        priority: 'Medium',
        created_at: daysAgo(2), // Active, not overdue
        history: [
          { prev: null, next: 'Open', note: 'Complaint created', actor: resident1Id, days: 2 },
          { prev: 'Open', next: 'In Progress', note: 'Electrician assigned with replacement LED fixtures', actor: adminId, days: 1 }
        ]
      },
      {
        resident_id: resident3Id,
        category: 'Security',
        title: 'Visitor gate boom barrier sensor malfunctioning',
        description: 'The RFID automatic boom barrier at Gate 2 opens erratically and fails to register resident tags.',
        photo_url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=60',
        status: 'Open',
        priority: 'Medium',
        created_at: daysAgo(1), // Active, not overdue
        history: [
          { prev: null, next: 'Open', note: 'Complaint logged by resident', actor: resident3Id, days: 1 }
        ]
      },
      {
        resident_id: resident2Id,
        category: 'Cleaning',
        title: 'Basement Parking level 1 garbage accumulation',
        description: 'Debris left behind after renovation near slot B-18. Requires immediate deep cleaning.',
        photo_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=60',
        status: 'Resolved',
        priority: 'Low',
        created_at: daysAgo(6),
        resolved_at: daysAgo(3),
        history: [
          { prev: null, next: 'Open', note: 'Complaint created', actor: resident2Id, days: 6 },
          { prev: 'Open', next: 'In Progress', note: 'Janitorial staff assigned to clear rubble', actor: adminId, days: 5 },
          { prev: 'In Progress', next: 'Resolved', note: 'Basement parking area cleaned and sanitized thoroughly', actor: adminId, days: 3 }
        ]
      },
      {
        resident_id: resident3Id,
        category: 'Water Supply',
        title: 'Low water pressure in kitchen faucet',
        description: 'Water pressure dropped significantly on 2nd floor since yesterday morning.',
        photo_url: null,
        status: 'Resolved',
        priority: 'Medium',
        created_at: daysAgo(8),
        resolved_at: daysAgo(7),
        history: [
          { prev: null, next: 'Open', note: 'Complaint logged', actor: resident3Id, days: 8 },
          { prev: 'Open', next: 'In Progress', note: 'Plumber inspected overhead booster pump', actor: adminId, days: 7 },
          { prev: 'In Progress', next: 'Resolved', note: 'Pump valve serviced and pressure restored across line', actor: adminId, days: 7 }
        ]
      },
      {
        resident_id: resident1Id,
        category: 'Common Area',
        title: 'Clubhouse gym treadmill display error',
        description: 'Treadmill #2 displays Error 05 and halts abruptly during workouts.',
        photo_url: null,
        status: 'Open',
        priority: 'Low',
        created_at: daysAgo(1),
        history: [
          { prev: null, next: 'Open', note: 'Complaint filed by resident', actor: resident1Id, days: 1 }
        ]
      }
    ];

    for (const comp of sampleComplaints) {
      const compRes = await db.query(
        `INSERT INTO complaints (
          resident_id, category, title, description, photo_url, status, priority, created_at, updated_at, resolved_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, $9)
        RETURNING id`,
        [
          comp.resident_id,
          comp.category,
          comp.title,
          comp.description,
          comp.photo_url,
          comp.status,
          comp.priority,
          comp.created_at,
          comp.resolved_at || null
        ]
      );

      const compId = compRes.rows[0].id;

      for (const h of comp.history) {
        await db.query(
          `INSERT INTO complaint_history (complaint_id, previous_status, new_status, note, actor_id, created_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [compId, h.prev, h.next, h.note, h.actor, daysAgo(h.days)]
        );
      }
    }
    console.log(`✅ ${sampleComplaints.length} sample complaints and audit histories inserted.`);

    // 5. Create Society Notices
    console.log('📢 Creating Society Notices (Pinned Important & Regular)...');

    const sampleNotices = [
      {
        title: '⚠️ Scheduled Overhead Water Tank Cleaning & Supply Halt',
        content: `Please be advised that annual maintenance and sanitization of the overhead and underground water tanks will take place this Thursday from 9:00 AM to 4:00 PM.\n\nWater supply will be suspended during these hours across all towers. Residents are requested to store sufficient water in advance. We regret any inconvenience caused.`,
        is_important: 1,
        created_by: adminId,
        created_at: daysAgo(1)
      },
      {
        title: '📢 Annual General Body Meeting (AGM) - Save the Date',
        content: `The Annual General Body Meeting of the Society is scheduled for Sunday, 30th August at 10:30 AM in the Clubhouse Main Hall.\n\nAgenda items include:\n1. Audited accounts presentation for FY 2025-26\n2. Security automation upgrades\n3. Solar rooftop installation proposal\n\nAll homeowners are requested to attend.`,
        is_important: 1,
        created_by: adminId,
        created_at: daysAgo(3)
      },
      {
        title: '🚗 EV Charging Station Bay Guidelines & Etiquette',
        content: `Residents utilizing the newly installed EV charging stations in Basement Parking B-2 are requested to move their vehicles promptly once 100% charged to allow other residents access. Standard tariff applies via the society smart card.`,
        is_important: 0,
        created_by: adminId,
        created_at: daysAgo(4)
      },
      {
        title: '🌿 Monsoon Pest Control & Fogging Schedule',
        content: `Vector control and mosquito fogging will be conducted every Tuesday and Friday evening between 6:00 PM and 7:30 PM across garden perimeters, podiums, and basement areas. Kindly keep balcony windows closed during fogging.`,
        is_important: 0,
        created_by: adminId,
        created_at: daysAgo(6)
      }
    ];

    for (const notice of sampleNotices) {
      await db.query(
        `INSERT INTO notices (title, content, is_important, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $5)`,
        [notice.title, notice.content, notice.is_important, notice.created_by, notice.created_at]
      );
    }
    console.log(`✅ ${sampleNotices.length} notices created.`);

    console.log('=======================================================');
    console.log('🎉 Database seeding completed successfully!');
    console.log('-------------------------------------------------------');
    console.log('🔑 DEMO LOGIN CREDENTIALS:');
    console.log('👑 Admin Account:');
    console.log('   Email:    admin@example.com');
    console.log('   Password: Admin@123');
    console.log('   Role:     admin');
    console.log('');
    console.log('🏡 Resident Accounts:');
    console.log('   1) john@example.com   (Password: Resident@123)');
    console.log('   2) sarah@example.com  (Password: Resident@123)');
    console.log('   3) rahul@example.com  (Password: Resident@123)');
    console.log('=======================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    process.exit(1);
  }
};

seedData();
