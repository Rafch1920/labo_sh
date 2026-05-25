"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { createAppointment, getAvailableSlots } from "@/features/appointments/appointment-actions";
import { Button } from "@/components/ui/button";

type AppointmentSchedulerProps = {
  requestId: string;
};

export function AppointmentScheduler({ requestId }: AppointmentSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [state, action, pending] = useActionState(createAppointment, { error: null });

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSelectedSlot("");
    getAvailableSlots(selectedDate).then((slots) => {
      setAvailableSlots(slots);
      setLoadingSlots(false);
    });
  }, [selectedDate]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="request_id" value={requestId} />
      <input type="hidden" name="scheduled_at" value={selectedSlot ? `${selectedDate}T${selectedSlot}:00` : ""} />

      {state?.error && (
        <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Date de rendez-vous</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={today}
          required
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      {selectedDate && (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Créneaux disponibles
            {loadingSlots && " (Chargement...)"}
          </label>
          {availableSlots.length === 0 && !loadingSlots ? (
            <p className="text-sm text-muted-foreground">
              Aucun créneau disponible pour cette date.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`text-sm px-3 py-2 rounded-md border text-center ${
                    selectedSlot === slot
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <Button type="submit" disabled={!selectedSlot || pending}>
        {pending ? "Confirmation..." : "Confirmer le rendez-vous"}
      </Button>
    </form>
  );
}
