// app/error.tsx
"use client";

import { useEffect } from "react";
import { Button, Card, Result, Space } from "antd";
import { useIntl } from "react-intl";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const intl = useIntl();

  useEffect(() => {
    console.error(error);
  }, [error]);

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
          status="error"
          title={intl.formatMessage({
            id: "errors.500.title",
            defaultMessage: "Something went wrong",
          })}
          subTitle={intl.formatMessage({
            id: "errors.500.subtitle",
            defaultMessage: "An unexpected error occurred. You can try again or go back to the dashboard.",
          })}
          extra={
            <Space wrap>
              <Button type="primary" onClick={() => reset()}>
                {intl.formatMessage({
                  id: "errors.500.try_again",
                  defaultMessage: "Try again",
                })}
              </Button>
              <Button href="/">
                {intl.formatMessage({
                  id: "errors.500.go_home",
                  defaultMessage: "Go to dashboard",
                })}
              </Button>
            </Space>
          }
        />
      </Card>
    </div>
  );
}
