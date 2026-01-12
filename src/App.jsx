import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import AddRecord from './pages/AddRecord/AddRecord';
import Records from './pages/Records/Records';
import Statistics from './pages/Statistics/Statistics';
import Categories from './pages/Categories/Categories';
import './App.css';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <AppProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/add" element={<AddRecord />} />
              <Route path="/records" element={<Records />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/categories" element={<Categories />} />
            </Routes>
          </Layout>
        </Router>
      </AppProvider>
    </ConfigProvider>
  );
}

export default App;
