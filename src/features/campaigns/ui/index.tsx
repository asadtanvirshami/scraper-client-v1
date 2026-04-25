"use client";

import { useUserInfo } from "@/helpers/use-user";
import { useCampaigns, useCampaignStats } from "../hooks";
import { useState } from "react";
import {
  Button,
  Card,
  Col,
  Empty,
  Input,
  Pagination,
  Row,
  Select,
  Skeleton,
  Space,
  Statistic,
  Tag,
  theme,
  Typography,
} from "antd";
import {
  BarChartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MailOutlined,
  PlusOutlined,
  SearchOutlined,
  SendOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import CampaignCard from "./campaign-card";
import { useIntl } from "react-intl";

const { Option } = Select;
const { Title, Text } = Typography;

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft", color: "default" },
  { value: "SCHEDULED", label: "Scheduled", color: "processing" },
  { value: "SENDING", label: "Sending", color: "warning" },
  { value: "SENT", label: "Sent", color: "success" },
  { value: "PAUSED", label: "Paused", color: "purple" },
  { value: "CANCELLED", label: "Cancelled", color: "error" },
] as const;

const StatCard = ({
  icon,
  title,
  value,
  suffix,
  color,
  loading,
}: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  suffix?: string;
  color: string;
  loading: boolean;
}) => {
  const { token } = theme.useToken();
  return (
    <Card
      style={{
        borderRadius: 12,
        border: `1px solid ${token.colorBorderSecondary}`,
        height: "100%",
      }}
      bodyStyle={{ padding: "16px 20px" }}
    >
      <div className="flex items-center gap-3">
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: `${color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
            {title}
          </Text>
          {loading ? (
            <Skeleton.Input active size="small" style={{ width: 60, height: 22, marginTop: 2 }} />
          ) : (
            <Statistic
              value={value}
              suffix={suffix}
              valueStyle={{ fontSize: 20, fontWeight: 700, lineHeight: "1.2" }}
            />
          )}
        </div>
      </div>
    </Card>
  );
};

const CampaignsDashboard = () => {
  const { id } = useUserInfo();
  const router = useRouter();
  const { formatMessage } = useIntl();
  const { token } = theme.useToken();

  const t = (key: string) => formatMessage({ id: key });

  const [searchValue, setSearchValue] = useState("");
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    user_id: id ?? "",
    search: "",
    status: "",
  });

  const { data, isLoading } = useCampaigns(query);
  const { data: statsData, isLoading: statsLoading } = useCampaignStats({
    user_id: id ?? "",
  });

  const campaigns: any[] = data?.data ?? [];
  const stats = (statsData as any)?.data ?? {};
  const pagination = (data as any)?.pagination ?? {};

  const handleSearch = () =>
    setQuery((prev) => ({ ...prev, search: searchValue, page: 1 }));

  const handleStatusChange = (value: string) =>
    setQuery((prev) => ({ ...prev, status: value || "", page: 1 }));

  const handleClearFilters = () => {
    setSearchValue("");
    setQuery((prev) => ({ ...prev, search: "", status: "", page: 1 }));
  };

  const hasActiveFilters = query.search || query.status;

  return (
    <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <Title level={3} className="!mb-1">
            <MailOutlined style={{ marginRight: 10, color: token.colorPrimary }} />
            Campaigns
          </Title>
          <Text type="secondary">
            Manage your email campaigns, track opens and clicks.
          </Text>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => router.push("/campaigns/create")}
          style={{
            borderRadius: 10,
            background: "linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%)",
            border: "none",
            boxShadow: "0 4px 12px rgba(139,92,246,0.35)",
          }}
        >
          New Campaign
        </Button>
      </div>

      {/* Stats Row */}
      <Row gutter={[12, 12]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <StatCard
            icon={<BarChartOutlined />}
            title="Total Campaigns"
            value={stats.total_campaigns ?? 0}
            color="#8b5cf6"
            loading={statsLoading}
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            icon={<TeamOutlined />}
            title="Total Recipients"
            value={stats.total_recipients ?? 0}
            color="#0ea5e9"
            loading={statsLoading}
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            icon={<SendOutlined />}
            title="Emails Sent"
            value={stats.total_sent ?? 0}
            color="#22c55e"
            loading={statsLoading}
          />
        </Col>
        <Col xs={12} sm={6}>
          <StatCard
            icon={<CheckCircleOutlined />}
            title="Delivery Rate"
            value={
              stats.total_recipients > 0
                ? Math.round((stats.total_sent / stats.total_recipients) * 100)
                : 0
            }
            suffix="%"
            color="#f59e0b"
            loading={statsLoading}
          />
        </Col>
      </Row>

      {/* Filter Bar */}
      <Card
        style={{ borderRadius: 12, marginBottom: 20, border: `1px solid ${token.colorBorderSecondary}` }}
        bodyStyle={{ padding: "12px 16px" }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={10}>
            <Space.Compact style={{ width: "100%" }}>
              <Input
                placeholder={t("campaigns.dashboard.search_placeholder") || "Search campaigns…"}
                prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
                allowClear
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onPressEnter={handleSearch}
              />
              <Button type="primary" onClick={handleSearch}>
                Search
              </Button>
            </Space.Compact>
          </Col>

          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Filter by status"
              allowClear
              style={{ width: "100%" }}
              onChange={handleStatusChange}
              value={query.status || undefined}
            >
              {STATUS_OPTIONS.map((s) => (
                <Option key={s.value} value={s.value}>
                  <Tag color={s.color} style={{ marginRight: 6, borderRadius: 4 }}>
                    {s.label}
                  </Tag>
                </Option>
              ))}
            </Select>
          </Col>

          {hasActiveFilters && (
            <Col xs={24} sm={4} md={3}>
              <Button
                icon={<CloseCircleOutlined />}
                onClick={handleClearFilters}
                style={{ width: "100%" }}
              >
                Clear
              </Button>
            </Col>
          )}
        </Row>
      </Card>

      {/* Campaign List */}
      {isLoading ? (
        <Row gutter={[16, 16]}>
          {[1, 2, 3].map((i) => (
            <Col key={i} xs={24} md={12} lg={8}>
              <Skeleton active paragraph={{ rows: 5 }} style={{ borderRadius: 12 }} />
            </Col>
          ))}
        </Row>
      ) : campaigns.length === 0 ? (
        <Card
          style={{ borderRadius: 12, border: `1px solid ${token.colorBorderSecondary}` }}
          bodyStyle={{ padding: "60px 24px", textAlign: "center" }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="space-y-2">
                <Text style={{ fontSize: 16, fontWeight: 500, display: "block" }}>
                  {hasActiveFilters ? "No campaigns match your filters" : "No campaigns yet"}
                </Text>
                <Text type="secondary">
                  {hasActiveFilters
                    ? "Try clearing your filters to see all campaigns."
                    : "Create your first email campaign to start reaching your leads."}
                </Text>
              </div>
            }
          >
            {!hasActiveFilters && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => router.push("/campaigns/create")}
                size="large"
                style={{
                  marginTop: 12,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #8b5cf6 0%, #c084fc 100%)",
                  border: "none",
                }}
              >
                Create First Campaign
              </Button>
            )}
          </Empty>
        </Card>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {campaigns.map((campaign: any) => (
              <Col key={campaign._id} xs={24} md={12} lg={8}>
                <CampaignCard data={campaign} />
              </Col>
            ))}
          </Row>

          {pagination.total > query.limit && (
            <div className="flex justify-center mt-6">
              <Pagination
                current={pagination.page ?? query.page}
                total={pagination.total ?? 0}
                pageSize={query.limit}
                onChange={(page) => setQuery((prev) => ({ ...prev, page }))}
                showSizeChanger={false}
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total}`}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CampaignsDashboard;

