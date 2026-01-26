// __tests__/performance.test.tsx
import { render } from '@testing-library/react-native';
import React from 'react';
import { View, Text } from 'react-native';

// Mock component للاختبار
const HeavyComponent = ({ items }: { items: any[] }) => {
  return (
    <View>
      {items.map((item, index) => (
        <Text key={index}>{item.name}</Text>
      ))}
    </View>
  );
};

describe('Performance Tests', () => {
  test('يحمّل قائمة كبيرة من العناصر بسرعة', () => {
    const startTime = Date.now();
    
    const largeList = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      name: `عنصر ${i}`
    }));

    render(<HeavyComponent items={largeList} />);
    
    const endTime = Date.now();
    const renderTime = endTime - startTime;
    
    // يجب أن يستغرق أقل من 1000ms (أكثر واقعية للبيئة التجريبية)
    expect(renderTime).toBeLessThan(1000);
  });

  test('يتعامل مع قائمة فارغة بسرعة', () => {
    const startTime = Date.now();
    
    render(<HeavyComponent items={[]} />);
    
    const endTime = Date.now();
    const renderTime = endTime - startTime;
    
    // يجب أن يستغرق أقل من 100ms (أكثر واقعية للبيئة التجريبية)
    expect(renderTime).toBeLessThan(100);
  });

  test('يحمّل قائمة متوسطة الحجم بسرعة مقبولة', () => {
    const startTime = Date.now();
    
    const mediumList = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      name: `عنصر ${i}`
    }));

    render(<HeavyComponent items={mediumList} />);
    
    const endTime = Date.now();
    const renderTime = endTime - startTime;
    
    // يجب أن يستغرق أقل من 500ms (أكثر واقعية للبيئة التجريبية)
    expect(renderTime).toBeLessThan(500);
  });
});
