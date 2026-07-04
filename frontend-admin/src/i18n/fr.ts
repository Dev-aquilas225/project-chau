import polyglotI18nProvider from 'ra-i18n-polyglot';
import frenchMessages from 'ra-language-french';
import { mergeTranslations } from 'react-admin';
import { customFrenchMessages } from './customMessages';

const messages = mergeTranslations(frenchMessages, customFrenchMessages);

export const i18nProvider = polyglotI18nProvider(() => messages, 'fr', [{ locale: 'fr', name: 'Français' }], {
  allowMissing: true,
});
