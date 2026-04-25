import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";

export const campaignsApi = {
  /* =====================================================
     FETCH
  ===================================================== */

  fetchCampaigns: async (params?: any) => {
    const response = await api.get(apiEndpoints.campaigns.get(params));
    return response.data;
  },

  fetchCampaignById: async (id: string, user_id?: string) => {
    const response = await api.get(apiEndpoints.campaigns.getOne(id, user_id));
    return response.data;
  },

  fetchCampaignStats: async (user_id?: string) => {
    const url = user_id
      ? `${apiEndpoints.campaigns.stats}?user_id=${user_id}`
      : apiEndpoints.campaigns.stats;
    const response = await api.get(url);
    return response.data;
  },

  /* =====================================================
     CREATE
  ===================================================== */

  createCampaign: async (payload: any) => {
    const response = await api.post(apiEndpoints.campaigns.create, payload);
    return response.data;
  },

  /* =====================================================
     UPDATE
  ===================================================== */

  updateCampaign: async (payload: any) => {
    const response = await api.post(apiEndpoints.campaigns.update, payload);
    return response.data;
  },

  /* =====================================================
     DELETE
  ===================================================== */

  deleteCampaign: async ({
    campaign_id,
    user_id,
  }: {
    campaign_id: string;
    user_id: string;
  }) => {
    const response = await api.delete(apiEndpoints.campaigns.delete, {
      data: { campaign_id, user_id },
    });
    return response.data;
  },

  /* =====================================================
     SCHEDULE
  ===================================================== */

  scheduleCampaign: async ({ id, scheduled_at }: any) => {
    const response = await api.post(apiEndpoints.campaigns.schedule(id), {
      scheduled_at,
    });
    return response.data;
  },

  /* =====================================================
     SEND
  ===================================================== */

  sendCampaign: async ({
    campaign_id,
    user_id,
  }: {
    campaign_id: string;
    user_id: string;
  }) => {
    const response = await api.post(apiEndpoints.campaigns.send, {
      campaign_id,
      user_id,
    });
    return response.data;
  },
};
