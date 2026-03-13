"use client";

import {
  Avatar,
  Card,
  Col,
  Divider,
  Empty,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  ApartmentOutlined,
  GlobalOutlined,
  IdcardOutlined,
  InfoCircleOutlined,
  MailOutlined,
  NumberOutlined,
  PhoneOutlined,
  PictureOutlined,
  ProfileOutlined,
  LinkOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { FormattedMessage } from "react-intl";

import Spinner from "@/components/ui (generic)/spinner";
import { useUserInfo } from "@/helpers/use-user";
import { useFetchLeadsList } from "@/features/leads/hooks/queries";
import LinkedInLeadView from "./components/LinkedInLeadView";

const { Title, Text } = Typography;

type Props = {
  leadId: string;
  queryType?: string;
};

type LeadTypeLabel = "Instagram" | "LinkedIn" | "Manual";

const toTypeLabel = (raw?: string): LeadTypeLabel => {
  const value = String(raw || "").toUpperCase();
  if (value === "INSTAGRAM") return "Instagram";
  if (value === "LINKEDIN") return "LinkedIn";
  return "Manual";
};

const toDisplay = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  if (Array.isArray(value)) {
    if (!value.length) return "-";
    return value.join(", ");
  }
  if (typeof value === "object") return JSON.stringify(value);
  const text = String(value).trim();
  return text ? text : "-";
};

const toNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toLocaleString();
  }
  return "-";
};

const hasNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value);

const renderBoolTag = (value: unknown) => {
  if (typeof value !== "boolean") return <Tag>-</Tag>;
  return value ? <Tag>Yes</Tag> : <Tag>No</Tag>;
};

const renderLink = (value: unknown) => {
  const text = toDisplay(value);
  if (text === "-") return "-";

  return (
    <a href={text} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
      <LinkOutlined />
      <span className="truncate max-w-[340px]">{text}</span>
    </a>
  );
};

function InfoItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl p-3">
      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide leading-none">
        {icon ? <span className="inline-flex shrink-0 text-sm">{icon}</span> : null}
        <span className="leading-none">{label}</span>
      </div>
      <div className="mt-2 text-sm break-words leading-6">{value}</div>
    </div>
  );
}

function StatTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl px-4 py-3">
      <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wide leading-none">
        {icon ? <span className="inline-flex shrink-0 text-sm">{icon}</span> : null}
        <span className="leading-none">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold leading-none">{value}</div>
    </div>
  );
}

export default function LeadParamsLayout({ leadId, queryType }: Props) {
  const { id: userId } = useUserInfo();

  const { data: leadResp, isLoading, isFetching } = useFetchLeadsList({
    user_id: userId ?? "",
    _id: leadId,
    limit: 1,
    page: 1,
  } as any);

  const lead = (leadResp as any)?.data?.[0];
  const type = toTypeLabel(queryType || lead?.type);
  const isInstagram = type === "Instagram";

  if ((isLoading || isFetching) && !lead) {
    return <Spinner size="large" />;
  }

  if (!lead) {
    return (
      <div className="p-4 lg:p-6">
        <Card>
          <Empty
            description={
              <FormattedMessage id="leads.empty" defaultMessage="No leads yet" />
            }
          />
        </Card>
      </div>
    );
  }

  if (type === "LinkedIn") {
    return <LinkedInLeadView lead={lead} leadId={leadId} />;
  }

  const displayName =
    toDisplay(lead.full_name) !== "-"
      ? toDisplay(lead.full_name)
      : `${toDisplay(lead.first_name)} ${toDisplay(lead.last_name)}`.replace(
          /-\s|-|\s+/g,
          " ",
        ).trim() || "Lead";

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <Card
        className="overflow-hidden"
        styles={{ body: { padding: 0 } }}
      >
        <div className="p-5">
          <Space align="center" size={16}>
            <Avatar
              size={72}
              src={lead.avatar_url || lead.avatar_rul}
              icon={<UserOutlined />}
            />
            <div>
              <Title level={4} className="!mb-1">
                {displayName}
              </Title>
              <Space wrap>
                <Tag>{type}</Tag>
                <Tag icon={<SafetyCertificateOutlined />}>
                  {lead.is_converted ? "Converted" : "New"}
                </Tag>
                <Tag icon={<GlobalOutlined />}>
                  ID: {leadId}
                </Tag>
              </Space>
              <div className="mt-3 flex flex-wrap gap-2">
                <Tag icon={<SafetyCertificateOutlined />}>
                  Private: {typeof lead.is_private === "boolean" ? (lead.is_private ? "Yes" : "No") : "-"}
                </Tag>
                <Tag icon={<SafetyCertificateOutlined />}>
                  Verified: {typeof lead.is_verified === "boolean" ? (lead.is_verified ? "Yes" : "No") : "-"}
                </Tag>
                <Tag icon={<SafetyCertificateOutlined />}>
                  Public: {typeof lead.is_public === "boolean" ? (lead.is_public ? "Yes" : "No") : "-"}
                </Tag>
              </div>
            </div>
          </Space>
        </div>

        <div className="grid grid-cols-2 gap-2 p-4 sm:gap-3 md:grid-cols-4">
          <StatTile
            label="Followers"
            value={toNumber(lead.followers ?? lead.follower_count)}
            icon={<TeamOutlined />}
          />
          <StatTile
            label="Following"
            value={toNumber(lead.following ?? lead.following_count)}
            icon={<UserOutlined />}
          />
          {hasNumber(lead.total_posts) ? (
            <StatTile
              label="Total Posts"
              value={toNumber(lead.total_posts)}
              icon={<ProfileOutlined />}
            />
          ) : null}
          <StatTile
            label="Reels"
            value={toNumber(lead.highlight_reel_count)}
            icon={<PictureOutlined />}
          />
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Profile">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InfoItem label="First Name" value={toDisplay(lead.first_name)} icon={<UserOutlined />} />
              <InfoItem label="Last Name" value={toDisplay(lead.last_name)} icon={<UserOutlined />} />
              <InfoItem label="Full Name" value={toDisplay(lead.full_name)} icon={<IdcardOutlined />} />
              <InfoItem label="Username" value={toDisplay(lead.username)} icon={<UserOutlined />} />
              <InfoItem label="Email" value={toDisplay(lead.emails)} icon={<MailOutlined />} />
              <InfoItem label="Phone" value={toDisplay(lead.phone_numbers)} icon={<PhoneOutlined />} />
              <InfoItem label="Company" value={toDisplay(lead.company)} icon={<ApartmentOutlined />} />
              <InfoItem label="Job Title" value={toDisplay(lead.job_title)} icon={<ProfileOutlined />} />
              <InfoItem label="Category" value={toDisplay(lead.category)} icon={<InfoCircleOutlined />} />
              <InfoItem label="Instagram Profile ID" value={toDisplay(lead.instagram_profile_id)} icon={<NumberOutlined />} />
            </div>
            <Divider />
            <InfoItem label="Bio" value={toDisplay(lead.bio)} icon={<InfoCircleOutlined />} />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Source & Visibility">
            <div className="grid grid-cols-1 gap-3">
              <InfoItem label="Source URL" value={renderLink(lead.source_url)} icon={<GlobalOutlined />} />
              <InfoItem label="Source RUL" value={renderLink(lead.source_rul)} icon={<GlobalOutlined />} />
              <InfoItem label="Avatar URL" value={renderLink(lead.avatar_url)} icon={<PictureOutlined />} />
              <InfoItem label="Avatar RUL" value={renderLink(lead.avatar_rul)} icon={<PictureOutlined />} />
              <InfoItem label="External URL" value={renderLink(lead.external_url)} icon={<LinkOutlined />} />
              <InfoItem
                label="External URL Linkshimmed"
                value={renderLink(lead.external_url_linkshimmed)}
                icon={<LinkOutlined />}
              />
            </div>
          </Card>
        </Col>

        {isInstagram ? (
          <Col xs={24}>
            <Card title="Instagram Deep Data">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                <InfoItem label="Followers" value={toNumber(lead.followers)} icon={<TeamOutlined />} />
                <InfoItem label="Following" value={toNumber(lead.following)} icon={<UserOutlined />} />
                <InfoItem label="Follower Count" value={toNumber(lead.follower_count)} icon={<TeamOutlined />} />
                <InfoItem label="Following Count" value={toNumber(lead.following_count)} icon={<UserOutlined />} />
                {hasNumber(lead.total_posts) ? (
                  <InfoItem label="Total Posts" value={toNumber(lead.total_posts)} icon={<ProfileOutlined />} />
                ) : null}
                <InfoItem label="Highlight Reel Count" value={toNumber(lead.highlight_reel_count)} icon={<PictureOutlined />} />
                <InfoItem label="FB BioLink URL" value={renderLink(lead.fb_profile_biolink?.url)} icon={<LinkOutlined />} />
                <InfoItem label="FB BioLink Name" value={toDisplay(lead.fb_profile_biolink?.name)} icon={<InfoCircleOutlined />} />
                <InfoItem label="External URLs" value={toDisplay(lead.external_urls)} icon={<GlobalOutlined />} />
              </div>

              <Divider />

              <div>
                <Text strong>Links</Text>
                <div className="mt-2 space-y-2">
                  {Array.isArray(lead.links) && lead.links.length ? (
                    lead.links.map((item, index) => (
                      <div
                        key={`${item?.url || "link"}-${index}`}
                        className="rounded-xl p-3"
                      >
                        <div className="font-medium">{toDisplay(item?.title)}</div>
                        <div className="text-sm">{toDisplay(item?.subtitle)}</div>
                        <div className="mt-1">{renderLink(item?.url)}</div>
                        <div className="mt-1">{renderLink(item?.lynx_url)}</div>
                        <div className="mt-2">
                          <Tag>{toDisplay(item?.link_type)}</Tag>
                        </div>
                      </div>
                    ))
                  ) : (
                    <Text type="secondary">-</Text>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        ) : null}
      </Row>
    </div>
  );
}
