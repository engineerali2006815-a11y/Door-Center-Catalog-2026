
"use client"

import React from 'react';
import Image from 'next/image';
import { Door } from '@/lib/inventory-types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2 } from 'lucide-react';

interface DoorCardProps {
  door: Door;
  isAdmin: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (door: Door) => void;
}

export function DoorCard({ door, isAdmin, onDelete, onEdit }: DoorCardProps) {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl border-none bg-white/80 backdrop-blur-sm">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={door.imageUrl}
          alt={door.code}
          fill
          className="object-cover"
        />
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
