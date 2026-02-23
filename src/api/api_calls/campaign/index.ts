import api from "@/api/axios";
import { apiEndpoints } from "@/api/end-points";

export const campaignsApi = {
  /* =====================================================
     FETCH
  ===================================================== */

  fetchCampaigns: async (params?: any) => {
    const response = await api.get(apiEndpoints.campaigns.get(params), {
      params,
    });
    return response.data;
  },

  fetchCampaignById: async (id: string) => {
    const response = await api.get(apiEndpoints.campaigns.getOne(id));
    return response.data;
  },

  fetchCampaignStats: async () => {
    const response = await api.get(apiEndpoints.campaigns.stats);
    return response.data;
  },

  /* =====================================================
     CREATE
  ===================================================== */

  createCampaign: async (payload: any) => {
    const response = await api.post(
      apiEndpoints.campaigns.create,
      payload
    );
    return response.data;
  },

  /* =====================================================
     UPDATE
  ===================================================== */

  updateCampaign: async ({ id, ...payload }: any) => {
    const response = await api.put(
      apiEndpoints.campaigns.update(id),
      payload
    );
    return response.data;
  },

  /* =====================================================
     DELETE
  ===================================================== */

  deleteCampaign: async (id: string) => {
    const response = await api.delete(
      apiEndpoints.campaigns.delete(id)
    );
    return response.data;
  },

  /* =====================================================
     SCHEDULE
  ===================================================== */

  scheduleCampaign: async ({ id, scheduled_at }: any) => {
    const response = await api.post(
      apiEndpoints.campaigns.schedule(id),
      { scheduled_at }
    );
    return response.data;
  },

  /* =====================================================
     SEND
  ===================================================== */

  sendCampaign: async (id: string) => {
    const response = await api.post(
      apiEndpoints.campaigns.send(id)
    );
    return response.data;
  },
};