"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Alert,
  Switch,
} from "antd";
import {
  InstagramOutlined,
  LoadingOutlined,
  TwitterOutlined,
} from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";

import { useUserInfo } from "@/helpers/use-user";
import { useFetchFolders } from "@/features/folders/hooks/queries";
import { useScrapeFollowersOrFollowing } from "@/features/scraper/hooks";
import { useFetchLeadsList } from "../../hooks/queries";
import LeadsTableServer from "../lead-table";

const { Title, Text } = Typography;
const { Option } = Select;

type AnalyzerPlatform = "instagram" | "twitter";

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
  const PlatformIcon = isTwitter ? TwitterOutlined : InstagramOutlined;
  const titleText = isTwitter ? "Twitter (X) Analyzer" : "Instagram Analyzer";
  const subtitleText = isTwitter
    ? "Scrape followers or following from any Twitter (X) account"
    : "Scrape followers or following from any Instagram account";
  const usernameLabel = isTwitter ? "Twitter Username" : "Instagram Username";
  const usernamePlaceholder = isTwitter ? "e.g., elonmusk" : "e.g., filmdirectorbrucemac";

  const [scrapeQuery, setScrapeQuery] = useState({
    page: 1,
    limit: 10,
    search: "",
    has_contacts: false,
    type: "INSTAGRAM" as string,
  });

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [scrapedUsername, setScrapedUsername] = useState<string | null>(null);

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
    scrape_status: false,
    scraped_from_username: scrapedUsername || undefined,
    has_contacts: scrapeQuery.has_contacts || undefined,
  });

  const scrapeMutation = useScrapeFollowersOrFollowing();

  useEffect(() => {
    if (scrapedUsername && selectedFolderId) {
      setScrapeQuery((prev) => ({
        ...prev,
        page: 1,
      }));
      refetchLeads();
    }
  }, [scrapedUsername, selectedFolderId, refetchLeads]);

  const handleSubmit = async (values: any) => {
    try {
      const username = String(values.username || "").trim().replace(/^@+/, "");
      await scrapeMutation.mutateAsync({
        user_id: id ?? "",
        folder_id: values.folder_id,
        username,
        type: values.type,
        max_limit: values.max_limit,
      });

      setSelectedFolderId(values.folder_id);
      setScrapedUsername(username);
    } catch (error) {
      console.error("Scraping error:", error);
    }
  };

  return (
    <div className={compact ? "" : "p-4 lg:p-6"}>
      <div className="mb-4">
        <Title level={4} className="!mb-1">
          <PlatformIcon className="mr-2" />
          {titleText}
        </Title>
        <Text type="secondary">{subtitleText}</Text>
      </div>

      <Row gutter={[16, 16]}>
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
          >
            <Alert
              type="info"
              message={
                <FormattedMessage
                  id="leads.instagram_analyzer.info"
                  defaultMessage="Scraping may take several minutes depending on the number of accounts. Results will appear in the table below."
                />
              }
              className="mb-4"
              showIcon
            />

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                type: defaultType,
                max_limit: 1000,
              }}
            >
              <Row gutter={16}>
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

                <Col xs={24} md={12} lg={6}>
                  <Form.Item
                    label={
                      <FormattedMessage
                        id="leads.instagram_analyzer.form.max_limit"
                        defaultMessage="Max Limit"
                      />
                    }
                    name="max_limit"
                    rules={[
                      {
                        required: true,
                        message: intl.formatMessage({
                          id: "leads.instagram_analyzer.form.max_limit.required",
                          defaultMessage: "Please enter a limit",
                        }),
                      },
                      {
                        type: "number",
                        min: 1,
                        max: 10000,
                        message: intl.formatMessage({
                          id: "leads.instagram_analyzer.form.max_limit.range",
                          defaultMessage: "Limit must be between 1 and 10,000",
                        }),
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={1}
                      max={10000}
                      placeholder="3000"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={
                    scrapeMutation.isPending ? <LoadingOutlined /> : <PlatformIcon />
                  }
                  loading={scrapeMutation.isPending}
                  size="large"
                >
                  <FormattedMessage
                    id="leads.instagram_analyzer.form.submit"
                    defaultMessage="Start Scraping"
                  />
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

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
                loading={leadsFetching}
                value={scrapeQuery}
                onFetch={(next) => setScrapeQuery(next as any)}
                showFilters={true}
                showFileUpload={false}
                showProfileAvatar={showProfileAvatar}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default InstagramAnalyzer;
