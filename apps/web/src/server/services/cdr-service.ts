import { CdrRepository } from "@/server/repositories/cdr-repository";

export class CdrService {
  private readonly cdrRepository = new CdrRepository();

  async summary(payload: { organizationId: string; applicationId?: string; days?: number }) {
    const days = payload.days && payload.days > 0 ? Math.min(payload.days, 90) : 30;
    const fromIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const cdrRows = await this.cdrRepository.listSince({
      organizationId: payload.organizationId,
      fromIso
    });

    const callIds = Array.from(new Set(cdrRows.map((row) => row.call_id)));
    const calls = await this.cdrRepository.listCallsByIds({
      organizationId: payload.organizationId,
      callIds
    });
    const callMap = new Map(calls.map((call) => [call.id, call]));

    const filteredRows = payload.applicationId
      ? cdrRows.filter((row) => callMap.get(row.call_id)?.application_id === payload.applicationId)
      : cdrRows;

    const totalBillableSeconds = filteredRows.reduce((sum, row) => sum + Number(row.billable_seconds ?? 0), 0);
    const totalAmountUsd = filteredRows.reduce((sum, row) => sum + Number(row.billed_amount_usd ?? 0), 0);
    const successCount = filteredRows.filter((row) => {
      const code = Number(row.sip_response_code ?? 0);
      return code >= 200 && code < 300;
    }).length;

    const dailyMap = new Map<string, { calls: number; billable_seconds: number; amount_usd: number }>();
    const sipCodeMap = new Map<string, number>();

    for (const row of filteredRows) {
      const day = String(row.created_at).slice(0, 10);
      const current = dailyMap.get(day) ?? { calls: 0, billable_seconds: 0, amount_usd: 0 };
      current.calls += 1;
      current.billable_seconds += Number(row.billable_seconds ?? 0);
      current.amount_usd += Number(row.billed_amount_usd ?? 0);
      dailyMap.set(day, current);

      const codeKey = String(row.sip_response_code ?? "unknown");
      sipCodeMap.set(codeKey, (sipCodeMap.get(codeKey) ?? 0) + 1);
    }

    const daily = Array.from(dailyMap.entries())
      .map(([day, totals]) => ({ day, ...totals }))
      .sort((a, b) => (a.day < b.day ? 1 : -1));

    const topSipCodes = Array.from(sipCodeMap.entries())
      .map(([code, count]) => ({ sip_code: code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const records = filteredRows.slice(0, 50).map((row) => ({
      id: row.id,
      call_id: row.call_id,
      sip_response_code: row.sip_response_code,
      billable_seconds: row.billable_seconds,
      billed_amount_usd: Number(row.billed_amount_usd ?? 0),
      created_at: row.created_at,
      call: callMap.get(row.call_id) ?? null
    }));

    return {
      window_days: days,
      total_calls: filteredRows.length,
      total_billable_seconds: totalBillableSeconds,
      total_amount_usd: Number(totalAmountUsd.toFixed(4)),
      average_billable_seconds: filteredRows.length ? Number((totalBillableSeconds / filteredRows.length).toFixed(2)) : 0,
      success_rate: filteredRows.length ? Number(((successCount / filteredRows.length) * 100).toFixed(2)) : 0,
      top_sip_codes: topSipCodes,
      daily,
      records
    };
  }
}
