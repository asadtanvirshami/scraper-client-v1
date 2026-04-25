"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Modal,
  Form,
  Input,
  Row,
  Space,
  Spin,
  theme,
  Tooltip,
  Typography,
  Tag,
  Select,
  message,
} from "antd";
import {
  BankOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  MailOutlined,
  PhoneOutlined,
  PlayCircleOutlined,
  TeamOutlined,
  UserOutlined,
  UserAddOutlined,
} from "@ant-design/icons";

import { useIntl, FormattedMessage } from "react-intl";
import { useQueryClient } from "@tanstack/react-query";

import linkedIn_SVG from "../../../../public/assets/SVG/socials/linkedIn.svg";
import instagram_SVG from "../../../../public/assets/SVG/socials/instagram.svg";

import { useUserInfo } from "@/helpers/use-user";
import {
  useScrapeInstagram,
  useScrapeLinkedIn,
} from "@/features/scraper/hooks";
import { useFetchLeadsList } from "@/features/leads/hooks/queries";
import { useFetchFolders } from "@/features/folders/hooks/queries";

type ScrapeType = "LINKEDIN" | "INSTAGRAM";

type Props = {
  defaultFolderId?: string;
  showManageButton?: boolean;
  platform?: ScrapeType;
  hideLinkedin?: boolean;
};

const { Title, Text } = Typography;

/** Individual scraped lead card */
function ScrapedLeadCard({ lead, type }: { lead: any; type: ScrapeType }) {
  const { token } = theme.useToken();
  const PlatformIcon = type === "INSTAGRAM" ? InstagramOutlined : LinkedinOutlined;
  const name = [lead.first_name, lead.last_name].filter(Boolean).join(" ") || lead.username || "Unknown";
  const avatar = lead.profile_picture_url || lead.avatar_url || null;

  return (
    <Card
      size="small"
      style={{
        borderRadius: 12,
        border: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgContainer,
      }}
      bodyStyle={{ padding: 16 }}
    >
      <div className="flex flex-col gap-3">
        {/* Header: avatar + name + platform */}
        <div className="flex items-start gap-3">
          <Avatar
            size={48}
            src={avatar}
            icon={<UserOutlined />}
            style={{
              flexShrink: 0,
              background: token.colorPrimaryBg,
              color: token.colorPrimary,
              border: `2px solid ${token.colorPrimaryBorder}`,
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Text strong className="truncate" style={{ fontSize: 14 }}>
                {name}
              </Text>
              <Tag
                icon={<PlatformIcon />}
                color={type === "INSTAGRAM" ? "magenta" : "blue"}
                style={{ margin: 0, fontSize: 11 }}
              >
                {type === "INSTAGRAM" ? "Instagram" : "LinkedIn"}
              </Tag>
            </div>
            {lead.username && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                @{lead.username}
              </Text>
            )}
            {lead.job_title && (
              <div>
                <Text style={{ fontSize: 12 }}>{lead.job_title}</Text>
              </div>
            )}
          </div>
        </div>

        {/* Stats: followers / following */}
        {(lead.followers_count != null || lead.following_count != null) && (
          <div className="flex gap-4">
            {lead.followers_count != null && (
              <Tooltip title="Followers">
                <div className="flex items-center gap-1">
                  <TeamOutlined style={{ color: token.colorPrimary, fontSize: 12 }} />
                  <Text style={{ fontSize: 12 }}>
                    {Number(lead.followers_count).toLocaleString()}
                  </Text>
                </div>
              </Tooltip>
            )}
            {lead.following_count != null && (
              <Tooltip title="Following">
                <div className="flex items-center gap-1">
                  <UserAddOutlined style={{ color: token.colorTextSecondary, fontSize: 12 }} />
                  <Text style={{ fontSize: 12 }}>
                    {Number(lead.following_count).toLocaleString()}
                  </Text>
                </div>
              </Tooltip>
            )}
          </div>
        )}

        {/* Details */}
        <div className="flex flex-col gap-1.5">
          {lead.email && (
            <div className="flex items-center gap-1.5">
              <MailOutlined style={{ color: token.colorTextSecondary, fontSize: 12 }} />
              <Text style={{ fontSize: 12 }} className="truncate">{lead.email}</Text>
            </div>
          )}
          {lead.phone_numbers?.length > 0 && (
            <div className="flex items-center gap-1.5">
              <PhoneOutlined style={{ color: token.colorTextSecondary, fontSize: 12 }} />
              <Text style={{ fontSize: 12 }}>{lead.phone_numbers[0]}</Text>
            </div>
          )}
          {lead.company && (
            <div className="flex items-center gap-1.5">
              <BankOutlined style={{ color: token.colorTextSecondary, fontSize: 12 }} />
              <Text style={{ fontSize: 12 }} className="truncate">{lead.company}</Text>
            </div>
          )}
          {lead.location && (
            <div className="flex items-center gap-1.5">
              <EnvironmentOutlined style={{ color: token.colorTextSecondary, fontSize: 12 }} />
              <Text style={{ fontSize: 12 }} className="truncate">{lead.location}</Text>
            </div>
          )}
          {lead.website && (
            <div className="flex items-center gap-1.5">
              <GlobalOutlined style={{ color: token.colorTextSecondary, fontSize: 12 }} />
              <a href={lead.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12 }} className="truncate">
                {lead.website}
              </a>
            </div>
          )}
        </div>

        {/* Bio */}
        {lead.bio && (
          <Text
            type="secondary"
            style={{ fontSize: 11, lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {lead.bio}
          </Text>
        )}
      </div>
    </Card>
  );
}



function safeString(v: any) {
  return typeof v === "string" ? v : "";
}

/**
 * Normalize backend response into a list of leads.
 */
function normalizeScrapedLeads(resp: any): any[] {
  if (!resp) return [];
  if (Array.isArray(resp)) return resp;

  const data = resp?.data ?? resp;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.leads)) return data.leads;
  if (Array.isArray(data?.results)) return data.results;

  return [];
}

export default function LeadsScraperCard({
  defaultFolderId,
  showManageButton = true,
  platform,
  hideLinkedin = false,
}: Props) {
  const intl = useIntl();
  const queryClient = useQueryClient();
  const { id: user_id } = useUserInfo();

  const instagram = useScrapeInstagram();
  const linkedin = useScrapeLinkedIn();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ScrapeType>("LINKEDIN");
  const [scrapeId, setScrapeId] = useState("");
  const [form] = Form.useForm();

  const { data: foldersResp, isFetching: foldersLoading } = useFetchFolders({
    user_id: user_id ?? "",
    page: 1,
    limit: 1000,
  } as any);

  const folderOptions = useMemo(() => {
    const folders = ((foldersResp as any)?.folders ??
      (foldersResp as any)?.data ??
      foldersResp ??
      []) as Array<{ _id?: string; id?: string; name?: string }>;

    return folders
      .map((folder) => ({
        value: String(folder._id ?? folder.id ?? ""),
        label: folder.name ?? "Untitled folder",
      }))
      .filter((option) => option.value);
  }, [foldersResp]);

  // ✅ global lock state: disable all buttons + keep loaders
  const [lockUntil, setLockUntil] = useState<number>(0);
  const locked = lockUntil > Date.now();

  const startLock20s = useCallback(() => {
    setLockUntil(Date.now() + 5_000);
  }, []);

  // keep re-render ticking while locked (so disabled/loading changes correctly)
  useEffect(() => {
    if (!locked) return;
    const t = window.setInterval(() => {
      // trigger re-render by updating lockUntil to itself (safe trick not needed)
      // Instead: just set state to same value doesn't re-render. So use a noop state:
      // We'll just rely on Date.now checks via a tick state.
      setTick((x) => x + 1);
    }, 250);
    return () => window.clearInterval(t);
  }, [locked]);

  const [tick, setTick] = useState(0); // used only for lock countdown rerender
  void tick;

  // base loading from scrape mutations
  const mutationLoading = instagram.isPending || linkedin.isPending;

  // ✅ treat "locked" as loading, so all buttons show loader for 20s
  const uiBusy = mutationLoading || locked;

  // Scraped leads query (only matters after scrapeId set)
  const leadsParams = useMemo(
    () => ({
      scrape_id: scrapeId,
      scrape_status: false,
      user_id: user_id ?? "",
    }),
    [scrapeId, user_id],
  );

  const leadsQuery = useFetchLeadsList(leadsParams); 
  const scrapedLeads = useMemo(
    () => normalizeScrapedLeads(leadsQuery.data),
    [leadsQuery.data],
  );

  const statusTag = useMemo(() => {
    if (uiBusy) {
      return (
        <Tag color="blue">
          <FormattedMessage
            id="scraper.status.running"
            defaultMessage="RUNNING"
          />
        </Tag>
      );
    }
    return (
      <Tag>
        <FormattedMessage id="scraper.status.ready" defaultMessage="READY" />
      </Tag>
    );
  }, [uiBusy]);

  const openModal = (t: ScrapeType) => {
    if (uiBusy) return;
    setType(t);
    form.resetFields();
    form.setFieldValue("folderId", defaultFolderId ?? undefined);
    setOpen(true);
  };

  /**
   * ✅ after scrape success:
   * - lock UI for 20s
   * - refetch scraped list every 5s (for 20s)
   * - invalidate leads list queries (your main table)
   */
  const onScrapeSuccess = useCallback(
    (res: any) => {
      const newScrapeId =
        res?.data?.scrape_id || res?.scrape_id || res?.data?.data?.scrape_id;

      //   if (!newScrapeId) return;

      //   setScrapeId(newScrapeId);

      // lock UI for 20s (disable everything + show loading on buttons)
      startLock20s();

      message.success(
        intl.formatMessage({
          id: "scraper.toast.started",
          defaultMessage: "Scraping started",
        }),
      );
    },
    [intl, startLock20s],
  );

  /**
   * ✅ polling effect:
   * - once scrapeId exists, poll every 5s for 20s
   * - invalidate the general leads list queryKey
   */
  useEffect(() => {
    if (!locked) return;

    // Immediately refetch once (optional)
    leadsQuery.refetch?.();

    // Poll scraped list every 5s for 20s
    const interval = window.setInterval(() => {
      leadsQuery.refetch?.();

      // Invalidate main leads list (table) so it updates
      // Your key: ["leads","list",params] — we invalidate prefix to cover all params.
      queryClient.invalidateQueries({ queryKey: ["leads", "list"] });
    }, 5_000);

    // Stop after 20s from now (or when lockUntil expires)
    const stopAfter = Math.max(0, lockUntil - Date.now());
    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      queryClient.invalidateQueries({ queryKey: ["leads", "list"] });
    }, stopAfter);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrapeId, locked, lockUntil, queryClient, leadsQuery.refetch]);

  const submit = async () => {
    if (uiBusy) return;

    const values = await form.validateFields();
    const url = safeString(values.profileUrl).trim();
    const folder_id = safeString(values.folderId || defaultFolderId).trim();
    if (!user_id) return;

    setOpen(false);

    if (type === "INSTAGRAM") {
      await instagram.mutateAsync(
        {
          profileUrl: url,
          user_id,
          folder_id,
        },
        {
          onSuccess: onScrapeSuccess,
        },
      );
    } else {
      await linkedin.mutateAsync(
        {
          profile_url: url,
          user_id,
          folder_id,
        },
        {
          onSuccess: onScrapeSuccess,
        },
      );
    }
  };

  return (
    <>
      <Card
        className="w-full"
        bodyStyle={{ padding: "16px" }}
        title={
          <Space>
            <FormattedMessage
              id="scraper.card.title"
              defaultMessage="Start Scraping"
            />
            {statusTag}
          </Space>
        }
      >
        <Text type="secondary">
          <FormattedMessage
            id="scraper.card.subtitle"
            defaultMessage="Scrape leads from LinkedIn or Instagram and save them to your leads."
          />
        </Text>

        <Divider />

        {platform !== "INSTAGRAM" && !hideLinkedin ? (
          <>
            {/* LinkedIn row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <Image alt="LinkedIn" src={linkedIn_SVG} width={40} height={40} />
                <div>
                  <Title level={5} className="!mb-0">
                    <FormattedMessage
                      id="scraper.linkedin.title"
                      defaultMessage="LinkedIn"
                    />
                  </Title>
                  <Text type="secondary">
                    <FormattedMessage
                      id="scraper.linkedin.desc"
                      defaultMessage="Scrape profile details + contacts if available."
                    />
                  </Text>
                </div>
              </div>

              <Button
                icon={<PlayCircleOutlined />}
                type="primary"
                onClick={() => openModal("LINKEDIN")}
                loading={uiBusy && type === "LINKEDIN"}
                disabled={uiBusy}
              >
                <FormattedMessage id="scraper.start" defaultMessage="Start" />
              </Button>
            </div>
          </>
        ) : null}

        {platform === undefined ? <Divider /> : null}

        {platform !== "LINKEDIN" ? (
          <>
            {/* Instagram row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <Image
                  alt="Instagram"
                  src={instagram_SVG}
                  width={40}
                  height={40}
                />
                <div>
                  <Title level={5} className="!mb-0">
                    <FormattedMessage
                      id="scraper.instagram.title"
                      defaultMessage="Instagram"
                    />
                  </Title>
                  <Text type="secondary">
                    <FormattedMessage
                      id="scraper.instagram.desc"
                      defaultMessage="Scrape public profile details like username and bio."
                    />
                  </Text>
                </div>
              </div>

              <Button
                icon={<PlayCircleOutlined />}
                onClick={() => openModal("INSTAGRAM")}
                loading={uiBusy && type === "INSTAGRAM"}
                disabled={uiBusy}
              >
                <FormattedMessage id="scraper.start" defaultMessage="Start" />
              </Button>
            </div>
          </>
        ) : null}

        {/* (Optional) you can show a small hint while locked */}
        {locked ? (
          <div className="mt-3">
            <Text type="secondary">
              <FormattedMessage
                id="scraper.locked_hint"
                defaultMessage="Fetching results… please wait a few seconds."
              />
            </Text>
          </div>
        ) : null}
      </Card>

      {/* Modal */}
      <Modal
        open={open}
        onCancel={() => (!uiBusy ? setOpen(false) : null)}
        onOk={submit}
        confirmLoading={uiBusy}
        okButtonProps={{ disabled: uiBusy }}
        cancelButtonProps={{ disabled: uiBusy }}
        okText={intl.formatMessage({
          id: "scraper.modal.ok",
          defaultMessage: "Start scraping",
        })}
        cancelText={intl.formatMessage({
          id: "commons.cancel",
          defaultMessage: "Cancel",
        })}
        title={
          type === "LINKEDIN"
            ? intl.formatMessage({
                id: "scraper.modal.linkedin",
                defaultMessage: "Start LinkedIn scraping",
              })
            : intl.formatMessage({
                id: "scraper.modal.instagram",
                defaultMessage: "Start Instagram scraping",
              })
        }
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label={
              <FormattedMessage
                id="scraper.modal.profileUrl"
                defaultMessage="Profile URL"
              />
            }
            name="profileUrl"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "scraper.modal.profileUrlRequired",
                  defaultMessage: "Profile URL is required",
                }),
              },
            ]}
          >
            <Input placeholder="https://..." disabled={uiBusy} />
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({
              id: "scraper.modal.folder",
              defaultMessage: "Folder",
            })}
            name="folderId"
            rules={[
              {
                required: true,
                message: intl.formatMessage({
                  id: "scraper.modal.folderRequired",
                  defaultMessage: "Please select a folder",
                }),
              },
            ]}
          >
            <Select
              showSearch
              allowClear
              disabled={uiBusy}
              loading={foldersLoading}
              options={folderOptions}
              placeholder={intl.formatMessage({
                id: "scraper.modal.folderPlaceholder",
                defaultMessage: "Select folder",
              })}
              optionFilterProp="label"
            />
          </Form.Item>

          <Text type="secondary">
            <FormattedMessage
              id="scraper.modal.note"
              defaultMessage="If LinkedIn uses SignalHire, leads may appear after the callback finishes."
            />
          </Text>
        </Form>

        {/* optional debug info */}
        {scrapeId ? (
          <div className="mt-3">
            <Text type="secondary">
              : <Tag>{scrapeId}</Tag>
            </Text>
            <Text type="secondary" className="ml-2">
              <Tag color="blue">{scrapedLeads.length}</Tag>
            </Text>
          </div>
        ) : null}
      </Modal>

      {/* Scraped results as cards */}
      {(uiBusy || scrapedLeads.length > 0) && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <Space>
              <Title level={5} className="!mb-0">
                <FormattedMessage id="scraper.results.title" defaultMessage="Scraped Results" />
              </Title>
              {scrapedLeads.length > 0 && (
                <Tag color="purple">{scrapedLeads.length}</Tag>
              )}
            </Space>
            {uiBusy && <Spin size="small" />}
          </div>

          {uiBusy && scrapedLeads.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Spin tip="Fetching results…" />
            </div>
          ) : scrapedLeads.length === 0 ? (
            <Empty description="No results yet" />
          ) : (
            <Row gutter={[16, 16]}>
              {scrapedLeads.map((lead: any, idx: number) => (
                <Col key={lead._id ?? lead.id ?? idx} xs={24} sm={12} md={8} lg={6}>
                  <ScrapedLeadCard lead={lead} type={type} />
                </Col>
              ))}
            </Row>
          )}
        </div>
      )}
    </>
  );
}
