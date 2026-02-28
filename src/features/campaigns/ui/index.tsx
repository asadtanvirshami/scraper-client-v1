import { useUserInfo } from "@/helpers/use-user";
import { useCampaigns } from "../hooks";
import { useState } from "react";
import {
  Card,
  Empty,
  Spin,
  Button,
  Input,
  Select,
  Row,
  Col,
  Space,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import CampaignCard from "./campaign-card";
import { useIntl } from "react-intl";

const { Option } = Select;

const STATUS_OPTIONS = [
  "DRAFT",
  "SCHEDULED",
  "SENDING",
  "SENT",
  "PAUSED",
  "CANCELLED",
];

const CampaignsDashboard = () => {
  const { id } = useUserInfo();
  const router = useRouter();
  const { formatMessage } = useIntl();

  const t = (key: string) => formatMessage({ id: key });

  const [searchValue, setSearchValue] = useState("");

  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    user_id: id ?? "",
    search: "",
    status: "",
  });

  const { data, isLoading, isError } = useCampaigns(query);

  const handleSearch = () => {
    setQuery((prev) => ({
      ...prev,
      search: searchValue,
      page: 1,
    }));
  };

  const handleStatusChange = (value: string) => {
    setQuery((prev) => ({
      ...prev,
      status: value || "",
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    setSearchValue("");
    setQuery((prev) => ({
      ...prev,
      search: "",
      status: "",
      page: 1,
    }));
  };

  const hasActiveFilters = query.search || query.status;

  if (isLoading) return <Spin />;
  if (isError) return <div>{t("campaigns.dashboard.error")}</div>;

  return (
    <div>
      <Card
        title={t("campaigns.dashboard.title")}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push("/campaigns/create")}
            style={{ borderRadius: 8 }}
          >
            {t("campaigns.dashboard.create")}
          </Button>
        }
      >
        {/* 🔎 Filters */}
        <Row gutter={12} style={{ marginBottom: 20 }} align="middle">
          <Col xs={24} md={14}>
            <Space.Compact style={{ width: "30%", marginRight: 12 }}>
              <Input
                placeholder={t("campaigns.dashboard.search_placeholder")}
                prefix={<SearchOutlined />}
                allowClear
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onPressEnter={handleSearch}
              />
              <Button type="primary" onClick={handleSearch}>
                {t("commons.search") || "Search"}
              </Button>
            </Space.Compact>

            <Select
              placeholder={t("campaigns.dashboard.filter_status")}
              allowClear
              style={{ width: "25%" }}
              onChange={handleStatusChange}
              value={query.status || undefined}
            >
              {STATUS_OPTIONS.map((status) => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>
          </Col>

          {hasActiveFilters && (
            <Col xs={24} md={4}>
              <Button
                icon={<CloseCircleOutlined />}
                onClick={handleClearFilters}
                style={{ width: "100%" }}
              >
                Clear Filters
              </Button>
            </Col>
          )}
        </Row>

        {/* 📭 Empty State */}
        {!data?.data || data.data.length === 0 ? (
          <Empty description={t("campaigns.dashboard.empty")} />
        ) : (
          data.data.map((campaign: any) => (
            <CampaignCard key={campaign._id} data={campaign} />
          ))
        )}
      </Card>
    </div>
  );
};

export default CampaignsDashboard;
