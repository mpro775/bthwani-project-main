// __tests__/api/reviewApi.test.ts
import {
  flagReview,
  getFreelancerReviews,
  submitReview,
} from "../../api/reviewApi";

// Mock axios instance
jest.mock("@/utils/api/axiosInstance", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

import axiosInstance from "../../utils/api/axiosInstance";

describe("reviewApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("submitReview", () => {
    test("يتم إرسال مراجعة جديدة بنجاح", async () => {
      const mockResponse = {
        data: {
          id: "review-123",
          rating: 5,
          comment: "خدمة ممتازة",
          freelancerId: "freelancer-123",
        },
      };
      (axiosInstance.post as jest.Mock).mockResolvedValue(mockResponse);

      const freelancerId = "freelancer-123";
      const reviewData = { rating: 5, comment: "خدمة ممتازة" };
      const result = await submitReview(freelancerId, reviewData);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/review/freelancer-123",
        reviewData
      );
      expect(result).toEqual(mockResponse.data);
    });

    test("يتم إرسال مراجعة بدون تعليق", async () => {
      const mockResponse = {
        data: {
          id: "review-123",
          rating: 4,
          freelancerId: "freelancer-123",
        },
      };
      (axiosInstance.post as jest.Mock).mockResolvedValue(mockResponse);

      const freelancerId = "freelancer-123";
      const reviewData = { rating: 4 };
      const result = await submitReview(freelancerId, reviewData);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        "/review/freelancer-123",
        reviewData
      );
      expect(result).toEqual(mockResponse.data);
    });

    test("يتعامل مع أخطاء إرسال المراجعة", async () => {
      const error = new Error("فشل في إرسال المراجعة");
      (axiosInstance.post as jest.Mock).mockRejectedValue(error);

      const freelancerId = "freelancer-123";
      const reviewData = { rating: 5, comment: "خدمة ممتازة" };

      await expect(submitReview(freelancerId, reviewData)).rejects.toThrow(
        "فشل في إرسال المراجعة"
      );
    });

    test("يتعامل مع rating غير صحيح", async () => {
      const error = new Error("التقييم يجب أن يكون بين 1 و 5");
      (axiosInstance.post as jest.Mock).mockRejectedValue(error);

      const freelancerId = "freelancer-123";
      const reviewData = { rating: 6, comment: "خدمة ممتازة" };

      await expect(submitReview(freelancerId, reviewData)).rejects.toThrow(
        "التقييم يجب أن يكون بين 1 و 5"
      );
    });

    test("يتعامل مع freelancerId فارغ", async () => {
      const error = new Error("معرف المستقل مطلوب");
      (axiosInstance.post as jest.Mock).mockRejectedValue(error);

      const freelancerId = "";
      const reviewData = { rating: 5, comment: "خدمة ممتازة" };

      await expect(submitReview(freelancerId, reviewData)).rejects.toThrow(
        "معرف المستقل مطلوب"
      );
    });

    test("يتعامل مع تعليق طويل جداً", async () => {
      const error = new Error("التعليق طويل جداً");
      (axiosInstance.post as jest.Mock).mockRejectedValue(error);

      const freelancerId = "freelancer-123";
      const longComment = "a".repeat(1001); // تعليق أطول من 1000 حرف
      const reviewData = { rating: 5, comment: longComment };

      await expect(submitReview(freelancerId, reviewData)).rejects.toThrow(
        "التعليق طويل جداً"
      );
    });
  });

  describe("getFreelancerReviews", () => {
    test("يتم جلب المراجعات لمستقل معين بنجاح", async () => {
      const mockResponse = {
        data: {
          reviews: [
            {
              id: "review-1",
              rating: 5,
              comment: "ممتاز",
              createdAt: "2024-01-01",
            },
            {
              id: "review-2",
              rating: 4,
              comment: "جيد",
              createdAt: "2024-01-02",
            },
          ],
          total: 2,
          averageRating: 4.5,
        },
      };
      (axiosInstance.get as jest.Mock).mockResolvedValue(mockResponse);

      const freelancerId = "freelancer-123";
      const result = await getFreelancerReviews(freelancerId);

      expect(axiosInstance.get).toHaveBeenCalledWith("/reviews/freelancer-123");
      expect(result).toEqual(mockResponse.data);
    });

    test("يتم جلب المراجعات لمستقل بدون مراجعات", async () => {
      const mockResponse = {
        data: {
          reviews: [],
          total: 0,
          averageRating: 0,
        },
      };
      (axiosInstance.get as jest.Mock).mockResolvedValue(mockResponse);

      const freelancerId = "freelancer-123";
      const result = await getFreelancerReviews(freelancerId);

      expect(axiosInstance.get).toHaveBeenCalledWith("/reviews/freelancer-123");
      expect(result).toEqual(mockResponse.data);
      expect(result.reviews).toHaveLength(0);
    });

    test("يتعامل مع أخطاء جلب المراجعات", async () => {
      const error = new Error("فشل في جلب المراجعات");
      (axiosInstance.get as jest.Mock).mockRejectedValue(error);

      const freelancerId = "freelancer-123";

      await expect(getFreelancerReviews(freelancerId)).rejects.toThrow(
        "فشل في جلب المراجعات"
      );
    });

    test("يتعامل مع freelancerId غير موجود", async () => {
      const error = new Error("المستقل غير موجود");
      (axiosInstance.get as jest.Mock).mockRejectedValue(error);

      const freelancerId = "non-existent-freelancer";

      await expect(getFreelancerReviews(freelancerId)).rejects.toThrow(
        "المستقل غير موجود"
      );
    });

    test("يتعامل مع freelancerId فارغ", async () => {
      const error = new Error("معرف المستقل مطلوب");
      (axiosInstance.get as jest.Mock).mockRejectedValue(error);

      const freelancerId = "";

      await expect(getFreelancerReviews(freelancerId)).rejects.toThrow(
        "معرف المستقل مطلوب"
      );
    });
  });

  describe("flagReview", () => {
    test("يتم الإبلاغ عن مراجعة كاذبة بنجاح", async () => {
      const mockResponse = {
        data: {
          id: "review-123",
          flagged: true,
          flaggedAt: "2024-01-01T10:00:00Z",
          message: "تم الإبلاغ عن المراجعة بنجاح",
        },
      };
      (axiosInstance.patch as jest.Mock).mockResolvedValue(mockResponse);

      const reviewId = "review-123";
      const result = await flagReview(reviewId);

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        "/review/review-123/flag"
      );
      expect(result).toEqual(mockResponse.data);
    });

    test("يتعامل مع أخطاء الإبلاغ عن المراجعة", async () => {
      const error = new Error("فشل في الإبلاغ عن المراجعة");
      (axiosInstance.patch as jest.Mock).mockRejectedValue(error);

      const reviewId = "review-123";

      await expect(flagReview(reviewId)).rejects.toThrow(
        "فشل في الإبلاغ عن المراجعة"
      );
    });

    test("يتعامل مع reviewId غير موجود", async () => {
      const error = new Error("المراجعة غير موجودة");
      (axiosInstance.patch as jest.Mock).mockRejectedValue(error);

      const reviewId = "non-existent-review";

      await expect(flagReview(reviewId)).rejects.toThrow("المراجعة غير موجودة");
    });

    test("يتعامل مع reviewId فارغ", async () => {
      const error = new Error("معرف المراجعة مطلوب");
      (axiosInstance.patch as jest.Mock).mockRejectedValue(error);

      const reviewId = "";

      await expect(flagReview(reviewId)).rejects.toThrow("معرف المراجعة مطلوب");
    });

    test("يتعامل مع مراجعة تم الإبلاغ عنها مسبقاً", async () => {
      const error = new Error("تم الإبلاغ عن هذه المراجعة مسبقاً");
      (axiosInstance.patch as jest.Mock).mockRejectedValue(error);

      const reviewId = "already-flagged-review";

      await expect(flagReview(reviewId)).rejects.toThrow(
        "تم الإبلاغ عن هذه المراجعة مسبقاً"
      );
    });
  });

  describe("Integration Tests", () => {
    test("سير العملية الكاملة للمراجعات", async () => {
      const freelancerId = "freelancer-123";
      const reviewData = { rating: 5, comment: "خدمة ممتازة" };

      // Step 1: Submit a review
      const submitResponse = {
        data: {
          id: "review-123",
          rating: 5,
          comment: "خدمة ممتازة",
          freelancerId,
        },
      };
      (axiosInstance.post as jest.Mock).mockResolvedValueOnce(submitResponse);

      const submittedReview = await submitReview(freelancerId, reviewData);
      expect(submittedReview.id).toBe("review-123");

      // Step 2: Get all reviews for the freelancer
      const getReviewsResponse = {
        data: {
          reviews: [submittedReview],
          total: 1,
          averageRating: 5,
        },
      };
      (axiosInstance.get as jest.Mock).mockResolvedValueOnce(
        getReviewsResponse
      );

      const allReviews = await getFreelancerReviews(freelancerId);
      expect(allReviews.reviews).toHaveLength(1);
      expect(allReviews.averageRating).toBe(5);

      // Step 3: Flag the review
      const flagResponse = {
        data: {
          id: "review-123",
          flagged: true,
          flaggedAt: "2024-01-01T10:00:00Z",
        },
      };
      (axiosInstance.patch as jest.Mock).mockResolvedValueOnce(flagResponse);

      const flaggedReview = await flagReview("review-123");
      expect(flaggedReview.flagged).toBe(true);

      // Verify all API calls were made
      expect(axiosInstance.post).toHaveBeenCalledTimes(1);
      expect(axiosInstance.get).toHaveBeenCalledTimes(1);
      expect(axiosInstance.patch).toHaveBeenCalledTimes(1);
    });

    test("يتعامل مع أخطاء متعددة في نفس الجلسة", async () => {
      const freelancerId = "freelancer-123";
      const reviewData = { rating: 5, comment: "خدمة ممتازة" };

      // Mock successful review submission
      const submitResponse = {
        data: {
          id: "review-123",
          rating: 5,
          comment: "خدمة ممتازة",
          freelancerId,
        },
      };
      (axiosInstance.post as jest.Mock).mockResolvedValueOnce(submitResponse);

      await submitReview(freelancerId, reviewData);

      // Mock failed review retrieval
      const error = new Error("فشل في جلب المراجعات");
      (axiosInstance.get as jest.Mock).mockRejectedValueOnce(error);

      await expect(getFreelancerReviews(freelancerId)).rejects.toThrow(
        "فشل في جلب المراجعات"
      );

      // Mock successful flag operation
      const flagResponse = {
        data: {
          id: "review-123",
          flagged: true,
        },
      };
      (axiosInstance.patch as jest.Mock).mockResolvedValueOnce(flagResponse);

      await flagReview("review-123");

      // Verify error handling didn't break subsequent operations
      expect(axiosInstance.post).toHaveBeenCalledTimes(1);
      expect(axiosInstance.get).toHaveBeenCalledTimes(1);
      expect(axiosInstance.patch).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edge Cases", () => {
    test("يتعامل مع استجابة API فارغة", async () => {
      const mockResponse = { data: null };
      (axiosInstance.post as jest.Mock).mockResolvedValue(mockResponse);

      const freelancerId = "freelancer-123";
      const reviewData = { rating: 5, comment: "خدمة ممتازة" };

      const result = await submitReview(freelancerId, reviewData);
      expect(result).toBeNull();
    });

    test("يتعامل مع استجابة API مع data undefined", async () => {
      const mockResponse = { data: undefined };
      (axiosInstance.get as jest.Mock).mockResolvedValue(mockResponse);

      const freelancerId = "freelancer-123";

      const result = await getFreelancerReviews(freelancerId);
      expect(result).toBeUndefined();
    });

    test("يتعامل مع network timeout", async () => {
      const timeoutError = new Error("timeout of 10000ms exceeded");
      (axiosInstance.post as jest.Mock).mockRejectedValue(timeoutError);

      const freelancerId = "freelancer-123";
      const reviewData = { rating: 5, comment: "خدمة ممتازة" };

      await expect(submitReview(freelancerId, reviewData)).rejects.toThrow(
        "timeout of 10000ms exceeded"
      );
    });
  });
});
