// lib/medicationEvent.ts
type Medication = {
  id: string;
  name: string;
  intervalHours: number;
  firstDoseTime: string;
  lastTaken: string;
};

let callback: ((med: Medication) => void) | null = null;

export const setOnNewMedication = (fn: (med: Medication) => void) => {
  callback = fn;
};

export const emitNewMedication = (med: Medication) => {
  callback?.(med);
};

let updateCallback: ((med: Medication) => void) | null = null;

export const setOnUpdateMedication = (fn: (med: Medication) => void) => {
  updateCallback = fn;
};

export const emitUpdatedMedication = (med: Medication) => {
  updateCallback?.(med);
};
