const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;

const app = express();
const PATH = './data.json';

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Middleware log
app.use((req, _, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Helper đọc/ghi file
async function readData() {
  const raw = await fs.readFile(PATH, 'utf-8');
  return JSON.parse(raw);
}

async function writeData(data) {
  await fs.writeFile(PATH, JSON.stringify(data, null, 2));
}

// GET tất cả sản phẩm
app.get('/api/products', async (req, res) => {
  try {
    const products = await readData();
    res.json(products);
  } catch {
    res.status(500).json({ error: 'Không đọc được dữ liệu' });
  }
});

// POST thêm sản phẩm
app.post('/api/products', async (req, res) => {
  console.log('Body nhận được:', req.body);
  const { name, price } = req.body;
  if (!name || !price)
    return res.status(400).json({ error: 'Thiếu dữ liệu' });
  try {
    const products = await readData();
    const newProduct = { id: Date.now(), name, price: Number(price) };
    products.push(newProduct);
    await writeData(products);
    res.status(201).json(newProduct);
  } catch {
    res.status(500).json({ error: 'Không lưu được dữ liệu' });
  }
});

// PUT chỉnh sửa sản phẩm
app.put('/api/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const products = await readData();
    const index = products.findIndex(p => p.id === id);
    if (index === -1)
      return res.status(404).json({ error: 'Không tìm thấy' });
    products[index] = { ...products[index], ...req.body };
    await writeData(products);
    res.json(products[index]);
  } catch {
    res.status(500).json({ error: 'Không cập nhật được dữ liệu' });
  }
});

// DELETE xoá sản phẩm
app.delete('/api/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const products = await readData();
    const index = products.findIndex(p => p.id === id);
    if (index === -1)
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    products.splice(index, 1);
    await writeData(products);
    res.json({ message: 'Đã xoá thành công' });
  } catch {
    res.status(500).json({ error: 'Không xoá được dữ liệu' });
  }
});

const CART_PATH = './cart.json';

async function readCart() {
  try {
    const raw = await fs.readFile(CART_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeCart(data) {
  await fs.writeFile(CART_PATH, JSON.stringify(data, null, 2));
}

// GET giỏ hàng
app.get('/api/cart', async (req, res) => {
  try {
    const cart = await readCart();
    // Lấy thêm thông tin sản phẩm
    const products = await readData();
    const cartWithDetails = cart.map(item => {
      const product = products.find(p => p.id === item.productId);
      return { ...item, name: product?.name, price: product?.price };
    });
    res.json(cartWithDetails);
  } catch {
    res.status(500).json({ error: 'Không đọc được giỏ hàng' });
  }
});

// POST thêm vào giỏ hàng
app.post('/api/cart', async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId)
    return res.status(400).json({ error: 'Thiếu productId' });
  try {
    const cart = await readCart();
    const existingIndex = cart.findIndex(item => item.productId === productId);
    if (existingIndex >= 0) {
      // Sản phẩm đã có → tăng số lượng
      cart[existingIndex].quantity += quantity;
    } else {
      // Sản phẩm chưa có → thêm mới
      cart.push({ productId, quantity });
    }
    await writeCart(cart);
    res.status(201).json(cart);
  } catch {
    res.status(500).json({ error: 'Không thêm được vào giỏ hàng' });
  }
});

// DELETE xoá khỏi giỏ hàng
app.delete('/api/cart/:productId', async (req, res) => {
  const productId = Number(req.params.productId);
  try {
    const cart = await readCart();
    const newCart = cart.filter(item => item.productId !== productId);
    await writeCart(newCart);
    res.json({ message: 'Đã xoá khỏi giỏ hàng' });
  } catch {
    res.status(500).json({ error: 'Không xoá được' });
  }
});

app.listen(5000, () => console.log('✅ Backend chạy tại port :5000'));