import React from "react";
import { Card as CardComp, Col, Typography } from "antd";
import { cn } from "@/lib/utils";

const CardHeader = ({ title, size }: { title: string; size: string }) => {
  return (
    <div className="w-full h-12 mb-4">
      <Typography
        className={cn(
          size === "large" && "!text-4xl",
          size === "medium" && "!text-2xl",
          size === "small" && "!text-xl"
        )}
      >
        {title}
      </Typography>
    </div>
  );
};

const CardBody = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

const Card = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => {
  return (
    <CardComp>
      <CardHeader size="" title={title} />
      <CardBody>{children}</CardBody>
    </CardComp>
  );
};

export { Card, CardBody, CardHeader };
