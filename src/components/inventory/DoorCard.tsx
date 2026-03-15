"use client"

import React from 'react';
import Image from 'next/image';
import { Door } from '@/lib/inventory-types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Edit2, Package, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoorCardProps {
  door: Door;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onDelete?: (id: string) => void;
}

export function DoorCard({ door, onUpdateQuantity, onDelete }: DoorCardProps) {
  const isOutOfStock = door.quantity === 0;

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl border-none bg-white/80 backdrop-blur-sm">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={door.imageUrl}
          alt={door.name}
          fill
          className={cn(
            "object-cover transition-transform duration-500 group-hover:scale-110",
            isOutOfStock && "door-grayscale"
          )}
        />
        {isOutOfStock && (
          <div className="no-stock-label font-headline">
            غير موجود
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <Badge variant="secondary" className="font-semibold shadow-sm bg-white/90 text-primary border-none">
            {door.code}
          </Badge>
          <Badge className={cn(
            "shadow-sm border-none",
            isOutOfStock ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
          )}>
            {isOutOfStock ? "نفذت الكمية" : `الكمية: ${door.quantity}`}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="text-xl font-headline font-bold text-primary mb-1 line-clamp-1">{door.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
          <span className="font-semibold text-accent-foreground">{door.style}</span>
          <span>•</span>
          <span>{door.material}</span>
        </p>
        
        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 flex items-center bg-background rounded-md px-2 border border-input">
            <Package className="w-4 h-4 text-muted-foreground mr-1" />
            <Input
              type="number"
              min="0"
              value={door.quantity}
              onChange={(e) => onUpdateQuantity(door.id, parseInt(e.target.value) || 0)}
              className="border-none shadow-none focus-visible:ring-0 text-center text-lg font-bold h-9"
            />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9 border-accent hover:bg-accent/10">
            <Edit2 className="w-4 h-4 text-accent-foreground" />
          </Button>
          {onDelete && (
             <Button variant="ghost" size="icon" onClick={() => onDelete(door.id)} className="h-9 w-9 text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4" />
             </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
