import { SITE } from "./constants";

export function formatPrice(value: number) {
  return `${SITE.currency} ${value.toFixed(2)}`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-AE").format(value);
}
