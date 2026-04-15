"use client";

import { Card, Col, Row, Typography } from "antd";
import Link from "next/link";
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
  return (
    <Row gutter={[16, 16]}>
      {items.map((item) => (
        <Col xs={24} md={12} key={item.key}>
          <Link href={item.href} style={{ display: "block", height: "100%" }}>
            <Card hoverable style={{ height: "100%" }} bodyStyle={{ padding: 20 }}>
              <div className="flex items-start gap-3">
                {item.icon ? (
                  <div className="mt-0.5 text-lg leading-none text-[var(--color-primary)]">
                    {item.icon}
                  </div>
                ) : null}

                <div className="min-w-0 space-y-1">
                  <Title level={5} className="!mb-0">
                    {item.title}
                  </Title>
                  <Text type="secondary" className="!leading-6">
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
