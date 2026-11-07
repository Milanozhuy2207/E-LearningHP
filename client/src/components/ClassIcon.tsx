import React from 'react';
import { SiPython, SiJavascript, SiUnity } from 'react-icons/si';
import { LuGlobe, LuUser } from 'react-icons/lu';
import { TbRobot } from 'react-icons/tb';

interface IconProps {
  name?: string;
  size?: number;
  color?: string;
  className?: string;
}

export const ClassIcon: React.FC<IconProps> = ({
  name = 'web',
  size = 20,
  color,
  className = ''
}) => {
  const key = name.toLowerCase();
  if (key === 'python') {
    return (
      <SiPython
        size={size}
        color={color || '#38bdf8'}
        className={`react-icon ${className}`}
      />
    );
  }
  if (key === 'javascript') {
    return (
      <SiJavascript
        size={size}
        color={color || '#facc15'}
        className={`react-icon ${className}`}
      />
    );
  }
  if (key === 'unity') {
    return (
      <SiUnity
        size={size}
        color={color || '#c084fc'}
        className={`react-icon ${className}`}
      />
    );
  }
  if (key === 'robotics' || key === 'bot') {
    return (
      <TbRobot
        size={size}
        color={color || '#fb923c'}
        className={`react-icon ${className}`}
      />
    );
  }
  return (
    <LuGlobe
      size={size}
      color={color || '#38bdf8'}
      className={`react-icon ${className}`}
    />
  );
};

export const StudentAvatarIcon: React.FC<{ avatar?: string; size?: number }> = ({
  size = 20
}) => {
  return <LuUser size={size} color="#38bdf8" className="react-icon" />;
};
