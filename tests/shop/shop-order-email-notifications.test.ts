import { describe, expect, it } from "vitest";
import { ShopOrderStatus } from "@prisma/client";
import {
  shouldSendCustomerConfirmation,
  shouldSendAdminStatusNotification,
  shouldSendAdminTrackingNotification,
} from "@/server/modules/shop/notifications";

describe("shop order email notifications", () => {
  it("sends customer confirmation only when an order first becomes confirmed", () => {
    expect(shouldSendCustomerConfirmation(ShopOrderStatus.PENDING, ShopOrderStatus.CONFIRMED)).toBe(true);
    expect(shouldSendCustomerConfirmation(ShopOrderStatus.CONFIRMED, ShopOrderStatus.CONFIRMED)).toBe(false);
    expect(shouldSendCustomerConfirmation(ShopOrderStatus.CONFIRMED, ShopOrderStatus.PROCESSING)).toBe(false);
  });

  it("sends admin notifications for meaningful status changes only", () => {
    expect(shouldSendAdminStatusNotification(ShopOrderStatus.PENDING, ShopOrderStatus.CONFIRMED)).toBe(true);
    expect(shouldSendAdminStatusNotification(ShopOrderStatus.CONFIRMED, ShopOrderStatus.SHIPPED)).toBe(true);
    expect(shouldSendAdminStatusNotification(ShopOrderStatus.PENDING, ShopOrderStatus.PENDING)).toBe(false);
  });

  it("sends admin tracking notifications when tracking details are added or changed", () => {
    expect(shouldSendAdminTrackingNotification(undefined, undefined, undefined, "https://track.example.com/1")).toBe(true);
    expect(shouldSendAdminTrackingNotification("TRACK1", undefined, "https://track.example.com/1", "https://track.example.com/2")).toBe(true);
    expect(shouldSendAdminTrackingNotification("TRACK1", "TRACK1", "https://track.example.com/1", "https://track.example.com/1")).toBe(false);
  });
});
