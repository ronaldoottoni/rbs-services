import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FinanceiroStatus } from "@prisma/client";
import { homedir } from "os";

//Listar um resumo Financeiro, Contas Pagar e Contas Receber
export async function GET(request: Request) {
    try {
        /* const { searchParams } = new URL(request.url); */

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const resumoReceber = await prisma.contaReceber.aggregate({
            where: {
                ativo: true,
                status: {
                    not: FinanceiroStatus.CANCELADO,
                },
            },
            _sum: {
                valorAberto: true,
                valorRecebido: true,
            }
        });

        const resumoReceberVencidas = await prisma.contaReceber.aggregate({
            where: {
                ativo: true,
                status: {
                    not: FinanceiroStatus.CANCELADO,
                },
                valorAberto: {
                    gt: 0
                },
                dataVencimento: {
                    lt: hoje
                },
            },
            _sum: {
                valorAberto: true,
            },
            _count: {
                id: true,
            }
        });

        const totalReceber = Number(resumoReceber._sum.valorAberto || 0);
        const totalRecebido = Number(resumoReceber._sum.valorRecebido || 0);
        const totalReceberVencidas = Number(resumoReceberVencidas._sum.valorAberto || 0);
        const qtdeReceberVencidas = Number(resumoReceberVencidas._count.id);

        const resumoPagar = await prisma.contaPagar.aggregate({
            where: {
                ativo: true,
                status: {
                    not: FinanceiroStatus.CANCELADO,
                },
            },
            _sum: {
                valorAberto: true,
                valorPago: true,
            }
        })

        const resumoPagarVencidas = await prisma.contaPagar.aggregate({
            where: {
                ativo: true,
                status: {
                    not: FinanceiroStatus.CANCELADO,
                },
                valorAberto: {
                    gt: 0
                },
                dataVencimento: {
                    lt: hoje
                },
            },
            _sum: {
                valorAberto: true,
            },
            _count: {
                id: true,
            }

        });

        const totalPagar = Number(resumoPagar._sum.valorAberto || 0);
        const totalPago = Number(resumoPagar._sum.valorPago || 0);
        const totalPagarVencidas = Number(resumoPagarVencidas._sum.valorAberto || 0);
        const qtdePagarVencidas = Number(resumoPagarVencidas._count.id);

        const saldoPrevisto = totalReceber - totalPagar;
        const saldoRealizado = totalRecebido - totalPago;

        return NextResponse.json(
            {
                totalReceber,
                totalRecebido,
                totalReceberVencidas,
                totalPagar,
                totalPago,
                totalPagarVencidas,
                saldoPrevisto,
                saldoRealizado
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao listar Resumo Financeiro!" },
            { status: 500 }
        )
    }

}