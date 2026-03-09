import AuthForm from "@/app/components/ui/AuthForm";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-150 w-150 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-125 w-125 rounded-full bg-blue-600/10 blur-3xl" />
      </div>
      <AuthForm />
    </div>
  );
}
