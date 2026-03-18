
"use client"

import React from 'react';
import Image from 'next/image';
import { Door } from '@/lib/inventory-types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Maximize2 } from 'lucide-react';

interface DoorCardProps {
  door: Door;
  isAdmin: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (door: Door) => void;
  onImageClick: (imageUrl: string) => void;
}

export function DoorCard({ door, isAdmin, onDelete, onEdit, onImageClick }: DoorCardProps) {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl border-none bg-white/80 backdrop-blur-sm">
      <div 
        className="relative aspect-[3/4] overflow-hidden cursor-zoom-in"
        onClick={() => onImageClick(door.imageUrl)}
      >
        <Image
          src={door.imageUrl}
          alt={door.code}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8" />
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="font-semibold shadow-sm bg-white/90 text-primary border-none text-lg px-3">
            {door.code}
          </Badge>
        </div>
      </div>
      
      {isAdmin && (
        <div className="p-3 flex justify-end gap-2 border-t bg-white/50">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-9 w-9 border-accent hover:bg-accent/10"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(door);
            }}
          >
            <Edit2 className="w-4 h-4 text-accent-foreground" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              if (door.id) {
                onDelete?.(door.id);
              }
            }} 
            className="h-9 w-9 text-destructive hover:bg-destructive/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}
