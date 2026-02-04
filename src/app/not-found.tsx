// app/not-found.tsx
"use client";

import { Button, Card, Result, Space } from "antd";
import { useIntl } from "react-intl";

export default function NotFound() {
  const intl = useIntl();

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
      <Card style={{ width: "min(720px, 100%)", borderRadius: 16 }}>
        <Result
          status="404"
          title={intl.formatMessage({ id: "errors.404.title", defaultMessage: "Page not found" })}
          subTitle={intl.formatMessage({
            id: "errors.404.subtitle",
            defaultMessage: "The page you’re looking for doesn’t exist or has been moved.",
          })}
          extra={
            <Space wrap>
              <Button type="primary" href="/auth/signin">
                {intl.formatMessage({
                  id: "errors.404.go_signin",
                  defaultMessage: "Go to sign in",
                })}
              </Button>
              <Button href="/">
                {intl.formatMessage({ id: "errors.404.go_home", defaultMessage: "Home" })}
              </Button>
            </Space>
          }
        />
      </Card>
    </div>
  );
}
