"use client";

import {
  Card,
  Typography,
  Button,
  Form,
  Input,
  Space,
  message,
  Modal,
  List,
  Tag,
  Empty,
  Spin,
} from "antd";
import { FormattedMessage, useIntl } from "react-intl";
import { useUserInfo } from "@/helpers/use-user";
import { useCreateBug } from "../../hooks";
import { useBugsList } from "@/features/bugs/hooks";
import { useState } from "react";
import { BugOutlined } from "@ant-design/icons";
import moment from "moment";

const { Text, Title } = Typography;

const MAX_LEN = 1000;

const SupportTabContent = () => {
  const intl = useIntl();
  const { id: user_id } = useUserInfo();

  const [bugForm] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const createBug = useCreateBug();
  const { bugs, isLoading, refetch } = useBugsList();

  const submitBug = async () => {
    try {
      const values = await bugForm.validateFields();
      await createBug.mutateAsync({
        user_id: user_id as any,
        bug: values.bug.trim(),
      });

      message.success(intl.formatMessage({ id: "support.bug.success" }));
      bugForm.resetFields();
      setIsModalOpen(false);
      refetch();
    } catch (e: any) {
      if (e?.errorFields) return; // antd validation
      message.error(intl.formatMessage({ id: "support.bug.fail" }));
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "open":
        return "red";
      case "in_progress":
        return "orange";
      case "resolved":
        return "green";
      default:
        return "default";
    }
  };

  const getStatusText = (status?: string) => {
    return status?.toUpperCase().replace("_", " ") || "OPEN";
  };

  return (
    <>
      <Card className="w-full">
        <div style={{ marginBottom: 24 }}>
          <Title level={4} className="!mb-2">
            <FormattedMessage
              id="support.bug.title"
              defaultMessage="Bug Reports"
            />
          </Title>
          <Text type="secondary">
            <FormattedMessage
              id="support.bug.description"
              defaultMessage="Report any issues or bugs you encounter"
            />
          </Text>
        </div>

        <Button
          type="primary"
          icon={<BugOutlined />}
          onClick={() => setIsModalOpen(true)}
          size="large"
          style={{ marginBottom: 24 }}
        >
          <FormattedMessage
            id="support.bug.report_button"
            defaultMessage="Report a Bug"
          />
        </Button>

        {/* Bug Reports List */}
        <div>
          <Title level={5} className="!mb-3">
            <FormattedMessage
              id="support.bug.your_reports"
              defaultMessage="Your Reports"
            />
          </Title>

          {isLoading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Spin />
            </div>
          ) : bugs.length === 0 ? (
            <Empty
              description={
                <FormattedMessage
                  id="support.bug.no_reports"
                  defaultMessage="No bug reports yet"
                />
              }
            />
          ) : (
            <List
              dataSource={bugs}
              renderItem={(bug) => (
                <List.Item
                  key={bug._id}
                  style={{
                    padding: "16px",
                    marginBottom: "8px",
                    border: "1px solid #f0f0f0",
                    borderRadius: "8px",
                  }}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Tag color={getStatusColor(bug.status)}>
                          {getStatusText(bug.status)}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {moment(bug.createdAt).fromNow()}
                        </Text>
                      </Space>
                    }
                    description={
                      <Text style={{ whiteSpace: "pre-wrap" }}>{bug.bug}</Text>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      </Card>

      {/* Bug Report Modal */}
      <Modal
        title={
          <FormattedMessage
            id="support.bug.modal_title"
            defaultMessage="Report a Bug"
          />
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          bugForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={bugForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="bug"
            label={
              <FormattedMessage
                id="support.bug.field"
                defaultMessage="Describe the bug"
              />
            }
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: "support.bug.required" }),
              },
              {
                max: MAX_LEN,
                message: intl.formatMessage(
                  { id: "support.max_length" },
                  { max: MAX_LEN },
                ),
              },
            ]}
          >
            <Input.TextArea
              rows={8}
              showCount
              maxLength={MAX_LEN}
              placeholder={intl.formatMessage({
                id: "support.bug.placeholder",
              })}
            />
          </Form.Item>

          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button
              onClick={() => {
                setIsModalOpen(false);
                bugForm.resetFields();
              }}
            >
              <FormattedMessage id="commons.cancel" defaultMessage="Cancel" />
            </Button>
            <Button
              type="primary"
              onClick={submitBug}
              loading={createBug.isPending}
              disabled={createBug.isPending}
            >
              <FormattedMessage
                id="support.bug.submit"
                defaultMessage="Submit"
              />
            </Button>
          </Space>
        </Form>
      </Modal>
    </>
  );
};

export default SupportTabContent;
