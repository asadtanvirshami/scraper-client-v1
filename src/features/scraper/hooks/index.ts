import { useMutation } from "@tanstack/react-query";
import { message } from "antd";
import { useIntl } from "react-intl";
import {
  ScrapeInstagram,
  ScrapeLinkedIn,
  ScrapeFollowersOrFollowing,
  ScrapeInstagramInput,
  ScrapeLinkedinInput,
  ScrapeFollowersInput,
} from "@/api/api_calls/scrapper";
import { queryClient } from "@/providers/react-query";

export const useScrapeInstagram = () => {
  const intl = useIntl();

  return useMutation({
    mutationKey: ["scrapper", "instagram"],
    mutationFn: (input: ScrapeInstagramInput) => ScrapeInstagram(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instagram", "list"] });
      message.success(
        intl.formatMessage({
          id: "scraper.toast.started",
          defaultMessage: "Scraping started",
        }),
      );
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || "Failed to start scraping");
    },
  });
};

export const useScrapeLinkedIn = () => {
  const intl = useIntl();

  return useMutation({
    mutationKey: ["scrapper", "linkedin"],
    mutationFn: (input: ScrapeLinkedinInput) => ScrapeLinkedIn(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linkedin", "list"] });
      message.success(
        intl.formatMessage({
          id: "scraper.toast.started",
          defaultMessage: "Scraping started",
        }),
      );
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || "Failed to start scraping");
    },
  });
};

export const useScrapeFollowersOrFollowing = () => {
  const intl = useIntl();

  return useMutation({
    mutationKey: ["scrapper", "scrape-followers"],
    mutationFn: (input: ScrapeFollowersInput) =>
      ScrapeFollowersOrFollowing(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["leads", "list"] });
      message.success(
        intl.formatMessage({
          id: "scraper.toast.started",
          defaultMessage: "Scraping started",
        }),
      );
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || "Failed to start scraping");
    },
  });
};
