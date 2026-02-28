import clientPromise from "@/lib/db";
import { signToken } from "@/lib/auth";
import { serialize } from "cookie";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return Response.json(
        { error: "Username and password required" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("auth-dashboard");
    const users = db.collection("users");

    // find user in database
    const user = await users.findOne({ username });

    if (!user) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // check password (plain for now)
    if (user.password !== password) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // create token
    const token = signToken({
      id: user._id.toString(),
      username: user.username,
    });

    // set cookie
    const cookie = serialize("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Set-Cookie": cookie,
      },
    });
  } catch (error) {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
