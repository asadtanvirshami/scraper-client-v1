import FolderParamsLayout from "@/features/folders/[id]";

type PageProps = {
  params: Promise<{ id: string }>;
  // Next.js app router supplies searchParams for query string values
  searchParams?: Promise<{ name?: string }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  if (!id) return null;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const folderName = resolvedSearchParams?.name;
  return <FolderParamsLayout folderId={id} folderName={folderName} />;
}
