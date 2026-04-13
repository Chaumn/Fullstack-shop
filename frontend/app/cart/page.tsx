'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

type CartItem = {
  productId: number;
  quantity: number;
  name: string;
  price: number;
};

export default function CartPage() {
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery<CartItem[]>({
    queryKey: ['cart'],
    queryFn: () => api.get('/api/cart').then(r => r.data),
  });

  const removeMutation = useMutation({
    mutationFn: (productId: number) => api.delete(`/api/cart/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đã xoá khỏi giỏ hàng', { icon: '🗑️' });
    },
    onError: () => toast.error('Xoá thất bại!'),
  });

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  return (
    <main className="max-w-xl mx-auto p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🛒 Giỏ hàng</h1>
        <Link href="/products" className="text-sm text-blue-500 hover:underline">
          ← Tiếp tục mua
        </Link>
      </div>

      {isLoading ? (
        <p className="text-center text-gray-400 text-sm py-4">Đang tải...</p>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🛒</p>
          <p className="text-gray-400">Giỏ hàng trống</p>
          <Link href="/products" className="text-blue-500 text-sm hover:underline mt-2 inline-block">
            Thêm sản phẩm ngay →
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-6">
            {cartItems.map(item => (
              <div key={item.productId} className="flex justify-between items-center p-3 border rounded-lg bg-white shadow-sm">
                <div>
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.price.toLocaleString('vi-VN')}đ × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-blue-600">
                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                  </p>
                  <button
                    onClick={() => removeMutation.mutate(item.productId)}
                    className="text-red-400 hover:text-red-600 text-sm px-2 py-1 hover:bg-red-50 rounded"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tổng tiền */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tổng cộng ({cartItems.reduce((s, i) => s + i.quantity, 0)} sản phẩm):</span>
              <span className="text-xl font-bold text-blue-600">
                {totalPrice.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <button
              onClick={() => toast.success('Đặt hàng thành công! 🎉')}
              className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium"
            >
              Đặt hàng
            </button>
          </div>
        </>
      )}
    </main>
  );
}