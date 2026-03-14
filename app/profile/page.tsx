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

  //friends stuff
  // people i share my board with
  const myBoardShares = await prisma.boardShare.findMany({
    where: {
      board: { ownerId: userId },
    },
    include: {
      sharedWith: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePicture: true,
        },
      },
    },
  });

  const sharedWithMe = await prisma.boardShare.findMany({
    where: { sharedWithId: userId },
    include: {
      board: {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePicture: true,
            },
          },
        },
      },
    },
  });

  const friendsMap = new Map<
    string,
    { id: string; name: string; email: string; profilePicture: string | null }
  >();

  for (const share of myBoardShares) {
    friendsMap.set(share.sharedWith.id, share.sharedWith);
  }
  for (const share of sharedWithMe) {
    friendsMap.set(share.board.owner.id, share.board.owner);
  }

  const friends = Array.from(friendsMap.values());
  console.log("Friends:", friends);
  return (
    <ProfileClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      }}
      friends={friends}
    />
  );
}
