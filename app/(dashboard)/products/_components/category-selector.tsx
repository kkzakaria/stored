"use client";

import { useState, useEffect } from "react";
import { Category } from "@prisma/client";
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type CategoryWithChildren = Category & {
  children?: CategoryWithChildren[];
};

interface CategorySelectorProps {
  categories: CategoryWithChildren[];
  value?: string;
  onValueChange: (categoryId: string) => void;
  label?: string;
  required?: boolean;
  error?: string;
}

interface CategoryTreeItemProps {
  category: CategoryWithChildren;
  selectedId?: string;
  onSelect: (categoryId: string) => void;
  level?: number;
}

function CategoryTreeItem({ category, selectedId, onSelect, level = 0 }: CategoryTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedId === category.id;

  return (
    <div>
      <CommandItem
        value={category.id}
        onSelect={() => onSelect(category.id)}
        className={cn(
          "cursor-pointer",
          isSelected && "bg-accent",
          level > 0 && `pl-${4 + level * 4}`
        )}
        style={{ paddingLeft: level > 0 ? `${16 + level * 16}px` : undefined }}
      >
        <div className="flex items-center gap-2 flex-1">
          {hasChildren && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 shrink-0" />
          ) : (
            <Folder className="h-4 w-4 shrink-0" />
          )}
          <span className="flex-1">{category.name}</span>
        </div>
      </CommandItem>

      {hasChildren && isExpanded && (
        <div>
          {category.children!.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              selectedId={selectedId}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategorySelector({
  categories,
  value,
  onValueChange,
  label = "Catégorie",
  required = false,
  error,
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Find selected category by ID (search recursively)
  useEffect(() => {
    if (!value) {
      setSelectedCategory(null);
      return;
    }

    const findCategoryById = (
      cats: CategoryWithChildren[],
      id: string
    ): Category | null => {
      for (const cat of cats) {
        if (cat.id === id) return cat;
        if (cat.children) {
          const found = findCategoryById(cat.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    setSelectedCategory(findCategoryById(categories, value));
  }, [value, categories]);

  const handleSelect = (categoryId: string) => {
    onValueChange(categoryId);
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="category">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="category"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !selectedCategory && "text-muted-foreground",
              error && "border-destructive"
            )}
          >
            {selectedCategory ? (
              <span className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                {selectedCategory.name}
              </span>
            ) : (
              "Sélectionner une catégorie"
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Rechercher une catégorie..." />
            <CommandList>
              <CommandEmpty>Aucune catégorie trouvée.</CommandEmpty>
              <CommandGroup>
                {categories.map((category) => (
                  <CategoryTreeItem
                    key={category.id}
                    category={category}
                    selectedId={value}
                    onSelect={handleSelect}
                  />
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
