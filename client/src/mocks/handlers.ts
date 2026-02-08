import { http, HttpResponse } from 'msw';

// Mock data
const mockInventory = [
  { id: 1, description: 'Blue pens', quantity: 50, available: 45 },
  { id: 2, description: 'Red markers', quantity: 30, available: 28 },
  { id: 3, description: 'Notebooks', quantity: 100, available: 95 },
  { id: 4, description: 'Erasers', quantity: 75, available: 70 },
];

let inventoryData = [...mockInventory];
let nextId = 5;

// Mock user data
const mockUsers = [
  {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  },
];

export const handlers = [
  // Login endpoint
  http.post('/login', async ({ request }) => {
    const body = await request.json() as { username: string; password: string };

    const user = mockUsers.find(
      (u) => u.username === body.username && u.password === body.password
    );

    if (!user) {
      return HttpResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      id: user.id,
      name: user.username,
      email: user.email,
    });
  }),

  // Signup endpoint
  http.post('/signup', async ({ request }) => {
    const body = await request.json() as {
      username: string;
      email: string;
      password: string;
    };

    // Check if user already exists
    const existingUser = mockUsers.find(
      (u) => u.username === body.username || u.email === body.email
    );

    if (existingUser) {
      return HttpResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Validate input
    if (!body.username || !body.email || !body.password) {
      return HttpResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (body.password.length < 6) {
      return HttpResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = {
      id: String(mockUsers.length + 1),
      username: body.username,
      email: body.email,
      password: body.password,
    };

    mockUsers.push(newUser);

    return HttpResponse.json({
      id: newUser.id,
      name: newUser.username,
      email: newUser.email,
    });
  }),

  // Get inventory
  http.get('/api/get_inventory', () => {
    return HttpResponse.json({
      inventory: inventoryData,
    });
  }),

  // Add item
  http.post('/api/add_item', async ({ request }) => {
    const body = await request.json() as {
      description: string;
      quantity: number;
    };

    if (!body.description || !body.quantity) {
      return HttpResponse.json(
        { error: 'Description and quantity are required' },
        { status: 400 }
      );
    }

    const newItem = {
      id: nextId++,
      description: body.description,
      quantity: body.quantity,
      available: body.quantity,
    };

    inventoryData.push(newItem);

    return HttpResponse.json({
      message: 'Item added successfully',
      item: newItem,
    });
  }),

  // Add item loan
  http.post('/api/add_item_loan', async ({ request }) => {
    const body = await request.json() as {
      itemId: number;
      quantity: number;
      borrower?: string;
    };

    const item = inventoryData.find((i) => i.id === body.itemId);

    if (!item) {
      return HttpResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    if (item.available < body.quantity) {
      return HttpResponse.json(
        { error: 'Not enough items available' },
        { status: 400 }
      );
    }

    // Update available quantity
    item.available -= body.quantity;

    return HttpResponse.json({
      message: 'Item loaned successfully',
      item,
    });
  }),

  // End item loan
  http.post('/api/end_item_loan', async ({ request }) => {
    const body = await request.json() as {
      itemId: number;
      quantity: number;
    };

    const item = inventoryData.find((i) => i.id === body.itemId);

    if (!item) {
      return HttpResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Update available quantity
    item.available = Math.min(item.available + body.quantity, item.quantity);

    return HttpResponse.json({
      message: 'Item returned successfully',
      item,
    });
  }),

  http.post('/api/transaction/borrow', async ({ request }) => {
    await request.json();

    return HttpResponse.json(
      { message: 'Transaction added succesfully' }
    )
  })
];
