import React from 'react';
import { MOOD_TYPES } from '../../utils/moodConstants';
import './MoodSelector.css';

/**
 * 心情选择器组件
 * @param {Object} props
 * @param {Object} props.value - 当前选中的心情对象
 * @param {Function} props.onChange - 心情变化回调
 * @param {boolean} props.disabled - 是否禁用
 */
const MoodSelector = ({ value, onChange, disabled = false }) => {
  const handleSelect = (mood) => {
    if (!disabled) {
      onChange(mood);
    }
  };

  return (
    <div className="mood-selector">
      {MOOD_TYPES.map((mood) => (
        <div
          key={mood.value}
          className={`mood-item ${value?.value === mood.value ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
          onClick={() => handleSelect(mood)}
          style={{
            borderColor: value?.value === mood.value ? mood.color : 'transparent'
          }}
        >
          <div className="mood-icon" style={{ fontSize: '32px' }}>
            {mood.icon}
          </div>
          <div className="mood-name">{mood.name}</div>
          <div 
            className="mood-color-indicator" 
            style={{ backgroundColor: mood.color }}
          />
        </div>
      ))}
    </div>
  );
};

export default MoodSelector;
