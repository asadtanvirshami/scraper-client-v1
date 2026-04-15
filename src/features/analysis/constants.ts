export type AnalysisPlatformSlug = "instagram" | "twitter";

export type AnalysisServiceSlug =
  | "followers"
  | "following";

export type AnalysisPlatformOption = {
  slug: AnalysisPlatformSlug;
  title: string;
  description: string;
};

export type AnalysisServiceOption = {
  slug: AnalysisServiceSlug;
  title: string;
  shortTitle: string;
  description: string;
};

export const ANALYSIS_PLATFORM_OPTIONS: AnalysisPlatformOption[] = [
  {
    slug: "instagram",
    title: "Instagram",
    description:
      "Explore Instagram account and content data with service-level analysis options.",
  },
  {
    slug: "twitter",
    title: "Twitter (X)",
    description:
      "Run the same analysis services against Twitter (X) profiles and content sources.",
  },
];

export const ANALYSIS_SERVICE_OPTIONS: AnalysisServiceOption[] = [
  {
    slug: "followers",
    title: "Account Followers",
    shortTitle: "Followers",
    description:
      "Analyze follower audiences for growth trends, profile quality, and segmentation insights.",
  },
  {
    slug: "following",
    title: "Account Following",
    shortTitle: "Following",
    description:
      "Review following lists to understand account affinity, targeting style, and relationship patterns.",
  },
];

export const ANALYSIS_PLATFORM_MAP: Record<
  AnalysisPlatformSlug,
  AnalysisPlatformOption
> = {
  instagram: ANALYSIS_PLATFORM_OPTIONS[0],
  twitter: ANALYSIS_PLATFORM_OPTIONS[1],
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
