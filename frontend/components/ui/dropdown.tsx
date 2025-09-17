'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface DropdownItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean;
  className?: string;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  align?: 'left' | 'right';
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  onOpen?: () => void;
  onClose?: () => void;
  closeOnItemClick?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  position = 'bottom-left',
  align = 'left',
  disabled = false,
  className = '',
  contentClassName = '',
  onOpen,
  onClose,
  closeOnItemClick = true,
  closeOnOutsideClick = true,
  closeOnEscape = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen && triggerRef.current && dropdownRef.current) {
      updateDropdownPosition();
    }
  }, [isOpen, position, align]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape' && isOpen) {
        closeDropdown();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (closeOnOutsideClick && isOpen && 
          triggerRef.current && 
          !triggerRef.current.contains(event.target as Node) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeOnEscape, closeOnOutsideClick]);

  const updateDropdownPosition = () => {
    if (!triggerRef.current || !dropdownRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    let top = 0;
    let left = 0;

    // Calculate position based on position prop
    switch (position) {
      case 'bottom-left':
        top = triggerRect.bottom + scrollTop + 4;
        left = triggerRect.left + scrollLeft;
        break;
      case 'bottom-right':
        top = triggerRect.bottom + scrollTop + 4;
        left = triggerRect.right + scrollLeft - dropdownRect.width;
        break;
      case 'top-left':
        top = triggerRect.top + scrollTop - dropdownRect.height - 4;
        left = triggerRect.left + scrollLeft;
        break;
      case 'top-right':
        top = triggerRect.top + scrollTop - dropdownRect.height - 4;
        left = triggerRect.right + scrollLeft - dropdownRect.width;
        break;
    }

    // Adjust alignment
    if (align === 'right') {
      if (position.includes('left')) {
        left = triggerRect.right + scrollLeft - dropdownRect.width;
      } else if (position.includes('right')) {
        left = triggerRect.left + scrollLeft;
      }
    }

    // Keep dropdown within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 8) left = 8;
    if (left + dropdownRect.width > viewportWidth - 8) {
      left = viewportWidth - dropdownRect.width - 8;
    }
    if (top < 8) top = 8;
    if (top + dropdownRect.height > viewportHeight - 8) {
      top = viewportHeight - dropdownRect.height - 8;
    }

    setDropdownPosition({ top, left });
  };

  const openDropdown = () => {
    if (disabled) return;
    setIsOpen(true);
    onOpen?.();
  };

  const closeDropdown = () => {
    setIsOpen(false);
    onClose?.();
  };

  const toggleDropdown = () => {
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    
    item.onClick();
    
    if (closeOnItemClick) {
      closeDropdown();
    }
  };

  const getDropdownClasses = () => {
    const baseClasses = 'absolute z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[160px]';
    const visibilityClasses = isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95';
    const transitionClasses = 'transition-all duration-200 ease-in-out';
    
    return `${baseClasses} ${visibilityClasses} ${transitionClasses} ${contentClassName}`;
  };

  if (!mounted) {
    return <div className={className}>{trigger}</div>;
  }

  return (
    <>
      <div
        ref={triggerRef}
        className={`relative inline-block ${className}`}
        onClick={toggleDropdown}
      >
        {trigger}
      </div>
      
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className={getDropdownClasses()}
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left
          }}
        >
          {items.map((item, index) => (
            <div key={item.id}>
              {item.divider ? (
                <div className="border-t border-gray-200 my-1" />
              ) : (
                <button
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={`w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${item.className || ''}`}
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span className="flex-1">{item.label}</span>
                </button>
              )}
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
};

// Hook for managing dropdown state
export const useDropdown = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);

  return {
    isOpen,
    open,
    close,
    toggle
  };
};

// Simple dropdown component for basic use cases
export const SimpleDropdown: React.FC<{
  trigger: ReactNode;
  items: Array<{ label: string; onClick: () => void; disabled?: boolean }>;
  className?: string;
}> = ({ trigger, items, className = '' }) => {
  const dropdownItems: DropdownItem[] = items.map((item, index) => ({
    id: `item-${index}`,
    label: item.label,
    onClick: item.onClick,
    disabled: item.disabled
  }));

  return (
    <Dropdown
      trigger={trigger}
      items={dropdownItems}
      className={className}
    />
  );
};

// Menu dropdown component with icons
export const MenuDropdown: React.FC<{
  trigger: ReactNode;
  items: Array<{
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    disabled?: boolean;
    divider?: boolean;
  }>;
  className?: string;
}> = ({ trigger, items, className = '' }) => {
  const dropdownItems: DropdownItem[] = items.map((item, index) => ({
    id: `menu-item-${index}`,
    label: item.label,
    icon: item.icon,
    onClick: item.onClick,
    disabled: item.disabled,
    divider: item.divider
  }));

  return (
    <Dropdown
      trigger={trigger}
      items={dropdownItems}
      className={className}
    />
  );
};

// User menu dropdown component
export const UserMenuDropdown: React.FC<{
  trigger: ReactNode;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  items: Array<{
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    disabled?: boolean;
  }>;
  onSignOut: () => void;
  className?: string;
}> = ({ trigger, user, items, onSignOut, className = '' }) => {
  const dropdownItems: DropdownItem[] = [
    {
      id: 'user-info',
      label: (
        <div className="px-4 py-2 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      ),
      onClick: () => {},
      disabled: true,
      className: 'p-0 hover:bg-transparent cursor-default'
    },
    ...items.map((item, index) => ({
      id: `user-item-${index}`,
      label: item.label,
      icon: item.icon,
      onClick: item.onClick,
      disabled: item.disabled
    })),
    {
      id: 'divider',
      label: '',
      onClick: () => {},
      divider: true
    },
    {
      id: 'sign-out',
      label: 'Sign out',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      onClick: onSignOut,
      className: 'text-red-600 hover:bg-red-50'
    }
  ];

  return (
    <Dropdown
      trigger={trigger}
      items={dropdownItems}
      className={className}
    />
  );
};

export default Dropdown;
