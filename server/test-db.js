require("dotenv").config({ path: "./.env" });
const { connectDB, getDb } = require("./config/db");

async function check() {
    await connectDB();
    const db = getDb();
    console.log("Checking faculty...");
    db.ref("users/faculty").once("value", (s) => console.log(s.val()));
    console.log("Checking student...");
    db.ref("users/student").once("value", (s) => {
        console.log(s.val());
        process.exit(0);
    });
}
check();
