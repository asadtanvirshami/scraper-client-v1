import LeadParamsLayout from "@/features/leads/[id]";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ type?: string }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  if (!id) return null;

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const type = resolvedSearchParams?.type;

  return <LeadParamsLayout leadId={id} queryType={type} />;
}
