"use client";

import { useState, useRef, useCallback, useId, useEffect } from "react";
import { UnsplashCollection } from "@/types/unsplash";
import { useDebounce } from "@/hooks/useDebounce";
import { useCollectionSearch } from "@/hooks/useCollectionSearch";
import { SearchSuggestions } from "@/components/SearchSuggestions";

interface SearchBarProps {
  onSelectCollection: (collection: UnsplashCollection) => void;
  onClear: () => void;
  activeCollectionTitle?: string;
}

export function SearchBar({ onSelectCollection, onClear, activeCollectionTitle }: SearchBarProps) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputValue, setInputValue] = useState(activeCollectionTitle ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debouncedQuery = useDebounce(inputValue, 350);
  const { collections, isLoading } = useCollectionSearch(debouncedQuery);

  // Sync input when parent clears or restores selection
  useEffect(() => {
    setInputValue(activeCollectionTitle ?? "");
  }, [activeCollectionTitle]);

  const showDropdown = isOpen && debouncedQuery.trim().length >= 2;

  const selectCollection = useCallback(
    (collection: UnsplashCollection) => {
      setInputValue(collection.title);
      setIsOpen(false);
      setActiveIndex(-1);
      onSelectCollection(collection);
      inputRef.current?.blur();
    },
    [onSelectCollection]
  );

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    setActiveIndex(-1);
  }, []);

  const handleFocus = useCallback(() => {
    if (inputValue.trim().length >= 2) setIsOpen(true);
  }, [inputValue]);

  const handleBlur = useCallback(() => {
    // Delay so onMouseDown on a suggestion fires first
    setTimeout(() => setIsOpen(false), 150);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown && e.key !== "Escape") return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setIsOpen(true);
          setActiveIndex((prev) => (prev < collections.length - 1 ? prev + 1 : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : collections.length - 1));
          break;
        case "Enter":
          e.preventDefault();
          if (collections.length > 0) {
            const target = activeIndex >= 0 ? collections[activeIndex] : collections[0];
            selectCollection(target);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setActiveIndex(-1);
          inputRef.current?.blur();
          break;
      }
    },
    [showDropdown, collections, activeIndex, selectCollection]
  );

  const handleClear = useCallback(() => {
    setInputValue("");
    setIsOpen(false);
    setActiveIndex(-1);
    onClear();
    inputRef.current?.focus();
  }, [onClear]);

  const activedescendant = showDropdown && activeIndex >= 0 ? `option-${activeIndex}` : undefined;

  return (
    <div className="relative w-full">
      {/* Combobox wrapper */}
      <div
        role="combobox"
        aria-expanded={showDropdown}
        aria-haspopup="listbox"
        aria-owns={listboxId}
        className="relative"
      >
        {/* Search icon */}
        <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-neutral-500">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
            />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="search"
          role="searchbox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={activedescendant}
          aria-label="Search collections"
          placeholder="Search collections (e.g. nature, travel...)"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-2xl bg-neutral-900 border border-neutral-700 px-4 py-3 pl-11
            pr-10 text-sm text-white placeholder:text-neutral-500
            focus:outline-none focus:border-neutral-400
            transition-colors duration-150
            [&::-webkit-search-cancel-button]:hidden"
        />

        {/* Clear button */}
        {inputValue && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={handleClear}
            className="absolute inset-y-0 right-3 flex items-center px-1 text-neutral-500
              hover:text-neutral-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showDropdown && (
        <SearchSuggestions
          id={listboxId}
          collections={collections}
          isLoading={isLoading}
          activeIndex={activeIndex}
          query={debouncedQuery}
          onSelect={selectCollection}
          onHover={setActiveIndex}
        />
      )}
    </div>
  );
}
