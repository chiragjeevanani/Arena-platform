/**
 * Map API inventory row → Inventory.jsx table row shape.
 * @param {{ id: string, name: string, sku?: string, quantity: number, unitPrice: number }} item
 */
export function mapArenaInventoryItemToTableRow(item) {
  return {
    id: item.id,
    name: item.name,
    category: 'Equipment',
    sku: item.sku || '',
    stock: Number(item.quantity) || 0,
    minStock: 5,
    price: Number(item.unitPrice) || 0,
    fromApi: true,
  };
}

/**
 * Map API inventory row → RetailPOS.jsx catalog item.
 * @param {{ id: string, name: string, sku?: string, quantity: number, unitPrice: number }} item
 */
export function mapArenaInventoryItemToPosProduct(item) {
  return {
    id: item.id,
    name: item.name,
    price: Number(item.unitPrice) || 0,
    category: 'Equipment',
    stock: Number(item.quantity) || 0,
    sku: item.sku || '',
  };
}
