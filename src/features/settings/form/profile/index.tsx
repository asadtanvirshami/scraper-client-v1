"use client";

import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Spin,
  Space,
  Upload,
  Typography,
} from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import { useIntl } from "react-intl";
import { useRouter } from "next/navigation";
import { useUserInfo } from "@/helpers/use-user";
import { useDispatch } from "react-redux";
import { updateProfile } from "@/redux/slices/user/user-slice";
import { UpdateProfile } from "@/api/api_calls/user";
import { message } from "antd";

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
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useUserInfo();

  useEffect(() => {
    setAvatarPreview(user?.avatar_url ?? null);
  }, [user?.avatar_url]);

  const onSave = async () => {
    try {
      setIsSaving(true);
      const values = await form.validateFields();
      
      // Create FormData object
      const formData = new FormData();
      
      // Add text fields
      formData.append('first_name', values.first_name);
      formData.append('last_name', values.last_name);
      
      // Add avatar file if exists
      if (avatarUrl && avatarUrl instanceof File) {
        formData.append('image', avatarUrl);
      }
      
      // Call the API
      const response = await UpdateProfile(formData);
      
      if (response.success && response.data) {
        dispatch(updateProfile(response.data));
        message.success(intl.formatMessage({ id: "profile.update_success" }));
      } else {
        message.error(response.message || intl.formatMessage({ id: "profile.update_error" }));
      }
    } catch (error) {
      console.error("Profile update error:", error);
      message.error(intl.formatMessage({ id: "profile.update_error" }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (info: any) => {
    const selectedFile = info?.file?.originFileObj ?? info?.file;
    setAvatarUrl(selectedFile);

    if (selectedFile instanceof File) {
      const previewUrl = URL.createObjectURL(selectedFile);
      setAvatarPreview(previewUrl);
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
            <Spin size="small" spinning={isSaving}>
              <Avatar
                size={64}
                src={avatarPreview || user?.avatar_url || "/assets/avatar-placeholder.svg"}
                icon={<UserOutlined />}
              />
            </Spin>
            
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
              loading={isSaving}
              disabled={isSaving}
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