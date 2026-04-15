"use client";

import React from "react";
import { Form, Input, Button, Space } from "antd";
import { useIntl } from "react-intl";

interface Step2FormProps {
  onSubmit: (data: { business_name?: string; business_website?: string }) => void;
  onPrev: () => void;
  initialData: { business_name?: string; business_website?: string };
}

const Step2Form: React.FC<Step2FormProps> = ({ onSubmit, onPrev, initialData }) => {
  const intl = useIntl();
  const [form] = Form.useForm();

  const handleSubmit = (values: { business_name: string; business_website: string }) => {
    onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={initialData}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">
          {intl.formatMessage({
            id: "onboarding.step2.question",
            defaultMessage: "Tell us about your business",
          })}
        </h2>
        <p className="text-gray-600">
          {intl.formatMessage({
            id: "onboarding.step2.description",
            defaultMessage: "Help us personalize your experience.",
          })}
        </p>
      </div>

      <Form.Item
        name="business_name"
        label={intl.formatMessage({
          id: "onboarding.step2.business_name",
          defaultMessage: "Business Name",
        })}
        rules={[
          {
            min: 2,
            message: intl.formatMessage({
              id: "onboarding.step2.business_name_min",
              defaultMessage: "Business name must be at least 2 characters",
            }),
          },
        ]}
      >
        <Input
          size="large"
          placeholder={intl.formatMessage({
            id: "onboarding.step2.business_name_placeholder",
            defaultMessage: "Enter your business name",
          })}
        />
      </Form.Item>

      <Form.Item
        name="business_website"
        label={intl.formatMessage({
          id: "onboarding.step2.business_website",
          defaultMessage: "Business Website",
        })}
        rules={[
          {
            pattern: /^https?:\/\/.+/,
            message: intl.formatMessage({
              id: "onboarding.step2.business_website_invalid",
              defaultMessage: "Please enter a valid website URL (starting with http:// or https://)",
            }),
          },
        ]}
      >
        <Input
          size="large"
          placeholder={intl.formatMessage({
            id: "onboarding.step2.business_website_placeholder",
            defaultMessage: "https://yourwebsite.com",
          })}
        />
      </Form.Item>

      <div className="flex justify-between pt-4">
        <Button
          size="large"
          onClick={onPrev}
          className="px-8"
        >
          {intl.formatMessage({
            id: "onboarding.previous",
            defaultMessage: "Previous",
          })}
        </Button>
        <Space>
          <Button
            size="large"
            onClick={() => onSubmit({})}
            className="px-8"
          >
            {intl.formatMessage({
              id: "onboarding.skip",
              defaultMessage: "Skip",
            })}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className="px-8"
          >
            {intl.formatMessage({
              id: "onboarding.complete",
              defaultMessage: "Complete Setup",
            })}
          </Button>
        </Space>
      </div>
    </Form>
  );
};

export default Step2Form;