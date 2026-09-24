// A plain CSS `border` on a Surface gets sliced at the corners: SmoothCorners
// clips content to the squircle path via clip-path, and a straight rectangular
// border doesn't follow that curve. Every Surface that needs a visible edge
// must use this `middleBorder` (stroked along the squircle path itself)
// instead of a `border-*` Tailwind class.
export const SQUIRCLE_BORDER = {
  width: 1,
  opacity: 1,
  color: "var(--ui-border, rgb(138 138 141 / 0.23))",
} as const;
