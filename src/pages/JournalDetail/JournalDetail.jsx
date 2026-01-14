import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tag, Button, Space, Divider, Empty } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useMoodContext } from '../../context/MoodContext';
import dayjs from 'dayjs';
import './JournalDetail.css';

const JournalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEntryById, removeEntry } = useMoodContext();
  
  const [entry, setEntry] = useState(null);

  useEffect(() => {
    const journalEntry = getEntryById(id);
    if (journalEntry) {
      setEntry(journalEntry);
    } else {
      navigate('/journals');
    }
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  const handleDelete = async () => {
    const success = await removeEntry(id);
    if (success) {
      navigate('/journals');
    }
  };

  if (!entry) {
    return (
      <div className="journal-detail-page">
        <Empty description="日记不存在" />
      </div>
    );
  }

  return (
    <div className="journal-detail-page">
      <Card className="journal-detail-card">
        <div className="journal-detail-header">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="back-button"
          >
            返回
          </Button>
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
            >
              编辑
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            >
              删除
            </Button>
          </Space>
        </div>

        <Divider />

        <div className="journal-detail-content">
          <div className="detail-mood-section">
            <div 
              className="mood-display"
              style={{ borderColor: entry.mood.color }}
            >
              <span className="mood-icon-large">{entry.mood.icon}</span>
              <span className="mood-name-large">{entry.mood.name}</span>
            </div>
            <div className="detail-date">
              {dayjs(entry.date).format('YYYY年MM月DD日 HH:mm')}
            </div>
          </div>

          {entry.title && (
            <h1 className="detail-title">{entry.title}</h1>
          )}

          <div className="detail-content">
            {entry.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {entry.tags && entry.tags.length > 0 && (
            <div className="detail-tags">
              <div className="tags-label">标签：</div>
              <div className="tags-list">
                {entry.tags.map(tag => (
                  <Tag key={tag} color="blue" className="detail-tag">
                    {tag}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          <Divider />

          <div className="detail-meta">
            <div className="meta-item">
              <span className="meta-label">创建时间：</span>
              <span className="meta-value">
                {dayjs(entry.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </span>
            </div>
            {entry.updatedAt && entry.updatedAt !== entry.createdAt && (
              <div className="meta-item">
                <span className="meta-label">最后编辑：</span>
                <span className="meta-value">
                  {dayjs(entry.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default JournalDetail;
