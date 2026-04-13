'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

type Product = {
  id: number;
  name: string;
  price: number;
};

export default function ProductsPage() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => api.get('/api/products').then(r => r.data),
  });

  // Lấy số lượng item trong giỏ để hiện badge
  const { data: cartItems = [] } = useQuery<{ productId: number; quantity: number }[]>({
    queryKey: ['cart'],
    queryFn: () => api.get('/api/cart').then(r => r.data),
  });

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const addMutation = useMutation({
    mutationFn: (newProduct: { name: string; price: string }) =>
      api.post('/api/products', newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Thêm sản phẩm thành công! 🎉');
      setName(''); setPrice('');
    },
    onError: () => toast.error('Có lỗi xảy ra!'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Đã xoá sản phẩm', { icon: '🗑️' });
    },
    onError: () => toast.error('Xoá thất bại!'),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, name, price }: { id: number; name: string; price: string }) =>
      api.put(`/api/products/${id}`, { name, price: Number(price) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Cập nhật thành công! ✏️');
      setEditingId(null);
    },
    onError: () => toast.error('Cập nhật thất bại!'),
  });

  // ✅ Mutation thêm vào giỏ hàng
  const addToCartMutation = useMutation({
    mutationFn: (productId: number) =>
      api.post('/api/cart', { productId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đã thêm vào giỏ hàng! 🛒');
    },
    onError: () => toast.error('Không thêm được vào giỏ!'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    addMutation.mutate({ name, price });
  };

  const handleDelete = (id: number) => {
    if (!confirm('Bạn chắc chắn muốn xoá?')) return;
    deleteMutation.mutate(id);
  };

  const handleEditClick = (p: Product) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditPrice(String(p.price));
  };

  const handleEditSubmit = (id: number) => {
    if (!editName.trim() || !editPrice) return;
    editMutation.mutate({ id, name: editName, price: editPrice });
  };

  return (
    <main className="max-w-xl mx-auto p-6">

      {/* Header với badge giỏ hàng */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🛍️ Quản lý sản phẩm</h1>
        <Link href="/cart" className="relative">
          <span className="text-2xl">🛒</span>
          {totalCartItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {totalCartItems}
            </span>
          )}
        </Link>
      </div>

      {/* Form thêm sản phẩm */}
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg mb-6 space-y-3">
        <h2 className="font-semibold text-gray-700">Thêm sản phẩm mới</h2>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Tên sản phẩm"
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          value={price}
          onChange={e => setPrice(e.target.value)}
          placeholder="Giá (VNĐ)"
          type="number"
          min="0"
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <button
          type="submit"
          disabled={addMutation.isPending}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-medium text-sm disabled:opacity-50"
        >
          {addMutation.isPending ? 'Đang thêm...' : '+ Thêm sản phẩm'}
        </button>
      </form>

      {/* Danh sách sản phẩm */}
      {isLoading ? (
        <p className="text-center text-gray-400 text-sm py-4">Đang tải...</p>
      ) : (
        <div className="space-y-2">
          {products.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">Chưa có sản phẩm nào.</p>
          )}
          {products.map(p => (
            <div key={p.id} className="border rounded-lg bg-white shadow-sm overflow-hidden">
              {editingId !== p.id ? (
                <div className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{p.name}</p>
                      <p className="text-sm text-blue-600">{p.price.toLocaleString('vi-VN')}đ</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCartMutation.mutate(p.id)}
                        className="text-green-500 hover:text-green-700 text-sm font-medium px-3 py-1 hover:bg-green-50 rounded"
                      >
                        🛒 Thêm
                      </button>
                      <button
                        onClick={() => handleEditClick(p)}
                        className="text-yellow-500 hover:text-yellow-700 text-sm font-medium px-3 py-1 hover:bg-yellow-50 rounded"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 hover:bg-red-50 rounded disabled:opacity-50"
                      >
                        Xoá
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-yellow-50 space-y-2">
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <input
                    value={editPrice}
                    onChange={e => setEditPrice(e.target.value)}
                    type="number"
                    min="0"
                    className="w-full border rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSubmit(p.id)}
                      disabled={editMutation.isPending}
                      className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-white py-1.5 rounded text-sm font-medium disabled:opacity-50"
                    >
                      {editMutation.isPending ? 'Đang lưu...' : '💾 Lưu'}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-1.5 rounded text-sm font-medium"
                    >
                      Huỷ
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}