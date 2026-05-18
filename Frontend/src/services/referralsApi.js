import { apiJson } from './apiClient';

export function getMyReferralsRequest() {
  return apiJson('/api/me/referrals', {
    method: 'GET',
  });
}

export function getReferralSettingsRequest() {
  return apiJson('/api/admin/referrals/settings', {
    method: 'GET',
  });
}

export function updateReferralSettingsRequest(settings) {
  return apiJson('/api/admin/referrals/settings', {
    method: 'PUT',
    body: settings,
  });
}

export function getReferralsListRequest() {
  return apiJson('/api/admin/referrals', {
    method: 'GET',
  });
}

export function getWalletsListRequest() {
  return apiJson('/api/admin/wallets', {
    method: 'GET',
  });
}

export function adjustWalletBalanceRequest(payload) {
  return apiJson('/api/admin/wallets/adjust', {
    method: 'POST',
    body: payload,
  });
}
