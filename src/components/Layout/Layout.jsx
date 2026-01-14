import React from 'react';
import { Layout as AntLayout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  PlusCircleOutlined,
  UnorderedListOutlined,
  BarChartOutlined,
  TagsOutlined,
  SmileOutlined
} from '@ant-design/icons';
import './Layout.css';

const { Header, Content, Footer } = AntLayout;

const Layout = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>
    },
    {
      key: '/add',
      icon: <PlusCircleOutlined />,
      label: <Link to="/add">新增</Link>
    },
    {
      key: '/journals',
      icon: <UnorderedListOutlined />,
      label: <Link to="/journals">日记</Link>
    },
    {
      key: '/statistics',
      icon: <BarChartOutlined />,
      label: <Link to="/statistics">统计</Link>
    },
    {
      key: '/tags',
      icon: <TagsOutlined />,
      label: <Link to="/tags">标签</Link>
    }
  ];

  return (
    <AntLayout className="app-layout">
      <Header className="app-header">
        <div className="logo">📔 心情日记</div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="app-menu"
        />
      </Header>
      <Content className="app-content">
        <div className="content-wrapper">{children}</div>
      </Content>
      <Footer className="app-footer">
        心情日记 ©2026 - 数据存储在您的浏览器本地
      </Footer>
    </AntLayout>
  );
};

export default Layout;
