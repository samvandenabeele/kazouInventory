# MSW Mock Server Setup

This project uses [Mock Service Worker (MSW)](https://mswjs.io/) to intercept API requests and provide mock responses for development and testing.

## Overview

The mock server is automatically enabled in development mode and provides mock implementations for all API endpoints used in the application.

## Mock Endpoints

### Authentication

- **POST `/login`** - Login with username and password
- **POST `/signup`** - Create a new user account

### Inventory Management

- **GET `/api/get_inventory`** - Get all inventory items
- **POST `/api/add_item`** - Add a new item to inventory
- **POST `/api/add_item_loan`** - Loan an item (reduces available quantity)
- **POST `/api/end_item_loan`** - Return a loaned item (increases available quantity)

## Mock Data

### Default User

```json
{
  "username": "testuser",
  "password": "password123",
  "email": "test@example.com"
}
```

### Sample Inventory Items

- Blue pens (50 total, 45 available)
- Red markers (30 total, 28 available)
- Notebooks (100 total, 95 available)
- Erasers (75 total, 70 available)

## Usage

### Development

The mock server starts automatically when you run the development server:

```bash
npm run dev
```

The service worker will intercept API requests and respond with mock data. Check the browser console for MSW logs.

### Testing

MSW is configured in `setupTests.ts` to intercept requests during test runs. No additional configuration is needed.

```bash
npm test
```

### Disabling the Mock Server

To disable the mock server, change the `MODE` check in `src/main.tsx`:

```typescript
if (import.meta.env.MODE !== "development") {
  return;
}
```

## File Structure

```
src/mocks/
├── handlers.ts    # API endpoint handlers and mock data
├── browser.ts     # Browser-specific MSW setup
└── node.ts        # Node-specific MSW setup (for testing)
```

## Customizing Mock Data

To modify the mock data or add new endpoints, edit `src/mocks/handlers.ts`:

```typescript
// Add a new handler
http.get("/api/new-endpoint", () => {
  return HttpResponse.json({ data: "your mock data" });
});
```

## Resources

- [MSW Documentation](https://mswjs.io/docs/)
- [MSW Examples](https://mswjs.io/docs/recipes)
