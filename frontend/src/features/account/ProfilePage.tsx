import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LogOut, MapPin, User as UserIcon, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '@/lib/http';
import { useAuth } from '@/features/auth/AuthProvider';
import { logout } from '@/features/auth/api';
import { uploadAvatar } from './api';
import { getInitials } from '@/lib/utils';
import type { Address, UserProfile } from '@/types';

export function ProfilePage() {
  const { t } = useTranslation('account');
  const { user, profile, refresh } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(profile?.displayName ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [country, setCountry] = useState(profile?.country ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [addr, setAddr] = useState<Address>({ fullName: '', line1: '', city: '', zip: '', country: 'France' });
  const [saving, setSaving] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [savingPosition, setSavingPosition] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  if (!user || !profile) return null;

  const saveName = async () => {
    setSaving(true);
    try {
      await apiFetch<UserProfile>('/users/me', { method: 'PATCH', body: { displayName: name } });
      await refresh();
      toast.success(t('toasts.profileUpdated'));
    } catch { toast.error(t('toasts.updateError')); }
    finally { setSaving(false); }
  };

  const onPhotoFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const { url } = await uploadAvatar(file);
      await apiFetch<UserProfile>('/users/me', { method: 'PATCH', body: { photoURL: url } });
      await refresh();
      toast.success(t('toasts.photoUpdated'));
    } catch { toast.error(t('toasts.uploadFailed')); }
    finally { setUploadingPhoto(false); }
  };

  const saveBio = async () => {
    setSavingBio(true);
    try {
      await apiFetch<UserProfile>('/users/me', { method: 'PATCH', body: { bio } });
      await refresh();
      toast.success(t('toasts.profileUpdated'));
    } catch { toast.error(t('toasts.updateError')); }
    finally { setSavingBio(false); }
  };

  const savePosition = async () => {
    setSavingPosition(true);
    try {
      await apiFetch<UserProfile>('/users/me', { method: 'PATCH', body: { country, city } });
      await refresh();
      toast.success(t('toasts.profileUpdated'));
    } catch { toast.error(t('toasts.updateError')); }
    finally { setSavingPosition(false); }
  };

  const addAddress = async () => {
    if (!addr.line1 || !addr.city) { toast.error(t('toasts.addressIncomplete')); return; }
    try {
      const addresses = [...(profile.addresses ?? []), addr];
      await apiFetch<UserProfile>('/users/me', { method: 'PATCH', body: { addresses } });
      await refresh();
      setAddr({ fullName: '', line1: '', city: '', zip: '', country: 'France' });
      toast.success(t('toasts.addressAdded'));
    } catch { toast.error(t('toasts.genericError')); }
  };

  return (
    <div className="container-app max-w-2xl py-6">
      <h1 className="mb-6 text-2xl">{t('title')}</h1>

      <section className="mb-8 rounded-lg border border-line p-5">
        <h2 className="mb-3 flex items-center gap-2 text-lg"><UserIcon className="h-5 w-5" /> {t('profile.heading')}</h2>
        <p className="mb-4 text-sm text-muted">{profile.email}</p>

        <div className="mb-5 flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-lg font-bold text-paper">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt={t('profile.photoAlt')} className="h-full w-full object-cover" />
            ) : (
              getInitials(profile.displayName)
            )}
          </div>
          <div>
            <p className="mb-1 text-sm font-medium">{t('profile.photoLabel')}</p>
            <label className="btn-outline cursor-pointer px-4 py-1.5 text-sm">
              {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : t('profile.choosePhoto')}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => onPhotoFile(e.target.files)} disabled={uploadingPhoto} />
            </label>
          </div>
        </div>

        <div className="mb-5">
          <label className="text-sm">{t('profile.usernameLabel')}</label>
          <div className="mt-1 flex gap-2">
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            <button className="btn-primary px-5" onClick={saveName} disabled={saving}>{t('profile.save')}</button>
          </div>
        </div>

        <div className="mb-5">
          <label className="text-sm">{t('profile.bioLabel')}</label>
          <textarea
            className="input mt-1"
            rows={3}
            maxLength={300}
            placeholder={t('profile.bioPlaceholder')}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <button className="btn-outline mt-2" onClick={saveBio} disabled={savingBio}>{t('profile.save')}</button>
        </div>

        <div>
          <label className="text-sm">{t('profile.positionLabel')}</label>
          <div className="mt-1 grid gap-2 sm:grid-cols-2">
            <input className="input" placeholder={t('profile.countryPlaceholder')} value={country} onChange={(e) => setCountry(e.target.value)} />
            <input className="input" placeholder={t('profile.cityPlaceholder')} value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <button className="btn-outline mt-2" onClick={savePosition} disabled={savingPosition}>{t('profile.save')}</button>
        </div>
      </section>

      <section className="mb-8 rounded-lg border border-line p-5">
        <h2 className="mb-3 flex items-center gap-2 text-lg"><MapPin className="h-5 w-5" /> {t('addresses.heading')}</h2>
        {profile.addresses?.length > 0 ? (
          <ul className="mb-4 space-y-2">
            {profile.addresses.map((a, i) => (
              <li key={i} className="rounded border border-line p-3 text-sm">
                <p className="font-medium">{a.fullName}</p>
                <p className="text-muted">{a.line1}, {a.zip} {a.city}, {a.country}</p>
              </li>
            ))}
          </ul>
        ) : <p className="mb-4 text-sm text-muted">{t('addresses.empty')}</p>}

        <div className="grid gap-2 sm:grid-cols-2">
          <input className="input sm:col-span-2" placeholder={t('addresses.fullNamePlaceholder')} value={addr.fullName} onChange={(e) => setAddr({ ...addr, fullName: e.target.value })} />
          <input className="input sm:col-span-2" placeholder={t('addresses.addressPlaceholder')} value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} />
          <input className="input" placeholder={t('addresses.cityPlaceholder')} value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
          <input className="input" placeholder={t('addresses.zipPlaceholder')} value={addr.zip} onChange={(e) => setAddr({ ...addr, zip: e.target.value })} />
        </div>
        <button className="btn-outline mt-3" onClick={addAddress}>{t('addresses.add')}</button>
      </section>

      <button className="btn-outline w-full" onClick={() => logout().then(() => navigate('/'))}>
        <LogOut className="h-4 w-4" /> {t('logout')}
      </button>
    </div>
  );
}
