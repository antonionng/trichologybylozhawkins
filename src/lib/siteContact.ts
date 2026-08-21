export const siteContact = {
  email: "info@trichologybylorrainehawkins.co.uk",
  phoneDisplay: "07834 614092",
  phoneE164: "+447834614092",
  instagramUrl: "https://www.instagram.com/trichologybylh?igsh=MWJnczZ1cjY0Znhobg==",
  clinicName: "Lorraine Hawkins Trichology",
  streetAddress: "27 Regent Street",
  addressLocality: "Knutsford",
  postalCode: "WA16 6GR",
  addressRegion: "Cheshire",
  addressCountry: "GB",
  consultationDaysLabel: "Wednesday and Thursday",
  consultationHoursLabel: "10am–5pm GMT",
  consultationHoursShort: "Wed–Thu · 10am–5pm GMT",
  enquiryResponseLabel: "24–48 hours",
} as const;

export const clinicHours = [
  { label: "Consultations", detail: siteContact.consultationHoursShort },
  { label: "Training", detail: "Mon & Tue · 9am–6pm GMT" },
  { label: "Email", detail: "Monitored daily" },
] as const;

export function formatClinicAddress(separator = ", ") {
  return [
    siteContact.streetAddress,
    siteContact.addressLocality,
    siteContact.postalCode,
  ].join(separator);
}

export const siteContactLinks = {
  mailto: `mailto:${siteContact.email}`,
  tel: `tel:${siteContact.phoneE164}`,
  maps: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    formatClinicAddress(),
  )}`,
} as const;

export function mailtoWithSubject(subject: string) {
  return `mailto:${siteContact.email}?subject=${encodeURIComponent(subject)}`;
}

