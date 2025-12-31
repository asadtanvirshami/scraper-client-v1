"use client";

import React from "react";
import { Button, Divider, Form, Input, Typography } from "antd";
import {
  MailOutlined,
  LockOutlined,
  GoogleOutlined,
  FacebookFilled,
  AppleFilled,
} from "@ant-design/icons";

const { Link, Text } = Typography;

const SignUpForm: React.FC = () => {
  return (
    <Form layout="vertical" size="large" requiredMark={false}>
      <Form.Item
        name="First Name"
        rules={[{ required: true, message: "Please enter your first name" }]}
      >
        <Input placeholder="First name" className="rounded-xl" />
      </Form.Item>
      <Form.Item
        name="email"
        rules={[{ required: true, message: "Please enter your last name" }]}
      >
        <Input placeholder="Last name" className="rounded-xl" />
      </Form.Item>
      <Form.Item
        name="email"
        rules={[{ required: true, message: "Please enter your email" }]}
      >
        <Input
          prefix={<MailOutlined className="text-black/35" />}
          placeholder="xyz@gmail.com"
          className="rounded-xl"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: "Please enter your password" }]}
      >
        <Input.Password
          prefix={<LockOutlined className="text-black/35" />}
          placeholder="**********"
          className="rounded-xl"
        />
      </Form.Item>

      <div className="-mt-2 mb-4 flex justify-end">
        <Link className="text-[11px] !text-white/50">Forgot password?</Link>
      </div>

      <Form.Item className="!mb-4">
        <Button
          htmlType="submit"
          className="!w-full !h-11 !rounded-xl !border-0 !text-white font-medium
                     !shadow-[0_10px_26px_rgba(0,0,0,0.25)] !font-semibold
                     hover:opacity-95 !bg-yellow-500"
        >
          Get Started
        </Button>
      </Form.Item>

      <Divider className="!my-3">
        <Text className="text-[12px]">or sign in with</Text>
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

export default SignUpForm;
