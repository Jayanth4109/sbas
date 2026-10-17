import type { SizeUnit } from "@/lib/types";

export const SIZE_UNITS: { value: SizeUnit; label: string }[] = [
  { value: "g", label: "Grams" },
  { value: "ml", label: "ml" },
  { value: "tablets", label: "Tablets" },
  { value: "capsules", label: "Capsules" },
  { value: "pcs", label: "Pieces" },
];

const UNIT_SHORT: Record<SizeUnit, string> = {
  g: "g",
  ml: "ml",
  tablets: "tablets",
  capsules: "capsules",
  pcs: "pcs",
};

const UNIT_VALUES = new Set<string>(SIZE_UNITS.map((u) => u.value));

/** "100 g · 200 g" for the storefront; null when no sizes are set. */
export function formatSizes(unit: SizeUnit | null | undefined, sizes: number[] | null | undefined): string | null {
  if (!unit || !sizes?.length) return null;
  return sizes.map((s) => `${s} ${UNIT_SHORT[unit]}`).join(" · ");
}

type Parsed = { ok: true; unit: SizeUnit | null; sizes: number[] } | { ok: false; error: string };

/** Validates the raw form values; empty sizes clears both fields. */
export function parseSizes(unitRaw: FormDataEntryValue | null, sizesRaw: FormDataEntryValue | null): Parsed {
  const text = typeof sizesRaw === "string" ? sizesRaw : "";
  const parts = text.split(/[,\s]+/).filter(Boolean);
  if (parts.length === 0) return { ok: true, unit: null, sizes: [] };
  const unit = typeof unitRaw === "string" ? unitRaw : "";
  if (!UNIT_VALUES.has(unit)) return { ok: false, error: "Pick a unit for the sizes" };
  const sizes = parts.map(Number);
  if (sizes.some((n) => !Number.isFinite(n) || n <= 0)) {
    return { ok: false, error: "Sizes must be numbers like 100, 200, 500" };
  }
  return { ok: true, unit: unit as SizeUnit, sizes: [...new Set(sizes)].sort((a, b) => a - b) };
}
