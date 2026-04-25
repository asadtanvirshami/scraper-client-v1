import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { campaignsApi } from "@/api/api_calls/campaign";

/* =====================================================
   FETCH CAMPAIGNS
===================================================== */

export const useCampaigns = (params: any) => {
  return useQuery({
    queryKey: ["campaigns", params],
    queryFn: () => campaignsApi.fetchCampaigns(params),
    placeholderData: keepPreviousData,
  });
};

export const useCampaign = ({
  id,
  user_id,
}: {
  id: string;
  user_id: string;
}) => {
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: () => campaignsApi.fetchCampaignById(id, user_id),
    enabled: !!id,
  });
};

export const useCampaignStats = ({ id, user_id }: { id?: string; user_id?: string }) => {
  return useQuery({
    queryKey: ["campaign-stats", user_id],
    queryFn: () => campaignsApi.fetchCampaignStats(user_id),
    enabled: !!user_id,
  });
};

/* =====================================================
   MUTATIONS
===================================================== */

export const useCampaignActions = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: campaignsApi.createCampaign,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaigns"] }),
  });

  const updateMutation = useMutation({
    mutationFn: campaignsApi.updateCampaign,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaigns"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: campaignsApi.deleteCampaign,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaigns"] }),
  });

  const scheduleMutation = useMutation({
    mutationFn: campaignsApi.scheduleCampaign,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaigns"] }),
  });

  const sendMutation = useMutation({
    mutationFn: campaignsApi.sendCampaign,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["campaigns"] }),
  });

  return {
    createCampaign: createMutation.mutateAsync,
    updateCampaign: updateMutation.mutateAsync,
    deleteCampaign: deleteMutation.mutateAsync,
    scheduleCampaign: scheduleMutation.mutateAsync,
    sendCampaign: sendMutation.mutateAsync,

    isPending:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      scheduleMutation.isPending ||
      sendMutation.isPending,
  };
};
