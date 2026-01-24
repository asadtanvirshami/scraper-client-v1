"use client";

import React from "react";
import { Button, Divider, Form, Input, Typography } from "antd";
import { MailOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import { FormattedMessage } from "react-intl";
import { useLogin } from "../hooks";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/redux/slices/user/user-slice";
import { persistor } from "@/redux/store";
import { useRouter } from "next/navigation";
import { setAuthCookies } from "@/lib/cookies";

const { Link, Text } = Typography;

const SignInForm: React.FC = () => {
  const logInMutation = useLogin();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = (values: { email: string; password: string }) => {
    logInMutation.mutateAsync(values, {
      onSuccess: async (data) => {
        const redirect = data.data.redirect;
        const userData = data.data.user;
        const token = data.data.token;

        setAuthCookies({
          accessToken: token,
          refreshToken: "",
        });

        // Dispatch user data to Redux
        dispatch(loginSuccess(userData));
        // Flush persistor to ensure state is saved before navigation
        await persistor.flush();
        // Small delay to ensure Redux state is persisted
        await new Promise((resolve) => setTimeout(resolve, 100));
        // Navigate to dashboard
        router.replace(`${redirect}/${userData._id}`);
      },
    });
    console.log(logInMutation.data);
  };
  return (
    <Form
      onFinish={handleSubmit}
      layout="vertical"
      size="large"
      requiredMark={false}
    >
      <Form.Item
        name="email"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage id="auth.sign_up.errors.email_required" />
            ),
          },
          {
            type: "email",
            message: (
              <FormattedMessage id="auth.sign_up.errors.invalid_email_format" />
            ),
          },
        ]}
      >
        <Input
          prefix={<MailOutlined className="text-black/35" />}
          placeholder="xyz@gmail.com"
          className="rounded-xl"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: (
              <FormattedMessage id="auth.sign_in.errors.password_required" />
            ),
          },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="text-black/35" />}
          placeholder="*********"
          className="rounded-xl"
        />
      </Form.Item>

      <div className="-mt-2 mb-4 flex justify-between w-full">
        <Link href="/auth/signup" className="text-[11px] !text-white/50">
          <FormattedMessage id="auth.sign_in.dont_have_account" />
        </Link>
        <Link
          href="/auth/forgot-password"
          className="text-[11px] !text-white/50"
        >
          <FormattedMessage id="auth.sign_in.forgot_password" />
        </Link>
      </div>

      <Form.Item className="!mb-4">
        <Button
          disabled={logInMutation.isPending}
          loading={logInMutation.isPending}
          htmlType="submit"
          className="!w-full !h-11 !rounded-xl !border-0 !text-white font-medium
                     !shadow-[0_10px_26px_rgba(0,0,0,0.25)] !font-semibold
                     hover:opacity-95 !bg-yellow-500"
        >
          <FormattedMessage id="auth.sign_in.buttonCTA" />
        </Button>
      </Form.Item>

      <Divider className="!my-3">
        <Text className="text-[12px]">
          <FormattedMessage id="auth.sign_in.strip_line" />
        </Text>
      </Divider>

      <div className="flex items-center justify-center gap-4">
        <Button
          shape="circle"
          className="!h-10 !w-10 !bg-yellow-500 !rounded-full !bg-white/70 !border-white/60 hover:!bg-white"
          icon={<GoogleOutlined className="text-[18px] text-black/70" />}
        />
      </div>
    </Form>
  );
};

export default SignInForm;
