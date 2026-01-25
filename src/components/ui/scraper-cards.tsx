"use client";
import {
  ArrowRightOutlined,
  EditOutlined,
  HeartOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Card, Flex, Typography } from "antd";
import type { CardMetaProps, CardProps } from "antd";
import { createStyles } from "antd-style";

import linkedIn_SVG from "../../../public/assets/SVG/socials/linkedIn.svg";
import instagram_SVG from "../../../public/assets/SVG/socials/instagram.svg";
import Image from "next/image";

const { Meta } = Card;
const { Text } = Typography;

const useStyles = createStyles(({ token }) => ({
  root: {
    width: 500,
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadius,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    border: `1px solid ${token.colorBorderSecondary}`,
  },
  header: {
    borderBottom: "none",
    paddingBottom: 8,
  },
  body: {
    paddingTop: 0,
  },
}));

const stylesCard: CardProps["styles"] = {
  root: {
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 500,
  },
};

const actions = [
  <div className="space-x-3">
    <Text className="!text-gray-500">Visit</Text>
    <ArrowRightOutlined key="share" />,
  </div>,
];
const InstagramScraperCard = () => {
  const { styles: classNames } = useStyles();

  const sharedCardProps: CardProps = {
    classNames,
    actions,
  };

  const sharedCardMetaProps: CardMetaProps = {
    avatar: <Image alt="linkedIn" src={instagram_SVG} width={50} height={50} />,
    description:
      "This scrapping tool allows you to scrap the data by profile url of Instagram. You will recieve the username, first name, last name and more.",
  };

  return (
    <Flex gap="middle">
      <Card
        {...sharedCardProps}
        title="Object Card"
        styles={stylesCard}
        variant="borderless"
      >
        <Meta {...sharedCardMetaProps} title="Object Card Meta title" />
      </Card>
    </Flex>
  );
};

const LinkedInScraperCard = () => {
  const { styles: classNames } = useStyles();

  const sharedCardProps: CardProps = {
    classNames,
    actions,
  };

  const sharedCardMetaProps: CardMetaProps = {
    avatar: <Image alt="linkedIn" src={linkedIn_SVG} width={50} height={50} />,
    description:
      "This scrapping tool allows you to scrap the data by profile url of LinkedIn. You will recieve the email, phone number and more.",
  };

  return (
    <Flex gap="middle">
      <Card
        {...sharedCardProps}
        title="Object Card"
        styles={stylesCard}
        variant="borderless"
      >
        <Meta {...sharedCardMetaProps} title="Object Card Meta title" />
      </Card>
    </Flex>
  );
};

export { InstagramScraperCard, LinkedInScraperCard };
