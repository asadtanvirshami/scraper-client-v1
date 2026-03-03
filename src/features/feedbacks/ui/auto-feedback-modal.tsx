"use client";

import { useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { FormattedMessage, useIntl } from "react-intl";
import { useUserInfo } from "@/helpers/use-user";
import { useCreateFeedback } from "../hooks";
import { useFeedbackModalTimer } from "../hooks/use-feedback-modal-timer";
import { useAppDispatch } from "@/redux/hook";
import { updateProfile } from "@/redux/slices/user/user-slice";

const MAX_LEN = 1000;

const AutoFeedbackModal = () => {
  const intl = useIntl();
  const { id: user_id, is_feedback_completed, user } = useUserInfo();
  const [form] = Form.useForm();
  const createFeedback = useCreateFeedback();

  const { shouldShowModal, snoozeModal, clearSnooze } = useFeedbackModalTimer();
  const dispatch = useAppDispatch();
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await createFeedback.mutateAsync({
        user_id: user_id as any,
        feedback: values.feedback.trim(),
      });

      message.success(
        intl.formatMessage({ id: "support.feedback.success" }) ||
          "Feedback submitted successfully!",
      );

      clearSnooze();
      dispatch(updateProfile({ ...user, is_feedback_completed: true }));
      form.resetFields();
    } catch (e: any) {
      if (e?.errorFields) return; // antd validation
      message.error(
        intl.formatMessage({ id: "support.feedback.fail" }) ||
          "Failed to submit feedback",
      );
    }
  };

  const handleCancel = () => {
    snoozeModal();
    form.resetFields();
  };

  // Don't render if feedback is completed
  if (!user_id || is_feedback_completed) {
    return null;
  }

  return (
    <Modal
      title={
        <FormattedMessage
          id="feedback.auto_modal.title"
          defaultMessage="We'd Love Your Feedback!"
        />
      }
      open={shouldShowModal}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          <FormattedMessage
            id="feedback.auto_modal.later"
            defaultMessage="Maybe Later"
          />
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={createFeedback.isPending}
          disabled={createFeedback.isPending}
        >
          <FormattedMessage
            id="feedback.auto_modal.submit"
            defaultMessage="Submit Feedback"
          />
        </Button>,
      ]}
      width={600}
      closable={false}
    >
      <p style={{ marginBottom: 16 }}>
        <FormattedMessage
          id="feedback.auto_modal.description"
          defaultMessage="Help us improve your experience! Share your thoughts and suggestions."
        />
      </p>

      <Form form={form} layout="vertical">
        <Form.Item
          name="feedback"
          label={
            <FormattedMessage
              id="support.feedback.field"
              defaultMessage="Your Feedback"
            />
          }
          rules={[
            {
              required: true,
              message:
                intl.formatMessage({ id: "support.feedback.required" }) ||
                "Please enter your feedback",
            },
            {
              max: MAX_LEN,
              message:
                intl.formatMessage(
                  { id: "support.max_length" },
                  { max: MAX_LEN },
                ) || `Maximum ${MAX_LEN} characters`,
            },
          ]}
        >
          <Input.TextArea
            rows={6}
            showCount
            maxLength={MAX_LEN}
            placeholder={
              intl.formatMessage({
                id: "support.feedback.placeholder",
              }) || "Share your experience, suggestions, or concerns..."
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AutoFeedbackModal;
