"use client";

import AdminStatsCards from "@/features/dashboard/admin/admin-stats-cards";
import UsersTable from "@/features/dashboard/admin/components/users-table";
import FeedbackTable from "@/features/dashboard/admin/components/feedback-table";
import BugReportsTable from "@/features/dashboard/admin/components/bug-reports-table";
import { Row, Col } from "antd";
import { useState } from "react";
import { useBugReports } from "@/features/dashboard/admin/hooks/use-bug-reports";
import { useFeedback } from "@/features/dashboard/admin/hooks/use-feedback";
import { useUsers } from "@/features/dashboard/admin/hooks/use-users";

const Page = () => {
  // State for table filters and pagination
  const [userFilters, setUserFilters] = useState({
    page: 1,
    limit: 10,
    search: undefined as string | undefined,
    is_blocked: undefined as boolean | undefined,
    is_deleted: undefined as boolean | undefined,
  });

  const [feedbackFilters, setFeedbackFilters] = useState({
    page: 1,
    limit: 10,
    search: undefined as string | undefined,
    type: undefined as string | undefined,
    status: undefined as string | undefined,
    rating: undefined as number | undefined,
  });

  const [bugFilters, setBugFilters] = useState({
    page: 1,
    limit: 10,
    search: undefined as string | undefined,
    priority: undefined as string | undefined,
    status: undefined as string | undefined,
    category: undefined as string | undefined,
  });

  // Fetch data from APIs
  const { data: usersData, isLoading: usersLoading, error: usersError } = useUsers(userFilters);
  const { data: bugData, isLoading: bugLoading, error: bugError } = useBugReports(bugFilters);
  const { data: feedbackData, isLoading: feedbackLoading, error: feedbackError } = useFeedback(feedbackFilters);

  // Wrapper functions to handle type compatibility
  const handleUserFetch = (filters: any) => setUserFilters(filters);
  const handleFeedbackFetch = (filters: any) => setFeedbackFilters(filters);
  const handleBugFetch = (filters: any) => setBugFilters(filters);

  return (
    <div style={{ padding: '24px' }}>
      <AdminStatsCards />
      
      <div style={{ marginTop: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <UsersTable
              users={usersData?.data?.users || []}
              total={usersData?.data?.totalCount || 0}
              loading={usersLoading}
              value={userFilters}
              onFetch={handleUserFetch}
            />
          </Col>
        </Row>
      </div>

      <div style={{ marginTop: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <FeedbackTable
              feedback={feedbackData?.data || []}
              total={feedbackData?.pagination?.total || 0}
              loading={feedbackLoading}
              value={feedbackFilters}
              onFetch={handleFeedbackFetch}
            />
          </Col>
        </Row>
      </div>

      <div style={{ marginTop: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <BugReportsTable
              bugReports={bugData?.data || []}
              total={bugData?.pagination?.total || 0}
              loading={bugLoading}
              value={bugFilters}
              onFetch={handleBugFetch}
            />
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default Page;