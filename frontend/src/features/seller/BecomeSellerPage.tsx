import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Store, Clock, CheckCircle, XCircle, Upload, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthProvider';
import { useApplyAsSeller } from './hooks';
import { uploadIdentityDocument } from './api';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

export function BecomeSellerPage() {
  const { t } = useTranslation('seller');
  const STEPS = [t('becomeSeller.steps.store'), t('becomeSeller.steps.identity'), t('becomeSeller.steps.documents'), t('becomeSeller.steps.recap')] as const;
  const ID_TYPE_LABEL: Record<'national_id' | 'passport', string> = {
    national_id: t('becomeSeller.idTypeLabel.national_id'),
    passport: t('becomeSeller.idTypeLabel.passport'),
  };
  const { loading, user, sellerStatus, refresh } = useAuth();
  const [step, setStep] = useState(0);
  const [storeName, setStoreName] = useState('');
  const [bio, setBio] = useState('');
  const [idType, setIdType] = useState<'national_id' | 'passport'>('national_id');
  const [idNumber, setIdNumber] = useState('');
  const [idCountry, setIdCountry] = useState('');
  const [fullNameOnId, setFullNameOnId] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [idDocumentRef, setIdDocumentRef] = useState<string | null>(null);
  const [idDocumentPreview, setIdDocumentPreview] = useState<string | null>(null);
  const [uploadingIdDocument, setUploadingIdDocument] = useState(false);
  const [idDocumentBackRef, setIdDocumentBackRef] = useState<string | null>(null);
  const [idDocumentBackPreview, setIdDocumentBackPreview] = useState<string | null>(null);
  const [uploadingIdDocumentBack, setUploadingIdDocumentBack] = useState(false);
  const [profilePhotoRef, setProfilePhotoRef] = useState<string | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
  const apply = useApplyAsSeller();

  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login?redirect=/devenir-vendeur" replace />;
  if (sellerStatus === 'approved') return <Navigate to="/espace-vendeur" replace />;

  const onIdDocumentFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setIdDocumentPreview(URL.createObjectURL(file));
    setUploadingIdDocument(true);
    try {
      const { ref } = await uploadIdentityDocument(file, 'id-document');
      setIdDocumentRef(ref);
    } catch {
      toast.error(t('becomeSeller.errors.idDocumentUploadFailed'));
      setIdDocumentPreview(null);
    } finally {
      setUploadingIdDocument(false);
    }
  };

  const onIdDocumentBackFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setIdDocumentBackPreview(URL.createObjectURL(file));
    setUploadingIdDocumentBack(true);
    try {
      const { ref } = await uploadIdentityDocument(file, 'id-document-back');
      setIdDocumentBackRef(ref);
    } catch {
      toast.error(t('becomeSeller.errors.idDocumentBackUploadFailed'));
      setIdDocumentBackPreview(null);
    } finally {
      setUploadingIdDocumentBack(false);
    }
  };

  const onProfilePhotoFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setProfilePhotoPreview(URL.createObjectURL(file));
    setUploadingProfilePhoto(true);
    try {
      const { ref } = await uploadIdentityDocument(file, 'profile-photo');
      setProfilePhotoRef(ref);
    } catch {
      toast.error(t('becomeSeller.errors.profilePhotoUploadFailed'));
      setProfilePhotoPreview(null);
    } finally {
      setUploadingProfilePhoto(false);
    }
  };

  const goNext = () => {
    if (step === 0 && !storeName.trim()) { toast.error(t('becomeSeller.errors.storeNameRequired')); return; }
    if (step === 1 && (!idNumber.trim() || !idCountry.trim() || !fullNameOnId.trim() || !dateOfBirth)) {
      toast.error(t('becomeSeller.errors.identityIncomplete'));
      return;
    }
    if (step === 2) {
      if (!idDocumentRef) { toast.error(t('becomeSeller.errors.idDocumentRequired')); return; }
      if (idType === 'national_id' && !idDocumentBackRef) { toast.error(t('becomeSeller.errors.idDocumentBackRequired')); return; }
      if (!profilePhotoRef) { toast.error(t('becomeSeller.errors.profilePhotoRequired')); return; }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    if (!storeName.trim()) { toast.error(t('becomeSeller.errors.storeNameRequired')); return; }
    if (!idNumber.trim() || !idCountry.trim() || !fullNameOnId.trim() || !dateOfBirth) {
      toast.error(t('becomeSeller.errors.identityIncomplete'));
      return;
    }
    if (!idDocumentRef) { toast.error(t('becomeSeller.errors.idDocumentRequired')); return; }
    if (idType === 'national_id' && !idDocumentBackRef) { toast.error(t('becomeSeller.errors.idDocumentBackRequired')); return; }
    if (!profilePhotoRef) { toast.error(t('becomeSeller.errors.profilePhotoRequired')); return; }
    try {
      await apply.mutateAsync({
        storeName: storeName.trim(),
        bio: bio.trim() || undefined,
        idType,
        idNumber: idNumber.trim(),
        idCountry: idCountry.trim(),
        fullNameOnId: fullNameOnId.trim(),
        dateOfBirth,
        idDocumentRef,
        idDocumentBackRef: idType === 'national_id' ? (idDocumentBackRef ?? undefined) : undefined,
        profilePhotoRef,
      });
      await refresh();
      toast.success(t('becomeSeller.submitSuccess'));
    } catch {
      toast.error(t('becomeSeller.errors.submitFailed'));
    }
  };

  if (sellerStatus === 'pending') {
    return (
      <div className="container-app py-16 text-center">
        <Clock className="mx-auto mb-4 h-12 w-12 text-amber-500" />
        <h1 className="mb-2 text-2xl font-bold">{t('becomeSeller.pending.title')}</h1>
        <p className="text-muted">{t('becomeSeller.pending.text')}</p>
        <Link to="/" className="mt-6 inline-block text-sm underline">{t('becomeSeller.pending.backHome')}</Link>
      </div>
    );
  }

  if (sellerStatus === 'rejected') {
    return (
      <div className="container-app py-16 text-center">
        <XCircle className="mx-auto mb-4 h-12 w-12 text-sale" />
        <h1 className="mb-2 text-2xl font-bold">{t('becomeSeller.rejected.title')}</h1>
        <p className="text-muted">{t('becomeSeller.rejected.text')}</p>
        {user?.sellerProfile?.reviewNote && (
          <div className="mx-auto mt-4 max-w-md rounded-lg border border-line bg-gray-50 p-4 text-left text-sm text-muted">
            <p className="font-medium text-ink">{t('becomeSeller.rejected.reasonLabel')}</p>
            <p className="mt-1">{user.sellerProfile.reviewNote}</p>
          </div>
        )}
        <Link to="/" className="mt-6 inline-block text-sm underline">{t('becomeSeller.pending.backHome')}</Link>
      </div>
    );
  }

  const uploading = uploadingIdDocument || uploadingIdDocumentBack || uploadingProfilePhoto;

  return (
    <div className="container-app py-12">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <Store className="mx-auto mb-4 h-12 w-12" />
          <h1 className="text-3xl font-bold">{t('becomeSeller.heading.title')}</h1>
          <p className="mt-2 text-muted">{t('becomeSeller.heading.subtitle')}</p>
        </div>

        {/* Stepper */}
        <div className="mb-2 flex items-center">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                aria-label={label}
                aria-current={i === step ? 'step' : undefined}
                onClick={() => { if (i < step) setStep(i); }}
                disabled={i > step}
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition',
                  i <= step ? 'bg-ink text-paper' : 'bg-gray-100 text-muted',
                  i < step && 'cursor-pointer',
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </button>
              {i < STEPS.length - 1 && (
                <div className={cn('mx-1 h-0.5 flex-1', i < step ? 'bg-ink' : 'bg-gray-200')} />
              )}
            </div>
          ))}
        </div>
        <p className="mb-8 text-center text-sm font-medium text-muted">
          {t('becomeSeller.stepIndicator', { current: step + 1, total: STEPS.length, label: STEPS[step] })}
        </p>

        <div className="space-y-5">
          {step === 0 && (
            <>
              <div>
                <label className="label">{t('becomeSeller.store.nameLabel')}</label>
                <input
                  className="input"
                  placeholder={t('becomeSeller.store.namePlaceholder')}
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              <div>
                <label className="label">{t('becomeSeller.store.bioLabel')}</label>
                <textarea
                  className="input"
                  rows={4}
                  placeholder={t('becomeSeller.store.bioPlaceholder')}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                />
              </div>

              <div className="rounded-lg border border-line bg-gray-50 p-4 text-sm text-muted">
                <p className="flex items-center gap-2 font-medium text-ink"><CheckCircle className="h-4 w-4 text-green-600" /> {t('becomeSeller.store.benefitsTitle')}</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>{t('becomeSeller.store.benefit1')}</li>
                  <li>{t('becomeSeller.store.benefit2')}</li>
                  <li>{t('becomeSeller.store.benefit3')}</li>
                </ul>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="font-medium">{t('becomeSeller.identity.title')}</h2>
              <p className="-mt-3 text-sm text-muted">{t('becomeSeller.identity.subtitle')}</p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">{t('becomeSeller.identity.idTypeLabel')}</label>
                  <select
                    className="input"
                    value={idType}
                    onChange={(e) => {
                      const next = e.target.value as 'national_id' | 'passport';
                      setIdType(next);
                      if (next === 'passport') {
                        setIdDocumentBackRef(null);
                        setIdDocumentBackPreview(null);
                      }
                    }}
                    required
                  >
                    <option value="national_id">{t('becomeSeller.idTypeLabel.national_id')}</option>
                    <option value="passport">{t('becomeSeller.idTypeLabel.passport')}</option>
                  </select>
                </div>
                <div>
                  <label className="label">{t('becomeSeller.identity.idNumberLabel')}</label>
                  <input
                    className="input"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">{t('becomeSeller.identity.idCountryLabel')}</label>
                  <input
                    className="input"
                    placeholder={t('becomeSeller.identity.idCountryPlaceholder')}
                    value={idCountry}
                    onChange={(e) => setIdCountry(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">{t('becomeSeller.identity.dateOfBirthLabel')}</label>
                  <input
                    className="input"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">{t('becomeSeller.identity.fullNameLabel')}</label>
                <input
                  className="input"
                  value={fullNameOnId}
                  onChange={(e) => setFullNameOnId(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-medium">{t('becomeSeller.steps.documents')}</h2>
              <div className="flex flex-wrap gap-4">
                <div className="w-full min-[420px]:min-w-[140px] min-[420px]:flex-1">
                  <label className="label">
                    {idType === 'national_id' ? t('becomeSeller.documents.idDocumentFrontNationalLabel') : t('becomeSeller.documents.idDocumentFrontPassportLabel')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {idDocumentPreview ? (
                      <div className="group relative h-24 w-20 shrink-0 overflow-hidden rounded border border-line">
                        <img src={idDocumentPreview} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          className="absolute right-0.5 top-0.5 rounded-full bg-white/80 p-0.5 opacity-0 group-hover:opacity-100"
                          onClick={() => { setIdDocumentPreview(null); setIdDocumentRef(null); }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex h-24 w-20 shrink-0 cursor-pointer flex-col items-center justify-center rounded border border-dashed border-line hover:bg-gray-50">
                        {uploadingIdDocument ? <Loader2 className="h-5 w-5 animate-spin text-muted" /> : <Upload className="h-5 w-5 text-muted" />}
                        <span className="mt-1 text-xs text-muted">{t('becomeSeller.documents.uploadLabel')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => onIdDocumentFile(e.target.files)}
                        />
                      </label>
                    )}
                  </div>
                </div>
                {idType === 'national_id' && (
                  <div className="w-full min-[420px]:min-w-[140px] min-[420px]:flex-1">
                    <label className="label">{t('becomeSeller.documents.idDocumentBackLabel')}</label>
                    <div className="flex flex-wrap gap-2">
                      {idDocumentBackPreview ? (
                        <div className="group relative h-24 w-20 shrink-0 overflow-hidden rounded border border-line">
                          <img src={idDocumentBackPreview} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            className="absolute right-0.5 top-0.5 rounded-full bg-white/80 p-0.5 opacity-0 group-hover:opacity-100"
                            onClick={() => { setIdDocumentBackPreview(null); setIdDocumentBackRef(null); }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex h-24 w-20 shrink-0 cursor-pointer flex-col items-center justify-center rounded border border-dashed border-line hover:bg-gray-50">
                          {uploadingIdDocumentBack ? <Loader2 className="h-5 w-5 animate-spin text-muted" /> : <Upload className="h-5 w-5 text-muted" />}
                          <span className="mt-1 text-xs text-muted">{t('becomeSeller.documents.uploadLabel')}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => onIdDocumentBackFile(e.target.files)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}
                <div className="w-full min-[420px]:min-w-[140px] min-[420px]:flex-1">
                  <label className="label">{t('becomeSeller.documents.profilePhotoLabel')}</label>
                  <div className="flex flex-wrap gap-2">
                    {profilePhotoPreview ? (
                      <div className="group relative h-24 w-20 shrink-0 overflow-hidden rounded border border-line">
                        <img src={profilePhotoPreview} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          className="absolute right-0.5 top-0.5 rounded-full bg-white/80 p-0.5 opacity-0 group-hover:opacity-100"
                          onClick={() => { setProfilePhotoPreview(null); setProfilePhotoRef(null); }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex h-24 w-20 shrink-0 cursor-pointer flex-col items-center justify-center rounded border border-dashed border-line hover:bg-gray-50">
                        {uploadingProfilePhoto ? <Loader2 className="h-5 w-5 animate-spin text-muted" /> : <Upload className="h-5 w-5 text-muted" />}
                        <span className="mt-1 text-xs text-muted">{t('becomeSeller.documents.uploadLabel')}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => onProfilePhotoFile(e.target.files)}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-medium">{t('becomeSeller.recap.title')}</h2>
              <p className="-mt-3 text-sm text-muted">{t('becomeSeller.recap.subtitle')}</p>

              <div className="rounded-lg border border-line p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{t('becomeSeller.recap.storeTitle')}</p>
                  <button type="button" className="text-xs underline" onClick={() => setStep(0)}>{t('becomeSeller.recap.edit')}</button>
                </div>
                <p className="mt-2 text-sm">{storeName}</p>
                {bio.trim() && <p className="mt-1 text-sm text-muted">{bio}</p>}
              </div>

              <div className="rounded-lg border border-line p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{t('becomeSeller.recap.identityTitle')}</p>
                  <button type="button" className="text-xs underline" onClick={() => setStep(1)}>{t('becomeSeller.recap.edit')}</button>
                </div>
                <dl className="mt-2 grid grid-cols-1 gap-y-1 text-sm min-[380px]:grid-cols-2">
                  <dt className="text-muted">{t('becomeSeller.recap.idType')}</dt>
                  <dd>{ID_TYPE_LABEL[idType]}</dd>
                  <dt className="text-muted">{t('becomeSeller.recap.idNumber')}</dt>
                  <dd>{idNumber}</dd>
                  <dt className="text-muted">{t('becomeSeller.recap.idCountry')}</dt>
                  <dd>{idCountry}</dd>
                  <dt className="text-muted">{t('becomeSeller.recap.dateOfBirth')}</dt>
                  <dd>{dateOfBirth}</dd>
                  <dt className="text-muted">{t('becomeSeller.recap.fullName')}</dt>
                  <dd>{fullNameOnId}</dd>
                </dl>
              </div>

              <div className="rounded-lg border border-line p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{t('becomeSeller.recap.documentsTitle')}</p>
                  <button type="button" className="text-xs underline" onClick={() => setStep(2)}>{t('becomeSeller.recap.edit')}</button>
                </div>
                <div className="mt-2 flex flex-wrap gap-3">
                  {idDocumentPreview && (
                    <div>
                      <div className="h-24 w-20 overflow-hidden rounded border border-line">
                        <img src={idDocumentPreview} alt="" className="h-full w-full object-cover" />
                      </div>
                      <p className="mt-1 text-center text-xs text-muted">{idType === 'national_id' ? t('becomeSeller.recap.front') : t('becomeSeller.recap.frontPhoto')}</p>
                    </div>
                  )}
                  {idType === 'national_id' && idDocumentBackPreview && (
                    <div>
                      <div className="h-24 w-20 overflow-hidden rounded border border-line">
                        <img src={idDocumentBackPreview} alt="" className="h-full w-full object-cover" />
                      </div>
                      <p className="mt-1 text-center text-xs text-muted">{t('becomeSeller.recap.back')}</p>
                    </div>
                  )}
                  {profilePhotoPreview && (
                    <div>
                      <div className="h-24 w-20 overflow-hidden rounded border border-line">
                        <img src={profilePhotoPreview} alt="" className="h-full w-full object-cover" />
                      </div>
                      <p className="mt-1 text-center text-xs text-muted">{t('becomeSeller.recap.profile')}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <button type="button" className="btn-outline flex-1" onClick={goBack} disabled={apply.isPending}>
                {t('becomeSeller.nav.back')}
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" className="btn-primary flex-1" onClick={goNext} disabled={uploading}>
                {t('becomeSeller.nav.next')}
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary flex-1"
                onClick={handleSubmit}
                disabled={apply.isPending || uploading}
              >
                {apply.isPending ? t('becomeSeller.nav.submitting') : t('becomeSeller.nav.submit')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
