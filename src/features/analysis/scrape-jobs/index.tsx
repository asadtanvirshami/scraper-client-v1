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
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CaretRightOutlined,
  DeleteOutlined,
  DownOutlined,
  InstagramOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  DeleteScrapeFollowersJob,
  ListScrapeFollowersJobs,
  PauseScrapeFollowersJob,
  ResumeScrapeFollowersJob,
} from "@/api/api_calls/scrapper";
import { FetchAllLeadsList } from "@/api/api_calls/leads";
import { useUserInfo } from "@/helpers/use-user";
import { useSocket } from "@/hooks/use-socket";

const { Title, Text } = Typography;

const TERMINAL_STATES = new Set(["completed", "failed"]);

const stateTag = (state: string, paused: boolean) => {
  if (paused) return <Tag color="orange">Paused</Tag>;
  switch (state) {
    case "active": return <Tag color="green">Active</Tag>;
    case "waiting":
    case "delayed":
    case "prioritized": return <Tag color="blue">Queued</Tag>;
    case "completed": return <Tag color="default">Completed</Tag>;
    case "failed": return <Tag color="red">Failed</Tag>;
    default: return <Tag>{state}</Tag>;
  }
};

interface ScrapeJob {
  id: string;
  state: string;
  timestamp: number;
  processedOn: number | null;
  finishedOn: number | null;
  failedReason: string | null;
  progress: number;
  control: { paused: boolean; pausedAt: string | null };
  result: any;
  data: {
    targetUsername: string;
    type: string;
    folder_id: string | null;
    user_id: string;
  };
}

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
  const [leadsPage, setLeadsPage] = useState(1);
  const LIMIT = 10;
  const [leads, setLeads] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

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
        } as any);
        // response shape: { data: Lead[], pagination: { total, page, limit, totalPages } }
        const list: any[] = Array.isArray(res?.data) ? res.data : [];
        const tot: number = res?.pagination?.total ?? list.length;
        setLeads(list);
        setTotal(tot);
      } catch {
        message.error("Failed to load leads for this job");
      } finally {
        setLoading(false);
      }
    },
    [userId, targetUsername, folderId],
  );

  useEffect(() => {
    fetch(leadsPage);
  }, [leadsPage, fetch]);

  const leadsColumns: ColumnsType<any> = [
    {
      title: "Avatar",
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
      title: "Username",
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
      title: "Full Name",
      dataIndex: "full_name",
      key: "full_name",
      render: (v: string) => v || <Text type="secondary">—</Text>,
    },
    {
      title: "Followers",
      key: "followers",
      width: 100,
      render: (_, r) =>
        r.follower_count != null
          ? r.follower_count.toLocaleString()
          : <Text type="secondary">—</Text>,
    },
    {
      title: "Emails",
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
      title: "Phones",
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
      title: "Verified",
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
      title: "Private",
      key: "private",
      width: 80,
      render: (_, r) =>
        r.is_private ? <Tag color="default">Private</Tag> : <Tag color="green">Public</Tag>,
    },
  ];

  return (
    <div style={{ padding: "12px 24px 20px", background: "#fafafa" }}>
      <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <InstagramOutlined style={{ color: "#e1306c" }} />
        <Text strong>
          Leads scraped from @{targetUsername}
        </Text>
        {total > 0 && (
          <Tag color="blue">{total.toLocaleString()} total</Tag>
        )}
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
          showTotal: (t) => `${t} leads`,
          size: "small",
        }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No leads found for this job yet."
            />
          ),
        }}
        scroll={{ x: 700 }}
      />
    </div>
  );
}

export default function ScrapeJobsManager() {
  const { id: userId } = useUserInfo();
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, string>>({});
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const socket = useSocket(userId);

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
      const d = res?.data;
      setJobs(d?.jobs ?? []);
      setTotal(d?.total ?? 0);
    } catch {
      if (!silent) message.error("Failed to load scrape jobs");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [userId, page]);

  // Initial load + poll while any job is active/waiting
  useEffect(() => {
    fetchJobs(page);
  }, [page, fetchJobs]);

  useEffect(() => {
    const hasLive = jobs.some((j) => !TERMINAL_STATES.has(j.state));
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
    try {
      await PauseScrapeFollowersJob(jobId);
      message.success("Job paused");
      await fetchJobs(page, true);
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Failed to pause job");
    } finally { clearJobAction(jobId); }
  };

  const handleResume = async (jobId: string) => {
    setJobAction(jobId, "resume");
    try {
      await ResumeScrapeFollowersJob(jobId);
      message.success("Job resumed");
      await fetchJobs(page, true);
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Failed to resume job");
    } finally { clearJobAction(jobId); }
  };

  const handleDelete = async (jobId: string) => {
    setJobAction(jobId, "delete");
    try {
      await DeleteScrapeFollowersJob(jobId);
      message.success("Job deleted");
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setTotal((t) => Math.max(0, t - 1));
    } catch (e: any) {
      message.error(e?.response?.data?.message || "Failed to delete job");
    } finally { clearJobAction(jobId); }
  };

  const columns: ColumnsType<ScrapeJob> = [
    {
      title: "Target",
      dataIndex: ["data", "targetUsername"],
      key: "target",
      render: (v: string) => <Text strong>@{v}</Text>,
    },
    {
      title: "Type",
      dataIndex: ["data", "type"],
      key: "type",
      width: 110,
      render: (v: string) => (
        <Tag color={v === "followers" ? "blue" : "purple"}>
          {v?.charAt(0).toUpperCase() + v?.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, r) => stateTag(r.state, r.control?.paused),
    },
    {
      title: "Saved",
      key: "saved",
      width: 100,
      render: (_, r) => {
        const count = r.result?.inserted_count ?? r.result?.saved_count ?? null;
        const liveKey = `${r.data?.targetUsername}:${r.data?.type}`;
        const live = liveJobCounts[liveKey];
        if (live) {
          return (
            <Tooltip title={`${live.completed} / ${live.total} profiles fetched`}>
              <Text strong style={{ color: "#fa8c16" }}>
                {live.completed.toLocaleString()}
                {live.total > 0 && (
                  <Text type="secondary" style={{ fontSize: 11, marginLeft: 2 }}>
                    /{live.total}
                  </Text>
                )}
              </Text>
            </Tooltip>
          );
        }
        return count !== null ? (
          <Text strong style={{ color: "#52c41a" }}>{count.toLocaleString()}</Text>
        ) : (
          <Text type="secondary">—</Text>
        );
      },
    },
    {
      title: "Total on Profile",
      key: "total",
      width: 130,
      render: (_, r) => {
        const t = r.result?.scrape_target ?? null;
        return t !== null ? t.toLocaleString() : <Text type="secondary">—</Text>;
      },
    },
    {
      title: "Started",
      key: "started",
      width: 160,
      render: (_, r) =>
        r.processedOn
          ? new Date(r.processedOn).toLocaleString()
          : new Date(r.timestamp).toLocaleString(),
    },
    {
      title: "Finished",
      key: "finished",
      width: 160,
      render: (_, r) =>
        r.finishedOn ? new Date(r.finishedOn).toLocaleString() : <Text type="secondary">—</Text>,
    },
    {
      title: "Error",
      key: "error",
      ellipsis: true,
      render: (_, r) =>
        r.failedReason ? (
          <Tooltip title={r.failedReason}>
            <Text type="danger" style={{ fontSize: 12 }}>{r.failedReason}</Text>
          </Tooltip>
        ) : null,
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      render: (_, r) => {
        const isTerminal = TERMINAL_STATES.has(r.state);
        const isPaused = r.control?.paused;
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
                Pause
              </Button>
            )}
            {!isTerminal && isPaused && (
              <Button
                size="small"
                icon={<CaretRightOutlined />}
                loading={busy === "resume"}
                disabled={!!busy}
                onClick={() => handleResume(r.id)}
              >
                Resume
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
          <Title level={4} className="!mb-1">Scrape Jobs</Title>
          <Text type="secondary">All your Instagram scraping jobs and their results</Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => fetchJobs(page)}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={8} sm={6} md={4}>
          <Card bodyStyle={{ padding: "12px 16px" }} bordered>
            <Text type="secondary" style={{ fontSize: 12 }}>Total Jobs</Text>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{total}</div>
          </Card>
        </Col>
        <Col xs={8} sm={6} md={4}>
          <Card bodyStyle={{ padding: "12px 16px" }} bordered>
            <Text type="secondary" style={{ fontSize: 12 }}>Active</Text>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#52c41a" }}>
              {jobs.filter((j) => j.state === "active").length}
            </div>
          </Card>
        </Col>
        <Col xs={8} sm={6} md={4}>
          <Card bodyStyle={{ padding: "12px 16px" }} bordered>
            <Text type="secondary" style={{ fontSize: 12 }}>Completed</Text>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1677ff" }}>
              {jobs.filter((j) => j.state === "completed").length}
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
            showTotal: (t) => `${t} jobs`,
          }}
          locale={{
            emptyText: (
              <Empty
                description="No scrape jobs found. Start scraping from the Analysis page."
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
