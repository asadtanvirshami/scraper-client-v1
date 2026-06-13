"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Space,
  Spin,
  Steps,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircleOutlined,
  ChromeOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import {
  AdminListPoolAccounts,
  AdminAddPoolAccount,
  AdminUpdatePoolCookies,
  AdminDeletePoolAccount,
  AdminResetPoolAccount,
  AdminRefreshAllPoolAccounts,
  type PoolAccount,
} from "@/api/api_calls/account-pool";
import { useIntl } from "react-intl";

const { Title, Text, Paragraph, Link } = Typography;
const { TextArea } = Input;

const statusColor: Record<string, string> = {
  active: "green",
  inactive: "default",
  rate_limited: "orange",
  suspended: "red",
  error: "red",
};

// ─── Instructions panel ───────────────────────────────────────────────────────
function SetupInstructions() {
  const intl = useIntl();

  return (
    <Card
      style={{ marginBottom: 24, borderColor: "#1677ff33" }}
      styles={{ header: { background: "#e6f4ff", borderBottom: "1px solid #1677ff33" } }}
      title={
        <Space>
          <SafetyCertificateOutlined style={{ color: "#1677ff" }} />
          <span style={{ color: "#1677ff", fontWeight: 600 }}>
            {intl.formatMessage({
              id: "admin.account_pool.instructions.title",
              defaultMessage: "How to add an Instagram pool account",
            })}
          </span>
        </Space>
      }
    >
      <Steps
        direction="vertical"
        size="small"
        style={{ marginBottom: 12 }}
        items={[
          {
            title: intl.formatMessage({
              id: "admin.account_pool.instructions.steps.install.title",
              defaultMessage: "Install the cookie extraction extension",
            }),
            description: (
              <Text type="secondary">
                {intl.formatMessage({
                  id: "admin.account_pool.instructions.steps.install.before_link",
                  defaultMessage: "Install",
                })}{" "}
                <Link
                  href="https://chrome.google.com/webstore/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm"
                  target="_blank"
                >
                  Cookie-Editor
                </Link>{" "}
                {intl.formatMessage({
                  id: "admin.account_pool.instructions.steps.install.after_link",
                  defaultMessage:
                    "(or similar) from the Chrome Web Store. It exports cookies as JSON.",
                })}
              </Text>
            ),
            icon: <ChromeOutlined />,
            status: "process",
          },
          {
            title: intl.formatMessage({
              id: "admin.account_pool.instructions.steps.login.title",
              defaultMessage:
                'Log in to a dedicated Instagram "burning" account',
            }),
            description: (
              <Text type="secondary">
                {intl.formatMessage({
                  id: "admin.account_pool.instructions.steps.login.description",
                  defaultMessage:
                    "Use a throwaway Instagram account, not your personal or client accounts. Open Instagram in Chrome and log in fully.",
                })}
              </Text>
            ),
            icon: <CheckCircleOutlined />,
            status: "process",
          },
          {
            title: intl.formatMessage({
              id: "admin.account_pool.instructions.steps.export.title",
              defaultMessage: "Export the session cookies",
            }),
            description: (
              <Text type="secondary">
                {intl.formatMessage({
                  id: "admin.account_pool.instructions.steps.export.before_export",
                  defaultMessage: "Click the Cookie-Editor extension icon, then click",
                })}{" "}
                <Text strong>
                  {intl.formatMessage({
                    id: "admin.account_pool.instructions.steps.export.export_label",
                    defaultMessage: "Export",
                  })}
                </Text>{" "}
                {intl.formatMessage({
                  id: "admin.account_pool.instructions.steps.export.before_json",
                  defaultMessage: "and choose",
                })}{" "}
                <Text strong>
                  {intl.formatMessage({
                    id: "admin.account_pool.instructions.steps.export.export_json_label",
                    defaultMessage: "Export as JSON",
                  })}
                </Text>
                .{" "}
                {intl.formatMessage({
                  id: "admin.account_pool.instructions.steps.export.after_json",
                  defaultMessage:
                    "The full cookie array is copied to your clipboard.",
                })}
              </Text>
            ),
            icon: <CheckCircleOutlined />,
            status: "process",
          },
          {
            title: intl.formatMessage({
              id: "admin.account_pool.instructions.steps.save.title",
              defaultMessage: "Paste and save below",
            }),
            description: (
              <Text type="secondary">
                {intl.formatMessage({
                  id: "admin.account_pool.instructions.steps.save.before_action",
                  defaultMessage: "Click",
                })}{" "}
                <Text strong>
                  {intl.formatMessage({
                    id: "admin.account_pool.actions.add_account",
                    defaultMessage: "Add Account",
                  })}
                </Text>
                ,{" "}
                {intl.formatMessage({
                  id: "admin.account_pool.instructions.steps.save.after_action",
                  defaultMessage:
                    "paste the JSON array into the text area, give it a display name, and save. The proxy is assigned automatically.",
                })}
              </Text>
            ),
            icon: <SafetyCertificateOutlined />,
            status: "process",
          },
        ]}
      />
      <Alert
        type="warning"
        showIcon
        icon={<ExclamationCircleOutlined />}
        message={intl.formatMessage({
          id: "admin.account_pool.instructions.notes.title",
          defaultMessage: "Important notes",
        })}
        description={
          <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
            <li>
              {intl.formatMessage(
                {
                  id: "admin.account_pool.instructions.notes.max_accounts",
                  defaultMessage: "Unlimited pool accounts can be added.",
                },
              )}
            </li>
            <li>
              {intl.formatMessage({
                id: "admin.account_pool.instructions.notes.proxy_assignment",
                defaultMessage:
                  "Each account is automatically assigned a dedicated proxy port (round-robin from the configured proxy pool).",
              })}
            </li>
            <li>
              {intl.formatMessage(
                {
                  id: "admin.account_pool.instructions.notes.real_account_warning",
                  defaultMessage:
                    "Do {notLabel} use your real Instagram account. These accounts may get rate-limited or suspended during heavy scraping.",
                },
                {
                  notLabel: (
                    <strong>
                      {intl.formatMessage({
                        id: "admin.account_pool.instructions.notes.not_label",
                        defaultMessage: "not",
                      })}
                    </strong>
                  ),
                },
              )}
            </li>
            <li>
              {intl.formatMessage({
                id: "admin.account_pool.instructions.notes.cookies_expire_prefix",
                defaultMessage:
                  "Cookies expire when the Instagram session ends. Replace them here whenever an account shows",
              })}{" "}
              <Tag color="red">
                {intl.formatMessage({
                  id: "admin.account_pool.status.error",
                  defaultMessage: "error",
                })}
              </Tag>{" "}
              {intl.formatMessage({
                id: "admin.account_pool.instructions.notes.or_label",
                defaultMessage: "or",
              })}{" "}
              <Tag color="orange">
                {intl.formatMessage({
                  id: "admin.account_pool.status.rate_limited",
                  defaultMessage: "rate_limited",
                })}
              </Tag>
              .
            </li>
          </ul>
        }
      />
    </Card>
  );
}

// ─── Cookie string parser ─────────────────────────────────────────────────────
type CookieEditorCookie = {
  domain: string;
  expirationDate?: number;
  hostOnly: boolean;
  httpOnly: boolean;
  name: string;
  path: string;
  sameSite: string;
  secure: boolean;
  session: boolean;
  storeId: string;
  value: string;
};

type CookieInput = Partial<CookieEditorCookie> & {
  expires?: number;
};

const DEFAULT_COOKIE_TTL_SECONDS = 2 * 365 * 24 * 60 * 60;

const instagramCookieMeta: Record<string, { httpOnly: boolean; sameSite: string; session?: boolean }> = {
  datr: { httpOnly: true, sameSite: "no_restriction" },
  ig_did: { httpOnly: true, sameSite: "no_restriction" },
  ig_nrcb: { httpOnly: false, sameSite: "unspecified" },
  mid: { httpOnly: true, sameSite: "no_restriction" },
  ps_l: { httpOnly: true, sameSite: "lax" },
  ps_n: { httpOnly: true, sameSite: "no_restriction" },
  csrftoken: { httpOnly: false, sameSite: "unspecified" },
  ds_user_id: { httpOnly: false, sameSite: "no_restriction" },
  sessionid: { httpOnly: true, sameSite: "unspecified" },
  rur: { httpOnly: true, sameSite: "lax", session: true },
  wd: { httpOnly: false, sameSite: "lax" },
  dpr: { httpOnly: false, sameSite: "unspecified" },
};

const getDefaultExpirationDate = () =>
  Date.now() / 1000 + DEFAULT_COOKIE_TTL_SECONDS;

const toPositiveNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
};

function normalizeCookieEditorCookies(cookies: CookieInput[]): CookieEditorCookie[] {
  const defaultExpirationDate = getDefaultExpirationDate();
  return cookies.map((cookie) => {
    const name = String(cookie.name || "").trim();
    const meta = instagramCookieMeta[name] || { httpOnly: false, sameSite: "unspecified" };
    const rawExpiration = cookie.expirationDate ?? cookie.expires;
    const expirationDate = toPositiveNumber(rawExpiration);
    const session =
      typeof cookie.session === "boolean"
        ? cookie.session
        : meta.session ?? (rawExpiration !== undefined && expirationDate === null);

    return {
      domain: typeof cookie.domain === "string" && cookie.domain.trim() ? cookie.domain.trim() : ".instagram.com",
      ...(session ? {} : { expirationDate: expirationDate ?? defaultExpirationDate }),
      hostOnly: typeof cookie.hostOnly === "boolean" ? cookie.hostOnly : false,
      httpOnly: typeof cookie.httpOnly === "boolean" ? cookie.httpOnly : meta.httpOnly ?? false,
      name,
      path: typeof cookie.path === "string" && cookie.path.trim() ? cookie.path.trim() : "/",
      sameSite: typeof cookie.sameSite === "string" && cookie.sameSite.trim() ? cookie.sameSite.trim() : meta.sameSite ?? "unspecified",
      secure: typeof cookie.secure === "boolean" ? cookie.secure : true,
      session,
      storeId: cookie.storeId !== undefined && cookie.storeId !== null ? String(cookie.storeId) : "0",
      value: cookie.value === undefined || cookie.value === null ? "" : String(cookie.value),
    };
  });
}

function parseCookieString(raw: string): CookieEditorCookie[] {
  const cookies = raw
    .split(";")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const eqIdx = pair.indexOf("=");
      if (eqIdx === -1) return null;
      const name = pair.slice(0, eqIdx).trim();
      const value = pair.slice(eqIdx + 1).trim();
      if (!name) return null;
      return { name, value };
    })
    .filter(Boolean) as CookieInput[];

  return normalizeCookieEditorCookies(cookies);
}

// ─── Add / Update Cookies modal ───────────────────────────────────────────────
function parseCookieInput(raw: string): { parsed: CookieEditorCookie[] | null; error: string | null } {
  const trimmed = raw.trim();
  if (!trimmed) return { parsed: [], error: null };
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (!Array.isArray(parsed)) return { parsed: null, error: "Expected a JSON array of cookies." };
      return { parsed: normalizeCookieEditorCookies(parsed), error: null };
    } catch {
      return { parsed: null, error: "Invalid JSON. Paste the cookie array from Cookie-Editor." };
    }
  }
  const parsed = parseCookieString(trimmed);
  if (parsed.length === 0) {
    return { parsed: null, error: "Could not parse cookies. Use a JSON array or a cookie string (name=value; ...)." };
  }
  return { parsed, error: null };
}

function CookieModal({
  open,
  mode,
  account,
  onClose,
  onSuccess,
}: {
  open: boolean;
  mode: "add" | "update" | "reset";
  account: PoolAccount | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const intl = useIntl();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) form.resetFields();
  }, [open, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const cookieRaw: string = (values.cookies ?? "").trim();
      const cookiesRequired = mode !== "reset";

      if (cookiesRequired && !cookieRaw) {
        message.error(
          intl.formatMessage({
            id: "admin.account_pool.form.cookies_required",
            defaultMessage: "Please paste the cookie JSON",
          }),
        );
        setSaving(false);
        return;
      }

      // In reset mode cookies are optional — skip parsing if field is empty
      let cookiesJson: string | null = null;
      if (cookieRaw) {
        const { parsed, error } = parseCookieInput(cookieRaw);
        if (error || !parsed) {
          message.error(error ?? intl.formatMessage({ id: "admin.account_pool.messages.invalid_json", defaultMessage: "Invalid cookie input." }));
          setSaving(false);
          return;
        }
        cookiesJson = JSON.stringify(parsed, null, 2);
        form.setFieldsValue({ cookies: cookiesJson });
      }

      if (mode === "add") {
        const res = await AdminAddPoolAccount({
          cookies: cookiesJson!,
          displayName: values.displayName || undefined,
          notes: values.notes || undefined,
        });
        if (res?.success) {
          message.success(intl.formatMessage({ id: "admin.account_pool.messages.add_success", defaultMessage: "Account added to pool successfully" }));
          onSuccess();
          onClose();
        } else {
          message.error(res?.message || intl.formatMessage({ id: "admin.account_pool.messages.add_failed", defaultMessage: "Failed to add account" }));
        }
      } else if (mode === "update" && account) {
        const res = await AdminUpdatePoolCookies(account._id, cookiesJson!);
        if (res?.success) {
          message.success(intl.formatMessage({ id: "admin.account_pool.messages.update_success", defaultMessage: "Cookies updated successfully" }));
          onSuccess();
          onClose();
        } else {
          message.error(res?.message || intl.formatMessage({ id: "admin.account_pool.messages.update_failed", defaultMessage: "Failed to update cookies" }));
        }
      } else if (mode === "reset" && account) {
        // 1) Update cookies first if provided
        if (cookiesJson) {
          const cookieRes = await AdminUpdatePoolCookies(account._id, cookiesJson);
          if (!cookieRes?.success) {
            message.error(cookieRes?.message || intl.formatMessage({ id: "admin.account_pool.messages.update_failed", defaultMessage: "Failed to update cookies" }));
            setSaving(false);
            return;
          }
        }
        // 2) Reset failure counters and reactivate
        const resetRes = await AdminResetPoolAccount(account._id);
        if (resetRes?.success) {
          message.success(intl.formatMessage({ id: "admin.account_pool.messages.reset_success", defaultMessage: "Account reset to active" }));
          onSuccess();
          onClose();
        } else {
          message.error(resetRes?.message || intl.formatMessage({ id: "admin.account_pool.messages.reset_failed", defaultMessage: "Failed to reset account" }));
        }
      }
    } catch {
      // form validation errors handled automatically
    } finally {
      setSaving(false);
    }
  };

  const modalTitle =
    mode === "add"
      ? intl.formatMessage({ id: "admin.account_pool.modal.add_title", defaultMessage: "Add Pool Account" })
      : mode === "reset"
        ? intl.formatMessage({ id: "admin.account_pool.modal.reset_title", defaultMessage: "Reset & Reactivate - {name}" }, { name: account?.displayName ?? "-" })
        : intl.formatMessage({ id: "admin.account_pool.modal.update_title", defaultMessage: "Update Cookies - {name}" }, { name: account?.displayName ?? "-" });

  const okLabel =
    mode === "add"
      ? intl.formatMessage({ id: "admin.account_pool.actions.add_account", defaultMessage: "Add Account" })
      : mode === "reset"
        ? intl.formatMessage({ id: "admin.account_pool.actions.reset_reactivate", defaultMessage: "Reset & Reactivate" })
        : intl.formatMessage({ id: "admin.account_pool.actions.update_cookies", defaultMessage: "Update Cookies" });

  const cookiesRequired = mode !== "reset";

  return (
    <Modal
      open={open}
      title={modalTitle}
      onCancel={onClose}
      onOk={handleOk}
      okText={okLabel}
      confirmLoading={saving}
      width={640}
      destroyOnClose
    >
      {mode === "reset" && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message={intl.formatMessage({
            id: "admin.account_pool.modal.reset_help",
            defaultMessage:
              "Paste fresh cookies to replace the expired session, then reset failure counters and reactivate the account. Leave the cookie field empty to only reset the counters.",
          })}
        />
      )}
      {mode !== "reset" && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message={intl.formatMessage({
            id: "admin.account_pool.modal.help",
            defaultMessage:
              "Paste either the full JSON array from Cookie-Editor, or a raw cookie string (name=value; name2=value2; ...) — both formats are accepted.",
          })}
        />
      )}
      <Form form={form} layout="vertical">
        {mode === "add" && (
          <>
            <Form.Item
              name="displayName"
              label={intl.formatMessage({ id: "admin.account_pool.form.display_name", defaultMessage: "Display Name (optional)" })}
            >
              <Input placeholder={intl.formatMessage({ id: "admin.account_pool.form.display_name_placeholder", defaultMessage: "e.g. Burning Account #1" })} />
            </Form.Item>
            <Form.Item
              name="notes"
              label={intl.formatMessage({ id: "admin.account_pool.form.notes", defaultMessage: "Notes (optional)" })}
            >
              <Input placeholder={intl.formatMessage({ id: "admin.account_pool.form.notes_placeholder", defaultMessage: "Any internal note about this account" })} />
            </Form.Item>
          </>
        )}
        <Form.Item
          name="cookies"
          label={intl.formatMessage({
            id: "admin.account_pool.form.cookies",
            defaultMessage: cookiesRequired ? "Cookie JSON" : "New Cookies (optional)",
          })}
          rules={
            cookiesRequired
              ? [{ required: true, message: intl.formatMessage({ id: "admin.account_pool.form.cookies_required", defaultMessage: "Please paste the cookie JSON" }) }]
              : []
          }
        >
          <TextArea
            rows={10}
            placeholder={`JSON array:\n[\n  {"name":"sessionid","value":"123456789:abc","domain":".instagram.com",...}\n]\n\nor raw string:\nig_did=...; sessionid=...; csrftoken=...`}
            style={{ fontFamily: "monospace", fontSize: 12 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AccountPoolingManager() {
  const intl = useIntl();
  const [accounts, setAccounts] = useState<PoolAccount[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "update" | "reset">("add");
  const [selectedAccount, setSelectedAccount] = useState<PoolAccount | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, string>>({});
  const [refreshAllLoading, setRefreshAllLoading] = useState(false);

  const fetchAccounts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await AdminListPoolAccounts();
      if (res?.success) {
        setAccounts(res.data?.accounts ?? []);
        setTotal(res.data?.total ?? 0);
      }
    } catch {
      if (!silent) {
        message.error(
          intl.formatMessage({
            id: "admin.account_pool.messages.load_failed",
            defaultMessage: "Failed to load pool accounts",
          }),
        );
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [intl]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const setAction = (id: string, a: string) =>
    setActionLoading((p) => ({ ...p, [id]: a }));
  const clearAction = (id: string) =>
    setActionLoading((p) => { const n = { ...p }; delete n[id]; return n; });

  const handleDelete = async (id: string) => {
    setAction(id, "delete");
    try {
      const res = await AdminDeletePoolAccount(id);
      if (res?.success) {
        message.success(
          intl.formatMessage({
            id: "admin.account_pool.messages.delete_success",
            defaultMessage: "Account removed from pool",
          }),
        );
        await fetchAccounts(true);
      } else {
        message.error(
          res?.message ||
            intl.formatMessage({
              id: "admin.account_pool.messages.delete_failed",
              defaultMessage: "Failed to delete",
            }),
        );
      }
    } catch (e: any) {
      message.error(
        e?.response?.data?.message ||
          intl.formatMessage({
            id: "admin.account_pool.messages.delete_failed",
            defaultMessage: "Failed to delete",
          }),
      );
    } finally {
      clearAction(id);
    }
  };

  const openAdd = () => {
    setModalMode("add");
    setSelectedAccount(null);
    setModalOpen(true);
  };

  const openUpdateCookies = (account: PoolAccount) => {
    setModalMode("update");
    setSelectedAccount(account);
    setModalOpen(true);
  };

  const openReset = (account: PoolAccount) => {
    setModalMode("reset");
    setSelectedAccount(account);
    setModalOpen(true);
  };

  const handleRefreshAll = async () => {
    setRefreshAllLoading(true);
    try {
      const res = await AdminRefreshAllPoolAccounts();
      if (res?.success) {
        message.success(
          res.message ||
            intl.formatMessage({
              id: "admin.account_pool.messages.refresh_all_success",
              defaultMessage: "All pool accounts refreshed",
            }),
        );
        await fetchAccounts(true);
      } else {
        message.error(
          res?.message ||
            intl.formatMessage({
              id: "admin.account_pool.messages.refresh_all_failed",
              defaultMessage: "Failed to refresh pool accounts",
            }),
        );
      }
    } catch (e: any) {
      message.error(
        e?.response?.data?.message ||
          intl.formatMessage({
            id: "admin.account_pool.messages.refresh_all_failed",
            defaultMessage: "Failed to refresh pool accounts",
          }),
      );
    } finally {
      setRefreshAllLoading(false);
    }
  };

  const columns: ColumnsType<PoolAccount> = [
    {
      title: intl.formatMessage({
        id: "admin.account_pool.table.index",
        defaultMessage: "#",
      }),
      key: "index",
      width: 42,
      render: (_, __, i) => <Text type="secondary">{i + 1}</Text>,
    },
    {
      title: intl.formatMessage({
        id: "admin.account_pool.table.display_name",
        defaultMessage: "Display Name",
      }),
      key: "displayName",
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text strong>{r.displayName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>@{r.username}</Text>
        </Space>
      ),
    },
    {
      title: intl.formatMessage({
        id: "admin.account_pool.table.instagram_user_id",
        defaultMessage: "IG User ID",
      }),
      dataIndex: "instagramUserId",
      key: "instagramUserId",
      render: (v) => <Text code style={{ fontSize: 11 }}>{v}</Text>,
    },
    {
      title: intl.formatMessage({
        id: "admin.account_pool.table.status",
        defaultMessage: "Status",
      }),
      key: "status",
      width: 130,
      render: (_, r) => (
        <Space>
          <Badge
            status={r.isAvailable ? "processing" : "default"}
            color={r.isAvailable ? "green" : "grey"}
          />
          <Tag color={statusColor[r.status] ?? "default"}>
            {intl.formatMessage({
              id: `admin.account_pool.status.${r.status}`,
              defaultMessage: r.status,
            })}
          </Tag>
        </Space>
      ),
    },
    {
      title: intl.formatMessage({
        id: "admin.account_pool.table.proxy",
        defaultMessage: "Proxy",
      }),
      key: "proxy",
      render: (_, r) => {
        if (!r.proxyUrl) return <Text type="secondary">-</Text>;
        const match = r.proxyUrl.match(/@(.+)$/);
        const display = match ? match[1] : r.proxyUrl;
        return <Text code style={{ fontSize: 11 }}>{display}</Text>;
      },
    },
    {
      title: intl.formatMessage({
        id: "admin.account_pool.table.requests",
        defaultMessage: "Requests",
      }),
      key: "requests",
      width: 90,
      render: (_, r) => (
        <Tooltip
          title={intl.formatMessage(
            {
              id: "admin.account_pool.table.requests_tooltip",
              defaultMessage: "{success} success / {failed} fail",
            },
            { success: r.successfulRequests, failed: r.failedRequests },
          )}
        >
          <Text>{r.totalRequests.toLocaleString()}</Text>
        </Tooltip>
      ),
    },
    {
      title: intl.formatMessage({
        id: "admin.account_pool.table.failures",
        defaultMessage: "Failures",
      }),
      key: "failures",
      width: 80,
      render: (_, r) => (
        <Tag color={r.consecutiveFailures > 2 ? "red" : r.consecutiveFailures > 0 ? "orange" : "green"}>
          {r.consecutiveFailures}
        </Tag>
      ),
    },
    {
      title: intl.formatMessage({
        id: "admin.account_pool.table.last_used",
        defaultMessage: "Last Used",
      }),
      key: "lastUsed",
      width: 110,
      render: (_, r) =>
        r.lastUsedAt
          ? (
              <Text type="secondary" style={{ fontSize: 11 }}>
                {intl.formatDate(new Date(r.lastUsedAt), {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            )
          : (
              <Text type="secondary">
                {intl.formatMessage({
                  id: "admin.account_pool.table.never",
                  defaultMessage: "Never",
                })}
              </Text>
            ),
    },
    {
      title: intl.formatMessage({
        id: "admin.account_pool.table.actions",
        defaultMessage: "Actions",
      }),
      key: "actions",
      width: 180,
      render: (_, r) => {
        const busy = actionLoading[r._id];
        return (
          <Space>
            <Tooltip
              title={intl.formatMessage({
                id: "admin.account_pool.actions.replace_cookies",
                defaultMessage: "Replace cookies",
              })}
            >
              <Button
                size="small"
                icon={<SyncOutlined spin={busy === "update"} />}
                onClick={() => openUpdateCookies(r)}
                loading={busy === "update"}
              >
                {intl.formatMessage({
                  id: "admin.account_pool.actions.cookies",
                  defaultMessage: "Cookies",
                })}
              </Button>
            </Tooltip>
            <Tooltip
              title={intl.formatMessage({
                id: "admin.account_pool.actions.reset_reactivate",
                defaultMessage: "Reset failures and reactivate",
              })}
            >
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => openReset(r)}
              />
            </Tooltip>
            <Popconfirm
              title={intl.formatMessage({
                id: "admin.account_pool.confirm.remove_one",
                defaultMessage: "Remove this account from the pool?",
              })}
              onConfirm={() => handleDelete(r._id)}
              okText={intl.formatMessage({
                id: "admin.account_pool.actions.remove",
                defaultMessage: "Remove",
              })}
              okButtonProps={{ danger: true }}
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={busy === "delete"}
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const activeCount = accounts.filter((a) => a.status === "active" && a.isAvailable).length;
  const errorCount = accounts.filter((a) => a.status === "error" || a.status === "suspended").length;

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1200 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            {intl.formatMessage({
              id: "admin.account_pool.title",
              defaultMessage: "Account Pooling",
            })}
          </Title>
          <Text type="secondary">
            {intl.formatMessage({
              id: "admin.account_pool.subtitle",
              defaultMessage:
                "Manage Instagram scraping accounts. Each account uses a dedicated proxy port.",
            })}
          </Text>
        </Col>
        <Col>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => fetchAccounts()} loading={loading}>
              {intl.formatMessage({
                id: "admin.account_pool.actions.refresh",
                defaultMessage: "Refresh",
              })}
            </Button>
            <Button
              icon={<SyncOutlined spin={refreshAllLoading} />}
              onClick={handleRefreshAll}
              loading={refreshAllLoading}
              disabled={loading}
            >
              {intl.formatMessage({
                id: "admin.account_pool.actions.refresh_all",
                defaultMessage: "Refresh All",
              })}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openAdd}
            >
              {intl.formatMessage({
                id: "admin.account_pool.actions.add_account",
                defaultMessage: "Add Account",
              })}
            </Button>
          </Space>
        </Col>
      </Row>

      <Divider style={{ margin: "16px 0" }} />

      {/* Stats row */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col>
          <Card size="small" style={{ minWidth: 120, textAlign: "center" }}>
            <Text strong style={{ fontSize: 22 }}>{total}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {intl.formatMessage(
                {
                  id: "admin.account_pool.summary.accounts_total",
                  defaultMessage: "accounts",
                },
              )}
            </Text>
          </Card>
        </Col>
        <Col>
          <Card size="small" style={{ minWidth: 120, textAlign: "center", borderColor: "#52c41a44" }}>
            <Text strong style={{ fontSize: 22, color: "#52c41a" }}>{activeCount}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {intl.formatMessage({
                id: "admin.account_pool.summary.active",
                defaultMessage: "active",
              })}
            </Text>
          </Card>
        </Col>
        {errorCount > 0 && (
          <Col>
            <Card size="small" style={{ minWidth: 120, textAlign: "center", borderColor: "#ff4d4f44" }}>
              <Text strong style={{ fontSize: 22, color: "#ff4d4f" }}>{errorCount}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {intl.formatMessage({
                  id: "admin.account_pool.summary.need_attention",
                  defaultMessage: "need attention",
                })}
              </Text>
            </Card>
          </Col>
        )}
      </Row>

      {/* Instructions */}
      <SetupInstructions />

      {/* Accounts table */}
      <Card
        title={
          <Space>
            <Text strong>
              {intl.formatMessage({
                id: "admin.account_pool.table.title",
                defaultMessage: "Pool Accounts",
              })}
            </Text>
            <Tag color="blue">
              {intl.formatMessage(
                {
                  id: "admin.account_pool.table.total_unlimited",
                  defaultMessage: "{total} / unlimited",
                },
                { total },
              )}
            </Tag>
          </Space>
        }
      >
        <Table
          dataSource={accounts}
          columns={columns}
          rowKey="_id"
          loading={loading}
          size="small"
          pagination={false}
          locale={{
            emptyText: (
              <Space direction="vertical" style={{ padding: "24px 0", textAlign: "center" }}>
                <SafetyCertificateOutlined style={{ fontSize: 32, color: "#d9d9d9" }} />
                <Text type="secondary">
                  {intl.formatMessage(
                    {
                      id: "admin.account_pool.empty",
                      defaultMessage:
                        'No pool accounts yet. Click "{action}" to get started.',
                    },
                    {
                      action: intl.formatMessage({
                        id: "admin.account_pool.actions.add_account",
                        defaultMessage: "Add Account",
                      }),
                    },
                  )}
                </Text>
              </Space>
            ),
          }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Add / Update cookies modal */}
      <CookieModal
        open={modalOpen}
        mode={modalMode}
        account={selectedAccount}
        onClose={() => setModalOpen(false)}
        onSuccess={() => fetchAccounts(true)}
      />
    </div>
  );
}
