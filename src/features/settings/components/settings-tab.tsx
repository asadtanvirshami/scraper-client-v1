import React from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import SettingsPreferences from './general';
import ProfileForm from './profile';

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
];

const SettingTabs = () => <Tabs defaultActiveKey="1" items={items} onChange={onChange} />;

export default SettingTabs;