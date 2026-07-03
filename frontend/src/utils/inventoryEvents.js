export const INVENTORY_UPDATED_EVENT = "inventory:updated";

export function notifyInventoryUpdated() {
  window.dispatchEvent(new Event(INVENTORY_UPDATED_EVENT));
}
