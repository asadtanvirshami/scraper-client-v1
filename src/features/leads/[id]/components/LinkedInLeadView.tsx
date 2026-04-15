"use client";

import { Avatar, Card, Col, Row, Space, Tag, Typography } from "antd";
import {
  ApartmentOutlined,
  CommentOutlined,
  GlobalOutlined,
  IdcardOutlined,
  InfoCircleOutlined,
  MailOutlined,
  MessageOutlined,
  NumberOutlined,
  PhoneOutlined,
  PictureOutlined,
  ProfileOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { FormattedMessage } from "react-intl";

import type { Lead } from "@/types/leads";
import { getLeadAvatarSrc } from "@/features/leads/utils/avatar";

const { Title } = Typography;

function toDisplay(value: unknown) {
  if (value === null || value === undefined) return "-";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
  const text = String(value).trim();
  return text || "-";
}

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString()
    : "-";
}

function hasValue(value: unknown) {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "boolean") return true;
  if (typeof value === "string") return value.trim().length > 0;
  return true;
}

function InfoItem({
  label,
  value,
  icon,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white/70 p-4">
      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide leading-none">
        {icon ? <span className="inline-flex shrink-0 text-sm">{icon}</span> : null}
        <span className="leading-none">{label}</span>
      </div>
      <div className="mt-2.5 text-sm break-words leading-6">{value}</div>
    </div>
  );
}

type Props = {
  lead: Lead;
  leadId: string;
};

export default function LinkedInLeadView({ lead, leadId }: Props) {
  const avatarSrc = getLeadAvatarSrc(lead);

  const displayName =
    toDisplay(lead.full_name) !== "-"
      ? toDisplay(lead.full_name)
      : `${toDisplay(lead.first_name)} ${toDisplay(lead.last_name)}`.replace(
          /-\s|-|\s+/g,
          " ",
        ).trim() || "Lead";

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <Card className="overflow-hidden" styles={{ body: { padding: 0 } }}>
        <div className="p-6">
          <Space align="start" size={16} className="w-full">
            <Avatar
              size={76}
              src={avatarSrc}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#f5f5f5", flexShrink: 0 }}
            />
            <div className="min-w-0 flex-1">
              <Title level={4} className="!mb-1">
                {displayName}
              </Title>
              <Space wrap>
                <Tag>
                  <FormattedMessage
                    id="leads.form.type_linkedin"
                    defaultMessage="LinkedIn"
                  />
                </Tag>
                <Tag icon={<SafetyCertificateOutlined />}>
                  {lead.is_converted ? (
                    <FormattedMessage
                      id="leads.status.converted"
                      defaultMessage="Converted"
                    />
                  ) : (
                    <FormattedMessage id="leads.status.new" defaultMessage="New" />
                  )}
                </Tag>
                <Tag icon={<GlobalOutlined />}>ID: {leadId}</Tag>
              </Space>
            </div>
          </Space>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card
            title={
              <FormattedMessage
                id="leads.linkedIn_view.title"
                defaultMessage="LinkedIn Details"
              />
            }
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <InfoItem
                label={
                  <FormattedMessage
                    id="leads.form.first_name"
                    defaultMessage="First name"
                  />
                }
                value={toDisplay(lead.first_name)}
                icon={<UserOutlined />}
              />
              <InfoItem
                label={
                  <FormattedMessage
                    id="leads.form.last_name"
                    defaultMessage="Last name"
                  />
                }
                value={toDisplay(lead.last_name)}
                icon={<UserOutlined />}
              />
              <InfoItem
                label={
                  <FormattedMessage id="leads.form.emails" defaultMessage="Emails" />
                }
                value={toDisplay(lead.emails)}
                icon={<MailOutlined />}
              />
              <InfoItem
                label={
                  <FormattedMessage
                    id="leads.table.phones"
                    defaultMessage="Phones"
                  />
                }
                value={toDisplay(lead.phone_numbers)}
                icon={<PhoneOutlined />}
              />
              <InfoItem
                label={
                  <FormattedMessage
                    id="leads.linkedIn_view.sms_number"
                    defaultMessage="SMS Number"
                  />
                }
                value={toDisplay(lead.sms_number)}
                icon={<MessageOutlined />}
              />
              <InfoItem
                label={
                  <FormattedMessage
                    id="leads.linkedIn_view.whatsapp_number"
                    defaultMessage="WhatsApp Number"
                  />
                }
                value={toDisplay(lead.whatsapp_number)}
                icon={<CommentOutlined />}
              />
              <InfoItem
                label={
                  <FormattedMessage
                    id="leads.linkedIn_view.landline_number"
                    defaultMessage="Landline Number"
                  />
                }
                value={toDisplay(lead.landline_number)}
                icon={<PhoneOutlined />}
              />
              <InfoItem
                label={
                  <FormattedMessage
                    id="leads.table.company"
                    defaultMessage="Company"
                  />
                }
                value={toDisplay(lead.company)}
                icon={<ApartmentOutlined />}
              />
              <InfoItem
                label={
                  <FormattedMessage
                    id="leads.table.jobTitle"
                    defaultMessage="Job Title"
                  />
                }
                value={toDisplay(lead.job_title)}
                icon={<ProfileOutlined />}
              />
              {hasValue(lead.source_url) ? (
                <InfoItem
                  label={
                    <FormattedMessage
                      id="leads.table.source_url"
                      defaultMessage="Source URL"
                    />
                  }
                  value={toDisplay(lead.source_url)}
                  icon={<GlobalOutlined />}
                />
              ) : null}
              {hasValue(lead.source_rul) ? (
                <InfoItem
                  label={
                    <FormattedMessage
                      id="leads.table.source_rul"
                      defaultMessage="Source RUL"
                    />
                  }
                  value={toDisplay(lead.source_rul)}
                  icon={<GlobalOutlined />}
                />
              ) : null}
              {hasValue(lead.instagram_profile_id) ? (
                <InfoItem
                  label={
                    <FormattedMessage
                      id="leads.linkedIn_view.instagram_profile_id"
                      defaultMessage="Instagram Profile ID"
                    />
                  }
                  value={toDisplay(lead.instagram_profile_id)}
                  icon={<NumberOutlined />}
                />
              ) : null}
              {hasValue(lead.username) ? (
                <InfoItem
                  label={
                    <FormattedMessage
                      id="leads.linkedIn_view.username"
                      defaultMessage="Username"
                    />
                  }
                  value={toDisplay(lead.username)}
                  icon={<IdcardOutlined />}
                />
              ) : null}
              {hasValue(lead.full_name) ? (
                <InfoItem
                  label={
                    <FormattedMessage
                      id="leads.linkedIn_view.full_name"
                      defaultMessage="Full Name"
                    />
                  }
                  value={toDisplay(lead.full_name)}
                  icon={<IdcardOutlined />}
                />
              ) : null}
              {hasValue(lead.bio) ? (
                <InfoItem
                  label={
                    <FormattedMessage id="leads.table.bio" defaultMessage="Bio" />
                  }
                  value={toDisplay(lead.bio)}
                  icon={<InfoCircleOutlined />}
                />
              ) : null}
              {hasValue(lead.avatar_url) ? (
                <InfoItem
                  label={
                    <FormattedMessage
                      id="leads.table.avatar_url"
                      defaultMessage="Avatar"
                    />
                  }
                  value={toDisplay(lead.avatar_url)}
                  icon={<PictureOutlined />}
                />
              ) : null}
              {hasValue(lead.avatar_rul) ? (
                <InfoItem
                  label={
                    <FormattedMessage
                      id="leads.table.avatar_rul"
                      defaultMessage="Avatar RUL"
                    />
                  }
                  value={toDisplay(lead.avatar_rul)}
                  icon={<PictureOutlined />}
                />
              ) : null}
              {hasValue(lead.followers) ? (
                <InfoItem
                  label={
                    <FormattedMessage
                      id="leads.linkedIn_view.followers"
                      defaultMessage="Followers"
                    />
                  }
                  value={toNumber(lead.followers)}
                  icon={<UserOutlined />}
                />
              ) : null}
              {hasValue(lead.following) ? (
                <InfoItem
                  label={
                    <FormattedMessage
                      id="leads.linkedIn_view.following"
                      defaultMessage="Following"
                    />
                  }
                  value={toNumber(lead.following)}
                  icon={<UserOutlined />}
                />
              ) : null}
              {hasValue(lead.follower_count) ? (
                <InfoItem
                  label={
                    <FormattedMessage
                      id="leads.table.follower_count"
                      defaultMessage="Followers"
                    />
                  }
                  value={toNumber(lead.follower_count)}
                  icon={<UserOutlined />}
                />
              ) : null}
              {hasValue(lead.following_count) ? (
                <InfoItem
                  label={
                    <FormattedMessage
                      id="leads.table.following_count"
                      defaultMessage="Following"
                    />
                  }
                  value={toNumber(lead.following_count)}
                  icon={<UserOutlined />}
                />
              ) : null}
              {hasValue(lead.total_posts) ? (
                <InfoItem
                  label={
                    <FormattedMessage
                      id="leads.linkedIn_view.total_posts"
                      defaultMessage="Total Posts"
                    />
                  }
                  value={toNumber(lead.total_posts)}
                  icon={<ProfileOutlined />}
                />
              ) : null}
              {hasValue(lead.category) ? (
                <InfoItem
                  label={
                    <FormattedMessage
                      id="leads.table.category"
                      defaultMessage="Category"
                    />
                  }
                  value={toDisplay(lead.category)}
                  icon={<InfoCircleOutlined />}
                />
              ) : null}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
