// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Spin, Typography, Space } from "antd";
import { useIntl } from "react-intl";

const { Title, Text } = Typography;

export default function Home() {
  const router = useRouter();
  const intl = useIntl();

  useEffect(() => {
    router.replace("/auth/signin");
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 16,
        background: "var(--antd-color-bg-layout, #f5f5f5)",
      }}
    >
      <Card style={{ width: "min(520px, 100%)", borderRadius: 16 }}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Title level={4} style={{ margin: 0 }}>
            {intl.formatMessage({
              id: "commons.redirecting_title",
              defaultMessage: "Redirecting",
            })}
          </Title>

          <Text type="secondary">
            {intl.formatMessage({
              id: "commons.redirecting_signin",
              defaultMessage: "Redirecting to sign in…",
            })}
          </Text>

          <div style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
            <Spin size="large" />
          </div>
        </Space>
      </Card>
    </div>
  );
}
