import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-full items-center justify-center px-6 py-24">
      <SignIn />
    </div>
  );
}
