import EditCampaign from "@/features/campaigns/ui/edit";

const EditPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return <EditCampaign campaignId={id} />;
};

export default EditPage;
