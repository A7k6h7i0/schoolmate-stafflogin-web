import { apiClient } from './client'
import { unwrapData, unwrapList } from './helpers'
import type { FeeStructure, FeeInvoice, DailyCashLedger } from '@/types/entities'
import {
  buildCreateFeeStructurePayload,
  buildGenerateYearlyLedgerPayload,
  type CreateFeeStructureForm,
} from '@/lib/finance-form'
import { extractPopulatedRef } from '@/lib/api/normalize'
import { useAuthStore } from '@/stores/auth-store'

function normalizeFeeStructure(raw: Record<string, unknown>): FeeStructure {
  const id = raw.id ?? raw._id ?? raw.structureId
  const classRef = extractPopulatedRef(raw, ['class', 'classId', 'classLevel'])
  const classNameFromField =
    typeof raw.className === 'string'
      ? raw.className
      : raw.className && typeof raw.className === 'object'
        ? String(
            (raw.className as Record<string, unknown>).className ??
              (raw.className as Record<string, unknown>).name ??
              '',
          )
        : undefined

  const feeInterval = String(
    raw.feeInterval ?? raw.interval ?? raw.paymentInterval ?? raw.frequency ?? '',
  )

  return {
    id: id != null ? String(id) : '',
    classId: classRef.id,
    className: classRef.label || classNameFromField || undefined,
    baseFeeAmount: Number(raw.baseFeeAmount ?? raw.amount ?? 0),
    feeInterval,
    academicYear: raw.academicYear != null ? String(raw.academicYear) : undefined,
  }
}

export function formatFeeStructureClass(
  structure: FeeStructure,
  classNamesById?: Map<string, string>,
): string {
  if (structure.className && structure.className !== '[object Object]') {
    return structure.className
  }
  if (structure.classId && classNamesById?.get(structure.classId)) {
    return classNamesById.get(structure.classId)!
  }
  return structure.classId ?? '—'
}

export async function listFeeStructures() {
  const { data } = await apiClient.get('/fees/structures')
  const items = unwrapList<Record<string, unknown>>(data).items
  return items.map(normalizeFeeStructure).filter((structure) => structure.id)
}

export async function createFeeStructure(form: CreateFeeStructureForm) {
  const payload = buildCreateFeeStructurePayload(form)
  if (import.meta.env.DEV) {
    console.info('[finance] POST /fees/structures', JSON.stringify(payload))
  }
  const { data } = await apiClient.post('/fees/structures', payload)
  return unwrapData(data)
}

export async function generateYearlyLedger(academicYear: string) {
  const payload = buildGenerateYearlyLedgerPayload(academicYear)
  if (import.meta.env.DEV) {
    console.info('[finance] POST /fees/generate-yearly', JSON.stringify(payload))
  }
  const { data } = await apiClient.post('/fees/generate-yearly', payload)
  return unwrapData(data)
}

export async function getStudentFees(studentId: string) {
  const { data } = await apiClient.get(`/fees/student/${studentId}`)
  return unwrapData(data)
}

export async function applyDiscount(studentId: string, payload: Record<string, unknown>) {
  const { data } = await apiClient.post(`/fees/student/${studentId}/discount`, payload)
  return unwrapData(data)
}

export function buildCollectCashPaymentPayload(amount: number, remarks?: string) {
  const receivedBy = useAuthStore.getState().user?.id
  const payload: Record<string, unknown> = {
    amount,
    amountPaid: amount,
    paymentMethod: 'CASH',
  }
  if (receivedBy) payload.receivedBy = receivedBy
  if (remarks?.trim()) payload.remarks = remarks.trim()
  return payload
}

export async function collectCashPayment(
  studentId: string,
  payload: { amount: number; paymentMethod?: string; remarks?: string },
) {
  const body = buildCollectCashPaymentPayload(payload.amount, payload.remarks)
  const { data } = await apiClient.post(`/fees/student/${studentId}/pay-cash`, body)
  return unwrapData(data)
}

export async function listInvoices(params?: { page?: number; limit?: number }) {
  const { data } = await apiClient.get('/fees/invoices', { params })
  return unwrapList<FeeInvoice>(data)
}

export async function getInvoice(id: string) {
  const { data } = await apiClient.get(`/fees/invoices/${id}`)
  return unwrapData<FeeInvoice>(data)
}

export async function getDailyCashLedger(params?: { date?: string }) {
  const { data } = await apiClient.get('/fees/reports/daily-cash-ledger', { params })
  return unwrapData<DailyCashLedger>(data)
}
