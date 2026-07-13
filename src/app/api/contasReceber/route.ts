import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FinanceiroStatus } from "@prisma/client";

//Listar Todo o Contas a Receber
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const clienteId = searchParams.get("clienteId");
        const status = searchParams.get("status") as FinanceiroStatus | null;

        const projetoId = searchParams.get("projetoId");
        const vencimentoIni = searchParams.get("vencimentoIni");
        const vencimentoFin = searchParams.get("vencimentoFin");
        const flagCancelados = searchParams.get("flagCancelados");

        const contasReceber = await prisma.contaReceber.findMany({
            where: {
                ativo: true,

                ...(clienteId && { clienteId }),
                ...(status
                    ? { status }
                    : flagCancelados !== "true"
                        ? { status: { not: "CANCELADO" } }
                        : {}),

                ...(projetoId && { projetoId }),
                ...(flagCancelados !== "true" && {
                    status: {
                        not: "CANCELADO"
                    }
                }),

                ...(vencimentoIni || vencimentoFin
                    ? {
                        dataVencimento: {
                            ...(vencimentoIni && {
                                gte: new Date(vencimentoIni),
                            }),
                            ...(vencimentoFin && {
                                lte: new Date(vencimentoFin),
                            }),
                        },
                    }
                    : {}),
            },
            orderBy: {
                dataVencimento: "asc"
            },
            include: {
                cliente: true,
                projeto: true,
                servicoExecutado: true,
                recebimento: true,
            }
        });

        return NextResponse.json(contasReceber);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao localizar o Contas a Receber!" },
            { status: 500 }
        )
    }
}

//Criar um Contas a Receber
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const contaReceber = await prisma.contaReceber.create({
            data: {
                clienteId: body.clienteId,
                projetoId: body.projetoId || null,
                servicoExecutadoId: body.servicoExecutadoId || null,
                numeroDocumento: body.numeroDocumento || null,
                descricao: body.descricao,
                competencia: body.competencia || null,
                dataEmissao: body.dataEmissao,
                dataVencimento: body.dataVencimento,
                valorOriginal: body.valorOriginal,
                valorRecebido: 0,
                valorAberto:
                    Number(body.valorOriginal || 0) +
                    Number(body.valorJuros || 0) +
                    Number(body.valorMulta || 0) -
                    Number(body.valorDesconto || 0),
                status: "ABERTO",
                formaPagamento: body.formaPagamento || null,
                observacoes: body.observacoes || null,
            }
        });

        return NextResponse.json(contaReceber, { status: 201 });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao criar o Contas a Receber! " },
            { status: 500 }
        )
    }
}