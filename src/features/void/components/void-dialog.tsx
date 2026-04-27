"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { voidTransaction } from "@/features/void/actions";
import { useRole } from "@/hooks/use-role";

interface Props {
  transactionId: string;
}

type VoidState = { error?: string } | null;

export default function VoidDialog({ transactionId }: Props) {
  const { role } = useRole();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const [state, dispatch, isPending] = useActionState<VoidState, FormData>(
    async (_prev, _formData) => {
      const result = await voidTransaction(transactionId, reason, role);
      if (!result.error) {
        setOpen(false);
        setReason("");
        return null;
      }
      return result;
    },
    null,
  );

  const triggerButton = (
    <Button
      variant="destructive"
      disabled={role === "Bartender"}
      onClick={() => role === "Manager" && setOpen(true)}
      type="button"
    >
      Void
    </Button>
  );

  return (
    <TooltipProvider>
      {role === "Bartender" ? (
        <Tooltip>
          <TooltipTrigger>
            <span>{triggerButton}</span>
          </TooltipTrigger>
          <TooltipContent>
            Manager-only action — switch role to void.
          </TooltipContent>
        </Tooltip>
      ) : (
        triggerButton
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Void Transaction</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <label htmlFor="void-reason" className="text-sm font-medium">
              Reason <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="void-reason"
              placeholder="Enter void reason…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isPending}
              rows={3}
            />
            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              type="button"
            >
              Cancel
            </Button>
            <form action={dispatch}>
              <Button
                variant="destructive"
                type="submit"
                disabled={isPending || !reason.trim()}
              >
                {isPending ? "Voiding…" : "Confirm Void"}
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
