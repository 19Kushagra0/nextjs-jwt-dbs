import clientPromise from "@/lib/db";
export async function POST(request) {
  try {
    // all logic here

    const { username, password } = await request.json();

    // basic validation
    if (!username || !password) {
      return Response.json(
        { error: "Username and password required" },
        { status: 400 },
      );
    }

    // check if user already exists
    const client = await clientPromise;
    const db = client.db("auth-dashboard");
    const users = db.collection("users");

    const existingUser = await users.findOne({ username });

    // const existingUser = findUser(username);

    if (existingUser) {
      return Response.json({ error: "User already exists" }, { status: 409 });
    }
    // save user
    // addUser(username, password);

    await users.insertOne({
      username,
      password,
      createdAt: new Date(),
    });
    return new Response(JSON.stringify({ message: "Signup successful" }), {
      status: 201,
    });
  } catch (error) {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
