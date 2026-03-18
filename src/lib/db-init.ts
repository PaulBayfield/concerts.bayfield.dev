import Database from 'better-sqlite3';

export function initializeDatabase(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS venues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT,
      city TEXT,
      state TEXT,
      country TEXT,
      latitude REAL,
      longitude REAL
    );

    CREATE TABLE IF NOT EXISTS artists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      country TEXT
    );

    CREATE TABLE IF NOT EXISTS concerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venue_id INTEGER REFERENCES venues(id),
      artist_id INTEGER REFERENCES artists(id),
      date TEXT,
      user_email TEXT
    );
  `);

  // Migration: add user_email column to existing concerts tables
  const cols = db.prepare('PRAGMA table_info(concerts)').all() as { name: string }[];
  if (!cols.some(c => c.name === 'user_email')) {
    db.exec('ALTER TABLE concerts ADD COLUMN user_email TEXT');
  }

  const venueCount = db.prepare('SELECT COUNT(*) as count FROM venues').get() as { count: number };
  if (venueCount.count === 0) {
    seedDatabase(db);
  }
}

function seedDatabase(db: Database.Database) {
  const insertVenue = db.prepare(
    'INSERT INTO venues (name, address, city, state, country, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const insertArtist = db.prepare(
    'INSERT INTO artists (name, country) VALUES (?, ?)'
  );
  const insertConcert = db.prepare(
    'INSERT INTO concerts (venue_id, artist_id, date) VALUES (?, ?, ?)'
  );

  const venues = db.transaction(() => {
    const v1 = insertVenue.run('Olympia', '28 Bd des Capucines', 'Paris', 'Île-de-France', 'France', 48.8706, 2.3306);
    const v2 = insertVenue.run('Zénith de Paris', '211 Av. Jean-Jaurès', 'Paris', 'Île-de-France', 'France', 48.8917, 2.3917);
    const v3 = insertVenue.run('Accor Arena', '8 Bd de Bercy', 'Paris', 'Île-de-France', 'France', 48.8384, 2.3786);
    const v4 = insertVenue.run('La Cigale', '120 Bd de Rochechouart', 'Paris', 'Île-de-France', 'France', 48.8844, 2.3402);
    const v5 = insertVenue.run('Nuits de Fourvière', 'Rue Roger Radisson', 'Lyon', 'Auvergne-Rhône-Alpes', 'France', 45.7597, 4.8194);
    const v6 = insertVenue.run('Rockhal', '5 Av. du Rock\'n\'Roll', 'Esch-sur-Alzette', null, 'Luxembourg', 49.4833, 5.9833);
    const v7 = insertVenue.run('Ancienne Belgique', '110 Bd Anspach', 'Bruxelles', null, 'Belgique', 50.8503, 4.3517);
    return [v1, v2, v3, v4, v5, v6, v7];
  })();

  const artists = db.transaction(() => {
    const a1 = insertArtist.run('Radiohead', 'GB');
    const a2 = insertArtist.run('Arcade Fire', 'CA');
    const a3 = insertArtist.run('Portishead', 'GB');
    const a4 = insertArtist.run('Massive Attack', 'GB');
    const a5 = insertArtist.run('Nick Cave & The Bad Seeds', 'AU');
    const a6 = insertArtist.run('PJ Harvey', 'GB');
    const a7 = insertArtist.run('The National', 'US');
    const a8 = insertArtist.run('Beirut', 'US');
    const a9 = insertArtist.run('Sufjan Stevens', 'US');
    const a10 = insertArtist.run('Bon Iver', 'US');
    return [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10];
  })();

  db.transaction(() => {
    // Radiohead x2 at different venues
    insertConcert.run(venues[0].lastInsertRowid, artists[0].lastInsertRowid, '2016-05-24');
    insertConcert.run(venues[2].lastInsertRowid, artists[0].lastInsertRowid, '2017-07-11');
    // Arcade Fire
    insertConcert.run(venues[2].lastInsertRowid, artists[1].lastInsertRowid, '2014-03-12');
    insertConcert.run(venues[4].lastInsertRowid, artists[1].lastInsertRowid, '2018-07-08');
    // Portishead
    insertConcert.run(venues[3].lastInsertRowid, artists[2].lastInsertRowid, '2011-06-03');
    // Massive Attack
    insertConcert.run(venues[0].lastInsertRowid, artists[3].lastInsertRowid, '2010-04-20');
    insertConcert.run(venues[5].lastInsertRowid, artists[3].lastInsertRowid, '2019-06-15');
    // Nick Cave
    insertConcert.run(venues[6].lastInsertRowid, artists[4].lastInsertRowid, '2013-11-07');
    insertConcert.run(venues[1].lastInsertRowid, artists[4].lastInsertRowid, '2017-03-21');
    // PJ Harvey
    insertConcert.run(venues[3].lastInsertRowid, artists[5].lastInsertRowid, '2016-09-15');
    // The National
    insertConcert.run(venues[0].lastInsertRowid, artists[6].lastInsertRowid, '2019-10-08');
    insertConcert.run(venues[4].lastInsertRowid, artists[6].lastInsertRowid, '2023-07-04');
    // Beirut
    insertConcert.run(venues[3].lastInsertRowid, artists[7].lastInsertRowid, '2015-11-20');
    // Sufjan Stevens
    insertConcert.run(venues[0].lastInsertRowid, artists[8].lastInsertRowid, '2015-10-12');
    // Bon Iver
    insertConcert.run(venues[1].lastInsertRowid, artists[9].lastInsertRowid, '2012-06-18');
    insertConcert.run(venues[4].lastInsertRowid, artists[9].lastInsertRowid, '2022-07-10');
  })();
}
