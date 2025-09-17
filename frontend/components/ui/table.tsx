'use client';

import React, { useState, useMemo } from 'react';

interface Column<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  rowClassName?: string | ((row: T, index: number) => string);
  onRowClick?: (row: T, index: number) => void;
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (selectedRows: T[]) => void;
  sortable?: boolean;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  stickyHeader?: boolean;
  striped?: boolean;
  hover?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Table = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
  headerClassName = '',
  bodyClassName = '',
  rowClassName = '',
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  sortable = false,
  onSort,
  pagination,
  stickyHeader = false,
  striped = false,
  hover = true,
  size = 'md'
}: TableProps<T>) => {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const handleSort = (key: keyof T) => {
    if (!sortable) return;

    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    onSort?.(key, newDirection);
  };

  const handleSelectAll = () => {
    if (!selectable || !onSelectionChange) return;

    if (selectedRows.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange([...data]);
    }
  };

  const handleSelectRow = (row: T) => {
    if (!selectable || !onSelectionChange) return;

    const isSelected = selectedRows.includes(row);
    if (isSelected) {
      onSelectionChange(selectedRows.filter(r => r !== row));
    } else {
      onSelectionChange([...selectedRows, row]);
    }
  };

  const isRowSelected = (row: T) => {
    return selectedRows.includes(row);
  };

  const getRowClasses = (row: T, index: number) => {
    const baseClasses = 'border-b border-gray-200';
    const hoverClasses = hover ? 'hover:bg-gray-50' : '';
    const stripedClasses = striped && index % 2 === 1 ? 'bg-gray-50' : '';
    const clickableClasses = onRowClick ? 'cursor-pointer' : '';
    const selectedClasses = isRowSelected(row) ? 'bg-blue-50' : '';
    
    const customClasses = typeof rowClassName === 'function' 
      ? rowClassName(row, index) 
      : rowClassName;

    return `${baseClasses} ${hoverClasses} ${stripedClasses} ${clickableClasses} ${selectedClasses} ${customClasses}`;
  };

  const getHeaderClasses = () => {
    const baseClasses = 'bg-gray-50 text-gray-900 font-medium';
    const stickyClasses = stickyHeader ? 'sticky top-0 z-10' : '';
    return `${baseClasses} ${stickyClasses} ${headerClassName}`;
  };

  const getSortIcon = (key: keyof T) => {
    if (!sortable) return null;
    
    if (sortKey !== key) {
      return (
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortDirection === 'asc' ? (
      <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const getAlignmentClasses = (align: 'left' | 'center' | 'right' = 'left') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  if (loading) {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={getHeaderClasses()}>
            <tr>
              {selectable && (
                <th className="px-6 py-3 w-12">
                  <div className="flex items-center">
                    <div className="h-4 w-4 bg-gray-300 rounded animate-pulse"></div>
                  </div>
                </th>
              )}
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 ${getAlignmentClasses(column.align)} ${column.headerClassName || ''}`}
                  style={{ width: column.width }}
                >
                  <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`bg-white divide-y divide-gray-200 ${bodyClassName}`}>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={rowIndex} className={getRowClasses({} as T, rowIndex)}>
                {selectable && (
                  <td className="px-6 py-4">
                    <div className="h-4 w-4 bg-gray-300 rounded animate-pulse"></div>
                  </td>
                )}
                {columns.map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`overflow-x-auto ${className}`}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className={getHeaderClasses()}>
            <tr>
              {selectable && (
                <th className="px-6 py-3 w-12"></th>
              )}
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 ${getAlignmentClasses(column.align)} ${column.headerClassName || ''}`}
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">{emptyMessage}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className={`min-w-full divide-y divide-gray-200 ${sizeClasses[size]}`}>
        <thead className={getHeaderClasses()}>
          <tr>
            {selectable && (
              <th className="px-6 py-3 w-12">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </th>
            )}
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-6 py-3 ${getAlignmentClasses(column.align)} ${column.headerClassName || ''} ${
                  sortable && column.sortable !== false ? 'cursor-pointer select-none' : ''
                }`}
                style={{ width: column.width }}
                onClick={() => column.sortable !== false && handleSort(column.key)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.title}</span>
                  {getSortIcon(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`bg-white divide-y divide-gray-200 ${bodyClassName}`}>
          {data.map((row, index) => (
            <tr
              key={index}
              className={getRowClasses(row, index)}
              onClick={() => onRowClick?.(row, index)}
            >
              {selectable && (
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isRowSelected(row)}
                      onChange={() => handleSelectRow(row)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </td>
              )}
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={`px-6 py-4 ${getAlignmentClasses(column.align)} ${column.className || ''}`}
                >
                  {column.render
                    ? column.render(row[column.key], row, index)
                    : String(row[column.key] || '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Export types for external use
export type { Column, TableProps };

export default Table;
