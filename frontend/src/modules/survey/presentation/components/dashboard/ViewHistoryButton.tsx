// src/modules/survey/presentation/components/dashboard/ViewHistoryButton.tsx

import { motion } from "framer-motion";
import { History } from "lucide-react";
import { useState } from "react";

import type { AssessmentRecord } from "@survey/infrastructure/storage/assessment-history.storage";

import { AssessmentHistoryModal } from "./AssessmentHistoryModal";

interface Props {
  readonly history: readonly AssessmentRecord[];
  readonly nationalId: string;
  readonly onSelectRecord?: (record: AssessmentRecord | null) => void;
  readonly label?: string;
}

export function ViewHistoryButton({
  history,
  nationalId,
  onSelectRecord,
  label = "پروفایل سلامت من",
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-day-primary/10 px-3 py-1.5 text-sm font-bold text-day-primary transition hover:bg-day-primary/15"
      >
        <History className="h-3.5 w-3.5" />
        {label}
      </motion.button>

      <AssessmentHistoryModal
        open={open}
        onClose={() => setOpen(false)}
        onSelectRecord={(record) => onSelectRecord?.(record)}
        history={history}
        nationalId={nationalId}
      />
    </>
  );
}
