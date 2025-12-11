import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          comments: true,
          ratings: true,
          savedWorkflows: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-mono">Users</h1>
        <Badge variant="outline" className="font-mono">
          Total: {users.length}
        </Badge>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Activity</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span title="Comments">💬 {user._count.comments}</span>
                    <span title="Ratings">⭐ {user._count.ratings}</span>
                    <span title="Saved">❤️ {user._count.savedWorkflows}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
