const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const db = new Database(dbPath);

try {
  const users = db.prepare('SELECT identifiant, password, role, fullName FROM User').all();
  console.log('Users:', JSON.stringify(users, null, 2));

  const services = db.prepare('SELECT id, name, adminPassword FROM Service').all();
  console.log('Services:', JSON.stringify(services, null, 2));
} catch (e) {
  console.error('Error querying DB:', e.message);
} finally {
  db.close();
}
