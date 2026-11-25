/**
 * Who can book, pay and use the wallet in the customer app: customers and arena staff
 * (coaches, arena admins, receptionists) with the same login. Super Admin is excluded.
 */
export const CUSTOMER_APP_ROLES = ['CUSTOMER', 'COACH', 'ARENA_ADMIN', 'RECEPTIONIST'];

export function canUseCustomerApp(user) {
  return Boolean(user && CUSTOMER_APP_ROLES.includes(user.role));
}
