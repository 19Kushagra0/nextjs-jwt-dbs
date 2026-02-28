import clientPromise from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    // decode token
    const decoded = verifyToken(token);

    const client = await clientPromise;
    const db = client.db("auth-dashboard");
    const users = db.collection("users");

    // find user by id from token
    const user = await users.findOne(
      { _id: new (await import("mongodb")).ObjectId(decoded.id) },
      { projection: { password: 0 } }, // never send password
    );

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ user });
  } catch (error) {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }
}
