import { format, formatDistanceToNow, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import {
  DATE_FORMAT,
  DATETIME_FORMAT,
  TIME_FORMAT,
  DATE_FORMAT_ISO,
} from "./constants";

/**
 * Format a date to French format (dd/MM/yyyy)
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (!isValid(dateObj)) return "—";

  return format(dateObj, DATE_FORMAT, { locale: fr });
}

/**
 * Format a date with time (dd/MM/yyyy HH:mm)
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (!isValid(dateObj)) return "—";

  return format(dateObj, DATETIME_FORMAT, { locale: fr });
}

/**
 * Format time only (HH:mm)
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "—";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (!isValid(dateObj)) return "—";

  return format(dateObj, TIME_FORMAT, { locale: fr });
}

/**
 * Format date to ISO string (yyyy-MM-dd) for input fields
 */
export function formatDateISO(date: Date | string | null | undefined): string {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (!isValid(dateObj)) return "";

  return format(dateObj, DATE_FORMAT_ISO);
}

/**
 * Format relative time (e.g., "il y a 3 jours")
 */
export function formatRelativeTime(
  date: Date | string | null | undefined
): string {
  if (!date) return "—";

  const dateObj = typeof date === "string" ? new Date(date) : date;
  if (!isValid(dateObj)) return "—";

  return formatDistanceToNow(dateObj, {
    addSuffix: true,
    locale: fr,
  });
}

/**
 * Format a number with French thousand separators
 * @example formatNumber(1234567.89) => "1 234 567,89"
 */
export function formatNumber(
  value: number | null | undefined,
  decimals: number = 0
): string {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a currency value in Euros
 * @example formatCurrency(1234.56) => "1 234,56 €"
 */
export function formatCurrency(
  value: number | null | undefined,
  currency: string = "EUR"
): string {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(value);
}

/**
 * Format a quantity with unit
 * @example formatQuantity(150, "kg") => "150 kg"
 * @example formatQuantity(1500, "g") => "1 500 g"
 */
export function formatQuantity(
  value: number | null | undefined,
  unit?: string | null
): string {
  if (value === null || value === undefined) return "—";

  const formattedNumber = formatNumber(value, value % 1 !== 0 ? 2 : 0);

  if (!unit) return formattedNumber;

  return `${formattedNumber} ${unit}`;
}

/**
 * Format a percentage
 * @example formatPercentage(0.1234) => "12,34 %"
 */
export function formatPercentage(
  value: number | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat("fr-FR", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a file size in bytes to human readable format
 * @example formatFileSize(1536) => "1,50 Ko"
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || bytes === 0) return "0 o";

  const units = ["o", "Ko", "Mo", "Go", "To"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${formatNumber(bytes / Math.pow(k, i), 2)} ${units[i]}`;
}

/**
 * Format a phone number (French format)
 * @example formatPhone("0123456789") => "01 23 45 67 89"
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "—";

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Format as French phone number
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5");
  }

  return phone;
}

/**
 * Truncate text with ellipsis
 * @example truncate("Long text here", 10) => "Long text..."
 */
export function truncate(text: string | null | undefined, maxLength: number = 50): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;

  return text.slice(0, maxLength).trim() + "...";
}
