import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKg(value: number, unit = "kg") {
  return `${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 }).format(value)} ${unit}`;
}
