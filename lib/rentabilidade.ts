import type { DBCliente, DBHora } from './db/store'

export interface RentabilidadeResult {
    valorContrato: number
    horasMes: number
    custoMes: number
    margemMes: number
    lucrativo: boolean
    percentualMargem: number  // (margem / contrato) * 100
}

export function calcRentabilidade(
    cliente: DBCliente,
    horas: DBHora[],
    valorHora: number,
    anoMes?: string,  // e.g. '2025-02' — defaults to current month
): RentabilidadeResult {
    const mes = anoMes ?? new Date().toISOString().slice(0, 7)
    const clienteHoras = horas.filter(h => h.cliente_id === cliente.id && h.data?.startsWith(mes))
    const horasMes = clienteHoras.reduce((s, h) => s + h.horas, 0)
    const custoMes = horasMes * valorHora
    const valorContrato = cliente.valor_mensal ?? 0
    const margemMes = valorContrato - custoMes
    const lucrativo = margemMes >= 0
    const percentualMargem = valorContrato > 0 ? (margemMes / valorContrato) * 100 : (lucrativo ? 100 : -100)

    return { valorContrato, horasMes, custoMes, margemMes, lucrativo, percentualMargem }
}
