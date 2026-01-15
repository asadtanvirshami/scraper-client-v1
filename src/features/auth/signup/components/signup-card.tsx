"use client";

import React from "react";
import { Card, Typography } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import SignInForm from "../signup-form";
import { FormattedMessage } from "react-intl";

const { Title, Text } = Typography;

const SignUpCard: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4">
      {/* Background like screenshot */}

      <div className="w-[380px]">
        <Card>
          {/* Top badge icon */}
          <div className="flex items-center justify-center">
            <div className="h-12 w-12 rounded-2xl bg-white/70 border border-white/60 shadow-sm flex items-center justify-center">
              <SafetyCertificateOutlined className="text-xl text-black/70" />
            </div>
          </div>

          <div className="mt-3 text-center">
            <Title level={5} className="!mb-1">
              <FormattedMessage id="auth.sign_up.sign_up_with_email" />
            </Title>
          </div>

          <div className="mt-6">
            <SignInForm />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignUpCard;
