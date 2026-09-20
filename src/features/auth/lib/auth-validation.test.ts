import { describe, expect, it } from "bun:test";
import {
  loginSchema,
  registerSchema,
  resendVerificationSchema,
} from "../schemas";

describe("Auth Schemas & Validation", () => {
  describe("loginSchema", () => {
    it("validates valid email and password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "secretpassword123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = loginSchema.safeParse({
        email: "not-an-email",
        password: "secretpassword123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toBeDefined();
      }
    });

    it("rejects empty password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("validates matching passwords with at least 8 characters", () => {
      const result = registerSchema.safeParse({
        email: "test@domain.com",
        password: "securepassword",
        confirmPassword: "securepassword",
      });
      expect(result.success).toBe(true);
    });

    it("rejects password shorter than 8 characters", () => {
      const result = registerSchema.safeParse({
        email: "test@domain.com",
        password: "short",
        confirmPassword: "short",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toBeDefined();
      }
    });

    it("rejects mismatched passwords", () => {
      const result = registerSchema.safeParse({
        email: "test@domain.com",
        password: "securepassword1",
        confirmPassword: "securepassword2",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.confirmPassword).toBeDefined();
      }
    });
  });

  describe("resendVerificationSchema", () => {
    it("validates valid email address", () => {
      const result = resendVerificationSchema.safeParse({
        email: "hello@world.com",
      });
      expect(result.success).toBe(true);
    });

    it("rejects malformed email address", () => {
      const result = resendVerificationSchema.safeParse({
        email: "hello-world",
      });
      expect(result.success).toBe(false);
    });
  });
});
