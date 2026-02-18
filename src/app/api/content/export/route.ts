import { NextRequest, NextResponse } from "next/server";
import { contentExportFilterSchema } from "@/server/schema";
import { listExportableContent } from "@/server/modules/contentFactory/service";

const monthToRange = (month: string) => {
  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const mon = Number(monthStr) - 1;
  const from = new Date(Date.UTC(year, mon, 1, 0, 0, 0));
  const to = new Date(Date.UTC(year, mon + 1, 0, 23, 59, 59));
  return { from, to };
};

const csvEscape = (value: unknown) => {
  const str = value == null ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replaceAll('"', '""')}"`;
  }
  return str;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const payload = {
      planId: searchParams.get("planId") ?? undefined,
      statuses: searchParams.getAll("status") ?? undefined,
      channels: searchParams.getAll("channel") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
    };

    const month = searchParams.get("month") ?? undefined;
    const format = (searchParams.get("format") ?? "json").toLowerCase();

    const monthRange = month && /^\d{4}-\d{2}$/.test(month) ? monthToRange(month) : null;

    const filters = contentExportFilterSchema.parse({
      ...payload,
      from: payload.from
        ? new Date(payload.from)
        : monthRange
          ? monthRange.from
          : undefined,
      to: payload.to
        ? new Date(payload.to)
        : monthRange
          ? monthRange.to
          : undefined,
    });

    const slots = await listExportableContent(filters);

    if (format === "csv") {
      const rows: string[] = [];
      rows.push(
        [
          "slotId",
          "plan",
          "status",
          "channel",
          "scheduledFor",
          "publishedAt",
          "persona",
          "campaign",
          "assetType",
          "variantPlatform",
          "variantStatus",
          "headline",
          "copy",
          "cta",
          "hashtags",
          "mediaUrl",
        ].join(",")
      );

      for (const slot of slots) {
        const scheduledFor = slot.scheduledFor?.toISOString() ?? "";
        const publishedAt = slot.publishedAt?.toISOString() ?? "";

        if (!slot.assets.length) {
          rows.push(
            [
              slot.id,
              slot.plan?.name ?? "",
              slot.status,
              slot.channel,
              scheduledFor,
              publishedAt,
              slot.persona ?? "",
              slot.campaign ?? "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
            ]
              .map(csvEscape)
              .join(",")
          );
          continue;
        }

        for (const asset of slot.assets) {
          if (!asset.variants.length) {
            rows.push(
              [
                slot.id,
                slot.plan?.name ?? "",
                slot.status,
                slot.channel,
                scheduledFor,
                publishedAt,
                slot.persona ?? "",
                slot.campaign ?? "",
                asset.type,
                "",
                "",
                asset.title ?? "",
                asset.summary ?? "",
                "",
                "",
                "",
                asset.mediaUrl ?? "",
              ]
                .map(csvEscape)
                .join(",")
            );
            continue;
          }

          for (const variant of asset.variants) {
            rows.push(
              [
                slot.id,
                slot.plan?.name ?? "",
                slot.status,
                slot.channel,
                scheduledFor,
                publishedAt,
                slot.persona ?? "",
                slot.campaign ?? "",
                asset.type,
                variant.platform,
                variant.status,
                variant.headline ?? "",
                variant.copy ?? "",
                variant.cta ?? "",
                variant.hashtags ?? "",
                variant.mediaUrl ?? asset.mediaUrl ?? "",
              ]
                .map(csvEscape)
                .join(",")
            );
          }
        }
      }

      return new NextResponse(rows.join("\n"), {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="content-export-${month ?? "all"}.csv"`,
        },
      });
    }

    return NextResponse.json({
      slots: slots.map((slot) => ({
        id: slot.id,
        status: slot.status,
        channel: slot.channel,
        scheduledFor: slot.scheduledFor?.toISOString() ?? null,
        publishedAt: slot.publishedAt?.toISOString() ?? null,
        plan: slot.plan?.name,
        persona: slot.persona,
        campaign: slot.campaign,
        assets: slot.assets.map((asset) => ({
          id: asset.id,
          type: asset.type,
          mediaUrl: asset.mediaUrl,
          title: asset.title,
          summary: asset.summary,
          variants: asset.variants.map((variant) => ({
            id: variant.id,
            platform: variant.platform,
            status: variant.status,
            headline: variant.headline,
            copy: variant.copy,
            cta: variant.cta,
            hashtags: variant.hashtags,
          })),
        })),
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to export content",
      },
      { status: 400 }
    );
  }
}

