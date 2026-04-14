export interface LayoutItem {
  id: number;
  dateTime: string;
  durationMinutes: number;
}

export interface LayoutResult {
  colOf: Map<number, number>;
  totalOf: Map<number, number>;
}

// Assigns a column index and total-columns count to each appointment so
// overlapping ones are displayed side by side instead of stacked.
export function layoutAppointments(appts: LayoutItem[]): LayoutResult {
  const sorted = [...appts].sort(
    (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
  );
  const colOf   = new Map<number, number>();
  const endMs   = new Map<number, number>();
  const columns: LayoutItem[][] = [];

  for (const appt of sorted) {
    const start = new Date(appt.dateTime).getTime();
    const end   = start + appt.durationMinutes * 60_000;
    endMs.set(appt.id, end);

    let placed = false;
    for (let c = 0; c < columns.length; c++) {
      const last = columns[c][columns[c].length - 1];
      if ((endMs.get(last.id) ?? 0) <= start) {
        columns[c].push(appt);
        colOf.set(appt.id, c);
        placed = true;
        break;
      }
    }
    if (!placed) {
      colOf.set(appt.id, columns.length);
      columns.push([appt]);
    }
  }

  // For each appointment, the total columns = max column index among all
  // appointments that overlap with it, plus 1.
  const totalOf = new Map<number, number>();
  for (const appt of sorted) {
    const start = new Date(appt.dateTime).getTime();
    const end   = endMs.get(appt.id)!;
    let maxCol  = colOf.get(appt.id)!;
    for (const other of sorted) {
      if (other.id === appt.id) continue;
      const os = new Date(other.dateTime).getTime();
      const oe = endMs.get(other.id)!;
      if (start < oe && end > os) maxCol = Math.max(maxCol, colOf.get(other.id)!);
    }
    totalOf.set(appt.id, maxCol + 1);
  }

  return { colOf, totalOf };
}
