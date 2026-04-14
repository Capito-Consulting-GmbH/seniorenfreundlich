import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/auth/getCurrentUser";
import { getCompanyByOwner } from "@/src/services/companyService";
import { OnboardingStepper } from "./OnboardingStepper";
import { Step2CompanyDetails } from "./Step2CompanyDetails";
import { Step3EmailVerification } from "./Step3EmailVerification";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function OnboardingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { userId } = await getCurrentUser();
  const company = await getCompanyByOwner(userId);

  if (company?.verificationStatus === "verified") {
    redirect("/dashboard");
  }

  // Step 1 is always complete (account exists). Step 2 = fill company details.
  // Step 3 = verify company email. currentStep is the ACTIVE step.
  const currentStep = company ? 3 : 2;

  return (
    <div className="max-w-xl">
      <OnboardingStepper currentStep={currentStep} />

      <div className="mt-10">
        {currentStep === 2 && <Step2CompanyDetails />}
        {currentStep === 3 && company && (
          <Step3EmailVerification
            companyEmail={company.email}
            verificationStatus={company.verificationStatus}
          />
        )}
      </div>
    </div>
  );
}
