// Simple JSON database operations
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'users.json');

export function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [] };
  }
}

export function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function findUser(email) {
  const db = readDB();
  return db.users.find(u => u.email === email);
}

export function createUser(user) {
  const db = readDB();
  const newUser = {
    id: Date.now().toString(),
    ...user,
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);
  writeDB(db);
  return newUser;
}

export function updateUser(email, updates) {
  const db = readDB();
  const userIndex = db.users.findIndex(u => u.email === email);
  if (userIndex !== -1) {
    db.users[userIndex] = { ...db.users[userIndex], ...updates };
    writeDB(db);
    return db.users[userIndex];
  }
  return null;
}
