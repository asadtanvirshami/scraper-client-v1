import FolderParamsLayout from "@/features/folders/[id]";

type PageProps = {
  params: Promise<{ id: string }>;
  // Next.js app router supplies searchParams for query string values
  searchParams?: { name?: string };
};

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  if (!id) return null;
  const folderName = searchParams?.name;
  return <FolderParamsLayout folderId={id} folderName={folderName} />;
}
