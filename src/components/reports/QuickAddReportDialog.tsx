import * as React from "react";
import { FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReportFormWizard } from "@/components/reports/ReportFormWizard";

/**
 * Pinned "add report" entry point for the reports list — opens the
 * multi-step wizard in place so filing a report doesn't cost a page
 * navigation, and closes itself back to the (auto-refreshing) list the
 * moment the report actually saved.
 */
export function QuickAddReportDialog() {
  const [open, setOpen] = React.useState(false);
  // Bump on every open so the wizard remounts with a clean, freshly
  // remembered set of default values each time.
  const [instanceKey, setInstanceKey] = React.useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setInstanceKey((k) => k + 1);
      }}
    >
      <Button onClick={() => setOpen(true)} size="lg" className="w-full sm:w-auto">
        <FilePlus2 className="h-4 w-4" />
        افزودن گزارش جدید
      </Button>
      <DialogContent className="max-w-2xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle>ثبت گزارش جدید</DialogTitle>
        </DialogHeader>
        {open && <ReportFormWizard key={instanceKey} onSaved={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}
