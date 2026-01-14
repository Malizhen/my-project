import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { MoodProvider } from './context/MoodContext';
import Layout from './components/Layout/Layout';
import MoodHome from './pages/Home/Home';
import AddJournal from './pages/AddJournal/AddJournal';
import JournalList from './pages/JournalList/JournalList';
import JournalDetail from './pages/JournalDetail/JournalDetail';
import MoodStatistics from './pages/MoodStatistics/MoodStatistics';
import MoodTags from './pages/MoodTags/MoodTags';
import './App.css';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <MoodProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<MoodHome />} />
              <Route path="/add" element={<AddJournal />} />
              <Route path="/edit/:id" element={<AddJournal />} />
              <Route path="/journals" element={<JournalList />} />
              <Route path="/journals/:id" element={<JournalDetail />} />
              <Route path="/statistics" element={<MoodStatistics />} />
              <Route path="/tags" element={<MoodTags />} />
            </Routes>
          </Layout>
        </Router>
      </MoodProvider>
    </ConfigProvider>
  );
}

export default App;
