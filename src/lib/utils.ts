// src/lib/utils.ts

import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges Tailwind class names conditionally.
 */
export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}
