import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuoteForm from '@/components/QuoteForm';
import QuoteResult from '@/components/QuoteResult';
import { QuoteResult as QuoteResultType } from '@/types';

// QuoteForm 테스트
describe('QuoteForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('초기값이 올바르게 표시되어야 함', () => {
    render(<QuoteForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText(/가로/i)).toHaveValue(50);
    expect(screen.getByLabelText(/세로/i)).toHaveValue(40);
    expect(screen.getByLabelText(/높이/i)).toHaveValue(30);
    expect(screen.getByLabelText(/실중량/i)).toHaveValue(10);
  });

  it('입력값 변경 시 상태가 업데이트되어야 함', () => {
    render(<QuoteForm onSubmit={mockOnSubmit} />);
    
    const widthInput = screen.getByLabelText(/가로/i);
    fireEvent.change(widthInput, { target: { value: '100' } });
    
    expect(widthInput).toHaveValue(100);
  });

  it('부피중량이 자동 계산되어 표시되어야 함', () => {
    render(<QuoteForm onSubmit={mockOnSubmit} />);
    
    // 50×40×30cm = 60,000㎤ → 10kg
    expect(screen.getByText(/부피중량/i)).toBeInTheDocument();
    // getAllByText를 사용하여 여러 요소 중 하나라도 존재하는지 확인
    const volumeWeightElements = screen.getAllByText(/10\.00 kg/i);
    expect(volumeWeightElements.length).toBeGreaterThan(0);
  });

  it('유효하지 않은 입력값에 대해 에러 메시지를 표시해야 함', async () => {
    render(<QuoteForm onSubmit={mockOnSubmit} />);
    
    const widthInput = screen.getByLabelText(/가로/i);
    fireEvent.change(widthInput, { target: { value: '600' } }); // 최대값 초과
    
    await waitFor(() => {
      expect(screen.getByText(/500cm 이하여야 합니다/i)).toBeInTheDocument();
    });
  });

  it('폼 제출 시 올바른 데이터를 전달해야 함', () => {
    render(<QuoteForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /요금 계산/i });
    fireEvent.click(submitButton);
    
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        widthCm: 50,
        depthCm: 40,
        heightCm: 30,
        weightKg: 10,
        mode: 'SEA',
        region: 'SUDO',
      })
    );
  });
});

// QuoteResult 테스트
describe('QuoteResult', () => {
  it('결과가 없을 때 아무것도 렌더링하지 않아야 함', () => {
    const { container } = render(<QuoteResult result={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('실패한 결과를 올바르게 표시해야 함', () => {
    const failedResult: QuoteResultType = {
      success: false,
      reason: '입력 범위를 초과했습니다.',
    };

    render(<QuoteResult result={failedResult} />);
    
    expect(screen.getByText(/계산 불가/i)).toBeInTheDocument();
    expect(screen.getByText(/입력 범위를 초과했습니다/i)).toBeInTheDocument();
  });

  it('성공한 결과를 올바르게 표시해야 함', () => {
    const successResult: QuoteResultType = {
      success: true,
      finalPrice: 50000,
      breakdown: {
        baseShipping: 40000,
        domesticShipping: 10000,
        extraCharge: 0,
      },
    };

    render(<QuoteResult result={successResult} />);
    
    expect(screen.getByText(/견적 결과/i)).toBeInTheDocument();
    // 여러 곳에 나타날 수 있으므로 getAllByText 사용
    const finalPriceElements = screen.getAllByText(/50,000원/i);
    expect(finalPriceElements.length).toBeGreaterThan(0);
    const baseShippingElements = screen.getAllByText(/40,000원/i);
    expect(baseShippingElements.length).toBeGreaterThan(0);
    const domesticShippingElements = screen.getAllByText(/10,000원/i);
    expect(domesticShippingElements.length).toBeGreaterThan(0);
  });

  it('경고 메시지가 있을 때 표시해야 함', () => {
    const resultWithWarnings: QuoteResultType = {
      success: true,
      finalPrice: 50000,
      breakdown: {
        baseShipping: 50000,
        domesticShipping: 0,
        extraCharge: 0,
      },
      warnings: ['주의사항 1', '주의사항 2'],
    };

    render(<QuoteResult result={resultWithWarnings} />);
    
    // "주의사항" 제목이 있는지 확인
    const warningHeaders = screen.getAllByText(/주의사항/i);
    expect(warningHeaders.length).toBeGreaterThan(0);
    
    // 경고 메시지 내용 확인
    expect(screen.getByText(/주의사항 1/i)).toBeInTheDocument();
    expect(screen.getByText(/주의사항 2/i)).toBeInTheDocument();
  });
});

