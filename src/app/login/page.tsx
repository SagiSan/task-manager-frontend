"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";
import { loginSchema } from "@/schemas/loginSchema";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const parseResult = loginSchema.safeParse({ email, password });
    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors
        .map((err) => err.message)
        .join(", ");
      setError(errorMessages);
      return;
    }

    const result = await loginUser(email, password);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.message ?? "An unknown error occurred");
    }
  };

  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: "calc(100vh - 64px)" }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-300"
      >
        <h1 className="text-2xl font-semibold mb-6 text-center text-gray-700">
          Login
        </h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-6"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Login
        </button>

        <div className="relative my-6">
          <hr className="border-gray-300" />
          <span className="absolute inset-x-0 -top-3 text-gray-600 bg-white px-4 mx-auto w-fit">
            OR
          </span>
        </div>

        <button
          type="button"
          onClick={() => signIn("google")}
          className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M21.35 11.1h-9.11v2.96h5.53c-.26 1.4-1.04 2.58-2.15 3.38l3.23 2.51c1.89-1.75 2.98-4.3 2.98-7.17c0-.56-.05-1.12-.14-1.68z"
            />
          </svg>
          Sign in with Google
        </button>

        <button
          type="button"
          onClick={() => signIn("github")}
          className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 mt-3 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 2C6.48 2 2 6.48 2 12c0 4.41 2.87 8.15 6.84 9.49c.5.09.68-.21.68-.47c0-.23-.01-.84-.01-1.64c-2.49.54-3.02-1.04-3.02-1.04c-.45-1.15-1.1-1.46-1.1-1.46c-.9-.62.07-.61.07-.61c1 .07 1.53 1.04 1.53 1.04c.88 1.51 2.31 1.07 2.87.82c.09-.64.35-1.07.63-1.31c-1.99-.23-4.09-1-4.09-4.47c0-.99.35-1.79.92-2.42c-.09-.23-.4-1.16.09-2.42c0 0 .75-.24 2.46.92c.71-.2 1.47-.3 2.23-.3c.76 0 1.52.1 2.23.3c1.71-1.16 2.46-.92 2.46-.92c.49 1.26.18 2.19.09 2.42c.57.63.92 1.43.92 2.42c0 3.48-2.1 4.24-4.1 4.47c.36.31.69.92.69 1.86c0 1.35-.01 2.44-.01 2.78c0 .26.18.57.69.47c3.97-1.34 6.84-5.08 6.84-9.49c0-5.52-4.48-10-10-10z"
            />
          </svg>
          Sign in with GitHub
        </button>
      </form>
    </div>
  );
}
