import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { MoodProvider } from './context/MoodContext';
import { TodoProvider } from './context/TodoContext';
import Layout from './components/Layout/Layout';
import MoodHome from './pages/Home/Home';
import AddJournal from './pages/AddJournal/AddJournal';
import JournalList from './pages/JournalList/JournalList';
import JournalDetail from './pages/JournalDetail/JournalDetail';
import MoodStatistics from './pages/MoodStatistics/MoodStatistics';
import MoodTags from './pages/MoodTags/MoodTags';
import TodoList from './pages/TodoList/TodoList';
import AddTodo from './pages/AddTodo/AddTodo';
import EditTodo from './pages/EditTodo/EditTodo';
import TodoCategories from './pages/TodoCategories/TodoCategories';
import './App.css';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <MoodProvider>
        <TodoProvider>
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
                <Route path="/todos" element={<TodoList />} />
                <Route path="/todos/add" element={<AddTodo />} />
                <Route path="/todos/edit/:id" element={<EditTodo />} />
                <Route path="/todos/categories" element={<TodoCategories />} />
              </Routes>
            </Layout>
          </Router>
        </TodoProvider>
      </MoodProvider>
    </ConfigProvider>
  );
}

export default App;
