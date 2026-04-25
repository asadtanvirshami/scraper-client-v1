"use client";

import React, { useState } from "react";
import {
  Modal,
  Button,
  Typography,
  Alert,
  Tag,
  Divider,
  message,
  theme,
} from "antd";
import {
  UploadOutlined,
  FileExcelOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";

const { Text, Title, Paragraph } = Typography;

const REQUIRED_FIELDS = [
  { field: "first_name", desc: "Contact's first name", example: "John" },
  { field: "last_name", desc: "Contact's last name", example: "Doe" },
  { field: "type", desc: "Lead source platform", example: "INSTAGRAM | LINKEDIN | MANUAL" },
];

const OPTIONAL_FIELDS = [
  { field: "username", desc: "Social media handle", example: "@johndoe" },
  { field: "email", desc: "Primary email address", example: "john@example.com" },
  { field: "emails", desc: "Multiple emails (comma-separated)", example: "a@x.com,b@x.com" },
  { field: "phone_numbers", desc: "Phone (comma-separated)", example: "+1234567890" },
  { field: "company", desc: "Company or organization", example: "Acme Corp" },
  { field: "job_title", desc: "Job title / position", example: "Marketing Manager" },
  { field: "bio", desc: "Short biography or notes", example: "CEO at..." },
  { field: "website", desc: "Website URL", example: "https://johndoe.com" },
  { field: "location", desc: "City, country, or full address", example: "New York, USA" },
  { field: "followers_count", desc: "Number of followers", example: "12000" },
  { field: "following_count", desc: "Number of accounts following", example: "340" },
  { field: "is_converted", desc: "Mark as converted (true/false)", example: "false" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  user_id: string;
  onBulkUpload: (payload: any) => Promise<void>;
};

const BulkUploadModal: React.FC<Props> = ({ open, onClose, user_id, onBulkUpload }) => {
  const intl = useIntl();
  const { token } = theme.useToken();
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (file?: File) => {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    const reader = new FileReader();

    const extract = async (rows: any[]) => {
      try {
        setUploading(true);

        const transformed = rows
          .map((r: any) => {
            const first_name = r.first_name || r.First_Name || r.FirstName || "";
            const last_name = r.last_name || r.Last_Name || r.LastName || "";

            const emails = r.emails
              ? String(r.emails).split(",").map((e: string) => e.trim())
              : r.email
              ? [String(r.email).trim()]
              : [];

            const phone_numbers = r.phone_numbers
              ? String(r.phone_numbers).split(",").map((p: string) => p.trim())
              : r.phone
              ? [String(r.phone).trim()]
              : [];

            const type = (r.type || r.Type || "MANUAL").toString().toUpperCase();

            return {
              first_name,
              last_name,
              emails,
              phone_numbers,
              type,
              username: r.username || r.Username || "",
              company: r.company || r.Company || "",
              job_title: r.job_title || r.JobTitle || r.job_title || "",
              bio: r.bio || r.Bio || "",
              website: r.website || r.Website || "",
              location: r.location || r.Location || "",
              followers_count: r.followers_count ? Number(r.followers_count) : undefined,
              following_count: r.following_count ? Number(r.following_count) : undefined,
              is_converted: r.is_converted === "true" || r.is_converted === true,
              user_id,
            };
          })
          .filter((r: any) => r.first_name || r.last_name || r.username);

        if (!transformed.length) {
          message.warning("No valid rows found in the file.");
          return;
        }

        await onBulkUpload({ user_id, leads: transformed });
        message.success(`${transformed.length} leads imported successfully.`);
      } catch (err) {
        console.error(err);
        message.error("Failed to import leads.");
      } finally {
        setUploading(false);
      }
    };

    if (ext === "csv") {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = text.split(/\r?\n/).filter(Boolean);
        const headers = rows[0].split(",").map((h) => h.trim());
        const data = rows.slice(1).map((r) => {
          const values = r.split(",");
          const obj: any = {};
          headers.forEach((h, i) => (obj[h] = values[i]?.trim() ?? ""));
          return obj;
        });
        extract(data);
      };
      reader.readAsText(file);
    } else if (ext === "xlsx" || ext === "xls") {
      import("xlsx")
        .then((XLSX) => {
          reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = (XLSX as any).read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const json = (XLSX as any).utils.sheet_to_json(sheet, { defval: "" }) as any[];
            extract(json);
          };
          reader.readAsArrayBuffer(file);
        })
        .catch(() => {
          message.error("Failed to parse XLSX file.");
        });
    } else {
      message.error("Unsupported format. Use CSV, XLSX, or XLS.");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={680}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <FileExcelOutlined style={{ color: token.colorPrimary, fontSize: 20 }} />
          <span>
            <FormattedMessage id="leads.bulk_upload.title" defaultMessage="Bulk Import Leads" />
          </span>
        </div>
      }
    >
      <div style={{ paddingTop: 4 }}>
        <Alert
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          message="Supported formats: CSV, XLSX, XLS"
          description="Upload a spreadsheet file containing your leads. The first row must be column headers."
          style={{ marginBottom: 20 }}
        />

        {/* Required fields */}
        <div style={{ marginBottom: 16 }}>
          <Title level={5} style={{ marginBottom: 8 }}>
            Required Columns
          </Title>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {REQUIRED_FIELDS.map(({ field, desc, example }) => (
              <div
                key={field}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "6px 10px",
                  borderRadius: 8,
                  background: token.colorFillAlter,
                  border: `1px solid ${token.colorBorderSecondary}`,
                }}
              >
                <CheckCircleOutlined style={{ color: "#10b981", marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Tag
                    style={{
                      fontFamily: "monospace",
                      fontSize: 12,
                      background: token.colorPrimaryBg,
                      borderColor: token.colorPrimaryBorder,
                      color: token.colorPrimary,
                    }}
                  >
                    {field}
                  </Tag>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {desc} &mdash; <Text style={{ fontSize: 12 }} code>{example}</Text>
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Divider style={{ margin: "12px 0" }} />

        {/* Optional fields */}
        <div style={{ marginBottom: 20 }}>
          <Title level={5} style={{ marginBottom: 8 }}>
            Optional Columns
          </Title>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 6,
            }}
          >
            {OPTIONAL_FIELDS.map(({ field, desc, example }) => (
              <div
                key={field}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  padding: "5px 10px",
                  borderRadius: 8,
                  background: token.colorFillTertiary,
                  border: `1px solid ${token.colorBorderSecondary}`,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Tag style={{ fontFamily: "monospace", fontSize: 11, marginBottom: 2 }}>
                    {field}
                  </Tag>
                  <div>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {desc}
                    </Text>
                    {example && (
                      <Text style={{ fontSize: 11 }} type="secondary">
                        {" "}
                        (e.g.{" "}
                        <Text code style={{ fontSize: 10 }}>
                          {example}
                        </Text>
                        )
                      </Text>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 16 }}>
          The <Text code style={{ fontSize: 11 }}>type</Text> field must be one of:{" "}
          <Tag color="red">INSTAGRAM</Tag>
          <Tag color="blue">LINKEDIN</Tag>
          <Tag color="green">MANUAL</Tag>
          &mdash; if omitted, defaults to <strong>MANUAL</strong>.
        </Paragraph>

        {/* Upload button */}
        <div style={{ textAlign: "center", paddingTop: 8 }}>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            size="large"
            loading={uploading}
            style={{ minWidth: 200 }}
            onClick={() => document.getElementById("bulk-lead-file-upload")?.click()}
          >
            <FormattedMessage id="leads.bulk_upload.choose_file" defaultMessage="Choose File & Import" />
          </Button>
          <input
            id="bulk-lead-file-upload"
            type="file"
            accept=".csv,.xlsx,.xls"
            style={{ display: "none" }}
            onChange={(e) => {
              handleFileSelect(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              CSV, XLSX or XLS &bull; Max 5,000 rows
            </Text>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BulkUploadModal;
