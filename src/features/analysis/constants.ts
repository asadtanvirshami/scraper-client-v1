export type AnalysisPlatformSlug = "instagram" | "linkedin";

export type AnalysisServiceSlug =
  | "followers"
  | "following";

export type AnalysisPlatformOption = {
  slug: AnalysisPlatformSlug;
  title: {
    id: string;
    defaultMessage: string;
  };
  description: {
    id: string;
    defaultMessage: string;
  };
};

export type AnalysisServiceOption = {
  slug: AnalysisServiceSlug;
  title: {
    id: string;
    defaultMessage: string;
  };
  shortTitle: {
    id: string;
    defaultMessage: string;
  };
  description: {
    id: string;
    defaultMessage: string;
  };
};

export const ANALYSIS_PLATFORM_OPTIONS: AnalysisPlatformOption[] = [
  {
    slug: "instagram",
    title: {
      id: "analysis.platform.instagram.title",
      defaultMessage: "Instagram",
    },
    description: {
      id: "analysis.platform.instagram.description",
      defaultMessage:
        "Explore Instagram account and content data with service-level analysis options.",
    },
  },
  {
    slug: "linkedin",
    title: {
      id: "analysis.platform.linkedin.title",
      defaultMessage: "LinkedIn",
    },
    description: {
      id: "analysis.platform.linkedin.description",
      defaultMessage:
        "Run profile and follower analysis services against LinkedIn profiles and networks.",
    },
  },
];

export const ANALYSIS_SERVICE_OPTIONS: AnalysisServiceOption[] = [
  {
    slug: "followers",
    title: {
      id: "analysis.services.followers.title",
      defaultMessage: "Account Followers",
    },
    shortTitle: {
      id: "analysis.services.followers.short_title",
      defaultMessage: "Followers",
    },
    description: {
      id: "analysis.services.followers.description",
      defaultMessage:
        "Analyze follower audiences for growth trends, profile quality, and segmentation insights.",
    },
  },
  {
    slug: "following",
    title: {
      id: "analysis.services.following.title",
      defaultMessage: "Account Following",
    },
    shortTitle: {
      id: "analysis.services.following.short_title",
      defaultMessage: "Following",
    },
    description: {
      id: "analysis.services.following.description",
      defaultMessage:
        "Review following lists to understand account affinity, targeting style, and relationship patterns.",
    },
  },
];

export const ANALYSIS_PLATFORM_MAP: Record<
  AnalysisPlatformSlug,
  AnalysisPlatformOption
> = {
  instagram: ANALYSIS_PLATFORM_OPTIONS[0],
  linkedin: ANALYSIS_PLATFORM_OPTIONS[1],
};

export const ANALYSIS_SERVICE_MAP: Record<
  AnalysisServiceSlug,
  AnalysisServiceOption
> = {
  followers: ANALYSIS_SERVICE_OPTIONS[0],
  following: ANALYSIS_SERVICE_OPTIONS[1],
};

export const isValidAnalysisPlatform = (
  value: string
): value is AnalysisPlatformSlug => value in ANALYSIS_PLATFORM_MAP;

export const isValidAnalysisService = (
  value: string
): value is AnalysisServiceSlug => value in ANALYSIS_SERVICE_MAP;
