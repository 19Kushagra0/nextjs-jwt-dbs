import { serialize } from "cookie";
import { signToken } from "@/lib/auth";
import clientPromise from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    const client = await clientPromise;
    const db = client.db("auth-dashboard");
    const users = db.collection("users");

    // is username and password provided
    if (!username || !password) {
      return Response.json(
        { message: "Username and password required" },
        { status: 400 },
      );
    }

    // check if user exists
    const user = await users.findOne({ username });

    // const user = users.find((user) => {
    //   return user.email === username && user.password === password;
    // });

    // check if user exists
    if (!user) {
      return Response.json(
        { message: "Please provide correct username and password" },
        {
          status: 401,
        },
      );
    }

    // check if password is correct

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return Response.json(
        { message: "Please provide correct username and password" },
        {
          status: 401,
        },
      );
    }

    //   jwt.sign(payload, secretOrPrivateKey, [options])
    // const token = jwt.sign({ username }, "secretOrPrivateKey", {
    //   expiresIn: "7d",
    // });

    // importing auth.js
    // 🔹 keep token payload minimal (no roles for now)
    const token = signToken({
      id: user._id.toString(),
      username: user.username,
    });

    //   serialize(name, value, options) || (cookie template)
    const serialized = serialize("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    // there is also next js way to to do it
    // in this way you dont have to return cookie in respose
    // but this can not be used in pyton, nodejs etc
    // const cookieStore = cookies();
    // await cookieStore.set("token", token, {
    //     httpOnly: true,
    //     secure: true,
    //     sameSite: "strict",
    //     maxAge: 60 * 60 * 24 * 7,
    //     path: "/",
    //   });

    // console.log(serialized);

    return Response.json(
      { message: "Login successful", success: true },
      // auto create cookie
      { headers: { "Set-Cookie": serialized } },
    );
  } catch (error) {
    return Response.json({ message: "Login failed" }, { status: 500 });
  }
}
