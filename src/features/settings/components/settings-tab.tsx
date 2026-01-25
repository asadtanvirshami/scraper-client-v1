import React from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import SettingsPreferences from './general';
import ProfileForm from './profile';
import PasswordSecruityForm from './password-security';
import SupportTabContent from './support';

const onChange = (key: string) => {
  console.log(key);
};

const items: TabsProps['items'] = [
  {
    key: '1',
    label: 'General',
    children: <SettingsPreferences/>,
  },
  {
    key: '2',
    label: 'Profile',
    children: <ProfileForm/>,
  },
  {
    key: '3',
    label: 'Password & Security',
    children: <PasswordSecruityForm/>,
  },
  {
    key: '4',
    label: 'Support & Feedback',
    children: <SupportTabContent/>,
  },
];

const SettingTabs = () => <Tabs defaultActiveKey="1" items={items} onChange={onChange} />;

export default SettingTabs;