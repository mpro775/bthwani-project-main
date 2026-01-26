// إنشاء mock بسيط لـ axios instance
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  defaults: {},
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
};

// تعيين القيم الافتراضية
mockAxiosInstance.get.mockResolvedValue({
  data: {
    items: [
      { productId: "p1", name: "Test Product", image: "test.jpg", price: 100 },
    ],
  },
  status: 200,
  statusText: "OK",
});
mockAxiosInstance.post.mockResolvedValue({
  data: { success: true },
  status: 200,
  statusText: "OK",
});
mockAxiosInstance.put.mockResolvedValue({
  data: { success: true },
  status: 200,
  statusText: "OK",
});
mockAxiosInstance.delete.mockResolvedValue({
  data: { success: true },
  status: 200,
  statusText: "OK",
});
mockAxiosInstance.patch.mockResolvedValue({
  data: { success: true },
  status: 200,
  statusText: "OK",
});

export default mockAxiosInstance;
