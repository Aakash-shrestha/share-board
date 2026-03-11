import AuthForm from "@/app/components/ui/AuthForm";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 bg-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle,#d1d5db_1px,transparent_1px)] bg-size-[20px_20px]" />
      <AuthForm />
    </div>
  );
}
