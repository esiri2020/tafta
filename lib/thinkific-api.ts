import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { ThinkificApiResponse, SyncCursor } from '../types/enrollment';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  retryAfterMs: number;
}

interface RequestQueue {
  timestamp: number;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  config: AxiosRequestConfig;
}

class ThinkificApiClient {
  private client: AxiosInstance;
  private rateLimitConfig: RateLimitConfig;
  private requestQueue: RequestQueue[] = [];
  private requestCount = 0;
  private windowStart = Date.now();
  private isProcessing = false;

  constructor() {
    this.client = axios.create({
      baseURL: "https://api.thinkific.com/api/public/v1",
      headers: {
        "Content-Type": "application/json",
        'X-Auth-API-Key': process.env.API_KEY || '',
        'X-Auth-Subdomain': process.env.API_SUBDOMAIN || ''
      },
      timeout: 30000 // 30 second timeout
    });

    this.rateLimitConfig = {
      maxRequests: 100, // Thinkific allows 100 requests per minute
      windowMs: 60000, // 1 minute window
      retryAfterMs: 1000 // Wait 1 second between requests
    };

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor for rate limiting
    this.client.interceptors.request.use(
      (config) => {
        return this.handleRateLimit(config);
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 429) {
          console.warn('⚠️ Rate limit exceeded, implementing backoff...');
          await this.handleRateLimitExceeded();
          return this.client.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  private handleRateLimit(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig> {
    const now = Date.now();
    
    // Reset window if needed
    if (now - this.windowStart >= this.rateLimitConfig.windowMs) {
      this.requestCount = 0;
      this.windowStart = now;
    }

    // If we're at the limit, queue the request
    if (this.requestCount >= this.rateLimitConfig.maxRequests) {
      return new Promise((resolve, reject) => {
        this.requestQueue.push({
          timestamp: now,
          resolve: () => resolve(config),
          reject,
          config
        });
        
        if (!this.isProcessing) {
          this.processQueue();
        }
      });
    }

    this.requestCount++;
    return config;
  }

  private async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const now = Date.now();
      
      // Reset window if needed
      if (now - this.windowStart >= this.rateLimitConfig.windowMs) {
        this.requestCount = 0;
        this.windowStart = now;
      }

      if (this.requestCount < this.rateLimitConfig.maxRequests) {
        const request = this.requestQueue.shift();
        if (request) {
          this.requestCount++;
          request.resolve(request.config);
          
          // Add delay between requests
          await this.delay(this.rateLimitConfig.retryAfterMs);
        }
      } else {
        // Wait for window to reset
        const waitTime = this.rateLimitConfig.windowMs - (now - this.windowStart);
        await this.delay(waitTime);
      }
    }

    this.isProcessing = false;
  }

  private async handleRateLimitExceeded() {
    const backoffTime = Math.min(5000, this.rateLimitConfig.retryAfterMs * 2);
    console.log(`⏳ Rate limit exceeded, waiting ${backoffTime}ms...`);
    await this.delay(backoffTime);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get enrollments with pagination and filtering
   */
  async getEnrollments(params: {
    page?: number;
    limit?: number;
    query?: {
      course_id?: string;
      user_id?: string;
      completed?: boolean;
    };
    sort?: string;
  } = {}): Promise<{
    items: ThinkificApiResponse[];
    meta: {
      pagination: {
        current_page: number;
        per_page: number;
        total_entries: number;
        total_pages: number;
      };
    };
  }> {
    try {
      const response = await this.client.get('/enrollments', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching enrollments:', error);
      throw error;
    }
  }

  /**
   * Get enrollments updated since a specific date
   */
  async getEnrollmentsSince(cursor: SyncCursor): Promise<{
    items: ThinkificApiResponse[];
    meta: {
      pagination: {
        current_page: number;
        per_page: number;
        total_entries: number;
        total_pages: number;
      };
    };
  }> {
    try {
      const params: any = {
        page: 1,
        limit: 100,
        sort: 'updated_at:asc'
      };

      // Add filters based on cursor
      if (cursor.lastProcessedAt) {
        params.query = {
          updated_at_gte: cursor.lastProcessedAt
        };
      }

      const response = await this.client.get('/enrollments', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching enrollments since cursor:', error);
      throw error;
    }
  }

  /**
   * Get a specific enrollment by ID
   */
  async getEnrollment(enrollmentId: string): Promise<ThinkificApiResponse> {
    try {
      const response = await this.client.get(`/enrollments/${enrollmentId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching enrollment ${enrollmentId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new enrollment
   */
  async createEnrollment(data: {
    course_id: string;
    user_id: string;
    activated_at?: string;
  }): Promise<ThinkificApiResponse> {
    try {
      const response = await this.client.post('/enrollments', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating enrollment:', error);
      throw error;
    }
  }

  /**
   * Update an existing enrollment
   */
  async updateEnrollment(enrollmentId: string, data: Partial<ThinkificApiResponse>): Promise<ThinkificApiResponse> {
    try {
      const response = await this.client.put(`/enrollments/${enrollmentId}`, data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error updating enrollment ${enrollmentId}:`, error);
      throw error;
    }
  }

  /**
   * Get API health status
   */
  async getHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/enrollments', { 
        params: { page: 1, limit: 1 } 
      });
      return response.status === 200;
    } catch (error) {
      console.error('❌ API health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const thinkificApi = new ThinkificApiClient();
export default thinkificApi;

