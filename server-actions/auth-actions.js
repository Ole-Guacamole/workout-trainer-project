"use server";

import { createAuthSession } from "@/lib/auth";
import { hashUserPassword } from "@/lib/hash";
import { createUser } from "@/lib/user";
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

  const hashedPassword = hashUserPassword(password)
  try {
    createUser(email, hashedPassword);
    await createAuthSession(id);
    redirect("/training");
}
  catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return { errors: { email: "Email already in use." } };
    }
    throw error;
  }

 
    
}