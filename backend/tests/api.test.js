const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const app = require('../src/app');
const db = require('../src/config/db');

let server;
let baseUrl;
let adminToken = '';
let residentToken = '';
let createdComplaintId = null;

// Helper to make JSON requests
const request = async (method, path, body = null, token = null) => {
  const url = `${baseUrl}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  const data = await response.json();
  return {
    status: response.status,
    data
  };
};

describe('Society Maintenance Tracker - API Integration Tests', () => {
  before(async () => {
    // Start test server on dynamic port
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        console.log(`[Test Server] Running at ${baseUrl}`);
        resolve();
      });
    });

    // Seed database before tests
    const bcrypt = require('bcryptjs');
    await db.initDb();
    await db.query('DELETE FROM complaint_history');
    await db.query('DELETE FROM complaints');
    await db.query('DELETE FROM notices');
    await db.query('DELETE FROM users');

    const adminHash = await bcrypt.hash('Admin@123', 10);
    const residentHash = await bcrypt.hash('Resident@123', 10);

    await db.query(
      `INSERT INTO users (name, email, password_hash, role, phone, flat_number)
       VALUES ($1, $2, $3, 'admin', '555-0100', 'Office')`,
      ['Test Admin', 'admin@example.com', adminHash]
    );

    await db.query(
      `INSERT INTO users (name, email, password_hash, role, phone, flat_number)
       VALUES ($1, $2, $3, 'resident', '555-0101', 'Flat 101')`,
      ['Test Resident', 'resident@example.com', residentHash]
    );
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
    }
  });

  // 1. Authentication & JWT Tests
  test('POST /api/auth/login - Admin can log in and receive JWT token', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: 'admin@example.com',
      password: 'Admin@123'
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.user.role, 'admin');
    assert.ok(res.data.data.token);
    adminToken = res.data.data.token;
  });

  test('POST /api/auth/login - Resident can log in and receive JWT token', async () => {
    const res = await request('POST', '/api/auth/login', {
      email: 'resident@example.com',
      password: 'Resident@123'
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.user.role, 'resident');
    assert.ok(res.data.data.token);
    residentToken = res.data.data.token;
  });

  test('POST /api/auth/register - New resident can register', async () => {
    const res = await request('POST', '/api/auth/register', {
      name: 'New Resident',
      email: 'newresident@example.com',
      password: 'Password@123',
      phone: '555-0199',
      flat_number: 'Tower D-302'
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.user.role, 'resident');
    assert.ok(res.data.data.token);
  });

  test('GET /api/auth/me - Authenticated user can fetch their profile', async () => {
    const res = await request('GET', '/api/auth/me', null, residentToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.user.email, 'resident@example.com');
  });

  // 2. Authorization Role Enforcement Tests
  test('Security: Resident CANNOT access admin dashboard API (403 Forbidden)', async () => {
    const res = await request('GET', '/api/admin/dashboard', null, residentToken);
    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.data.success, false);
  });

  test('Security: Unauthenticated request to complaints is rejected (401 Unauthorized)', async () => {
    const res = await request('GET', '/api/complaints/my');
    assert.strictEqual(res.status, 401);
  });

  // 3. Complaint Lifecycle & History Tests
  test('POST /api/complaints - Resident can raise a maintenance complaint', async () => {
    const res = await request(
      'POST',
      '/api/complaints',
      {
        category: 'Plumbing',
        title: 'Leaking pipe under kitchen sink',
        description: 'Water is dripping slowly and accumulating in the lower cabinet.'
      },
      residentToken
    );

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.data.complaint.category, 'Plumbing');
    assert.strictEqual(res.data.data.complaint.status, 'Open');
    assert.strictEqual(res.data.data.complaint.priority, 'Medium');
    createdComplaintId = res.data.data.complaint.id;
    assert.ok(createdComplaintId);
  });

  test('GET /api/complaints/my - Resident can view their lodged complaints', async () => {
    const res = await request('GET', '/api/complaints/my', null, residentToken);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data.data.complaints));
    assert.strictEqual(res.data.data.complaints.length >= 1, true);
  });

  test('GET /api/complaints/:id - Complaint includes chronological status history', async () => {
    const res = await request('GET', `/api/complaints/${createdComplaintId}`, null, residentToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.complaint.id, createdComplaintId);
    assert.ok(Array.isArray(res.data.data.history));
    assert.strictEqual(res.data.data.history.length, 1);
    assert.strictEqual(res.data.data.history[0].new_status, 'Open');
  });

  // 4. Admin Management, Priority, Status & Overdue Tests
  test('PATCH /api/admin/complaints/:id/priority - Admin can adjust complaint priority', async () => {
    const res = await request(
      'PATCH',
      `/api/admin/complaints/${createdComplaintId}/priority`,
      { priority: 'High' },
      adminToken
    );

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.complaint.priority, 'High');
  });

  test('PATCH /api/admin/complaints/:id/status - Admin updates status to In Progress with note', async () => {
    const res = await request(
      'PATCH',
      `/api/admin/complaints/${createdComplaintId}/status`,
      {
        status: 'In Progress',
        note: 'Plumber John assigned to inspect at 2 PM'
      },
      adminToken
    );

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.complaint.status, 'In Progress');
    assert.strictEqual(res.data.data.history.length, 2);
    assert.strictEqual(res.data.data.history[1].new_status, 'In Progress');
    assert.strictEqual(res.data.data.history[1].note, 'Plumber John assigned to inspect at 2 PM');
  });

  test('PATCH /api/admin/complaints/:id/status - Admin updates status to Resolved', async () => {
    const res = await request(
      'PATCH',
      `/api/admin/complaints/${createdComplaintId}/status`,
      {
        status: 'Resolved',
        note: 'Pipe washer replaced and leak sealed successfully.'
      },
      adminToken
    );

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.complaint.status, 'Resolved');
    assert.ok(res.data.data.complaint.resolved_at);
    assert.strictEqual(res.data.data.history.length, 3);
  });

  // 5. Notice Board Tests (Pinned Important & Regular)
  test('POST /api/admin/notices - Admin can create an important notice (pinned at top)', async () => {
    const res = await request(
      'POST',
      '/api/admin/notices',
      {
        title: 'Water Supply Shutdown Notice',
        content: 'Tank cleaning scheduled for Friday from 10 AM to 2 PM.',
        is_important: true
      },
      adminToken
    );

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(Boolean(res.data.data.notice.is_important), true);
  });

  test('GET /api/notices - Residents can view notices with important pinned first', async () => {
    const res = await request('GET', '/api/notices', null, residentToken);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data.data.notices));
    assert.strictEqual(res.data.data.notices.length >= 1, true);
    assert.strictEqual(Boolean(res.data.data.notices[0].is_important), true);
  });

  // 6. Admin Dashboard Statistics Test
  test('GET /api/admin/dashboard - Admin can retrieve calculated metrics and breakdowns', async () => {
    const res = await request('GET', '/api/admin/dashboard', null, adminToken);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.summary);
    assert.ok(typeof res.data.data.summary.totalComplaints === 'number');
    assert.ok(Array.isArray(res.data.data.byStatus));
    assert.ok(Array.isArray(res.data.data.byCategory));
    assert.ok(Array.isArray(res.data.data.byPriority));
    assert.ok(Array.isArray(res.data.data.recentActivity));
  });
});
