import React from 'react';
import { Card, Tag, Space, Button, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import './JournalCard.css';

/**
 * 日记卡片组件
 * @param {Object} props
 * @param {Object} props.entry - 日记数据
 * @param {Function} props.onDelete - 删除回调
 * @param {boolean} props.showActions - 是否显示操作按钮
 */
const JournalCard = ({ entry, onDelete, showActions = true }) => {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/journals/${entry.id}`);
  };

  const handleEdit = () => {
    navigate(`/edit/${entry.id}`);
  };

  const handleDelete = () => {
    onDelete && onDelete(entry.id);
  };

  // 获取内容摘要（前30字）
  const getContentPreview = (content) => {
    if (!content) return '';
    return content.length > 30 ? content.substring(0, 30) + '...' : content;
  };

  return (
    <Card
      className="journal-card"
      hoverable
      onClick={handleView}
      style={{ borderLeft: `4px solid ${entry.mood.color}` }}
    >
      <div className="journal-card-header">
        <div className="journal-mood">
          <span className="mood-icon">{entry.mood.icon}</span>
          <span className="mood-name">{entry.mood.name}</span>
        </div>
        <div className="journal-date">
          {dayjs(entry.date).format('YYYY-MM-DD HH:mm')}
        </div>
      </div>

      <div className="journal-card-body">
        {entry.title && (
          <h3 className="journal-title">{entry.title}</h3>
        )}
        <p className="journal-content-preview">
          {getContentPreview(entry.content)}
        </p>
      </div>

      {entry.tags && entry.tags.length > 0 && (
        <div className="journal-tags">
          {entry.tags.map(tag => (
            <Tag key={tag} color="blue">
              {tag}
            </Tag>
          ))}
        </div>
      )}

      {showActions && (
        <div className="journal-actions" onClick={(e) => e.stopPropagation()}>
          <Space>
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={handleView}
              size="small"
            >
              查看
            </Button>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={handleEdit}
              size="small"
            >
              编辑
            </Button>
            <Popconfirm
              title="确定要删除这条日记吗？"
              onConfirm={handleDelete}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        </div>
      )}
    </Card>
  );
};

export default JournalCard;
