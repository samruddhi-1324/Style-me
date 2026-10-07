import { apiRequest } from '@/lib/api/apiClient';

export type CustomerProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  marketingOptIn: boolean;
};

export type CustomerAddress = {
  id: number;
  addressType: 'SHIPPING' | 'BILLING';
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  default: boolean;
};

export type CustomerAddressInput = Omit<CustomerAddress, 'id' | 'default'> & {
  default: boolean;
};

export const customerService = {
  getProfile(): Promise<CustomerProfile> {
    return apiRequest<CustomerProfile>('/api/v1/customers/me');
  },

  updateProfile(profile: Pick<CustomerProfile, 'marketingOptIn'>): Promise<CustomerProfile> {
    return apiRequest<CustomerProfile>('/api/v1/customers/me', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  },

  getAddresses(): Promise<CustomerAddress[]> {
    return apiRequest<CustomerAddress[]>('/api/v1/customers/me/addresses');
  },

  addAddress(address: CustomerAddressInput): Promise<CustomerAddress> {
    return apiRequest<CustomerAddress>('/api/v1/customers/me/addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    });
  },

  updateAddress(id: number, address: CustomerAddressInput): Promise<CustomerAddress> {
    return apiRequest<CustomerAddress>(`/api/v1/customers/me/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(address),
    });
  },

  deleteAddress(id: number): Promise<void> {
    return apiRequest<void>(`/api/v1/customers/me/addresses/${id}`, {
      method: 'DELETE',
    });
  },
};
