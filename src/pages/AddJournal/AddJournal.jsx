import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, Button, DatePicker, Select, Tag, Card, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMoodContext } from '../../context/MoodContext';
import MoodSelector from '../../components/MoodSelector/MoodSelector';
import { validateJournalForm } from '../../utils/moodValidation';
import { FORM_RULES } from '../../utils/moodConstants';
import './AddJournal.css';

const { TextArea } = Input;

const AddJournal = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createEntry, updateEntry, getEntryById, tags, createTag } = useMoodContext();
  
  const [form] = Form.useForm();
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (id) {
      // 编辑模式，加载日记数据
      const entry = getEntryById(id);
      if (entry) {
        setIsEdit(true);
        setSelectedMood(entry.mood);
        setSelectedTags(entry.tags || []);
        form.setFieldsValue({
          date: dayjs(entry.date),
          title: entry.title,
          content: entry.content
        });
      } else {
        navigate('/journals');
      }
    } else {
      // 新增模式，设置默认日期为当前时间
      form.setFieldsValue({
        date: dayjs()
      });
    }
  }, [id]);

  const handleMoodChange = (mood) => {
    setSelectedMood(mood);
    form.setFieldsValue({ mood: mood.name });
  };

  const handleTagClose = (removedTag) => {
    setSelectedTags(selectedTags.filter(tag => tag !== removedTag));
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) {
      return;
    }
    
    if (selectedTags.length >= FORM_RULES.MAX_TAGS_COUNT) {
      form.setFields([{
        name: 'tags',
        errors: [`最多只能选择${FORM_RULES.MAX_TAGS_COUNT}个标签`]
      }]);
      return;
    }
    
    if (selectedTags.includes(newTagName.trim())) {
      setNewTagName('');
      return;
    }
    
    // 检查标签是否已存在
    const existingTag = tags.find(t => t.name === newTagName.trim());
    if (!existingTag) {
      // 创建新标签
      await createTag(newTagName.trim());
    }
    
    setSelectedTags([...selectedTags, newTagName.trim()]);
    setNewTagName('');
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 验证心情是否选择
      if (!selectedMood) {
        form.setFields([{
          name: 'mood',
          errors: ['请选择心情']
        }]);
        return;
      }

      const journalData = {
        date: values.date.toISOString(),
        mood: selectedMood,
        title: values.title || `${dayjs(values.date).format('YYYY-MM-DD')} ${selectedMood.name}`,
        content: values.content,
        tags: selectedTags
      };

      // 表单验证
      const validation = validateJournalForm(journalData);
      if (!validation.valid) {
        Object.keys(validation.errors).forEach(key => {
          form.setFields([{
            name: key,
            errors: [validation.errors[key]]
          }]);
        });
        return;
      }

      setLoading(true);
      
      let success;
      if (isEdit) {
        success = await updateEntry(id, journalData);
      } else {
        success = await createEntry(journalData);
      }
      
      if (success) {
        navigate('/journals');
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="add-journal-page">
      <Card 
        title={isEdit ? '编辑日记' : '新增日记'}
        className="add-journal-card"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="日期时间"
            name="date"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%' }}
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Form.Item>

          <Form.Item
            label="选择心情"
            name="mood"
            required
          >
            <MoodSelector
              value={selectedMood}
              onChange={handleMoodChange}
            />
          </Form.Item>

          <Form.Item
            label="日记标题"
            name="title"
            extra={`选填，默认为"日期+心情"，最多${FORM_RULES.MAX_TITLE_LENGTH}字`}
          >
            <Input
              placeholder="请输入日记标题"
              maxLength={FORM_RULES.MAX_TITLE_LENGTH}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="日记内容"
            name="content"
            rules={[
              { required: true, message: '请填写日记内容' },
              { max: FORM_RULES.MAX_CONTENT_LENGTH, message: `内容不能超过${FORM_RULES.MAX_CONTENT_LENGTH}字` }
            ]}
          >
            <TextArea
              placeholder="记录下此刻的心情和想法..."
              rows={8}
              maxLength={FORM_RULES.MAX_CONTENT_LENGTH}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="标签"
            name="tags"
            extra={`已选择 ${selectedTags.length}/${FORM_RULES.MAX_TAGS_COUNT} 个标签`}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div className="tags-container">
                {selectedTags.map(tag => (
                  <Tag
                    key={tag}
                    closable
                    onClose={() => handleTagClose(tag)}
                    color="blue"
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
              
              <Space.Compact style={{ width: '100%' }}>
                <Select
                  style={{ width: 'calc(100% - 80px)' }}
                  placeholder="选择已有标签"
                  value={newTagName}
                  onChange={setNewTagName}
                  showSearch
                  options={tags.map(tag => ({
                    label: `${tag.name} (${tag.count})`,
                    value: tag.name
                  }))}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddTag}
                  disabled={selectedTags.length >= FORM_RULES.MAX_TAGS_COUNT}
                >
                  添加
                </Button>
              </Space.Compact>
            </Space>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancel}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? '更新' : '保存'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddJournal;
