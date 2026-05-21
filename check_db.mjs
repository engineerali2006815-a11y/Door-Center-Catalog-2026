import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || 'localhost',
  user: process.env.DATABASE_URL?.split('://')[1]?.split(':')[0] || 'root',
  password: process.env.DATABASE_URL?.split(':')[2]?.split('@')[0] || '',
  database: process.env.DATABASE_URL?.split('/')[3] || 'test',
});

// Check if orders table exists
const [tables] = await connection.execute('SHOW TABLES LIKE "orders"');
console.log('Orders table exists:', tables.length > 0);

// Check table structure
if (tables.length > 0) {
  const [columns] = await connection.execute('DESCRIBE orders');
  console.log('Orders table structure:');
  console.table(columns);
}

// Try to insert a test record
try {
  const [result] = await connection.execute(
    'INSERT INTO orders (id, customerName, location, doorsCount, orderDate, installationDate, downPayment, isDownPaymentPaid, isInstalled) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ['test-' + Date.now(), 'أحمد', 'الرياض', 5, '2026-05-19', '2026-05-26', 1000, true, false]
  );
  console.log('✓ Test insert successful');
  
  // Try to select it back
  const [rows] = await connection.execute('SELECT * FROM orders WHERE id = ?', ['test-' + Date.now()]);
  console.log('✓ Test select successful, rows:', rows.length);
} catch (error) {
  console.error('✗ Test insert/select failed:', error.message);
}

await connection.end();
