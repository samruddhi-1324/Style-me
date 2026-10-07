'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  customerService,
  type CustomerAddress,
  type CustomerAddressInput,
  type CustomerProfile,
} from '@/lib/services/customerService';

const emptyAddress: CustomerAddressInput = {
  addressType: 'SHIPPING',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  default: false,
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export default function AccountSettings() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPreference, setSavingPreference] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState<CustomerAddressInput>(emptyAddress);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([customerService.getProfile(), customerService.getAddresses()])
      .then(([customerProfile, customerAddresses]) => {
        if (!active) return;
        setProfile(customerProfile);
        setAddresses(customerAddresses);
      })
      .catch((loadError: unknown) => {
        if (active) setError(getErrorMessage(loadError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setShowAddressForm(false);
    setAddressForm(emptyAddress);
  };

  const startEditingAddress = (address: CustomerAddress) => {
    setError('');
    setNotice('');
    setAddressForm({
      addressType: address.addressType,
      firstName: address.firstName,
      lastName: address.lastName,
      phoneNumber: address.phoneNumber ?? '',
      line1: address.line1,
      line2: address.line2 ?? '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      default: address.default,
    });
    setEditingAddressId(address.id);
    setShowAddressForm(true);
  };

  const saveAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingAddress(true);
    setError('');
    setNotice('');
    try {
      if (editingAddressId === null) {
        const created = await customerService.addAddress(addressForm);
        setAddresses((current) => [
          ...current.map((item) => ({
            ...item,
            default: addressForm.default ? false : item.default,
          })),
          created,
        ]);
        setNotice('Address added.');
      } else {
        const updated = await customerService.updateAddress(editingAddressId, addressForm);
        setAddresses((current) => current.map((item) => ({
          ...item,
          ...(addressForm.default ? { default: false } : {}),
          ...(item.id === editingAddressId ? updated : {}),
        })));
        setNotice('Address updated.');
      }
      resetAddressForm();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSavingAddress(false);
    }
  };

  const deleteAddress = async (address: CustomerAddress) => {
    if (!window.confirm(`Delete the address at ${address.line1}, ${address.city}?`)) return;
    setDeletingAddressId(address.id);
    setError('');
    setNotice('');
    try {
      await customerService.deleteAddress(address.id);
      setAddresses((current) => current.filter((item) => item.id !== address.id));
      setNotice('Address deleted.');
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    } finally {
      setDeletingAddressId(null);
    }
  };

  const setDefaultAddress = async (address: CustomerAddress) => {
    setError('');
    setNotice('');
    try {
      const updated = await customerService.updateAddress(address.id, {
        addressType: address.addressType,
        firstName: address.firstName,
        lastName: address.lastName,
        phoneNumber: address.phoneNumber ?? '',
        line1: address.line1,
        line2: address.line2 ?? '',
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        default: true,
      });
      setAddresses((current) => current.map((item) => ({
        ...item,
        default: item.id === updated.id,
      })));
      setNotice('Default address updated.');
    } catch (updateError) {
      setError(getErrorMessage(updateError));
    }
  };

  const saveMarketingPreference = async (marketingOptIn: boolean) => {
    if (!profile) return;
    setSavingPreference(true);
    setError('');
    setNotice('');
    try {
      const updated = await customerService.updateProfile({ marketingOptIn });
      setProfile(updated);
      setNotice('Email preference saved.');
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSavingPreference(false);
    }
  };

  const setAddressField = (field: keyof CustomerAddressInput, value: string | boolean) => {
    setAddressForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <>
      <section id="addresses" className="account-section account-settings-section">
        <div className="account-settings-heading">
          <div>
            <h3>Addresses</h3>
            <p>Manage delivery and billing addresses saved to your StyleMe account.</p>
          </div>
          {!showAddressForm && (
            <button
              className="btn-outline"
              type="button"
              onClick={() => {
                setError('');
                setNotice('');
                setAddressForm(emptyAddress);
                setEditingAddressId(null);
                setShowAddressForm(true);
              }}
            >
              + Add address
            </button>
          )}
        </div>

        {loading && <p className="account-settings-message">Loading your saved addresses and preferences…</p>}
        {error && <p className="account-settings-error" role="alert">{error}</p>}
        {notice && <p className="account-settings-notice" role="status">{notice}</p>}

        {!loading && !showAddressForm && addresses.length === 0 && (
          <p className="account-empty-state">No saved addresses yet. Add one to make future checkout easier.</p>
        )}

        <div className="account-address-list">
          {addresses.map((address) => (
            <article className="account-address-card" key={address.id}>
              <div className="account-address-card-heading">
                <div>
                  <strong>{address.firstName} {address.lastName}</strong>
                  <span className="account-address-type">{address.addressType.toLowerCase()}</span>
                  {address.default && <span className="account-default-badge">Default</span>}
                </div>
                <div className="account-address-actions">
                  {!address.default && (
                    <button type="button" onClick={() => void setDefaultAddress(address)}>Set default</button>
                  )}
                  <button type="button" onClick={() => startEditingAddress(address)}>Edit</button>
                  <button
                    type="button"
                    className="account-delete-action"
                    disabled={deletingAddressId === address.id}
                    onClick={() => void deleteAddress(address)}
                  >
                    {deletingAddressId === address.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
              <p>{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
              <p>{address.city}, {address.state} {address.postalCode}, {address.country}</p>
              {address.phoneNumber && <p>Phone: {address.phoneNumber}</p>}
            </article>
          ))}
        </div>

        {showAddressForm && (
          <form className="account-address-form" onSubmit={(event) => void saveAddress(event)}>
            <h4>{editingAddressId === null ? 'Add an address' : 'Edit address'}</h4>
            <label>
              Address type
              <select
                className="input-field"
                value={addressForm.addressType}
                onChange={(event) => setAddressField('addressType', event.target.value)}
              >
                <option value="SHIPPING">Shipping</option>
                <option value="BILLING">Billing</option>
              </select>
            </label>
            <div className="account-address-form-grid">
              <label>First name<input className="input-field" required autoComplete="given-name" value={addressForm.firstName} onChange={(event) => setAddressField('firstName', event.target.value)} /></label>
              <label>Last name<input className="input-field" required autoComplete="family-name" value={addressForm.lastName} onChange={(event) => setAddressField('lastName', event.target.value)} /></label>
              <label className="account-address-form-wide">Address line 1<input className="input-field" required autoComplete="address-line1" value={addressForm.line1} onChange={(event) => setAddressField('line1', event.target.value)} /></label>
              <label className="account-address-form-wide">Address line 2 <span className="account-field-optional">(optional)</span><input className="input-field" autoComplete="address-line2" value={addressForm.line2 ?? ''} onChange={(event) => setAddressField('line2', event.target.value)} /></label>
              <label>City<input className="input-field" required autoComplete="address-level2" value={addressForm.city} onChange={(event) => setAddressField('city', event.target.value)} /></label>
              <label>State<input className="input-field" required autoComplete="address-level1" value={addressForm.state} onChange={(event) => setAddressField('state', event.target.value)} /></label>
              <label>Postal code<input className="input-field" required autoComplete="postal-code" value={addressForm.postalCode} onChange={(event) => setAddressField('postalCode', event.target.value)} /></label>
              <label>Country<input className="input-field" required autoComplete="country-name" value={addressForm.country} onChange={(event) => setAddressField('country', event.target.value)} /></label>
              <label>Phone <span className="account-field-optional">(optional)</span><input className="input-field" type="tel" autoComplete="tel" value={addressForm.phoneNumber ?? ''} onChange={(event) => setAddressField('phoneNumber', event.target.value)} /></label>
            </div>
            <label className="account-checkbox-label">
              <input type="checkbox" checked={addressForm.default} onChange={(event) => setAddressField('default', event.target.checked)} />
              Make this my default address
            </label>
            <div className="account-address-form-actions">
              <button className="btn-outline" type="button" disabled={savingAddress} onClick={resetAddressForm}>Cancel</button>
              <button className="btn-primary" type="submit" disabled={savingAddress}>
                {savingAddress ? 'Saving…' : editingAddressId === null ? 'Save address' : 'Update address'}
              </button>
            </div>
          </form>
        )}
      </section>

      <section id="preferences" className="account-section account-settings-section">
        <div className="account-settings-heading">
          <div>
            <h3>Preferences</h3>
            <p>Choose whether StyleMe may send you product news and offers.</p>
          </div>
        </div>
        {!loading && profile && (
          <div className="account-preference-row">
            <div>
              <strong>Product updates and offers</strong>
              <p>Receive occasional marketing emails about new frames, offers, and StyleMe news.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={profile.marketingOptIn}
              aria-label="Receive product updates and offers by email"
              className={`account-switch${profile.marketingOptIn ? ' is-on' : ''}`}
              disabled={savingPreference}
              onClick={() => void saveMarketingPreference(!profile.marketingOptIn)}
            >
              <span />
            </button>
          </div>
        )}
        <p className="account-privacy-note">Essential account and order messages are not controlled by this preference.</p>
      </section>
    </>
  );
}
