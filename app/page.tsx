import AuthForm from "@/app/components/ui/AuthForm";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4">
      {/* Dot grid background matching the board */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-size-[20px_20px]" />
      {/* Subtle red glow */}
      <div className="absolute top-1/4 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-red-500/5 blur-3xl" />
      <AuthForm />
    </div>
  );
}
