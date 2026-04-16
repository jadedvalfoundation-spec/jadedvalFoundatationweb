import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-80 animate-pulse rounded-md bg-gray-100" />}>
      <LoginForm />
    </Suspense>
  );
}
