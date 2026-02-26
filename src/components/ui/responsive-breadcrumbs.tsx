import React, { useEffect, useRef, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Home } from 'lucide-react';
import { cn } from '@/utils/css-utils';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  priority?: 'high' | 'normal' | 'low';
  icon?: React.ReactNode;
}

interface ResponsiveBreadcrumbsProps {
  items: BreadcrumbItem[];
  homeLabel?: string;
  onHomeClick?: () => void;
  className?: string;
}

export const ResponsiveBreadcrumbs: React.FC<ResponsiveBreadcrumbsProps> = ({
  items,
  homeLabel,
  onHomeClick,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const [hiddenItems, setHiddenItems] = useState<number[]>([]);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // Check for overflow and determine which items to show/hide
  useEffect(() => {
    const checkOverflow = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.offsetWidth;

      // If no width available yet, retry
      if (containerWidth === 0) {
        setTimeout(checkOverflow, 100);
        return;
      }

      // Temporarily show all items to measure their actual width
      setVisibleItems(items.map((_, i) => i));
      setHiddenItems([]);
      setIsOverflowing(false);

      // Wait for render then measure
      setTimeout(() => {
        const allItems = container.querySelectorAll('[data-breadcrumb-item]');
        let totalWidth = 0;
        const itemWidths: number[] = [];
        const visible: number[] = [];
        const hidden: number[] = [];

        // Calculate width of each item including separators
        allItems.forEach((item) => {
          const width = (item as HTMLElement).offsetWidth + 20; // Add margin for separator
          itemWidths.push(width);
        });

        // Reserve space for dropdown and some padding
        const dropdownWidth = 120;
        const availableWidth = Math.max(containerWidth - dropdownWidth, containerWidth * 0.7);

        // Prioritize showing items
        if (items.length > 0) {
          // Always show last item (current location)
          if (items.length > 0 && itemWidths[items.length - 1]) {
            totalWidth += itemWidths[items.length - 1];
            visible.push(items.length - 1);
          }

          // Try to show high priority items
          items.forEach((item, index) => {
            if (
              item.priority === 'high' &&
              !visible.includes(index) &&
              itemWidths[index] &&
              totalWidth + itemWidths[index] <= availableWidth
            ) {
              totalWidth += itemWidths[index];
              visible.push(index);
            }
          });

          // Try to show first item if space allows
          if (!visible.includes(0) && itemWidths[0] && totalWidth + itemWidths[0] <= availableWidth) {
            totalWidth += itemWidths[0];
            visible.push(0);
          }

          // Add remaining items if space allows
          items.forEach((_, index) => {
            if (
              !visible.includes(index) &&
              itemWidths[index] &&
              totalWidth + itemWidths[index] <= availableWidth
            ) {
              totalWidth += itemWidths[index];
              visible.push(index);
            } else if (!visible.includes(index)) {
              hidden.push(index);
            }
          });
        }

        // Sort visible items to maintain order
        visible.sort((a, b) => a - b);

        setVisibleItems(visible);
        setHiddenItems(hidden);
        setIsOverflowing(hidden.length > 0);
      }, 0);
    };

    // Initial check
    checkOverflow();

    // Setup resize observer
    const resizeObserver = new ResizeObserver(checkOverflow);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [items]);

  // Render breadcrumb item
  const renderBreadcrumbItem = (item: BreadcrumbItem, index: number, isLast: boolean) => {
    const content = (
      <span className="flex items-center">
        {item.icon && <span className="mr-1 flex-shrink-0">{item.icon}</span>}
        <span className="truncate max-w-[80px] sm:max-w-[120px] md:max-w-[200px]">{item.label}</span>
      </span>
    );

    if (item.onClick) {
      return (
        <button
          key={index}
          data-breadcrumb-item
          className="cursor-pointer text-xs md:text-base font-medium text-gray-700 hover:text-gray-900 underline focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 md:px-2 py-0.5 md:py-1 transition-all min-w-0 flex items-center"
          onClick={item.onClick}
          title={item.label}
        >
          {content}
        </button>
      );
    }

    return (
      <span
        key={index}
        data-breadcrumb-item
        className={cn(
          "text-xs md:text-base font-medium min-w-0 flex items-center px-1 md:px-2",
          isLast ? "text-gray-900 font-semibold" : "text-gray-600"
        )}
        title={item.label}
      >
        {content}
      </span>
    );
  };

  return (
    <nav
      ref={containerRef}
      className={cn("flex items-center gap-1 md:gap-2 overflow-hidden w-full", className)}
      aria-label="Breadcrumb"
    >
      {/* Home/Root breadcrumb */}
      {homeLabel && (
        <>
          {onHomeClick ? (
            <button
              data-breadcrumb-item
              className="cursor-pointer text-xs md:text-lg font-semibold text-gray-700 hover:text-gray-900 underline focus:outline-none focus:ring-2 focus:ring-blue-600 rounded px-1 md:px-2 py-0.5 md:py-1 transition-all whitespace-nowrap flex items-center flex-shrink-0"
              onClick={onHomeClick}
            >
              <Home className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
              <span className="truncate max-w-[100px] sm:max-w-[150px] md:max-w-none">{homeLabel}</span>
            </button>
          ) : (
            <span
              data-breadcrumb-item
              className="text-xs md:text-lg font-semibold text-gray-900 whitespace-nowrap flex items-center flex-shrink-0"
            >
              <Home className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
              <span className="truncate max-w-[100px] sm:max-w-[150px] md:max-w-none">{homeLabel}</span>
            </span>
          )}
        </>
      )}

      {/* Visible breadcrumbs with overflow handling */}
      <div className="flex items-center gap-1 md:gap-2 min-w-0 flex-1 overflow-hidden">
        {items.map((item, index) => {
          const isVisible = !isOverflowing || visibleItems.includes(index);
          const isLast = index === items.length - 1;

          if (!isVisible) return null;

          // Show dropdown before non-consecutive items
          const prevVisibleIndex = visibleItems[visibleItems.indexOf(index) - 1];
          const showDropdownBefore = isOverflowing &&
            visibleItems.includes(index) &&
            prevVisibleIndex !== undefined &&
            prevVisibleIndex !== index - 1;

          return (
            <React.Fragment key={index}>
              {showDropdownBefore && hiddenItems.length > 0 && (
                <>
                  <span className="text-gray-400 text-xs md:text-base">/</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center gap-1 px-2 py-1 text-xs md:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
                      <span className="hidden sm:inline">More</span>
                      <span className="sm:hidden">...</span>
                      <ChevronDown className="h-3 w-3" />
                      {hiddenItems.length > 0 && (
                        <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                          {hiddenItems.length}
                        </span>
                      )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      {hiddenItems.map((hiddenIndex) => (
                        <DropdownMenuItem
                          key={hiddenIndex}
                          onClick={items[hiddenIndex].onClick}
                          disabled={!items[hiddenIndex].onClick}
                          className="cursor-pointer"
                        >
                          {items[hiddenIndex].icon && (
                            <span className="mr-2">{items[hiddenIndex].icon}</span>
                          )}
                          {items[hiddenIndex].label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
              {(index > 0 || homeLabel) && (
                <span className="text-gray-400 text-xs md:text-base">/</span>
              )}
              {renderBreadcrumbItem(item, index, isLast)}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};