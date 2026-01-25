"use client";

import { Card, Typography, Button, Form, Input, Space, message } from "antd";
import { FormattedMessage, useIntl } from "react-intl";
import { useUserInfo } from "@/helpers/use-user";
import { useCreateBug, useCreateFeedback } from "../../hooks";

const { Text, Title } = Typography;

const MAX_LEN = 1000;

const SupportTabContent = () => {
  const intl = useIntl();
  const { id: user_id } = useUserInfo();

  const [bugForm] = Form.useForm();
  const [feedbackForm] = Form.useForm();

  const createBug = useCreateBug();
  const createFeedback = useCreateFeedback();

  const submitBug = async () => {
    try {
      const values = await bugForm.validateFields();
      await createBug.mutateAsync({
        user_id,
        bug: values.bug.trim(),
      });

      message.success(intl.formatMessage({ id: "support.bug.success" }));
      bugForm.resetFields();
    } catch (e: any) {
      if (e?.errorFields) return; // antd validation
      message.error(intl.formatMessage({ id: "support.bug.fail" }));
    }
  };

  const submitFeedback = async () => {
    try {
      const values = await feedbackForm.validateFields();
      await createFeedback.mutateAsync({
        user_id,
        feedback: values.feedback.trim(),
      });

      message.success(intl.formatMessage({ id: "support.feedback.success" }));
      feedbackForm.resetFields();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error(intl.formatMessage({ id: "support.feedback.fail" }));
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* ✅ Report a bug */}
      <Card className="w-full">
        <Title level={4} className="!mb-1">
          <FormattedMessage id="support.bug.title" />
        </Title>
        <Text type="secondary">
          <FormattedMessage id="support.bug.description" />
        </Text>

        <Form form={bugForm} layout="vertical" className="mt-4">
          <Form.Item
            name="bug"
            label={<FormattedMessage id="support.bug.field" />}
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
              rows={6}
              showCount
              maxLength={MAX_LEN}
              placeholder={intl.formatMessage({ id: "support.bug.placeholder" })}
            />
          </Form.Item>

          <Space>
            <Button
              type="primary"
              onClick={submitBug}
              loading={createBug.isPending}
              disabled={createBug.isPending}
            >
              <FormattedMessage id="support.bug.submit" />
            </Button>
            <Button onClick={() => bugForm.resetFields()} disabled={createBug.isPending}>
              <FormattedMessage id="commons.clear" defaultMessage="Clear" />
            </Button>
          </Space>
        </Form>
      </Card>

      {/* ✅ Send feedback */}
      <Card className="w-full">
        <Title level={4} className="!mb-1">
          <FormattedMessage id="support.feedback.title" />
        </Title>
        <Text type="secondary">
          <FormattedMessage id="support.feedback.description" />
        </Text>

        <Form form={feedbackForm} layout="vertical" className="mt-4">
          <Form.Item
            name="feedback"
            label={<FormattedMessage id="support.feedback.field" />}
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: "support.feedback.required" }),
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
              rows={6}
              showCount
              maxLength={MAX_LEN}
              placeholder={intl.formatMessage({
                id: "support.feedback.placeholder",
              })}
            />
          </Form.Item>

          <Space>
            <Button
              type="primary"
              onClick={submitFeedback}
              loading={createFeedback.isPending}
              disabled={createFeedback.isPending}
            >
              <FormattedMessage id="support.feedback.submit" />
            </Button>
            <Button
              onClick={() => feedbackForm.resetFields()}
              disabled={createFeedback.isPending}
            >
              <FormattedMessage id="commons.clear" defaultMessage="Clear" />
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default SupportTabContent;