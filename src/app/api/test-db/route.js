import clientPromise from "@/lib/db";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("test");

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false });
  }
}
