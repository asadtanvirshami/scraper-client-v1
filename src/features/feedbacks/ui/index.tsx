"use client";

import React, { useState } from "react";
import { Modal, Button, Descriptions, Space, theme } from "antd";
import { FormattedMessage, useIntl } from "react-intl";
import { MessageOutlined, UserOutlined, ClockCircleOutlined } from "@ant-design/icons";
import FeedbacksTableServer, { FeedbackItem, ServerFilters } from "./table";
import {
  useFeedbacksList,
  useDeleteFeedback,
} from "../hooks";

const FeedBackLayout: React.FC = () => {
  const intl = useIntl();
  const { token } = theme.useToken();
  const { feedbacks, total, isLoading, query, setQuery, refetch } =
    useFeedbacksList();
  const deleteFeedbackMutation = useDeleteFeedback();

  const [viewingFeedback, setViewingFeedback] = useState<FeedbackItem | null>(
    null,
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const handleFetch = (filters: ServerFilters) => {
    setQuery({
      page: filters.page,
      limit: filters.limit,
      search: filters.search,
      user_id: filters.user_id,
    });
  };

  const handleDeleteFeedback = async (row: FeedbackItem) => {
    await deleteFeedbackMutation.mutateAsync(row._id);
  };

  const handleDeleteSelected = async (ids: string[]) => {
    for (const id of ids) {
      await deleteFeedbackMutation.mutateAsync(id);
    }
  };

  const handleOpenView = (feedback: FeedbackItem) => {
    setViewingFeedback(feedback);
    setIsViewModalOpen(true);
  };
  const formatDateTime = (value?: string) =>
    value
      ? `${intl.formatDate(new Date(value), {
          year: "numeric",
          month: "short",
          day: "numeric",
        })} ${intl.formatTime(new Date(value), {
          hour: "numeric",
          minute: "2-digit",
        })}`
      : "-";

  return (
    <>
      <FeedbacksTableServer
        feedbacks={feedbacks}
        total={total}
        loading={
          isLoading ||
          deleteFeedbackMutation.isPending
        }
        value={query}
        onFetch={handleFetch}
        onDeleteOne={handleDeleteFeedback}
        onDeleteMany={handleDeleteSelected}
        onOpenView={handleOpenView}
        showFilters
      />

      {/* ✅ View Feedback Modal */}
      <Modal
        title={
          <Space>
            <MessageOutlined style={{ color: "#52c41a" }} />
            <FormattedMessage
              id="admin.feedbacks.modal.view"
              defaultMessage="Feedback Details"
            />
          </Space>
        }
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          setViewingFeedback(null);
        }}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => {
              setIsViewModalOpen(false);
              setViewingFeedback(null);
            }}
          >
            <FormattedMessage id="commons.close" defaultMessage="Close" />
          </Button>,
        ]}
        width={700}
      >
        {viewingFeedback && (
          <>
            <Descriptions
              bordered
              column={1}
              size="middle"
              labelStyle={{ fontWeight: 600, width: "30%" }}
            >
              <Descriptions.Item
                label={
                  <>
                    <MessageOutlined className="mr-1" />{" "}
                    <FormattedMessage
                      id="admin.feedbacks.modal.feedback"
                      defaultMessage="Feedback"
                    />
                  </>
                }
              >
                <div style={{ whiteSpace: "pre-wrap", maxHeight: 200, overflowY: "auto" }}>
                  {viewingFeedback.feedback || "-"}
                </div>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <UserOutlined className="mr-1" />{" "}
                    <FormattedMessage
                      id="admin.feedbacks.modal.user"
                      defaultMessage="User"
                    />
                  </>
                }
              >
                {typeof viewingFeedback.user_id === "string"
                  ? viewingFeedback.user_id
                  : `${viewingFeedback.user_id?.first_name || ""} ${viewingFeedback.user_id?.last_name || ""}`.trim() ||
                    viewingFeedback.user_id?.email ||
                    "-"}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <FormattedMessage
                    id="admin.feedbacks.modal.email"
                    defaultMessage="Email"
                  />
                }
              >
                {typeof viewingFeedback.user_id === "string"
                  ? "-"
                  : viewingFeedback.user_id?.email || "-"}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <ClockCircleOutlined className="mr-1" />{" "}
                    <FormattedMessage
                      id="admin.feedbacks.modal.created"
                      defaultMessage="Created"
                    />
                  </>
                }
              >
                {formatDateTime(viewingFeedback.createdAt)}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <>
                    <ClockCircleOutlined className="mr-1" />{" "}
                    <FormattedMessage
                      id="admin.feedbacks.modal.updated"
                      defaultMessage="Updated"
                    />
                  </>
                }
              >
                {formatDateTime(viewingFeedback.updatedAt)}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <FormattedMessage
                    id="admin.feedbacks.modal.id"
                    defaultMessage="ID"
                  />
                }
              >
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "monospace",
                    color: token.colorTextTertiary,
                  }}
                >
                  {viewingFeedback._id}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>
    </>
  );
};

export default FeedBackLayout;
