import '@testing-library/jest-dom/vitest';
import '@/lib/i18n';

// jsdom ne fournit pas URL.createObjectURL/revokeObjectURL — nécessaire pour les
// aperçus locaux d'images uploadées (ex. BecomeSellerPage).
if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = () => 'blob:mock-url';
}
if (typeof URL.revokeObjectURL !== 'function') {
  URL.revokeObjectURL = () => {};
}
