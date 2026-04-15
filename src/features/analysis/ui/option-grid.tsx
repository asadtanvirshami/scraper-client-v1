"use client";

import { Card, Col, Row, Typography } from "antd";
import Link from "next/link";

const { Text, Title } = Typography;

type OptionItem = {
  key: string;
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
              <Title level={5} className="!mb-1">
                {item.title}
              </Title>
              <Text type="secondary" className="!leading-6">
                {item.description}
              </Text>
            </Card>
          </Link>
        </Col>
      ))}
    </Row>
  );
};

export default OptionGrid;
