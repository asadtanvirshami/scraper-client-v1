"use client";

import React from "react";
import { Button, Form, Input, Typography } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import { useGoogleSignin, useLogin } from "../hooks";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/redux/slices/user/user-slice";
import { persistor } from "@/redux/store";
import { useRouter } from "next/navigation";
import { setAuthCookies } from "@/lib/cookies";
import { GoogleLogin } from "@react-oauth/google";

const { Link } = Typography;

const SignInForm: React.FC = () => {
  const intl = useIntl();
  const logInMutation = useLogin();
  const googleSigninMutation = useGoogleSignin();
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
        router.replace(redirect);
      },
    });
  };

  const onGoogleSuccess = async (credentialResponse: any) => {
    await googleSigninMutation.mutateAsync(credentialResponse, {
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
        router.replace(redirect);
      },
    });
  };
  const onGoogleError = async () => {
    console.log("Login Failed");
  };

  return (
    <Form
      onFinish={handleSubmit}
      layout="vertical"
      size="large"
      requiredMark={false}
      className="space-y-1"
    >
      <Form.Item
        name="email"
        label={
          <span className="text-sm font-medium text-white/82">
            <FormattedMessage id="auth.common.email_label" />
          </span>
        }
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
          prefix={<MailOutlined className="mr-2 text-white/35" />}
          placeholder={intl.formatMessage({ id: "auth.common.email_placeholder" })}
          className="!h-13 !rounded-2xl !border-white/10 !bg-[#1b1b21] !px-3 !text-white placeholder:!text-white/26 hover:!border-white/18 focus:!border-white/22 focus:!shadow-none"
        />
      </Form.Item>

      <Form.Item
        name="password"
        label={
          <div className="flex justify-between items-center w-full">
            <span className="text-sm font-medium text-white/82">
              <FormattedMessage id="auth.common.password_label" />
            </span>
          </div>
        }
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
          prefix={<LockOutlined className="mr-2 text-white/35" />}
          placeholder={intl.formatMessage({ id: "auth.common.password_placeholder" })}
          className="!h-13 !rounded-2xl !border-white/10 !bg-[#1b1b21] !px-3 !text-white placeholder:!text-white/26 hover:!border-white/18 focus:!border-white/22 focus:!shadow-none"
        />
      </Form.Item>

      <div className="-mt-1 mb-5 flex items-center justify-between gap-4 text-[13px] text-white/58">
        <Link href="/auth/signup" className="!text-white/58 hover:!text-white">
          <FormattedMessage id="auth.sign_in.no_account_prompt" />
        </Link>
        <Link href="/auth/forgot-password" className="!text-white/58 hover:!text-white">
          <FormattedMessage id="auth.sign_in.forgot_password_short" />
        </Link>
      </div>

      <div className="pt-1">
        <Button
          type="primary"
          loading={logInMutation.isPending}
          htmlType="submit"
          block
          className="!h-13 !rounded-2xl !border-0 !text-[17px] !font-bold shadow-none"
        >
          <FormattedMessage id="auth.sign_in.buttonCTA" />
        </Button>
      </div>

      <div className="relative py-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#151519] px-3 text-[12px] font-semibold tracking-wide text-white/58">
            <FormattedMessage id="auth.common.or_continue_with" />
          </span>
        </div>
      </div>

      <div className="flex justify-center w-full">
        <GoogleLogin
          onSuccess={onGoogleSuccess}
          onError={onGoogleError}
          shape="rectangular"
          width="274"
          theme="filled_black"
          text="signin_with"
        />
      </div>
    </Form>
  );
};

export default SignInForm;
