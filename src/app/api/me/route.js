// importing cookie from headers
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  const token = (await cookies()).get("token")?.value;

  //   if the value is not found send undefined
  // cookies in nextjs 16 is async

  if (!token) {
    return Response.json(
      { message: "user not authenticated" },
      { status: 401 },
    );
  }

  // without use of ?.value we have to get value later again in the if condition
  //   token =  token.value

  //   jwt when expired wull not send null or undefined so use try catch
  try {
    // const verified = jwt.verify(token, "secretOrPrivateKey");
    // importing auth.js
    const verified = verifyToken(token);

    return Response.json({
      message: "user is authenticated",
      // 🔹 no role check for now
      // identity is enough
      user: verified,
    });
  } catch (error) {
    return Response.json(
      { message: "jwt expired or invalid" },
      { status: 401 },
    );
  }
}
