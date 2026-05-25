"use client";

import React from "react";
import { Form, Radio, Button } from "antd";
import { useIntl } from "react-intl";

interface Step1FormProps {
  onSubmit: (data: { heard_about: string }) => void;
  initialData: { heard_about?: string };
}

const Step1Form: React.FC<Step1FormProps> = ({ onSubmit, initialData }) => {
  const intl = useIntl();
  const [form] = Form.useForm();

  const options = [
    {
      value: "mouth/word",
      label: intl.formatMessage({
        id: "onboarding.step1.option.word_of_mouth",
        defaultMessage: "Word of mouth",
      }),
    },
    {
      value: "instagram",
      label: "Instagram",
    },
    {
      value: "linkedin",
      label: "LinkedIn",
    },
    {
      value: "facebook",
      label: "Facebook",
    },
    {
      value: "github",
      label: "GitHub",
    },
  ];

  const handleSubmit = (values: { heard_about: string }) => {
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
            id: "onboarding.step1.question",
            defaultMessage: "How did you hear about DataHarvX?",
          })}
        </h2>
        <p className="text-gray-600 dark:text-white/60">
          {intl.formatMessage({
            id: "onboarding.step1.description",
            defaultMessage: "Help us understand how you found us.",
          })}
        </p>
      </div>

      <Form.Item
        name="heard_about"
        rules={[
          {
            required: true,
            message: intl.formatMessage({
              id: "onboarding.step1.validation.required",
              defaultMessage: "Please select how you heard about us",
            }),
          },
        ]}
      >
        <Radio.Group className="w-full">
          <div className="grid grid-cols-1 gap-3">
            {options.map((option) => (
              <div
                key={option.value}
                className="rounded-lg border border-gray-200 p-4 transition-colors hover:border-violet-400 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-violet-300"
              >
                <Radio value={option.value} className="w-full">
                  <span className="text-base">{option.label}</span>
                </Radio>
              </div>
            ))}
          </div>
        </Radio.Group>
      </Form.Item>

      <div className="flex justify-end">
        <Button
          type="primary"
          htmlType="submit"
          size="large"
          className="px-8"
        >
          {intl.formatMessage({
            id: "onboarding.next",
            defaultMessage: "Next",
          })}
        </Button>
      </div>
    </Form>
  );
};

export default Step1Form;
