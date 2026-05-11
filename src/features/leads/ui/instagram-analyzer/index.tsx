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
  Statistic,
  Modal,
  message,
} from "antd";
import {
  InstagramOutlined,
  LoadingOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  PauseCircleOutlined,
  CaretRightOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";

import {
  GetScrapeFollowersJobStatus,
  PauseScrapeFollowersJob,
  ResumeScrapeFollowersJob,
  DeleteScrapeFollowersJob,
} from "@/api/api_calls/scrapper";
import { useUserInfo } from "@/helpers/use-user";
import { useFetchFolders } from "@/features/folders/hooks/queries";
import { useScrapeFollowersOrFollowing } from "@/features/scraper/hooks";
import { useSubscriptionState } from "@/features/billings/hooks";
import { useFetchLeadsList } from "../../hooks/queries";
import { useSocket } from "@/hooks/use-socket";
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
  const { id } = useUserInfo();
  const [form] = Form.useForm();

  const isTwitter = platform === "twitter";
  const isLinkedIn = platform === "linkedin";
  const PlatformIcon = isTwitter ? TwitterOutlined : isLinkedIn ? LinkedinOutlined : InstagramOutlined;
  const titleText = isLinkedIn ? "LinkedIn Analyzer" : isTwitter ? "Twitter (X) Analyzer" : "Instagram Analyzer";
  const subtitleText = isLinkedIn
    ? "Scrape followers or following from any LinkedIn profile"
    : isTwitter
    ? "Scrape followers or following from any Twitter (X) account"
    : "Scrape followers or following from any Instagram account";
  const usernameLabel = isLinkedIn ? "LinkedIn Profile URL" : isTwitter ? "Twitter Username" : "Instagram Username";
  const usernamePlaceholder = isLinkedIn ? "e.g., john-smith-12345 or company/acme" : isTwitter ? "e.g., elonmusk" : "e.g., filmdirectorbrucemac";

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
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [scrapedUsername, setScrapedUsername] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeJobState, setActiveJobState] = useState<string | null>(null);
  const [activeJobPaused, setActiveJobPaused] = useState(false);
  const [controlLoading, setControlLoading] = useState<
    "pause" | "resume" | "delete" | null
  >(null);

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
    socket.on("scrape:progress", progressHandler);
    socket.on("scrape:deepscan", deepscanHandler);
    return () => {
      socket.off("scrape:progress", progressHandler);
      socket.off("scrape:deepscan", deepscanHandler);
    };
  }, [socket, refetchLeads]);

  const statusChip = (() => {
    if (!activeJobId && !activeJobState) return null;
    if (activeJobPaused) return <Tag color="orange">Paused</Tag>;
    if (activeJobState === "active") return <Tag color="green">Active</Tag>;
    if (activeJobState === "waiting" || activeJobState === "delayed" || activeJobState === "prioritized")
      return <Tag color="blue">Queued</Tag>;
    if (activeJobState === "completed") return <Tag color="default">Completed</Tag>;
    if (activeJobState === "failed") return <Tag color="red">Failed</Tag>;
    return null;
  })();

  const isScrapeRunning =
    Boolean(activeJobId) &&
    !TERMINAL_JOB_STATES.has(activeJobState || "") &&
    !activeJobPaused;
  const canPause =
    Boolean(activeJobId) &&
    !activeJobPaused &&
    !TERMINAL_JOB_STATES.has(activeJobState || "") &&
    controlLoading === null;
  const canResume = Boolean(activeJobId) && activeJobPaused;
  const canDelete = Boolean(activeJobId) && controlLoading === null;

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
        setActiveJobPaused(Boolean(response?.data?.job?.control?.paused));
        await refetchLeads();

        if (TERMINAL_JOB_STATES.has(nextState)) {
          setActiveJobId(null);
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
  }, [activeJobId, refetchLeads]);

  const handleSubmit = async (values: any) => {
    // ── Credits gate ─────────────────────────────────────────────────────────
    if (creditsRemaining !== null && creditsRemaining < 1) {
      Modal.error({
        title: "Insufficient Credits",
        content:
          "You have 0 credits remaining. Please upgrade your plan to continue scraping.",
        okText: "Go to Billing",
        onOk: () => { window.location.href = "/billings"; },
      });
      return;
    }

    if (creditsRemaining !== null && creditsRemaining < 50) {
      const confirmed = await new Promise<boolean>((resolve) => {
        Modal.confirm({
          title: "Low Credits Warning",
          content: `You only have ${creditsRemaining.toLocaleString()} credit(s) remaining. The scrape may stop early if credits run out. Continue?`,
          okText: "Continue",
          cancelText: "Cancel",
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
      setScrapeQuery((prev) => ({
        ...prev,
        page: 1,
      }));

      const jobId = String(response?.data?.job?.id || "").trim();
      setActiveJobState(jobId ? String(response?.data?.job?.state || "waiting").toLowerCase() : null);
      setActiveJobPaused(Boolean(response?.data?.job?.control?.paused));
      setActiveJobId(jobId || null);

      if (!jobId) {
        await refetchLeads();
      }
    } catch (error) {
      console.error("Scraping error:", error);
    }
  };

  const handlePauseJob = async () => {
    if (!activeJobId) return;
    try {
      setControlLoading("pause");
      const response = await PauseScrapeFollowersJob(activeJobId);
      const job = response?.data?.job;
      setActiveJobState(String(job?.state || activeJobState || "").toLowerCase() || null);
      setActiveJobPaused(Boolean(job?.control?.paused));
      message.success("Scraping paused");
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Failed to pause scraping");
    } finally {
      setControlLoading(null);
    }
  };

  const handleResumeJob = async () => {
    if (!activeJobId) return;
    try {
      setControlLoading("resume");
      const response = await ResumeScrapeFollowersJob(activeJobId);
      const job = response?.data?.job;
      setActiveJobState(String(job?.state || activeJobState || "").toLowerCase() || null);
      setActiveJobPaused(Boolean(job?.control?.paused));
      message.success("Scraping resumed");
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Failed to resume scraping");
    } finally {
      setControlLoading(null);
    }
  };

  const handleDeleteJob = async () => {
    if (!activeJobId) return;
    try {
      setControlLoading("delete");
      await DeleteScrapeFollowersJob(activeJobId);
      setActiveJobId(null);
      setActiveJobState(null);
      setActiveJobPaused(false);
      message.success("Scraping job deleted");
    } catch (error: any) {
      message.error(error?.response?.data?.message || "Failed to delete scraping job");
    } finally {
      setControlLoading(null);
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
                      ? "You have no credits left. Upgrade your plan to start scraping."
                      : `Low credits: ${creditsRemaining.toLocaleString()} remaining. The scrape may stop early if credits run out.`
                  }
                  action={
                    creditsRemaining < 1 ? (
                      <Button size="small" href="/billings" type="primary" danger>
                        Upgrade Plan
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
              {activeJobId && (
                <Alert
                  type="warning"
                  icon={<WarningOutlined />}
                  showIcon
                  message={
                    <span>
                      <strong>Scraping is running in the background.</strong>{" "}
                      Closing this window won&apos;t stop the scrape, but{" "}
                      <strong>keep this tab open</strong> to see results appear
                      in the table in real time.
                      {liveCount !== null && (
                        <span className="ml-2">
                          <Tag color="green">{liveCount.toLocaleString()} saved so far</Tag>
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
                      ? "Running…"
                      : scrapeMutation.isPending
                      ? "Starting…"
                      : <FormattedMessage
                          id="leads.instagram_analyzer.form.submit"
                          defaultMessage="Start Scraping"
                        />}
                  </Button>
                  {statusChip}
                  {activeJobId && (
                    <Space size={10} wrap>
                      <Button
                        icon={<PauseCircleOutlined />}
                        onClick={handlePauseJob}
                        disabled={!canPause}
                        loading={controlLoading === "pause"}
                      >
                        Pause
                      </Button>
                      <Button
                        icon={<CaretRightOutlined />}
                        onClick={handleResumeJob}
                        disabled={!canResume}
                        loading={controlLoading === "resume"}
                      >
                        Resume
                      </Button>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleDeleteJob}
                        disabled={!canDelete}
                        loading={controlLoading === "delete"}
                      >
                        Delete
                      </Button>
                    </Space>
                  )}
                </Space>
              </Form.Item>
              </Form>
            </div>
          </Card>
        </Col>

        {/* ── Real-time scrape stats ── */}
        {(totalScraped !== null || deepScanCount !== null || liveCount !== null) && (
          <Col xs={24}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Card bodyStyle={{ padding: "16px 20px" }} bordered>
                  <Statistic
                    title={
                      <Space size={6}>
                        <TeamOutlined style={{ color: "#1677ff" }} />
                        <span>Total Scraped</span>
                      </Space>
                    }
                    value={totalScraped ?? 0}
                    valueStyle={{ color: "#1677ff", fontWeight: 700 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card bodyStyle={{ padding: "16px 20px" }} bordered>
                  <Statistic
                    title={
                      <Space size={6}>
                        <SaveOutlined style={{ color: "#52c41a" }} />
                        <span>Saved to DB</span>
                      </Space>
                    }
                    value={liveCount ?? 0}
                    valueStyle={{ color: "#52c41a", fontWeight: 700 }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card bodyStyle={{ padding: "16px 20px" }} bordered>
                  <Statistic
                    title={
                      <Space size={6}>
                        <SafetyCertificateOutlined style={{ color: "#722ed1" }} />
                        <span>
                          Deep Scan Completed
                          {deepScanTotal !== null && deepScanTotal > 0 && (
                            <span style={{ fontWeight: 400, color: "#8c8c8c", marginLeft: 4 }}>
                              / {deepScanTotal.toLocaleString()}
                            </span>
                          )}
                        </span>
                      </Space>
                    }
                    value={deepScanCount ?? 0}
                    valueStyle={{ color: "#722ed1", fontWeight: 700 }}
                  />
                </Card>
              </Col>
            </Row>
          </Col>
        )}

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
