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
import { useUpdateProfile } from "@/features/user/hooks";
import { useUserInfo } from "@/helpers/use-user";
import { useDispatch } from "react-redux";
import { updateProfile } from "@/redux/slices/user/user-slice";
import { getAccessToken } from "@/lib/cookies";

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
  const [avatarUrl, setAvatarUrl] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const updateProfileMutation = useUpdateProfile();
  const { user } = useUserInfo();

  const onSave = async () => {
    try {
      console.log("frontend onSave");
      const values = await form.validateFields();
      
      // Create FormData object
      const formData = new FormData();
      
      // Add text fields
      formData.append('_id', user?._id ?? "");
      formData.append('first_name', values.first_name);
      formData.append('last_name', values.last_name);
      console.log("frontend values", avatarUrl);
      
      // Add avatar file if exists (avatarUrl is actually the File object)
      // if (avatarUrl && typeof avatarUrl === 'object' && avatarUrl instanceof File) {
      //   console.log("frontend file", avatarUrl);
      //   formData.append('image', avatarUrl);
      // }
      formData.append('image', avatarUrl);
      console.log("frontend formData", avatarUrl);
      // Direct fetch call
      const token = getAccessToken();
      const response = await fetch('http://localhost:4000/api/user/me', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        const userData = data?.data;
        dispatch(updateProfile(userData));
        console.log("Profile updated successfully");
      } else {
        console.error("Profile update failed");
      }
    } catch (error) {
      console.error("Profile update error:", error);
    }
  };

  const handleAvatarChange = (info: any) => {
    setAvatarUrl(info.file);
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
            <Avatar size={64} src={avatarPreview} icon={<UserOutlined />} />

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
            <Button
              type="primary"
              loading={updateProfileMutation.isPending}
              disabled={updateProfileMutation.isPending}
              onClick={onSave}
            >
              {intl.formatMessage({ id: "profile.save" })}
            </Button>
          </Space>
        </Form>
      </Space>
    </>
  );
};

export default ProfileForm;
