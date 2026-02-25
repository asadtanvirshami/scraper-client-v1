import ViewLayout from "@/features/campaigns/ui/id";
import { useSearchParams } from "next/navigation";

const ViewPage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;

  return <ViewLayout id={id} />;
};

export default ViewPage;
