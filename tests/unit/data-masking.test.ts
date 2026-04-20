import { maskSensitiveData } from '../../frontend/lib/data-masking';

describe('Data Masking', () => {
  describe('maskSensitiveData', () => {
    it('should mask phone numbers', () => {
      const data = {
        contact_phone: '13812345678',
      };
      
      const result = maskSensitiveData(data);
      
      expect(result.contact_phone).toBe('138****5678');
    });

    it('should mask email addresses', () => {
      const data = {
        contact_email: 'test@example.com',
      };
      
      const result = maskSensitiveData(data);
      
      expect(result.contact_email).toBe('te***@example.com');
    });

    it('should mask internal notes', () => {
      const data = {
        internal_notes: 'Sensitive internal information',
      };
      
      const result = maskSensitiveData(data);
      
      expect(result.internal_notes).toBe('[已脱敏]');
    });

    it('should handle null/undefined values', () => {
      const data = {
        contact_phone: null,
        contact_email: undefined,
      };
      
      const result = maskSensitiveData(data);
      
      expect(result.contact_phone).toBeNull();
      expect(result.contact_email).toBeUndefined();
    });

    it('should handle arrays of data', () => {
      const data = [
        { contact_phone: '13812345678', contact_email: 'test1@example.com' },
        { contact_phone: '13912345678', contact_email: 'test2@example.com' },
      ];
      
      const result = maskSensitiveData(data);
      
      expect(result[0].contact_phone).toBe('138****5678');
      expect(result[1].contact_email).toBe('te***@example.com');
    });

    it('should mask nested objects', () => {
      const data = {
        company: {
          contact_phone: '13812345678',
          contact_email: 'test@example.com',
        },
      };
      
      const result = maskSensitiveData(data);
      
      expect(result.company.contact_phone).toBe('138****5678');
      expect(result.company.contact_email).toBe('te***@example.com');
    });

    it('should mask all sensitive fields', () => {
      const data = {
        contact_phone: '13812345678',
        contact_email: 'test@example.com',
        internal_notes: 'Secret notes',
        real_key_clients: 'Client A, Client B',
        tech_maturity_score: 5,
        market_influence_score: 4,
        risk_level: 'High',
        investigator: 'Admin User',
      };
      
      const result = maskSensitiveData(data);
      
      expect(result.contact_phone).toBe('138****5678');
      expect(result.contact_email).toBe('te***@example.com');
      expect(result.internal_notes).toBe('[已脱敏]');
      expect(result.real_key_clients).toBe('[已脱敏]');
      expect(result.tech_maturity_score).toBe('[已脱敏]');
      expect(result.market_influence_score).toBe('[已脱敏]');
      expect(result.risk_level).toBe('[已脱敏]');
      expect(result.investigator).toBe('[已脱敏]');
    });

    it('should preserve non-sensitive fields', () => {
      const data = {
        company_name: 'Test Company',
        credit_code: '91310000MA1TEST001',
        region: '杭州市',
        status: 'published',
      };
      
      const result = maskSensitiveData(data);
      
      expect(result.company_name).toBe('Test Company');
      expect(result.credit_code).toBe('91310000MA1TEST001');
      expect(result.region).toBe('杭州市');
      expect(result.status).toBe('published');
    });

    it('should return original data if not object/array', () => {
      expect(maskSensitiveData('string')).toBe('string');
      expect(maskSensitiveData(123)).toBe(123);
      expect(maskSensitiveData(true)).toBe(true);
    });
  });
});
