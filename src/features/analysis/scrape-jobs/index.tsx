"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CaretRightOutlined,
  DeleteOutlined,
  DownOutlined,
  InfoCircleOutlined,
  InstagramOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import {
  DeleteScrapeFollowersJob,
  ListScrapeFollowersJobs,
  PauseScrapeFollowersJob,
  ResumeScrapeFollowersJob,
} from "@/api/api_calls/scrapper";
import { FetchAllLeadsList } from "@/api/api_calls/leads";
import { useUserInfo } from "@/helpers/use-user";
import { useSocket } from "@/hooks/use-socket";
import { formatScrapeJobError, isTransientRelationshipFetchError } from "./error-format";

const { Title, Text } = Typography;

const TERMINAL_STATES = new Set(["completed", "failed"]);

// How long to keep a just-acted-on job (pause/resume) pinned in the list even
// if the queue backend transiently omits it during its remove+re-add cycle.
const ACTION_GRACE_MS = 15000;

const stateTag = (
  intl: ReturnType<typeof useIntl>,
  state: string,
  paused: boolean,
) => {
  if (paused) {
    return (
      <Tag color="orange">
        {intl.formatMessage({
          id: "analysis.scrape_jobs.status.paused",
          defaultMessage: "Paused",
        })}
      </Tag>
    );
  }
  switch (state) {
    case "active":
      return (
        <Tag color="green">
          {intl.formatMessage({
            id: "analysis.scrape_jobs.status.active",
            defaultMessage: "Active",
          })}
        </Tag>
      );
    case "queued":
    case "waiting":
    case "delayed":
    case "prioritized":
      return (
        <Tag color="blue">
          {intl.formatMessage({
            id: "analysis.scrape_jobs.status.queued",
            defaultMessage: "Queued",
          })}
        </Tag>
      );
    case "completed":
      return (
        <Tag color="green">
          {intl.formatMessage({
            id: "analysis.scrape_jobs.status.completed",
            defaultMessage: "Completed",
          })}
        </Tag>
      );
    case "failed":
      return (
        <Tag color="red">
          {intl.formatMessage({
            id: "analysis.scrape_jobs.status.failed",
            defaultMessage: "Failed",
          })}
        </Tag>
      );
    default: return <Tag >{state}</Tag>;
  }
};

interface ScrapeJob {
  id: string;
  state: string;
  status?: string;
  timestamp: number;
  processedOn: number | null;
  finishedOn: number | null;
  failedReason: string | null;
  progress: number;
  control: { paused: boolean; pausedAt: string | null };
  pipeline?: { paused?: boolean; status?: string } | null;
  scrape_job?: { status?: string } | null;
  result: any;
  data: {
    targetUsername: string;
    type: string;
    folder_id: string | null;
    user_id: string;
  };
}

const isJobPaused = (job: ScrapeJob) =>
  Boolean(
    job.control?.paused ||
      job.state === "paused" ||
      job.status === "PAUSED" ||
      job.pipeline?.paused ||
      job.scrape_job?.status === "PAUSED",
  );

// A transient fetch failure (temporary upstream/session issue) is not a real
// dead-end. We present these as "Queued" with a Retry action rather than a
// scary "Failed", since re-running the job typically succeeds.
const isTransientQueued = (job: ScrapeJob) =>
  job.state === "failed" && isTransientRelationshipFetchError(job.failedReason);

// State used purely for display. Transient fetch failures are shown as queued;
// everything else (including the rate-budget exhaustion case) keeps its real
// state so a genuine "Failed" is still surfaced.
const getDisplayState = (job: ScrapeJob) =>
  isTransientQueued(job) ? "queued" : job.state;

// Both transient (shown as queued) and genuinely failed jobs offer a Retry.
const canRetryJob = (job: ScrapeJob) => job.state === "failed";

// ── Leads sub-table rendered when a job row is expanded ──────────────────────
function JobLeadsTable({
  userId,
  targetUsername,
  folderId,
}: {
  userId: string;
  targetUsername: string;
  folderId: string | null;
}) {
  const intl = useIntl();
  const { token } = theme.useToken();
  const [leadsPage, setLeadsPage] = useState(1);
  const LIMIT = 10;
  const [leads, setLeads] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasContacts, setHasContacts] = useState(false);

  const fetch = useCallback(
    async (p: number) => {
      if (!userId || !targetUsername) return;
      setLoading(true);
      try {
        const res = await FetchAllLeadsList({
          user_id: userId,
          scraped_from_username: targetUsername,
          ...(folderId ? { folder_id: folderId } : {}),
          page: p,
          limit: LIMIT,
          scrape_status: true,
          type: "INSTAGRAM",
          has_contacts: hasContacts || undefined,
        } as any);
        // response shape: { data: Lead[], pagination: { total, page, limit, totalPages } }
        const list: any[] = Array.isArray(res?.data) ? res.data : [];
        const tot: number = res?.pagination?.total ?? list.length;
        setLeads(list);
        setTotal(tot);
      } catch {
        message.error(
          intl.formatMessage({
            id: "analysis.scrape_jobs.leads.load_failed",
            defaultMessage: "Failed to load leads for this job",
          }),
        );
      } finally {
        setLoading(false);
      }
    },
    [userId, targetUsername, folderId, hasContacts],
  );

  useEffect(() => {
    fetch(leadsPage);
  }, [leadsPage, fetch]);

  useEffect(() => {
    setLeadsPage(1);
  }, [hasContacts]);

  const leadsColumns: ColumnsType<any> = [
    {
      title: intl.formatMessage({
        id: "analysis.scrape_jobs.leads.table.avatar",
        defaultMessage: "Avatar",
      }),
      key: "avatar",
      width: 56,
      render: (_, r) => (
        <Avatar
          size={32}
          src={r.avatar_url || r.avatar_rul}
          icon={<UserOutlined />}
        />
      ),
    },
    {
      title: intl.formatMessage({
        id: "analysis.scrape_jobs.leads.table.username",
        defaultMessage: "Username",
      }),
      key: "username",
      render: (_, r) => (
        <a
          href={r.source_url || `https://instagram.com/${r.username}`}
          target="_blank"
          rel="noreferrer"
        >
          @{r.username || r.company || "—"}
        </a>
      ),
    },
    {
      title: intl.formatMessage({
        id: "analysis.scrape_jobs.leads.table.full_name",
        defaultMessage: "Full Name",
      }),
      dataIndex: "full_name",
      key: "full_name",
      render: (v: string) => v || <Text type="secondary">—</Text>,
    },
    {
      title: intl.formatMessage({
        id: "analysis.scrape_jobs.leads.table.followers",
        defaultMessage: "Followers",
      }),
      key: "followers",
      width: 100,
      render: (_, r) =>
        r.follower_count != null
          ? r.follower_count.toLocaleString()
          : <Text type="secondary">—</Text>,
    },
    {
      title: intl.formatMessage({
        id: "analysis.scrape_jobs.leads.table.emails",
        defaultMessage: "Emails",
      }),
      key: "emails",
      render: (_, r) => {
        const emails: string[] = r.emails ?? [];
        if (!emails.length) return <Text type="secondary">—</Text>;
        return (
          <Space size={4} wrap>
            {emails.map((e) => (
              <Tag key={e} color="blue" style={{ fontSize: 11 }}>{e}</Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: intl.formatMessage({
        id: "analysis.scrape_jobs.leads.table.phones",
        defaultMessage: "Phones",
      }),
      key: "phones",
      render: (_, r) => {
        const phones: string[] = r.phone_numbers ?? [];
        if (!phones.length) return <Text type="secondary">—</Text>;
        return (
          <Space size={4} wrap>
            {phones.map((p) => (
              <Tag key={p} color="green" style={{ fontSize: 11 }}>{p}</Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: intl.formatMessage({
        id: "analysis.scrape_jobs.leads.table.verified",
        defaultMessage: "Verified",
      }),
      key: "verified",
      width: 80,
      render: (_, r) =>
        r.is_verified ? (
          <Tag color="gold">✓ Yes</Tag>
        ) : (
          <Text type="secondary">No</Text>
        ),
    },
    {
      title: intl.formatMessage({
        id: "analysis.scrape_jobs.leads.table.private",
        defaultMessage: "Private",
      }),
      key: "private",
      width: 80,
      render: (_, r) =>
        r.is_private ? <Tag color="default">Private</Tag> : <Tag color="green">Public</Tag>,
    },
  ];

  return (
    <div
      style={{
        padding: "12px 24px 20px",
        background: token.colorFillAlter,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <div
        style={{
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <Space size={8} align="center">
          <InstagramOutlined style={{ color: "#e1306c" }} />
          <Text strong>
            {intl.formatMessage(
              {
                id: "analysis.scrape_jobs.leads.scraped_from",
                defaultMessage: "Leads scraped from @{username}",
              },
              { username: targetUsername },
            )}
          </Text>
          {total > 0 && (
            <Tag color="blue">
              {intl.formatMessage(
                {
                  id: "analysis.scrape_jobs.leads.total",
                  defaultMessage: "{count} total",
                },
                { count: total.toLocaleString() },
              )}
            </Tag>
          )}
        </Space>
        <Space size={8} align="center">
          <Text>
            {intl.formatMessage({
              id: "analysis.scrape_jobs.leads.has_contacts",
              defaultMessage: "Has Contacts (Email/Phone)",
            })}
          </Text>
          <Switch
            checked={hasContacts}
            onChange={(checked) => setHasContacts(checked)}
            size="small"
          />
        </Space>
      </div>
      <Table
        dataSource={leads}
        columns={leadsColumns}
        rowKey="_id"
        loading={loading}
        size="small"
        pagination={{
          current: leadsPage,
          pageSize: LIMIT,
          total,
          onChange: (p) => setLeadsPage(p),
          showSizeChanger: false,
          showTotal: (t) =>
            intl.formatMessage(
              {
                id: "analysis.scrape_jobs.leads.pagination_total",
                defaultMessage: "{count} leads",
              },
              { count: t },
            ),
          size: "small",
        }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={intl.formatMessage({
                id: "analysis.scrape_jobs.leads.empty",
                defaultMessage: "No leads found for this job yet.",
              })}
            />
          ),
        }}
        scroll={{ x: 700 }}
      />
    </div>
  );
}

export default function ScrapeJobsManager() {
  const intl = useIntl();
  const { token } = theme.useToken();
  const { id: userId } = useUserInfo();
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, string>>({});
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // jobId -> timestamp of the last pause/resume action, used to keep a row
  // visible while the queue backend settles (eventual consistency).
  const recentActionRef = useRef<Map<string, number>>(new Map());
  const socket = useSocket(userId);

  // Optimistically patch a single job row so pause/resume reflect instantly and
  // the row never flickers out of the list.
  const patchJob = useCallback(
    (
      jobId: string,
      patch: Omit<Partial<ScrapeJob>, "control"> & {
        control?: Partial<ScrapeJob["control"]>;
      },
    ) => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? { ...j, ...patch, control: { ...j.control, ...(patch.control ?? {}) } }
            : j,
        ),
      );
    },
    [],
  );

  // live per-job profile counts keyed as "targetUsername:type"
  const [liveJobCounts, setLiveJobCounts] = useState<
    Record<string, { completed: number; total: number }>
  >({});

  useEffect(() => {
    if (!socket) return;
    const handler = (payload: {
      target_username: string;
      type: string;
      completed: number;
      total: number;
    }) => {
      const key = `${payload.target_username}:${payload.type}`;
      setLiveJobCounts((prev) => ({
        ...prev,
        [key]: { completed: payload.completed, total: payload.total },
      }));
    };
    socket.on("scrape:follower_count", handler);
    return () => { socket.off("scrape:follower_count", handler); };
  }, [socket]);

  const fetchJobs = useCallback(async (p = page, silent = false) => {
    if (!userId) return;
    if (!silent) setLoading(true);
    try {
      const res = await ListScrapeFollowersJobs({ page: p, limit: 20 });
      const serverJobs: ScrapeJob[] = res?.data?.jobs ?? [];
      const serverTotal: number = res?.data?.total ?? serverJobs.length;

      setJobs((prev) => {
        const now = Date.now();
        for (const [id, ts] of recentActionRef.current) {
          if (now - ts > ACTION_GRACE_MS) recentActionRef.current.delete(id);
        }
        const serverIds = new Set(serverJobs.map((j) => j.id));
        // Keep recently paused/resumed jobs that the queue backend is briefly
        // omitting (remove + re-add cycle) so they don't disappear until reload.
        const preserved = prev.filter(
          (j) => !serverIds.has(j.id) && recentActionRef.current.has(j.id),
        );
        if (!preserved.length) return serverJobs;
        // Keep newest-first ordering so a preserved row doesn't jump position.
        return [...serverJobs, ...preserved].sort(
          (a, b) => (b.timestamp || 0) - (a.timestamp || 0),
        );
      });
      setTotal(serverTotal);
    } catch {
      if (!silent) {
        message.error(
          intl.formatMessage({
            id: "analysis.scrape_jobs.load_failed",
            defaultMessage: "Failed to load scrape jobs",
          }),
        );
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [intl, userId, page]);

  // Initial load + poll while any job is active/waiting
  useEffect(() => {
    fetchJobs(page);
  }, [page, fetchJobs]);

  useEffect(() => {
    // Only poll while a job can actually change state. Paused jobs sit idle
    // (resumable on demand) and terminal jobs are done — polling those just
    // hammers the queue backend with no benefit.
    const hasLive = jobs.some(
      (j) => !TERMINAL_STATES.has(j.state) && !isJobPaused(j),
    );
    if (!hasLive) {
      if (pollRef.current) clearTimeout(pollRef.current);
      return;
    }
    pollRef.current = setTimeout(() => fetchJobs(page, true), 5000);
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [jobs, page, fetchJobs]);

  const setJobAction = (jobId: string, action: string) =>
    setActionLoading((prev) => ({ ...prev, [jobId]: action }));
  const clearJobAction = (jobId: string) =>
    setActionLoading((prev) => { const n = { ...prev }; delete n[jobId]; return n; });

  const handlePause = async (jobId: string) => {
    setJobAction(jobId, "pause");
    // Optimistically pin the row as paused so it stays visible immediately.
    patchJob(jobId, { state: "paused", status: "PAUSED", control: { paused: true } });
    recentActionRef.current.set(jobId, Date.now());
    try {
      await PauseScrapeFollowersJob(jobId);
      message.success(
        intl.formatMessage({
          id: "analysis.scrape_jobs.actions.paused",
          defaultMessage: "Job paused",
        }),
      );
      await fetchJobs(page, true);
    } catch (e: any) {
      message.error(
        e?.response?.data?.message ||
          intl.formatMessage({
            id: "analysis.scrape_jobs.actions.pause_failed",
            defaultMessage: "Failed to pause job",
          }),
      );
      // Revert the optimistic patch on failure.
      await fetchJobs(page, true);
    } finally { clearJobAction(jobId); }
  };

  const handleResume = async (jobId: string) => {
    const isRetry = jobs.find((j) => j.id === jobId)?.state === "failed";
    setJobAction(jobId, "resume");
    // Optimistically re-queue the row (and clear any prior error) so it stays
    // visible and reflects the action instantly.
    patchJob(jobId, {
      state: "waiting",
      status: "QUEUED",
      failedReason: null,
      control: { paused: false },
    });
    recentActionRef.current.set(jobId, Date.now());
    try {
      await ResumeScrapeFollowersJob(jobId);
      message.info(
        isRetry
          ? intl.formatMessage({
              id: "analysis.scrape_jobs.actions.retrying",
              defaultMessage: "Retrying job",
            })
          : intl.formatMessage({
              id: "analysis.scrape_jobs.actions.resuming",
              defaultMessage: "Resuming job",
            }),
      );
      await fetchJobs(page, true);
    } catch (e: any) {
      message.error(
        e?.response?.data?.message ||
          intl.formatMessage({
            id: "analysis.scrape_jobs.actions.resume_failed",
            defaultMessage: "Failed to resume job",
          }),
      );
      // Revert the optimistic patch on failure.
      await fetchJobs(page, true);
    } finally { clearJobAction(jobId); }
  };

  const handleDelete = async (jobId: string) => {
    setJobAction(jobId, "delete");
    try {
      await DeleteScrapeFollowersJob(jobId);
      message.success(
        intl.formatMessage({
          id: "analysis.scrape_jobs.actions.deleted",
          defaultMessage: "Job deleted",
        }),
      );
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setTotal((t) => Math.max(0, t - 1));
    } catch (e: any) {
      message.error(
        e?.response?.data?.message ||
          intl.formatMessage({
            id: "analysis.scrape_jobs.actions.delete_failed",
            defaultMessage: "Failed to delete job",
          }),
      );
    } finally { clearJobAction(jobId); }
  };

  const columns: ColumnsType<ScrapeJob> = [
    {
      title: intl.formatMessage({
        id: "analysis.scrape_jobs.table.target",
        defaultMessage: "Target",
      }),
      dataIndex: ["data", "targetUsername"],
      key: "target",
      render: (v: string) => <Text strong>@{v}</Text>,
    },
    {
      title: intl.formatMessage({
        id: "analysis.scrape_jobs.table.type",
        defaultMessage: "Type",
      }),
      dataIndex: ["data", "type"],
      key: "type",
      width: 110,
      render: (v: string) => (
        <Tag color={v === "followers" ? "blue" : "purple"}>
          {intl.formatMessage({
            id: `analysis.services.${v}.short_title`,
            defaultMessage: v?.charAt(0).toUpperCase() + v?.slice(1),
          })}
        </Tag>
      ),
    },
    {
      title: intl.formatMessage({
        id: "analysis.scrape_jobs.table.status",
        defaultMessage: "Status",
      }),
      key: "status",
      width: 120,
      render: (_, r) => stateTag(intl, getDisplayState(r), isJobPaused(r)),
    },
    // {
    //   title: intl.formatMessage({
    //     id: "analysis.scrape_jobs.table.saved",
    //     defaultMessage: "Saved",
    //   }),
    //   key: "saved",
    //   width: 100,
    //   render: (_, r) => {
    //     const count = r.result?.inserted_count ?? r.result?.saved_count ?? null;
    //     const liveKey = `${r.data?.targetUsername}:${r.data?.type}`;
    //     const live = liveJobCounts[liveKey];
    //     if (live) {
    //       return (
    //         <Tooltip
    //           title={intl.formatMessage(
    //             {
    //               id: "analysis.scrape_jobs.live_progress",
    //               defaultMessage: "{completed} / {total} profiles fetched",
    //             },
    //             { completed: live.completed, total: live.total },
    //           )}
    //         >
    //           <Text strong style={{ color: "#fa8c16" }}>
    //             {live.completed.toLocaleString()}
    //             {live.total > 0 && (
    //               <Text type="secondary" style={{ fontSize: 11, marginLeft: 2 }}>
    //                 /{live.total}
    //               </Text>
    //             )}
    //           </Text>
    //         </Tooltip>
    //       );
    //     }
    //     return count !== null ? (
    //       <Text strong style={{ color: "#52c41a" }}>{count.toLocaleString()}</Text>
    //     ) : (
    //       <Text type="secondary">—</Text>
    //     );
    //   },
    // },
    // {
    //   title: intl.formatMessage({
    //     id: "analysis.scrape_jobs.table.total_on_profile",
    //     defaultMessage: "Total on Profile",
    //   }),
    //   key: "total",
    //   width: 130,
    //   render: (_, r) => {
    //     const t = r.result?.scrape_target ?? null;
    //     return t !== null ? t.toLocaleString() : <Text type="secondary">—</Text>;
    //   },
    // },
    {
      title: intl.formatMessage({
        id: "analysis.scrape_jobs.table.started",
        defaultMessage: "Started",
      }),
      key: "started",
      width: 160,
      render: (_, r) =>
        r.processedOn
          ? new Date(r.processedOn).toLocaleString()
          : new Date(r.timestamp).toLocaleString(),
    },
    {
      title: intl.formatMessage({
        id: "analysis.scrape_jobs.table.finished",
        defaultMessage: "Finished",
      }),
      key: "finished",
      width: 160,
      render: (_, r) =>
        r.finishedOn ? new Date(r.finishedOn).toLocaleString() : <Text type="secondary">—</Text>,
    },
    {
      title: intl.formatMessage({
        id: "analysis.scrape_jobs.table.error",
        defaultMessage: "Error",
      }),
      key: "error",
      ellipsis: true,
      render: (_, r) => {
        const failedReason = formatScrapeJobError(r.failedReason);

        return failedReason ? (
          <Tooltip title={failedReason}>
            <Text type="danger" style={{ fontSize: 12 }}>{failedReason}</Text>
          </Tooltip>
        ) : null;
      },
    },
    {
      title: intl.formatMessage({
        id: "commons.actions",
        defaultMessage: "Actions",
      }),
      key: "actions",
      width: 160,
      render: (_, r) => {
        const isTerminal = TERMINAL_STATES.has(r.state);
        const isPaused = isJobPaused(r);
        const busy = actionLoading[r.id];
        return (
          <Space size={6}>
            {!isTerminal && !isPaused && (
              <Button
                size="small"
                icon={<PauseCircleOutlined />}
                loading={busy === "pause"}
                disabled={!!busy}
                onClick={() => handlePause(r.id)}
              >
                {intl.formatMessage({
                  id: "analysis.scrape_jobs.actions.pause",
                  defaultMessage: "Pause",
                })}
              </Button>
            )}
            {((!isTerminal && isPaused) || canRetryJob(r)) && (
              <Button
                size="small"
                icon={canRetryJob(r) ? <ReloadOutlined /> : <CaretRightOutlined />}
                loading={busy === "resume"}
                disabled={!!busy}
                onClick={() => handleResume(r.id)}
              >
                {canRetryJob(r)
                  ? intl.formatMessage({
                      id: "analysis.scrape_jobs.actions.retry",
                      defaultMessage: "Retry",
                    })
                  : intl.formatMessage({
                      id: "analysis.scrape_jobs.actions.resume",
                      defaultMessage: "Resume",
                    })}
              </Button>
            )}
            {!r.state.includes("active") && (
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={busy === "delete"}
                disabled={!!busy}
                onClick={() => handleDelete(r.id)}
              />
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <Title level={4} className="!mb-1">
            <FormattedMessage
              id="analysis.scrape_jobs.title"
              defaultMessage="Scrape Jobs"
            />
          </Title>
          <Text type="secondary">
            <FormattedMessage
              id="analysis.scrape_jobs.subtitle"
              defaultMessage="All your Instagram scraping jobs and their results"
            />
          </Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => fetchJobs(page)}
          loading={loading}
        >
          <FormattedMessage id="analysis.scrape_jobs.refresh" defaultMessage="Refresh" />
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={8} sm={6} md={4}>
          <Card bodyStyle={{ padding: "12px 16px" }} bordered>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <FormattedMessage
                id="analysis.scrape_jobs.summary.total_jobs"
                defaultMessage="Total Jobs"
              />
            </Text>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{total}</div>
          </Card>
        </Col>
        <Col xs={8} sm={6} md={4}>
          <Card bodyStyle={{ padding: "12px 16px" }} bordered>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <FormattedMessage
                id="analysis.scrape_jobs.summary.active"
                defaultMessage="Active"
              />
            </Text>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#52c41a" }}>
              {jobs.filter((j) => j.state === "active" && !isJobPaused(j)).length}
            </div>
          </Card>
        </Col>
        <Col xs={8} sm={6} md={4}>
          <Card bodyStyle={{ padding: "12px 16px" }} bordered>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <FormattedMessage
                id="analysis.scrape_jobs.summary.completed"
                defaultMessage="Completed"
              />
            </Text>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1677ff" }}>
              {jobs.filter((j) => j.state === "completed").length}
            </div>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <Card bordered={false} bodyStyle={{ padding: 0, background: "transparent" }}>
            <div
              style={{
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: 14,
                padding: "18px 20px",
                background: `linear-gradient(135deg, ${token.colorFillAlter} 0%, ${token.colorBgContainer} 100%)`,
              }}
            >
              <Space direction="vertical" size={14} style={{ width: "100%" }}>
                <Space size={8} align="center">
                  <InfoCircleOutlined style={{ color: token.colorInfo }} />
                  <Text strong style={{ fontSize: 16 }}>
                    {intl.formatMessage({
                      id: "analysis.scrape_jobs.notes.title",
                      defaultMessage: "Job Lifecycle Notes",
                    })}
                  </Text>
                </Space>

                <Text type="secondary">
                  {intl.formatMessage({
                    id: "analysis.scrape_jobs.notes.subtitle",
                    defaultMessage:
                      "A job moves through these states: Queued, Active, Paused, Completed, or Failed.",
                  })}
                </Text>

                <Space size={[8, 8]} wrap>
                  <Tag color="blue">
                    {intl.formatMessage({
                      id: "analysis.scrape_jobs.notes.states.queued",
                      defaultMessage: "Queued",
                    })}
                  </Tag>
                  <Tag color="green">
                    {intl.formatMessage({
                      id: "analysis.scrape_jobs.notes.states.active",
                      defaultMessage: "Active",
                    })}
                  </Tag>
                  <Tag color="orange">
                    {intl.formatMessage({
                      id: "analysis.scrape_jobs.notes.states.paused",
                      defaultMessage: "Paused",
                    })}
                  </Tag>
                  <Tag color="success">
                    {intl.formatMessage({
                      id: "analysis.scrape_jobs.notes.states.completed",
                      defaultMessage: "Completed",
                    })}
                  </Tag>
                  <Tag color="red">
                    {intl.formatMessage({
                      id: "analysis.scrape_jobs.notes.states.failed",
                      defaultMessage: "Failed",
                    })}
                  </Tag>
                </Space>

                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <div
                      style={{
                        border: `1px solid ${token.colorBorderSecondary}`,
                        borderRadius: 12,
                        padding: "12px 14px",
                        background: token.colorBgContainer,
                      }}
                    >
                      <Text strong>
                        {intl.formatMessage({
                          id: "analysis.scrape_jobs.notes.state_definitions_title",
                          defaultMessage: "State definitions",
                        })}
                      </Text>
                      <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                        <li>
                          <Text>
                            {intl.formatMessage({
                              id: "analysis.scrape_jobs.notes.definitions.queued",
                              defaultMessage: "Queued: Waiting to be processed.",
                            })}
                          </Text>
                        </li>
                        <li>
                          <Text>
                            {intl.formatMessage({
                              id: "analysis.scrape_jobs.notes.definitions.active",
                              defaultMessage: "Active: Currently running.",
                            })}
                          </Text>
                        </li>
                        <li>
                          <Text>
                            {intl.formatMessage({
                              id: "analysis.scrape_jobs.notes.definitions.paused",
                              defaultMessage:
                                "Paused: Temporarily stopped and resumable from the last saved cursor/checkpoint.",
                            })}
                          </Text>
                        </li>
                        <li>
                          <Text>
                            {intl.formatMessage({
                              id: "analysis.scrape_jobs.notes.definitions.completed",
                              defaultMessage: "Completed: Finished successfully (final state).",
                            })}
                          </Text>
                        </li>
                        <li>
                          <Text>
                            {intl.formatMessage({
                              id: "analysis.scrape_jobs.notes.definitions.failed",
                              defaultMessage:
                                "Failed: Stopped due to an error (may or may not be recoverable) but you can retry the job.",
                            })}
                          </Text>
                        </li>
                      </ul>
                    </div>
                  </Col>

                  <Col xs={24} md={12}>
                    <Space direction="vertical" size={16} style={{ width: "100%" }}>
                      <div
                        style={{
                          border: `1px solid ${token.colorBorderSecondary}`,
                          borderRadius: 12,
                          padding: "12px 14px",
                          background: token.colorBgContainer,
                        }}
                      >
                        <Text strong>
                          {intl.formatMessage({
                            id: "analysis.scrape_jobs.notes.important_behavior_title",
                            defaultMessage: "Important behavior",
                          })}
                        </Text>
                        <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                          <li>
                            <Text>
                              {intl.formatMessage({
                                id: "analysis.scrape_jobs.notes.behavior.paused_not_completed",
                                defaultMessage: "Paused is not a completed state.",
                              })}
                            </Text>
                          </li>
                          <li>
                            <Text>
                              {intl.formatMessage({
                                id: "analysis.scrape_jobs.notes.behavior.paused_resume",
                                defaultMessage: "A paused job should show a Resume action.",
                              })}
                            </Text>
                          </li>
                          <li>
                            <Text>
                              {intl.formatMessage({
                                id: "analysis.scrape_jobs.notes.behavior.completed_no_resume",
                                defaultMessage: "Completed jobs should not show Resume.",
                              })}
                            </Text>
                          </li>
                        </ul>
                      </div>

                      <div
                        style={{
                          border: `1px solid ${token.colorBorderSecondary}`,
                          borderRadius: 12,
                          padding: "12px 14px",
                          background: token.colorBgContainer,
                        }}
                      >
                        <Text strong>
                          {intl.formatMessage({
                            id: "analysis.scrape_jobs.notes.why_jobs_fail_title",
                            defaultMessage: "Why jobs can fail",
                          })}
                        </Text>
                        <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                          <li>
                            <Text>
                              {intl.formatMessage({
                                id: "analysis.scrape_jobs.notes.failures.rate_limits",
                                defaultMessage: "Rate limits or temporary blocks (429).",
                              })}
                            </Text>
                          </li>
                          <li>
                            <Text>
                              {intl.formatMessage({
                                id: "analysis.scrape_jobs.notes.failures.auth",
                                defaultMessage:
                                  "Session or cookie/auth issues (expired session, challenge required).",
                              })}
                            </Text>
                          </li>
                          <li>
                            <Text>
                              {intl.formatMessage({
                                id: "analysis.scrape_jobs.notes.failures.network",
                                defaultMessage: "Network/proxy timeouts or connection failures.",
                              })}
                            </Text>
                          </li>
                        </ul>
                      </div>
                    </Space>
                  </Col>
                </Row>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      <Card bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={jobs}
          columns={columns}
          rowKey="id"
          loading={loading}
          expandable={{
            expandedRowRender: (record) => (
              <JobLeadsTable
                userId={userId ?? ""}
                targetUsername={record.data.targetUsername}
                folderId={record.data.folder_id}
              />
            ),
            expandIcon: ({ expanded, onExpand, record }) => (
              <Button
                size="small"
                type="text"
                icon={
                  <DownOutlined
                    style={{
                      transition: "transform 0.2s",
                      transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                }
                onClick={(e) => onExpand(record, e)}
              />
            ),
            rowExpandable: () => true,
          }}
          pagination={{
            current: page,
            pageSize: 20,
            total,
            onChange: (p) => setPage(p),
            showSizeChanger: false,
            showTotal: (t) =>
              intl.formatMessage(
                {
                  id: "analysis.scrape_jobs.pagination_total",
                  defaultMessage: "{count} jobs",
                },
                { count: t },
              ),
          }}
          locale={{
            emptyText: (
              <Empty
                description={intl.formatMessage({
                  id: "analysis.scrape_jobs.empty",
                  defaultMessage:
                    "No scrape jobs found. Start scraping from the Analysis page.",
                })}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
}
