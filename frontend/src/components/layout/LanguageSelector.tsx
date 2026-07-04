import { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useClickOutside } from '@/hooks/useClickOutside';
import { cn } from '@/lib/utils';
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES, type SupportedLanguage } from '@/lib/i18n';

export function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false), open);

  const currentLang = i18n.language as SupportedLanguage;

  const selectLanguage = (lang: SupportedLanguage) => {
    i18n.changeLanguage(lang);
    setOpen(false);
  };

  return (
    <div className="relative hidden md:block" ref={ref}>
      <button
        type="button"
        aria-label={t('common:languageSelector.ariaLabel')}
        data-testid="language-selector-trigger"
        className="flex items-center gap-1 text-sm font-medium"
        onClick={() => setOpen((v) => !v)}
      >
        {currentLang.toUpperCase()}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-lg border border-line bg-paper shadow-lg">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => selectLanguage(lang)}
              className={cn(
                'block w-full px-4 py-2 text-left text-sm hover:bg-gray-50',
                lang === currentLang && 'font-semibold text-ink',
              )}
            >
              {LANGUAGE_NAMES[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
