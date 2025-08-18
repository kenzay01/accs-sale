const DatabaseManager = require('./database').default;

async function testDatabase() {
  const db = new DatabaseManager();
  
  try {
    console.log('Testing database connection...');
    
    // Test getting all orders
    const orders = await db.getAllOrders();
    console.log('Orders found:', orders.length);
    console.log('Sample order:', orders[0]);
    
    // Test getting users
    const users = await db.all("SELECT * FROM users LIMIT 5");
    console.log('Users found:', users.length);
    console.log('Sample user:', users[0]);
    
    // Test getting orders with user info
    const ordersWithUsers = await db.all(`
      SELECT o.*, u.telegram_id, u.username, u.first_name, u.last_name, u.language
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);
    console.log('Orders with users found:', ordersWithUsers.length);
    console.log('Sample order with user:', ordersWithUsers[0]);
    
  } catch (error) {
    console.error('Error testing database:', error);
  } finally {
    db.close();
  }
}

testDatabase();
