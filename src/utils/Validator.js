export const validators = {
  required: (value) => !!value?.trim(),
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value) => /^[0-9]{9}$/.test(value),
  minLength: (value, length) => value?.length >= length,
  passwordComplexity: (value) =>
    /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value),
  fileType: (file, types) => file && types.includes(file?.type),

  minValue: (value, min) => parseFloat(value) >= min,
  maxValue: (value, max) => parseFloat(value) <= max,
  maxLength: (value, max) => value?.length <= max,

  isInteger: (value) => Number.isInteger(parseFloat(value)),
  isPositive: (value) => parseFloat(value) >= 0,
  validUrl: (value) => {
    if (!value) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  validCategory: (value, categories) => {
    if (!categories) return true;
    return categories.includes(value);
  },
  senegalPhone: (value) => {
    if (!value) return true;
    return /^(77|78|70|76)[0-9]{7}$/.test(value);
  },
  isUnique: async (value, checkFn, field) => {
    if (!value) return true;
    try {
      const exists = await checkFn(value);
      return !exists || `Cette ${field} est déjà utilisée`;
    } catch (error) {
      console.error("Erreur lors de la vérification d’unicité :", error);
      return "Erreur de vérification";
    }
  },
  date: (value) => {
    if (!value) return false;
    const d = new Date(value);
    return !isNaN(d.getTime());
  },
  isUniqueForNiveau: async (
    value,
    niveauId,
    existsFunction,
    excludeId = null
  ) => {
    if (!value) return true;
    const exists = await existsFunction(value, niveauId, excludeId);
    return !exists || `${value} existe déjà pour ce niveau`;
  },
  numberRange: (value, min, max) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
  },

  isFutureDate: (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  },
};
