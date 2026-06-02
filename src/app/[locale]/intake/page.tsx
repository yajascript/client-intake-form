import { Suspense } from "react";
import { getDictionary } from "@/dictionaries";
import IntakeWizard from "@/components/IntakeWizard";

export default async function IntakePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session?: string }>;
}) {
  const { locale } = await params;
  const { session } = await searchParams;
  const dictionary = getDictionary(locale);

  return (
    <main className="min-h-screen bg-[#040B18] text-white flex flex-col items-center py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        <Suspense fallback={<div className="text-white/60 text-center py-20">Loading...</div>}>
          <IntakeWizard dictionary={dictionary} locale={locale} sessionParam={session} />
        </Suspense>
      </div>
    </main>
  );
}
