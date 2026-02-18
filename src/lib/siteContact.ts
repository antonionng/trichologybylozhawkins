export const siteContact = {
  email: "info@trichologybylorrainehawkins.co.uk",
  phoneDisplay: "07834 614092",
  phoneE164: "+447834614092",
  instagramUrl: "https://www.instagram.com/trichologybylh?igsh=MWJnczZ1cjY0Znhobg==",
} as const;

export const siteContactLinks = {
  mailto: `mailto:${siteContact.email}`,
  tel: `tel:${siteContact.phoneE164}`,
} as const;

export function mailtoWithSubject(subject: string) {
  return `mailto:${siteContact.email}?subject=${encodeURIComponent(subject)}`;
}

