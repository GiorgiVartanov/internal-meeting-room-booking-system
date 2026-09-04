import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import { BOOKING_SLOT_MINUTES, MAX_BOOKING_DURATION_MINUTES } from "@/constants"
import en from "@/locales/en.json"
import ka from "@/locales/ka.json"

const savedLanguage = localStorage.getItem("meeting-room-booking-website")
const browserLanguage = [...navigator.languages, navigator.language].find(Boolean) ?? "en"
let initialLanguage = browserLanguage.toLowerCase().startsWith("ka") ? "ka" : "en"
if (savedLanguage === "en" || savedLanguage === "ka") initialLanguage = savedLanguage

document.documentElement.lang = initialLanguage

await i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ka: { translation: ka } },
  lng: initialLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
    defaultVariables: {
      bookingSlotMinutes: BOOKING_SLOT_MINUTES,
      maximumBookingHours: MAX_BOOKING_DURATION_MINUTES / 60,
    },
  },
})

export default i18n
