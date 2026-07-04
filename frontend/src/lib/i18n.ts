import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonFr from '@/locales/fr/common.json';
import authFr from '@/locales/fr/auth.json';
import catalogFr from '@/locales/fr/catalog.json';
import cartFr from '@/locales/fr/cart.json';
import checkoutFr from '@/locales/fr/checkout.json';
import accountFr from '@/locales/fr/account.json';
import favoritesFr from '@/locales/fr/favorites.json';
import notificationsFr from '@/locales/fr/notifications.json';
import ordersFr from '@/locales/fr/orders.json';
import reviewsFr from '@/locales/fr/reviews.json';
import sellerFr from '@/locales/fr/seller.json';

import commonEn from '@/locales/en/common.json';
import authEn from '@/locales/en/auth.json';
import catalogEn from '@/locales/en/catalog.json';
import cartEn from '@/locales/en/cart.json';
import checkoutEn from '@/locales/en/checkout.json';
import accountEn from '@/locales/en/account.json';
import favoritesEn from '@/locales/en/favorites.json';
import notificationsEn from '@/locales/en/notifications.json';
import ordersEn from '@/locales/en/orders.json';
import reviewsEn from '@/locales/en/reviews.json';
import sellerEn from '@/locales/en/seller.json';

import commonEs from '@/locales/es/common.json';
import authEs from '@/locales/es/auth.json';
import catalogEs from '@/locales/es/catalog.json';
import cartEs from '@/locales/es/cart.json';
import checkoutEs from '@/locales/es/checkout.json';
import accountEs from '@/locales/es/account.json';
import favoritesEs from '@/locales/es/favorites.json';
import notificationsEs from '@/locales/es/notifications.json';
import ordersEs from '@/locales/es/orders.json';
import reviewsEs from '@/locales/es/reviews.json';
import sellerEs from '@/locales/es/seller.json';

import commonDe from '@/locales/de/common.json';
import authDe from '@/locales/de/auth.json';
import catalogDe from '@/locales/de/catalog.json';
import cartDe from '@/locales/de/cart.json';
import checkoutDe from '@/locales/de/checkout.json';
import accountDe from '@/locales/de/account.json';
import favoritesDe from '@/locales/de/favorites.json';
import notificationsDe from '@/locales/de/notifications.json';
import ordersDe from '@/locales/de/orders.json';
import reviewsDe from '@/locales/de/reviews.json';
import sellerDe from '@/locales/de/seller.json';

import commonIt from '@/locales/it/common.json';
import authIt from '@/locales/it/auth.json';
import catalogIt from '@/locales/it/catalog.json';
import cartIt from '@/locales/it/cart.json';
import checkoutIt from '@/locales/it/checkout.json';
import accountIt from '@/locales/it/account.json';
import favoritesIt from '@/locales/it/favorites.json';
import notificationsIt from '@/locales/it/notifications.json';
import ordersIt from '@/locales/it/orders.json';
import reviewsIt from '@/locales/it/reviews.json';
import sellerIt from '@/locales/it/seller.json';

export const SUPPORTED_LANGUAGES = ['fr', 'en', 'es', 'de', 'it'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  it: 'Italiano',
};

function readSavedLang(): string | null {
  try {
    return localStorage.getItem('lang');
  } catch {
    return null;
  }
}

const savedLang = readSavedLang();
const initialLang: SupportedLanguage =
  savedLang && (SUPPORTED_LANGUAGES as readonly string[]).includes(savedLang) ? (savedLang as SupportedLanguage) : 'fr';

i18n.use(initReactI18next).init({
  resources: {
    fr: { common: commonFr, auth: authFr, catalog: catalogFr, cart: cartFr, checkout: checkoutFr, account: accountFr, favorites: favoritesFr, notifications: notificationsFr, orders: ordersFr, reviews: reviewsFr, seller: sellerFr },
    en: { common: commonEn, auth: authEn, catalog: catalogEn, cart: cartEn, checkout: checkoutEn, account: accountEn, favorites: favoritesEn, notifications: notificationsEn, orders: ordersEn, reviews: reviewsEn, seller: sellerEn },
    es: { common: commonEs, auth: authEs, catalog: catalogEs, cart: cartEs, checkout: checkoutEs, account: accountEs, favorites: favoritesEs, notifications: notificationsEs, orders: ordersEs, reviews: reviewsEs, seller: sellerEs },
    de: { common: commonDe, auth: authDe, catalog: catalogDe, cart: cartDe, checkout: checkoutDe, account: accountDe, favorites: favoritesDe, notifications: notificationsDe, orders: ordersDe, reviews: reviewsDe, seller: sellerDe },
    it: { common: commonIt, auth: authIt, catalog: catalogIt, cart: cartIt, checkout: checkoutIt, account: accountIt, favorites: favoritesIt, notifications: notificationsIt, orders: ordersIt, reviews: reviewsIt, seller: sellerIt },
  },
  lng: initialLang,
  fallbackLng: 'fr',
  defaultNS: 'common',
  ns: ['common', 'auth', 'catalog', 'cart', 'checkout', 'account', 'favorites', 'notifications', 'orders', 'reviews', 'seller'],
  interpolation: { escapeValue: false },
  initAsync: false,
});

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem('lang', lng);
  } catch {
    // localStorage indisponible (environnement de test ou navigateur restrictif) : pas bloquant.
  }
});

export default i18n;
