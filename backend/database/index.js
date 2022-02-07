import { Client } from 'ts-postgres';

async function main() {
  const client = new Client({
    host: 'postgres://itvpxqgd:tiNrfejVZyiw34r3N89R2e6W9YeVdupi@castor.db.elephantsql.com/itvpxqgd',
  });
  await client.connect();

  try {
    // Querying the client returns a query result promise
    // which is also an asynchronous result iterator.
    const result = client.query("SELECT 'Hello ' || $1 || '!' AS message", [
      'world',
    ]);

    for await (const row of result) {
      // 'Hello world!'
      console.log(row.get('message'));
    }
  } finally {
    await client.end();
  }
}

await main();
