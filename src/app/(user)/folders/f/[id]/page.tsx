import FolderParamsLayout from "@/features/folders/[id]";

type PageProps = {
  params: Promise<{ id: string }>; // ✅ params is a Promise in your runtime
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  if (!id) return null;
  return <FolderParamsLayout folderId={id} />;
}
