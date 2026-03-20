import AcademySignupClient from "./AcademySignupClient";
import { getCurrentFeaturedLeadItem } from "@/server/modules/education/featuredLeadItem";

export default async function AcademySignupPage() {
  const featuredLeadItem = await getCurrentFeaturedLeadItem();
  const freeVideoTitle = featuredLeadItem?.kind === "VIDEO" ? featuredLeadItem.title : null;

  return <AcademySignupClient freeVideoTitle={freeVideoTitle} />;
}
