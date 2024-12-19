"use server";

import { createAuthSession, destroySession } from "@/lib/auth";
import { hashUserPassword, verifyPassword } from "@/lib/hash";
import { createUser, getUserByEmail } from "@/lib/user";
import { redirect } from "next/navigation";

export async function signup(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  // Validation

  let errors = {};

  if (!email.includes("@")) {
    errors.email = "Please enter a valid email address.";
  }

  if (password.trim().length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors: errors };
  }

  // store it in the database (create new user)

  const hashedPassword = hashUserPassword(password);
  try {
    const id = createUser(email, hashedPassword);
    if (!id) {
      throw new Error("Failed to create user");
    }
    await createAuthSession(id);
    redirect("/training");
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return { errors: { email: "Email already in use." } };
    }
    throw error;
  }
}

export async function login(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const existingUser = getUserByEmail(email);

  if (!existingUser) {
    return { errors: { email: "User not found. Check credentials." } };
  }

  const isValidPassword = await verifyPassword(
    existingUser.password,
    password
  );

  if (!isValidPassword) {
    return { errors: { password: "Incorrect password." } };
  }

  await createAuthSession(existingUser.id);
    redirect("/training");
}

export async function auth(mode, prevState, formData) {
  if (mode === "login") {
    return login(prevState, formData);
  } else {
    return signup(prevState, formData);
  }
}

export async function logout() {
  await destroySession // remove auth session
  redirect("/");
}
