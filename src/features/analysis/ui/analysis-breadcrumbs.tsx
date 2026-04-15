"use client";

import { Breadcrumb } from "antd";
import Link from "next/link";

type CrumbItem = {
  title: string;
  href?: string;
};

type AnalysisBreadcrumbsProps = {
  items: CrumbItem[];
};

const AnalysisBreadcrumbs = ({ items }: AnalysisBreadcrumbsProps) => {
  return (
    <Breadcrumb
      style={{ marginBottom: 12 }}
      items={items.map((item) => ({
        title: item.href ? <Link href={item.href}>{item.title}</Link> : item.title,
      }))}
    />
  );
};

export default AnalysisBreadcrumbs;
