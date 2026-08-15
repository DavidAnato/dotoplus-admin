/** Constantes PIN — alignées sur `core/contracts.py`. OTP 5 chiffres : hors admin. */

export const PIN_LEN = 4;
export const PIN_REGEX = /^\d{4}$/;
export const PIN_ERROR = "Le PIN doit contenir exactement 4 chiffres.";
