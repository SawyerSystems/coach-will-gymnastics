import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { apiRequest } from '../lib/queryClient';

interface LessonType {
  id: number;
  name: string;
  description?: string;
  price: number;
  reservationFee?: number;
  keyPoints?: string[];
  duration: number;
  isPrivate: boolean;
  maxAthletes: number;
  isActive: boolean;
}

interface LessonTypeFormData {
  name: string;
  description: string;
  price: string;
  reservationFee: string;
  keyPoints: string[];
  duration: string;
  isPrivate: boolean;
  maxAthletes: string;
  isActive: boolean;
}

const initialFormData: LessonTypeFormData = {
  name: '',
  description: '',
  price: '',
  reservationFee: '0',
  keyPoints: [],
  duration: '',
  isPrivate: false,
  maxAthletes: '1',
  isActive: true
};

export function AdminLessonTypeManager() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<LessonTypeFormData>(initialFormData);
  const [newKeyPoint, setNewKeyPoint] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: lessonTypes = [], isLoading, error } = useQuery<LessonType[]>({
    queryKey: ['/api/lesson-types'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/lesson-types');
      return response.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: LessonTypeFormData) => {
      const response = await apiRequest('POST', '/api/admin/lesson-types', {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        reservationFee: parseFloat(data.reservationFee),
        keyPoints: data.keyPoints,
        duration: parseInt(data.duration),
        isPrivate: data.isPrivate,
        maxAthletes: parseInt(data.maxAthletes),
        isActive: data.isActive
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lesson-types'] });
      setIsCreating(false);
      setFormData(initialFormData);
      toast({
        title: "Success",
        description: "Lesson type created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create lesson type",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: LessonTypeFormData }) => {
      const response = await apiRequest('PUT', `/api/admin/lesson-types/${id}`, {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        reservationFee: parseFloat(data.reservationFee),
        keyPoints: data.keyPoints,
        duration: parseInt(data.duration),
        isPrivate: data.isPrivate,
        maxAthletes: parseInt(data.maxAthletes),
        isActive: data.isActive
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lesson-types'] });
      setEditingId(null);
      setFormData(initialFormData);
      toast({
        title: "Success",
        description: "Lesson type updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update lesson type",
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/admin/lesson-types/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lesson-types'] });
      toast({
        title: "Success",
        description: "Lesson type deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete lesson type",
        variant: "destructive",
      });
    }
  });

  const handleCreate = () => {
    setIsCreating(true);
    setFormData(initialFormData);
  };

  const handleEdit = (lessonType: LessonType) => {
    setEditingId(lessonType.id);
    setFormData({
      name: lessonType.name,
      description: lessonType.description || '',
      price: (lessonType.price || 0).toString(),
      reservationFee: (lessonType.reservationFee || 0).toString(),
      keyPoints: lessonType.keyPoints || [],
      duration: (lessonType.duration || 30).toString(),
      isPrivate: lessonType.isPrivate ?? false,
      maxAthletes: (lessonType.maxAthletes || 1).toString(),
      isActive: lessonType.isActive ?? true,
      sortOrder: (lessonType.sortOrder || 0).toString()
    });
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this lesson type?')) {
      deleteMutation.mutate(id);
    }
  };

  const addKeyPoint = () => {
    if (newKeyPoint.trim()) {
      setFormData(prev => ({
        ...prev,
        keyPoints: [...prev.keyPoints, newKeyPoint.trim()]
      }));
      setNewKeyPoint('');
    }
  };

  const removeKeyPoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keyPoints: prev.keyPoints.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return <div>Loading lesson types...</div>;
  }

  if (error) {
    return <div>Error loading lesson types: {(error as Error).message}</div>;
  }

  const showForm = isCreating || editingId !== null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Lesson Type Management</h2>
        {!showForm && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Lesson Type
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Edit Lesson Type' : 'Create New Lesson Type'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter lesson type name"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="30"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter lesson type description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="40.00"
                />
              </div>
              <div>
                <Label htmlFor="reservationFee">Reservation Fee ($)</Label>
                <Input
                  id="reservationFee"
                  type="number"
                  step="0.01"
                  value={formData.reservationFee}
                  onChange={(e) => setFormData(prev => ({ ...prev, reservationFee: e.target.value }))}
                  placeholder="10.00"
                />
              </div>
            </div>

            <div>
              <Label>Key Points</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newKeyPoint}
                    onChange={(e) => setNewKeyPoint(e.target.value)}
                    placeholder="Add a key point"
                    onKeyPress={(e) => e.key === 'Enter' && addKeyPoint()}
                  />
                  <Button type="button" onClick={addKeyPoint}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.keyPoints.map((point, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeKeyPoint(index)}>
                      {point} <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="maxAthletes">Max Athletes</Label>
                <Input
                  id="maxAthletes"
                  type="number"
                  value={formData.maxAthletes}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxAthletes: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPrivate"
                    checked={formData.isPrivate}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPrivate: !!checked }))}
                  />
                  <Label htmlFor="isPrivate">Private Lesson</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: !!checked }))}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {editingId ? 'Update' : 'Create'}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {lessonTypes.map((lessonType) => (
          <Card key={lessonType.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{lessonType.name}</h3>
                    <Badge variant={lessonType.isActive ? 'default' : 'secondary'}>
                      {lessonType.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant={lessonType.isPrivate ? 'outline' : 'secondary'}>
                      {lessonType.isPrivate ? 'Private' : 'Semi-Private'}
                    </Badge>
                  </div>
                  {lessonType.description && (
                    <p className="text-gray-600 mb-2">{lessonType.description}</p>
                  )}
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Price:</span> ${lessonType.price}
                    </div>
                    <div>
                      <span className="font-medium">Reservation Fee:</span> ${lessonType.reservationFee || 0}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {lessonType.duration} min
                    </div>
                    <div>
                      <span className="font-medium">Max Athletes:</span> {lessonType.maxAthletes}
                    </div>
                  </div>
                  {lessonType.keyPoints && lessonType.keyPoints.length > 0 && (
                    <div className="mt-2">
                      <span className="font-medium text-sm">Key Points:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {lessonType.keyPoints.map((point, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {point}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(lessonType)}
                    disabled={showForm}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(lessonType.id)}
                    disabled={showForm || deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
