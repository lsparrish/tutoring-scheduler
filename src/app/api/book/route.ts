import { promises as fs } from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const dbPath = path.join(process.cwd(), '/tmp/bookings.db');

export async function GET() {
  const db = await open({ filename: dbPath, driver: sqlite3.Database });
  await db.exec('CREATE TABLE IF NOT EXISTS slots (id INTEGER PRIMARY KEY AUTOINCREMENT, time TEXT)');
  const rows = await db.all('SELECT * FROM slots');
  return Response.json(rows);
}

export async function POST(request: Request) {
  const { time } = await request.json();
  const db = await open({ filename: dbPath, driver: sqlite3.Database });

  // This is the exact race condition students will hit
  try {
    await db.run('INSERT INTO slots (time) VALUES (?)', time);
    return Response.json({ success: true });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
