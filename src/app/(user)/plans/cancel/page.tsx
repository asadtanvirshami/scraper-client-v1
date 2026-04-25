"use client";

import React from "react";
import { Button, Result } from "antd";
import { useRouter } from "next/navigation";

export default function PlansCancelPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center h-screen">
      <Result
        status="info"
        title="Checkout cancelled"
        subTitle="No charges were made. You can subscribe whenever you're ready."
        extra={[
          <Button type="primary" key="plans" onClick={() => router.replace("/plans")}>
            View Plans
          </Button>,
          <Button key="dash" onClick={() => router.replace("/dashboard")}>
            Go to Dashboard
          </Button>,
        ]}
      />
    </div>
  );
}
