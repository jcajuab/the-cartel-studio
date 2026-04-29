import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function JournalPage() {
  return (
    <div className="flex min-h-full items-center justify-center p-4 lg:p-6">
      <Card className="flex min-h-[22rem] w-full max-w-xl justify-center rounded-2xl bg-card/80 text-center">
        <CardHeader>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Locked preview
          </p>
          <CardTitle className="text-3xl font-semibold tracking-tight">
            Journal is sharpening its pencil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">
            The demo hints at the audit trail. The full journal, reversals and
            all, is premium content waiting for the unlock.
          </p>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            Back to dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
