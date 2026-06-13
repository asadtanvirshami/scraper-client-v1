"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Alert,
  Switch,
  Tag,
  Tooltip,
  Modal,
  message,
} from "antd";
import {
  InstagramOutlined,
  LoadingOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  WarningOutlined,
  AppstoreOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import { useRouter } from "next/navigation";

import {
  GetScrapeFollowersJobStatus,
  ResumeScrapeFollowersJob,
} from "@/api/api_calls/scrapper";
import { useUserInfo } from "@/helpers/use-user";
import { useFetchFolders } from "@/features/folders/hooks/queries";
import { useScrapeFollowersOrFollowing } from "@/features/scraper/hooks";
import { useSubscriptionState } from "@/features/billings/hooks";
import { useFetchLeadsList } from "../../hooks/queries";
import { useSocket } from "@/hooks/use-socket";
import { isTransientRelationshipFetchError } from "@/features/analysis/scrape-jobs/error-format";
import LeadsTableServer from "../lead-table";

const { Title, Text } = Typography;
const { Option } = Select;
const TERMINAL_JOB_STATES = new Set(["completed", "failed"]);
const PAUSABLE_JOB_STATES = new Set(["waiting", "delayed", "prioritized"]);

type AnalyzerPlatform = "instagram" | "twitter" | "linkedin";

type InstagramAnalyzerProps = {
  platform?: AnalyzerPlatform;
  defaultType?: "followers" | "following";
  lockType?: boolean;
  compact?: boolean;
  showProfileAvatar?: boolean;
};

const InstagramAnalyzer: React.FC<InstagramAnalyzerProps> = ({
  platform = "instagram",
  defaultType = "followers",
  lockType = false,
  compact = false,
  showProfileAvatar = false,
}) => {
  const intl = useIntl();
  const router = useRouter();
  const { id } = useUserInfo();
  const [form] = Form.useForm();

  const isTwitter = platform === "twitter";
  const isLinkedIn = platform === "linkedin";
  const PlatformIcon = isTwitter ? TwitterOutlined : isLinkedIn ? LinkedinOutlined : InstagramOutlined;
  const titleText = intl.formatMessage({
    id: isLinkedIn
      ? "analysis.analyzer.linkedin.title"
      : isTwitter
        ? "analysis.analyzer.twitter.title"
        : "leads.instagram_analyzer.title",
    defaultMessage: isLinkedIn
      ? "LinkedIn Analyzer"
      : isTwitter
        ? "Twitter (X) Analyzer"
        : "Instagram Analyzer",
  });
  const subtitleText = intl.formatMessage({
    id: isLinkedIn
      ? "analysis.analyzer.linkedin.subtitle"
      : isTwitter
        ? "analysis.analyzer.twitter.subtitle"
        : "leads.instagram_analyzer.subtitle",
    defaultMessage: isLinkedIn
      ? "Scrape followers or following from any LinkedIn profile"
      : isTwitter
        ? "Scrape followers or following from any Twitter (X) account"
        : "Scrape followers or following from any Instagram account",
  });
  const usernameLabel = intl.formatMessage({
    id: isLinkedIn
      ? "analysis.analyzer.linkedin.username_label"
      : isTwitter
        ? "analysis.analyzer.twitter.username_label"
        : "leads.instagram_analyzer.form.username",
    defaultMessage: isLinkedIn
      ? "LinkedIn Profile URL"
      : isTwitter
        ? "Twitter Username"
        : "Instagram Username",
  });
  const usernamePlaceholder = intl.formatMessage({
    id: isLinkedIn
      ? "analysis.analyzer.linkedin.username_placeholder"
      : isTwitter
        ? "analysis.analyzer.twitter.username_placeholder"
        : "leads.instagram_analyzer.form.username_placeholder",
    defaultMessage: isLinkedIn
      ? "e.g., john-smith-12345 or company/acme"
      : isTwitter
        ? "e.g., elonmusk"
        : "e.g., filmdirectorbrucemac",
  });

  const [scrapeQuery, setScrapeQuery] = useState({
    page: 1,
    limit: 10,
    search: "",
    has_contacts: false,
    type: "INSTAGRAM" as string,
  });

  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [totalScraped, setTotalScraped] = useState<number | null>(null);
  const [deepScanCount, setDeepScanCount] = useState<number | null>(null);
  const [deepScanTotal, setDeepScanTotal] = useState<number | null>(null);
  const [profilesFetched, setProfilesFetched] = useState<number | null>(null);
  const [profilesTotal, setProfilesTotal] = useState<number | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [scrapedUsername, setScrapedUsername] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeJobState, setActiveJobState] = useState<string | null>(null);
  const [activeJobFailedReason, setActiveJobFailedReason] = useState<string | null>(null);
  const [activeJobPaused, setActiveJobPaused] = useState(false);
  const [retryingJob, setRetryingJob] = useState(false);
  const [jobPollNonce, setJobPollNonce] = useState(0);

  const { subscription } = useSubscriptionState();
  const creditsRemaining = subscription
    ? Math.max(0, (subscription.credits_total ?? 0) - (subscription.credits_used ?? 0))
    : null;

  const { data: foldersResp, isLoading: foldersLoading } = useFetchFolders({
    user_id: id,
    limit: 1000,
  });

  const foldersList = ((foldersResp as any)?.folders ??
    (foldersResp as any)?.data ??
    []) as any[];

  const {
    data: leads,
    isFetching: leadsFetching,
    refetch: refetchLeads,
  } = useFetchLeadsList({
    user_id: id ?? "",
    limit: scrapeQuery.limit,
    page: scrapeQuery.page,
    search: scrapeQuery.search,
    type: "INSTAGRAM",
    folder_id: selectedFolderId || undefined,
    scrape_status: true,
    scraped_from_username: scrapedUsername || undefined,
    has_contacts: scrapeQuery.has_contacts || undefined,
  });

  const scrapeMutation = useScrapeFollowersOrFollowing();
  const socket = useSocket(id);

  // ── Real-time progress from server ──────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const progressHandler = (payload: {
      saved_count: number;
      total_scraped: number;
      total_on_profile: number | null;
      deep_scan_count: number;
      deep_scan_total: number;
      folder_id: string | null;
    }) => {
      setLiveCount(payload.saved_count);
      setTotalScraped(payload.total_scraped);
      if (payload.deep_scan_count != null) setDeepScanCount(payload.deep_scan_count);
      if (payload.deep_scan_total != null) setDeepScanTotal(payload.deep_scan_total);
      refetchLeads();
    };
    const deepscanHandler = (payload: {
      deep_scan_count: number;
      deep_scan_total: number;
      username: string;
    }) => {
      setDeepScanCount(payload.deep_scan_count);
      setDeepScanTotal(payload.deep_scan_total);
    };
    const followerCountHandler = (payload: {
      completed: number;
      total: number;
    }) => {
      setProfilesFetched(payload.completed);
      setProfilesTotal(payload.total);
    };
    const enrichedCountHandler = (payload: {
      job_id: string | null;
      enriched_profile_count: number;
    }) => {
      const eventJobId = String(payload?.job_id || "").trim();
      if (!eventJobId || !activeJobId || eventJobId !== activeJobId) {
        return;
      }

      const increment = Number(payload?.enriched_profile_count) || 0;
      if (increment <= 0) return;

      setProfilesFetched((prev) => (prev ?? 0) + increment);
    };
    socket.on("scrape:progress", progressHandler);
    socket.on("scrape:deepscan", deepscanHandler);
    socket.on("scrape:follower_count", followerCountHandler);
    socket.on("scrape:enriched_profile_count", enrichedCountHandler);
    return () => {
      socket.off("scrape:progress", progressHandler);
      socket.off("scrape:deepscan", deepscanHandler);
      socket.off("scrape:follower_count", followerCountHandler);
      socket.off("scrape:enriched_profile_count", enrichedCountHandler);
    };
  }, [socket, refetchLeads, activeJobId]);

  const statusChip = (() => {
    if (!activeJobId && !activeJobState) return null;
    if (activeJobPaused) {
      return (
        <Tag color="orange">
          {intl.formatMessage({
            id: "analysis.analyzer.status.paused",
            defaultMessage: "Paused",
          })}
        </Tag>
      );
    }
    // Transient fetch failures are presented as Queued (retryable) rather than
    // a hard Failed — consistent with the Scrape Jobs manager.
    const displayState =
      activeJobState === "failed" &&
      isTransientRelationshipFetchError(activeJobFailedReason)
        ? "queued"
        : activeJobState;
    if (displayState === "active") {
      return (
        <Tag color="green">
          {intl.formatMessage({
            id: "analysis.analyzer.status.active",
            defaultMessage: "Active",
          })}
        </Tag>
      );
    }
    if (
      displayState === "queued" ||
      displayState === "waiting" ||
      displayState === "delayed" ||
      displayState === "prioritized"
    )
      return (
        <Tag color="blue">
          {intl.formatMessage({
            id: "analysis.analyzer.status.queued",
            defaultMessage: "Queued",
          })}
        </Tag>
      );
    if (displayState === "completed") {
      return (
        <Tag color="default">
          {intl.formatMessage({
            id: "analysis.analyzer.status.completed",
            defaultMessage: "Completed",
          })}
        </Tag>
      );
    }
    if (displayState === "failed") {
      return (
        <Tag color="red">
          {intl.formatMessage({
            id: "analysis.analyzer.status.failed",
            defaultMessage: "Failed",
          })}
        </Tag>
      );
    }
    return null;
  })();

  const isScrapeRunning =
    Boolean(activeJobId) &&
    !TERMINAL_JOB_STATES.has(activeJobState || "") &&
    !activeJobPaused;

  useEffect(() => {
    if (!activeJobId) {
      return;
    }

    let timeoutId: number | undefined;
    let cancelled = false;

    const pollJobStatus = async () => {
      try {
        const response = await GetScrapeFollowersJobStatus(activeJobId);
        if (cancelled) {
          return;
        }

        const nextState = String(response?.data?.job?.state || "").toLowerCase();
        setActiveJobState(nextState || null);
        setActiveJobFailedReason(response?.data?.job?.failedReason || null);
        setActiveJobPaused(Boolean(response?.data?.job?.control?.paused));
        await refetchLeads();

        if (nextState === "completed") {
          setActiveJobId(null);
          setActiveJobPaused(false);
          return;
        }

        if (nextState === "failed") {
          setActiveJobPaused(false);
          return;
        }

        timeoutId = window.setTimeout(pollJobStatus, 3000);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Failed to poll scrape job status:", error);
        setActiveJobState("failed");
        setActiveJobId(null);
        setActiveJobPaused(false);
      }
    };

    pollJobStatus();

    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [activeJobId, jobPollNonce, refetchLeads]);

  const handleSubmit = async (values: any) => {
    // ── Credits gate ─────────────────────────────────────────────────────────
    if (creditsRemaining !== null && creditsRemaining < 1) {
      Modal.error({
        title: intl.formatMessage({
          id: "analysis.analyzer.credits.insufficient_title",
          defaultMessage: "Insufficient Credits",
        }),
        content: intl.formatMessage({
          id: "analysis.analyzer.credits.insufficient_content",
          defaultMessage:
            "You have 0 credits remaining. Please upgrade your plan to continue scraping.",
        }),
        okText: intl.formatMessage({
          id: "analysis.analyzer.credits.go_billing",
          defaultMessage: "Go to Billing",
        }),
        onOk: () => { window.location.href = "/billings"; },
      });
      return;
    }

    if (creditsRemaining !== null && creditsRemaining < 50) {
      const confirmed = await new Promise<boolean>((resolve) => {
        Modal.confirm({
          title: intl.formatMessage({
            id: "analysis.analyzer.credits.low_title",
            defaultMessage: "Low Credits Warning",
          }),
          content: intl.formatMessage(
            {
              id: "analysis.analyzer.credits.low_content",
              defaultMessage:
                "You only have {credits} credit(s) remaining. The scrape may stop early if credits run out. Continue?",
            },
            { credits: creditsRemaining.toLocaleString() },
          ),
          okText: intl.formatMessage({
            id: "analysis.analyzer.credits.continue",
            defaultMessage: "Continue",
          }),
          cancelText: intl.formatMessage({
            id: "commons.cancel",
            defaultMessage: "Cancel",
          }),
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      });
      if (!confirmed) return;
    }

    try {
      const username = String(values.username || "").trim().replace(/^@+/, "");
      const response = await scrapeMutation.mutateAsync({
        user_id: id ?? "",
        folder_id: values.folder_id,
        username,
        type: values.type,
        // max_limit not sent — backend uses real profile totalCount from DOM
      });

      setSelectedFolderId(values.folder_id);
      setScrapedUsername(username);
      setLiveCount(null); // reset live counters for new scrape
      setTotalScraped(null);
      setDeepScanCount(null);
      setDeepScanTotal(null);
      setProfilesFetched(0);
      setProfilesTotal(null);
      setScrapeQuery((prev) => ({
        ...prev,
        page: 1,
      }));

      const jobId = String(response?.data?.job?.id || "").trim();
      setActiveJobState(jobId ? String(response?.data?.job?.state || "waiting").toLowerCase() : null);
      setActiveJobFailedReason(null);
      setActiveJobPaused(Boolean(response?.data?.job?.control?.paused));
      setActiveJobId(jobId || null);

      if (!jobId) {
        await refetchLeads();
      }
    } catch (error) {
      console.error("Scraping error:", error);
    }
  };

  const handleRetryActiveJob = async () => {
    if (!activeJobId) return;

    setRetryingJob(true);
    try {
      const response = await ResumeScrapeFollowersJob(activeJobId);
      const jobId = String(response?.data?.job?.id || activeJobId).trim();
      setActiveJobId(jobId || activeJobId);
      setActiveJobState(String(response?.data?.job?.state || "waiting").toLowerCase());
      setActiveJobFailedReason(null);
      setActiveJobPaused(Boolean(response?.data?.job?.control?.paused));
      setJobPollNonce((prev) => prev + 1);
      message.info(
        intl.formatMessage({
          id: "analysis.analyzer.actions.retry_started",
          defaultMessage: "Retrying job",
        }),
      );
    } catch (error: any) {
      message.error(
        error?.response?.data?.message ||
          intl.formatMessage({
            id: "analysis.analyzer.actions.retry_failed",
            defaultMessage: "Failed to retry job",
          }),
      );
    } finally {
      setRetryingJob(false);
    }
  };

  return (
    <div className={compact ? "space-y-6" : "space-y-6 p-4 lg:p-6"}>
      <div>
        <Title level={4} className="!mb-1">
          <PlatformIcon className="mr-2" />
          {titleText}
        </Title>
        <Text type="secondary">{subtitleText}</Text>
      </div>

      <Row gutter={[16, 24]}>
        <Col xs={24}>
          <Card
            title={
              <Space>
                <PlatformIcon />
                <FormattedMessage
                  id="leads.instagram_analyzer.form.title"
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
                    id="leads.instagram_analyzer.info"
                    defaultMessage="Scraping may take several minutes depending on the number of accounts. Results will appear in the table below."
                  />
                }
                showIcon
              />

              {creditsRemaining !== null && creditsRemaining < 50 && (
                <Alert
                  type={creditsRemaining < 1 ? "error" : "warning"}
                  showIcon
                  message={
                    creditsRemaining < 1
                      ? intl.formatMessage({
                          id: "analysis.analyzer.credits.none_remaining",
                          defaultMessage:
                            "You have no credits left. Upgrade your plan to start scraping.",
                        })
                      : intl.formatMessage(
                          {
                            id: "analysis.analyzer.credits.low_banner",
                            defaultMessage:
                              "Low credits: {credits} remaining. The scrape may stop early if credits run out.",
                          },
                          { credits: creditsRemaining.toLocaleString() },
                        )
                  }
                  action={
                    creditsRemaining < 1 ? (
                      <Button size="small" href="/billings" type="primary" danger>
                        <FormattedMessage
                          id="analysis.analyzer.credits.upgrade_plan"
                          defaultMessage="Upgrade Plan"
                        />
                      </Button>
                    ) : undefined
                  }
                />
              )}

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  type: defaultType,
                }}
                className="space-y-5"
              >
                <Row gutter={[24, 24]}>
                <Col xs={24} md={12} lg={6}>
                  <Form.Item
                    label={
                      <FormattedMessage
                        id="leads.instagram_analyzer.form.folder"
                        defaultMessage="Select Folder"
                      />
                    }
                    name="folder_id"
                    rules={[
                      {
                        required: true,
                        message: intl.formatMessage({
                          id: "leads.instagram_analyzer.form.folder.required",
                          defaultMessage: "Please select a folder",
                        }),
                      },
                    ]}
                  >
                    <Select
                      placeholder={intl.formatMessage({
                        id: "leads.instagram_analyzer.form.folder.placeholder",
                        defaultMessage: "Choose a folder",
                      })}
                      loading={foldersLoading}
                      showSearch
                      optionFilterProp="children"
                      style={{ width: "100%" }}
                    >
                      {foldersList.map((folder: any) => (
                        <Option key={folder._id} value={folder._id}>
                          {folder.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12} lg={6}>
                  <Form.Item
                    label={usernameLabel}
                    name="username"
                    rules={[
                      {
                        required: true,
                        message: intl.formatMessage({
                          id: "leads.instagram_analyzer.form.username.required",
                          defaultMessage: "Please enter a username",
                        }),
                      },
                    ]}
                  >
                    <Input placeholder={usernamePlaceholder} prefix="@" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12} lg={6}>
                  <Form.Item
                    label={
                      <FormattedMessage
                        id="leads.instagram_analyzer.form.type"
                        defaultMessage="Scrape Type"
                      />
                    }
                    name="type"
                    rules={[
                      {
                        required: true,
                        message: intl.formatMessage({
                          id: "leads.instagram_analyzer.form.type.required",
                          defaultMessage: "Please select a type",
                        }),
                      },
                    ]}
                  >
                    <Select style={{ width: "100%" }} disabled={lockType}>
                      <Option value="followers">
                        <FormattedMessage
                          id="leads.instagram_analyzer.form.type.followers"
                          defaultMessage="Followers"
                        />
                      </Option>
                      <Option value="following">
                        <FormattedMessage
                          id="leads.instagram_analyzer.form.type.following"
                          defaultMessage="Following"
                        />
                      </Option>
                    </Select>
                  </Form.Item>
                </Col>
                </Row>

              {/* Keep-window-open banner — shown as soon as a job is active */}
              {activeJobId && !TERMINAL_JOB_STATES.has(activeJobState || "") && (
                <Alert
                  type="warning"
                  icon={<WarningOutlined />}
                  showIcon
                  message={
                    <span>
                      <strong>
                        {intl.formatMessage({
                          id: "analysis.analyzer.background_running.title",
                          defaultMessage: "Scraping is running in the background.",
                        })}
                      </strong>{" "}
                      {intl.formatMessage({
                        id: "analysis.analyzer.background_running.body",
                        defaultMessage:
                          "Closing this window won't stop the scrape, but keep this tab open to see results appear in the table in real time.",
                      })}
                      {liveCount !== null && (
                        <span className="ml-2">
                          <Tag color="green">
                            {intl.formatMessage(
                              {
                                id: "analysis.analyzer.background_running.saved_so_far",
                                defaultMessage: "{count} saved so far",
                              },
                              { count: liveCount.toLocaleString() },
                            )}
                          </Tag>
                        </span>
                      )}
                    </span>
                  }
                />
              )}

              <Form.Item className="mb-0 mt-1">
                <Space size={12} wrap align="center">
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={
                      scrapeMutation.isPending || isScrapeRunning ? <LoadingOutlined /> : <PlatformIcon />
                    }
                    loading={scrapeMutation.isPending}
                    disabled={Boolean(activeJobId)}
                    size="large"
                  >
                    {isScrapeRunning
                      ? intl.formatMessage({
                          id: "analysis.analyzer.actions.running",
                          defaultMessage: "Running...",
                        })
                      : scrapeMutation.isPending
                      ? intl.formatMessage({
                          id: "analysis.analyzer.actions.starting",
                          defaultMessage: "Starting...",
                        })
                      : <FormattedMessage
                          id="leads.instagram_analyzer.form.submit"
                          defaultMessage="Start Scraping"
                        />}
                  </Button>
                  {statusChip}
                  {activeJobId && activeJobState === "failed" && (
                    <Button
                      icon={<ReloadOutlined />}
                      loading={retryingJob}
                      disabled={retryingJob}
                      onClick={handleRetryActiveJob}
                    >
                      <FormattedMessage
                        id="analysis.analyzer.actions.retry"
                        defaultMessage="Retry"
                      />
                    </Button>
                  )}
                  {activeJobId && (
                    <Button
                      icon={<AppstoreOutlined />}
                      onClick={() => router.push("/analysis/scrape-jobs")}
                    >
                      <FormattedMessage
                        id="analysis.analyzer.actions.go_to_manager"
                        defaultMessage="Go to Analysis Manager"
                      />
                    </Button>
                  )}
                </Space>
              </Form.Item>
              </Form>
            </div>
          </Card>
        </Col>

        <Col xs={24}>
          <Card
            title={
              <Space>
                <FormattedMessage
                  id="leads.instagram_analyzer.results.title"
                  defaultMessage="Scraped Leads"
                />
              </Space>
            }
            bodyStyle={{ padding: 24 }}
            extra={
              selectedFolderId && (
                <Space>
                  <Text>
                    <FormattedMessage
                      id="leads.instagram_analyzer.has_contacts"
                      defaultMessage="Has Contacts"
                    />
                  </Text>
                  <Switch
                    checked={scrapeQuery.has_contacts}
                    onChange={(checked) => {
                      setScrapeQuery((prev) => ({
                        ...prev,
                        has_contacts: checked,
                        page: 1,
                      }));
                    }}
                  />
                </Space>
              )
            }
          >
            <div className="space-y-4">
              {!selectedFolderId ? (
                <Alert
                  type="info"
                  message={
                    <FormattedMessage
                      id="leads.instagram_analyzer.results.empty"
                      defaultMessage="Submit the form above to start scraping. Results will appear here."
                    />
                  }
                  showIcon
                />
              ) : (
                <LeadsTableServer
                  user_id={id ?? ""}
                  folder_id={selectedFolderId}
                  leads={leads?.data ?? []}
                  total={leads?.pagination?.total ?? 0}
                  loading={leadsFetching || isScrapeRunning}
                  value={scrapeQuery}
                  onFetch={(next) => setScrapeQuery(next as any)}
                  showFilters={true}
                  showFileUpload={false}
                  showProfileAvatar={showProfileAvatar}
                />
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default InstagramAnalyzer;
