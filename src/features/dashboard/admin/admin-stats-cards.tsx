"use client";

import { Col, Row, Card, Statistic } from "antd";

type AdminStatsCardsProps = {
  stats?: {
    blockedUsers?: number;
    deletedUsers?: number;
    totalUsers?: number;
    totalReports?: number;
    totalBugs?: number;
  };
  isLoading?: boolean;
};

const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({ stats, isLoading = false }) => {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={12} md={6}>
        <Card loading={isLoading}>
          <Statistic title="Total Users" value={stats?.totalUsers ?? 0} />
        </Card>
      </Col>
      <Col xs={12} md={6}>
        <Card loading={isLoading}>
          <Statistic title="Blocked Users" value={stats?.blockedUsers ?? 0} />
        </Card>
      </Col>
      <Col xs={12} md={6}>
        <Card loading={isLoading}>
          <Statistic title="Deleted Users" value={stats?.deletedUsers ?? 0} />
        </Card>
      </Col>
      <Col xs={12} md={6}>
        <Card loading={isLoading}>
          <Statistic title="Total Reports" value={stats?.totalReports ?? 0} />
        </Card>
      </Col>
      <Col xs={12} md={6}>
        <Card loading={isLoading}>
          <Statistic title="Total Bugs" value={stats?.totalBugs ?? 0} />
        </Card>
      </Col>
    </Row>
  );
};

export default AdminStatsCards;
