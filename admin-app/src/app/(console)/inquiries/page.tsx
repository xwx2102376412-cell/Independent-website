import { updateInquiryStatus } from "@/app/actions";
import { Notice, PageHeader, StatusBadge } from "@/components/admin-ui";
import { SubmitButton } from "@/components/submit-button";
import { prisma } from "@/lib/prisma";

const statusOptions = [["NEW", "新询盘"], ["CONTACTED", "已联系"], ["QUALIFIED", "已确认意向"], ["QUOTED", "已报价"], ["NEGOTIATING", "洽谈中"], ["WON", "已成交"], ["LOST", "已流失"]] as const;
const typeLabels: Record<string, string> = { DEALER: "经销商", WHOLESALE: "批发", CONTACT: "普通联系" };

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<{ message?: string; error?: string }> }) {
  const feedback = await searchParams;
  const inquiries = await prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return <><PageHeader title="询盘" description="跟进经销商、批发和普通联系线索。每次状态变更都会写入审计日志。" /><Notice message={feedback.message} error={feedback.error} /><div className="inquiry-grid">{inquiries.map((inquiry) => <article className="panel" key={inquiry.id}><div className="inquiry-header"><div><strong>{inquiry.contactName}</strong><span>{inquiry.companyName || typeLabels[inquiry.type]} · {inquiry.country}</span></div><StatusBadge tone={inquiry.status === "WON" ? "success" : inquiry.status === "LOST" ? "danger" : "info"}>{statusOptions.find(([value]) => value === inquiry.status)?.[1]}</StatusBadge></div><dl className="inquiry-meta"><div><dt>邮箱</dt><dd><a href={`mailto:${inquiry.email}`}>{inquiry.email}</a></dd></div>{inquiry.phone && <div><dt>电话</dt><dd>{inquiry.phone}</dd></div>}<div><dt>提交时间</dt><dd>{inquiry.createdAt.toLocaleString("zh-CN")}</dd></div></dl><p className="inquiry-message">{inquiry.message}</p><form action={updateInquiryStatus} className="inline-form"><input type="hidden" name="id" value={inquiry.id} /><input type="hidden" name="returnTo" value="/inquiries" /><label className="field"><span>跟进状态</span><select name="status" defaultValue={inquiry.status}>{statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><SubmitButton className="secondary-button">保存状态</SubmitButton></form></article>)}</div></>;
}
