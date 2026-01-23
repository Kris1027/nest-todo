import { useState } from 'react';

interface TodoFiltersProps {
  onSearch: (search: string) => void;
  onFilterChange: (completed: boolean | undefined) => void;
  onSortChange: (sortOrder: 'asc' | 'desc') => void;
}

export function TodoFilters({
  onSearch,
  onFilterChange,
  onSortChange,
}: TodoFiltersProps) {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  return (
    <div className="mb-4 space-y-3">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search todos..."
          className="input flex-1"
        />
        <button type="submit" className="btn btn-secondary">
          Search
        </button>
        {searchInput && (
          <button
            type="button"
            onClick={() => {
              setSearchInput('');
              onSearch('');
            }}
            className="btn btn-secondary"
          >
            Clear
          </button>
        )}
      </form>

      {/* Filters */}
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-slate-600">Status:</span>
          <select
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'all') onFilterChange(undefined);
              else if (value === 'completed') onFilterChange(true);
              else onFilterChange(false);
            }}
            className="border border-slate-300 rounded px-2 py-1"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          <span className="text-slate-600">Sort:</span>
          <select
            onChange={(e) => onSortChange(e.target.value as 'asc' | 'desc')}
            className="border border-slate-300 rounded px-2 py-1"
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </label>
      </div>
    </div>
  );
}
