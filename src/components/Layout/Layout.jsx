import React from 'react';
import { Layout as AntLayout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  PlusCircleOutlined,
  UnorderedListOutlined,
  BarChartOutlined,
  TagsOutlined
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
      label: <Link to="/add">记账</Link>
    },
    {
      key: '/records',
      icon: <UnorderedListOutlined />,
      label: <Link to="/records">记录</Link>
    },
    {
      key: '/statistics',
      icon: <BarChartOutlined />,
      label: <Link to="/statistics">统计</Link>
    },
    {
      key: '/categories',
      icon: <TagsOutlined />,
      label: <Link to="/categories">分类</Link>
    }
  ];

  return (
    <AntLayout className="app-layout">
      <Header className="app-header">
        <div className="logo">💰 记账本</div>
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
        记账本应用 ©2026 - 数据存储在您的浏览器本地
      </Footer>
    </AntLayout>
  );
};

export default Layout;
