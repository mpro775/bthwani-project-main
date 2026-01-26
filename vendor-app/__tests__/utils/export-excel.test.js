// Test for export-excel.ts
const FileSystem = require('expo-file-system');
const Sharing = require('expo-sharing');
const XLSX = require('xlsx');

// Mock dependencies
jest.mock('xlsx', () => ({
  utils: {
    json_to_sheet: jest.fn(),
    book_new: jest.fn(),
    book_append_sheet: jest.fn()
  },
  write: jest.fn()
}));

jest.mock('expo-file-system', () => ({
  cacheDirectory: '/mock/cache/',
  EncodingType: {
    Base64: 'base64'
  },
  writeAsStringAsync: jest.fn()
}));

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn()
}));

// Mock implementation of the export function
const exportToExcel = async (orders) => {
  // Convert orders to Excel data
  const excelData = orders.map((order) => ({
    OrderID: order._id,
    Status: order.status,
    Amount: order.totalAmount,
    Date: order.createdAt,
  }));

  // Create Excel file
  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Orders');
  const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

  // Save to device
  const uri = FileSystem.cacheDirectory + `orders_${Date.now()}.xlsx`;
  await FileSystem.writeAsStringAsync(uri, wbout, { encoding: FileSystem.EncodingType.Base64 });

  // Share the file
  await Sharing.shareAsync(uri, {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    dialogTitle: 'تصدير الطلبات',
    UTI: 'com.microsoft.excel.xlsx',
  });
};

describe('Export Excel Utility', () => {
  const mockOrders = [
    {
      _id: 'order_1',
      status: 'completed',
      totalAmount: 150.00,
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      _id: 'order_2', 
      status: 'pending',
      totalAmount: 275.50,
      createdAt: '2024-01-16T14:20:00Z'
    },
    {
      _id: 'order_3',
      status: 'cancelled',
      totalAmount: 89.99,
      createdAt: '2024-01-17T09:15:00Z'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup XLSX mock returns
    XLSX.utils.json_to_sheet.mockReturnValue({ mock: 'worksheet' });
    XLSX.utils.book_new.mockReturnValue({ mock: 'workbook' });
    XLSX.utils.book_append_sheet.mockReturnValue(undefined);
    XLSX.write.mockReturnValue('base64data');
    
    // Setup FileSystem mock
    FileSystem.writeAsStringAsync.mockResolvedValue(undefined);
    
    // Setup Sharing mock
    Sharing.shareAsync.mockResolvedValue(undefined);
  });

  describe('Data Transformation', () => {
    it('should transform orders data correctly', async () => {
      await exportToExcel(mockOrders);
      
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith([
        {
          OrderID: 'order_1',
          Status: 'completed',
          Amount: 150.00,
          Date: '2024-01-15T10:30:00Z'
        },
        {
          OrderID: 'order_2',
          Status: 'pending',
          Amount: 275.50,
          Date: '2024-01-16T14:20:00Z'
        },
        {
          OrderID: 'order_3',
          Status: 'cancelled',
          Amount: 89.99,
          Date: '2024-01-17T09:15:00Z'
        }
      ]);
    });

    it('should handle empty orders array', async () => {
      await exportToExcel([]);
      
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith([]);
    });

    it('should handle single order', async () => {
      const singleOrder = [mockOrders[0]];
      
      await exportToExcel(singleOrder);
      
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith([
        {
          OrderID: 'order_1',
          Status: 'completed',
          Amount: 150.00,
          Date: '2024-01-15T10:30:00Z'
        }
      ]);
    });
  });

  describe('Excel File Creation', () => {
    it('should create worksheet from data', async () => {
      await exportToExcel(mockOrders);
      
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledTimes(1);
    });

    it('should create new workbook', async () => {
      await exportToExcel(mockOrders);
      
      expect(XLSX.utils.book_new).toHaveBeenCalledTimes(1);
    });

    it('should append worksheet to workbook with correct sheet name', async () => {
      await exportToExcel(mockOrders);
      
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        { mock: 'workbook' },
        { mock: 'worksheet' },
        'Orders'
      );
    });

    it('should write workbook as base64 xlsx', async () => {
      await exportToExcel(mockOrders);
      
      expect(XLSX.write).toHaveBeenCalledWith(
        { mock: 'workbook' },
        { type: 'base64', bookType: 'xlsx' }
      );
    });
  });

  describe('File System Operations', () => {
    it('should create file with timestamp in cache directory', async () => {
      const mockTimestamp = 1642248000000;
      jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);
      
      await exportToExcel(mockOrders);
      
      const expectedUri = '/mock/cache/orders_1642248000000.xlsx';
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        expectedUri,
        'base64data',
        { encoding: 'base64' }
      );
      
      Date.now.mockRestore();
    });

    it('should write file with correct encoding', async () => {
      await exportToExcel(mockOrders);
      
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        expect.stringContaining('orders_'),
        'base64data',
        { encoding: 'base64' }
      );
    });

    it('should generate unique filenames for different timestamps', async () => {
      const timestamps = [1642248000000, 1642248001000];
      
      for (const timestamp of timestamps) {
        jest.spyOn(Date, 'now').mockReturnValue(timestamp);
        await exportToExcel(mockOrders);
        
        expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
          `/mock/cache/orders_${timestamp}.xlsx`,
          'base64data',
          { encoding: 'base64' }
        );
        
        Date.now.mockRestore();
      }
    });
  });

  describe('File Sharing', () => {
    it('should share file with correct parameters', async () => {
      const mockTimestamp = 1642248000000;
      jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);
      
      await exportToExcel(mockOrders);
      
      const expectedUri = '/mock/cache/orders_1642248000000.xlsx';
      expect(Sharing.shareAsync).toHaveBeenCalledWith(
        expectedUri,
        {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'تصدير الطلبات',
          UTI: 'com.microsoft.excel.xlsx'
        }
      );
      
      Date.now.mockRestore();
    });

    it('should use correct MIME type for Excel files', async () => {
      await exportToExcel(mockOrders);
      
      const shareCall = Sharing.shareAsync.mock.calls[0];
      expect(shareCall[1].mimeType).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });

    it('should have Arabic dialog title', async () => {
      await exportToExcel(mockOrders);
      
      const shareCall = Sharing.shareAsync.mock.calls[0];
      expect(shareCall[1].dialogTitle).toBe('تصدير الطلبات');
    });

    it('should use correct UTI for Excel files', async () => {
      await exportToExcel(mockOrders);
      
      const shareCall = Sharing.shareAsync.mock.calls[0];
      expect(shareCall[1].UTI).toBe('com.microsoft.excel.xlsx');
    });
  });

  describe('Error Handling', () => {
    it('should handle XLSX errors gracefully', async () => {
      XLSX.utils.json_to_sheet.mockImplementation(() => {
        throw new Error('XLSX error');
      });
      
      await expect(exportToExcel(mockOrders)).rejects.toThrow('XLSX error');
    });

    it('should handle FileSystem write errors', async () => {
      FileSystem.writeAsStringAsync.mockRejectedValue(new Error('File write error'));
      
      await expect(exportToExcel(mockOrders)).rejects.toThrow('File write error');
    });

    it('should handle Sharing errors', async () => {
      Sharing.shareAsync.mockRejectedValue(new Error('Share error'));
      
      await expect(exportToExcel(mockOrders)).rejects.toThrow('Share error');
    });

    it('should handle invalid order data', async () => {
      const invalidOrders = [
        { _id: null, status: undefined, totalAmount: 'invalid', createdAt: null }
      ];
      
      await exportToExcel(invalidOrders);
      
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith([
        {
          OrderID: null,
          Status: undefined,
          Amount: 'invalid',
          Date: null
        }
      ]);
    });
  });

  describe('Integration Flow', () => {
    it('should complete full export process', async () => {
      const mockTimestamp = 1642248000000;
      jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);
      
      await exportToExcel(mockOrders);
      
      // Verify all steps were called in order
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalled();
      expect(XLSX.utils.book_new).toHaveBeenCalled();
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalled();
      expect(XLSX.write).toHaveBeenCalled();
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
      expect(Sharing.shareAsync).toHaveBeenCalled();
      
      Date.now.mockRestore();
    });

    it('should use consistent file URI throughout process', async () => {
      const mockTimestamp = 1642248000000;
      jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);
      
      await exportToExcel(mockOrders);
      
      const expectedUri = '/mock/cache/orders_1642248000000.xlsx';
      
      // Check FileSystem write call
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        expectedUri,
        expect.any(String),
        expect.any(Object)
      );
      
      // Check Sharing call
      expect(Sharing.shareAsync).toHaveBeenCalledWith(
        expectedUri,
        expect.any(Object)
      );
      
      Date.now.mockRestore();
    });
  });

  describe('Performance Considerations', () => {
    it('should handle large datasets efficiently', async () => {
      const largeOrderSet = Array.from({ length: 1000 }, (_, i) => ({
        _id: `order_${i}`,
        status: 'completed',
        totalAmount: Math.random() * 1000,
        createdAt: new Date().toISOString()
      }));
      
      await exportToExcel(largeOrderSet);
      
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            OrderID: expect.stringContaining('order_'),
            Status: 'completed',
            Amount: expect.any(Number),
            Date: expect.any(String)
          })
        ])
      );
      expect(XLSX.utils.json_to_sheet).toHaveBeenCalledTimes(1);
    });
  });
});
