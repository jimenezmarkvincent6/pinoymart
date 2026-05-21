import { SITE } from "./constants";
import type { CheckoutInfo } from "@/types";
import type { ResolvedCartLine } from "@/store/cart";
import type { Branch } from "@/data/branches";

interface BuildArgs {
  lines: ResolvedCartLine[];
  subtotal: number;
  info: CheckoutInfo;
  branch: Branch;
}

/**
 * Builds the prefilled WhatsApp order message.
 * Includes the chosen fulfillment method (pickup vs delivery) so the
 * branch staff knows immediately how to prepare the order.
 */
export function buildWhatsAppMessage({
  lines,
  subtotal,
  info,
  branch,
}: BuildArgs): string {
  const itemLines = lines
    .map(
      (l) =>
        `• ${l.name} (${l.unit}) × ${l.quantity}  —  ${SITE.currency} ${l.lineTotal.toFixed(
          2
        )}`
    )
    .join("\n");

  const isPickup = info.fulfillment === "pickup";
  const heading = isPickup
    ? "I'd like to PICK UP this order:"
    : "I'd like this order DELIVERED:";

  const addressLine = isPickup
    ? `Pickup at: ${branch.fullName} — ${branch.address}`
    : `Delivery to: ${info.deliveryLocation}`;

  return [
    `Hello ${branch.fullName}! 👋`,
    ``,
    heading,
    ``,
    itemLines,
    ``,
    `Subtotal: ${SITE.currency} ${subtotal.toFixed(2)}`,
    ``,
    `Branch: ${branch.name} (${branch.emirate})`,
    addressLine,
    `Name: ${info.name}`,
    `Contact Number: ${info.contact}`,
    info.notes ? `Notes: ${info.notes}` : null,
    ``,
    `Thank you!`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildWhatsAppLink(message: string, phone: string) {
  const sanitizedPhone = phone.replace(/[^0-9]/g, "");
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${sanitizedPhone}?text=${encoded}`;
}
