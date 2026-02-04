"use client";

import React, { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  List,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  CheckCircleFilled,
  CrownFilled,
  DownloadOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

type PlanId = "starter" | "pro" | "business";

type Plan = {
  id: PlanId;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  highlight?: boolean;
  badge?: string;
  description: string;
  features: string[];
};

type Invoice = {
  id: string;
  date: string; // ISO or display
  amount: string;
  status: "paid" | "due" | "failed";
};

const BillingCards: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("pro");

  const plans: Plan[] = useMemo(
    () => [
      {
        id: "starter",
        name: "Starter",
        priceMonthly: 19,
        priceYearly: 190,
        description: "For individuals getting started.",
        features: ["1 workspace", "Basic analytics", "Email support"],
      },
      {
        id: "pro",
        name: "Pro",
        priceMonthly: 49,
        priceYearly: 490,
        highlight: true,
        badge: "Most Popular",
        description: "For growing teams and steady usage.",
        features: [
          "5 workspaces",
          "Advanced analytics",
          "Priority support",
          "Exports",
        ],
      },
      {
        id: "business",
        name: "Business",
        priceMonthly: 99,
        priceYearly: 990,
        badge: "Best Value",
        description: "For high-volume teams & admin controls.",
        features: [
          "Unlimited workspaces",
          "Team roles & permissions",
          "SLA support",
          "Audit logs",
        ],
      },
    ],
    []
  );

  const invoices: Invoice[] = useMemo(
    () => [
      { id: "INV-1029", date: "2026-01-18", amount: "$49.00", status: "paid" },
      { id: "INV-1028", date: "2025-12-18", amount: "$49.00", status: "paid" },
      { id: "INV-1027", date: "2025-11-18", amount: "$49.00", status: "paid" },
    ],
    []
  );

  const currentPlan = plans.find((p) => p.id === selectedPlan) ?? plans[1];

  const priceLabel = (p: Plan) => {
    const v = billingCycle === "monthly" ? p.priceMonthly : p.priceYearly;
    const suffix = billingCycle === "monthly" ? "/mo" : "/yr";
    return `$${v}${suffix}`;
  };

  const statusTag = (s: Invoice["status"]) => {
    if (s === "paid") return <Tag color="success">Paid</Tag>;
    if (s === "due") return <Tag color="warning">Due</Tag>;
    return <Tag color="error">Failed</Tag>;
  };

  return (
    <div style={{ padding: 16 }}>
      <Row gutter={[16, 16]}>
        {/* Header / Controls */}
        <Col xs={24}>
          <Card>
            <Row align="middle" justify="space-between" gutter={[12, 12]}>
              <Col>
                <Title level={4} style={{ margin: 0 }}>
                  Billing (DEMO)
                </Title>
                <Text type="secondary">
                  Manage your plan, payments, and invoices.
                </Text>
              </Col>
              <Col>
                <Space>
                  <Button
                    type={billingCycle === "monthly" ? "primary" : "default"}
                    onClick={() => setBillingCycle("monthly")}
                  >
                    Monthly
                  </Button>
                  <Button
                    type={billingCycle === "yearly" ? "primary" : "default"}
                    onClick={() => setBillingCycle("yearly")}
                  >
                    Yearly
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Plans */}
        {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;

          return (
            <Col xs={24} md={8} key={plan.id}>
              <Badge.Ribbon
                text={plan.badge}
                color={plan.highlight ? "gold" : "blue"}
                style={{ display: plan.badge ? undefined : "none" }}
              >
                <Card
                  hoverable
                  style={{
                    border:
                      plan.highlight && !isSelected
                        ? "1px solid rgba(250, 173, 20, 0.6)"
                        : isSelected
                        ? "1px solid rgba(22, 119, 255, 0.8)"
                        : undefined,
                  }}
                  title={
                    <Space>
                      {plan.highlight ? (
                        <CrownFilled style={{ color: "#faad14" }} />
                      ) : (
                        <SafetyCertificateOutlined />
                      )}
                      <span>{plan.name}</span>
                      {isSelected ? <Tag color="blue">Selected</Tag> : null}
                    </Space>
                  }
                  extra={
                    <Text strong style={{ fontSize: 18 }}>
                      {priceLabel(plan)}
                    </Text>
                  }
                >
                  <Text type="secondary">{plan.description}</Text>

                  <Divider style={{ margin: "12px 0" }} />

                  <List
                    size="small"
                    dataSource={plan.features}
                    renderItem={(item) => (
                      <List.Item style={{ paddingLeft: 0, paddingRight: 0 }}>
                        <Space>
                          <CheckCircleFilled style={{ color: "#52c41a" }} />
                          <Text>{item}</Text>
                        </Space>
                      </List.Item>
                    )}
                  />

                  <Divider style={{ margin: "12px 0" }} />

                  <Button
                    block
                    type={isSelected ? "default" : "primary"}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {isSelected ? "Current plan" : "Choose plan"}
                  </Button>
                </Card>
              </Badge.Ribbon>
            </Col>
          );
        })}

        {/* Current Subscription */}
        <Col xs={24} lg={12}>
          <Card
            title="Current subscription"
            extra={<Tag color="success">Active</Tag>}
          >
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Plan">
                <Space>
                  <Text strong>{currentPlan.name}</Text>
                  {currentPlan.highlight ? (
                    <Tag color="gold">Recommended</Tag>
                  ) : null}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Billing cycle">
                {billingCycle === "monthly" ? "Monthly" : "Yearly"}
              </Descriptions.Item>
              <Descriptions.Item label="Next renewal">
                Feb 18, 2026
              </Descriptions.Item>
              <Descriptions.Item label="Payment method">
                Visa •••• 4242
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Space wrap>
              <Button type="primary">Update payment method</Button>
              <Button danger>Cancel subscription</Button>
            </Space>
          </Card>
        </Col>

        {/* Invoices */}
        <Col xs={24} lg={12}>
          <Card title="Invoices">
            <List
              itemLayout="horizontal"
              dataSource={invoices}
              renderItem={(inv) => (
                <List.Item
                  actions={[
                    <Button
                      key="download"
                      icon={<DownloadOutlined />}
                      onClick={() => {
                        // hook your download logic here
                        console.log("download invoice", inv.id);
                      }}
                    >
                      Download
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{inv.id}</Text>
                        {statusTag(inv.status)}
                      </Space>
                    }
                    description={
                      <Text type="secondary">
                        {inv.date} • {inv.amount}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BillingCards;
