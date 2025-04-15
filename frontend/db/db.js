require("dotenv").config();
const { drizzle } = require("drizzle-orm/libsql");
const { createClient } = require("@libsql/client");
const { eq } = require("drizzle-orm");
const { users } = require("../db/schema/User");

class DatabaseManager {
    static #instance = null;
  
  static getInstance() {
    if (!DatabaseManager.#instance) {
      const dbUrl = process.env.DB_FILE_NAME;
      if (!dbUrl) {
        throw new Error("DATABASE_URL is not defined in the environment variables.");
      }
      
      // Initialize libsql client
      const client = createClient({ url: dbUrl });
      
      // Create Drizzle ORM instance with the schema
      DatabaseManager.#instance = drizzle(client);
    }
    return DatabaseManager.#instance;
  }
}

// Test code
// const db = drizzle(createClient({ url: process.env.DB_FILE_NAME }));

// async function main() {
//   // const user = {
//   //   name: 'John',
//   //   email: 'john@example.com'
//   // };

//   // await db.insert(users).values(user);
//   // console.log('New user created!');

//   const allUsers = await db.select().from(users);
//   console.log('Getting all users from the database: ', users);

//   await db.update(users)
//   .set({ name: 'Mr. Vivek' })
//   .where(eq(users.name, 'Mr. Dan'));

//   console.log('User updated!');
//   const updatedUsers = await db.select().from(users);
//   console.log('Updated users: ', updatedUsers);


//   // await db.delete(users).where(eq(users.name, 'John'));
//   // console.log('User deleted!');
// }

// main();

// Uncomment to export the DatabaseManager instance
module.exports = DatabaseManager.getInstance();