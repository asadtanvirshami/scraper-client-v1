"use client";

import { Card, Col, Row, Typography, theme } from "antd";
import Link from "next/link";
import { ArrowRightOutlined } from "@ant-design/icons";
import { ReactNode } from "react";

const { Text, Title } = Typography;

type OptionItem = {
  key: string;
  icon?: ReactNode;
  title: string;
  description: string;
  href: string;
};

type OptionGridProps = {
  items: OptionItem[];
};

const OptionGrid = ({ items }: OptionGridProps) => {
  const { token } = theme.useToken();

  return (
    <Row gutter={[16, 16]}>
      {items.map((item) => (
        <Col xs={24} md={12} key={item.key}>
          <Link href={item.href} style={{ display: "block", height: "100%" }}>
            <Card
              hoverable
              style={{ height: "100%", transition: "box-shadow 0.2s, border-color 0.2s" }}
              bodyStyle={{ padding: 24 }}
            >
              <div className="flex items-start gap-4">
                {item.icon ? (
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorPrimaryBgHover} 100%)`,
                      border: `1px solid ${token.colorPrimaryBorder}`,
                      color: token.colorPrimary,
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                ) : null}

                <div className="min-w-0 flex-1 space-y-1">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Title level={5} className="!mb-0">
                      {item.title}
                    </Title>
                    <ArrowRightOutlined style={{ color: token.colorTextTertiary, fontSize: 13 }} />
                  </div>
                  <Text type="secondary" className="!leading-6" style={{ fontSize: 13 }}>
                    {item.description}
                  </Text>
                </div>
              </div>
            </Card>
          </Link>
        </Col>
      ))}
    </Row>
  );
};

export default OptionGrid;
