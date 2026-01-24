"use client";

import React, { useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Space,
  Upload,
  Typography,
} from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import { useIntl } from "react-intl";
import { useRouter } from "next/navigation";
import { useUpdateProfile } from "../../hooks";
import { useUserInfo } from "@/helpers/use-user";
import { useDispatch } from "react-redux";
import { updateProfile } from "@/redux/slices/user/user-slice";

const { Title, Text } = Typography;

type ProfileFormValues = {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
};

const ProfileForm: React.FC = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const router = useRouter();
  const [form] = Form.useForm<ProfileFormValues>();
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const updateProfileMutation = useUpdateProfile();
  const { user } = useUserInfo();

  const onSave = async () => {
    try {
      const values = await form.validateFields();
      console.log(values);

      setSaving(true);
      await updateProfileMutation.mutateAsync(
        {
          _id: user?._id ?? "",
          first_name: values.first_name,
          last_name: values.last_name,
        },
        {
          onSuccess: (data) => {
            const userData = data?.data;
            dispatch(updateProfile(userData));
          },
          onError: (error) => {
            console.error("Profile update error:", error);
          },
        },
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (info: any) => {
    if (info.file.status === "done" || info.file.originFileObj) {
      const file = info.file.originFileObj as File;
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  return (
    <>
      <Title level={4} style={{ marginTop: 0 }}>
        {intl.formatMessage({ id: "profile.title" })}
      </Title>

      <Space orientation="vertical" size={24} className="w-full">
        {/* Avatar */}
        <Space orientation="vertical" size={8}>
          <Text strong>{intl.formatMessage({ id: "profile.avatar" })}</Text>

          <Space>
            <Avatar size={64} src={avatarUrl} icon={<UserOutlined />} />

            <Upload
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleAvatarChange}
            >
              <Button icon={<UploadOutlined />}>
                {intl.formatMessage({ id: "profile.uploadAvatar" })}
              </Button>
            </Upload>
          </Space>
        </Space>

        {/* Profile form */}
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            _id: user?._id,
            first_name: user?.first_name,
            last_name: user?.last_name,
            email: user?.email,
          }}
          className="max-w-[600px]"
        >
          <Form.Item
            label={intl.formatMessage({ id: "profile.firstName" })}
            name="first_name"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: "profile.errors.firstName" }),
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({ id: "profile.lastName" })}
            name="last_name"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: "profile.errors.lastName" }),
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={intl.formatMessage({ id: "profile.email" })}
            name="email"
            rules={[
              {
                required: true,
                message: intl.formatMessage({ id: "profile.errors.email" }),
              },
              {
                type: "email",
                message: intl.formatMessage({
                  id: "profile.errors.invalidEmail",
                }),
              },
            ]}
          >
            <Input disabled />
          </Form.Item>

          <Space style={{ marginTop: 8 }}>
            <Button type="primary" loading={saving} onClick={onSave}>
              {intl.formatMessage({ id: "profile.save" })}
            </Button>

            <Button
              type="link"
              onClick={() => router.push("/auth/reset-password")}
            >
              {intl.formatMessage({ id: "profile.changePassword" })}
            </Button>
          </Space>
        </Form>
      </Space>
    </>
  );
};

export default ProfileForm;
