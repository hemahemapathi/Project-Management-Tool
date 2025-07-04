import React from 'react';

const FilterSort = ({ filters, sortOptions, onFilterChange, onSortChange }) => {
  return (
    <div className="filter-sort">
      <select onChange={(e) => onFilterChange(e.target.value)}>
        <option value="">All</option>
        {filters.map((filter) => (
          <option key={filter} value={filter}>{filter}</option>
        ))}
      </select>
      <select onChange={(e) => onSortChange(e.target.value)}>
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
};

export default FilterSort;
