import clientPromise from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  // if db server failed after db.js is connected
  try {
    const { username, password } = await req.json();

    const client = await clientPromise;
    const db = client.db("auth-dashboard");
    const users = db.collection("users");

    // basic validation
    if (!username || !password) {
      return Response.json(
        { message: "Username and password required" },
        { status: 400 },
      );
    }

    const existingUser = await users.findOne({ username });
    // check if user already exists
    // const existingUser = findUser(username);  with users.js
    if (existingUser) {
      return Response.json({ message: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await users.insertOne({
      username,
      password: hashedPassword,
      createdAt: new Date(),
    });
    // save user
    // addUser(username, password);  with users.js

    return Response.json({ message: "Signup successful" }, { status: 201 });
  } catch (error) {
    return Response.json({ message: "Signup failed" }, { status: 500 });
  }
}
