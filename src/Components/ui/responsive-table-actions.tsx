import React, {useEffect, useRef, useState} from 'react';
import {Button} from '@/components/ui/button';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,} from '@/components/ui/dropdown-menu';
import {LucideIcon, MoreVertical} from 'lucide-react';
import {cn} from '@/utils/css-utils';

export interface TableAction {
  key: string;
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  className?: string;
  separator?: boolean;
  disabled?: boolean;
  hidden?: boolean;
}

interface ResponsiveTableActionsProps {
  actions: TableAction[];
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function ResponsiveTableActions({ 
  actions, 
  size = 'sm',
  className 
}: ResponsiveTableActionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(0);

  // Filter out hidden actions
  const visibleActions = actions.filter(action => !action.hidden);

  // Calculate how many actions can fit based on container width
  useEffect(() => {
    if (!containerRef.current) return;

    const calculateVisibleActions = () => {
      const container = containerRef.current;
      if (!container) return;

      const width = container.offsetWidth;

      // Constants for calculation
      const dropdownButtonWidth = 32; // Width of the "..." button
      const buttonGap = 4; // Gap between buttons
      const minButtonWidth = 100; // Minimum width for a button with text
      const padding = 8; // Container padding

      // Calculate available width for action buttons
      const availableWidth = width - dropdownButtonWidth - padding;

      // Calculate how many buttons can fit
      let buttonsCount = Math.floor((availableWidth + buttonGap) / (minButtonWidth + buttonGap));
      
      // Ensure we don't show more buttons than we have actions
      buttonsCount = Math.min(buttonsCount, visibleActions.length);

      // If all actions can fit, show them all without dropdown
      if (buttonsCount === visibleActions.length) {
        // Check if we actually have enough space for all buttons without dropdown
        const totalButtonsWidth = visibleActions.length * minButtonWidth + (visibleActions.length - 1) * buttonGap;
        if (totalButtonsWidth <= width - padding) {
          setVisibleCount(visibleActions.length);
        } else {
          setVisibleCount(Math.max(0, buttonsCount - 1)); // Leave room for dropdown
        }
      } else {
        setVisibleCount(Math.max(0, buttonsCount));
      }
    };

    // Initial calculation
    calculateVisibleActions();

    // Set up ResizeObserver for responsive behavior
    const resizeObserver = new ResizeObserver(() => {
      calculateVisibleActions();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [visibleActions.length]);

  // Split actions into visible buttons and dropdown items
  const buttonActions = visibleActions.slice(0, visibleCount);
  const dropdownActions = visibleActions.slice(visibleCount);

  // Don't show dropdown if all actions are visible as buttons
  const showDropdown = dropdownActions.length > 0;

  return (
    <div 
      ref={containerRef} 
      className={cn('flex items-center justify-end gap-1', className)}
    >
      {/* Visible action buttons */}
      {buttonActions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.key}
            variant={action.variant || 'outline'}
            size={size}
            onClick={action.onClick}
            disabled={action.disabled}
            className={cn(
              'whitespace-nowrap',
              action.className
            )}
          >
            {Icon && <Icon className="h-4 w-4 mr-1.5" />}
            <span>{action.label}</span>
          </Button>
        );
      })}

      {/* Dropdown menu for overflow actions */}
      {showDropdown && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size={size}
              className="h-8 w-8 p-0"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {dropdownActions.map((action, index) => {
              const Icon = action.icon;
              const showSeparator = action.separator || 
                (index > 0 && dropdownActions[index - 1].variant !== action.variant && 
                 action.variant === 'destructive');

              return (
                <React.Fragment key={action.key}>
                  {showSeparator && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={cn(
                      'cursor-pointer',
                      action.variant === 'destructive' && 'text-red-600 focus:text-red-600',
                      action.className
                    )}
                  >
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    {action.label}
                  </DropdownMenuItem>
                </React.Fragment>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}