type AcademySignupNotificationInput = {
  contactId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  videoTitle?: string | null;
};

export async function sendAcademySignupNotifications(
  _input: AcademySignupNotificationInput,
) {
  return { ok: true as const };
}
