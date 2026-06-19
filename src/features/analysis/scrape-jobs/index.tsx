"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Modal,
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
  GetScrapeFollowersJobStatus,
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
const JOB_LIST_ACTIVE_POLL_MS = 15000;
const JOB_LIST_QUEUED_POLL_MS = 30000;

const stateTag = (
  intl: ReturnType<typeof useIntl>,
  state: string,
  paused: boolean,
  retrying: boolean,
  cooldownLabel?: string | null,
) => {
  if (state === "cooling_down") {
    return (
      <Tag color="processing">
        {cooldownLabel ||
          intl.formatMessage({
            id: "analysis.scrape_jobs.status.cooling_down",
            defaultMessage: "Cooling Down",
          })}
      </Tag>
    );
  }
  if (retrying) {
    return (
      <Tag color="processing">
        {intl.formatMessage({
          id: "analysis.scrape_jobs.status.retrying",
          defaultMessage: "Retrying",
        })}
      </Tag>
    );
  }
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
        <Tag color="gold">
          {intl.formatMessage({
            id: "analysis.scrape_jobs.status.failed",
            defaultMessage: "Needs Retry",
          })}
        </Tag>
      );
    default: return <Tag >{state}</Tag>;
  }
};

type JobRetryState = {
  auto_retrying?: boolean;
  retry_at?: number | null;
  retry_delay_ms?: number | null;
  cooldown_remaining_ms?: number | null;
  reason?: string | null;
  waiting_for_abort?: boolean;
  active?: boolean;
} | null;

interface ScrapeJob {
  id: string;
  state: string;
  queue_state?: string | null;
  status?: string;
  timestamp: number;
  processedOn: number | null;
  finishedOn: number | null;
  failedReason: string | null;
  progress: number;
  control: { paused: boolean; pausedAt: string | null };
  retry?: JobRetryState;
  pipeline?: {
    paused?: boolean;
    status?: string;
    counts?: {
      target_total_count?: number | null;
      collected_count?: number;
      saved_count?: number;
      duplicate_count?: number;
      failed_count?: number;
    };
  } | null;
  scrape_job?: {
    status?: string;
    counts?: {
      target_total_count?: number | null;
      collected_count?: number;
      saved_count?: number;
      duplicate_count?: number;
      failed_count?: number;
    };
  } | null;
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

// A transient upstream/runtime failure is not a real dead-end. The backend
// keeps retrying these in the background, so display them as queued.
const isTransientQueued = (job: ScrapeJob) =>
  job.state === "failed" && isTransientRelationshipFetchError(job.failedReason);

const isCoolingDownJob = (job: ScrapeJob) =>
  Boolean(
    job.retry?.auto_retrying &&
      !isJobPaused(job) &&
      (job.state === "delayed" ||
        job.queue_state === "delayed" ||
        String(job.status || "").toUpperCase() === "COOLING_DOWN"),
  );

const getCooldownRemainingMs = (job: ScrapeJob, nowTs: number) => {
  const retryAt = Number(job.retry?.retry_at || 0);
  if (!retryAt) return Math.max(0, Number(job.retry?.cooldown_remaining_ms || 0));
  return Math.max(0, retryAt - nowTs);
};

const formatCooldown = (remainingMs: number) => {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
};

// State used purely for display. Transient failures are shown as queued;
// genuine final failures still surface as failed.
const getDisplayState = (job: ScrapeJob) =>
  isCoolingDownJob(job) ? "cooling_down" : isTransientQueued(job) ? "queued" : job.state;

const isRecoveringStatus = (job: ScrapeJob) =>
  String(job.status || "").toUpperCase() === "RECOVERING";

// A job can be (re)started by the user whenever it has stopped progressing:
// genuine failures, finished/terminal jobs (re-run), and transient failures
// surfaced as "queued" that are actually stuck (they carry a finished time).
// Active jobs (still running) and paused jobs (use Resume) are excluded.
const canRetryJob = (job: ScrapeJob) =>
  !isJobPaused(job) &&
  getDisplayState(job) !== "active" &&
  (TERMINAL_STATES.has(job.state) ||
    isTransientQueued(job) ||
    job.finishedOn != null);

const isJobStillChanging = (job: ScrapeJob) =>
  !TERMINAL_STATES.has(getDisplayState(job)) && !isJobPaused(job);

const getJobListPollDelay = (jobs: ScrapeJob[]) =>
  jobs.some((job) => getDisplayState(job) === "active" || isCoolingDownJob(job))
    ? JOB_LIST_ACTIVE_POLL_MS
    : JOB_LIST_QUEUED_POLL_MS;

const normalizeInstagramUsername = (value?: string | null) =>
  String(value || "").trim().replace(/^@+/, "").toLowerCase();

const toRelationshipType = (type?: string | null): "follower" | "following" =>
  String(type || "").toLowerCase() === "following" ? "following" : "follower";

const buildJobRealtimeKey = (targetUsername?: string | null, type?: string | null) =>
  `${normalizeInstagramUsername(targetUsername)}:${type || "followers"}`;

type LeadTableCacheEntry = {
  hasContacts: boolean;
  leads: any[];
  leadsPage: number;
  signature: string;
  total: number;
};

const leadTableStateCache = new Map<string, LeadTableCacheEntry>();

// ── Leads sub-table rendered when a job row is expanded ──────────────────────
function JobLeadsTable({
  jobId,
  userId,
  targetUsername,
  relationshipType,
  folderId,
  refreshToken = 0,
}: {
  jobId: string;
  userId: string;
  targetUsername: string;
  relationshipType: "follower" | "following";
  folderId: string | null;
  refreshToken?: number;
}) {
  const intl = useIntl();
  const { token } = theme.useToken();
  const cachedTableState = leadTableStateCache.get(jobId);
  const [leadsPage, setLeadsPage] = useState(cachedTableState?.leadsPage ?? 1);
  const LIMIT = 10;
  const [leads, setLeads] = useState<any[]>(cachedTableState?.leads ?? []);
  const [total, setTotal] = useState(cachedTableState?.total ?? 0);
  const [loading, setLoading] = useState(false);
  const [hasContacts, setHasContacts] = useState(cachedTableState?.hasContacts ?? false);
  const lastLoadedSignatureRef = useRef<string | null>(
    cachedTableState?.signature ?? null,
  );

  const fetch = useCallback(
    async (p: number, signature: string) => {
      const normalizedTarget = normalizeInstagramUsername(targetUsername);
      if (!userId || !normalizedTarget) return;
      setLoading(true);
      try {
        const res = await FetchAllLeadsList({
          user_id: userId,
          scraped_from_username: normalizedTarget,
          relationship_type: relationshipType,
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
        lastLoadedSignatureRef.current = signature;
        leadTableStateCache.set(jobId, {
          hasContacts,
          leads: list,
          leadsPage: p,
          signature,
          total: tot,
        });
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
    [folderId, hasContacts, intl, jobId, relationshipType, targetUsername, userId],
  );

  useEffect(() => {
    const normalizedTarget = normalizeInstagramUsername(targetUsername);
    if (!userId || !normalizedTarget) return;

    const signature = [
      userId,
      normalizedTarget,
      relationshipType,
      folderId || "",
      String(leadsPage),
      hasContacts ? "1" : "0",
      String(refreshToken),
    ].join("|");

    if (lastLoadedSignatureRef.current === signature) return;
    void fetch(leadsPage, signature);
  }, [
    fetch,
    folderId,
    hasContacts,
    leadsPage,
    refreshToken,
    relationshipType,
    targetUsername,
    userId,
  ]);

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
            onChange={(checked) => {
              setLeadsPage(1);
              setHasContacts(checked);
            }}
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
  const [nowTs, setNowTs] = useState(() => Date.now());
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
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [leadRefreshTokens, setLeadRefreshTokens] = useState<Record<string, number>>({});
  const jobsRef = useRef<ScrapeJob[]>([]);
  const bumpLeadTableRefreshTokens = useCallback((jobIds: React.Key[] = []) => {
    const ids = jobIds.map((jobId) => String(jobId)).filter(Boolean);
    if (!ids.length) return;

    setLeadRefreshTokens((prev) => ({
      ...prev,
      ...Object.fromEntries(ids.map((jobId) => [jobId, Date.now()])),
    }));
  }, []);

  useEffect(() => {
    jobsRef.current = jobs;
  }, [jobs]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowTs(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

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

  const isJobRetrying = useCallback(
    (job: ScrapeJob) => isRecoveringStatus(job),
    [],
  );

  // live per-job counts keyed as "targetUsername:type". Total Count is
  // not tracked here — it's resolved once from Apify and persisted
  // server-side, so the table always reads it from job.pipeline/scrape_job
  // counts (refreshed via fetchJobs) rather than from a socket event.
  const [liveJobCounts, setLiveJobCounts] = useState<
    Record<string, { totalAnalyzed: number | null }>
  >({});

  useEffect(() => {
    if (!socket) return;
    const followerCountHandler = (payload: {
      target_username: string;
      type: string;
      completed: number;
      total: number;
    }) => {
      const key = buildJobRealtimeKey(payload.target_username, payload.type);
      setLiveJobCounts((prev) => ({
        ...prev,
        [key]: {
          totalAnalyzed: Number(payload.completed || 0),
        },
      }));
    };
    const progressHandler = (payload: {
      job_id?: string;
      target_username?: string;
      type?: string;
      status?: string;
      stage?: string;
      reason?: string;
      total_followers_count?: number;
      total_analyzed?: number;
      collected_count?: number;
      total_processed?: number;
      saved_count?: number;
      duplicate_count?: number;
      failed_count?: number;
      error?: string | null;
      failed_reason?: string | null;
      retry?: JobRetryState;
      result?: { data?: Record<string, number> } | null;
    }) => {
      const key = buildJobRealtimeKey(payload.target_username, payload.type);

      // The backend emitters use slightly different field names (pipeline
      // stage handlers, the GraphQL batch loop, and the queue lifecycle
      // emitter). Normalize them here so the live counters move no matter
      // which path produced the event. Total Count is intentionally not
      // read from here — it's resolved once from Apify and persisted
      // server-side, surfaced via job.pipeline/scrape_job counts instead.
      const r = payload.result?.data || {};
      const collected =
        payload.collected_count ??
        payload.total_processed ??
        (r.collected_count as number | undefined) ??
        null;
      const savedC = payload.saved_count ?? (r.saved_count as number | undefined);
      const dupC = payload.duplicate_count ?? (r.duplicate_count as number | undefined);
      const failC = payload.failed_count ?? (r.failed_count as number | undefined);
      // "Analyzed" = profiles saved in a record (new + already-existing
      // duplicates) — a failed profile was never saved, so it isn't counted.
      const analyzed =
        payload.total_analyzed != null
          ? Number(payload.total_analyzed)
          : savedC != null || dupC != null
            ? Number(savedC || 0) + Number(dupC || 0)
            : null;

      if (key !== ":followers") {
        setLiveJobCounts((prev) => ({
          ...prev,
          [key]: {
            totalAnalyzed:
              analyzed != null ? Number(analyzed) : prev[key]?.totalAnalyzed ?? null,
          },
        }));
      }

      setJobs((prev) =>
        prev.map((job) => {
          const sameJob = payload.job_id && String(job.id) === String(payload.job_id);
          const sameTarget =
            buildJobRealtimeKey(job.data?.targetUsername, job.data?.type) === key;
          if (!sameJob && !sameTarget) return job;
          const nextState =
            payload.status === "COMPLETED"
              ? "completed"
              : payload.status === "RUNNING" || payload.status === "RECOVERING"
                ? "active"
                : payload.status === "COOLING_DOWN"
                  ? "delayed"
                : payload.status === "QUEUED"
                  ? "waiting"
                  : payload.status === "PAUSED"
                    ? "delayed"
                    : payload.status === "FAILED"
                      ? "failed"
                      : job.state;
          const clearError =
            payload.status === "QUEUED" ||
            payload.status === "RUNNING" ||
            payload.status === "RECOVERING";

          return {
            ...job,
            state: nextState,
            status: payload.status || job.status,
            failedReason: clearError
              ? null
              : payload.error || payload.failed_reason || job.failedReason,
            retry: payload.retry ?? job.retry,
            scrape_job: {
              ...(job.scrape_job || {}),
              counts: {
                ...((job.scrape_job as any)?.counts || {}),
                collected_count:
                  collected ?? (job.scrape_job as any)?.counts?.collected_count,
                saved_count: savedC ?? (job.scrape_job as any)?.counts?.saved_count,
                duplicate_count:
                  dupC ?? (job.scrape_job as any)?.counts?.duplicate_count,
                failed_count: failC ?? (job.scrape_job as any)?.counts?.failed_count,
              },
            } as any,
          };
        }),
      );

    };
    socket.on("scrape:follower_count", followerCountHandler);
    socket.on("scrape:progress", progressHandler);
    return () => {
      socket.off("scrape:follower_count", followerCountHandler);
      socket.off("scrape:progress", progressHandler);
    };
  }, [socket]);

  const fetchJobs = useCallback(async (
    p = page,
    {
      silent = false,
      refreshActiveStatuses = false,
    }: {
      silent?: boolean;
      refreshActiveStatuses?: boolean;
    } = {},
  ) => {
    if (!userId) return;
    if (!silent) setLoading(true);
    try {
      const res = await ListScrapeFollowersJobs({ page: p, limit: 20 });
      let serverJobs: ScrapeJob[] = res?.data?.jobs ?? [];
      const serverTotal: number = res?.data?.total ?? serverJobs.length;

      if (refreshActiveStatuses) {
        const activeJobs = serverJobs.filter(isJobStillChanging);
        if (activeJobs.length > 0) {
          const refreshedJobs = await Promise.all(
            activeJobs.map(async (job) => {
              try {
                const detail = await GetScrapeFollowersJobStatus(job.id);
                return (detail?.data?.job as ScrapeJob | undefined) ?? null;
              } catch {
                return null;
              }
            }),
          );

          const refreshedById = new Map(
            refreshedJobs
              .filter((job): job is ScrapeJob => Boolean(job?.id))
              .map((job) => [String(job.id), job]),
          );

          if (refreshedById.size > 0) {
            serverJobs = serverJobs.map((job) => refreshedById.get(String(job.id)) ?? job);
          }
        }
      }

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

      // Terminal jobs receive no further socket progress events, so their
      // stale live total would otherwise shadow the freshly fetched counts.
      // An explicit manual refresh clears live totals for every fetched row so
      // active jobs also rehydrate from the API before the next socket event.
      setLiveJobCounts((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const job of serverJobs) {
          if (!refreshActiveStatuses && !TERMINAL_STATES.has(job.state)) continue;
          const key = buildJobRealtimeKey(job.data?.targetUsername, job.data?.type);
          if (key in next) {
            delete next[key];
            changed = true;
          }
        }
        return changed ? next : prev;
      });
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
    const hasLive = jobs.some(isJobStillChanging);
    if (!hasLive) {
      if (pollRef.current) clearTimeout(pollRef.current);
      return;
    }
    pollRef.current = setTimeout(
      () => fetchJobs(page, { silent: true }),
      getJobListPollDelay(jobs),
    );
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
      await fetchJobs(page, { silent: true });
    } catch (e: any) {
      message.error(
        e?.response?.data?.message ||
          intl.formatMessage({
            id: "analysis.scrape_jobs.actions.pause_failed",
            defaultMessage: "Failed to pause job",
          }),
      );
      // Revert the optimistic patch on failure.
      await fetchJobs(page, { silent: true });
    } finally { clearJobAction(jobId); }
  };

  const handleResume = useCallback(async (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    const isRetry = job ? canRetryJob(job) : false;
    const isCompletedRerun = job?.state === "completed";

    if (isCompletedRerun) {
      const confirmed = await new Promise<boolean>((resolve) => {
        Modal.confirm({
          title: intl.formatMessage({
            id: "analysis.scrape_jobs.rerun.confirm_title",
            defaultMessage: "Re-run this scrape?",
          }),
          content: intl.formatMessage({
            id: "analysis.scrape_jobs.rerun.confirm_content",
            defaultMessage:
              "This will scrape the target again and use credits for the new run.",
          }),
          okText: intl.formatMessage({
            id: "analysis.scrape_jobs.rerun.confirm_ok",
            defaultMessage: "Re-run and use credits",
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

    setJobAction(jobId, "resume");
    // Optimistically re-queue the row (and clear any prior error / finished
    // state) so a retried terminal job stops showing Retry and reflects the
    // action instantly.
    patchJob(jobId, {
      state: "waiting",
      status: "QUEUED",
      failedReason: null,
      finishedOn: null,
      retry: null,
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
      await fetchJobs(page, { silent: true });
    } catch (e: any) {
      message.error(
        e?.response?.data?.message ||
          intl.formatMessage({
            id: "analysis.scrape_jobs.actions.resume_failed",
            defaultMessage: "Failed to resume job",
          }),
      );
      // Revert the optimistic patch on failure.
      await fetchJobs(page, { silent: true });
    } finally {
      clearJobAction(jobId);
    }
  }, [clearJobAction, fetchJobs, intl, jobs, page, patchJob, setJobAction]);

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
      const serverMessage = e?.response?.data?.message;
      message.error(
        serverMessage === "followers-scrape-job-active-cannot-delete-pause-first"
          ? intl.formatMessage({
              id: "analysis.scrape_jobs.actions.delete_pause_first",
              defaultMessage: "Pause the running job first, then delete it once it stops.",
            })
          : serverMessage === "followers-scrape-job-delete-waiting-for-apify-abort"
            ? intl.formatMessage({
                id: "analysis.scrape_jobs.actions.delete_waiting_abort",
                defaultMessage: "Still stopping the upstream Apify run. Try delete again in a moment.",
              })
            : serverMessage ||
          intl.formatMessage({
            id: "analysis.scrape_jobs.actions.delete_failed",
          defaultMessage: "Failed to delete job",
        }),
      );
    } finally { clearJobAction(jobId); }
  };

  const handleRefreshLeads = (jobId: string) => {
    const cachedTableState = leadTableStateCache.get(jobId);
    if (cachedTableState) {
      leadTableStateCache.set(jobId, {
        ...cachedTableState,
        signature: "",
      });
    }

    bumpLeadTableRefreshTokens([jobId]);
  };

  // Total Count is the real follower/following count reported by the
  // target's Instagram profile — resolved once from Apify when the job
  // starts and persisted server-side as target_total_count. It is never
  // pushed over the socket, so it's read purely from the fetched job record
  // (pipeline.counts while running, scrape_job.counts once finalized) —
  // always fresh after fetchJobs(), never shadowed by stale live state.
  // Older jobs scraped before this field existed fall back to collected_count
  // so they don't regress to a blank column.
  const getTotalFollowersCount = (job: ScrapeJob) => {
    return (
      job.pipeline?.counts?.target_total_count ??
      job.scrape_job?.counts?.target_total_count ??
      job.pipeline?.counts?.collected_count ??
      job.scrape_job?.counts?.collected_count ??
      null
    );
  };

  // "Analyzed" = profiles that ended up saved in a record — newly inserted
  // or already-existing duplicates. A failed profile was never saved, so it
  // doesn't count here.
  const sumAnalyzed = (counts?: {
    saved_count?: number;
    duplicate_count?: number;
  } | null) =>
    counts
      ? Number(counts.saved_count || 0) + Number(counts.duplicate_count || 0)
      : null;

  const getTotalAnalyzed = (job: ScrapeJob) => {
    const key = buildJobRealtimeKey(job.data?.targetUsername, job.data?.type);
    const live = liveJobCounts[key]?.totalAnalyzed;
    if (live != null) return live;

    const pipelineAnalyzed = sumAnalyzed(job.pipeline?.counts);
    if (pipelineAnalyzed) return pipelineAnalyzed;

    return sumAnalyzed(job.scrape_job?.counts);
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
      width: 130,
      render: (_, r) =>
        stateTag(
          intl,
          getDisplayState(r),
          isJobPaused(r),
          isJobRetrying(r),
          isCoolingDownJob(r)
            ? intl.formatMessage(
                {
                  id: "analysis.scrape_jobs.status.cooling_down_with_time",
                  defaultMessage: "Cooling Down ({time})",
                },
                { time: formatCooldown(getCooldownRemainingMs(r, nowTs)) },
              )
            : null,
        ),
    },
    {
      title: intl.formatMessage({
        id: "analysis.scrape_jobs.table.total_followers_count",
        defaultMessage: "Total Count",
      }),
      key: "total_followers_count",
      width: 140,
      render: (_, r) => {
        const count = getTotalFollowersCount(r);
        return count != null ? (
          <Text strong>{Number(count).toLocaleString()}</Text>
        ) : (
          <Text type="secondary">-</Text>
        );
      },
    },
    {
      title: intl.formatMessage({
        id: "analysis.scrape_jobs.table.total_analyzed",
        defaultMessage: "Total Analyzed",
      }),
      key: "total_analyzed",
      width: 140,
      render: (_, r) => {
        const count = getTotalAnalyzed(r);
        return count != null ? (
          <Text strong style={{ color: "#1677ff" }}>
            {Number(count).toLocaleString()}
          </Text>
        ) : (
          <Text type="secondary">-</Text>
        );
      },
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
        defaultMessage: "Status Detail",
      }),
      key: "error",
      ellipsis: true,
      render: (_, r) => {
        if (isCoolingDownJob(r)) {
          const detail = r.retry?.waiting_for_abort
            ? intl.formatMessage({
                id: "analysis.scrape_jobs.cooldown.waiting_abort",
                defaultMessage: "Stopping the upstream Apify run before retrying.",
              })
            : intl.formatMessage(
                {
                  id: "analysis.scrape_jobs.cooldown.resume_in",
                  defaultMessage: "Automatically resumes in {time}.",
                },
                { time: formatCooldown(getCooldownRemainingMs(r, nowTs)) },
              );

          return <Text type="secondary" style={{ fontSize: 12 }}>{detail}</Text>;
        }

        if (getDisplayState(r) !== "failed") return null;
        const failedReason = formatScrapeJobError(r.failedReason);

        return failedReason ? (
          <Tooltip title={failedReason}>
            <Text type="warning" style={{ fontSize: 12 }}>{failedReason}</Text>
          </Tooltip>
        ) : null;
      },
    },
    {
      title: intl.formatMessage({
        id: "analysis.scrape_jobs.table.refresh",
        defaultMessage: "Refresh",
      }),
      key: "refresh",
      width: 110,
      render: (_, r) => {
        const busy = actionLoading[r.id];
        return (
          <Tooltip
            title={intl.formatMessage({
              id: "analysis.scrape_jobs.actions.refresh_leads",
              defaultMessage: "Refresh leads table",
            })}
          >
            <Button
              size="small"
              icon={<ReloadOutlined />}
              disabled={!!busy}
              onClick={() => handleRefreshLeads(r.id)}
            />
          </Tooltip>
        );
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
        const retrying = isJobRetrying(r);
        const busy = actionLoading[r.id];
        return (
          <Space size={6}>
            {!isTerminal && !isPaused && !retrying && (
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
            {isPaused && !retrying && (
              <Button
                size="small"
                icon={<CaretRightOutlined />}
                loading={busy === "resume"}
                disabled={!!busy}
                onClick={() => handleResume(r.id)}
              >
                {intl.formatMessage({
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
                disabled={!!busy || retrying}
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
          onClick={() => fetchJobs(page, { refreshActiveStatuses: true })}
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
                  <Tag color="gold">
                    {intl.formatMessage({
                      id: "analysis.scrape_jobs.notes.states.failed",
                      defaultMessage: "Needs Retry",
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
                            defaultMessage: "Why a job may pause and retry",
                          })}
                        </Text>
                        <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                          <li>
                            <Text>
                              {intl.formatMessage({
                                id: "analysis.scrape_jobs.notes.failures.rate_limits",
                                defaultMessage: "Staying within safe request limits (auto-resumes).",
                              })}
                            </Text>
                          </li>
                          <li>
                            <Text>
                              {intl.formatMessage({
                                id: "analysis.scrape_jobs.notes.failures.auth",
                                defaultMessage:
                                  "Refreshing the session when it needs renewing.",
                              })}
                            </Text>
                          </li>
                          <li>
                            <Text>
                              {intl.formatMessage({
                                id: "analysis.scrape_jobs.notes.failures.network",
                                defaultMessage: "Waiting out a brief network/connection hiccup.",
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
            expandedRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys([...keys]),
            expandedRowRender: (record) => (
              <JobLeadsTable
                jobId={String(record.id)}
                userId={userId ?? ""}
                targetUsername={record.data.targetUsername}
                relationshipType={toRelationshipType(record.data.type)}
                folderId={record.data.folder_id}
                refreshToken={leadRefreshTokens[String(record.id)] || 0}
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
