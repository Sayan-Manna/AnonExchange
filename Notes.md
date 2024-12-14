# Set up

# User schema and mini schema for User

---

```ts
import mongoose, { Schema, Document } from "mongoose";
// extends Document -> as typescript -> Mongoose Document
// Why exporting ??
// so that it can be reused in other parts of your codebase.
// TS interfaces define the structure of an object,
// by exporting Message, other modules or files that import this interface know the exact shape of a Message document.
export interface Message extends Document {
  content: string;
  createdAt: Date;
}
const MessageSchema: Schema<Message> = new Schema({
  content: {
    type: String,
    required: [true, "Content is required"],
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  isAcceptingMessages: boolean;
  messages: Message[]; // Message array -> TS you can't specify type inside []
}
const UserSchema: Schema<User> = new Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please fill a valid email address",
    ],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  verifyCode: {
    type: String,
    required: [true, "Verify code is required"],
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, "Verify code expiry is required"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAcceptingMessages: {
    type: Boolean,
    default: true,
  },
  messages: [MessageSchema], // mini schema
});

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);

export default UserModel;
```

- `Document` is an interface from Mongoose that represents a MongoDB document, which can be used for type safety.
- Extending the Document interface to ensure that the schema is strongly typed and compatible with MongoDB documents
- Before creating a new model, Mongoose checks if a model with the name User already exists in `mongoose.models.`. If already there, it is reused.
  `mongoose.models.User as mongoose.Model<User>`
- `mongoose.Model<User>`: This is called a “**type assertion**” in TypeScript. We are telling TypeScript to treat mongoose.models.User as _if it is a Mongoose model that works with a User type (which you previously defined as an interface)._
- If the model doesn't exist, a new mongoose model for the User is created.
- NextJS is `edge time framework (Serverless)` : Unlike traditional application the backend is running every time, in Next JS, when the user only requests only then the response comes. So it's like on-demand
- **Edge time framework** refers to the ability to run code closer to the user, like on CDN (Content Delivery Network) servers at various locations around the world. This reduces latency and provides faster responses, even if the code is executed “on-demand.”
- Every time a user makes a request (like calling an API route), the code runs from the beginning — it’s like restarting your server for each request. So if you try to **create a Mongoose model** (like a User model) on every request, you’ll get an error because the model was already created in a previous request.

# ZOD

---

- Server level validation is done through ZOD
- create a `schemas` folder

---

```ts
// signUpSchema.ts ---------
import { z } from "zod";
// As we need these schemas in other files when verifying -> export
export const usernameValidation = z
  .string()
  .min(2, "Username must be at least 2 characters")
  .max(20, "Username must be no more than 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special characters");

export const signUpSchema = z.object({
  username: usernameValidation,

  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});
```

---

```ts
// signInSchema.ts
import { z } from "zod";

export const signInSchema = z.object({
  identifier: z.string(), // Can be either username or email
  password: z.string(),
});
```

---

```ts
// verifySchema.ts
import { z } from "zod";

export const verifySchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});
```

---

```ts
//messageSchema.ts
import { z } from "zod";

export const messageSchema = z.object({
  content: z
    .string()
    .min(10, { message: "Content must be at least 10 characters." })
    .max(300, { message: "Content must not be longer than 300 characters." }),
});
```

---

```ts
// acceptMessageSchema.ts
import { z } from "zod";

export const AcceptMessageSchema = z.object({
  acceptMessages: z.boolean(),
});
```

# Connect to DB

---

- As NextJS is edge time framework. we have to check first is db is connected previously or not, otherwise it'll create connection on every request.
- Every time a request hits the API route or server-side function, it can potentially try to **reconnect to the database**. This could create **multiple new connections**, which is inefficient and can lead to performance problems or hitting the database connection limit.
  To avoid reconnecting every time, you need to **check if a connection already exists** and **reuse it**.

```ts
// lib/dbConnect.ts ------------------------|
import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number; // we can take it as string also
};

const connection: ConnectionObject = {};

// void is js/ts is different than other langiages as it means here is the output could be anything
async function dbConnect(): Promise<void> {
  // Check if we have a connection to the database or if it's currently connecting
  if (connection.isConnected) {
    console.log("Already connected to database");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {});
    console.log(db);
    // in db we get connections array, and the first item is our current connection. We check if it is ready
    // if it is ready, we set isConnected to the readyState of the connection
    connection.isConnected = db.connections[0].readyState;

    console.log("Connected to database successfully");
  } catch (error) {
    console.log("Error connecting to database: ", error);
    process.exit(1);
  }
}
export default dbConnect;
```

- `db.connections[0].readyState` refers to the state of the current MongoDB connection:
  0: Disconnected
  1: Connected
  2: Connecting
  3: Disconnecting
- By checking `connection.isConnected`, you **avoid reconnecting to MongoDB every time the function is called**, which can save resources and prevent potential issues with too many open connections.

# Re-send email with NextJS

---

- We could use `nodemailer` as well.
- code should effectively handles \*\*both scenarios of registering a new user and updating an existing but unverified user account with a new password and verification code.
- Let's create a verification email template : `root/emails/VerificationEmail.tsx`

```ts
// Customize if necessary
import {
  Html,
  Head,
  Font,...
} from "@react-email/components"; // ** install

interface VerificationEmailProps {
  username: string;
  otp: string;
}

export default function VerificationEmail({
  username,
  otp,
}: VerificationEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Verification Code</title>
        <Font
          ...
        />
      </Head>
      <Preview>Here&apos;s your verification code: {otp}</Preview>
      <Section>
        ...
      </Section>
    </Html>
  );
}

```

- Now create send verification mail using resend

```ts
// lib/resend.ts ------------------------|
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY); // add in .env
```

---

```ts
// helpers/sendVerificationEmail.ts -----------|

import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev", // first resend gives this as default
      to: email,
      subject: "Anon-Message Verification Code :: ☠️ ",
      react: VerificationEmail({ username, otp: verifyCode }), // call the VerificationEmail function
    });
    return { success: true, message: "Verification email sent successfully." };
  } catch (error) {
    console.log("Error sending verification email: ", error);
    return { success: false, message: "Failed to send verification email" };
  }
}
```

---

`types/ApiResponse.ts`

```ts
import { Message } from "@/model/User";

export interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMessages?: boolean; // optional
  messages?: Array<Message>; // optional
}
```

# Initial : sign-up route + Custom OTP

---

- Create a route `app/api/sign-up/route.ts`
  > [!note] Algorithm
  >
  > - Since Next.js uses edge functions, the database connection needs to be established for every API route request
  > - Extract data from the json body of the request.json()
  > - Check if verified user with same username is exits
  >   - If yes -> error
  > - Check if a user with given email id exists
  >   - if exists and verified -> return error
  >   - if exists but not verified -> update the user with new password and verification code
  > - If no user with the email exists, create a new user in the database.
  >   - send verification mail to the user
  > - Return success or failure response based on the outcome of the email sending.

```ts
// As NextJS edge time so dbConnect needs to be added every time for api routes
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) { // type Request -> ts
	// #1 -> since Next.js uses edge functions, the database connection needs to be established for every API route request
  await dbConnect();
  try {
	// #2 -> In NextJS --> request.json() ::
	// Used to read and parse the request body as JSON in API routes, especially when using edge or serverless functions.
    // req.body :: typically available in frameworks like Express.js, where middleware like body-parser or built-in request body parsing is available.
    // But in NextJS when using Edge Functions, the request object doesn’t automatically provide a body property like in Express.
	// Since Next.js follows the native Fetch API pattern in edge and serverless functions, request.json() is the standard way to parse the incoming request body.
    const { username, email, password } = await request.json();

    // #3 -> Check if user is verified by username or not
    // mongoDB -> both condition must be true
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        {...},
        { status: 400 }
      );
    }
	// find the user by email
    const existingUserByEmail = await UserModel.findOne({ email });
    // verify code generate
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    // #4
    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          {...},
          {status: 400,}
        );
      } else {
	    // update the user with new verification code and pssword
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        // set verification code expiry
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserByEmail.save(); // update in db
      }

    } else { // no user with this email exist -> create the user
      // new user -> register
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      // setting expiry exactly 1 hour ahead of the current time
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });
      await newUser.save();
    }

    // send verification email to the created new uer
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );
    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        {
          status: 500,
        }
      );
    }
    return Response.json(
      {
        success: true,
        message: "User registered successfully, please verify your email",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error registering user: ", error);
    return Response.json(
      {
        success: false,
        message: "Failed to register user",
      },
      {
        status: 500,
      }
    );
  }
}
```

# Next Auth / AuthJS

---

- We are gonna do the sign-in in authJS/next-auth
- `npm i nextauth`
- Create the folder structure `app/auth/[...nextauth]/options.ts` and `app/auth/[...nextauth]/route.ts`
- For providers, they give few options like OAuth, Email, Credentials. We'll be doing credentials based, but others are also very much the same
- Now, most of the logics will be written in `options.ts`

```ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from "bcryptjs";
import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      // main credentials
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
	    // We need to find the user from db also, so dbConnect as edge time framework
        await dbConnect();
        try {
	    // get the user using email or username (for future if needed)
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier.email }, // as es6 we can write email: credentials.identifier
              { username: credentials.identifier },
            ],
          });
          if (!user) {
            throw new Error("No user found");
          }
          if (!user.isVerified) {
            throw new Error(
              "User not verified, Please verify your account first"
            );
          }
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isPasswordCorrect) {
            throw new Error("Password is incorrect");
          } else {
	        // return the user **
            return user;
          }
        } catch (error: any) {
          throw new Error("Error authorizing user");
        }
      },
    }),
    /* ... additional providers ... /*/
  ],
...
};

```

- Now pages -> NextAuth.js automatically creates simple, unbranded authentication pages for handling Sign in, Sign out, Email Verification and displaying error messages.
- To add a custom login page, you can use the `pages` option:

```ts
// options.ts
...
export const authOptions: NextAuthOptions = {
  providers: [
    ...
  ],
  pages: {
    signIn: "/sign-in", // next-auth can create pages for you, if u don't make custom page
  },
  session: {
    strategy: "jwt", // jwt or db based
  },
  secret: process.env.NEXTAUTH_SECRET, // create secret key in .env
};

```

- Callback : Callbacks are **asynchronous** functions you can use to control what happens when an action is performed.
- Callbacks are extremely powerful, especially in scenarios involving JSON Web Tokens as they allow you to implement access controls without a database and to integrate with external databases or APIs.
- Here we'll be modifying these two strategies

```ts
...
export const authOptions: NextAuthOptions = {
  providers: [
	...
  ],
  callbacks: {
  // this user is the user from db -> providers code
  // Now this user is inside jwt, I have access to token and jwt
  // jwt se mayne liya user aur values bhari tokens ke andar
  // add user's information inside the token as payload
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString(); // pass user's id as string inside the jwt _id payload_
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
    // In session I have access to session and token
    // Now I have the token with user info, add it to session, so that we can extract the user from the session later
    // I have also added the user object so that I can extract the user sesson?.user later
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },
...
```

- return session if session based, return token if jwt based
- We are doing this because -> I don't want to query every time to the db, so we'll pass important information inside the token (however it'll increase the payload size) and can extract accordingly.
- Now when adding data we'll stuck at a TS error
- The `next-auth.d.ts` file is used to extend and customise the types provided by the next-auth package in TS. By default, next-auth provides a standard shape for session, user, and JWT objects. However, if you need to add custom fields (like \_id, isVerified, or username), you declare those in a TypeScript module augmentation. This ensures TypeScript knows about your custom properties when interacting with session data, user data, or JWT tokens, providing better type safety in your application
- see types in documentation

```ts
// src/types/next-auth.d.ts
import "next-auth";
// declaring and modifying the module so that it gets to know about the custom datatypes
declare module "next-auth" {
  // key user : values
  // if defaultSession add user key, even if there is not value
  interface Session {
    user: {
      _id?: string;
      isVerified?: boolean;
      isAcceptingMessages?: boolean;
      username?: string;
    } & DefaultSession["user"];
  }

  interface User {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
  }
}
// another way to declare and change
declare module "next-auth/jwt" {
  interface JWT {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
  }
}
```

- Now let's go to `app/api/auth/[...nextauth]/route.ts`

```ts
import NextAuth from "next-auth/next";
import { authOptions } from "./options";

// this shoudl be handler only and we get it from NextAuth(authOptions)
const handler = NextAuth(authOptions);

// The handler is used to handle both GET and POST requests,
// which are typically used for initializing sessions and sign-in/sign-out actions in NextAuth.
export { handler as GET, handler as POST };
```

- Now let's configure our auth middleware. Search middleware in nextjs official website and middleware function from next-auth.
- `src/middleware.ts` -> in which of the routes you want to perform some intermediate actions, in those cases we use middlewares.

```ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
export { default } from "next-auth/middleware";

// In which of the routes, you want your middleware to run
export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up", "/", "/verify/:path*"],
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // Redirect to dashboard if the user is already authenticated
  // and trying to access sign-in, sign-up, or home page
  if (
    token &&
    (url.pathname.startsWith("/sign-in") ||
      url.pathname.startsWith("/sign-up") ||
      url.pathname.startsWith("/verify") ||
      url.pathname === "/")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!token && url.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}
```

- Now also, we need context so that we can wrap our application with the auth provider
- `src/context/AuthProvider.ts` -> search from next-auth documentation -> session provider

```ts
"use client";
import { SessionProvider } from "next-auth/react";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

```tsx
// src/layout.tsx
...
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AuthProvider>
        <body className={inter.className}>{children}</body>
      </AuthProvider>
    </html>
  );
}

```

- Give secret in `.env`

# OTP verification and Unique username check

---

## Unique Username check

- In this case, it’s using a **GET** request with **query parameters** because the **API’s purpose is to verify whether a username is already taken**. A GET request with query params is simpler and more suitable for fetching or checking information **without modifying any data on the server.** Otherwise post request and data passed to form etc using req.json or req.body(nodeJS)
- So to check if the username “abc” is unique, you’d send a request like: _localhost:3000/api/check-username-unique?username=abc_

> [!note]+
>
> - connect to DB as NextJS edge time
> - Get request as we are doing checking if the username is already taken or not
> - parse the request.url and extracts the username from the query parameter
> - validate the username using zod schema
> - if zod verification not successful -> extract the error and show
> - extract the username from zod result
> - Check if that username exists in db and is Verified
> - If not verified -> username is unique or else username already taken

- create `app/api/check-username-unique/route.ts`

```ts
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";
// UsernameQuerySchema is created using the z.object method from the zod library.
// It defines a schema where the username field is validated using the usernameValidation rules, which could include constraints like length, format, or specific characters.
const UsernameQuerySchema = z.object({
  username: usernameValidation,
});
// localhost:3000/api/check-username-unique?username=abc?phone=android
export async function GET(request: Request) {
  await dbConnect();
  try {
    // It parses the request.url and retrieves the username from the query parameters
    const { searchParams } = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username"),
    };
    // validate using zod
    // The safeParse method checks if the username follows the expected validation rules,
    // preventing invalid input from reaching the database query.
    const result = UsernameQuerySchema.safeParse(queryParam);
    console.log("validate username using zod result log:: ", result);
    if (!result.success) {
      const usernameErrors = result.error?.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameters",
        },
        { status: 400 }
      );
    }
    const { username } = result.data;
    const existingUser = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUser) {
      return Response.json(
        {
          success: false,
          message: "Username already exists",
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Username is unique",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Error checking username: ", error);
    return Response.json(
      {
        success: false,
        message: "Error checking username",
      },
      { status: 500 }
    );
  }
}
```

```txt
• result.error checks if there’s a validation error.
• result.error?.format() formats the error object, which contains detailed information about validation failures.
• username?. checks if the “username” field has an error.
• _errors retrieves the specific error messages for the “username” field.
• || [] ensures that if any of these steps fail (no error), an empty array ([]) is returned, preventing undefined errors.
```

## OTP verification

- Create `src/app/api/verify-code/route.ts`
- This code defines an API endpoint that verifies a user’s OTP (One-Time Password) after they have registered. The user needs to send their username and the verification code they received.
- Why decoding??
  - The `decodeURIComponent()` function is used to reverse this encoding process. It takes a URI-encoded string and decodes it back to its original form. For example, if the username was encoded as `john%20doe`, decodeURIComponent() will convert it back to `john doe`.

> [!note]+
>
> - connect to DB
> - get the user's username and verification code from the req.json
> - decode and find the user based on the decoded username from the db
> - check if the code is correct and not expired
> - if true -> mark the user as verified -> save the updated user
> - if code is expired -> send the response as "sign up again to receive the code"
> - else the verification code is incorrect

```ts
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
  // Connect to the database
  await dbConnect();

  try {
    const { username, code } = await request.json();
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Check if the code is correct and not expired
    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      // Update the user's verification status
      user.isVerified = true;
      await user.save();

      return Response.json(
        { success: true, message: "Account verified successfully" },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      // Code has expired
      return Response.json(
        {
          success: false,
          message:
            "Verification code has expired. Please sign up again to get a new code.",
        },
        { status: 400 }
      );
    } else {
      // Code is incorrect
      return Response.json(
        { success: false, message: "Incorrect verification code" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying user:", error);
    return Response.json(
      { success: false, message: "Error verifying user" },
      { status: 500 }
    );
  }
}
```

# Message API with aggregation pipeline

---

### 1 : Updating and retrieve the user's message acceptance status

- Create `api/accept-messages/route.ts`
- The provided code snippet implements an **API for accepting or rejecting messages from users in a NextJS application using NextAuth for authentication and a MongoDB database**
- The API has 2 main functionality
  1.  **Update the user’s acceptance status for messages (via POST request)**.
  2.  **Retrieve the user’s current acceptance status for messages (via GET request)**.

> [!note]+
>
> - POST method : The POST method is responsible for updating the user’s message acceptance status.
> - Get the current logged in user -> using getServerSession (NextAuth session based)
>   - get the user's session and extract the user from session -> **Done in AuthJS**
> - Check if the user is authenticated
> - Extract the **acceptMessages** value from the request body.
> - Updates the user’s **isAcceptingMessages** field in the db.

```ts
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";

export async function POST(request: Request) {
  await dbConnect(); // connect to DB
  const session = await getServerSession(authOptions); // get the user's session
  const user: User = session?.user; // get user from the session if present
  // Check if the user is authenticated
  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message:
          "You need to be signed in to accept messages / Not authenticated",
      },
      { status: 401 }
    );
  }
  const userId = user._id;
  // get the acceptMessages from req body
  const { acceptMessages } = await request.json();
  try {
    // Update the user's message acceptance status
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessages: acceptMessages }, //set
      { new: true } // returns the updated document
    );

    if (!updatedUser) {
      // User not found
      return Response.json(
        {
          success: false,
          message: "Unable to find user to update message acceptance status",
        },
        { status: 404 }
      );
    }

    // Successfully updated message acceptance status
    return Response.json(
      {
        success: true,
        message: "Message acceptance status updated successfully",
        updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Failed to update user status to accept messages: ", error);
    return Response.json(
      {
        success: false,
        message: "Failed to update user status to accept messages",
      },
      { status: 500 }
    );
  }
}
```

> [!note]+
>
> - GET method : The GET method retrieves the user’s current acceptance status for messages.
> - Retrieves the current user’s session.
> - Checks if the user is authenticated; if not, returns a 401 status.
> - Retrieves the user’s document from the database using their ID.
> - Returns the user’s isAcceptingMessages status or appropriate error messages.

```ts
export async function GET(request: Request) {
  // Connect to the database
  await dbConnect();

  // Get the user session
  const session = await getServerSession(authOptions);
  const user = session?.user;

  // Check if the user is authenticated
  if (!session || !user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    // Retrieve the user from the database using the ID
    const foundUser = await UserModel.findById(user._id);

    if (!foundUser) {
      // User not found
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Return the user's message acceptance status
    return Response.json(
      {
        success: true,
        isAcceptingMessages: foundUser.isAcceptingMessages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving message acceptance status:", error);
    return Response.json(
      { success: false, message: "Error retrieving message acceptance status" },
      { status: 500 }
    );
  }
}
```

### 2 : Retrieving the messages associated with the user

- Now create `api/get-messages/route.ts`
- This code defines a **GET** endpoint that **retrieves messages associated with a user from a MongoDB database**.
  > [!note]+
  >
  > - get the user's session and check if the user is authenticated or not
  > - Convert the user’s ID from the session into a MongoDB ObjectId for querying the database.
  >   - we stored in id as string in **options.ts** in authJS so , need to convert
  > - mongoDB Aggregation on UserModel to fetch messages

```ts
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import mongoose from "mongoose";
import { User } from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const _user: User = session?.user;

  if (!session || !_user) {
    return Response.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }
  const userId = new mongoose.Types.ObjectId(_user._id);
  try {
    const user = await UserModel.aggregate([
      { $match: { _id: userId } },
      // allowing empty array of messages. Without "preserveNullAndEmptyArrays: true", toast will show user not found which is not a correct message,
      { $unwind: { path: "$messages", preserveNullAndEmptyArrays: true } },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]).exec();

    if (!user || user.length === 0) {
      return Response.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    return Response.json(
      { messages: user[0].messages },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
```

```
• $match: { _id: userId }: Filters the users by their ID.

• $unwind: "$messages": Deconstructs the messages array so each message is treated as a separate document.

• $sort: { "messages.createdAt": -1 }: Sorts the messages by their creation date in descending order (most recent first).

• $group: { _id: "$_id", messages: { $push: "$messages" } }: Groups the results back together, collecting all messages into an array.
```

### 3 : Sending message to a user

- Now create `/api/send-message/route.ts`

> [!note]+
>
> - get the username and content from the request body
> - find the user based on the username
> - check if the user is accepting messages
> - send new message
> - Push the new message to the user's messages array in db (already there is a messages[] in user model)
> - save the updated user document back to the database with the newly added message

```ts
import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { Message } from "@/model/User"; // message model type/interface

export async function POST(request: Request) {
  await dbConnect();
  const { username, content } = await request.json();

  try {
    // queries the database for a user with the provided username.
    // The exec() method is used to execute the query.
    const user = await UserModel.findOne({ username }).exec();

    if (!user) {
      return Response.json(
        { message: "User not found", success: false },
        { status: 404 }
      );
    }

    // Check if the user is accepting messages
    if (!user.isAcceptingMessages) {
      return Response.json(
        { message: "User is not accepting messages", success: false },
        { status: 403 } // 403 Forbidden status
      );
    }
    // Message model structure
    const newMessage = { content, createdAt: new Date() };

    // Push the new message to the user's messages array
    // The 'as Message' casts the new message to the Message type, ensuring that TS understands the structure.
    user.messages.push(newMessage as Message);
    // this saves the updated user document back to the database with the newly added message
    await user.save();

    return Response.json(
      { message: "Message sent successfully", success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding message:", error);
    return Response.json(
      { message: "Internal server error", success: false },
      { status: 500 }
    );
  }
}
```

# AI features integration

---

# React-Hook-Form, Debouncing

### Sign-up form

-

# OTP verification

# Handling Sign-in with authJS

#
