import React from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import SettingsPreferences from '../form/general';
import ProfileForm from '../form/profile';
import PasswordSecruityForm from '../form/password-security';
import SupportTabContent from '../form/support';

const onChange = (key: string) => {
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