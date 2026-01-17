"use client";

import React, { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Drawer,
  Form,
  Input,
  Layout,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  PlusOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  UserAddOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

type CampaignStatus = "Active" | "Paused" | "Draft";
type LeadStatus = "New" | "Contacted" | "Interested" | "Not Interested";

type Campaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  createdAt: string; // ISO
  leadsCount: number;
};

type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: LeadStatus;
  campaignId?: string;
  createdAt: string; // ISO
};

const statusTag = (status: CampaignStatus | LeadStatus) => {
  const map: Record<string, { color: string; icon?: React.ReactNode }> = {
    Active: { color: "green" },
    Paused: { color: "orange" },
    Draft: { color: "default" },
    New: { color: "blue" },
    Contacted: { color: "gold" },
    Interested: { color: "green" },
    "Not Interested": { color: "red" },
  };
  const cfg = map[status] ?? { color: "default" };
  return <Tag color={cfg.color}>{status}</Tag>;
};

const isoNow = () => new Date().toISOString();

const initialCampaigns: Campaign[] = [
  {
    id: "c1",
    name: "Dubai Realtors Outreach",
    status: "Active",
    createdAt: "2026-01-12T10:10:00.000Z",
    leadsCount: 84,
  },
  {
    id: "c2",
    name: "SaaS Founders (EU) - Q1",
    status: "Paused",
    createdAt: "2026-01-08T15:40:00.000Z",
    leadsCount: 42,
  },
  {
    id: "c3",
    name: "Law Firms - Security Audit Offer",
    status: "Draft",
    createdAt: "2026-01-05T09:00:00.000Z",
    leadsCount: 0,
  },
];

const initialLeads: Lead[] = [
  {
    id: "l1",
    name: "Aisha Khan",
    email: "aisha.k@example.com",
    phone: "+971501234567",
    company: "Palm Realty",
    status: "New",
    campaignId: "c1",
    createdAt: "2026-01-16T11:05:00.000Z",
  },
  {
    id: "l2",
    name: "Omar Farooq",
    email: "omar.f@example.com",
    company: "ScaleSaaS",
    status: "Contacted",
    campaignId: "c2",
    createdAt: "2026-01-15T18:20:00.000Z",
  },
  {
    id: "l3",
    name: "Sara Lopez",
    email: "sara.l@example.com",
    phone: "+34910000000",
    company: "Lex & Co",
    status: "Interested",
    campaignId: "c3",
    createdAt: "2026-01-15T09:45:00.000Z",
  },
  {
    id: "l4",
    name: "Hassan Ali",
    email: "hassan.a@example.com",
    company: "Marina Estates",
    status: "New",
    campaignId: "c1",
    createdAt: "2026-01-14T13:30:00.000Z",
  },
];

export default function CampaignsLeadsDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);

  // UI state
  const [createCampaignOpen, setCreateCampaignOpen] = useState(false);
  const [createLeadOpen, setCreateLeadOpen] = useState(false);
  const [leadDrawerOpen, setLeadDrawerOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const [campaignForm] = Form.useForm();
  const [leadForm] = Form.useForm();

  const [leadSearch, setLeadSearch] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState<LeadStatus | "All">(
    "All",
  );
  const [campaignFilter, setCampaignFilter] = useState<string | "All">("All");

  const totalLeads = leads.length;
  const activeCampaigns = campaigns.filter((c) => c.status === "Active").length;

  const recentlyAddedLead = useMemo(() => {
    const sorted = [...leads].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    );
    return sorted[0] ?? null;
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const q = leadSearch.trim().toLowerCase();
    return leads.filter((l) => {
      const matchesSearch =
        !q ||
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        (l.company ?? "").toLowerCase().includes(q);

      const matchesStatus =
        leadStatusFilter === "All" ? true : l.status === leadStatusFilter;
      const matchesCampaign =
        campaignFilter === "All" ? true : l.campaignId === campaignFilter;

      return matchesSearch && matchesStatus && matchesCampaign;
    });
  }, [leads, leadSearch, leadStatusFilter, campaignFilter]);

  const campaignOptions = useMemo(
    () => campaigns.map((c) => ({ value: c.id, label: c.name })),
    [campaigns],
  );

  // Create campaign
  const submitCampaign = async () => {
    const values = await campaignForm.validateFields();
    const newCampaign: Campaign = {
      id: `c_${Math.random().toString(16).slice(2)}`,
      name: values.name,
      status: values.status,
      createdAt: values.createdAt ? values.createdAt.toISOString() : isoNow(),
      leadsCount: 0,
    };
    setCampaigns((prev) => [newCampaign, ...prev]);
    campaignForm.resetFields();
    setCreateCampaignOpen(false);
  };

  // Create lead
  const submitLead = async () => {
    const values = await leadForm.validateFields();
    const newLead: Lead = {
      id: `l_${Math.random().toString(16).slice(2)}`,
      name: values.name,
      email: values.email,
      phone: values.phone,
      company: values.company,
      status: values.status,
      campaignId: values.campaignId !== "none" ? values.campaignId : undefined,
      createdAt: values.createdAt ? values.createdAt.toISOString() : isoNow(),
    };

    setLeads((prev) => [newLead, ...prev]);

    // Update campaign lead count (simple increment if assigned)
    if (newLead.campaignId) {
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === newLead.campaignId
            ? { ...c, leadsCount: c.leadsCount + 1 }
            : c,
        ),
      );
    }

    leadForm.resetFields();
    setCreateLeadOpen(false);
  };

  const campaignsColumns = [
    {
      title: "Campaign",
      dataIndex: "name",
      key: "name",
      render: (name: string, row: Campaign) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Created {new Date(row.createdAt).toLocaleString()}
          </Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (s: CampaignStatus) => statusTag(s),
    },
    {
      title: "Leads",
      dataIndex: "leadsCount",
      key: "leadsCount",
      width: 100,
      render: (n: number) => <Badge count={n} overflowCount={999} />,
    },
  ] as const;

  const leadsColumns = [
    {
      title: "Lead",
      key: "lead",
      render: (_: any, row: Lead) => (
        <Space direction="vertical" size={0}>
          <Text strong>{row.name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {row.email} {row.company ? `• ${row.company}` : ""}
          </Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (s: LeadStatus) => statusTag(s),
    },
    {
      title: "Campaign",
      key: "campaign",
      width: 220,
      render: (_: any, row: Lead) => {
        const c = campaigns.find((x) => x.id === row.campaignId);
        return c ? <Text>{c.name}</Text> : <Text type="secondary">—</Text>;
      },
    },
    {
      title: "Added",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 190,
      render: (v: string) => <Text>{new Date(v).toLocaleString()}</Text>,
    },
    {
      title: "",
      key: "actions",
      width: 110,
      render: (_: any, row: Lead) => (
        <Button
          size="small"
          onClick={() => {
            setSelectedLead(row);
            setLeadDrawerOpen(true);
          }}
        >
          View
        </Button>
      ),
    },
  ] as const;

  return (
    <>
      {/* Top stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Total Leads"
              value={totalLeads}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Active Campaigns"
              value={activeCampaigns}
              prefix={<ThunderboltOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Space direction="vertical" size={2}>
              <Text type="secondary">Recently Added Lead</Text>
              {recentlyAddedLead ? (
                <>
                  <Text strong style={{ fontSize: 16 }}>
                    {recentlyAddedLead.name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {recentlyAddedLead.email} •{" "}
                    {new Date(recentlyAddedLead.createdAt).toLocaleString()}
                  </Text>
                </>
              ) : (
                <Text type="secondary">No leads yet</Text>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]}>
        {/* Campaigns */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <Text strong>Campaigns</Text>
                <Tag color="blue">{campaigns.length}</Tag>
              </Space>
            }
            extra={
              <Button
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setCreateCampaignOpen(true)}
              >
                Create
              </Button>
            }
          >
            <Table
              rowKey="id"
              columns={campaignsColumns as any}
              dataSource={campaigns}
              pagination={{ pageSize: 5, showSizeChanger: false }}
            />
          </Card>
        </Col>

        {/* Leads */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <Text strong>Leads</Text>
                <Tag color="blue">{filteredLeads.length}</Tag>
              </Space>
            }
            extra={
              <Button
                size="small"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateLeadOpen(true)}
              >
                Create
              </Button>
            }
          >
            <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
              <Col xs={24} md={10}>
                <Input
                  allowClear
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  placeholder="Search leads (name, email, company)"
                  prefix={<SearchOutlined />}
                />
              </Col>
              <Col xs={12} md={7}>
                <Select
                  style={{ width: "100%" }}
                  value={leadStatusFilter}
                  onChange={(v) => setLeadStatusFilter(v)}
                  options={[
                    { value: "All", label: "All statuses" },
                    { value: "New", label: "New" },
                    { value: "Contacted", label: "Contacted" },
                    { value: "Interested", label: "Interested" },
                    { value: "Not Interested", label: "Not Interested" },
                  ]}
                />
              </Col>
              <Col xs={12} md={7}>
                <Select
                  style={{ width: "100%" }}
                  value={campaignFilter}
                  onChange={(v) => setCampaignFilter(v)}
                  options={[
                    { value: "All", label: "All campaigns" },
                    ...campaignOptions,
                  ]}
                />
              </Col>
            </Row>

            <Table
              rowKey="id"
              columns={leadsColumns as any}
             
              pagination={{ pageSize: 7, showSizeChanger: false }}
            />
          </Card>
        </Col>
      </Row>

      {/* Create Campaign Modal */}
      <Modal
        title="Create Campaign"
        open={createCampaignOpen}
        onCancel={() => setCreateCampaignOpen(false)}
        onOk={submitCampaign}
        okText="Create"
      >
        <Form form={campaignForm} layout="vertical" requiredMark={false}>
          <Form.Item
            name="name"
            label="Campaign name"
            rules={[
              { required: true, message: "Please enter a campaign name" },
            ]}
          >
            <Input placeholder="e.g., Dubai Realtors Outreach" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            initialValue="Draft"
            rules={[{ required: true, message: "Please select a status" }]}
          >
            <Select
              options={[
                { value: "Active", label: "Active" },
                { value: "Paused", label: "Paused" },
                { value: "Draft", label: "Draft" },
              ]}
            />
          </Form.Item>

          <Form.Item name="createdAt" label="Created date (optional)">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Lead Modal */}
      <Modal
        title="Create Lead"
        open={createLeadOpen}
        onCancel={() => setCreateLeadOpen(false)}
        onOk={submitLead}
        okText="Create"
      >
        <Form
          form={leadForm}
          layout="vertical"
          requiredMark={false}
          initialValues={{ status: "New", campaignId: "none" }}
        >
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Full name"
                rules={[{ required: true, message: "Please enter full name" }]}
              >
                <Input placeholder="e.g., Aisha Khan" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="company" label="Company (optional)">
                <Input placeholder="e.g., Palm Realty" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input placeholder="name@company.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Phone (optional)">
                <Input placeholder="+1 555 123 4567" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select
                  options={[
                    { value: "New", label: "New" },
                    { value: "Contacted", label: "Contacted" },
                    { value: "Interested", label: "Interested" },
                    { value: "Not Interested", label: "Not Interested" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="campaignId" label="Assign to campaign">
                <Select
                  options={[
                    { value: "none", label: "No campaign" },
                    ...campaignOptions,
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="createdAt" label="Added date (optional)">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Lead Details Drawer */}
      <Drawer
        title="Lead Details"
        open={leadDrawerOpen}
        onClose={() => setLeadDrawerOpen(false)}
        width={420}
      >
        {selectedLead ? (
          <Space direction="vertical" size={10} style={{ width: "100%" }}>
            <Card size="small">
              <Space direction="vertical" size={4}>
                <Text type="secondary">Name</Text>
                <Text strong>{selectedLead.name}</Text>
              </Space>
            </Card>

            <Card size="small">
              <Space direction="vertical" size={4}>
                <Text type="secondary">Email</Text>
                <Text>{selectedLead.email}</Text>
              </Space>
            </Card>

            <Card size="small">
              <Row gutter={12}>
                <Col span={12}>
                  <Space direction="vertical" size={4}>
                    <Text type="secondary">Status</Text>
                    {statusTag(selectedLead.status)}
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction="vertical" size={4}>
                    <Text type="secondary">Added</Text>
                    <Text>
                      {new Date(selectedLead.createdAt).toLocaleString()}
                    </Text>
                  </Space>
                </Col>
              </Row>
            </Card>

            <Card size="small">
              <Row gutter={12}>
                <Col span={12}>
                  <Space direction="vertical" size={4}>
                    <Text type="secondary">Company</Text>
                    <Text>{selectedLead.company || "—"}</Text>
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction="vertical" size={4}>
                    <Text type="secondary">Phone</Text>
                    <Text>{selectedLead.phone || "—"}</Text>
                  </Space>
                </Col>
              </Row>
            </Card>

            <Card size="small">
              <Space direction="vertical" size={4}>
                <Text type="secondary">Campaign</Text>
                <Text>
                  {selectedLead.campaignId
                    ? (campaigns.find((c) => c.id === selectedLead.campaignId)
                        ?.name ?? "—")
                    : "—"}
                </Text>
              </Space>
            </Card>
          </Space>
        ) : (
          <Text type="secondary">No lead selected</Text>
        )}
      </Drawer>
    </>
  );
}
