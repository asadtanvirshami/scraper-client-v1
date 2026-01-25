"use client";

import React, { useEffect } from "react";
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Switch,
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { useIntl, FormattedMessage } from "react-intl";
import type { Lead } from "@/types";
import { useUserInfo } from "@/helpers/use-user";

type Mode = "create" | "view" | "edit";

type Props = {
  mode: Mode;
  initialValues?: Partial<Lead>;
  onSubmit?: (values: any) => Promise<void> | void;
  onClose?: () => void;
};

const LeadForm: React.FC<Props> = ({
  mode,
  initialValues,
  onSubmit,
  onClose,
}) => {
  const [form] = Form.useForm();
  const intl = useIntl();
  const {id} = useUserInfo()
  const isView = mode === "view";

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        emails: initialValues.emails?.length
          ? initialValues.emails
          : [""],
        phones: initialValues.phone_numbers?.length
          ? initialValues.phone_numbers
          : [""],
      });
    }
  }, [initialValues, form]);

  const handleFinish = async (values: any) => {
    // Clean empty items
    const payload = {
      ...values,
      emails: (values.emails || []).filter(Boolean),
      phones: (values.phones || []).filter(Boolean),
      scrape_status: true,
      user_id:id
    };

    if (onSubmit) {
      await onSubmit(payload);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      disabled={isView}
    >
      {/* NAME */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="first_name"
            label={<FormattedMessage id="leads.form.first_name" />}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="last_name"
            label={<FormattedMessage id="leads.form.last_name" />}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>

      {/* EMAILS[] */}
      <Form.Item
        label={<FormattedMessage id="leads.form.emails" />}
        required
      >
        <Form.List name="emails">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Space key={field.key} className="w-full" align="baseline">
                  <Form.Item
                    {...field}
                    rules={[
                      { type: "email", message: intl.formatMessage({ id: "leads.form.email_invalid" }) },
                    ]}
                    className="flex-1"
                  >
                    <Input placeholder="email@example.com" />
                  </Form.Item>

                  {!isView && fields.length > 1 && (
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  )}
                </Space>
              ))}

              {!isView && (
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => add("")}
                  block
                >
                  <FormattedMessage id="leads.form.add_email" />
                </Button>
              )}
            </>
          )}
        </Form.List>
      </Form.Item>

      {/* PHONES[] */}
      <Form.Item
        label={<FormattedMessage id="leads.form.phones" />}
      >
        <Form.List name="phones">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Space key={field.key} className="w-full" align="baseline">
                  <Form.Item {...field} className="flex-1">
                    <Input placeholder="+123456789" />
                  </Form.Item>

                  {!isView && fields.length > 1 && (
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  )}
                </Space>
              ))}

              {!isView && (
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => add("")}
                  block
                >
                  <FormattedMessage id="leads.form.add_phone" />
                </Button>
              )}
            </>
          )}
        </Form.List>
      </Form.Item>

      {/* COMPANY */}
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="company"
            label={<FormattedMessage id="leads.form.company" />}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            name="job_title"
            label={<FormattedMessage id="leads.form.job_title" />}
          >
            <Input />
          </Form.Item>
        </Col>
      </Row>

      {/* TYPE */}
      <Form.Item
        name="type"
        label={<FormattedMessage id="leads.form.type" />}
        rules={[{ required: true }]}
      >
        <Select
          options={[
            { value: "INSTAGRAM", label: "Instagram" },
            { value: "LINKEDIN", label: "LinkedIn" },
            { value: "MANUAL", label: "Manual" },
          ]}
        />
      </Form.Item>

      {/* MESSAGE */}
      <Form.Item
        name="message"
        label={<FormattedMessage id="leads.form.message" />}
      >
        <Input.TextArea rows={4} />
      </Form.Item>

      {/* CONVERTED */}
      <Form.Item
        name="is_converted"
        label={<FormattedMessage id="leads.form.is_converted" />}
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      {/* ACTIONS */}
      <Space className="w-full justify-end">
        {onClose && (
          <Button onClick={onClose}>
            <FormattedMessage id="commons.cancel" />
          </Button>
        )}

        {!isView && (
          <Button type="primary" htmlType="submit">
            <FormattedMessage
              id={mode === "create" ? "commons.create" : "commons.save"}
            />
          </Button>
        )}
      </Space>
    </Form>
  );
};

export default LeadForm;
