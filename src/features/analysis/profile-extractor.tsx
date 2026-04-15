"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import {
  InstagramOutlined,
  LinkedinOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import { useQueryClient } from "@tanstack/react-query";

import { useUserInfo } from "@/helpers/use-user";
import { useFetchFolders } from "@/features/folders/hooks/queries";
import { useFetchLeadsList } from "@/features/leads/hooks/queries";
import LeadsTableServer from "@/features/leads/ui/lead-table";
import { useScrapeInstagram, useScrapeLinkedIn } from "@/features/scraper/hooks";

const { Title, Text } = Typography;

type ProfilePlatform = "instagram" | "linkedin";

type ProfileExtractorProps = {
  platform: ProfilePlatform;
  compact?: boolean;
};

type TableFilters = {
  page: number;
  limit: number;
  search?: string;
  type?: string;
  is_converted?: boolean | undefined;
  folder_id?: string;
};

const extractScrapeId = (res: any): string => {
  return (
    res?.data?.scrape_id ||
    res?.scrape_id ||
    res?.data?.data?.scrape_id ||
    ""
  );
};

const extractProfileIdentifier = (profileUrl: string): string => {
  try {
    const normalized = profileUrl.startsWith("http")
      ? profileUrl
      : `https://${profileUrl}`;
    const parsed = new URL(normalized);
    const segments = parsed.pathname
      .split("/")
      .map((segment) => segment.trim())
      .filter(Boolean);

    if (segments.length === 0) {
      return "";
    }

    if (segments[0] === "in" || segments[0] === "company") {
      return segments[1] || "";
    }

    return segments[0];
  } catch {
    return profileUrl.trim().replace(/^@+/, "");
  }
};

const AnalysisProfileExtractor = ({ platform, compact = false }: ProfileExtractorProps) => {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const { id: userId } = useUserInfo();
  const [form] = Form.useForm();

  const isLinkedIn = platform === "linkedin";
  const leadType = isLinkedIn ? "LINKEDIN" : "INSTAGRAM";
  const PlatformIcon = isLinkedIn ? LinkedinOutlined : InstagramOutlined;

  const [tableFilters, setTableFilters] = useState<TableFilters>({
    page: 1,
    limit: 10,
    search: "",
    type: leadType,
    folder_id: undefined,
  });
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [scrapeId, setScrapeId] = useState("");
  const [submittedProfile, setSubmittedProfile] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [pollUntil, setPollUntil] = useState(0);
  const [pollTick, setPollTick] = useState(0);
  void pollTick;

  const instagramScraper = useScrapeInstagram();
  const linkedInScraper = useScrapeLinkedIn();
  const isSubmitting = instagramScraper.isPending || linkedInScraper.isPending;

  const { data: foldersResp, isLoading: foldersLoading } = useFetchFolders({
    user_id: userId,
    limit: 1000,
  });

  const foldersList = ((foldersResp as any)?.folders ??
    (foldersResp as any)?.data ??
    []) as Array<{ _id?: string; id?: string; name?: string }>;

  const leadsParams = useMemo(() => {
    const params: any = {
      user_id: userId ?? "",
      page: tableFilters.page,
      limit: tableFilters.limit,
      search: tableFilters.search,
      type: leadType,
      folder_id: selectedFolderId || undefined,
      scrape_status: false,
    };

    if (!hasStarted) {
      params.scraped_from_username = "__analysis_profile_placeholder__";
      return params;
    }

    if (scrapeId) {
      params.scrape_id = scrapeId;
    } else if (submittedProfile) {
      params.scraped_from_username = submittedProfile;
    }

    return params;
  }, [
    userId,
    tableFilters.page,
    tableFilters.limit,
    tableFilters.search,
    leadType,
    selectedFolderId,
    hasStarted,
    scrapeId,
    submittedProfile,
  ]);

  const leadsQuery = useFetchLeadsList(leadsParams);

  useEffect(() => {
    if (pollUntil <= Date.now()) return;

    const ticker = window.setInterval(() => setPollTick((value) => value + 1), 250);
    return () => window.clearInterval(ticker);
  }, [pollUntil]);

  useEffect(() => {
    if (pollUntil <= Date.now()) return;

    leadsQuery.refetch?.();

    const interval = window.setInterval(() => {
      leadsQuery.refetch?.();
      queryClient.invalidateQueries({ queryKey: ["leads", "list"] });
    }, 5_000);

    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      queryClient.invalidateQueries({ queryKey: ["leads", "list"] });
    }, Math.max(0, pollUntil - Date.now()));

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [pollUntil, leadsQuery.refetch, queryClient]);

  const handleSubmit = useCallback(
    async (values: { profile_url: string; folder_id: string }) => {
      if (!userId) return;

      const profileUrl = String(values.profile_url || "").trim();
      const folderId = String(values.folder_id || "").trim();

      if (!profileUrl || !folderId) return;

      setSelectedFolderId(folderId);
      setTableFilters((prev) => ({
        ...prev,
        page: 1,
        folder_id: folderId,
        type: leadType,
      }));

      const identifier = extractProfileIdentifier(profileUrl);
      setSubmittedProfile(identifier);

      const response = isLinkedIn
        ? await linkedInScraper.mutateAsync({
            profile_url: profileUrl,
            user_id: userId,
            folder_id: folderId,
          })
        : await instagramScraper.mutateAsync({
            profileUrl,
            user_id: userId,
            folder_id: folderId,
          });

      setScrapeId(extractScrapeId(response));
      setHasStarted(true);
      setPollUntil(Date.now() + 20_000);
      leadsQuery.refetch?.();
    },
    [
      userId,
      leadType,
      isLinkedIn,
      linkedInScraper,
      instagramScraper,
      leadsQuery,
    ],
  );

  return (
    <div className={compact ? "space-y-6" : "space-y-6 p-4 lg:p-6"}>
      <div>
        <Title level={4} className="!mb-1">
          <PlatformIcon className="mr-2" />
          {isLinkedIn ? "LinkedIn Profile Extraction" : "Instagram Profile Extraction"}
        </Title>
        <Text type="secondary">
          {isLinkedIn
            ? "Scrape a LinkedIn profile and review scraped leads below."
            : "Scrape an Instagram profile and review scraped leads below."}
        </Text>
      </div>

      <Row gutter={[16, 24]}>
        <Col xs={24}>
          <Card
            title={
              <Space>
                <PlatformIcon />
                <FormattedMessage
                  id="analysis.profile_extractor.settings"
                  defaultMessage="Scraper Settings"
                />
              </Space>
            }
            bodyStyle={{ padding: 24 }}
          >
            <div className="space-y-5">
              <Alert
                type="info"
                message={
                  <FormattedMessage
                    id="analysis.profile_extractor.info"
                    defaultMessage="Scraping may take several minutes depending on source size. Results will appear in the table below."
                  />
                }
                showIcon
              />

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="space-y-5"
              >
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12} lg={12}>
                    <Form.Item
                      label={intl.formatMessage({
                        id: "analysis.profile_extractor.folder",
                        defaultMessage: "Select Folder",
                      })}
                      name="folder_id"
                      rules={[
                        {
                          required: true,
                          message: intl.formatMessage({
                            id: "analysis.profile_extractor.folder.required",
                            defaultMessage: "Please select a folder",
                          }),
                        },
                      ]}
                    >
                      <Select
                        placeholder={intl.formatMessage({
                          id: "analysis.profile_extractor.folder.placeholder",
                          defaultMessage: "Choose a folder",
                        })}
                        loading={foldersLoading}
                        showSearch
                        optionFilterProp="children"
                      >
                        {foldersList.map((folder) => (
                          <Select.Option key={String(folder._id ?? folder.id)} value={String(folder._id ?? folder.id)}>
                            {folder.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12} lg={12}>
                    <Form.Item
                      label={intl.formatMessage({
                        id: "analysis.profile_extractor.profile_url",
                        defaultMessage: "Profile URL",
                      })}
                      name="profile_url"
                      rules={[
                        {
                          required: true,
                          message: intl.formatMessage({
                            id: "analysis.profile_extractor.profile_url.required",
                            defaultMessage: "Please enter a profile URL",
                          }),
                        },
                      ]}
                    >
                      <Input placeholder="https://..." />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item className="mb-0 mt-1">
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={isSubmitting ? <LoadingOutlined /> : <PlatformIcon />}
                    loading={isSubmitting}
                    size="large"
                  >
                    <FormattedMessage
                      id="analysis.profile_extractor.submit"
                      defaultMessage="Start Scraping"
                    />
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Card>
        </Col>

        <Col xs={24}>
          <Card
            title={
              <FormattedMessage
                id="analysis.profile_extractor.results"
                defaultMessage="Scraped Leads"
              />
            }
            bodyStyle={{ padding: 24 }}
          >
            {!hasStarted ? (
              <Alert
                type="info"
                message={
                  <FormattedMessage
                    id="analysis.profile_extractor.results.empty"
                    defaultMessage="Submit the form above to start scraping. Results will appear here."
                  />
                }
                showIcon
              />
            ) : (
              <LeadsTableServer
                user_id={userId ?? ""}
                folder_id={selectedFolderId || undefined}
                leads={(leadsQuery.data as any)?.data ?? []}
                total={(leadsQuery.data as any)?.pagination?.total ?? 0}
                loading={leadsQuery.isFetching || isSubmitting}
                value={{
                  ...tableFilters,
                  folder_id: selectedFolderId || undefined,
                  type: leadType,
                }}
                onFetch={(next) =>
                  setTableFilters((prev) => ({
                    ...prev,
                    ...next,
                    type: leadType,
                    folder_id: selectedFolderId || undefined,
                  }))
                }
                showFilters={true}
                showFileUpload={false}
                showProfileAvatar={true}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AnalysisProfileExtractor;
