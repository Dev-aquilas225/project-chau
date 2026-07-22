import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Store, Clock, CheckCircle, XCircle, Upload, Loader2, Check, X, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthProvider';
import { useApplyAsSeller } from './hooks';
import { uploadIdentityDocument } from './api';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

// value = code ISO 3166-1 alpha-2 attendu par l'API (idCountry), label = affichage
const COUNTRIES = [
  { code: 'FR', label: 'France' },
  { code: 'DE', label: 'Allemagne' },
  { code: 'AT', label: 'Autriche' },
  { code: 'BE', label: 'Belgique' },
  { code: 'CA', label: 'Canada' },
  { code: 'DK', label: 'Danemark' },
  { code: 'ES', label: 'Espagne' },
  { code: 'US', label: 'États-Unis' },
  { code: 'FI', label: 'Finlande' },
  { code: 'GR', label: 'Grèce' },
  { code: 'IE', label: 'Irlande' },
  { code: 'IT', label: 'Italie' },
  { code: 'LU', label: 'Luxembourg' },
  { code: 'NO', label: 'Norvège' },
  { code: 'NL', label: 'Pays-Bas' },
  { code: 'PL', label: 'Pologne' },
  { code: 'PT', label: 'Portugal' },
  { code: 'GB', label: 'Royaume-Uni' },
  { code: 'SE', label: 'Suède' },
  { code: 'CH', label: 'Suisse' },
];

export function BecomeSellerPage() {
  const { t } = useTranslation('seller');
  const STEPS = [
    t('becomeSeller.steps.store'),
    t('becomeSeller.steps.identity'),
    t('becomeSeller.steps.documents'),
    t('becomeSeller.steps.recap')
  ] as const;

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
  const [idCountry, setIdCountry] = useState('FR');
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
      toast.success(t('becomeSeller.toasts?.idDocumentUploaded' as any) || 'Document d\'identité chargé.');
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
      toast.success(t('becomeSeller.toasts?.idDocumentBackUploaded' as any) || 'Verso du document chargé.');
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
      toast.success(t('becomeSeller.toasts?.profilePhotoUploaded' as any) || 'Photo de profil chargée.');
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
      <div className="container-app py-20 flex justify-center items-center">
        <div className="max-w-md w-full text-center p-8 bg-paper rounded-2xl border border-line shadow-lg animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="h-8 w-8 text-amber-500 animate-pulse" />
          </div>
          <h1 className="mb-3 text-2xl font-bold text-ink">{t('becomeSeller.pending.title')}</h1>
          <p className="text-sm text-muted leading-relaxed mb-6">{t('becomeSeller.pending.text')}</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm">
            {t('becomeSeller.pending.backHome')}
          </Link>
        </div>
      </div>
    );
  }

  if (sellerStatus === 'rejected') {
    return (
      <div className="container-app py-20 flex justify-center items-center">
        <div className="max-w-md w-full text-center p-8 bg-paper rounded-2xl border border-line shadow-lg animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-8 w-8 text-sale" />
          </div>
          <h1 className="mb-3 text-2xl font-bold text-ink">{t('becomeSeller.rejected.title')}</h1>
          <p className="text-sm text-muted leading-relaxed mb-4">{t('becomeSeller.rejected.text')}</p>
          {user?.sellerProfile?.reviewNote && (
            <div className="rounded-xl border border-red-100 bg-red-50/30 p-4 text-left text-sm text-red-800 mb-6">
              <p className="font-semibold mb-1">{t('becomeSeller.rejected.reasonLabel')}</p>
              <p className="text-xs leading-relaxed">{user.sellerProfile.reviewNote}</p>
            </div>
          )}
          <Link to="/" className="btn-outline inline-flex items-center gap-2 px-6 py-2.5 text-sm">
            {t('becomeSeller.pending.backHome')}
          </Link>
        </div>
      </div>
    );
  }

  const uploading = uploadingIdDocument || uploadingIdDocumentBack || uploadingProfilePhoto;

  return (
    <div className="container-app py-12 min-h-[80vh] flex flex-col items-center">
      <div className="max-w-xl w-full">
        {/* Header section */}
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-ink text-paper rounded-2xl mb-4 shadow-sm">
            <Store className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">{t('becomeSeller.heading.title')}</h1>
          <p className="mt-2 text-sm text-muted max-w-sm mx-auto">{t('becomeSeller.heading.subtitle')}</p>
        </div>

        {/* Premium Glassmorphic Card Container */}
        <div className="bg-paper border border-line rounded-3xl p-6 sm:p-8 shadow-xl transition-all relative overflow-hidden">
          
          {/* Stepper Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between gap-2 mb-4">
              {STEPS.map((label, i) => (
                <div key={label} className="flex flex-1 items-center last:flex-none">
                  <button
                    type="button"
                    aria-label={label}
                    onClick={() => { if (i < step) setStep(i); }}
                    disabled={i > step}
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 border',
                      i < step && 'bg-ink border-ink text-paper hover:bg-ink/80',
                      i === step && 'bg-paper border-ink text-ink ring-4 ring-gray-100',
                      i > step && 'bg-gray-50 border-gray-200 text-muted cursor-not-allowed',
                    )}
                  >
                    {i < step ? <Check className="h-4 w-4 stroke-[3px]" /> : i + 1}
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={cn('mx-2 h-0.5 flex-1 rounded-full transition-all duration-500', i < step ? 'bg-ink' : 'bg-gray-100')} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-between items-center text-xs text-muted font-semibold bg-gray-50 px-3 py-2.5 rounded-xl border border-line/50">
              <span>Étape {step + 1} sur {STEPS.length}</span>
              <span className="text-ink">{STEPS[step]}</span>
            </div>
          </div>

          {/* Form Content Steps */}
          <div className="space-y-6 min-h-[220px]">
            {step === 0 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <label className="label text-sm font-semibold mb-1.5">{t('becomeSeller.store.nameLabel')}</label>
                  <input
                    className="input rounded-xl focus:ring-ink focus:border-ink py-2.5"
                    placeholder={t('becomeSeller.store.namePlaceholder')}
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    maxLength={100}
                    required
                  />
                </div>

                <div>
                  <label className="label text-sm font-semibold mb-1.5">{t('becomeSeller.store.bioLabel')}</label>
                  <textarea
                    className="input rounded-xl focus:ring-ink focus:border-ink"
                    rows={4}
                    placeholder={t('becomeSeller.store.bioPlaceholder')}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={500}
                  />
                </div>

                <div className="rounded-2xl border border-green-100 bg-green-50/20 p-5 text-sm text-green-900 shadow-sm">
                  <p className="flex items-center gap-2 font-bold mb-3">
                    <ShieldCheck className="h-5 w-5 text-green-600" /> 
                    {t('becomeSeller.store.benefitsTitle')}
                  </p>
                  <ul className="list-inside list-disc space-y-2 text-xs leading-relaxed text-green-800">
                    <li>{t('becomeSeller.store.benefit1')}</li>
                    <li>{t('becomeSeller.store.benefit2')}</li>
                    <li>{t('becomeSeller.store.benefit3')}</li>
                  </ul>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-line pb-4 mb-2">
                  <h2 className="font-bold text-lg text-ink">{t('becomeSeller.identity.title')}</h2>
                  <p className="text-xs text-muted mt-1 leading-relaxed">{t('becomeSeller.identity.subtitle')}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label text-sm font-semibold mb-1.5">{t('becomeSeller.identity.idTypeLabel')}</label>
                    <select
                      className="input rounded-xl py-2.5"
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
                    <label className="label text-sm font-semibold mb-1.5">{t('becomeSeller.identity.idNumberLabel')}</label>
                    <input
                      className="input rounded-xl py-2.5"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label text-sm font-semibold mb-1.5">{t('becomeSeller.identity.idCountryLabel')}</label>
                    <select
                      className="input rounded-xl py-2.5"
                      value={idCountry}
                      onChange={(e) => setIdCountry(e.target.value)}
                      required
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label text-sm font-semibold mb-1.5">{t('becomeSeller.identity.dateOfBirthLabel')}</label>
                    <input
                      className="input rounded-xl py-2.5"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label text-sm font-semibold mb-1.5">{t('becomeSeller.identity.fullNameLabel')}</label>
                  <input
                    className="input rounded-xl py-2.5"
                    value={fullNameOnId}
                    onChange={(e) => setFullNameOnId(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-line pb-4 mb-2">
                  <h2 className="font-bold text-lg text-ink">{t('becomeSeller.steps.documents')}</h2>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    Veuillez charger des photos claires et lisibles pour vérification. Format JPEG, PNG acceptés.
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  {/* Front Doc */}
                  <div className="p-4 bg-gray-50/50 rounded-2xl border border-line">
                    <label className="text-sm font-semibold block mb-3 text-ink">
                      {idType === 'national_id' 
                        ? t('becomeSeller.documents.idDocumentFrontNationalLabel') 
                        : t('becomeSeller.documents.idDocumentFrontPassportLabel')}
                      <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    
                    <div className="flex items-center gap-4">
                      {idDocumentPreview ? (
                        <div className="relative group w-28 h-20 overflow-hidden rounded-xl border border-line shadow-sm">
                          <img src={idDocumentPreview} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            className="absolute inset-0 bg-ink/60 flex items-center justify-center text-paper opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={() => { setIdDocumentPreview(null); setIdDocumentRef(null); }}
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <label className={cn(
                          "flex flex-1 items-center justify-center gap-3 h-20 rounded-xl border border-dashed border-gray-300 hover:border-ink hover:bg-gray-100/50 cursor-pointer transition duration-200",
                          uploadingIdDocument && "opacity-75 cursor-not-allowed"
                        )}>
                          {uploadingIdDocument ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin text-muted" />
                              <span className="text-xs text-muted">Chargement...</span>
                            </>
                          ) : (
                            <>
                              <div className="p-2 bg-paper border border-line rounded-lg text-muted shadow-sm">
                                <Upload className="h-4 w-4" />
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-semibold text-ink">{t('becomeSeller.documents.uploadLabel')}</p>
                                <p className="text-[10px] text-muted">Max 5 Mo</p>
                              </div>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            disabled={uploadingIdDocument}
                            onChange={(e) => onIdDocumentFile(e.target.files)}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Back Doc if national ID */}
                  {idType === 'national_id' && (
                    <div className="p-4 bg-gray-50/50 rounded-2xl border border-line animate-in slide-in-from-top-2 duration-200">
                      <label className="text-sm font-semibold block mb-3 text-ink">
                        {t('becomeSeller.documents.idDocumentBackLabel')}
                        <span className="text-red-500 ml-0.5">*</span>
                      </label>
                      
                      <div className="flex items-center gap-4">
                        {idDocumentBackPreview ? (
                          <div className="relative group w-28 h-20 overflow-hidden rounded-xl border border-line shadow-sm">
                            <img src={idDocumentBackPreview} alt="" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              className="absolute inset-0 bg-ink/60 flex items-center justify-center text-paper opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              onClick={() => { setIdDocumentBackPreview(null); setIdDocumentBackRef(null); }}
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <label className={cn(
                            "flex flex-1 items-center justify-center gap-3 h-20 rounded-xl border border-dashed border-gray-300 hover:border-ink hover:bg-gray-100/50 cursor-pointer transition duration-200",
                            uploadingIdDocumentBack && "opacity-75 cursor-not-allowed"
                          )}>
                            {uploadingIdDocumentBack ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin text-muted" />
                                <span className="text-xs text-muted">Chargement...</span>
                              </>
                            ) : (
                              <>
                                <div className="p-2 bg-paper border border-line rounded-lg text-muted shadow-sm">
                                  <Upload className="h-4 w-4" />
                                </div>
                                <div className="text-left">
                                  <p className="text-xs font-semibold text-ink">{t('becomeSeller.documents.uploadLabel')}</p>
                                  <p className="text-[10px] text-muted">Max 5 Mo</p>
                                </div>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              disabled={uploadingIdDocumentBack}
                              onChange={(e) => onIdDocumentBackFile(e.target.files)}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Profile Photo */}
                  <div className="p-4 bg-gray-50/50 rounded-2xl border border-line">
                    <label className="text-sm font-semibold block mb-3 text-ink">
                      {t('becomeSeller.documents.profilePhotoLabel')}
                      <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    
                    <div className="flex items-center gap-4">
                      {profilePhotoPreview ? (
                        <div className="relative group w-20 h-20 overflow-hidden rounded-full border border-line shadow-sm">
                          <img src={profilePhotoPreview} alt="" className="h-full w-full object-cover" />
                          <button
                            type="button"
                            className="absolute inset-0 bg-ink/60 flex items-center justify-center text-paper opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={() => { setProfilePhotoPreview(null); setProfilePhotoRef(null); }}
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <label className={cn(
                          "flex flex-1 items-center justify-center gap-3 h-20 rounded-xl border border-dashed border-gray-300 hover:border-ink hover:bg-gray-100/50 cursor-pointer transition duration-200",
                          uploadingProfilePhoto && "opacity-75 cursor-not-allowed"
                        )}>
                          {uploadingProfilePhoto ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin text-muted" />
                              <span className="text-xs text-muted">Chargement...</span>
                            </>
                          ) : (
                            <>
                              <div className="p-2 bg-paper border border-line rounded-lg text-muted shadow-sm">
                                <Upload className="h-4 w-4" />
                              </div>
                              <div className="text-left">
                                <p className="text-xs font-semibold text-ink">{t('becomeSeller.documents.uploadLabel')}</p>
                                <p className="text-[10px] text-muted">{t('becomeSeller.documents.profilePhotoHelpText')}</p>
                              </div>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            disabled={uploadingProfilePhoto}
                            onChange={(e) => onProfilePhotoFile(e.target.files)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-line pb-4 mb-2">
                  <h2 className="font-bold text-lg text-ink">{t('becomeSeller.recap.title')}</h2>
                  <p className="text-xs text-muted mt-1 leading-relaxed">{t('becomeSeller.recap.subtitle')}</p>
                </div>

                <div className="space-y-4">
                  {/* Shop Section */}
                  <div className="rounded-2xl border border-line bg-gray-50/50 p-4 relative">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted">{t('becomeSeller.recap.storeTitle')}</p>
                      <button type="button" className="text-xs font-semibold text-ink hover:underline" onClick={() => setStep(0)}>{t('becomeSeller.recap.edit')}</button>
                    </div>
                    <p className="text-sm font-semibold text-ink">{storeName}</p>
                    {bio.trim() && <p className="mt-1 text-xs text-muted leading-relaxed">{bio}</p>}
                  </div>

                  {/* Identity Section */}
                  <div className="rounded-2xl border border-line bg-gray-50/50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted">{t('becomeSeller.recap.identityTitle')}</p>
                      <button type="button" className="text-xs font-semibold text-ink hover:underline" onClick={() => setStep(1)}>{t('becomeSeller.recap.edit')}</button>
                    </div>
                    <dl className="grid grid-cols-2 gap-y-2 text-xs leading-relaxed">
                      <dt className="text-muted">{t('becomeSeller.recap.idType')}</dt>
                      <dd className="font-semibold text-ink">{ID_TYPE_LABEL[idType]}</dd>
                      <dt className="text-muted">{t('becomeSeller.recap.idNumber')}</dt>
                      <dd className="font-semibold text-ink">{idNumber}</dd>
                      <dt className="text-muted">{t('becomeSeller.recap.idCountry')}</dt>
                      <dd className="font-semibold text-ink">
                        {COUNTRIES.find((c) => c.code === idCountry)?.label ?? idCountry}
                      </dd>
                      <dt className="text-muted">{t('becomeSeller.recap.dateOfBirth')}</dt>
                      <dd className="font-semibold text-ink">{dateOfBirth}</dd>
                      <dt className="text-muted">{t('becomeSeller.recap.fullName')}</dt>
                      <dd className="font-semibold text-ink">{fullNameOnId}</dd>
                    </dl>
                  </div>

                  {/* Docs Preview Section */}
                  <div className="rounded-2xl border border-line bg-gray-50/50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted">{t('becomeSeller.recap.documentsTitle')}</p>
                      <button type="button" className="text-xs font-semibold text-ink hover:underline" onClick={() => setStep(2)}>{t('becomeSeller.recap.edit')}</button>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {idDocumentPreview && (
                        <div className="text-center">
                          <div className="h-16 w-20 overflow-hidden rounded-lg border border-line shadow-sm mb-1">
                            <img src={idDocumentPreview} alt="" className="h-full w-full object-cover" />
                          </div>
                          <span className="text-[10px] text-muted block font-medium">Recto / Photo</span>
                        </div>
                      )}
                      {idType === 'national_id' && idDocumentBackPreview && (
                        <div className="text-center">
                          <div className="h-16 w-20 overflow-hidden rounded-lg border border-line shadow-sm mb-1">
                            <img src={idDocumentBackPreview} alt="" className="h-full w-full object-cover" />
                          </div>
                          <span className="text-[10px] text-muted block font-medium">Verso</span>
                        </div>
                      )}
                      {profilePhotoPreview && (
                        <div className="text-center">
                          <div className="h-16 w-16 overflow-hidden rounded-full border border-line shadow-sm mb-1">
                            <img src={profilePhotoPreview} alt="" className="h-full w-full object-cover" />
                          </div>
                          <span className="text-[10px] text-muted block font-medium">Profil</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-line/60 mt-8">
            {step > 0 && (
              <button
                type="button"
                className="btn-outline flex-1 rounded-xl flex items-center justify-center gap-2 py-3 border-gray-200 text-sm font-semibold transition"
                onClick={goBack}
                disabled={apply.isPending}
              >
                <ArrowLeft className="h-4 w-4" />
                {t('becomeSeller.nav.back')}
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                className="btn-primary flex-1 rounded-xl flex items-center justify-center gap-2 py-3 text-sm font-bold shadow-md transition"
                onClick={goNext}
                disabled={uploading}
              >
                {t('becomeSeller.nav.next')}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                className={cn(
                  "btn-primary flex-1 rounded-xl flex items-center justify-center gap-2 py-3 text-sm font-bold shadow-md transition",
                  (apply.isPending || uploading) && "opacity-75 cursor-not-allowed"
                )}
                onClick={handleSubmit}
                disabled={apply.isPending || uploading}
              >
                {apply.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('becomeSeller.nav.submitting')}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 stroke-[3px]" />
                    {t('becomeSeller.nav.submit')}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
