import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function wd(value: string | null | undefined, defaultValue: string): string {
  if (value != null && value.trim().length != 0)
    return value;
  return defaultValue;
}
