import React from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { Flex, Spin } from "antd";

const Spinner = ({ size }: { size: "small" | "default" | "large" }) => (
  <div className="!w-full !h-screen flex items-center justify-center " >
    <Spin indicator={<LoadingOutlined spin />}  size={size} />
  </div>
);

export default Spinner;
