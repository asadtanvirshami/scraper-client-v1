"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Switch,
  Spin,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { useIntl, FormattedMessage } from "react-intl";

import type { Lead } from "@/types/leads";
import { useFetchFolders } from "@/features/folders/hooks/queries";
import { useUserInfo } from "@/helpers/use-user";

type Mode = "create" | "view" | "edit";

type Props = {
  mode: Mode;
  initialValues?: Partial<Lead>;
  onSubmit?: (values: any) => Promise<void> | void;
  onClose?: () => void;
};

type Folder = {
  _id: string;
  name: string;
};

type FolderSelectValue =
  | { value: string; label: React.ReactNode }
  | null
  | undefined;

const LeadForm: React.FC<Props> = ({
  mode,
  initialValues,
  onSubmit,
  onClose,
}) => {
  const [form] = Form.useForm();
  const intl = useIntl();
  const { id } = useUserInfo();
  const isView = mode === "view";

  // -----------------------------
  // Folders pagination state
  // -----------------------------
  const [folderPage, setFolderPage] = useState(1);
  const folderLimit = 20;
  const [folderSearch, setFolderSearch] = useState("");

  const {
    data: foldersResp,
    isLoading: foldersLoading,
    isFetching: foldersFetching,
  } = useFetchFolders({
    user_id: id,
    page: folderPage,
    limit: folderLimit,
    search: folderSearch,
  } as any);

  // Normalize response
  const folders: Folder[] = ((foldersResp as any)?.folders ??
    foldersResp?.data ??
    foldersResp ??
    []) as Folder[];

  const foldersTotal: number =
    (foldersResp as any)?.total ?? (foldersResp as any)?.meta?.total ?? 0;

  const hasMoreFolders =
    foldersTotal > 0
      ? folderPage * folderLimit < foldersTotal
      : folders.length === folderLimit;

  // Accumulate pages for infinite scroll
  const [folderOptions, setFolderOptions] = useState<Folder[]>([]);

  useEffect(() => {
    setFolderPage(1);
    setFolderOptions([]);
  }, [folderSearch]);

  useEffect(() => {
    if (folderPage === 1) setFolderOptions(folders);
    else setFolderOptions((prev) => [...prev, ...folders]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foldersResp]);

  const selectOptions = useMemo(
    () =>
      folderOptions.map((f) => ({
        value: f._id,
        label: f.name,
      })),
    [folderOptions]
  );

  const typeOptions = useMemo(
    () => [
      {
        value: "INSTAGRAM",
        label: intl.formatMessage({
          id: "leads.form.type_instagram",
          defaultMessage: "Instagram",
        }),
      },
      {
        value: "LINKEDIN",
        label: intl.formatMessage({
          id: "leads.form.type_linkedin",
          defaultMessage: "LinkedIn",
        }),
      },
      {
        value: "MANUAL",
        label: intl.formatMessage({
          id: "leads.form.type_manual",
          defaultMessage: "Manual",
        }),
      },
    ],
    [intl]
  );

  // -----------------------------
  // Prefill form (edit/view)
  // -----------------------------
  useEffect(() => {
    if (!initialValues) return;

    const rawFolderId: any = (initialValues as any)?.folder_id;
    const populatedFolder: any = (initialValues as any)?.folder;

    const initialFolderId: string | undefined =
      typeof rawFolderId === "string"
        ? rawFolderId
        : rawFolderId?._id || populatedFolder?._id;

    const initialFolderName: string =
      (typeof rawFolderId === "object" && rawFolderId?.name) ||
      populatedFolder?.name ||
      (initialValues as any)?.folder_name ||
      "";

    const folderFieldValue: FolderSelectValue = initialFolderId
      ? {
          value: initialFolderId,
          label: initialFolderName || initialFolderId,
        }
      : null;

    form.setFieldsValue({
      first_name: (initialValues as any)?.first_name,
      last_name: (initialValues as any)?.last_name,
      company: (initialValues as any)?.company,
      job_title: (initialValues as any)?.job_title,
      type: (initialValues as any)?.type,
      message: (initialValues as any)?.message,
      is_converted: (initialValues as any)?.is_converted,
      scrape_status: (initialValues as any)?.scrape_status ?? true,
      folder_id: folderFieldValue,

      emails: (initialValues as any)?.emails?.length
        ? (initialValues as any)?.emails
        : [""],
      phone_numbers: (initialValues as any)?.phone_numbers?.length
        ? (initialValues as any)?.phone_numbers
        : [""],
    });
  }, [initialValues, form]);

  // -----------------------------
  // Submit payload includes folder_id (STRING)
  // -----------------------------
  const handleFinish = async (values: any) => {
    const folderSelect: FolderSelectValue = values.folder_id;

    const payload = {
      ...values,
      folder_id: folderSelect?.value || null,
      emails: (values.emails || []).filter(Boolean),
      phone_numbers: (values.phone_numbers || []).filter(Boolean),
      scrape_status: true,
      user_id: id,
      id: (initialValues as any)?._id,
    };

    delete (payload as any).folder_id_label;

    if (onSubmit) await onSubmit(payload);
  };

  // -----------------------------
  // Infinite scroll handler
  // -----------------------------
  const onFolderPopupScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    if (foldersFetching || foldersLoading || !hasMoreFolders) return;

    const target = e.currentTarget;
    const reachedBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 24;

    if (reachedBottom) setFolderPage((p) => p + 1);
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

      {/* FOLDER */}
      <Form.Item
        name="folder_id"
        label={
          <FormattedMessage id="leads.form.folder" defaultMessage="Folder" />
        }
      >
        <Select
          showSearch
          allowClear
          labelInValue
          disabled={isView}
          placeholder={intl.formatMessage({
            id: "leads.form.folder_placeholder",
            defaultMessage: "Select a folder",
          })}
          options={selectOptions}
          loading={foldersLoading}
          onPopupScroll={onFolderPopupScroll}
          notFoundContent={foldersLoading ? <Spin size="small" /> : null}
          onChange={(obj) => form.setFieldValue("folder_id", obj || null)}
          // ✅ dropdownRender -> popupRender
          popupRender={(menu) => (
            <div>
              {menu}
              {(foldersFetching || foldersLoading) && (
                <div style={{ padding: 8, textAlign: "center" }}>
                  <Spin size="small" />
                </div>
              )}
              {!hasMoreFolders && folderOptions.length > 0 && (
                <div style={{ padding: 8, textAlign: "center", opacity: 0.6 }}>
                  <FormattedMessage
                    id="commons.end_of_list"
                    defaultMessage="End of list"
                  />
                </div>
              )}
            </div>
          )}
        />
      </Form.Item>

      {/* EMAILS[] */}
      <Form.Item label={<FormattedMessage id="leads.form.emails" />} required>
        <Form.List name="emails">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => {
                // ✅ FIX: do NOT spread `key` into JSX
                const { key, ...restField } = field;

                return (
                  <Space key={key} className="w-full" align="baseline">
                    <Form.Item
                      key={key}
                      {...restField}
                      rules={[
                        {
                          type: "email",
                          message: intl.formatMessage({
                            id: "leads.form.email_invalid",
                          }),
                        },
                      ]}
                      className="flex-1"
                    >
                      <Input
                        placeholder={intl.formatMessage({
                          id: "leads.form.email_placeholder",
                          defaultMessage: "email@example.com",
                        })}
                      />
                    </Form.Item>

                    {!isView && fields.length > 1 && (
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    )}
                  </Space>
                );
              })}

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
      <Form.Item label={<FormattedMessage id="leads.form.phones" />}>
        <Form.List name="phone_numbers">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => {
                const { key, ...restField } = field;

                return (
                  <Space key={key} className="w-full" align="baseline">
                    <Form.Item key={key} {...restField} className="flex-1">
                      <Input
                        placeholder={intl.formatMessage({
                          id: "leads.form.phone_placeholder",
                          defaultMessage: "+123456789",
                        })}
                      />
                    </Form.Item>

                    {!isView && fields.length > 1 && (
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    )}
                  </Space>
                );
              })}

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
        <Select options={typeOptions} />
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
