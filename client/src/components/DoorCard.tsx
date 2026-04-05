import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Edit2 } from 'lucide-react';

interface Door {
  id: number;
  code: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DoorCardProps {
  door: Door;
  isAdmin: boolean;
  onDelete: (id: number) => void;
  onEdit: (door: Door) => void;
}

export default function DoorCard({ door, isAdmin, onDelete, onEdit }: DoorCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-[3/4] bg-gray-200 overflow-hidden group">
        <img
          src={door.imageUrl}
          alt={door.code}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <CardContent className="p-4 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900">{door.code}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(door.createdAt).toLocaleDateString('ar-SA')}
          </p>
        </div>

        {isAdmin && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={() => onEdit(door)}
            >
              <Edit2 className="w-4 h-4" />
              تعديل
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="flex-1 gap-2"
              onClick={() => onDelete(door.id)}
            >
              <Trash2 className="w-4 h-4" />
              حذف
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
