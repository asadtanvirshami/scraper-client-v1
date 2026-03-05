"use client";

import React from "react";
import { Card, Typography } from "antd";
import { FormattedMessage } from "react-intl";
import Image from "next/image";
import logo from "../../../../public/assets/PNGs/logo.png";

const { Title, Text } = Typography;

type Props = {
  children: React.ReactNode;
  title: string;
};
const AuthCard = ({ children, title }: Props) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4">
      {/* Background like screenshot */}

      <div className="w-[450px]">
        <Card>
          {/* Top badge icon */}
          <div className="flex items-center justify-center">
              <Image
                src={logo}
                alt="Logo"
                width={100}
                height={100}
                className="h-fit w-fit object-contain"
                priority
              />
          </div>

          <div className="mt-3 text-center">
            <Title level={5} className="!mb-1">
              <FormattedMessage id={title} />
            </Title>
          </div>

          <div className="mt-6">{children}</div>
        </Card>
      </div>
    </div>
  );
};

export default AuthCard;
