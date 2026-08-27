export const CAKE_WIDTH = 220;
export const SPONGE_HEIGHT = 34;
export const FILLING_HEIGHT = 12;
export const DEFAULT_SPONGE_COLOR = "#EADFC0";
export const DEFAULT_FILLING_COLOR = "#D9B98C";

export function totalCakeHeight(fillingCount: number): number {
  const spongeCount = fillingCount + 1;
  return spongeCount * SPONGE_HEIGHT + fillingCount * FILLING_HEIGHT;
}
