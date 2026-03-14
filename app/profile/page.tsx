import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      profilePicture: true,
    },
  });

  if (!user) {
    redirect("/");
  }

  return (
    <ProfileClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      }}
    />
  );
}
