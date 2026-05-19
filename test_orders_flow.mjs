import { drizzle } from 'drizzle-orm/mysql2';
import { createConnection } from 'mysql2/promise';
import { orders } from './drizzle/schema.js';

// Parse DATABASE_URL
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const url = new URL(dbUrl);
const config = {
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
};

console.log('Connecting to database:', { host: config.host, user: config.user, database: config.database });

try {
  const connection = await createConnection(config);
  const db = drizzle(connection);
  
  // Test 1: Check if table exists
  const [tables] = await connection.execute('SHOW TABLES LIKE "orders"');
  console.log('✓ Orders table exists:', tables.length > 0);
  
  // Test 2: Insert test data
  const testId = 'flow-test-' + Date.now();
  console.log('\n📝 Inserting test order with ID:', testId);
  
  const insertResult = await db.insert(orders).values({
    id: testId,
    customerName: 'محمد أحمد',
    location: 'الرياض',
    doorsCount: 10,
    orderDate: '2026-05-19',
    installationDate: '2026-05-26',
    downPayment: 5000,
    isDownPaymentPaid: true,
    isInstalled: false,
  });
  console.log('✓ Insert successful');
  
  // Test 3: Retrieve the data
  console.log('\n🔍 Retrieving the inserted order...');
  const result = await db.select().from(orders).where((o) => o.id === testId);
  console.log('✓ Retrieved orders:', result.length);
  if (result.length > 0) {
    console.log('Order data:', JSON.stringify(result[0], null, 2));
  }
  
  // Test 4: List all orders
  console.log('\n📊 Listing all orders...');
  const allOrders = await db.select().from(orders);
  console.log('✓ Total orders in database:', allOrders.length);
  
  // Test 5: Update the order
  console.log('\n✏️ Updating the order...');
  const updateResult = await db.update(orders).set({
    isInstalled: true,
  }).where((o) => o.id === testId);
  console.log('✓ Update successful');
  
  // Test 6: Verify update
  const updatedResult = await db.select().from(orders).where((o) => o.id === testId);
  console.log('✓ Updated order:', updatedResult[0]?.isInstalled === true ? 'isInstalled = true' : 'isInstalled = false');
  
  // Test 7: Delete the test order
  console.log('\n🗑️ Deleting the test order...');
  const deleteResult = await db.delete(orders).where((o) => o.id === testId);
  console.log('✓ Delete successful');
  
  // Test 8: Verify deletion
  const finalResult = await db.select().from(orders).where((o) => o.id === testId);
  console.log('✓ Order deleted:', finalResult.length === 0 ? 'confirmed' : 'FAILED');
  
  console.log('\n✅ All tests passed! Database is working correctly.');
  
  await connection.end();
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
